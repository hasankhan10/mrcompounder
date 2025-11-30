import React, { FormEvent, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';

interface CreateClinicDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: FormEvent) => void;
    isLoading: boolean;
    name: string;
    setName: (val: string) => void;
    slug: string;
    setSlug: (val: string) => void;
    logoFile: File | null;
    setLogoFile: (file: File | null) => void;
    email: string;
    setEmail: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
}

export function CreateClinicDialog({
    isOpen, onOpenChange, onSubmit, isLoading,
    name, setName, slug, setSlug, logoFile, setLogoFile,
    email, setEmail, password, setPassword
}: CreateClinicDialogProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] animate-scale-in">
                <DialogHeader>
                    <DialogTitle>Create New Clinic</DialogTitle>
                    <DialogDescription>
                        Enter the details below to onboard a new clinic.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Clinic Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maa Clinic" required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="slug">Slug (URL)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">/</span>
                            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="pl-6" placeholder="maaclinic" required />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="logo">Clinic Logo</Label>
                        <div className="flex items-center gap-2">
                            <FileUpload
                                value={logoFile}
                                onChange={setLogoFile}
                                accept="image/*"
                                label="Upload clinic logo"
                            />
                        </div>
                        <p className="text-xs text-gray-500">Upload an image file (max 2MB).</p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="compounderEmail">Clinic Email (Login)</Label>
                        <Input id="compounderEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="clinic@example.com" required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="compounderPassword">Clinic Password</Label>
                        <div className="relative">
                            <Input
                                id="compounderPassword"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Set a strong password"
                                required
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
                        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                            {isLoading ? 'Creating...' : 'Create Clinic'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
