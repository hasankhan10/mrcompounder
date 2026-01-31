"use client";

import { Metadata } from 'next';
import { LoginForm } from '@/components/public/LoginForm';
import { Plus } from 'lucide-react';
import { Reveal } from '@/components/shared/Reveal';

function FloatingPlusIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <Plus
      className={`absolute text-teal-600/5 animate-float ${className}`}
      style={style}
      strokeWidth={3}
    />
  );
}

const floatingPlusIcons = [
  { className: "top-1/4 left-[10%] w-16 h-16", delay: "0s" },
  { className: "top-1/2 right-[15%] w-24 h-24", delay: "2s" },
  { className: "bottom-1/4 left-[20%] w-12 h-12", delay: "4s" },
  { className: "top-10 left-[40%] w-8 h-8", delay: "1s" },
  { className: "bottom-10 right-[30%] w-20 h-20", delay: "3s" },
];

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 overflow-hidden px-4">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        {floatingPlusIcons.map((icon, idx) => (
          <FloatingPlusIcon key={idx} className={icon.className} style={{ animationDelay: icon.delay }} />
        ))}
      </div>

      {/* Subtle Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <Reveal width="100%" direction="up">
          <LoginForm />
        </Reveal>
        <Reveal width="100%" direction="up" delay={0.2}>
          <p className="text-center text-slate-400 text-sm mt-8 font-medium">
            Secure, encrypted access to your clinical dashboard.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
