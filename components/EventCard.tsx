import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, Video, Heart, MessageCircle, Send, Users, Clock, Star, X, Edit2, Save } from 'lucide-react';
import ProfileCard from './ProfileCard';

interface EventCardProps {
  event: CalendarEvent;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { users, toggleEventLike, addEventComment, toggleEventAttendance, updateEvent } = useData();
  const { user: currentUser } = useAuth();
  
  const [showComments, setShowComments] = useState(false);
  const [showHostModal, setShowHostModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [timeLeft, setTimeLeft] = useState("");

  const organizer = users.find(u => u.id === event.organizerId);
  const isLiked = currentUser ? event.likes.includes(currentUser.id) : false;
  const isAttending = currentUser ? event.attendees.includes(currentUser.id) : false;
  const isOrganizer = currentUser?.id === event.organizerId;

  // Initialize Edit Form
  const [editForm, setEditForm] = useState({
      title: event.title,
      description: event.description,
      date: new Date(event.startDate).toISOString().split('T')[0],
      time: new Date(event.startDate).toTimeString().slice(0, 5),
      location: event.location,
      isVirtual: event.isVirtual,
      category: event.category
  });

  // Countdown Timer Logic
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(event.startDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        
        if (days > 0) return `${days}d ${hours}h left`;
        return `${hours}h ${minutes}m left`;
      } else {
        return "Started";
      }
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [event.startDate]);

  const handleLike = () => {
    toggleEventLike(event.id);
  };

  const handleAttend = () => {
      if (!isAttending) {
          // If turning ON interest, show the host profile
          setShowHostModal(true);
      }
      toggleEventAttendance(event.id);
  }

