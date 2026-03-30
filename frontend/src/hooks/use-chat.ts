'use client';

import { useState, useEffect, useCallback } from 'react';
import { initSocket, getSocket } from '@/lib/socket';
import { useAuth } from '@/hooks/use-auth'; // Assuming useAuth exists and provides token/user

export const useChat = (conversationId?: number) => {
  const { user, token } = useAuth(); // You'll need to ensure this hook exists
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<number | null>(null);

  const socket = getSocket('chat');

  useEffect(() => {
    if (user && token && !socket) {
       initSocket('chat', token, user.id);
    }
  }, [user, token, socket]);

  useEffect(() => {
    const chatSocket = getSocket('chat');
    if (!chatSocket || !conversationId) return;

    chatSocket.emit('joinConversation', { conversationId });

    chatSocket.on('newMessage', (message: any) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [message, ...prev]);
      }
    });

    chatSocket.on('userTyping', (data: { userId: number; isTyping: boolean }) => {
      if (data.userId !== user?.id) {
        setTypingUser(data.isTyping ? data.userId : null);
      }
    });

    return () => {
      chatSocket.off('newMessage');
      chatSocket.off('userTyping');
    };
  }, [conversationId, user?.id]);

  const loadMessages = useCallback(async (cid: number, skip = 0) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:3000/chat/messages?conversationId=${cid}&skip=${skip}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (skip === 0) setMessages(data);
      else setMessages((prev) => [...prev, ...data]);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const sendMessage = (content: string) => {
    const chatSocket = getSocket('chat');
    if (chatSocket && conversationId) {
      chatSocket.emit('sendMessage', { conversationId, content });
    }
  };

  const sendTyping = (typing: boolean) => {
    const chatSocket = getSocket('chat');
    if (chatSocket && conversationId) {
      chatSocket.emit('typing', { conversationId, isTyping: typing });
    }
  };

  return {
    messages,
    isLoading,
    typingUser,
    loadMessages,
    sendMessage,
    sendTyping,
  };
};
