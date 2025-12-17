
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, UserPlus } from 'lucide-react';

interface DoctorListHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onNewDoctorClick: () => void;
}

export function DoctorListHeader({ searchQuery, setSearchQuery, onNewDoctorClick }: DoctorListHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800">Doctor Management</h2>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search doctors..."
                        className="pl-9 w-full sm:w-64 bg-white text-black placeholder:text-slate-500 focus:ring-teal-500 focus:border-teal-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Button
                    onClick={onNewDoctorClick}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200"
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    New Doctor
                </Button>
            </div>
        </div>
    );
}
