import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { IndianRupee, Save } from 'lucide-react';

export function SettingsTab() {
    const [costPerPatient, setCostPerPatient] = useState('1');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                const data = await res.json();
                if (data.cost_per_patient) {
                    setCostPerPatient(data.cost_per_patient);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cost_per_patient: costPerPatient })
            });

            if (res.ok) {
                toast.success('Subscription plan updated');
            } else {
                toast.error('Failed to update plan');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error saving settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-4">Loading settings...</div>;

    return (
        <div className="space-y-6 max-w-2xl animate-fade-in-up">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">System Settings</h2>
                <p className="text-slate-500">Manage global configurations for the application.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IndianRupee className="w-5 h-5 text-green-600" />
                        Subscription Plan
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Cost Per Patient (₹)
                        </label>
                        <p className="text-xs text-slate-500 mb-2">
                            This amount will be added to the clinic&apos;s bill for every patient served (unless trial active).
                        </p>
                        <div className="flex gap-4">
                            <input
                                type="number"
                                step="0.01"
                                value={costPerPatient}
                                onChange={(e) => setCostPerPatient(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                            <Button onClick={handleSave} disabled={isSaving} className="bg-teal-600 hover:bg-teal-700 text-white min-w-[100px]">
                                {isSaving ? 'Saving...' : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
