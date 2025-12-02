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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            {queue.doctor_image_url ? (
                                <Image src={queue.doctor_image_url || ''} alt={queue.doctor_name || 'Doctor'} width={64} height={64} className="w-16 h-16 rounded-full object-cover border border-gray-100" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xl">
                                    {queue.doctor_name?.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{queue.doctor_name}</h3>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${queue.status === 'active' ? 'bg-green-100 text-green-700' :
                                    queue.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {(queue.status || 'unknown').toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {queue.status === 'active' && (
                            <div className="mb-4 bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Current Token</p>
                                <p className="text-3xl font-black text-blue-900">
                                    {currentToken ? currentToken.token_number : '--'}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mb-4 flex-grow">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{waitingCount}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Waiting</p>
                            </div>
                            <div className="text-center border-l border-gray-100">
                                <p className="text-2xl font-bold text-gray-900">{servedCount}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Served</p>
                            </div>
                        </div>

                        {queue.status === 'active' && onCallNext && (
                            <Button
                                size="sm"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-auto"
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
