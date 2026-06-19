"use client"

import { Send, Bot, User, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useUser } from '@/stores/useUserStore'
import { useMemo } from 'react'
import { axios, Formatter } from '@/lib'
import { AssetInfo } from '@/schemas/asset.schema'

import { useAssistantChat } from '@/hooks'

export default function AssistantClient() {
    const {
        messages,
        setMessages,
        input,
        setInput,
        isLoading,
        setIsLoading,
        messagesEndRef,
        handleSend,
        handleKeyDown
    } = useAssistantChat();

    const { user } = useUser();

    const portfolios = useMemo(() => {
        if (!user || !user.positions || !user.positions.items) return [];
        const unique = new Set<string>();
        user.positions.items.forEach(item => {
            if (item.provider && item.account_no) {
                unique.add(`${item.provider} - ${item.account_no}`);
            }
        });
        return Array.from(unique);
    }, [user]);

    const handlePortfolioClick = async (portfolioName: string) => {
        const [provider, account_no] = portfolioName.split(' - ');

        const userMessage = {
            id: Date.now().toString(),
            role: 'user' as const,
            content: `View Portfolio ${portfolioName}`,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const holdings = user?.positions?.items.filter(
                item => item.provider === provider && item.account_no === account_no
            ) || [];

            if (holdings.length === 0) {
                const emptyResponse = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant' as const,
                    content: "This portfolio appears to be empty. Would you like to check another one?",
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, emptyResponse]);
                return;
            }

            const results = await Promise.all(holdings.map(async (holding) => {
                let currentPrice = holding.current_price || 0;
                let aiSignal = "N/A";

                try {
                    const res = await axios.get(`/asset/get-item/${holding.ticker}?market=indonesia`);
                    const data: AssetInfo = res.data.data;
                    currentPrice = data.price || currentPrice;
                    aiSignal = data.tech_rating_1d || "N/A";
                } catch (err) {
                    try {
                        const res = await axios.get(`/asset/get-item/${holding.ticker}?market=america`);
                        const data: AssetInfo = res.data.data;
                        currentPrice = data.price || currentPrice;
                        aiSignal = data.tech_rating_1d || "N/A";
                    } catch (fallbackErr) {
                        console.error(`Failed to fetch data for ${holding.ticker}`);
                    }
                }

                const avgPrice = holding.invested_total / holding.total_qty;
                const unrealizedPnl = (currentPrice - avgPrice) / avgPrice * 100;

                return {
                    ticker: holding.ticker,
                    avgPrice: avgPrice,
                    currentPrice: currentPrice,
                    unrealizedPnl: unrealizedPnl,
                    aiSignal: aiSignal,
                    currency: holding.currency || 'IDR'
                };
            }));

            let tableMd = `| Ticker | Avg | Current Price | Unrealized PnL (%) | AI Signal |\n`;
            tableMd += `|---|---|---|---|---|\n`;

            results.forEach(r => {
                const formattedAvg = Formatter.formatCurrency(r.avgPrice, r.currency);
                const formattedCurrent = Formatter.formatCurrency(r.currentPrice, r.currency);
                const formattedPnl = Formatter.formatPercent(r.unrealizedPnl);

                tableMd += `| **${r.ticker}** | ${formattedAvg} | ${formattedCurrent} | ${formattedPnl} | ${r.aiSignal} |\n`;
            });

            const aiResponse = {
                id: (Date.now() + 1).toString(),
                role: 'assistant' as const,
                content: `Here is the current status of your portfolio **${portfolioName}**:\n\n${tableMd}`,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error(error);
            const errorResponse = {
                id: (Date.now() + 1).toString(),
                role: 'assistant' as const,
                content: "I encountered an error while analyzing your portfolio. Please try again later.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-theme(spacing.16))] flex-col p-5 md:p-6 bg-zinc-950 text-zinc-50">
            <Card className="flex flex-1 flex-col border-zinc-800 bg-zinc-900/50 shadow-2xl">
                <CardHeader className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-4">
                    <CardTitle className="flex items-center gap-2 text-zinc-100">
                        <Bot className="h-5 w-5 text-indigo-400" />
                        AI Financial Assistant
                    </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-full p-4">
                        <div className="flex flex-col gap-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                        }`}
                                >
                                    <Avatar className={`h-8 w-8 border ${message.role === 'user'
                                        ? 'border-indigo-500/30 bg-indigo-500/10'
                                        : 'border-emerald-500/30 bg-emerald-500/10'
                                        }`}>
                                        <AvatarFallback className="bg-transparent text-xs">
                                            {message.role === 'user' ? <User className="h-4 w-4 text-indigo-400" /> : <Bot className="h-4 w-4 text-emerald-400" />}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div
                                        className={`flex flex-col gap-1 max-w-[80%] md:max-w-[70%] ${message.role === 'user' ? 'items-end' : 'items-start'
                                            }`}
                                    >
                                        <div
                                            className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${message.role === 'user'
                                                ? 'bg-indigo-600/90 text-white rounded-tr-none'
                                                : 'bg-zinc-800/80 text-zinc-100 rounded-tl-none border border-zinc-700/50'
                                                }`}
                                        >
                                            <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-700 max-w-none text-sm">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                                                        ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                                                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                                                        code: ({ children }) => <code className="bg-zinc-900/50 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                                                        table: ({ children }) => <div className="overflow-x-auto my-3"><table className="w-full text-left border-collapse text-xs whitespace-nowrap">{children}</table></div>,
                                                        th: ({ children }) => <th className="border-b border-zinc-700/50 p-2 text-zinc-400 font-medium">{children}</th>,
                                                        td: ({ children }) => <td className="border-b border-zinc-800/50 p-2 text-zinc-300">{children}</td>,
                                                        tr: ({ children }) => <tr className="hover:bg-zinc-800/30 transition-colors">{children}</tr>
                                                    }}
                                                >
                                                    {message.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-zinc-500 px-1">
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8 border border-emerald-500/30 bg-emerald-500/10">
                                        <AvatarFallback className="bg-transparent">
                                            <Bot className="h-4 w-4 text-emerald-400" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="bg-zinc-800/80 rounded-2xl rounded-tl-none border border-zinc-700/50 px-4 py-3">
                                        <div className="flex items-center gap-1 h-5">
                                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && portfolios.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2 ml-11">
                                    {portfolios.map(p => (
                                        <button
                                            key={p}
                                            onClick={() => handlePortfolioClick(p)}
                                            className="px-3 py-1.5 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white transition-colors"
                                        >
                                            View Portfolio {p}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>
                </CardContent>

                <CardFooter className="p-4 bg-zinc-900/50 border-t border-zinc-800">
                    <div className="flex w-full items-center gap-2">
                        <Input
                            placeholder="Ask about your portfolio..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            className="flex-1 bg-zinc-950/50 border-zinc-700/50 focus-visible:ring-indigo-500/30 text-zinc-100 placeholder:text-zinc-500"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            size="icon"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
