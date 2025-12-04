import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function StatsGridSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-[60px] mb-2" />
                        <Skeleton className="h-3 w-[140px]" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function ClinicTableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-10 w-[100px]" />
            </div>
            <div className="rounded-md border bg-white">
                <div className="p-4 space-y-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-10 w-10 rounded-lg" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[200px]" />
                                    <Skeleton className="h-3 w-[150px]" />
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-4 w-[80px]" />
                                <Skeleton className="h-8 w-[100px]" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export function QueueDisplaySkeleton() {
    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full flex flex-col min-h-[500px]">
            <div className="p-4 bg-gray-100 flex justify-center">
                <Skeleton className="h-6 w-32" />
            </div>
            <div className="p-10 flex-1 flex flex-col items-center justify-center space-y-8">
                <Skeleton className="h-40 w-40 rounded-full" />
                <div className="space-y-4 text-center w-full flex flex-col items-center">
                    <Skeleton className="h-24 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="grid grid-cols-2 gap-4 w-full mt-auto">
                    <Skeleton className="h-14 w-full rounded-xl" />
                    <Skeleton className="h-14 w-full rounded-xl" />
                </div>
            </div>
        </div>
    )
}

export function WaitingListSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-8 w-24" />
            </div>
            <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <Skeleton className="h-8 w-20 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export function PatientViewSkeleton() {
    return (
        <main className="min-h-screen bg-slate-50 flex flex-col items-center p-4 md:pt-10">
            <div className="w-full max-w-md space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>

                {/* Live Status Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-4 bg-gray-100 flex justify-center">
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="p-10 text-center flex flex-col items-center gap-4">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </div>

                {/* My Token Card */}
                <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-transparent">
                    <div className="flex justify-between items-center mb-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-12 w-32 mb-4" />
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
            </div>
        </main>
    )
}

export function PaymentRequestsSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-24 h-24 rounded" />
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function HistorySkeleton() {
    return (
        <div className="space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
