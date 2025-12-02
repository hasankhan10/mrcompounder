'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
    name?: string; // To identify which boundary failed
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`Uncaught error in ${this.props.name || 'component'}:`, error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="p-6 rounded-lg border border-red-200 bg-red-50 flex flex-col items-center justify-center text-center space-y-4 min-h-[200px]">
                    <div className="p-3 bg-red-100 rounded-full">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-red-900">Something went wrong</h3>
                        <p className="text-sm text-red-700 mt-1 max-w-md">
                            We couldn&apos;t load this section. It might be a temporary connection issue.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <pre className="mt-2 text-xs text-left bg-red-100 p-2 rounded overflow-auto max-w-xs mx-auto">
                                {this.state.error.message}
                            </pre>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        className="border-red-200 hover:bg-red-100 text-red-700"
                        onClick={() => this.setState({ hasError: false, error: null })}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
