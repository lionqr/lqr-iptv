
import React from 'react';
import { Settings, Search } from 'lucide-react';
import { Input } from './ui/input';

interface HeaderProps {
  onSearch?: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });
  
  return (
    <div className="flex justify-between items-center bg-gradient-to-r from-blue-700 to-purple-500 p-4 text-white">
      <div className="text-xl font-bold">
        LQR
        <br />
        IPTV
      </div>
      {onSearch && (
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search Channels"
              onChange={(e) => onSearch(e.target.value)}
              className="bg-white/10 border-none text-white placeholder:text-white/60"
            />
            <Search className="absolute right-3 top-2.5 text-white/60" size={18} />
          </div>
        </div>
      )}
      <div className="text-right flex items-center gap-4">
        <span className="text-xl">{currentTime}</span>
        <span className="text-xl">{currentDate}</span>
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Header;
