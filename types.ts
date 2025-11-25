export enum AvailabilityStatus {
  OPEN_TO_WORK = "Open to Work",
  MENTORING = "Mentoring",
  HIRING = "Hiring",
  BUSY = "Busy",
  TRAVELING = "Traveling"
}

export enum ConnectionLevel {
  FIRST = "1st",
  SECOND = "2nd",
  THIRD = "3rd",
  NONE = ""
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  coverUrl?: string;
  location: string;
  status: AvailabilityStatus;
  skills: string[];
  interests: string[];
  company?: string;
  stats?: {
    posts: number;
    followers: number;
    following: number;
  };
  // Connection Management
  connections: string[];       // IDs of accepted connections
  sentRequests: string[];      // IDs of users I sent requests to
  receivedRequests: string[];  // IDs of users who sent me requests
  groups: string[];            // IDs of groups joined
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isAiGenerated?: boolean;
  read?: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount?: number;
}

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  timestamp: Date;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  timestamp: Date;
  likes: string[]; // Array of User IDs who liked the post
  comments: Comment[];
  imageUrl?: string;
  groupId?: string; // Optional: if post belongs to a group
}

export interface CalendarEvent {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  startDate: Date;
  location: string;
  isVirtual: boolean;
  attendees: string[]; // User IDs
  likes: string[]; // User IDs
  comments: Comment[];
  imageUrl?: string;
  category: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  category: string;
  members: string[]; // User IDs
  admins: string[]; // User IDs
}