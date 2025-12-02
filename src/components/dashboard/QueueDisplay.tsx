import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Token } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface QueueDisplayProps {
    doctorName?: string;
    doctorImageUrl?: string;
    waitingTokens: Token[];
    servedTokens: Token[];
    onCallNext: () => void;
    isSessionActive: boolean;
    onDeleteToken?: (tokenId: string) => void;
    showControls?: boolean;
}

export function QueueDisplay({ doctorName, doctorImageUrl, waitingTokens, servedTokens, onCallNext, isSessionActive, onDeleteToken, showControls = true }: QueueDisplayProps) {
    const currentToken = waitingTokens.find(t => t.status === 'called');
    const pendingTokens = waitingTokens.filter(t => t.status === 'waiting');
    const isLastPatient = currentToken && pendingTokens.length === 0;

    return (
        <div className="lg:col-span-2 space-y-8">
            {/* Doctor Header */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                {doctorImageUrl ? (
                    <img src={doctorImageUrl} alt={doctorName} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {doctorName?.charAt(0)}
                    </div>
                )}
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Dr. {doctorName}</h2>
                    <p className="text-sm text-gray-500">Queue Management</p>
                </div>
            </div>

            {/* Call Next Action Area */}
            {showControls && (
                <Card className={`border-none shadow-lg text-white ${isLastPatient ? 'bg-gradient-to-br from-green-600 to-emerald-700' : 'bg-gradient-to-br from-blue-600 to-indigo-700'}`}>
                    <CardContent className="p-8 text-center">
                        <h3 className={isLastPatient ? "text-green-100 font-medium mb-2" : "text-blue-100 font-medium mb-2"}>
                            {isLastPatient ? 'Finishing Session' : 'Current Token'}
                        </h3>
                        <div className="text-8xl font-bold mb-6 tracking-tighter overflow-hidden h-32 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentToken?.token_number || 'none'}
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -50, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                >
                                    {currentToken?.token_number || '--'}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        {currentToken && (
                            <div className="mb-6 text-blue-50">
                                <div className="text-xl font-bold">{currentToken.patient_name}</div>
                                {currentToken.purpose && <div className="text-sm opacity-80">{currentToken.purpose}</div>}
                            </div>
                        )}
                        <div className="flex justify-center gap-4">
                            <Button
                                size="lg"
                                className={`font-bold text-lg px-8 py-6 shadow-xl ${isLastPatient
                                    ? 'bg-white text-green-600 hover:bg-green-50'
                                    : 'bg-white text-blue-600 hover:bg-blue-50'
                                    }`}
                                onClick={() => onCallNext()}
                                disabled={(!isLastPatient && pendingTokens.length === 0) || !isSessionActive}
                            >
                                {isLastPatient ? 'Serve & Finish' : 'Call Next Token'}
                            </Button>
                        </div>
                        <p className={`mt-4 text-sm ${isLastPatient ? 'text-green-200' : 'text-blue-200'}`}>
                            {pendingTokens.length} patients waiting in queue
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className={`grid grid-cols-1 ${showControls ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6`}>
                {/* Waiting List */}
                <Card className="border-none shadow-md h-96 flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                            <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                            Waiting Queue
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pr-2">
                        {waitingTokens.length === 0 ? (
                            <p className="text-gray-400 text-center mt-10">No patients waiting.</p>
                        ) : (
                            <div className="space-y-2">
                                {waitingTokens.map((token) => (
                                    <div key={token.id} className={`p-3 rounded-lg border flex justify-between items-center ${token.status === 'called' ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300' : 'bg-white border-gray-100'}`}>
                                        <div>
                                            <span className={`font-bold text-lg ${token.status === 'called' ? 'text-blue-700' : 'text-gray-700'}`}>#{token.token_number}</span>
                                            {token.patient_name && (
                                                <div className="ml-2 inline-block">
                                                    <span className="text-gray-600 block flex items-center gap-2">
                                                        {token.patient_name}
                                                        {token.is_present && (
                                                            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" title="Present at Clinic"></span>
                                                        )}
                                                    </span>
                                                    {token.purpose && <span className="text-xs text-gray-400 block -mt-0.5">{token.purpose}</span>}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-sm text-gray-400">{token.phone}</div>
                                            {onDeleteToken && token.status === 'waiting' && (
                                                <button
                                                    onClick={() => onDeleteToken(token.id)}
                                                    className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                    title="Remove Patient"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Served List */}
                {showControls && (
                    <Card className="border-none shadow-md h-96 flex flex-col bg-gray-50/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center text-gray-600">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                Served Today
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto pr-2">
                            {servedTokens.length === 0 ? (
                                <p className="text-gray-400 text-center mt-10">No patients served yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {servedTokens.map((token) => (
                                        <div key={token.id} className="p-3 rounded-lg bg-white border border-gray-100 flex justify-between items-center opacity-75">
                                            <div>
                                                <span className="font-bold text-gray-500">#{token.token_number}</span>
                                                {token.patient_name && <span className="ml-2 text-gray-500">{token.patient_name}</span>}
                                            </div>
                                            <div className="text-xs text-green-600 font-medium uppercase">{token.status}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
