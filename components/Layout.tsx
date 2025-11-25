import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, MessageSquare, UserCircle, Search, Menu, X, LogOut, ChevronDown, Calendar, Network, Grid } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pendingRequestsCount = user?.receivedRequests?.length || 0;

  const navItems = [
    { to: "/", icon: <LayoutGrid size={20} />, label: "Feed" },
    { to: "/discovery", icon: <Users size={20} />, label: "Discovery" },
    { 
      to: "/connections", 
      icon: <Network size={20} />, 
      label: "Network",
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null
    },
    { to: "/groups", icon: <Grid size={20} />, label: "Groups" },
    { to: "/events", icon: <Calendar size={20} />, label: "Events" },
    { to: "/messages", icon: <MessageSquare size={20} />, label: "Messages" },
    { to: "/profile", icon: <UserCircle size={20} />, label: "Me" },
  ];

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/discovery?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery(""); // Optional: clear or keep
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sticky Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">
              MindHuddle
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 flex-shrink-0">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 text-xs font-medium transition-colors relative ${
                    isActive ? "text-brand-600" : "text-slate-500 hover:text-slate-800"
                  }`
                }
              >
                <div className="relative">
                    {item.icon}
                    {item.badge && (
                        <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white">
                            {item.badge}
                        </span>
                    )}
                </div>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Search & Profile */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search..." 
                className="bg-slate-100 pl-9 pr-4 py-2 rounded-full text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 w-40 lg:w-56 transition-all hover:bg-slate-50 border border-transparent hover:border-slate-200"
              />
            </div>
            
            <div className="relative hidden sm:block">
               <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img 
                    src={user?.avatarUrl || "https://picsum.photos/200"} 
                    alt="Me" 
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                  />
                  <ChevronDown size={14} className="text-slate-500"/>
               </button>

               {isProfileMenuOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.headline}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                 </div>
               )}
            </div>

            <button onClick={toggleMobileMenu} className="md:hidden text-slate-600">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 absolute w-full z-40 top-16 shadow-lg animate-in slide-in-from-top-5">
           
           <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { handleSearch(e); closeMobileMenu(); }}
                placeholder="Search..." 
                className="w-full bg-slate-100 pl-10 pr-4 py-2 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
           </div>

           <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors justify-between ${
                    isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                </div>
                {item.badge && (
                    <span className="bg-red-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                        {item.badge}
                    </span>
                )}
              </NavLink>
            ))}
             <button 
                onClick={() => { handleLogout(); closeMobileMenu(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full text-left mt-2 border-t border-slate-100"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;