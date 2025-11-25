import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import { Users, ArrowLeft, LogIn, LogOut, Shield, MessageSquare, Plus, Settings, Save, Trash2, Search } from 'lucide-react';
import ProfileCard from '../components/ProfileCard';

const GroupDetails: React.FC = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { groups, posts, users, joinGroup, leaveGroup, addPost, updateGroup, removeMemberFromGroup } = useData();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'feed' | 'members' | 'admin'>('feed');
  const [postContent, setPostContent] = useState("");
  const [memberSearch, setMemberSearch] = useState("");

  const group = groups.find(g => g.id === groupId);

  // Edit Group State
  const [editForm, setEditForm] = useState({
      name: "",
      description: "",
      category: "",
      imageUrl: ""
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (group) {
        setEditForm({
            name: group.name,
            description: group.description,
            category: group.category,
            imageUrl: group.imageUrl || ""
        });
    }
  }, [group]);

  if (!group) {
      return (
          <div className="text-center py-20">
              <h2 className="text-xl font-bold text-slate-700">Group not found</h2>
              <button onClick={() => navigate('/groups')} className="mt-4 text-brand-600 hover:underline">Back to Groups</button>
          </div>
      );
  }

  const isMember = user && user.groups?.includes(group.id);
  const isAdmin = user && group.admins.includes(user.id);

  // Filter posts for this group
  const groupPosts = posts.filter(p => p.groupId === group.id);
  
  // Get member profiles
  const memberProfiles = group.members
    .map(memberId => users.find(u => u.id === memberId))
    .filter(u => u !== undefined);

  // Filter members for management
  const filteredMembers = memberProfiles.filter(m => 
      m!.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
      m!.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const handleJoinAction = () => {
    if (isMember) {
        if(confirm("Are you sure you want to leave this group?")) {
            leaveGroup(group.id);
        }
    } else {
        joinGroup(group.id);
    }
  };

  const handlePostSubmit = () => {
      if (postContent.trim()) {
          addPost(postContent, undefined, group.id);
          setPostContent("");
      }
  };

  const handleUpdateGroup = (e: React.FormEvent) => {
      e.preventDefault();
      updateGroup(group.id, editForm);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleRemoveMember = (memberId: string) => {
      if (confirm("Are you sure you want to remove this member?")) {
          removeMemberFromGroup(group.id, memberId);
      }
  };

  return (
    <div className="space-y-6 pb-12">
        {/* Navigation */}
        <button onClick={() => navigate('/groups')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-2">
            <ArrowLeft size={18} /> Back to Groups
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="h-48 bg-slate-200 relative">
                {group.imageUrl ? (
                    <img src={group.imageUrl} className="w-full h-full object-cover" alt="Cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-brand-600 to-indigo-600"></div>
                )}
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-6 left-6 text-white">
                     <div className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2 py-1 rounded inline-block mb-2">
                         {group.category}
                     </div>
                     <h1 className="text-3xl font-bold drop-shadow-sm">{group.name}</h1>
                </div>
            </div>
            
            <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                     <p className="text-slate-600 leading-relaxed max-w-2xl">{group.description}</p>
                     <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 font-medium">
                         <span className="flex items-center gap-1"><Users size={16} /> {group.members.length} members</span>
                         <span className="flex items-center gap-1"><MessageSquare size={16} /> {groupPosts.length} posts</span>
                     </div>
                </div>
                
                <div className="flex gap-2">
                    {isAdmin && (
                         <button 
                            onClick={() => setActiveTab('admin')}
                            className="px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all bg-slate-100 text-slate-700 hover:bg-slate-200"
                        >
                            <Settings size={18} /> Admin Tools
                        </button>
                    )}
                    <button 
                        onClick={handleJoinAction}
                        className={`px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm ${
                            isMember 
                            ? 'bg-white border border-slate-300 text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200' 
                            : 'bg-brand-600 text-white hover:bg-brand-700'
                        }`}
                    >
                        {isMember ? <><LogOut size={18} /> Leave Group</> : <><LogIn size={18} /> Join Group</>}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-t border-slate-200 px-6 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('feed')}
                    className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'feed' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    Discussion
                </button>
                <button 
                    onClick={() => setActiveTab('members')}
                    className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'members' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                    Members
                </button>
                {isAdmin && (
                    <button 
                        onClick={() => setActiveTab('admin')}
                        className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'admin' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        <Shield size={16} /> Admin Tools
                    </button>
                )}
            </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'feed' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                     {/* Create Post for Group */}
                     {isMember && (
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                            <div className="flex gap-4">
                                <img src={user?.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                                <div className="flex-1">
                                    <textarea 
                                        value={postContent}
                                        onChange={(e) => setPostContent(e.target.value)}
                                        placeholder={`Start a discussion in ${group.name}...`}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[80px] resize-none"
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button 
                                            onClick={handlePostSubmit}
                                            disabled={!postContent.trim()}
                                            className="bg-brand-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
                                        >
                                            Post
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                     )}

                     {/* Posts */}
                     {groupPosts.length > 0 ? (
                        groupPosts.map(post => <PostCard key={post.id} post={post} />)
                     ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500">
                            <MessageSquare size={32} className="mx-auto mb-3 text-slate-300" />
                            <p>No discussions yet.</p>
                            {isMember && <p className="text-sm">Be the first to post!</p>}
                        </div>
                     )}
                </div>

                {/* Sidebar Info */}
                <div className="hidden lg:block space-y-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm sticky top-24">
                        <h3 className="font-bold text-slate-900 mb-3 text-sm">About this Group</h3>
                        <p className="text-xs text-slate-500 mb-4">{group.description}</p>
                        
                        <div className="h-px bg-slate-100 my-4"></div>
                        
                        <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">Admins</h4>
                        <div className="space-y-3">
                            {memberProfiles.filter(m => group.admins.includes(m!.id)).map(admin => admin && (
                                <div key={admin.id} className="flex items-center gap-2">
                                    <img src={admin.avatarUrl} className="w-8 h-8 rounded-full object-cover" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 truncate">{admin.name}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{admin.headline}</p>
                                    </div>
                                    <Shield size={12} className="text-amber-500 ml-auto flex-shrink-0" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'members' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {memberProfiles.map(profile => profile && (
                    <div key={profile.id} className="relative">
                        <ProfileCard profile={profile} compact />
                        {group.admins.includes(profile.id) && (
                            <div className="absolute top-2 right-2 bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-200 flex items-center gap-1">
                                <Shield size={10} /> Admin
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'admin' && isAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Edit Settings */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-fit">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900">Group Settings</h3>
                        {showSuccess && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded animate-in fade-in">Changes Saved!</span>}
                    </div>
                    
                    <form onSubmit={handleUpdateGroup} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Group Name</label>
                            <input 
                                type="text"
                                value={editForm.name}
                                onChange={e => setEditForm({...editForm, name: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                            />
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
                                <option>Business</option>
                                <option>Design</option>
                                <option>Engineering</option>
                                <option>Lifestyle</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image URL</label>
                            <input 
                                type="text"
                                value={editForm.imageUrl}
                                onChange={e => setEditForm({...editForm, imageUrl: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea 
                                value={editForm.description}
                                onChange={e => setEditForm({...editForm, description: e.target.value})}
                                className="w-full h-32 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                            />
                        </div>
                        <div className="pt-2">
                            <button 
                                type="submit"
                                className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                            >
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    </form>
                </div>

                {/* Manage Members */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-fit">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Manage Members</h3>
                    
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            value={memberSearch}
                            onChange={(e) => setMemberSearch(e.target.value)}
                            placeholder="Search members..." 
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {filteredMembers.map(member => member && (
                            <div key={member.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <img src={member.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{member.name}</p>
                                        <p className="text-xs text-slate-500">{member.headline}</p>
                                    </div>
                                </div>
                                {group.admins.includes(member.id) ? (
                                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 flex items-center gap-1">
                                        <Shield size={10} /> Admin
                                    </span>
                                ) : (
                                    <button 
                                        onClick={() => handleRemoveMember(member.id)}
                                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                        title="Remove Member"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default GroupDetails;