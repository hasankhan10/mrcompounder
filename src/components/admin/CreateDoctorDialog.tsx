
import React, { FormEvent, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Stethoscope } from 'lucide-react';

import { FileUpload } from '@/components/ui/file-upload';

interface CreateDoctorDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: FormEvent) => void;
    isLoading: boolean;
    name: string;
    setName: (val: string) => void;
    email: string;
    setEmail: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
    logoFile: File | null;
    setLogoFile: (file: File | null) => void;
}

export function CreateDoctorDialog({
    isOpen, onOpenChange, onSubmit, isLoading,
    name, setName, email, setEmail, password, setPassword,
    logoFile, setLogoFile
}: CreateDoctorDialogProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] animate-scale-in">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Stethoscope className="w-5 h-5 text-purple-600" />
                        </div>
                        Create New Doctor
                    </DialogTitle>
                    <DialogDescription>
                        Create a master account for a doctor. This email will link their clinics.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="grid gap-6 py-4">
                    <div className="grid gap-2 justify-center">
                        <Label className="text-center">Doctor Avatar / Logo</Label>
                        <FileUpload
                            value={logoFile}
                            onChange={setLogoFile}
                            accept="image/*"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="drName">Doctor Name</Label>
                        <Input
                            id="drName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Dr. Rajesh Koothrappali"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="drEmail">Email (Login ID)</Label>
                        <Input
                            id="drEmail"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="doctor@example.com"
                            required
                        />
                        <p className="text-xs text-slate-500">
                            Dr. uses this to log in and see multiple clinics.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="drPass">Password</Label>
                        <div className="relative">
                            <Input
                                id="drPass"
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
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                            {isLoading ? 'Creating...' : 'Create Doctor Profile'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
