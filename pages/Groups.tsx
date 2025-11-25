import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import GroupCard from '../components/GroupCard';
import { Search, Plus, Users, X } from 'lucide-react';

const Groups: React.FC = () => {
  const { groups, createGroup } = useData();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'discover' | 'my-groups'>('discover');
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form State
  const [newGroup, setNewGroup] = useState({
      name: "",
      description: "",
      category: "General",
      imageUrl: ""
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createGroup(newGroup.name, newGroup.description, newGroup.category, newGroup.imageUrl || undefined);
      setShowCreateModal(false);
      setNewGroup({ name: "", description: "", category: "General", imageUrl: "" });
  };

  const filteredGroups = useMemo(() => {
    let result = groups;

    if (activeTab === 'my-groups') {
        result = result.filter(g => user?.groups?.includes(g.id));
    }

    if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        result = result.filter(g => 
            g.name.toLowerCase().includes(lowerQ) || 
            g.description.toLowerCase().includes(lowerQ)
        );
    }
    
    return result;
  }, [groups, activeTab, searchQuery, user]);

  return (
    <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Groups</h1>
                <p className="text-slate-500 mt-1">Join communities, share interests, and grow together.</p>
            </div>
            <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-brand-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center gap-2 w-fit shadow-sm"
            >
                <Plus size={20} /> Create Group
            </button>
        </div>

        {/* Navigation & Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 w-full md:w-auto border-b md:border-b-0 border-slate-100 pb-2 md:pb-0">
                <button 
                    onClick={() => setActiveTab('discover')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'discover' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    Discover
                </button>
                <button 
                    onClick={() => setActiveTab('my-groups')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'my-groups' ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    My Groups
                </button>
            </div>
            <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search groups..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
            </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGroups.map(group => (
                <GroupCard key={group.id} group={group} />
            ))}
            
            {filteredGroups.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
                    <Users size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No groups found</h3>
                    <p className="max-w-xs mx-auto mt-1">
                        {activeTab === 'my-groups' 
                            ? "You haven't joined any groups yet. Switch to Discover to find some!" 
                            : "Try adjusting your search terms or create a new group."}
                    </p>
                </div>
            )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Create New Group</h3>
                        <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Group Name</label>
                            <input 
                                type="text" 
                                required
                                value={newGroup.name}
                                onChange={e => setNewGroup({...newGroup, name: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="e.g. UX Designers of London"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select 
                                value={newGroup.category}
                                onChange={e => setNewGroup({...newGroup, category: e.target.value})}
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
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea 
                                required
                                value={newGroup.description}
                                onChange={e => setNewGroup({...newGroup, description: e.target.value})}
                                className="w-full h-24 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                                placeholder="What is this community about?"
                            />
                        </div>
                        
                        <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image URL (Optional)</label>
                             <input 
                                type="text" 
                                value={newGroup.imageUrl}
                                onChange={e => setNewGroup({...newGroup, imageUrl: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button 
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="px-4 py-2 bg-brand-600 text-white font-medium hover:bg-brand-700 rounded-lg"
                            >
                                Create Group
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default Groups;