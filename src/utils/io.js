import { io } from "socket.io-client";
const port = 3000
export const clientIO = io(`http://localhost:${port}`)