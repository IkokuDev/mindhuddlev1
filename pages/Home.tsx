import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import ProfileCard from '../components/ProfileCard';
import PostCard from '../components/PostCard';
import { Camera, Video, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { posts, addPost, users } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [postContent, setPostContent] = useState("");

  const handlePostSubmit = () => {
      if (postContent.trim()) {
          addPost(postContent);
          setPostContent("");
      }
  };

  // Filter out self from recommendations
  const recommendations = users.filter(u => u.id !== user?.id).slice(0, 3);

  // Feed Logic: Show public posts OR posts from groups the user is in
  const feedPosts = useMemo(() => {
    return posts.filter(post => {
        // Public posts (no group)
        if (!post.groupId) return true;
        // Group posts (only if user is member)
        return user?.groups?.includes(post.groupId);
    });
  }, [posts, user]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Sidebar - Profile Summary (Hidden on Mobile) */}
      <div className="hidden lg:block lg:col-span-3 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm sticky top-24">
            <div className="flex flex-col items-center text-center mb-4">
                 <img src={user?.avatarUrl} className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-slate-100" />
                 <h2 className="font-bold text-slate-800">{user?.name}</h2>
                 <p className="text-xs text-slate-500">{user?.headline}</p>
            </div>
            
            <div className="h-px bg-slate-100 my-4"></div>
            
            <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                    <span>Profile Views</span>
                    <span className="font-semibold text-brand-600">142</span>
                </div>
                <div className="flex justify-between text-slate-600">
                    <span>Post Impressions</span>
                    <span className="font-semibold text-brand-600">1.2k</span>
                </div>
                <div className="h-px bg-slate-100 my-2"></div>
                <div 
                    onClick={() => navigate('/groups')}
                    className="font-medium text-slate-900 hover:text-brand-600 cursor-pointer flex justify-between items-center group"
                >
                    My Groups 
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="font-medium text-slate-900 hover:text-brand-600 cursor-pointer">Saved Items</div>
                <div onClick={() => navigate('/events')} className="font-medium text-slate-900 hover:text-brand-600 cursor-pointer">Events</div>
            </div>
        </div>
      </div>

      {/* Center Feed */}
      <div className="col-span-1 lg:col-span-6 space-y-6">
        {/* Create Post Input */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden">
                    <img src={user?.avatarUrl} className="w-full h-full object-cover"/>
                </div>
                <input 
                    type="text" 
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePostSubmit()}
                    placeholder="Share an insight, project, or update..." 
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 text-sm text-slate-900 focus:outline-none focus:border-brand-500 transition-colors"
                />
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50 px-2">
                <div className="flex gap-4">
                    <button className="flex items-center gap-1.5 text-slate-500 hover:text-brand-600 text-xs font-medium transition-colors">
                        <Camera size={16} /> Photo
                    </button>
                    <button className="flex items-center gap-1.5 text-slate-500 hover:text-brand-600 text-xs font-medium transition-colors">
                        <Video size={16} /> Video
                    </button>
                    <button className="flex items-center gap-1.5 text-slate-500 hover:text-brand-600 text-xs font-medium transition-colors">
                        <Calendar size={16} /> Event
                    </button>
                </div>
                <button 
                    onClick={handlePostSubmit}
                    disabled={!postContent.trim()}
                    className="bg-brand-600 text-white px-5 py-1.5 rounded-full text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
                >
                    Post
                </button>
            </div>
        </div>

        {/* Dynamic Posts */}
        <div>
            {feedPosts.map(post => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
      </div>

      {/* Right Sidebar - Suggestions */}
      <div className="hidden lg:block lg:col-span-3 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm sticky top-24">
            <h2 className="font-bold text-slate-800 mb-4 text-sm">People you might know</h2>
            <div className="space-y-4">
                {recommendations.map(user => (
                    <ProfileCard key={user.id} profile={user} compact />
                ))}
            </div>
            <button className="w-full mt-4 text-center text-sm text-brand-600 hover:text-brand-700 font-medium">
                View all recommendations
            </button>
        </div>
      </div>

    </div>
  );
};

export default Home;