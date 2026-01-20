import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ClinicLocation } from '@/lib/types';
import { createClient } from '@/lib/supabase-client';

interface LocationsTabProps {
    clinicId: string;
}

export function LocationsTab({ clinicId }: LocationsTabProps) {
    const [locations, setLocations] = useState<ClinicLocation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newLocationName, setNewLocationName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [supabase] = useState(() => createClient());

    const fetchLocations = async () => {
        try {
            const { data, error } = await supabase
                .from('clinic_locations')
                .select('*')
                .eq('clinic_id', clinicId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setLocations(data || []);
        } catch (error) {
            console.error('Error fetching locations:', error);
            toast.error('Failed to load locations');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (clinicId) {
            fetchLocations();
        }
    }, [clinicId]);

    const handleAddLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLocationName.trim()) return;

        setIsSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('clinic_locations')
                .insert({
                    clinic_id: clinicId,
                    name: newLocationName.trim()
                })
                .select()
                .single();

            if (error) throw error;

            setLocations([...locations, data]);
            setNewLocationName('');
            toast.success('Location added successfully');
        } catch (error: any) {
            console.error('Error adding location:', error);
            toast.error(error.message || 'Failed to add location');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteLocation = async (id: string) => {
        if (!confirm('Are you sure you want to permanently delete this location? All tokens associated with this location will also be affected.')) return;

        try {
            const { error } = await supabase
                .from('clinic_locations')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setLocations(locations.filter(loc => loc.id !== id));
            toast.success('Location permanently deleted');
        } catch (error) {
            console.error('Error removing location:', error);
            toast.error('Failed to remove location');
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading locations...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Clinic Locations</h2>
                <p className="text-slate-500">Manage separate rooms or areas for patient booking (e.g. Room 1, Therapy Hall).</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Location Form */}
                <Card className="border-none shadow-md h-fit">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-teal-100 rounded-lg">
                                <Plus className="w-5 h-5 text-teal-700" />
                            </div>
                            <CardTitle className="text-lg font-bold text-slate-800">Add New Location</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleAddLocation} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Location Name</label>
                                <Input
                                    placeholder="e.g. Room 101, Main Hall"
                                    value={newLocationName}
                                    onChange={(e) => setNewLocationName(e.target.value)}
                                    className="border-slate-200 focus:ring-teal-500"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold"
                                disabled={!newLocationName.trim() || isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Add Location
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Locations List */}
                <Card className="lg:col-span-2 border-none shadow-md">
                    <CardHeader className="bg-white border-b border-slate-100/50">
                        <CardTitle className="text-lg font-bold text-slate-800">Active Locations</CardTitle>
                        <CardDescription>
                            Locations listed here will be available for selection during patient booking.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {locations.length === 0 ? (
                            <div className="p-12 text-center">
                                <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">No locations added yet.</p>
                                <p className="text-slate-400 text-sm">Patients will be booked without specific location assignment.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead>Location Name</TableHead>
                                        <TableHead>Added On</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {locations.map((loc) => (
                                        <TableRow key={loc.id} className="hover:bg-slate-50/50">
                                            <TableCell className="font-medium text-slate-900">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                    {loc.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-500">
                                                {new Date(loc.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteLocation(loc.id)}
                                                    className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                    title="Remove Location"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
