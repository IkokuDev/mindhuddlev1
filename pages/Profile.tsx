import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { optimizeBio } from '../services/geminiService';
import { AvailabilityStatus } from '../types';
import PostCard from '../components/PostCard';
import EventCard from '../components/EventCard';
import { Sparkles, MapPin, Briefcase, Link as LinkIcon, Edit2, Camera, Plus, X, Save, CheckCircle, Activity, User as UserIcon, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { posts, events, users } = useData();
  const navigate = useNavigate();
  
  // Edit States
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'activity' | 'events'>('about');
  
  // Temporary State for Forms
  const [editForm, setEditForm] = useState({
      name: "",
      headline: "",
      location: "",
      company: "",
      status: AvailabilityStatus.OPEN_TO_WORK
  });
  const [bioInput, setBioInput] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!user) return <div>Loading...</div>;

  const userPosts = posts.filter(p => p.authorId === user.id);
  const userEvents = events.filter(e => e.organizerId === user.id);

  // Handlers
  const handleEditInfoClick = () => {
      setEditForm({
          name: user.name,
          headline: user.headline,
          location: user.location,
          company: user.company || "",
          status: user.status
      });
      setIsEditingInfo(true);
  };

  const handleSaveInfo = () => {
      updateProfile({
          name: editForm.name,
          headline: editForm.headline,
          location: editForm.location,
          company: editForm.company,
          status: editForm.status
      });
      setIsEditingInfo(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'coverUrl') => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              updateProfile({ [field]: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleOptimizeBio = async () => {
    setIsOptimizing(true);
    const sourceBio = isEditingBio ? bioInput : user.bio;
    const newBio = await optimizeBio(sourceBio, user.skills);
    
    if (isEditingBio) {
        setBioInput(newBio);
    } else {
        setBioInput(newBio);
        setIsEditingBio(true);
    }
    setIsOptimizing(false);
  };

  const handleSaveBio = () => {
      updateProfile({ bio: bioInput });
      setIsEditingBio(false);
  };

  const handleAddSkill = () => {
      if (skillInput.trim() && !user.skills.includes(skillInput.trim())) {
          updateProfile({ skills: [...user.skills, skillInput.trim()] });
          setSkillInput("");
      }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
      updateProfile({ skills: user.skills.filter(s => s !== skillToRemove) });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* --- INFO EDIT MODAL --- */}
      {isEditingInfo && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-slate-900">Edit Profile</h3>
                      <button onClick={() => setIsEditingInfo(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                          <input 
                              type="text" 
                              value={editForm.name} 
                              onChange={e => setEditForm({...editForm, name: e.target.value})}
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Headline</label>
                          <input 
                              type="text" 
                              value={editForm.headline} 
                              onChange={e => setEditForm({...editForm, headline: e.target.value})}
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                            <input 
                                type="text" 
                                value={editForm.company} 
                                onChange={e => setEditForm({...editForm, company: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                            <input 
                                type="text" 
                                value={editForm.location} 
                                onChange={e => setEditForm({...editForm, location: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Availability Status</label>
                          <select 
                              value={editForm.status} 
                              onChange={e => setEditForm({...editForm, status: e.target.value as AvailabilityStatus})}
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                          >
                              {Object.values(AvailabilityStatus).map(status => (
                                  <option key={status} value={status}>{status}</option>
                              ))}
                          </select>
                      </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                      <button 
                        onClick={() => setIsEditingInfo(false)}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={handleSaveInfo}
                        className="px-4 py-2 bg-brand-600 text-white font-medium hover:bg-brand-700 rounded-lg flex items-center gap-2"
                      >
                          <Save size={18} /> Save Changes
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- HEADER SECTION --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group">
        <div className="h-48 bg-slate-200 relative overflow-hidden">
            {user.coverUrl ? (
                <img src={user.coverUrl} className="w-full h-full object-cover" alt="Cover" />
            ) : (
                <div className="w-full h-full bg-gradient-to-r from-brand-700 to-teal-600"></div>
            )}
            
            <input 
                type="file" 
                ref={coverInputRef} 
                onChange={(e) => handleImageUpload(e, 'coverUrl')} 
                className="hidden" 
                accept="image/*"
            />
            <button 
                onClick={() => coverInputRef.current?.click()}
                className="absolute bottom-4 right-4 bg-black/30 hover:bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all opacity-0 group-hover:opacity-100"
            >
                <Camera size={14} /> Edit Cover
            </button>
        </div>
        
        <div className="px-8 pb-8">
            <div className="relative mb-4 flex justify-between items-end">
                <div className="-mt-20 relative group/avatar">
                    <img 
                        src={user.avatarUrl} 
                        alt="Me" 
                        className="w-40 h-40 rounded-full border-4 border-white object-cover shadow-md bg-white" 
                    />
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={(e) => handleImageUpload(e, 'avatarUrl')} 
                        className="hidden" 
                        accept="image/*"
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-[2px]"
                    >
                        <Camera size={24} />
                    </button>
                </div>
                
                <div className="flex gap-3 mb-2">
                    <button 
                        onClick={() => navigate(`/profile/${user.id}`)}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        View Public Profile
                    </button>
                    <button 
                        onClick={handleEditInfoClick}
                        className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-brand-600 hover:border-brand-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Edit2 size={16}/> Edit Info
                    </button>
                </div>
            </div>

            <div>
                <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                <p className="text-lg text-slate-600 font-medium mt-1">{user.headline}</p>
                
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><MapPin size={16}/> {user.location}</span>
                    {user.company && <span className="flex items-center gap-1"><Briefcase size={16}/> {user.company}</span>}
                    <span className="flex items-center gap-1 text-brand-600 font-medium hover:underline cursor-pointer"><LinkIcon size={16}/> Contact Info</span>
                </div>
                
                <div className="mt-4 flex gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                        {user.status}
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                        {user.stats?.followers || 500}+ Connections
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

      {activeTab === 'about' && (
        <>
            {/* --- BIO SECTION --- */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-900">About</h2>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleOptimizeBio}
                            disabled={isOptimizing}
                            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                        >
                            <Sparkles size={14} /> 
                            {isOptimizing ? 'Optimizing...' : 'Enhance with AI'}
                        </button>
                        {!isEditingBio ? (
                            <button 
                                onClick={() => { setBioInput(user.bio); setIsEditingBio(true); }}
                                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <Edit2 size={16} />
                            </button>
                        ) : (
                            <button 
                                onClick={() => setIsEditingBio(false)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
                
                {isEditingBio ? (
                    <div className="animate-in fade-in">
                        <textarea 
                            value={bioInput}
                            onChange={(e) => setBioInput(e.target.value)}
                            className="w-full h-32 border border-slate-300 rounded-lg p-3 text-slate-700 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none mb-3"
                        />
                        <div className="flex justify-end">
                            <button 
                                onClick={handleSaveBio}
                                className="px-4 py-1.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 flex items-center gap-2"
                            >
                                <Save size={14} /> Save Bio
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {user.bio}
                    </p>
                )}
            </div>

            {/* --- SKILLS SECTION --- */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-900">Skills & Expertise</h2>
                    <div className="flex gap-2">
                        {!isEditingSkills ? (
                            <button 
                                onClick={() => setIsEditingSkills(true)}
                                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <Edit2 size={16} />
                            </button>
                        ) : (
                            <button 
                                onClick={() => setIsEditingSkills(false)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                                <CheckCircle size={16} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {user.skills.map(skill => (
                        <div key={skill} className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${isEditingSkills ? 'bg-slate-100 pr-2 border border-slate-200' : 'bg-slate-50 text-slate-700 border border-slate-100'}`}>
                            {skill}
                            {isEditingSkills && (
                                <button onClick={() => handleRemoveSkill(skill)} className="text-slate-400 hover:text-red-500">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                    
                    {isEditingSkills && (
                        <div className="flex items-center gap-2 animate-in fade-in">
                            <input 
                                type="text" 
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                                placeholder="Add skill..."
                                className="w-32 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-brand-500"
                            />
                            <button 
                                onClick={handleAddSkill}
                                disabled={!skillInput.trim()}
                                className="p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
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
                      You haven't posted anything yet.
                  </div>
              )}
          </div>
      )}

      {activeTab === 'events' && (
        <div className="space-y-8">
            <h2 className="text-xl font-bold text-slate-900">Events You Are Hosting</h2>
            {userEvents.length > 0 ? (
                userEvents.map(event => (
                    <div key={event.id} className="space-y-4">
                        <EventCard event={event} />
                        
                        {/* Interested Professionals Section */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <Sparkles size={16} className="text-amber-500" />
                                Interested Professionals ({event.attendees.length})
                            </h3>
                            
                            {event.attendees.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {event.attendees.map(attendeeId => {
                                        const attendee = users.find(u => u.id === attendeeId);
                                        if (!attendee) return null;
                                        return (
                                            <div key={attendeeId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                                <img src={attendee.avatarUrl} alt={attendee.name} className="w-10 h-10 rounded-full object-cover" />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-900 truncate">{attendee.name}</p>
                                                    <p className="text-[10px] text-slate-500 truncate">{attendee.headline}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic">No one has expressed interest yet.</p>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Calendar size={24} />
                    </div>
                    <h3 className="text-slate-900 font-medium">No events hosted yet</h3>
                    <p className="text-slate-500 text-sm mt-1 mb-6">Create an event to gather the community!</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Profile;