import React from 'react';
import { Tab } from '../types';

interface BottomNavProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe shadow-lg z-50">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => onTabChange(Tab.HOME)}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            currentTab === Tab.HOME ? 'text-indigo-600' : 'text-gray-400'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-medium">首页</span>
        </button>
        
        <button
          onClick={() => onTabChange(Tab.PROFILE)}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            currentTab === Tab.PROFILE ? 'text-indigo-600' : 'text-gray-400'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs font-medium">我的</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
