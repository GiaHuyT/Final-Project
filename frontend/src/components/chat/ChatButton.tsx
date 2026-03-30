'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { Button } from '@/components/ui/button';

export const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpenChat = (e: any) => {
      setIsOpen(true);
      // Optional: Logic to pre-select conversation could go here or in ChatWindow
    };
    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isOpen ? (
        <div className="relative">
          <ChatWindow onClose={() => setIsOpen(false)} />
          <Button
            onClick={() => setIsOpen(false)}
            className="absolute -top-12 right-0 rounded-full w-10 h-10 p-0 bg-white text-slate-900 border shadow-lg hover:bg-slate-50"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-2xl bg-primary text-on-primary hover:scale-105 transition-transform"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};
