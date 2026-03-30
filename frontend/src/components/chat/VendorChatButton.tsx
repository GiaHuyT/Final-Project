'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export const VendorChatButton = ({ vendorId, productId }: { vendorId: number; productId: number }) => {
  const { isLoggedIn, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStartChat = async () => {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:3000/chat/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ participantId: vendorId, productId }),
      });
      const conversation = await res.json();
      
      // Emit custom event to open the global chat window with this conversation
      window.dispatchEvent(new CustomEvent('open-chat', { 
        detail: { conversationId: conversation.id } 
      }));
    } catch (err) {
      console.error('Failed to start chat', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStartChat}
      disabled={loading}
      className="text-[10px] font-bold uppercase tracking-widest border-b border-primary hover:text-primary transition-colors disabled:opacity-50"
    >
      {loading ? 'Đang kết nối...' : 'Nhắn tin'}
    </button>
  );
};
