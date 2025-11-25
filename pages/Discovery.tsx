import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';
import { SlidersHorizontal, Filter, Search, XCircle, MapPin, Briefcase, X, Sparkles, Globe } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { AvailabilityStatus } from '../types';

type FilterMode = 'all' | 'recommended' | 'nearby';

const Discovery: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || "";
  
  const { users } = useData();
  const { user: currentUser } = useAuth();

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [mode, setMode] = useState<FilterMode>('all');
  const [statusFilter, setStatusFilter] = useState<AvailabilityStatus | 'all'>('all');
  const [skillFilter, setSkillFilter] = useState("");

  // Helper: Calculate relevance score based on shared skills/interests
  const calculateRelevance = (targetUser: typeof users[0]) => {
    if (!currentUser) return 0;
    let score = 0;
    
    // Skill Overlap
    const sharedSkills = targetUser.skills.filter(s => currentUser.skills.includes(s));
    score += sharedSkills.length * 2;

    // Interest Overlap
    const sharedInterests = targetUser.interests.filter(i => currentUser.interests.includes(i));
    score += sharedInterests.length;

    return score;
  };

  // Helper: Check if locations are roughly the same
  const isNearby = (targetLoc: string) => {
    if (!currentUser?.location) return false;
    // Simple inclusion check (e.g. "San Francisco" matches "San Francisco, CA")
    const myLoc = currentUser.location.toLowerCase();
    const theirLoc = targetLoc.toLowerCase();
    return myLoc.includes(theirLoc) || theirLoc.includes(myLoc);
  };

  // Main Filtering Logic
  const processedUsers = useMemo(() => {
    let result = users.filter(u => u.id !== currentUser?.id); // Exclude self

    // 1. Text Search (Name, Headline, Location, Skills)
    if (query) {
      const lowerQ = query.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(lowerQ) ||
        user.headline.toLowerCase().includes(lowerQ) ||
        user.location.toLowerCase().includes(lowerQ) ||
        user.skills.some(s => s.toLowerCase().includes(lowerQ))
      );
    }

    // 2. Mode Filtering (Recommended vs Nearby)
    if (mode === 'nearby') {
       result = result.filter(u => isNearby(u.location));
    }

    // 3. Status Filtering
    if (statusFilter !== 'all') {
      result = result.filter(u => u.status === statusFilter);
    }

    // 4. Skill Filtering
    if (skillFilter) {
      result = result.filter(u => u.skills.some(s => s.toLowerCase().includes(skillFilter.toLowerCase())));
    }

    // 5. Sorting/Ranking
    // We map to add metadata then sort
    const ranked = result.map(u => ({
      ...u,
      relevance: calculateRelevance(u),
      isLocal: isNearby(u.location)
    }));

    if (mode === 'recommended') {
      // Sort by relevance score descending
      ranked.sort((a, b) => b.relevance - a.relevance);
    } else if (mode === 'nearby') {
      // Already filtered by nearby, but maybe sort by exact match or something else
      // For now, keep default or alphabetical
    } 

    return ranked;
  }, [users, currentUser, query, mode, statusFilter, skillFilter]);

  const clearSearch = () => {
      setSearchParams({});
      setMode('all');
      setStatusFilter('all');
      setSkillFilter("");
  };

  // Extract all unique skills for the dropdown
  const allSkills = Array.from(new Set(users.flatMap(u => u.skills))).sort();

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Discover Professionals</h1>
                <p className="text-slate-500 mt-1">
                    Connect with people who share your Ubuntu spirit and professional goals.
                </p>
            </div>
            
            <div className="flex gap-2">
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${showFilters ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                >
                    <Filter size={18} />
                    Filters
                    {(mode !== 'all' || statusFilter !== 'all' || skillFilter) && (
                        <span className="bg-brand-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                            !
                        </span>
                    )}
                </button>
            </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-in slide-in-from-top-2">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-900">Refine Results</h3>
                    <button onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* View Mode */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">View Mode</label>
                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={() => setMode('all')}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <Globe size={16} /> All Professionals
                            </button>
                            <button 
                                onClick={() => setMode('recommended')}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'recommended' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <Sparkles size={16} /> Recommended for You
                            </button>
                            <button 
                                onClick={() => setMode('nearby')}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'nearby' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                <MapPin size={16} /> Close By ({currentUser?.location || "Unknown"})
                            </button>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Availability</label>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${statusFilter === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                            >
                                Any
                            </button>
                            {Object.values(AvailabilityStatus).map(status => (
                                <button 
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${statusFilter === status ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter by Skill</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-2.5 text-slate-400" size={14} />
                            <select 
                                value={skillFilter}
                                onChange={(e) => setSkillFilter(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none"
                            >
                                <option value="">All Skills</option>
                                {allSkills.map(skill => (
                                    <option key={skill} value={skill}>{skill}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Active Filters Summary */}
        {(query || mode !== 'all' || statusFilter !== 'all' || skillFilter) && (
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-500 font-medium">Active Filters:</span>
                
                {query && (
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        Search: "{query}" <button onClick={() => setSearchParams({})}><X size={12}/></button>
                    </span>
                )}
                {mode === 'recommended' && (
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        Recommended <button onClick={() => setMode('all')}><X size={12}/></button>
                    </span>
                )}
                {mode === 'nearby' && (
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        Nearby <button onClick={() => setMode('all')}><X size={12}/></button>
                    </span>
                )}
                {statusFilter !== 'all' && (
                    <span className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        {statusFilter} <button onClick={() => setStatusFilter('all')}><X size={12}/></button>
                    </span>
                )}
                {skillFilter && (
                    <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        Skill: {skillFilter} <button onClick={() => setSkillFilter("")}><X size={12}/></button>
                    </span>
                )}
                <button onClick={clearSearch} className="text-xs text-slate-500 hover:text-red-600 font-medium ml-2">
                    Clear All
                </button>
            </div>
        )}

        {/* Grid Results */}
        <div>
            {processedUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {processedUsers.map(user => (
                        <ProfileCard key={user.id} profile={user} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
                    <Search size={48} className="mx-auto text-slate-200 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No professionals found</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mt-1">
                        Try adjusting your filters or search terms to find who you're looking for.
                    </p>
                    <button 
                        onClick={clearSearch}
                        className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                    >
                        Clear All Filters
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Discovery;