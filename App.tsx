import React, { useState, useEffect } from 'react';
import { UserStats, Tab, Scene, LearningState } from './types';
import { INITIAL_SCENES, INITIAL_STATS } from './constants';
import BottomNav from './components/BottomNav';
import SceneCard from './components/SceneCard';
import LearningView from './components/LearningView';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.HOME);
  const [activeScene, setActiveScene] = useState<Scene | null>(null);
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_STATS);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load stats from local storage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('lingoScene_stats');
    if (savedStats) {
      const parsed = JSON.parse(savedStats);
      
      // Check for daily reset
      const today = new Date().toISOString().split('T')[0];
      const lastLogin = parsed.lastLoginDate;
      
      if (lastLogin !== today) {
        // New day
        let newStreak = parsed.streak;
        
        // Logic: if last login was yesterday, streak +1, else reset (simplified logic)
        // For real app, use better date math.
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastLogin === yesterdayStr) {
           // streak continues, but we don't increment until check-in
        } else if (lastLogin < yesterdayStr) {
           newStreak = 0;
        }

        setUserStats({
          ...parsed,
          wordsToday: 0,
          lastLoginDate: today,
          streak: newStreak
        });
      } else {
        setUserStats(parsed);
      }
    } else {
      // First time user
      const today = new Date().toISOString().split('T')[0];
      setUserStats({ ...INITIAL_STATS, lastLoginDate: today });
    }
  }, []);

  // Persist stats
  useEffect(() => {
    localStorage.setItem('lingoScene_stats', JSON.stringify(userStats));
  }, [userStats]);

  const handleSceneSelect = (scene: Scene) => {
    setActiveScene(scene);
  };

  const handleDailyCheckIn = () => {
    if (userStats.wordsToday > 0) return; // Already effectively checked in by learning, or prevent double click
    
    // Simple check-in logic
    const today = new Date().toISOString().split('T')[0];
    if (userStats.lastLoginDate === today) {
        // Just animation
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
        return;
    }
    
    setUserStats(prev => ({
        ...prev,
        streak: prev.streak + 1,
        lastLoginDate: today,
        points: prev.points + 10
    }));
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handleLearningComplete = (points: number, count: number) => {
    setUserStats(prev => ({
      ...prev,
      points: prev.points + points,
      learnedWords: prev.learnedWords + count,
      wordsToday: prev.wordsToday + count
    }));
    setActiveScene(null);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Learning View Overlay
  if (activeScene) {
    return (
      <LearningView 
        scene={activeScene} 
        onBack={() => setActiveScene(null)} 
        onComplete={handleLearningComplete} 
      />
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 pb-20 relative overflow-hidden">
      
      {/* Confetti (Simple CSS implementation using fixed divs or standard logic would be complex without lib, using simple overlay) */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-start justify-center pt-20">
             <div className="animate-bounce text-6xl">🎉✨🎉</div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative">
        
        {/* Header */}
        <div className="px-6 pt-12 pb-6 bg-indigo-600 text-white rounded-b-[2.5rem] shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
               <h1 className="text-2xl font-bold">SceneLingo</h1>
               <p className="text-indigo-200 text-sm">Learn in context</p>
            </div>
            <div className="flex items-center space-x-2 bg-indigo-700 px-3 py-1 rounded-full">
              <span>🔥</span>
              <span className="font-bold">{userStats.streak} Days</span>
            </div>
          </div>

          {/* Daily Goal Progress */}
          <div className="bg-indigo-800/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider mb-2 text-indigo-100">
              <span>Today's Goal</span>
              <span>{userStats.wordsToday} / {userStats.goalToday} Words</span>
            </div>
            <div className="w-full bg-indigo-900/50 rounded-full h-2.5">
              <div 
                className="bg-green-400 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (userStats.wordsToday / userStats.goalToday) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {currentTab === Tab.HOME && (
          <div className="px-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Explore Scenes</h2>
              <button 
                onClick={handleDailyCheckIn}
                className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold hover:bg-yellow-200"
              >
                Daily Bonus
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6 pb-20">
              {INITIAL_SCENES.map(scene => (
                <SceneCard 
                  key={scene.id} 
                  scene={scene} 
                  onClick={handleSceneSelect} 
                />
              ))}
            </div>
          </div>
        )}

        {currentTab === Tab.PROFILE && (
           <div className="px-6 pb-20">
              <div className="text-center mb-8">
                 <div className="w-20 h-20 bg-indigo-100 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl shadow-inner">
                    🤠
                 </div>
                 <h2 className="text-xl font-bold">Language Learner</h2>
                 <p className="text-gray-500">Total Points: {userStats.points}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-blue-50 p-4 rounded-xl text-center">
                    <p className="text-2xl font-bold text-blue-600">{userStats.learnedWords}</p>
                    <p className="text-xs text-blue-400 uppercase font-bold">Total Words</p>
                 </div>
                 <div className="bg-purple-50 p-4 rounded-xl text-center">
                    <p className="text-2xl font-bold text-purple-600">{Math.floor(userStats.points / 100)}</p>
                    <p className="text-xs text-purple-400 uppercase font-bold">Level</p>
                 </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                 <h3 className="font-bold mb-4 text-gray-700">Weekly Activity</h3>
                 <div className="h-40 w-full text-xs">
                    {/* Mock Data for Chart */}
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        {name: 'Mon', words: 5},
                        {name: 'Tue', words: 12},
                        {name: 'Wed', words: userStats.wordsToday > 0 ? 8 : 2},
                        {name: 'Thu', words: userStats.wordsToday},
                        {name: 'Fri', words: 0},
                        {name: 'Sat', words: 0},
                        {name: 'Sun', words: 0},
                      ]}>
                         <XAxis dataKey="name" stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} />
                         <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                         />
                         <Line type="monotone" dataKey="words" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, fill:'#4f46e5'}} />
                      </LineChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-bold text-gray-700 mb-2">Achievements</h3>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg opacity-50">
                   <span className="text-2xl mr-3">🏆</span>
                   <div>
                      <p className="font-bold text-sm">Word Master</p>
                      <p className="text-xs text-gray-500">Learn 100 words (Current: {userStats.learnedWords})</p>
                   </div>
                </div>
                 <div className="flex items-center p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                   <span className="text-2xl mr-3">🔥</span>
                   <div>
                      <p className="font-bold text-sm text-yellow-800">Week Warrior</p>
                      <p className="text-xs text-yellow-600">7 Day Streak (Current: {userStats.streak})</p>
                   </div>
                </div>
              </div>
           </div>
        )}

        <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
      </main>
    </div>
  );
};

export default App;
