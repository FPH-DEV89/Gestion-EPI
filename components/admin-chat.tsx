'use client';

import { useChat } from '@ai-sdk/react';
import { Bot, MessageSquare, Send, X } from 'lucide-react';
import { useState } from 'react';

export function AdminChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const chatHelpers = useChat({
        api: '/api/chat',
    });

    // Fallback pour les méthodes d'envoi (append ou sendMessage selon version)
    // On type 'any' pour éviter les erreurs de compilation sur les propriétés dynamiques
    const sendMessage = (chatHelpers as any).sendMessage || (chatHelpers as any).append;
    const { messages = [], status, error } = chatHelpers;

    const isLoading = status === 'submitted' || status === 'streaming';

    const handleCustomSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue;
        setInputValue(''); // UX: Clear immédiat

        try {
            // Tentative d'envoi standard (Objet Message)
            await sendMessage({ role: 'user', content: userMessage });
        } catch (err) {
            console.error("Erreur envoi chat:", err);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 h-14 w-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-slate-50 border-b p-4 flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                            <Bot size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">Expert IA</h3>
                            <p className="text-xs text-slate-500">Assistant Logistique</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                        {messages.length === 0 && (
                            <div className="text-center text-slate-400 mt-20 text-sm">
                                <p>👋 Bonjour ! Je suis votre assistant.</p>
                                <p className="mt-2">Posez-moi une question sur le stock ou les demandes.</p>
                            </div>
                        )}
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${m.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                                        }`}
                                >
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="px-4 py-2 bg-red-50 text-red-600 text-xs border-t border-red-100">
                            Erreur: {error.message}
                        </div>
                    )}

                    {/* Input */}
                    <form onSubmit={handleCustomSubmit} className="p-4 bg-white border-t flex gap-2">
                        <input
                            className="flex-1 px-4 py-2 bg-slate-100 border-0 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-slate-800 placeholder:text-slate-400"
                            value={inputValue}
                            placeholder="Posez une question..."
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputValue.trim()}
                            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
