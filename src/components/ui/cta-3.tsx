import Link from "next/link";
import { ArrowRightIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CallToAction() {
    return (
        <div className="relative mx-auto flex w-full max-w-5xl flex-col justify-between gap-y-10 border-y bg-[radial-gradient(35%_80%_at_25%_0%,theme(colors.teal.700/0.15),transparent)] px-8 py-24 overflow-hidden">
            <PlusIcon
                className="absolute top-[-12.5px] left-[-11.5px] z-1 size-6 text-teal-600/40"
                strokeWidth={1}
            />
            <PlusIcon
                className="absolute top-[-12.5px] right-[-11.5px] z-1 size-6 text-teal-600/40"
                strokeWidth={1}
            />
            <PlusIcon
                className="absolute bottom-[-12.5px] left-[-11.5px] z-1 size-6 text-teal-600/40"
                strokeWidth={1}
            />
            <PlusIcon
                className="absolute right-[-11.5px] bottom-[-12.5px] z-1 size-6 text-teal-600/40"
                strokeWidth={1}
            />

            <div className="-inset-y-10 pointer-events-none absolute left-0 w-px border-l border-teal-600/10" />
            <div className="-inset-y-10 pointer-events-none absolute right-0 w-px border-r border-teal-600/10" />

            <div className="-z-10 absolute top-0 left-1/2 h-full border-l border-dashed border-teal-600/10" />


            <div className="space-y-4">
                <h2 className="text-center font-bold text-4xl md:text-6xl text-slate-900 tracking-tight">
                    Ready to experience a Silent Clinic?
                </h2>
                <p className="text-center text-slate-600 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
                    Start your 14-day free trial today. Join 100+ doctors who have already transformed their waiting rooms with Mr Compounder.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-6">
                <Button asChild variant="outline" size="lg" className="border-teal-600/20 text-teal-700 hover:bg-teal-50 hover:text-black px-10 h-16 text-xl rounded-full">
                    <Link href="/contact">Contact Sales</Link>
                </Button>
                <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-10 h-16 text-xl rounded-full shadow-xl shadow-teal-600/20">
                    <Link href="/login">Get Started For Free <ArrowRightIcon className="size-6 ml-2 inline-block" /></Link>
                </Button>
            </div>
        </div>
    );
}
