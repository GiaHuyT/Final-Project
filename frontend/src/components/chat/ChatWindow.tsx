'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUp, ChevronLeft, Loader2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { toast } from 'react-hot-toast';

export const ChatWindow = ({ onClose, initialVendorId }: { onClose: () => void; initialVendorId?: number | null }) => {
  const { user, token } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const { messages, loadMessages, sendMessage, sendTyping, typingUser } = useChat(selectedConversation?.id);
  const [input, setInput] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!token) return;
      try {
        const res = await fetch('http://127.0.0.1:3000/chat/conversations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setConversations(data);
        
        // Handle initial vendor if provided
        if (initialVendorId && !selectedConversation) {
          setIsInitializing(true);
          try {
            const startRes = await fetch('http://127.0.0.1:3000/chat/conversation', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
              },
              body: JSON.stringify({ participantId: initialVendorId })
            });
            const conv = await startRes.json();
            setSelectedConversation(conv);
          } catch (err) {
            toast.error("Không thể kết nối với người bán");
          } finally {
            setIsInitializing(false);
          }
        }
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      }
    };
    fetchConversations();
  }, [initialVendorId, token]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation, loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
    sendTyping(false);
  };

  if (isInitializing) {
    return (
      <div className="w-80 h-[500px] bg-white rounded-2xl shadow-2xl border flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-medium text-slate-500">Đang khởi tạo trò chuyện...</p>
      </div>
    );
  }

  if (!selectedConversation) {
    return (
      <div className="w-80 h-[500px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
        <div className="p-4 border-b bg-slate-50 font-headline font-bold text-lg flex justify-between items-center">
            Trò chuyện
            <Button variant="ghost" title="Mở toàn màn hình" size="icon" onClick={() => { onClose(); window.location.href = '/messages'; }} className="h-8 w-8 text-slate-400 hover:text-primary transition-colors">
                <Maximize2 className="h-4 w-4" />
            </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {!conversations || !Array.isArray(conversations) || conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Chưa có cuộc hội thoại nào</div>
          ) : (
            conversations.map((conv) => {
              const otherUser = conv.participants?.find((p: any) => p.id !== user?.id);
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className="p-3 border-b hover:bg-slate-50 cursor-pointer flex gap-3 items-center"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={otherUser?.avatar} />
                    <AvatarFallback>{otherUser?.username?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-bold text-sm truncate">{otherUser?.username}</div>
                    <div className="text-xs text-slate-500 truncate">
                      {conv.messages[0]?.content || 'Bắt đầu trò chuyện...'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  const otherParticipant = selectedConversation.participants.find((p: any) => p.id !== user?.id);

  return (
    <div className="w-80 h-[500px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in slide-in-from-right-4">
      <div className="p-3 border-b bg-slate-50 flex items-center justify-between gap-1 shadow-sm relative z-10 text-left">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)} className="h-8 w-8 hover:bg-slate-200">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={otherParticipant?.avatar} />
              <AvatarFallback>{otherParticipant?.username?.[0]}</AvatarFallback>
            </Avatar>
            <div className="font-bold text-[13px] truncate max-w-[120px]">{otherParticipant?.username}</div>
        </div>
        <Button variant="ghost" title="Mở toàn màn hình" size="icon" onClick={() => { onClose(); window.location.href = '/messages'; }} className="h-8 w-8 text-slate-400 hover:text-primary transition-colors">
            <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto flex flex-col-reverse gap-3 cursor-default">
        {typingUser && (
          <div className="text-[10px] text-slate-400 italic">Đang nhập tin nhắn...</div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div
              key={msg.id}
              className={cn(
                "max-w-[85%] flex flex-col gap-1",
                isMe ? "items-end self-end" : "items-start self-start"
              )}
            >
              <div
                className={cn(
                  "p-3 rounded-2xl text-sm shadow-sm",
                  isMe 
                    ? "bg-slate-900 text-white rounded-tr-none" 
                    : "bg-slate-100 text-slate-900 rounded-tl-none font-medium"
                )}
              >
                {msg.content}
              </div>
              <span className="text-[9px] font-bold text-slate-400 px-1 uppercase tracking-tighter">
                {new Date(msg.createdAt).toLocaleString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t flex items-center gap-3 bg-white pb-6">
        <Input
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            sendTyping(e.target.value.length > 0);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="rounded-full bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 h-11 px-6 text-sm"
        />
        <Button 
          onClick={handleSend} 
          size="icon" 
          className="rounded-full shrink-0 w-11 h-11 bg-slate-900 hover:bg-black text-white shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
