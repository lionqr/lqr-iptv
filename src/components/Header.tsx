
import React from 'react';
import { Settings } from 'lucide-react';

const Header = () => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });
  
  return (
    <div className="flex justify-between items-center bg-gradient-to-r from-blue-700 to-purple-500 p-4 text-white">
      <div className="text-xl font-bold">
        LQR
        <br />
        IPTV
      </div>
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
