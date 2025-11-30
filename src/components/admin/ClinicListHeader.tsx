import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

interface ClinicListHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onNewClinicClick: () => void;
}

export function ClinicListHeader({ searchQuery, setSearchQuery, onNewClinicClick }: ClinicListHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-800">Clinic Directory</h2>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search clinics..."
                        className="pl-9 w-full sm:w-64 bg-white text-black placeholder:text-gray-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Button
                    onClick={onNewClinicClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Clinic
                </Button>
            </div>
        </div>
    );
}
