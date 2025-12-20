
import React, { useState } from 'react';
import { DoctorListHeader } from '@/components/admin/DoctorListHeader';
import { DoctorTable } from '@/components/admin/DoctorTable';
import { CreateDoctorDialog } from '@/components/admin/CreateDoctorDialog';
import { adminService } from '@/services/admin';
import { toast } from 'sonner';
import { Doctor } from '@/lib/types';
import { createClient } from '@/lib/supabase-client';

import { DoctorTableSkeleton } from '@/components/skeletons/DashboardSkeletons';

interface DoctorsTabProps {
    doctors: Doctor[];
    isLoading: boolean;
    onRefresh: () => void;
    onDelete: (id: string) => void;
}

export function DoctorsTab({ doctors, isLoading, onRefresh, onDelete }: DoctorsTabProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Create Dialog State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [supabase] = useState(() => createClient()); // Need client for storage upload

    if (isLoading) {
        return <DoctorTableSkeleton />;
    }



    const handleCreateDoctor = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            let avatarUrl = '';

            // Upload Logo if exists
            if (logoFile) {
                const fileExt = logoFile.name.split('.').pop();
                const fileName = `dr-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('doctor-avatars') // Dedicated bucket for doctors
                    .upload(fileName, logoFile);

                if (uploadError) throw new Error('Logo upload failed: ' + uploadError.message);

                const { data: { publicUrl } } = supabase.storage
                    .from('doctor-avatars')
                    .getPublicUrl(fileName);

                avatarUrl = publicUrl;
            }

            await adminService.createDoctor({
                name: newName,
                email: newEmail,
                password: newPassword,
                avatarUrl
            });
            toast.success('Doctor account created successfully');
            setIsCreateOpen(false);
            setNewName('');
            setNewEmail('');
            setNewPassword('');
            setLogoFile(null);

            // Refresh list
            onRefresh();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to create doctor');
        } finally {
            setIsCreating(false);
        }
    };

    const filteredDoctors = doctors.filter(doc =>
        (doc.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in-up">
            <DoctorListHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onNewDoctorClick={() => setIsCreateOpen(true)}
            />

            <DoctorTable
                doctors={filteredDoctors}
                onDelete={onDelete}
            />

            <CreateDoctorDialog
                isOpen={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSubmit={handleCreateDoctor}
                isLoading={isCreating}
                name={newName}
                setName={setNewName}
                email={newEmail}
                setEmail={setNewEmail}
                password={newPassword}
                setPassword={setNewPassword}
                logoFile={logoFile}
                setLogoFile={setLogoFile}
            />
        </div>
    );
}
