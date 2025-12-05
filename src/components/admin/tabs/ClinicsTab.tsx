import { Clinic } from '@/lib/types';
import { ClinicListHeader } from '@/components/admin/ClinicListHeader';
import { ClinicTable } from '@/components/admin/ClinicTable';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

interface ClinicsTabProps {
    clinics: Clinic[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onNewClinicClick: () => void;
    onEdit: (clinic: Clinic) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string, currentStatus: boolean) => void;
    onTopup: (id: string) => void;
    topupAmounts: { [key: string]: string };
    setTopupAmounts: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
    onToggleTrial: (id: string, isActive: boolean) => void;
    trialDates: { [key: string]: { start: string; end: string } };
    onTrialDateChange: (id: string, type: 'start' | 'end', value: string) => void;
}

export function ClinicsTab({
    clinics,
    searchQuery,
    setSearchQuery,
    onNewClinicClick,
    onEdit,
    onDelete,
    onToggleStatus,
    onTopup,
    topupAmounts,
    setTopupAmounts,
    onToggleTrial,
    trialDates,
    onTrialDateChange,
}: ClinicsTabProps) {
    return (
        <div className="space-y-8 animate-fade-in-up">
            <ClinicListHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onNewClinicClick={onNewClinicClick}
            />
            <ErrorBoundary name="Clinic Table">
                <ClinicTable
                    clinics={clinics}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                    onTopup={onTopup}
                    topupAmounts={topupAmounts}
                    setTopupAmounts={setTopupAmounts}
                    onToggleTrial={onToggleTrial}
                    trialDates={trialDates}
                    onTrialDateChange={onTrialDateChange}
                />
            </ErrorBoundary>
        </div>
    );
}
