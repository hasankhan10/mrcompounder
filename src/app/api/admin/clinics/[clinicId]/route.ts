import { createServerSupabaseClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UpdateClinicRequest } from '@/lib/types';

/**
 * PATCH /api/admin/clinics/{clinicId}
 * @summary Update a clinic's balance or status
 */
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ clinicId: string }> }
) {
  const params = await props.params;
  const supabase = await createServerSupabaseClient();
  const { clinicId } = params;

  // 1. Auth Check (User Context)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // Check profile using Admin client to ensure we can read profiles even if RLS is strict
  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();

  if (!profile || profile.role !== 'super_admin') {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const body: UpdateClinicRequest = await request.json();

  try {
    // 2. Handle Status Update (Admin Context)
    if (typeof body.isActive === 'boolean') {
      const { data: updatedClinic, error } = await supabaseAdmin
        .from('clinics')
        .update({ is_active: body.isActive })
        .eq('id', clinicId)
        .select()
        .single();

      if (error) {
        console.error('Supabase Update Error:', error);
        throw error;
      }
      return NextResponse.json(updatedClinic);
    }

    // 3. Handle Pay Bill (Balance Update) (Admin Context)
    if (body.topupAmount) {
      // Fetch current due
      const { data: clinic, error: fetchError } = await supabaseAdmin
        .from('clinics')
        .select('current_due')
        .eq('id', clinicId)
        .single();

      if (fetchError || !clinic) throw new Error('Clinic not found');

      const newDue = (clinic.current_due || 0) - body.topupAmount;

      // Update due
      const { data: updatedClinic, error: updateError } = await supabaseAdmin
        .from('clinics')
        .update({ current_due: newDue })
        .eq('id', clinicId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Create Transaction Record
      const { error: txError } = await supabaseAdmin
        .from('transactions')
        .insert({
          clinic_id: clinicId,
          type: 'topup',
          amount: body.topupAmount,
          balance_before: clinic.current_due || 0,
          balance_after: newDue,
          metadata: { created_by: user.id }
        });

      if (txError) console.error('Failed to create transaction record:', txError);

      return NextResponse.json(updatedClinic);
    }

    // 4. Handle Trial Period Update (Admin Context)
    // We check if keys exist in body, even if value is null
    if ('trialStartDate' in body || 'trialEndDate' in body) {
      const updateData: Record<string, string | null> = {};
      if ('trialStartDate' in body) updateData.trial_start_date = body.trialStartDate || null;
      if ('trialEndDate' in body) updateData.trial_end_date = body.trialEndDate || null;

      const { data: updatedClinic, error } = await supabaseAdmin
        .from('clinics')
        .update(updateData)
        .eq('id', clinicId)
        .select()
        .single();

      if (error) {
        console.error('Supabase Update Error:', error);
        throw error;
      }
      return NextResponse.json(updatedClinic);
    }

    // 5. Handle General Info Update (Name, Slug, Logo, Location, Contact Number) & Password
    if (body.name || body.slug || body.logoUrl || body.location || body.contactNumber || body.password) {
      const updateData: Record<string, string> = {};
      if (body.name) updateData.name = body.name;
      if (body.slug) updateData.slug = body.slug;
      if (body.logoUrl) updateData.logo_url = body.logoUrl;
      if (body.location) updateData.location = body.location;
      if (body.contactNumber) updateData.contact_number = body.contactNumber; // Added contact_number

      // Update Clinic Table
      if (Object.keys(updateData).length > 0) {
        const { error } = await supabaseAdmin
          .from('clinics')
          .update(updateData)
          .eq('id', clinicId);

        if (error) throw error;
      }

      // Update Password (if provided)
      if (body.password) {
        // Find the compounder user associated with this clinic
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('clinic_id', clinicId)
          .eq('role', 'compounder')
          .single();

        if (profileError || !profile) {
          throw new Error('Could not find compounder user for this clinic to update password');
        }

        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
          profile.id,
          { password: body.password }
        );

        if (authError) throw authError;
      }

      // Return updated clinic
      const { data: finalClinic } = await supabaseAdmin
        .from('clinics')
        .select()
        .eq('id', clinicId)
        .single();

      return NextResponse.json(finalClinic);
    }

    return new NextResponse(JSON.stringify({ error: 'No valid update fields provided' }), { status: 400 });

  } catch (error: unknown) {
    console.error('Error updating clinic:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return new NextResponse(JSON.stringify({ error: message }), { status: 500 });
  }
}

/**
 * DELETE /api/admin/clinics/{clinicId}
 * @summary Delete a clinic and its associated user
 */
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ clinicId: string }> }
) {
  const params = await props.params;
  const supabase = await createServerSupabaseClient();
  const { clinicId } = params;

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'super_admin') {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  try {
    // 2. Find associated compounder user
    const { data: clinicProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clinic_id', clinicId)
      .eq('role', 'compounder')
      .single();

    // 3. Delete Auth User (if exists)
    if (clinicProfile) {
      const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(clinicProfile.id);
      if (deleteUserError) {
        console.error('Error deleting auth user:', deleteUserError);
        // Continue to delete clinic even if auth delete fails (or maybe throw? usually better to clean up what we can)
      }
    }

    // 4. Delete Clinic (Cascades should handle related data like queues/tokens, but we explicitly delete clinic row)
    const { error: deleteClinicError } = await supabaseAdmin
      .from('clinics')
      .delete()
      .eq('id', clinicId);

    if (deleteClinicError) throw deleteClinicError;

    return NextResponse.json({ message: 'Clinic deleted successfully' });

  } catch (error: unknown) {
    console.error('Error deleting clinic:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return new NextResponse(JSON.stringify({ error: message }), { status: 500 });
  }
}
