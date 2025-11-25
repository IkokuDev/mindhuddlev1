import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { generateIcebreakers } from '../services/geminiService';
import { Send, Sparkles, MoreVertical, Phone, Video, Search, MessageSquare } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const Messages: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');
  
  const { conversations, users, createConversation, sendMessage, markAsRead } = useData();
  const { user: currentUser } = useAuth();
  
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [loadingIcebreakers, setLoadingIcebreakers] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-select chat based on URL or conversations
  useEffect(() => {
    if (targetUserId) {
        // Try to find existing
        const existing = conversations.find(c => c.participantIds.includes(targetUserId));
        if (existing) {
            setSelectedChatId(existing.id);
        } else {
            // Create new if needed (this updates context which triggers re-render)
            const newId = createConversation(targetUserId);
            setSelectedChatId(newId);
        }
        // Clean URL after selection so refresh doesn't reset weirdly? 
        // Or keep it. Keeping it allows bookmarking, but we will keep it simple.
    } else if (!selectedChatId && conversations.length > 0) {
        // Default to first chat
        setSelectedChatId(conversations[0].id);
    }
  }, [targetUserId, conversations]);

  const activeConversation = conversations.find(c => c.id === selectedChatId);
  
  // Find the "other" participant
  const otherParticipantId = activeConversation?.participantIds.find(id => id !== "me");
  const participant = users.find(u => u.id === otherParticipantId);

  // Scroll to bottom
  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  // Mark as read
  useEffect(() => {
      if (selectedChatId) {
          markAsRead(selectedChatId);
      }
  }, [selectedChatId]);

  // Load icebreakers
  useEffect(() => {
    if (participant && currentUser) {
      setLoadingIcebreakers(true);
      generateIcebreakers(currentUser, participant).then(starters => {
        setIcebreakers(starters);
        setLoadingIcebreakers(false);
      });
    }
  }, [participant, currentUser]);

  const handleSendMessage = (text: string = inputText) => {
    if (!text.trim() || !selectedChatId || !currentUser) return;
    sendMessage(selectedChatId, text, "me");
    setInputText("");
  };

  const filteredConversations = conversations.filter(conv => {
      const otherId = conv.participantIds.find(id => id !== "me");
      const user = users.find(u => u.id === otherId);
      return user?.name.toLowerCase().includes(chatSearch.toLowerCase());
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-[calc(100vh-8rem)] flex overflow-hidden">
      
      {/* Sidebar List */}
      <div className={`${selectedChatId ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-slate-200 flex-col`}>
        <div className="p-4 border-b border-slate-200 space-y-3">
            <h2 className="font-bold text-slate-800 text-lg">Messages</h2>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                <input 
                    type="text" 
                    placeholder="Search messages..."
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
            </div>
        </div>
        <div className="overflow-y-auto flex-1">
            {filteredConversations.map(conv => {
                const otherId = conv.participantIds.find(id => id !== "me");
                const user = users.find(u => u.id === otherId);
                if (!user) return null;
                const isSelected = conv.id === selectedChatId;
                
                // Format Time
                const lastTime = conv.lastMessage ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';

                return (
                    <div 
                        key={conv.id}
                        onClick={() => {
                            setSelectedChatId(conv.id);
                            // Clear URL param if user clicks manually
                            setSearchParams({});
                        }}
                        className={`p-4 flex gap-3 cursor-pointer transition-colors border-b border-slate-50 last:border-0 ${isSelected ? 'bg-brand-50 border-l-4 border-l-brand-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
                    >
                        <div className="relative">
                            <img src={user.avatarUrl} className="w-12 h-12 rounded-full object-cover" />
                            {conv.unreadCount ? (
                                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                    {conv.unreadCount}
                                </span>
                            ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-brand-900' : 'text-slate-900'}`}>{user.name}</h3>
                                <span className="text-xs text-slate-400">{lastTime}</span>
                            </div>
                            <p className={`text-xs truncate ${conv.unreadCount ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                                {conv.lastMessage?.content || "Start a conversation"}
                            </p>
                        </div>
                    </div>
                );
            })}
            {filteredConversations.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">
                    No conversations found.
                </div>
            )}
        </div>
      </div>

      {/* Chat Window */}
      {activeConversation && participant ? (
          <div className={`${!selectedChatId ? 'hidden md:flex' : 'flex'} flex-col flex-1 bg-slate-50/50 w-full`}>
            {/* Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <button 
                        className="md:hidden text-slate-500 mr-2"
                        onClick={() => setSelectedChatId(null)}
                    >
                        &larr;
                    </button>
                    <img src={participant.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                        <h3 className="font-bold text-slate-900">{participant.name}</h3>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-xs text-slate-500">{participant.headline}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                    <Phone size={20} className="hover:text-slate-600 cursor-pointer"/>
                    <Video size={20} className="hover:text-slate-600 cursor-pointer"/>
                    <MoreVertical size={20} className="hover:text-slate-600 cursor-pointer"/>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {activeConversation.messages.map((msg) => {
                    const isMe = msg.senderId === "me";
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                isMe 
                                ? 'bg-brand-600 text-white rounded-br-none' 
                                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* AI Icebreakers Area */}
            {activeConversation.messages.length < 5 && icebreakers.length > 0 && (
                <div className="px-6 py-2">
                    <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={10} /> AI Suggestions
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        {loadingIcebreakers ? (
                            <span className="text-xs text-slate-400 italic">Thinking...</span>
                        ) : (
                            icebreakers.map((starter, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleSendMessage(starter)}
                                    className="whitespace-nowrap flex-shrink-0 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-indigo-100 text-indigo-700 text-xs rounded-full hover:shadow-sm hover:border-indigo-200 transition-all"
                                >
                                    {starter}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex items-center gap-2">
                    <input 
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Write a message..."
                        className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-brand-500 border rounded-full px-4 py-3 text-sm text-slate-900 focus:outline-none transition-all"
                    />
                    <button 
                        onClick={() => handleSendMessage()}
                        disabled={!inputText.trim()}
                        className="bg-brand-600 text-white p-3 rounded-full hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>

          </div>
      ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-50 text-slate-400">
              <MessageSquare size={48} className="mb-4 text-slate-300" />
              <p>Select a conversation to start messaging</p>
          </div>
      )}
    </div>
  );
};

export default Messages;