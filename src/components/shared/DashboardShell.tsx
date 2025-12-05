'use client';

import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { LayoutDashboard, Menu, LogOut, ChevronRight, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';


export interface NavItem {
    label: string;
    value: string;
    icon: React.ElementType;
}

interface DashboardShellProps {
    title: string;
    logoUrl?: string | null;
    subtitle?: string;
    navItems: NavItem[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    children: ReactNode;
    userType: 'admin' | 'clinic';
    trialEndDate?: string;
}

interface SidebarContentProps {
    title: string;
    logoUrl?: string | null;
    subtitle?: string;
    navItems: NavItem[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    setIsMobileOpen: (open: boolean) => void;
    router: AppRouterInstance;
    onLogout: () => void;
}

function SidebarContent({
    title,
    logoUrl,
    subtitle,
    navItems,
    activeTab,
    onTabChange,
    setIsMobileOpen,
    router,
    onLogout
}: SidebarContentProps) {
    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    {logoUrl ? (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100">
                            <Image src={logoUrl} alt="Logo" fill className="object-cover" />
                        </div>
                    ) : (
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-900 tracking-tight truncate max-w-[160px]">{title}</span>
                        {subtitle && <span className="text-xs text-gray-400 font-normal">{subtitle}</span>}
                    </div>
                </div>
            </div>
            <div className="flex-1 py-6 px-4 space-y-2">

                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Main Menu</div>

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.value;
                    return (
                        <button
                            key={item.value}
                            onClick={() => {
                                onTabChange(item.value);
                                setIsMobileOpen(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive
                                ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                            <span>{item.label}</span>
                            {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                        </button>
                    );
                })}
            </div>
            <div className="p-4 border-t border-gray-100 space-y-2">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/')}
                    className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer"
                >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                </Button>
                <Button
                    variant="ghost"
                    onClick={onLogout}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </div>
        </div>
    );
}

export function DashboardShell({
    title,
    logoUrl,
    subtitle,
    navItems,
    activeTab,
    onTabChange,
    onLogout,
    children,

}: DashboardShellProps) {
    const router = useRouter();
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);



    return (
        <div className="min-h-screen bg-gray-50/50 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block h-screen sticky top-0">
                <SidebarContent
                    title={title}
                    logoUrl={logoUrl}
                    subtitle={subtitle}
                    navItems={navItems}
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    setIsMobileOpen={setIsMobileOpen}
                    router={router}
                    onLogout={onLogout}
                />
            </aside>

            {/* Mobile Sidebar (Sheet) */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="bg-white shadow-sm border-gray-200">
                            <Menu className="w-5 h-5 text-gray-700" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <SidebarContent
                            title={title}
                            logoUrl={logoUrl}
                            subtitle={subtitle}
                            navItems={navItems}
                            activeTab={activeTab}
                            onTabChange={onTabChange}
                            setIsMobileOpen={setIsMobileOpen}
                            router={router}
                            onLogout={onLogout}

                        />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen w-full">
                {/* Header for Mobile (Title only) */}
                <div className="md:hidden flex justify-end mb-6">
                    <div className="flex items-center text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        System Operational
                    </div>
                </div>

                {children}
            </main>
        </div>
    );
}
