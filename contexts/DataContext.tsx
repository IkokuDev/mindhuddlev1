import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Conversation, Message, Post, CalendarEvent, Group } from '../types';
import { MOCK_USERS, INITIAL_CONVERSATIONS, MOCK_POSTS, MOCK_EVENTS, MOCK_GROUPS } from '../constants';
import { useAuth } from './AuthContext';

interface DataContextType {
  users: UserProfile[];
  conversations: Conversation[];
  posts: Post[];
  events: CalendarEvent[];
  groups: Group[];
  getConversationWithUser: (userId: string) => Conversation | undefined;
  createConversation: (targetUserId: string) => string;
  sendMessage: (conversationId: string, content: string, senderId: string) => void;
  markAsRead: (conversationId: string) => void;
  updateUserInList: (userId: string, updates: Partial<UserProfile>) => void;
  addPost: (content: string, imageUrl?: string, groupId?: string) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  
  // Event Methods
  addEvent: (eventData: Partial<CalendarEvent>) => void;
  updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  toggleEventLike: (eventId: string) => void;
  addEventComment: (eventId: string, content: string) => void;
  toggleEventAttendance: (eventId: string) => void;

  // Connection Methods
  sendConnectionRequest: (targetUserId: string) => void;
  acceptConnectionRequest: (requesterId: string) => void;
  ignoreConnectionRequest: (requesterId: string) => void;
  removeConnection: (targetUserId: string) => void;
  getConnectionStatus: (targetUserId: string) => 'connected' | 'pending_sent' | 'pending_received' | 'none';

