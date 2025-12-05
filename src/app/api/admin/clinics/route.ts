import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { CreateClinicRequest } from '@/lib/types';
import { requireSuperAdmin } from '@/lib/auth-utils';

/**
 * GET /api/admin/clinics
 * @summary List all clinics
 * @tags Admin
 * @return {ListClinicsResponse} 200 - Success response
 */
export async function GET() {
  // Check Auth
  const { error: authError } = await requireSuperAdmin();
  if (authError) return authError;

  // Fetch Clinics
  const { data: clinics, error } = await supabaseAdmin
    .from('clinics')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return NextResponse.json({ clinics });
}

/**
 * POST /api/admin/clinics
 * @summary Create a new clinic
 * @tags Admin
 * @param {CreateClinicRequest} request.body.required - The clinic creation data
 * @return {object} 201 - Created response
 * @return {object} 400 - Bad request
 */
export async function POST(request: NextRequest) {
  // 1. Check Authentication & Authorization
  const { error: authError } = await requireSuperAdmin();
  if (authError) return authError;


  try {
    const body: CreateClinicRequest = await request.json();
    const { name, slug, compounderEmail, compounderPassword, logoUrl, location, contactNumber } = body;

    // Validate required fields
    if (!name || !slug || !compounderEmail || !compounderPassword) {
      return new NextResponse(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // 2. Create the Compounder User (Auth)
    // We use supabaseAdmin because we are creating a user programmatically
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: compounderEmail,
      password: compounderPassword,
      email_confirm: true, // Auto-confirm email since admin created it
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return new NextResponse(JSON.stringify({ error: `Failed to create user: ${authError.message}` }), { status: 400 });
    }

    const newUserId = authData.user.id;

    // 3. Create the Clinic
    // We use supabaseAdmin to bypass RLS for simplicity in this admin route, 
    // ensuring the write happens even if RLS policies are strict.
    const { data: clinicData, error: clinicError } = await supabaseAdmin
      .from('clinics')
      .insert({
        name,
        slug,
        location: location || null,
        contact_number: contactNumber || null, // Added contact_number
        current_due: 0,
        logo_url: logoUrl || null,
        is_active: true,
      })
      .select()
      .single();

    if (clinicError) {
      console.error('Error creating clinic:', clinicError);
      // Rollback: Delete the auth user we just created
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return new NextResponse(JSON.stringify({ error: `Failed to create clinic: ${clinicError.message}` }), { status: 400 });
    }

    const newClinic = clinicData;

    // 4. Create the Profile for the Compounder
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUserId,
        clinic_id: newClinic.id,
        role: 'compounder',
        full_name: `${name} Staff`,
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Rollback: Delete clinic and user
      await supabaseAdmin.from('clinics').delete().eq('id', newClinic.id);
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return new NextResponse(JSON.stringify({ error: `Failed to create profile: ${profileError.message}` }), { status: 500 });
    }

    return NextResponse.json({
      message: 'Clinic created successfully',
      clinic: newClinic,
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return new NextResponse(JSON.stringify({ error: message }), { status: 500 });
  }
}
