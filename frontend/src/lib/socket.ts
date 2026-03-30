import { io, Socket } from 'socket.io-client';

const BASE_URL = 'http://127.0.0.1:3000';

const sockets: { [key: string]: Socket } = {};

export const initSocket = (namespace: string, token: string, userId: number | string) => {
  if (sockets[namespace]) {
    return sockets[namespace];
  }

  const socket = io(`${BASE_URL}/${namespace}`, {
    auth: {
      token,
      userId,
    },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log(`Socket [${namespace}] connected:`, socket.id, 'User:', userId);
  });

  socket.on('disconnect', () => {
    console.log(`Socket [${namespace}] disconnected`);
  });

  sockets[namespace] = socket;
  return socket;
};

export const getSocket = (namespace: string) => sockets[namespace];

export const disconnectSocket = (namespace: string) => {
  if (sockets[namespace]) {
    sockets[namespace].disconnect();
    delete sockets[namespace];
  }
};

export const disconnectAllSockets = () => {
  Object.keys(sockets).forEach((ns) => {
    sockets[ns].disconnect();
    delete sockets[ns];
  });
};
