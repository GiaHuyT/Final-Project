'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { Button } from '@/components/ui/button';

export const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialVendorId, setInitialVendorId] = useState<number | null>(null);

  useEffect(() => {
    const handleOpenChat = (e: CustomEvent) => {
      setIsOpen(true);
      if (e.detail?.vendorId) {
        setInitialVendorId(e.detail.vendorId);
      }
    };
    window.addEventListener('open-chat', handleOpenChat as any);
    return () => window.removeEventListener('open-chat', handleOpenChat as any);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isOpen ? (
        <div className="relative">
          <ChatWindow 
            onClose={() => {
              setIsOpen(false);
              setInitialVendorId(null);
            }} 
            initialVendorId={initialVendorId}
          />
          <Button
            onClick={() => {
              setIsOpen(false);
              setInitialVendorId(null);
            }}
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
