import React, { useState } from 'react';
import { UserProfile, AvailabilityStatus } from '../types';
import { MapPin, Plus, MessageCircle, Sparkles, Clock, UserPlus } from 'lucide-react';
import { analyzeCompatibility } from '../services/geminiService';
import { CURRENT_USER } from '../constants';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';

interface ProfileCardProps {
  profile: UserProfile;
  compact?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, compact = false }) => {
  const [matchData, setMatchData] = useState<{ score: number; reason: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { getConnectionStatus, sendConnectionRequest } = useData();

  const connectionStatus = getConnectionStatus(profile.id);

  const getStatusColor = (status: AvailabilityStatus) => {
    switch (status) {
      case AvailabilityStatus.HIRING: return "bg-purple-100 text-purple-700 border-purple-200";
      case AvailabilityStatus.OPEN_TO_WORK: return "bg-green-100 text-green-700 border-green-200";
      case AvailabilityStatus.MENTORING: return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const handleAnalyze = async () => {
    if (matchData) return;
    setIsLoading(true);
    const result = await analyzeCompatibility(CURRENT_USER, profile);
    setMatchData(result);
    setIsLoading(false);
  };

  const handleConnectClick = () => {
    if (connectionStatus === 'connected') {
        navigate(`/messages?userId=${profile.id}`);
    } else if (connectionStatus === 'none') {
        sendConnectionRequest(profile.id);
    }
    // If pending, we usually disable the button or show 'Pending' state which is handled in render
  };

  const navigateToProfile = () => {
      navigate(`/profile/${profile.id}`);
  };

  const renderActionButton = () => {
      switch (connectionStatus) {
          case 'connected':
              return (
                  <button 
                      onClick={() => navigate(`/messages?userId=${profile.id}`)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors w-full"
                  >
                      <MessageCircle size={16} /> Message
                  </button>
              );
          case 'pending_sent':
              return (
                  <button 
                      disabled
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-500 font-medium text-sm cursor-default w-full"
                  >
                      <Clock size={16} /> Pending
                  </button>
              );
          case 'pending_received':
              return (
                  <button 
                      onClick={() => navigate('/connections')}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-50 text-brand-700 font-medium text-sm hover:bg-brand-100 w-full"
                  >
                      <UserPlus size={16} /> Respond
                  </button>
              );
          default: // 'none'
              return (
                  <button 
                      onClick={handleConnectClick}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-colors w-full"
                  >
                      <Plus size={16} /> Connect
                  </button>
              );
      }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
        <img 
            src={profile.avatarUrl} 
            alt={profile.name} 
            onClick={navigateToProfile}
            className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity" 
        />
        <div className="flex-1 min-w-0">
          <h3 
            onClick={navigateToProfile}
            className="font-semibold text-slate-900 truncate cursor-pointer hover:text-brand-600 transition-colors"
          >
              {profile.name}
          </h3>
          <p className="text-xs text-slate-500 truncate mb-1">{profile.headline}</p>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(profile.status)}`}>
              {profile.status}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
             {connectionStatus === 'none' && (
                 <button onClick={handleConnectClick} className="text-brand-600 hover:bg-brand-50 p-2 rounded-full transition-colors">
                    <Plus size={18} />
                 </button>
             )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      <div className="h-24 bg-gradient-to-r from-brand-500 to-teal-400 relative">
        <div className="absolute -bottom-8 left-6">
            <img 
              src={profile.avatarUrl} 
              alt={profile.name} 
              onClick={navigateToProfile}
              className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-sm bg-white cursor-pointer hover:opacity-90 transition-opacity" 
            />
        </div>
      </div>
      
      <div className="pt-10 px-6 pb-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <div>
                <h3 
                    onClick={navigateToProfile}
                    className="font-bold text-lg text-slate-900 cursor-pointer hover:text-brand-600 transition-colors"
                >
                    {profile.name}
                </h3>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                    <MapPin size={12} /> {profile.location}
                </p>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(profile.status)}`}>
              {profile.status}
            </span>
        </div>

        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{profile.headline}</p>

        <div className="flex flex-wrap gap-2 mb-4">
            {profile.skills.slice(0, 3).map(skill => (
                <span key={skill} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                    {skill}
                </span>
            ))}
            {profile.skills.length > 3 && (
                <span className="text-xs bg-slate-50 text-slate-400 px-2 py-1 rounded-md">+{profile.skills.length - 3}</span>
            )}
        </div>

        {/* AI Insight Section */}
        <div className="mt-auto pt-4 border-t border-slate-100">
             {matchData ? (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-3 rounded-lg border border-indigo-100 animate-in fade-in mb-4">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                            <Sparkles size={12} /> AI Match Score
                        </span>
                        <span className="text-sm font-black text-indigo-600">{matchData.score}%</span>
                    </div>
                    <p className="text-xs text-indigo-800 leading-relaxed">{matchData.reason}</p>
                </div>
             ) : (
                 <button 
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="w-full text-xs flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-800 py-2 hover:bg-indigo-50 rounded-lg transition-colors mb-2"
                 >
                     <Sparkles size={14} />
                     {isLoading ? "Analyzing Synergy..." : "Analyze Compatibility"}
                 </button>
             )}

             <div className="grid grid-cols-1 gap-3">
                 {renderActionButton()}
             </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;