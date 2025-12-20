
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
    try {
        const { email, userId } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Fetch Doctor Name if userId provided
        let doctorName = 'Doctor';
        if (userId) {
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('full_name')
                .eq('id', userId)
                .single();
            if (profile?.full_name) {
                doctorName = profile.full_name;
            }
        }

        // 1. Find clinics owned by this email
        const { data: clinics, error } = await supabaseAdmin
            .from('clinics')
            .select('*')
            .eq('owner_email', email)
            .eq('is_active', true);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!clinics || clinics.length === 0) {
            return NextResponse.json({ error: 'No clinics found for this email' }, { status: 404 });
        }

        // 2. Fetch live stats for each clinic
        const enrichedClinics = await Promise.all(clinics.map(async (clinic) => {
            const today = new Date().toISOString().split('T')[0];

            // 2.1 Fetch active locations
            const { data: locations } = await supabaseAdmin
                .from('clinic_locations')
                .select('id, name')
                .eq('clinic_id', clinic.id)
                .eq('is_active', true);

            // 2.2 Get counts per location (parallelize if possible, but sequential for simplicity helps here)
            const locationStats = [];
            let totalWaiting = 0;

            if (locations && locations.length > 0) {
                for (const loc of locations) {
                    const { count } = await supabaseAdmin
                        .from('tokens')
                        .select('*', { count: 'exact', head: true })
                        .eq('clinic_id', clinic.id)
                        .eq('location_id', loc.id)
                        .eq('status', 'waiting')
                        .gte('created_at', today);

                    const c = count || 0;
                    totalWaiting += c;
                    locationStats.push({ id: loc.id, name: loc.name, count: c });
                }
            }

            // 2.3 Get General Queue (no location specific)
            // Note: If locations exist, tokens SHOULD represent locations, but legacy ones might not.
            // If NO locations exist, all tokens are general.
            let generalCount = 0;
            if (!locations || locations.length === 0) {
                const { count } = await supabaseAdmin
                    .from('tokens')
                    .select('*', { count: 'exact', head: true })
                    .eq('clinic_id', clinic.id)
                    .eq('status', 'waiting')
                    .gte('created_at', today);
                generalCount = count || 0;
                totalWaiting += generalCount;
            } else {
                // Even if locations exist, check for unassigned ones (optional safety)
                const { count } = await supabaseAdmin
                    .from('tokens')
                    .select('*', { count: 'exact', head: true })
                    .eq('clinic_id', clinic.id)
                    .is('location_id', null)
                    .eq('status', 'waiting')
                    .gte('created_at', today);
                generalCount = count || 0;
                totalWaiting += generalCount;
            }

            if (generalCount > 0) {
                locationStats.push({ id: 'general', name: 'General Queue', count: generalCount });
            }

            return {
                ...clinic,
                waiting_count: totalWaiting,
                location_stats: locationStats
            };
        }));

        return NextResponse.json({ clinics: enrichedClinics, doctorName });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

