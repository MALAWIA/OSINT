'use client';

import { useState, useEffect, useRef } from 'react';
import api, { Message, DiscussionChannel } from '@/lib/api';
import { socketClient } from '@/lib/socket';
import { authManager } from '@/lib/auth';

interface ChatInterfaceProps {
  channelId?: string;
}

export default function ChatInterface({ channelId: initialChannelId }: ChatInterfaceProps) {
  const [channels, setChannels] = useState<DiscussionChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(initialChannelId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Get available channels
        const channelsData = await api.getChannels();
        setChannels(channelsData);

        // Connect to WebSocket
        const token = authManager.getToken();
        if (token) {
          const socket = await socketClient.connect(token);
          setIsConnected(true);

          // Set up event listeners
          setupSocketListeners(socket);

          // Join initial channel if provided
          if (initialChannelId) {
            joinChannel(initialChannelId);
          } else if (channelsData.length > 0) {
            joinChannel(channelsData[0].id);
          }
        }
      } catch (error) {
        console.error('Chat initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();

    return () => {
      socketClient.disconnect();
    };
  }, [initialChannelId]);

  const setupSocketListeners = (socket: any) => {
    socketClient.onNewMessage((message: Message) => {
      if (message.channelId === selectedChannel) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    });

    socketClient.onUserJoined((data: any) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(data.userId);
        return newSet;
      });
    });

    socketClient.onUserLeft((data: any) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    socketClient.onUserTyping((data: any) => {
      if (data.channelId === selectedChannel) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.username);
          } else {
            newSet.delete(data.username);
          }
          return newSet;
        });

        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.username);
            return newSet;
          });
        }, 3000);
      }
    });

    socketClient.onReactionAdded((reaction: any) => {
      if (selectedChannel) {
        setMessages(prev => prev.map(msg => 
          msg.id === reaction.messageId 
            ? { ...msg, reactions: [...(msg.reactions || []), reaction] }
            : msg
        ));
      }
    });

    socketClient.onReactionRemoved((data: any) => {
      if (selectedChannel) {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId 
            ? { 
                ...msg, 
                reactions: (msg.reactions || []).filter(
                  r => !(r.userId === data.userId && r.reactionType === data.reactionType)
                )
              }
            : msg
        ));
      }
    });
  };

  const joinChannel = async (channelId: string) => {
    try {
      setSelectedChannel(channelId);
      socketClient.joinChannel(channelId);

      // Load channel messages
      const messagesData = await api.getChannelMessages(channelId, { limit: 50 });
      setMessages(messagesData);
      scrollToBottom();
    } catch (error) {
      console.error('Error joining channel:', error);
    }
  };

  const leaveChannel = () => {
    if (selectedChannel) {
      socketClient.leaveChannel(selectedChannel);
      setSelectedChannel(null);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel) return;

    try {
      await api.createMessage({
        channelId: selectedChannel,
        content: newMessage.trim(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (selectedChannel) {
      socketClient.sendTyping(selectedChannel, isTyping);
    }
  };

  const addReaction = async (messageId: string, reactionType: string) => {
    try {
      await api.addReaction(messageId, reactionType);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const removeReaction = async (messageId: string, reactionType: string) => {
    try {
      await api.removeReaction(messageId, reactionType);
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getReactionEmoji = (type: string) => {
    const reactions: Record<string, string> = {
      like: '👍',
      dislike: '👎',
      agree: '🤝',
      disagree: '🤷',
      insightful: '💡',
    };
    return reactions[type] || '👍';
  };

  const currentChannel = channels.find(c => c.id === selectedChannel);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      {/* Channel Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">
              {currentChannel?.name || 'Select a channel'}
            </h3>
            <p className="text-sm text-gray-500">
              {currentChannel?.description}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              {onlineUsers.size} online
            </div>
            <select
              value={selectedChannel || ''}
              onChange={(e) => joinChannel(e.target.value)}
              className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select channel...</option>
              {channels.map(channel => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {message.user.displayName?.[0] || message.user.username[0]}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {message.user.displayName || message.user.username}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(message.createdAt)}
                </span>
                {message.isEdited && (
                  <span className="text-xs text-gray-400">(edited)</span>
                )}
              </div>
              <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                {message.content}
              </div>
              
              {/* Reactions */}
              {message.reactions && message.reactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(
                    message.reactions.reduce((acc, reaction) => {
                      const key = reaction.reactionType;
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(reaction);
                      return acc;
                    }, {} as Record<string, any[]>)
                  ).map(([type, reactions]) => (
                    <button
                      key={type}
                      onClick={() => {
                        const userReaction = reactions.find(r => r.userId === authManager.getCurrentUser()?.id);
                        if (userReaction) {
                          removeReaction(message.id, type);
                        } else {
                          addReaction(message.id, type);
                        }
                      }}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${
                        reactions.some(r => r.userId === authManager.getCurrentUser()?.id)
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="mr-1">{getReactionEmoji(type)}</span>
                      {reactions.length}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="text-sm text-gray-500 italic">
            {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-end space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => handleTyping(true)}
            onBlur={() => handleTyping(false)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={!selectedChannel || !isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !selectedChannel || !isConnected}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        {!isConnected && (
          <p className="text-xs text-red-500 mt-2">Disconnected from chat server</p>
        )}
      </div>
    </div>
  );
}
