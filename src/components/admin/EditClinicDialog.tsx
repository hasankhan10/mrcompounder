import React, { FormEvent, useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';

interface EditClinicDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: FormEvent) => void;
    isLoading: boolean;
    name: string;
    setName: (val: string) => void;
    slug: string;
    setSlug: (val: string) => void;
    logoUrl: string;
    logoFile: File | null;
    setLogoFile: (file: File | null) => void;
    password: string;
    setPassword: (val: string) => void;
}

export function EditClinicDialog({
    isOpen, onOpenChange, onSubmit, isLoading,
    name, setName, slug, setSlug, logoUrl, logoFile, setLogoFile,
    password, setPassword
}: EditClinicDialogProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white animate-scale-in">
                <DialogHeader>
                    <DialogTitle className="text-black">Edit Clinic</DialogTitle>
                    <DialogDescription className="text-gray-500">Update clinic details and settings.</DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-name">Clinic Name</Label>
                        <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-slug">Slug (URL)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/</span>
                            <Input id="edit-slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="pl-6" required />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-logo">Clinic Logo</Label>
                        {logoUrl && (
                            <div className="mb-2">
                                <div className="mb-2 relative h-10 w-10">
                                    <Image src={logoUrl} alt="Current Logo" fill className="rounded object-cover border" unoptimized />
                                </div>
                            </div>
                        )}
                        <FileUpload
                            value={logoFile}
                            onChange={setLogoFile}
                            accept="image/*"
                            label="Upload to replace current logo"
                        />
                        <p className="text-xs text-gray-500">Upload to replace current logo.</p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-password">Reset Password (Optional)</Label>
                        <div className="relative">
                            <Input
                                id="edit-password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password to reset"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {isLoading ? 'Updating...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
