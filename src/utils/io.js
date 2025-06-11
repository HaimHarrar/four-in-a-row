import { io } from "socket.io-client";

export const clientIO = io(import.meta.env.VITE_SERVER_URL)