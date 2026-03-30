import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
const URL = 'http://127.0.0.1:3000/notifications';

export const initSocket = (token: string, userId: number | string) => {
  if (socket) {
    return socket;
  }

  socket = io(URL, {
    auth: {
      token,
      userId,
    },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id, 'User:', userId);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
