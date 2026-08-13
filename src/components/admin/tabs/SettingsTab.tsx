import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, ShieldCheck } from 'lucide-react';

export function SettingsTab() {
    return (
        <div className="space-y-6 max-w-2xl animate-fade-in-up">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">System Settings</h2>
                <p className="text-slate-500">Manage global configurations and preferences for the application.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                        <Building2 className="w-5 h-5 text-teal-600" />
                        Per-Clinic Custom Pricing
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Global flat subscription pricing has been removed. Pricing is now configured on a per-clinic basis.
                    </p>
                    <div className="p-4 bg-teal-50 border border-teal-100 rounded-lg flex items-start gap-3 text-teal-800 text-sm">
                        <ShieldCheck className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                        <div>
                            <span className="font-semibold">Clinic Pricing Management:</span> To set or edit a clinic&apos;s per-patient rate, navigate to the <strong>Clinics</strong> tab and create or edit the clinic.
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
