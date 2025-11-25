import React from 'react';
import { Group } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Users, LogIn, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GroupCardProps {
  group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const { joinGroup, leaveGroup } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isMember = user && user.groups?.includes(group.id);
  const isAdmin = user && group.admins.includes(user.id);

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMember) {
      if (confirm("Are you sure you want to leave this group?")) {
        leaveGroup(group.id);
      }
    } else {
      joinGroup(group.id);
    }
  };

  return (
    <div 
      onClick={() => navigate(`/groups/${group.id}`)}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
    >
      <div className="h-28 relative overflow-hidden bg-slate-200">
         {group.imageUrl ? (
             <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
         ) : (
             <div className="w-full h-full bg-gradient-to-r from-brand-600 to-indigo-600"></div>
         )}
         <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wider">
             {group.category}
         </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1">
          <div className="mb-2">
              <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">{group.name}</h3>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <Users size={12} /> {group.members.length} members
                  {isAdmin && <span className="flex items-center gap-1 text-amber-600 ml-2"><Shield size={10} /> Admin</span>}
              </div>
          </div>
          
          <p className="text-xs text-slate-600 line-clamp-2 mb-4 flex-1">
              {group.description}
          </p>

          <button 
              onClick={handleAction}
              className={`w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                  isMember 
                  ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600' 
                  : 'bg-brand-600 text-white hover:bg-brand-700'
              }`}
          >
              {isMember ? (
                  <><LogOut size={14} /> Leave Group</>
              ) : (
                  <><LogIn size={14} /> Join Group</>
              )}
          </button>
      </div>
    </div>
  );
};

export default GroupCard;