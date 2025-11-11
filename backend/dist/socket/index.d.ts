/**
 * Socket.IO Server Configuration
 * Handles real-time chat functionality for project workspaces
 */
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from './types';
export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
/**
 * Initialize Socket.IO server with Express HTTP server
 */
export declare function initializeSocket(httpServer: HttpServer): TypedServer;
/**
 * Get Socket.IO server instance
 */
export declare function getIO(): TypedServer;
/**
 * Emit message deletion event
 * Called from REST API when a message is deleted
 */
export declare function emitMessageDeleted(messageId: string, projectId: string): void;
//# sourceMappingURL=index.d.ts.map