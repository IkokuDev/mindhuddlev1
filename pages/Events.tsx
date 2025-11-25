import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import EventCard from '../components/EventCard';
import { Plus, Search, Calendar as CalendarIcon, MapPin, Monitor, Filter, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Events: React.FC = () => {
  const { events, addEvent } = useData();
  const { user } = useAuth();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'virtual' | 'in-person'>('all');
  const [searchQuery, setSearchQuery] = useState("");

  // Create Form State
  const [formData, setFormData] = useState({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      isVirtual: false,
      category: "General"
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      
      addEvent({
          title: formData.title,
          description: formData.description,
          startDate: startDateTime,
          location: formData.location,
          isVirtual: formData.isVirtual,
          category: formData.category
      });
      setShowCreateModal(false);
      // Reset form
      setFormData({
          title: "",
          description: "",
          date: "",
          time: "",
          location: "",
          isVirtual: false,
          category: "General"
      });
  };

  const filteredEvents = useMemo(() => {
      let result = [...events];

      // Sort by upcoming
      result.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

      // Search
      if (searchQuery) {
          const lowerQ = searchQuery.toLowerCase();
          result = result.filter(e => 
              e.title.toLowerCase().includes(lowerQ) || 
              e.description.toLowerCase().includes(lowerQ) ||
              e.location.toLowerCase().includes(lowerQ)
          );
      }

      // Filter
      if (filterType === 'virtual') {
          result = result.filter(e => e.isVirtual);
      } else if (filterType === 'in-person') {
          result = result.filter(e => !e.isVirtual);
      }

      return result;
  }, [events, searchQuery, filterType]);

  return (
    <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Community Events</h1>
                <p className="text-slate-500 mt-1">Discover, join, and create buzz for professional gatherings.</p>
            </div>
            <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-brand-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center gap-2 w-fit shadow-sm"
            >
                <Plus size={20} /> Create Event
            </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events by title, location..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                <Filter size={18} className="text-slate-400 mr-1" />
                <button 
                    onClick={() => setFilterType('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                    All Events
                </button>
                <button 
                    onClick={() => setFilterType('virtual')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${filterType === 'virtual' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                    <Monitor size={14} /> Virtual
                </button>
                <button 
                    onClick={() => setFilterType('in-person')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${filterType === 'in-person' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                    <MapPin size={14} /> In Person
                </button>
            </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
            ))}
            
            {filteredEvents.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
                    <CalendarIcon size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No events found</h3>
                    <p className="max-w-xs mx-auto mt-1">Try adjusting your filters or be the first to create an event!</p>
                </div>
            )}
        </div>

        {/* Create Event Modal */}
        {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Create New Event</h3>
                        <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
                            <input 
                                type="text" 
                                required
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                                placeholder="e.g. Tech Meetup 2024"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                <input 
                                    type="date" 
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({...formData, date: e.target.value})}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                <input 
                                    type="time" 
                                    required
                                    value={formData.time}
                                    onChange={e => setFormData({...formData, time: e.target.value})}
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
                                    value={formData.location}
                                    onChange={e => setFormData({...formData, location: e.target.value})}
                                    className="w-full pl-9 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
                                    placeholder="e.g. 123 Main St OR Zoom Link"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox"
                                id="isVirtual"
                                checked={formData.isVirtual}
                                onChange={e => setFormData({...formData, isVirtual: e.target.checked})}
                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 border-gray-300"
                            />
                            <label htmlFor="isVirtual" className="text-sm text-slate-700">This is a virtual event</label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select 
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
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
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                className="w-full h-24 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                                placeholder="What is this event about?"
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
                                Create Event
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default Events;