import { io, Socket } from 'socket.io-client';

// WebSocket connection for real-time features
class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
      
      this.socket = io(wsUrl, {
        auth: { token },
        transports: ['websocket'],
        upgrade: false,
        rememberUpgrade: false,
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        this.reconnectAttempts = 0;
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.handleReconnect();
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket:', reason);
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, reconnect manually
          this.connect(token);
        }
      });

      // Set up default event listeners
      this.setupDefaultListeners();
    });
  }

  private setupDefaultListeners() {
    if (!this.socket) return;

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.socket.on('channels', (channels: any[]) => {
      console.log('Available channels:', channels);
    });

    this.socket.on('notification', (notification: any) => {
      console.log('New notification:', notification);
      // Handle notifications (show toast, update UI, etc.)
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms...`);
      setTimeout(() => {
        if (this.socket) {
          this.socket.connect();
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Channel management
  joinChannel(channelId: string) {
    if (this.socket) {
      this.socket.emit('joinChannel', { channelId });
    }
  }

  leaveChannel(channelId: string) {
    if (this.socket) {
      this.socket.emit('leaveChannel', { channelId });
    }
  }

  // Messages
  sendMessage(messageData: {
    channelId: string;
    content: string;
    articleId?: string;
  }) {
    if (this.socket) {
      this.socket.emit('sendMessage', messageData);
    }
  }

  // Reactions
  addReaction(messageId: string, reactionType: string) {
    if (this.socket) {
      this.socket.emit('addReaction', { messageId, reactionType });
    }
  }

  removeReaction(messageId: string, reactionType: string) {
    if (this.socket) {
      this.socket.emit('removeReaction', { messageId, reactionType });
    }
  }

  // Typing indicators
  sendTyping(channelId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('typing', { channelId, isTyping });
    }
  }

  // Event listeners
  onNewMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('newMessage', callback);
    }
  }

  onUserJoined(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('userJoined', callback);
    }
  }

  onUserLeft(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('userLeft', callback);
    }
  }

  onUserTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('userTyping', callback);
    }
  }

  onReactionAdded(callback: (reaction: any) => void) {
    if (this.socket) {
      this.socket.on('reactionAdded', callback);
    }
  }

  onReactionRemoved(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('reactionRemoved', callback);
    }
  }

  onChannelJoined(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('channelJoined', callback);
    }
  }

  onError(callback: (error: any) => void) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  onMessageFlagged(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('messageFlagged', callback);
    }
  }

  // Remove event listeners
  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Get socket instance for advanced usage
  getSocket(): Socket | null {
    return this.socket;
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Create singleton instance
export const socketClient = new SocketClient();

export default socketClient;
