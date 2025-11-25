import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { AvailabilityStatus } from '../types';
import PostCard from '../components/PostCard';
import EventCard from '../components/EventCard';
import { MapPin, Briefcase, Activity, User as UserIcon, Calendar, MessageCircle, Plus, Clock, UserPlus, Sparkles } from 'lucide-react';
import { analyzeCompatibility } from '../services/geminiService';
import { CURRENT_USER } from '../constants';

const PublicProfile: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { users, posts, events, getConnectionStatus, sendConnectionRequest } = useData();
  const { user: currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'about' | 'activity' | 'events'>('about');
  const [matchData, setMatchData] = useState<{ score: number; reason: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const profile = users.find(u => u.id === userId);

  if (!profile) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
              <UserIcon size={48} className="mb-4 text-slate-300" />
              <p className="text-lg font-medium">User not found</p>
              <button onClick={() => navigate(-1)} className="mt-4 text-brand-600 hover:underline">Go Back</button>
          </div>
      );
  }

  const userPosts = posts.filter(p => p.authorId === profile.id);
  const userEvents = events.filter(e => e.organizerId === profile.id);
  const isMe = currentUser?.id === profile.id;
  const connectionStatus = getConnectionStatus(profile.id);

  // Analyze Compatibility Logic
  const handleAnalyze = async () => {
    if (matchData) return;
    setIsAnalyzing(true);
    const result = await analyzeCompatibility(CURRENT_USER, profile);
    setMatchData(result);
    setIsAnalyzing(false);
  };

  const getStatusColor = (status: AvailabilityStatus) => {
    switch (status) {
      case AvailabilityStatus.HIRING: return "bg-purple-100 text-purple-700 border-purple-200";
      case AvailabilityStatus.OPEN_TO_WORK: return "bg-green-100 text-green-700 border-green-200";
      case AvailabilityStatus.MENTORING: return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const renderActionButton = () => {
      if (isMe) return null;

      switch (connectionStatus) {
          case 'connected':
              return (
                  <button 
                      onClick={() => navigate(`/messages?userId=${profile.id}`)}
                      className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                  >
                      <MessageCircle size={18} /> Message
                  </button>
              );
          case 'pending_sent':
              return (
                  <button 
                      disabled
                      className="px-6 py-2 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg font-medium flex items-center gap-2 cursor-default"
                  >
                      <Clock size={18} /> Pending
                  </button>
              );
          case 'pending_received':
              return (
                  <button 
                      onClick={() => navigate('/connections')}
                      className="px-6 py-2 bg-brand-100 text-brand-700 hover:bg-brand-200 border border-brand-200 rounded-lg font-medium flex items-center gap-2"
                  >
                      <UserPlus size={18} /> Respond
                  </button>
              );
          default:
              return (
                  <button 
                      onClick={() => sendConnectionRequest(profile.id)}
                      className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                  >
                      <Plus size={18} /> Connect
                  </button>
              );
      }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* --- HEADER SECTION --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-48 bg-slate-200 relative">
            {profile.coverUrl ? (
                <img src={profile.coverUrl} className="w-full h-full object-cover" alt="Cover" />
            ) : (
                <div className="w-full h-full bg-gradient-to-r from-brand-700 to-teal-600"></div>
            )}
        </div>
        
        <div className="px-8 pb-8">
            <div className="relative mb-4 flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="-mt-20 relative">
                    <img 
                        src={profile.avatarUrl} 
                        alt={profile.name} 
                        className="w-40 h-40 rounded-full border-4 border-white object-cover shadow-md bg-white" 
                    />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mb-2 w-full md:w-auto">
                    {/* AI Match Button */}
                    {!isMe && (
                        matchData ? (
                            <div className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg flex items-center gap-3">
                                <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                                    <Sparkles size={14} /> Match: {matchData.score}%
                                </span>
                                <span className="text-[10px] text-indigo-600 max-w-[150px] leading-tight truncate">
                                    {matchData.reason}
                                </span>
                            </div>
                        ) : (
                             <button 
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                             >
                                <Sparkles size={16} /> 
                                {isAnalyzing ? 'Analyzing...' : 'Analyze Match'}
                             </button>
                        )
                    )}

                    {renderActionButton()}
                </div>
            </div>

            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    {profile.name}
                    {!isMe && connectionStatus === 'connected' && (
                        <span className="text-xs font-medium bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full border border-brand-200">
                            1st
                        </span>
                    )}
                </h1>
                <p className="text-lg text-slate-600 font-medium mt-1">{profile.headline}</p>
                
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><MapPin size={16}/> {profile.location}</span>
                    {profile.company && <span className="flex items-center gap-1"><Briefcase size={16}/> {profile.company}</span>}
                </div>
                
                <div className="mt-4 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(profile.status)}`}>
                        {profile.status}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                        {profile.stats?.followers || 0} Connections
                    </span>
                </div>
            </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex border-t border-slate-200 px-8">
            <button 
                onClick={() => setActiveTab('about')}
                className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'about' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
                <UserIcon size={16} /> About
            </button>
            <button 
                onClick={() => setActiveTab('activity')}
                className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'activity' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
                <Activity size={16} /> Activity
            </button>
            <button 
                onClick={() => setActiveTab('events')}
                className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'events' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
                <Calendar size={16} /> Hosted Events
            </button>
        </div>
      </div>

      {/* --- TAB CONTENT --- */}
      {activeTab === 'about' && (
        <>
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">About</h2>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {profile.bio || "No bio available."}
                </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Skills & Expertise</h2>
                <div className="flex flex-wrap gap-2">
                    {profile.skills.length > 0 ? (
                        profile.skills.map(skill => (
                            <div key={skill} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-50 text-slate-700 border border-slate-100">
                                {skill}
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500 text-sm italic">No skills listed.</p>
                    )}
                </div>
            </div>
        </>
      )}

      {activeTab === 'activity' && (
          <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
              {userPosts.length > 0 ? (
                  userPosts.map(post => <PostCard key={post.id} post={post} />)
              ) : (
                  <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                      {profile.name} hasn't posted anything yet.
                  </div>
              )}
          </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Events Hosted by {profile.name}</h2>
            {userEvents.length > 0 ? (
                userEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                ))
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Calendar size={24} />
                    </div>
                    <h3 className="text-slate-900 font-medium">No events hosted yet</h3>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default PublicProfile;