  const handleSubmitComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (commentText.trim()) {
          addEventComment(event.id, commentText);
          setCommentText("");
      }
  };

  const handleUpdateEvent = (e: React.FormEvent) => {
      e.preventDefault();
      const startDateTime = new Date(`${editForm.date}T${editForm.time}`);
      updateEvent(event.id, {
          title: editForm.title,
          description: editForm.description,
          startDate: startDateTime,
          location: editForm.location,
          isVirtual: editForm.isVirtual,
          category: editForm.category
      });
      setShowEditModal(false);
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 3600) return Math.floor(seconds/60) + "m";
    if (seconds < 86400) return Math.floor(seconds/3600) + "h";
    return Math.floor(seconds/86400) + "d";
  };

  if (!organizer) return null;

  const eventDate = new Date(event.startDate).toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric'
  });
  const eventTime = new Date(event.startDate).toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit'
  });

  // Get attendee profiles for display
  const recentAttendees = event.attendees
    .map(id => users.find(u => u.id === id))
    .filter(u => u !== undefined)
    .slice(0, 3);

  return (
    <>
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6 flex flex-col hover:border-brand-200 transition-colors relative group/card">
        
        {/* Cover Image or Gradient */}
        <div className="h-40 bg-slate-200 relative">
            {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-gradient-to-r from-teal-500 to-brand-600"></div>
            )}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-700 shadow-sm flex items-center gap-1.5">
                <Clock size={12} /> {timeLeft}
            </div>
            
            {/* Edit Button for Organizer */}
            {isOrganizer && (
                 <button 
                    onClick={() => setShowEditModal(true)}
                    className="absolute top-4 left-4 bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full shadow-sm backdrop-blur-sm transition-all"
                    title="Edit Event"
                 >
                     <Edit2 size={16} />
                 </button>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                 <span className="text-white text-xs font-medium px-2 py-1 bg-black/30 backdrop-blur-md rounded-md">
                    {event.category}
                 </span>
            </div>
        </div>

        <div className="p-5">
            {/* Header: Date Badge + Title */}
            <div className="flex gap-4">
                <div className="flex flex-col items-center bg-slate-100 rounded-lg p-2 h-fit min-w-[3.5rem] border border-slate-200">
                    <span className="text-xs font-bold text-red-600 uppercase">{new Date(event.startDate).toLocaleDateString(undefined, { month: 'short' })}</span>
                    <span className="text-xl font-bold text-slate-900">{new Date(event.startDate).getDate()}</span>
                </div>
                
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{event.title}</h3>
                    <div className="text-sm text-slate-600 font-medium mb-1">{eventDate} • {eventTime}</div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                            {event.isVirtual ? <Video size={14} /> : <MapPin size={14} />} 
                            {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                            <Users size={14} /> {event.attendees.length} interested
                        </span>
                    </div>
                </div>
            </div>

            <p className="mt-4 text-sm text-slate-600 leading-relaxed line-clamp-3">
                {event.description}
            </p>

            {/* Attendees Preview */}
            {recentAttendees.length > 0 && (
                 <div className="mt-4 flex items-center gap-2">
                    <div className="flex -space-x-2 overflow-hidden">
                        {recentAttendees.map((u, i) => (
                            <img key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover" src={u?.avatarUrl} alt={u?.name}/>
                        ))}
                    </div>
                    <span className="text-xs text-slate-400">
                        {event.attendees.length > 3 ? `+${event.attendees.length - 3} others` : 'are interested'}
                    </span>
                 </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button 
                    onClick={() => setShowHostModal(true)}
                    className="flex items-center gap-2 group"
                >
                    <img src={organizer.avatarUrl} className="w-6 h-6 rounded-full object-cover group-hover:ring-2 ring-brand-200 transition-all" alt={organizer.name} />
                    <span className="text-xs text-slate-500 group-hover:text-brand-600 transition-colors">Hosted by <span className="font-medium text-slate-800 group-hover:text-brand-700">{organizer.name}</span></span>
                </button>
                <button 
                    onClick={handleAttend}
                    className={`text-sm px-4 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
                        isAttending 
                        ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                >
                    <Star size={14} fill={isAttending ? "currentColor" : "none"} />
                    {isAttending ? 'Interested' : 'Interested?'}
                </button>
            </div>
        </div>

        {/* Social Actions */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-between items-center">
             <div className="flex gap-6">
                <button 
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 transition-colors text-sm font-medium ${isLiked ? 'text-rose-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Heart size={18} fill={isLiked ? "currentColor" : "none"} /> 
                    <span>{event.likes.length}</span>
                </button>
                <button 
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-1.5 transition-colors text-sm font-medium ${showComments ? 'text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <MessageCircle size={18} /> 
                    <span>{event.comments.length}</span>
                </button>
            </div>
        </div>

        {/* Comments Section */}
        {showComments && (
            <div className="bg-slate-50 border-t border-slate-100 p-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                    {event.comments.map(comment => {
                        const commentAuthor = users.find(u => u.id === comment.authorId);
                        if (!commentAuthor) return null;
                        return (
                            <div key={comment.id} className="flex gap-3">
                                <img src={commentAuthor.avatarUrl} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-3 py-2 flex-1 shadow-sm">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <span className="text-xs font-bold text-slate-900">{commentAuthor.name}</span>
                                        <span className="text-[10px] text-slate-400">{timeAgo(comment.timestamp)}</span>
                                    </div>
                                    <p className="text-xs text-slate-700">{comment.content}</p>
                                </div>
                            </div>
                        );
                    })}
                    {event.comments.length === 0 && (
                         <p className="text-center text-xs text-slate-400 py-2">Start the buzz! Be the first to comment.</p>
                    )}
                </div>

                <form onSubmit={handleSubmitComment} className="flex gap-2">
                    <img src={currentUser?.avatarUrl || "https://picsum.photos/200"} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    <div className="flex-1 relative">
                        <input 
                            type="text" 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment to generate buzz..." 
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

    {/* Host Profile Modal */}
    {showHostModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm animate-in zoom-in-95">
                <button 
                    onClick={() => setShowHostModal(false)}
                    className="absolute -top-10 right-0 text-white hover:text-slate-200"
                >
                    <X size={24} />
                </button>
                <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                        <h3 className="text-center font-bold text-slate-800">Event Organizer</h3>
                        <p className="text-center text-xs text-slate-500">Connect with the person behind the event</p>
                    </div>
                    <ProfileCard profile={organizer} />
                </div>
            </div>
        </div>
    )}

    {/* Edit Event Modal */}
    {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Edit Event</h3>
                    <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleUpdateEvent} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
                        <input 
                            type="text" 
                            required
                            value={editForm.title}
                            onChange={e => setEditForm({...editForm, title: e.target.value})}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                            <input 
                                type="date" 
                                required
                                value={editForm.date}
                                onChange={e => setEditForm({...editForm, date: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                            <input 
                                type="time" 
                                required
                                value={editForm.time}
                                onChange={e => setEditForm({...editForm, time: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Location / Link</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                required
                                value={editForm.location}
                                onChange={e => setEditForm({...editForm, location: e.target.value})}
                                className="w-full pl-9 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox"
                            id="editIsVirtual"
                            checked={editForm.isVirtual}
                            onChange={e => setEditForm({...editForm, isVirtual: e.target.checked})}
                            className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 border-gray-300"
                        />
                        <label htmlFor="editIsVirtual" className="text-sm text-slate-700">This is a virtual event</label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <select 
                            value={editForm.category}
                            onChange={e => setEditForm({...editForm, category: e.target.value})}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                        >
                            <option>General</option>
                            <option>Technology</option>
                            <option>Design</option>
                            <option>Networking</option>
                            <option>Workshop</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                        <textarea 
                            required
                            value={editForm.description}
                            onChange={e => setEditForm({...editForm, description: e.target.value})}
                            className="w-full h-24 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={() => setShowEditModal(false)}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-brand-600 text-white font-medium hover:bg-brand-700 rounded-lg flex items-center gap-2"
                        >
                            <Save size={18} /> Update Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )}
    </>
  );
};

export default EventCard;