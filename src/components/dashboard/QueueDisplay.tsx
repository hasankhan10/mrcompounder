import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Token } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface QueueDisplayProps {
    doctorName?: string;
    doctorImageUrl?: string;
    waitingTokens: Token[];
    servedTokens: Token[];
    onCallNext: (tokenId?: string) => void;
    isSessionActive: boolean;
    onDeleteToken?: (tokenId: string) => void;
    onMarkAbsent?: () => void;
    showControls?: boolean;
    loadingAction: string | null;
    onSendWhatsApp?: (token: Token) => void;
}

export function QueueDisplay({ doctorName, doctorImageUrl, waitingTokens, servedTokens, onCallNext, onMarkAbsent, isSessionActive, onDeleteToken, showControls = true, loadingAction, onSendWhatsApp }: QueueDisplayProps) {
    const currentToken = waitingTokens.find(t => t.status === 'called');
    const pendingTokens = waitingTokens.filter(t => t.status === 'waiting');
    const isLastPatient = currentToken && pendingTokens.length === 0;

    return (
        <div className="lg:col-span-2 space-y-8">
            {/* Doctor Header */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                {doctorImageUrl ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200">
                        <Image src={doctorImageUrl} alt={doctorName || 'Doctor'} fill className="object-cover" unoptimized />
                    </div>
                ) : (
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                        {doctorName?.charAt(0)}
                    </div>
                )}
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Dr. {doctorName}</h2>
                    <p className="text-sm text-slate-500">Queue Management</p>
                </div>
            </div>

            {/* Call Next Action Area */}
            {showControls && (
                <Card className={`border-none shadow-lg text-white ${isLastPatient ? 'bg-gradient-to-br from-green-600 to-emerald-700' : 'bg-gradient-to-br from-teal-600 to-indigo-700'}`}>
                    <CardContent className="p-8 text-center">
                        <h3 className={isLastPatient ? "text-green-100 font-medium mb-2" : "text-teal-100 font-medium mb-2"}>
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
                            <div className="mb-6 text-teal-50">
                                <div className="text-xl font-bold">{currentToken.patient_name}</div>
                                {currentToken.purpose && <div className="text-sm opacity-80">{currentToken.purpose}</div>}
                            </div>
                        )}
                        <div className="flex justify-center gap-4">
                            {onMarkAbsent && (
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="font-bold text-lg px-6 py-6 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                    onClick={() => onMarkAbsent()}
                                    disabled={!currentToken || !isSessionActive || !!loadingAction}
                                >
                                    {loadingAction === 'mark-absent' ? 'Marking...' : 'Mark Absent'}
                                </Button>
                            )}
                            <Button
                                size="lg"
                                className={`font-bold text-lg px-8 py-6 shadow-xl ${isLastPatient
                                    ? 'bg-white text-green-600 hover:bg-green-50'
                                    : 'bg-white text-teal-600 hover:bg-teal-50'
                                    }`}
                                onClick={() => onCallNext()}
                                disabled={(!isLastPatient && pendingTokens.length === 0) || !isSessionActive || !!loadingAction}
                            >
                                {loadingAction === 'call-next' ? 'Calling...' : (isLastPatient ? 'Serve & Finish' : 'Call Next Token')}
                            </Button>
                        </div>
                        <p className={`mt-4 text-sm ${isLastPatient ? 'text-green-200' : 'text-teal-200'}`}>
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
                            <p className="text-slate-400 text-center mt-10">No patients waiting.</p>
                        ) : (
                            <div className="space-y-2">
                                {waitingTokens.map((token) => (
                                    <div key={token.id} className={`p-3 rounded-lg border flex justify-between items-center ${token.status === 'called' ? 'bg-teal-50 border-teal-200 ring-1 ring-teal-300' : (token.is_emergency ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100')}`}>
                                        <div>
                                            <span className={`font-bold text-lg ${token.status === 'called' ? 'text-teal-700' : (token.is_emergency ? 'text-red-700' : 'text-slate-700')}`}>#{token.token_number}</span>
                                            {token.patient_name && (
                                                <div className="ml-2 inline-block">
                                                    <span className="text-slate-600 block flex items-center gap-2">
                                                        {token.is_emergency && <span title="Emergency Case">🚨</span>}
                                                        {token.patient_name}
                                                        {token.is_present && (
                                                            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" title="Present at Clinic"></span>
                                                        )}
                                                    </span>
                                                    {token.purpose && <span className="text-xs text-slate-400 block -mt-0.5">{token.purpose}</span>}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-sm text-slate-400">{token.phone}</div>
                                            {onCallNext && token.status === 'waiting' && isSessionActive && (
                                                <button
                                                    onClick={() => onCallNext(token.id)}
                                                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-sm transition-colors"
                                                    title="Pass / Call Now"
                                                    disabled={!!loadingAction}
                                                >
                                                    Call
                                                </button>
                                            )}
                                            {onSendWhatsApp && (
                                                <button
                                                    onClick={() => onSendWhatsApp(token)}
                                                    className="text-green-500 hover:text-green-600 p-1.5 rounded-full hover:bg-green-50 transition-colors"
                                                    title="Send WhatsApp Link"
                                                    disabled={!!loadingAction}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.035c0 2.123.554 4.197 1.605 6.046L0 24l6.111-1.603a11.8 11.8 0 005.935 1.597h.005c6.637 0 12.032-5.395 12.035-12.035a11.77 11.77 0 00-3.535-8.513"/></svg>
                                                </button>
                                            )}
                                            {onDeleteToken && token.status === 'waiting' && (
                                                <button
                                                    onClick={() => onDeleteToken(token.id)}
                                                    className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                    title="Remove Patient"
                                                    disabled={!!loadingAction}
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
                    <Card className="border-none shadow-md h-96 flex flex-col bg-slate-50/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center text-slate-600">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                Served Today
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto pr-2">
                            {servedTokens.length === 0 ? (
                                <p className="text-slate-400 text-center mt-10">No patients served yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    {servedTokens.map((token) => (
                                        <div key={token.id} className="p-3 rounded-lg bg-white border border-slate-100 flex justify-between items-center opacity-75">
                                            <div>
                                                <span className="font-bold text-slate-500">#{token.token_number}</span>
                                                {token.patient_name && <span className="ml-2 text-slate-500">{token.patient_name}</span>}
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
