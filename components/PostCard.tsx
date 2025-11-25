import React, { useState } from 'react';
import { Post } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { users, groups, toggleLike, addComment } = useData();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const author = users.find(u => u.id === post.authorId);
  const group = post.groupId ? groups.find(g => g.id === post.groupId) : null;
  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;

  const handleLike = () => {
      toggleLike(post.id);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (commentText.trim()) {
          addComment(post.id, commentText);
          setCommentText("");
      }
  };

  const timeAgo = (date: Date) => {
      const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + "y";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + "mo";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + "d";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + "h";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + "m";
      return "now";
  };

  if (!author) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6 hover:shadow-md transition-shadow">
        {/* Context Header (e.g. Group) */}
        {group && (
            <div 
                className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => navigate(`/groups/${group.id}`)}
            >
                <div className="p-1 bg-brand-100 rounded-md text-brand-600">
                    <Users size={12} />
                </div>
                <span className="text-xs font-semibold text-slate-600">
                    Posted in <span className="text-slate-900 hover:text-brand-600">{group.name}</span>
                </span>
            </div>
        )}

        <div className="p-4 flex gap-3 items-start">
             <img 
                src={author.avatarUrl} 
                alt={author.name} 
                className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80"
                onClick={() => navigate(`/profile/${author.id}`)}
             />
             <div className="flex-1 min-w-0">
                 <div className="flex justify-between items-start">
                     <div>
                         <h3 
                            className="font-bold text-slate-900 text-sm truncate cursor-pointer hover:underline"
                            onClick={() => navigate(`/profile/${author.id}`)}
                         >
                            {author.name}
                         </h3>
                         <p className="text-xs text-slate-500 truncate">{author.headline}</p>
                         <p className="text-xs text-slate-400 mt-0.5">{timeAgo(post.timestamp)}</p>
                     </div>
                     <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={18} /></button>
                 </div>
                 <div className="mt-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                     {post.content}
                 </div>
             </div>
        </div>
        
        {post.imageUrl && (
            <img src={post.imageUrl} alt="Post content" className="w-full h-auto max-h-96 object-cover bg-slate-100" />
        )}

        <div className="bg-white px-4 py-3 border-t border-slate-100 flex justify-between items-center">
            <div className="flex gap-6">
                <button 
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 transition-colors text-sm font-medium ${isLiked ? 'text-rose-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Heart size={18} fill={isLiked ? "currentColor" : "none"} /> 
                    <span>{post.likes.length}</span>
                </button>
                <button 
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-1.5 transition-colors text-sm font-medium ${showComments ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <MessageCircle size={18} /> 
                    <span>{post.comments.length}</span>
                </button>
            </div>
            <button className="text-slate-500 hover:text-slate-800 transition-colors">
                <Share2 size={18} />
            </button>
        </div>

        {/* Comments Section */}
        {showComments && (
            <div className="bg-slate-50 border-t border-slate-100 p-4 animate-in fade-in slide-in-from-top-2">
                
                {/* Comment List */}
                <div className="space-y-4 mb-4">
                    {post.comments.map(comment => {
                        const commentAuthor = users.find(u => u.id === comment.authorId);
                        if (!commentAuthor) return null;
                        return (
                            <div key={comment.id} className="flex gap-3">
                                <img src={commentAuthor.avatarUrl} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-2 flex-1 shadow-sm">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-xs font-bold text-slate-900">{commentAuthor.name}</span>
                                        <span className="text-[10px] text-slate-400">{timeAgo(comment.timestamp)}</span>
                                    </div>
                                    <p className="text-xs text-slate-700">{comment.content}</p>
                                </div>
                            </div>
                        );
                    })}
                    {post.comments.length === 0 && (
                        <p className="text-center text-xs text-slate-400 py-2">No comments yet. Be the first!</p>
                    )}
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handleSubmitComment} className="flex gap-2">
                    <img src={currentUser?.avatarUrl || "https://picsum.photos/200"} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-1 relative">
                        <input 
                            type="text" 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..." 
                            className="w-full bg-white border border-slate-300 rounded-full pl-4 pr-10 py-1.5 text-sm focus:outline-none focus:border-brand-500"
                        />
                        <button 
                            type="submit" 
                            disabled={!commentText.trim()}
                            className="absolute right-1.5 top-1.5 p-1 text-brand-600 hover:bg-brand-50 rounded-full disabled:opacity-50"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </form>
            </div>
        )}
    </div>
  );
};

export default PostCard;