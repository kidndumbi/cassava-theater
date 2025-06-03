import { Server } from "socket.io";

let socketIoGlobal: Server | null = null;

export function getSocketIoGlobal(): Server | null {
  return socketIoGlobal;
}

export function setSocketIoGlobal(io: Server): void {
  socketIoGlobal = io;
}