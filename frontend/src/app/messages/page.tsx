"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send, ArrowLeft, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "react-hot-toast";

export default function MessagesPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    
    const { messages, loadMessages, sendMessage, sendTyping, typingUser } = useChat(selectedConversation?.id);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial auth check and conversation fetch
    useEffect(() => {
        if (user === null) return; // Still determining auth
        if (user === undefined) {
            router.push('/auth/login');
            return;
        }

        const fetchConversations = async () => {
            if (!token) return;
            try {
                const res = await fetch("http://127.0.0.1:3000/chat/conversations", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Thất bại khi lấy tin nhắn");
                const data = await res.json();
                setConversations(data);
                
                // Optional: Auto-select first conversation on desktop
                if (data.length > 0 && window.innerWidth >= 768) {
                    setSelectedConversation(data[0]);
                }
            } catch (err) {
                toast.error("Không thể lấy danh sách tin nhắn");
            } finally {
                setIsLoadingConversations(false);
            }
        };

        fetchConversations();
    }, [user, token, router]);

    // Load messages when conversation changes
    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.id);
        }
    }, [selectedConversation, loadMessages]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || !selectedConversation) return;
        sendMessage(input);
        setInput("");
        sendTyping(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const filteredConversations = conversations.filter(conv => {
        const otherParticipant = conv.participants?.find((p: any) => p.id !== user?.id);
        return otherParticipant?.username.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (user === null) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    const otherParticipant = selectedConversation?.participants.find((p: any) => p.id !== user?.id);

    return (
        <div className="h-screen bg-white md:bg-slate-50 pt-[72px] flex overflow-hidden font-sans">
            <div className="flex-1 w-full max-w-7xl mx-auto flex h-full border-x border-slate-100 bg-white shadow-sm relative">
                
                {/* 1. SIDEBAR (Conversation List) */}
                <div className={cn(
                    "flex-col w-full md:w-[350px] lg:w-[400px] border-r border-slate-100 h-full bg-white z-10 transition-all absolute md:relative top-0 left-0",
                    selectedConversation ? "hidden md:flex" : "flex"
                )}>
                    {/* Sidebar Header */}
                    <div className="p-4 md:p-6 border-b border-slate-50">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-black tracking-tight text-slate-900">Đoạn chat</h1>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-400" />
                            </div>
                            <Input 
                                placeholder="Tìm kiếm tin nhắn..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-slate-50/80 hover:bg-slate-100 focus:bg-white border-transparent transition-colors rounded-full h-11 text-sm shadow-none font-medium"
                            />
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto px-3 py-2">
                        {isLoadingConversations ? (
                            <div className="p-8 text-center text-slate-400 italic font-medium text-sm">Đang tải...</div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send className="w-6 h-6 text-slate-300" />
                                </div>
                                <span className="font-medium text-sm block">Chưa có cuộc trò chuyện nào</span>
                                <span className="text-xs mt-1 block">Tin nhắn của bạn sẽ xuất hiện ở đây</span>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => {
                                const target = conv.participants?.find((p: any) => p.id !== user?.id);
                                const lastMsg = conv.messages?.[conv.messages.length - 1] || conv.messages?.[0]; // Fallback if API changed order
                                const isActive = selectedConversation?.id === conv.id;

                                return (
                                    <div
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={cn(
                                            "flex items-center gap-4 p-3 mb-1 rounded-2xl cursor-pointer transition-all duration-200",
                                            isActive ? "bg-primary/5 shadow-sm" : "hover:bg-slate-50"
                                        )}
                                    >
                                        <Avatar className="h-14 w-14 shrink-0 shadow-sm border border-white">
                                            <AvatarImage src={target?.avatar} />
                                            <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                                                {target?.username?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0 overflow-hidden">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className={cn(
                                                    "font-bold text-[15px] truncate pr-2",
                                                    isActive ? "text-primary" : "text-slate-900"
                                                )}>
                                                    {target?.username || "Người dùng ẩn danh"}
                                                </h3>
                                                {lastMsg && (
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0">
                                                        {formatDistanceToNow(new Date(lastMsg.createdAt), { addSuffix: false, locale: vi })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 truncate font-medium">
                                                {lastMsg ? (
                                                    <span className={isActive ? "text-primary/70" : ""}>
                                                        {lastMsg.senderId === user?.id ? "Bạn: " : ""}
                                                        {lastMsg.content}
                                                    </span>
                                                ) : "Bắt đầu trò chuyện mới..."}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* 2. MAIN CHAT AREA */}
                <div className={cn(
                    "flex-1 flex col-span-1 flex-col h-full bg-slate-50/30 transition-all",
                    !selectedConversation ? "hidden md:flex" : "flex"
                )}>
                    {!selectedConversation ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                <Send className="w-10 h-10 text-slate-300 ml-2" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Cổng thông tin AutoBid</h2>
                            <p className="max-w-md mx-auto text-sm leading-relaxed font-medium">
                                Chọn một cuộc trò chuyện để bắt đầu tương tác với nhà sưu tầm và người bán trên toàn cầu.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="h-[80px] px-4 md:px-8 border-b border-slate-100 bg-white/80 backdrop-blur-xl flex justify-between items-center shrink-0 z-10 sticky top-0 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="md:hidden shrink-0 -ml-2 rounded-full"
                                        onClick={() => setSelectedConversation(null)}
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                    <Avatar className="h-11 w-11 shadow-sm border border-slate-100">
                                        <AvatarImage src={otherParticipant?.avatar} />
                                        <AvatarFallback className="bg-slate-900 text-white font-bold">
                                            {otherParticipant?.username?.[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="font-bold text-[16px] text-slate-900 tracking-tight leading-tight">
                                            {otherParticipant?.username || "Khách hàng"}
                                        </h2>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Hoạt động ngay</span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 rounded-full hidden md:flex">
                                    <Info className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Chat Body (Messages) */}
                            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 flex flex-col-reverse gap-6">
                                {typingUser && (
                                    <div className="flex items-center gap-3 animate-pulse opacity-70">
                                        <Avatar className="h-8 w-8 opacity-50">
                                            <AvatarFallback className="bg-slate-200" />
                                        </Avatar>
                                        <div className="bg-slate-200/50 rounded-2xl rounded-bl-sm py-3 px-4">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {messages.map((msg, index) => {
                                    const isMe = msg.senderId === user?.id;
                                    const nextMsg = messages[index - 1]; // Messages are reversed
                                    const isLastInGroup = nextMsg?.senderId !== msg.senderId;

                                    return (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex w-full",
                                                isMe ? "justify-end pl-12 md:pl-24" : "justify-start pr-12 md:pr-24"
                                            )}
                                        >
                                            <div className={cn(
                                                "flex gap-3 max-w-[85%] lg:max-w-[70%]",
                                                isMe ? "flex-row-reverse" : "flex-row"
                                            )}>
                                                {!isMe && isLastInGroup ? (
                                                    <Avatar className="h-8 w-8 shrink-0 mt-auto hidden md:block border border-slate-100 shadow-sm">
                                                        <AvatarImage src={otherParticipant?.avatar} />
                                                        <AvatarFallback className="text-[10px] font-bold">{otherParticipant?.username?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                ) : (
                                                    <div className="w-8 shrink-0 hidden md:block"></div>
                                                )}

                                                <div className="flex flex-col gap-1">
                                                    <div className={cn(
                                                        "px-5 py-3.5 shadow-sm text-[15px] leading-relaxed",
                                                        isMe 
                                                            ? "bg-slate-900 text-white font-medium rounded-[24px] rounded-br-sm shadow-slate-900/10" 
                                                            : "bg-surface-container-low border border-slate-100 text-slate-900 font-medium rounded-[24px] rounded-bl-sm"
                                                    )}>
                                                        {msg.content}
                                                    </div>
                                                    
                                                    {isLastInGroup && (
                                                        <span className={cn(
                                                            "text-[10px] font-bold text-slate-400 px-1 uppercase tracking-widest mt-1",
                                                            isMe ? "text-right" : "text-left"
                                                        )}>
                                                            {new Date(msg.createdAt).toLocaleString('vi-VN', {
                                                                hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                
                                {/* Start conversation indicator */}
                                <div className="text-center my-8 pb-4">
                                    <Avatar className="h-20 w-20 mx-auto mb-4 border-2 border-slate-100 shadow-sm">
                                        <AvatarImage src={otherParticipant?.avatar} />
                                        <AvatarFallback className="text-2xl font-black bg-slate-50 text-slate-600">
                                            {otherParticipant?.username?.[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="text-xl font-black tracking-tight text-slate-900">{otherParticipant?.username}</p>
                                    <p className="text-sm font-medium text-slate-500 mt-2">Dữ liệu cuộc hội thoại được mã hóa.</p>
                                </div>
                            </div>

                            {/* Chat Footer (Input) */}
                            <div className="p-4 md:p-6 bg-white border-t border-slate-100 shrink-0 shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.05)] z-10 transition-all">
                                <div className="flex gap-3 items-end max-w-4xl mx-auto">
                                    <div className="flex-1 bg-slate-50 border border-slate-100 focus-within:border-slate-300 focus-within:bg-white focus-within:shadow-md transition-all rounded-[28px] overflow-hidden flex items-end pr-2 pl-4 py-2 relative">
                                        <textarea 
                                            placeholder="Nhập tin nhắn..." 
                                            value={input}
                                            onChange={(e) => {
                                                setInput(e.target.value);
                                                sendTyping(e.target.value.length > 0);
                                            }}
                                            onKeyDown={handleKeyDown}
                                            className="w-full bg-transparent resize-none outline-none py-2 text-[15px] font-medium placeholder:text-slate-400 placeholder:font-medium max-h-32 leading-relaxed"
                                            rows={1}
                                            style={{ minHeight: '44px' }}
                                        />
                                        <Button 
                                            onClick={handleSend}
                                            disabled={!input.trim()}
                                            size="icon" 
                                            className={cn(
                                                "rounded-full w-10 h-10 shrink-0 flex items-center justify-center transition-all duration-300 shadow-sm",
                                                input.trim() ? "bg-primary hover:bg-primary/90 text-white scale-100" : "bg-slate-200 text-slate-400 scale-90"
                                            )}
                                        >
                                            <Send className="w-4 h-4 ml-0.5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-center mt-3">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Nhấn Enter để gửi &bull; Tránh vi phạm quy chuẩn cộng đồng</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
