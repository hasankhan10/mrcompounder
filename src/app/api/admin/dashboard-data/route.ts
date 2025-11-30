// src/app/api/admin/dashboard-data/route.ts
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (!profile || profile.role !== 'super_admin') {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  // Fetch all data needed for the admin dashboard
  // We use Promise.all to fetch independent data in parallel
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayISO = todayStart.toISOString();

  // Calculate Last Month's Date Range
  const now = new Date();
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  lastDayLastMonth.setHours(23, 59, 59, 999);

  const firstDayLastMonthISO = firstDayLastMonth.toISOString();
  const lastDayLastMonthISO = lastDayLastMonth.toISOString();


  const [
    { data: clinics, error: clinicsError },
    { count: patientsToday, error: patientsError },
    { count: totalServed, error: revenueError },
    { count: lastMonthServed, error: lastMonthError }
  ] = await Promise.all([
    supabase
      .from('clinics')
      .select('*')
      .order('name', { ascending: true }),
    supabase
      .from('tokens')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'served')
      .gte('served_at', todayISO),
    supabase
      .from('tokens')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'served'),
    supabase
      .from('tokens')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'served')
      .gte('served_at', firstDayLastMonthISO)
      .lte('served_at', lastDayLastMonthISO)
  ]);

  if (clinicsError) {
    return new NextResponse(JSON.stringify({ error: clinicsError.message }), { status: 500 });
  }
  if (patientsError) console.error('Error fetching patients count:', patientsError);
  if (revenueError) console.error('Error fetching revenue count:', revenueError);
  if (lastMonthError) console.error('Error fetching last month revenue:', lastMonthError);

  const totalClinics = clinics?.length || 0;
  const totalPatientsToday = patientsToday || 0;
  const totalRevenue = (totalServed || 0) * 1; // Assuming ₹1 per served patient
  const lastMonthRevenue = (lastMonthServed || 0) * 1;

  const responseData = {
    totalClinics,
    totalPatientsToday,
    totalRevenue,
    lastMonthRevenue,
    clinics: clinics || [],
  };

  return NextResponse.json(responseData);
}
