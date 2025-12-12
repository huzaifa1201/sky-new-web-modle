import React from 'react';
import { Heart } from 'lucide-react';

interface FooterProps {
  darkMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ darkMode }) => {
  return (
    <div className={`w-full py-6 mt-4 text-center border-t ${darkMode ? 'border-white/10 text-white/40' : 'border-slate-200 text-slate-400'}`}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-sm font-medium">Made with</span>
        <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" />
        <span className="text-sm font-medium">by SkyNow</span>
      </div>
      <p className="text-xs">&copy; {new Date().getFullYear()} SkyNow Weather. All rights reserved.</p>
    </div>
  );
};

export default Footer;