
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/ui/file-upload';
import { Clinic } from '@/lib/types';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';
import { dashboardService } from '@/services/dashboard';
import { Copy } from 'lucide-react';


interface SettingsTabProps {
    clinic: Clinic | null;
}

export function SettingsTab({ clinic }: SettingsTabProps) {
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [logoUrl, setLogoUrl] = useState(clinic?.logo_url || '');
    const [origin, setOrigin] = useState('');

    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    const fullUrl = origin && clinic?.slug ? `${origin}/${clinic.slug}` : '';

    const handleCopy = () => {
        if (!fullUrl) return;
        navigator.clipboard.writeText(fullUrl);
        toast.success('Link copied to clipboard!');
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            const supabase = createClient();
            let newLogoUrl = logoUrl;

            // Upload new logo if selected
            if (logoFile) {
                // Sanitize filename to avoid issues
                const fileExt = logoFile.name.split('.').pop()?.toLowerCase() || 'jpg';
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('clinic-logos')
                    .upload(fileName, logoFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) throw new Error('Logo upload failed: ' + uploadError.message);

                const { data: { publicUrl } } = supabase.storage
                    .from('clinic-logos')
                    .getPublicUrl(fileName);

                newLogoUrl = publicUrl;
            }

            if (newLogoUrl === clinic?.logo_url && !logoFile) {
                toast.info('No changes to save.');
                return;
            }

            await dashboardService.updateSettings({ logoUrl: newLogoUrl });
            setLogoUrl(newLogoUrl);
            setLogoFile(null); // Clear file input
            toast.success('Profile updated successfully');

        } catch (err: unknown) {
            console.error(err);
            toast.error('Failed to update profile', {
                description: err instanceof Error ? err.message : 'An unexpected error occurred.'
            });
        } finally {
            setIsUploading(false);
        }
    };

    if (!clinic) return <div>Loading settings...</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-100 animate-fade-in-up">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Clinic Settings</h1>
                <p className="text-slate-500">Manage your clinic profile and appearance.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-8">
                <Label className="block text-sm font-medium text-slate-700 mb-2">Shareable Clinic Link</Label>
                <div className="flex gap-2">
                    <Input
                        readOnly
                        value={fullUrl}
                        className="bg-white text-slate-600 font-mono text-sm"
                        placeholder="Loading..."
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCopy}
                        className="shrink-0 hover:bg-teal-500 active:bg-teal-500"
                    >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                    </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    Share this link with your patients to let them book appointments online.
                </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-slate-700 mb-4">Profile Picture</h2>

                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Current Logo Display */}
                        <div className="flex-shrink-0">
                            <Label className="block mb-2 text-sm text-slate-600">Current Logo</Label>
                            {logoUrl ? (
                                <div className="relative h-32 w-32 rounded-lg overflow-hidden border border-slate-200">
                                    <Image
                                        src={logoUrl}
                                        alt="Clinic Logo"
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            ) : (
                                <div className="h-32 w-32 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-100 text-teal-600 font-bold text-3xl">
                                    {clinic.name ? clinic.name.charAt(0) : '?'}
                                </div>
                            )}
                        </div>

                        {/* Upload Input */}
                        <div className="flex-1 w-full space-y-2">
                            <Label className="text-sm text-slate-600">Update Logo</Label>
                            <FileUpload
                                value={logoFile}
                                onChange={setLogoFile}
                                accept="image/*"
                                label="Drop new logo here or click to upload"
                            />
                            <p className="text-xs text-slate-400">
                                Recommended size: Square (500x500px). Max size: 2MB.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <Button
                        type="submit"
                        disabled={isUploading || (!logoFile)}
                        className="bg-teal-600 hover:bg-teal-700 text-white min-w-[120px]"
                    >
                        {isUploading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
