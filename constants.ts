import { AvailabilityStatus, UserProfile, Conversation, Post, CalendarEvent, Group } from './types';

export const CURRENT_USER: UserProfile = {
  id: "me",
  name: "Alex Nakachi",
  email: "alex@mindhuddle.com",
  headline: "Senior React Engineer & AI Enthusiast",
  bio: "Passionate about building scalable frontend architectures and integrating LLMs into everyday workflows. Believer in the Ubuntu philosophy of software development: code is better when shared.",
  avatarUrl: "https://picsum.photos/200/200?random=1",
  location: "San Francisco, CA",
  status: AvailabilityStatus.OPEN_TO_WORK,
  skills: ["React", "TypeScript", "Gemini API", "Tailwind", "System Design"],
  interests: ["Artificial Intelligence", "Open Source", "Digital Nomadism"],
  company: "TechFlow Inc.",
  stats: { posts: 12, followers: 842, following: 350 },
  connections: ["u2"],
  sentRequests: [],
  receivedRequests: ["u3"],
  groups: ["g1"]
};

export const MOCK_USERS: UserProfile[] = [
  CURRENT_USER,
  {
    id: "u1",
    name: "Sarah Chen",
    email: "sarah@example.com",
    headline: "Product Manager @ InnovateX | AI Strategist",
    bio: "Driving product vision through data-backed insights. Exploring the intersection of human empathy and artificial intelligence.",
    avatarUrl: "https://picsum.photos/200/200?random=2",
    location: "New York, NY",
    status: AvailabilityStatus.HIRING,
    skills: ["Product Strategy", "User Research", "Agile", "Data Analysis"],
    interests: ["FinTech", "Leadership", "Hiking"],
    company: "InnovateX",
    stats: { posts: 45, followers: 1200, following: 890 },
    connections: [],
    sentRequests: [],
    receivedRequests: [],
    groups: ["g1", "g2"]
  },
  {
    id: "u2",
    name: "Kwame Osei",
    email: "kwame@example.com",
    headline: "Community Builder | Ubuntu Advocate",
    bio: "Building bridges between communities through technology. Specialized in sustainable tech solutions for emerging markets.",
    avatarUrl: "https://picsum.photos/200/200?random=3",
    location: "Accra, Ghana",
    status: AvailabilityStatus.MENTORING,
    skills: ["Community Management", "Public Speaking", "Sustainability", "React Native"],
    interests: ["Social Impact", "Cultural Exchange", "Music"],
    company: "RootsTech",
    stats: { posts: 89, followers: 3400, following: 120 },
    connections: ["me"],
    sentRequests: [],
    receivedRequests: [],
    groups: ["g1", "g3"]
  },
  {
    id: "u3",
    name: "Elena Rodriguez",
    email: "elena@example.com",
    headline: "UX Researcher & Cognitive Scientist",
    bio: "Understanding the 'why' behind user behaviors. Currently traveling and researching digital nomad workflows.",
    avatarUrl: "https://picsum.photos/200/200?random=4",
    location: "Lisbon, Portugal",
    status: AvailabilityStatus.TRAVELING,
    skills: ["UX Research", "Cognitive Science", "Figma", "Accessibility"],
    interests: ["Travel", "Psychology", "Remote Work"],
    company: "Freelance",
    stats: { posts: 23, followers: 560, following: 400 },
    connections: [],
    sentRequests: ["me"],
    receivedRequests: [],
    groups: ["g2"]
  },
  {
    id: "u4",
    name: "David Kim",
    email: "david@example.com",
    headline: "Full Stack Developer | Cloud Architect",
    bio: "Scalable backend systems and intuitive frontends. Obsessed with clean code and cloud infrastructure.",
    avatarUrl: "https://picsum.photos/200/200?random=5",
    location: "Seattle, WA",
    status: AvailabilityStatus.BUSY,
    skills: ["Python", "AWS", "Docker", "Kubernetes"],
    interests: ["Cloud Computing", "Gaming", "Startups"],
    company: "CloudScale",
    stats: { posts: 5, followers: 120, following: 80 },
    connections: [],
    sentRequests: [],
    receivedRequests: [],
    groups: ["g2", "g3"]
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    participantIds: ["me", "u2"],
    messages: [
      { id: "m0", senderId: "me", content: "Hi Kwame, love the work you're doing with RootsTech.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3) },
      { id: "m1", senderId: "u2", content: "Thanks Alex! I really appreciated your insights on the Ubuntu philosophy in tech!", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) }
    ],
    lastMessage: {
      id: "m1",
      senderId: "u2",
      content: "Thanks Alex! I really appreciated your insights on the Ubuntu philosophy in tech!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), 
    },
    unreadCount: 1
  },
  {
    id: "c2",
    participantIds: ["me", "u1"],
    messages: [
       { id: "m2", senderId: "me", content: "Let's schedule a time to discuss the product roadmap.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) }
    ],
    lastMessage: {
      id: "m2",
      senderId: "me",
      content: "Let's schedule a time to discuss the product roadmap.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), 
    },
    unreadCount: 0
  }
];

export const MOCK_GROUPS: Group[] = [
  {
    id: "g1",
    name: "AI Innovators",
    description: "A community for professionals exploring the frontiers of Artificial Intelligence, Machine Learning, and Generative Models. Share insights, research, and applications.",
    imageUrl: "https://picsum.photos/800/400?random=50",
    category: "Technology",
    members: ["me", "u1", "u2"],
    admins: ["u1"]
  },
  {
    id: "g2",
    name: "Digital Nomads Global",
    description: "Connecting remote workers and location-independent professionals from around the world. Tips on visas, coworking spaces, and work-life balance.",
    imageUrl: "https://picsum.photos/800/400?random=51",
    category: "Lifestyle",
    members: ["u1", "u3", "u4"],
    admins: ["u3"]
  },
  {
    id: "g3",
    name: "React Developers",
    description: "The premier group for React.js, Next.js, and React Native developers. Discuss best practices, hooks, state management, and the future of the web.",
    imageUrl: "https://picsum.photos/800/400?random=52",
    category: "Engineering",
    members: ["u2", "u4"],
    admins: ["u4"]
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: "p1",
    authorId: "u1",
    content: "Embracing the spirit of #Ubuntu in tech development means we don't just build for users; we build WITH communities. Had an amazing session today discussing sustainable tech.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    likes: ["me", "u2", "u3"],
    comments: [
      { id: "cm1", authorId: "u2", content: "Absolutely agree! Community-driven development is the future.", timestamp: new Date(Date.now() - 1000 * 60 * 55) }
    ],
    groupId: "g1"
  },
  {
    id: "p2",
    authorId: "u3",
    content: "Just landed in Lisbon! 🇵🇹 Looking to connect with other digital nomads and UX researchers in the area. Let's grab coffee!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    likes: ["u1"],
    comments: [],
    imageUrl: "https://picsum.photos/800/400?random=10",
    groupId: "g2"
  },
  {
    id: "p3",
    authorId: "u2",
    content: "The best way to predict the future is to create it. Working on some exciting new initiatives at RootsTech.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    likes: ["me", "u4"],
    comments: []
  }
];

// Events are set to the future relative to "now"
export const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "e1",
    organizerId: "u1",
    title: "Future of AI in Product Management",
    description: "Join us for a deep dive into how Artificial Intelligence is reshaping the landscape of Product Management. We will cover automated user research, predictive analytics, and ethical considerations.",
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
    location: "Zoom (Virtual)",
    isVirtual: true,
    category: "Technology",
    likes: ["me", "u3"],
    comments: [
       { id: "ec1", authorId: "me", content: "Can't wait for this! The agenda looks packed.", timestamp: new Date(Date.now() - 1000 * 60 * 60) }
    ],
    imageUrl: "https://picsum.photos/800/400?random=20",
    attendees: ["me", "u3", "u4"]
  },
  {
    id: "e2",
    organizerId: "u2",
    title: "Tech Mixer Accra",
    description: "A casual evening of networking, food, and music for the tech community in Accra. Come meet developers, designers, and founders building the next generation of African tech.",
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 60 * 3), // 5 days from now
    location: "Impact Hub, Accra",
    isVirtual: false,
    category: "Networking",
    likes: ["u2", "u1", "u4"],
    comments: [],
    imageUrl: "https://picsum.photos/800/400?random=21",
    attendees: ["u2", "u1"]
  },
  {
    id: "e3",
    organizerId: "u3",
    title: "Cognitive Science & UX Workshop",
    description: "Understand the psychological principles behind user interfaces. This workshop will cover Gestalt principles, cognitive load theory, and accessibility patterns.",
    startDate: new Date(Date.now() + 1000 * 60 * 60 * 12), // 12 hours from now
    location: "Lisbon Cowork Central",
    isVirtual: false,
    category: "Design",
    likes: ["me"],
    comments: [],
    attendees: ["u1", "u4", "u2", "me"]
  }
];