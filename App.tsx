import React, { useState } from 'react';
import { StaffPortal } from './components/StaffPortal';
import { LeaderApp } from './components/LeaderApp';

const App: React.FC = () => {
  // Simple state to toggle between views for the MVP demo
  const [view, setView] = useState<'staff' | 'leader'>('staff');

  return (
    <div className="min-h-screen bg-gray-100 relative font-sans text-gray-900">
      {view === 'staff' ? <StaffPortal /> : <LeaderApp />}

      {/* View Switcher Floating Control Panel */}
      <div className="fixed bottom-6 right-6 z-50 flex gap-2 bg-white/90 backdrop-blur shadow-2xl p-1.5 rounded-full border border-gray-200">
        <button
          onClick={() => setView('staff')}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
            view === 'staff' 
              ? 'bg-teal-900 text-white shadow-lg transform scale-105' 
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          Staff Portal
        </button>
        <button
          onClick={() => setView('leader')}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
            view === 'leader' 
              ? 'bg-teal-600 text-white shadow-lg transform scale-105' 
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          Leader App
        </button>
      </div>
    </div>
  );
};

export default App;