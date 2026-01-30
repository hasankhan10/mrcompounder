"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase-client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface NavbarAuthProps {
    initialUser?: User | null;
    initialRole?: string | null;
    onLinkClick?: () => void;
}

export function NavbarAuth({
    initialUser,
    initialRole,
    onLinkClick,
}: NavbarAuthProps) {
    const [user, setUser] = useState<User | null>(initialUser || null);
    const [role, setRole] = useState<string | null>(initialRole || null);
    const [loading, setLoading] = useState(false);
    const [supabase] = useState(() => createClient());
    const router = useRouter();

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === "SIGNED_OUT") {
                setUser(null);
                setRole(null);
                router.refresh();
                return;
            }

            setUser(session?.user || null);
            if (session?.user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", session.user.id)
                    .single();
                setRole(profile?.role || null);
            } else {
                setRole(null);
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, router]);

    const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

    const handleDashboardClick = () => {
        setNavigatingTo("dashboard");
        onLinkClick?.();
        if (role === "super_admin") {
            router.push("/admin");
        } else if (role === "compounder") {
            router.push("/dashboard");
        } else if (role === "doctor") {
            router.push("/doctor/dashboard");
        }
    };

    if (loading) {
        return (
            <div className="size-10 flex items-center justify-center">
                <Loader2 className="size-5 animate-spin text-teal-600" />
            </div>
        );
    }

    if (user && role) {
        return (
            <Button
                onClick={handleDashboardClick}
                disabled={!!navigatingTo}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
            >
                {navigatingTo === "dashboard" ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                ) : null}
                Dashboard
            </Button>
        );
    }

    return (
        <div className="flex flex-col md:flex-row items-center gap-3 w-full">
            <Button
                variant="ghost"
                className="text-slate-600 hover:text-teal-600 hover:bg-teal-50 font-bold h-11 px-6 rounded-xl transition-all w-full md:w-auto"
                onClick={() => {
                    onLinkClick?.();
                    router.push("/login");
                }}
            >
                Login
            </Button>
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full md:w-auto"
            >
                <Button
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 px-6 rounded-xl shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-2 w-full md:w-auto overflow-hidden group"
                    onClick={() => {
                        onLinkClick?.();
                        router.push("/contact");
                    }}
                >
                    Book Free Setup
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </Button>
            </motion.div>
        </div>
    );
}
