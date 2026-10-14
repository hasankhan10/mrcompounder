'use client';

import React from 'react';

interface RevealProps {
    children: React.ReactNode;
    width?: 'fit-content' | '100%';
    delay?: number;
    duration?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    className?: string;
}

export function Reveal({
    children,
    width = 'fit-content',
    className = ''
}: RevealProps) {
    return (
        <div style={{ position: 'relative', width }} className={className}>
            {children}
        </div>
    );
}

