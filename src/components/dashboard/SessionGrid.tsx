import { Queue, Token } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Megaphone } from 'lucide-react';

interface SessionGridProps {
    queues: Queue[];
    tokens: Token[];
    onSelect: (id: string) => void;
    onCallNext?: (queueId: string) => void;
}

export function SessionGrid({ queues, tokens, onSelect, onCallNext }: SessionGridProps) {
    return (
        <div className="flex flex-wrap gap-6">
            {queues.map((queue) => {
                const queueTokens = tokens.filter(t => t.queue_id === queue.id);
                const waitingCount = queueTokens.filter(t => t.status === 'waiting' || t.status === 'called').length;
                const servedCount = queueTokens.filter(t => t.status === 'served').length;

                // Find current called token
                const currentToken = queueTokens.find(t => t.status === 'called');
                const hasWaiting = queueTokens.some(t => t.status === 'waiting');

                return (
                    <div
                        key={queue.id}
                        onClick={() => onSelect(queue.id)}
                        className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-full flex-grow basis-[300px]"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            {queue.doctor_image_url ? (
                                <Image src={queue.doctor_image_url || ''} alt={queue.doctor_name || 'Doctor'} width={64} height={64} className="w-16 h-16 rounded-full object-cover border border-slate-100 flex-shrink-0" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-xl flex-shrink-0">
                                    {queue.doctor_name?.charAt(0)}
                                </div>
                            )}
                            <div className="flex flex-col items-start gap-1 min-w-0">
                                <h3 className="font-bold text-slate-900 text-lg group-hover:text-teal-600 transition-colors whitespace-nowrap">{queue.doctor_name}</h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${queue.status === 'active' ? 'bg-green-100 text-green-700' :
                                    queue.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {(queue.status || 'unknown').toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {queue.status === 'active' && (
                            <div className="mb-4 bg-teal-50 rounded-lg p-3 text-center border border-teal-100">
                                <p className="text-xs text-teal-600 font-semibold uppercase tracking-wider mb-1">Current Token</p>
                                <p className="text-3xl font-black text-teal-900">
                                    {currentToken ? currentToken.token_number : '--'}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mb-4 flex-grow">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-slate-900">{waitingCount}</p>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Waiting</p>
                            </div>
                            <div className="text-center border-l border-slate-100">
                                <p className="text-2xl font-bold text-slate-900">{servedCount}</p>
                                <p className="text-xs text-slate-500 uppercase tracking-wide">Served</p>
                            </div>
                        </div>

                        {queue.status === 'active' && onCallNext && (
                            <Button
                                size="sm"
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white mt-auto"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCallNext(queue.id);
                                }}
                                disabled={!hasWaiting && !currentToken}
                            >
                                <Megaphone className="w-4 h-4 mr-2" />
                                Call Next
                            </Button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
