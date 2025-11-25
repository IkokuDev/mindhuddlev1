import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Search, UserMinus, MessageCircle, Check, X, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Connections: React.FC = () => {
  const { users, acceptConnectionRequest, ignoreConnectionRequest, removeConnection } = useData();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Get Profiles based on ID arrays
  const receivedRequestProfiles = useMemo(() => {
    if (!currentUser) return [];
    return currentUser.receivedRequests
      .map(id => users.find(u => u.id === id))
      .filter(u => u !== undefined);
  }, [currentUser, users]);

  const connectionProfiles = useMemo(() => {
    if (!currentUser) return [];
    return currentUser.connections
      .map(id => users.find(u => u.id === id))
      .filter(u => u !== undefined);
  }, [currentUser, users]);

  // Filter connections by search
  const filteredConnections = useMemo(() => {
      if (!searchQuery) return connectionProfiles;
      const lowerQ = searchQuery.toLowerCase();
      return connectionProfiles.filter(u => 
          u!.name.toLowerCase().includes(lowerQ) || 
          u!.headline.toLowerCase().includes(lowerQ) ||
          u!.company?.toLowerCase().includes(lowerQ)
      );
  }, [connectionProfiles, searchQuery]);

  if (!currentUser) return null;

  return (
    <div className="space-y-8 pb-12">
        <h1 className="text-3xl font-bold text-slate-900">My Network</h1>

        {/* --- INVITATIONS SECTION --- */}
        {receivedRequestProfiles.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    Invitations <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{receivedRequestProfiles.length}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {receivedRequestProfiles.map(profile => profile && (
                        <div key={profile.id} className="border border-slate-200 rounded-lg p-4 flex gap-4 items-start bg-slate-50/50">
                             <img src={profile.avatarUrl} alt={profile.name} className="w-12 h-12 rounded-full object-cover" />
                             <div className="flex-1 min-w-0">
                                 <h3 className="font-bold text-slate-900 truncate">{profile.name}</h3>
                                 <p className="text-xs text-slate-500 line-clamp-2 mb-3">{profile.headline}</p>
                                 <div className="flex gap-2">
                                     <button 
                                        onClick={() => acceptConnectionRequest(profile.id)}
                                        className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-1.5 rounded-md text-xs font-medium flex justify-center items-center gap-1"
                                     >
                                        <Check size={14} /> Accept
                                     </button>
                                     <button 
                                        onClick={() => ignoreConnectionRequest(profile.id)}
                                        className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 py-1.5 rounded-md text-xs font-medium flex justify-center items-center gap-1"
                                     >
                                        <X size={14} /> Ignore
                                     </button>
                                 </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- CONNECTIONS LIST SECTION --- */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm min-h-[400px]">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                 <h2 className="text-lg font-bold text-slate-900">Connections ({connectionProfiles.length})</h2>
                 <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search your connections..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                 </div>
            </div>

            {filteredConnections.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredConnections.map(profile => profile && (
                        <div key={profile.id} className="border border-slate-200 rounded-xl p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow relative group">
                            <button 
                                onClick={() => removeConnection(profile.id)}
                                className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                title="Remove connection"
                            >
                                <UserMinus size={16} />
                            </button>
                            
                            <img src={profile.avatarUrl} alt={profile.name} className="w-20 h-20 rounded-full object-cover mb-3" />
                            <h3 className="font-bold text-slate-900 text-lg truncate w-full">{profile.name}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{profile.headline}</p>
                            
                            <button 
                                onClick={() => navigate(`/messages?userId=${profile.id}`)}
                                className="mt-auto w-full py-2 bg-white border border-brand-200 text-brand-700 hover:bg-brand-50 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <MessageCircle size={16} /> Message
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Users size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No connections found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-1">
                        {searchQuery ? "Try adjusting your search terms." : "Head over to the Discovery page to find professionals to connect with!"}
                    </p>
                    {!searchQuery && (
                        <button 
                            onClick={() => navigate('/discovery')}
                            className="mt-6 px-6 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
                        >
                            Go to Discovery
                        </button>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default Connections;