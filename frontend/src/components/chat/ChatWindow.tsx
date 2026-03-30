'use client';

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ChatWindow = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const { messages, loadMessages, sendMessage, sendTyping, typingUser } = useChat(selectedConversation?.id);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      const res = await fetch('http://127.0.0.1:3000/chat/conversations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setConversations(data);
    };
    fetchConversations();
  }, []);

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

  if (!selectedConversation) {
    return (
      <div className="w-80 h-[500px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
        <div className="p-4 border-b bg-slate-50 font-headline font-bold text-lg">Trò chuyện</div>
        <div className="flex-1 overflow-y-auto">
          {!conversations || !Array.isArray(conversations) || conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Chưa có cuộc hội thoại nào</div>
          ) : (
            conversations.map((conv) => {
              const otherUser = conv.participants.find((p: any) => p.id !== user?.id);
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
      <div className="p-3 border-b bg-slate-50 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarImage src={otherParticipant?.avatar} />
          <AvatarFallback>{otherParticipant?.username?.[0]}</AvatarFallback>
        </Avatar>
        <div className="font-bold text-sm truncate">{otherParticipant?.username}</div>
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
                "max-w-[80%] p-2 rounded-2xl text-sm",
                isMe ? "bg-primary text-on-primary self-end rounded-tr-none" : "bg-slate-100 text-slate-900 self-start rounded-tl-none"
              )}
            >
              {msg.content}
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t flex gap-2">
        <Input
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            sendTyping(e.target.value.length > 0);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="rounded-full bg-slate-50"
        />
        <Button onClick={handleSend} size="icon" className="rounded-full shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