  // Group Methods
  createGroup: (name: string, description: string, category: string, imageUrl?: string) => void;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  removeMemberFromGroup: (groupId: string, memberId: string) => void;
  getGroupById: (groupId: string) => Group | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);
  const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS);
  const { user: authUser, updateProfile } = useAuth();

  // Sync auth user changes to the global users list
  useEffect(() => {
    if (authUser) {
      setUsers(prevUsers => {
        const exists = prevUsers.find(u => u.id === authUser.id);
        if (exists) {
            return prevUsers.map(u => u.id === authUser.id ? authUser : u);
        } else {
            // Add auth user if not in list (e.g. after signup)
            return [...prevUsers, authUser];
        }
      });
    }
  }, [authUser]);

  const getConversationWithUser = (targetUserId: string) => {
    return conversations.find(c => c.participantIds.includes(targetUserId) && c.participantIds.includes("me"));
  };

  const createConversation = (targetUserId: string) => {
    // Check if exists first
    const existing = getConversationWithUser(targetUserId);
    if (existing) return existing.id;

    const newId = `c${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      participantIds: ["me", targetUserId],
      messages: [],
      unreadCount: 0
    };
    setConversations(prev => [newConv, ...prev]);
    return newId;
  };

  const sendMessage = (conversationId: string, content: string, senderId: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id !== conversationId) return conv;

      const newMessage: Message = {
        id: Date.now().toString(),
        senderId,
        content,
        timestamp: new Date(),
        read: false
      };

      return {
        ...conv,
        messages: [...conv.messages, newMessage],
        lastMessage: newMessage,
        unreadCount: senderId !== "me" ? (conv.unreadCount || 0) + 1 : conv.unreadCount
      };
    }));
  };

  const markAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id !== conversationId) return conv;
      return { ...conv, unreadCount: 0 };
    }));
  };

  const updateUserInList = (userId: string, updates: Partial<UserProfile>) => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
  };

  const addPost = (content: string, imageUrl?: string, groupId?: string) => {
    if (!authUser) return;
    const newPost: Post = {
        id: `p${Date.now()}`,
        authorId: authUser.id,
        content,
        imageUrl,
        timestamp: new Date(),
        likes: [],
        comments: [],
        groupId
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const toggleLike = (postId: string) => {
      if (!authUser) return;
      setPosts(prev => prev.map(post => {
          if (post.id !== postId) return post;
          const hasLiked = post.likes.includes(authUser.id);
          const newLikes = hasLiked 
            ? post.likes.filter(id => id !== authUser.id)
            : [...post.likes, authUser.id];
          return { ...post, likes: newLikes };
      }));
  };

  const addComment = (postId: string, content: string) => {
      if (!authUser) return;
      const newComment = {
          id: `cm${Date.now()}`,
          authorId: authUser.id,
          content,
          timestamp: new Date()
      };
      setPosts(prev => prev.map(post => {
          if (post.id !== postId) return post;
          return { ...post, comments: [...post.comments, newComment] };
      }));
  };

  // Event Functions
  const addEvent = (eventData: Partial<CalendarEvent>) => {
    if (!authUser) return;
    const newEvent: CalendarEvent = {
        id: `e${Date.now()}`,
        organizerId: authUser.id,
        title: eventData.title || "Untitled Event",
        description: eventData.description || "",
        startDate: eventData.startDate || new Date(),
        location: eventData.location || "TBD",
        isVirtual: !!eventData.isVirtual,
        category: eventData.category || "General",
        likes: [],
        comments: [],
        attendees: [authUser.id], // Organizer attends by default
        imageUrl: eventData.imageUrl
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  const updateEvent = (eventId: string, updates: Partial<CalendarEvent>) => {
    if (!authUser) return;
    setEvents(prev => prev.map(event => {
        if (event.id === eventId && event.organizerId === authUser.id) {
            return { ...event, ...updates };
        }
        return event;
    }));
  };

  const toggleEventLike = (eventId: string) => {
    if (!authUser) return;
    setEvents(prev => prev.map(event => {
        if (event.id !== eventId) return event;
        const hasLiked = event.likes.includes(authUser.id);
        const newLikes = hasLiked 
          ? event.likes.filter(id => id !== authUser.id)
          : [...event.likes, authUser.id];
        return { ...event, likes: newLikes };
    }));
  };

  const addEventComment = (eventId: string, content: string) => {
    if (!authUser) return;
    const newComment = {
        id: `ecm${Date.now()}`,
        authorId: authUser.id,
        content,
        timestamp: new Date()
    };
    setEvents(prev => prev.map(event => {
        if (event.id !== eventId) return event;
        return { ...event, comments: [...event.comments, newComment] };
    }));
  };

  const toggleEventAttendance = (eventId: string) => {
      if (!authUser) return;
      setEvents(prev => prev.map(event => {
          if (event.id !== eventId) return event;
          const isAttending = event.attendees.includes(authUser.id);
          const newAttendees = isAttending 
            ? event.attendees.filter(id => id !== authUser.id)
            : [...event.attendees, authUser.id];
          return { ...event, attendees: newAttendees };
      }));
  };

  // Connection Methods
  const getConnectionStatus = (targetUserId: string) => {
    if (!authUser) return 'none';
    if (authUser.connections.includes(targetUserId)) return 'connected';
    if (authUser.sentRequests.includes(targetUserId)) return 'pending_sent';
    if (authUser.receivedRequests.includes(targetUserId)) return 'pending_received';
    return 'none';
  };

  const sendConnectionRequest = (targetUserId: string) => {
    if (!authUser) return;
    
    // Update Auth User (sender)
    const newSent = [...authUser.sentRequests, targetUserId];
    updateProfile({ sentRequests: newSent });
    
    // Update Target User (receiver) in global state
    setUsers(prev => prev.map(u => {
      if (u.id === targetUserId) {
        return { ...u, receivedRequests: [...u.receivedRequests, authUser.id] };
      }
      return u;
    }));
  };

  const acceptConnectionRequest = (requesterId: string) => {
    if (!authUser) return;

    // Update Auth User (receiver): remove request, add connection
    const newReceived = authUser.receivedRequests.filter(id => id !== requesterId);
    const newConnections = [...authUser.connections, requesterId];
    updateProfile({ receivedRequests: newReceived, connections: newConnections });

    // Update Requester (sender) in global state
    setUsers(prev => prev.map(u => {
      if (u.id === requesterId) {
        return { 
          ...u, 
          sentRequests: u.sentRequests.filter(id => id !== authUser.id),
          connections: [...u.connections, authUser.id]
        };
      }
      return u;
    }));
  };

  const ignoreConnectionRequest = (requesterId: string) => {
    if (!authUser) return;
    
    // Update Auth User (receiver)
    const newReceived = authUser.receivedRequests.filter(id => id !== requesterId);
    updateProfile({ receivedRequests: newReceived });

    // Update Requester (sender)
    setUsers(prev => prev.map(u => {
      if (u.id === requesterId) {
        return { 
          ...u, 
          sentRequests: u.sentRequests.filter(id => id !== authUser.id)
        };
      }
      return u;
    }));
  };

  const removeConnection = (targetUserId: string) => {
    if (!authUser) return;

    // Update Auth User
    const newConnections = authUser.connections.filter(id => id !== targetUserId);
    updateProfile({ connections: newConnections });

    // Update Other User
    setUsers(prev => prev.map(u => {
      if (u.id === targetUserId) {
        return {
          ...u,
          connections: u.connections.filter(id => id !== authUser.id)
        };
      }
      return u;
    }));
  };

  // Group Methods
  const getGroupById = (groupId: string) => {
    return groups.find(g => g.id === groupId);
  };

  const createGroup = (name: string, description: string, category: string, imageUrl?: string) => {
    if (!authUser) return;
    const newGroup: Group = {
      id: `g${Date.now()}`,
      name,
      description,
      category,
      imageUrl,
      members: [authUser.id],
      admins: [authUser.id]
    };
    
    setGroups(prev => [...prev, newGroup]);
    
    // Auto-join auth user
    const currentGroups = authUser.groups || [];
    updateProfile({ groups: [...currentGroups, newGroup.id] });
  };

  const joinGroup = (groupId: string) => {
    if (!authUser) return;
    
    // Update Group Members
    setGroups(prev => prev.map(g => {
      if (g.id === groupId && !g.members.includes(authUser.id)) {
        return { ...g, members: [...g.members, authUser.id] };
      }
      return g;
    }));

    // Update User Profile
    const currentGroups = authUser.groups || [];
    if (!currentGroups.includes(groupId)) {
        updateProfile({ groups: [...currentGroups, groupId] });
    }
  };

  const leaveGroup = (groupId: string) => {
    if (!authUser) return;

    // Update Group Members
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return { ...g, members: g.members.filter(id => id !== authUser.id) };
      }
      return g;
    }));

    // Update User Profile
    const currentGroups = authUser.groups || [];
    updateProfile({ groups: currentGroups.filter(id => id !== groupId) });
  };

  const updateGroup = (groupId: string, updates: Partial<Group>) => {
    if (!authUser) return;
    setGroups(prev => prev.map(g => {
        if (g.id === groupId && g.admins.includes(authUser.id)) {
            return { ...g, ...updates };
        }
        return g;
    }));
  };

  const removeMemberFromGroup = (groupId: string, memberId: string) => {
    if (!authUser) return;
    
    // Update Group
    setGroups(prev => prev.map(g => {
        if (g.id === groupId && g.admins.includes(authUser.id)) {
            return { ...g, members: g.members.filter(id => id !== memberId) };
        }
        return g;
    }));

    // Update User Profile (so they don't see it in "My Groups" anymore)
    setUsers(prev => prev.map(u => {
        if (u.id === memberId) {
            return { ...u, groups: u.groups.filter(gid => gid !== groupId) };
        }
        return u;
    }));
  };

  return (
    <DataContext.Provider value={{ 
        users, 
        conversations, 
        posts,
        events,
        groups,
        getConversationWithUser, 
        createConversation, 
        sendMessage, 
        markAsRead, 
        updateUserInList,
        addPost,
        toggleLike,
        addComment,
        addEvent,
        updateEvent,
        toggleEventLike,
        addEventComment,
        toggleEventAttendance,
        // Connections
        sendConnectionRequest,
        acceptConnectionRequest,
        ignoreConnectionRequest,
        removeConnection,
        getConnectionStatus,
        // Groups
        createGroup,
        joinGroup,
        leaveGroup,
        updateGroup,
        removeMemberFromGroup,
        getGroupById
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
};