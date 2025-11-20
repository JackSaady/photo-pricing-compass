import React, { useState, useEffect } from 'react';
import { AppView, UserProfile, ScenarioData } from './types';
import ProfileForm from './components/ProfileForm';
import ScenarioBuilder from './components/ScenarioBuilder';
import CorporatePlanner from './components/CorporatePlanner';
import LicensingCalculator from './components/LicensingCalculator';
import NegotiationHelper from './components/NegotiationHelper';
import HistoryView from './components/HistoryView';
import { LayoutDashboard, PlusCircle, Building2, Scale, Handshake, History, Camera, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.PROFILE);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Initialize state from localStorage if available
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('ppc_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [scenarios, setScenarios] = useState<ScenarioData[]>(() => {
    const saved = localStorage.getItem('ppc_scenarios');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('ppc_profile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('ppc_scenarios', JSON.stringify(scenarios));
  }, [scenarios]);

  const handleProfileSave = (profile: UserProfile) => {
    setUserProfile(profile);
    setCurrentView(AppView.SCENARIO); // Auto advance after profile creation
  };

  const handleScenarioSave = (scenario: ScenarioData) => {
    setScenarios(prev => [...prev, scenario]);
    setCurrentView(AppView.HISTORY);
  };

  const handleNavClick = (view: AppView) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false); // Close menu on mobile when item clicked
  };

  const NavItem = ({ view, icon: Icon, label }: any) => (
    <button
      onClick={() => handleNavClick(view)}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
        currentView === view 
          ? 'bg-indigo-600 text-white shadow-lg' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  // Force profile setup if not done
  if (!userProfile && currentView !== AppView.PROFILE) {
    return <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
       <ProfileForm currentProfile={userProfile} onSave={handleProfileSave} />
    </div>
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white p-4 z-40 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <div className="bg-teal-500 p-1.5 rounded">
            <Camera className="text-white h-4 w-4" />
          </div>
          <span className="font-bold">Pricing Compass</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      {userProfile && (
        <aside className={`
          fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 
          transform transition-transform duration-300 ease-in-out shadow-xl md:shadow-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-6 border-b border-slate-800 hidden md:block">
            <div className="flex items-center gap-3">
              <div className="bg-teal-500 p-2 rounded-lg">
                <Camera className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-none">Pricing Compass</h1>
                <p className="text-xs text-slate-400 mt-1">for Photographers</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-b border-slate-800 md:hidden mt-12">
             <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Menu</div>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavItem view={AppView.PROFILE} icon={LayoutDashboard} label="Profile & CODB" />
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tools</div>
            <NavItem view={AppView.SCENARIO} icon={PlusCircle} label="New Quote" />
            <NavItem view={AppView.CORPORATE} icon={Building2} label="Corp Planner" />
            <NavItem view={AppView.LICENSING} icon={Scale} label="Licensing Calc" />
            <NavItem view={AppView.NEGOTIATION} icon={Handshake} label="Negotiator" />
            <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</div>
            <NavItem view={AppView.HISTORY} icon={History} label="History" />
          </nav>

          <div className="p-4 border-t border-slate-800 bg-slate-900">
            <div className="text-xs text-slate-500">
              Logged in as <span className="text-white">{userProfile.name || 'Photographer'}</span>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative pt-16 md:pt-0">
        {!userProfile ? (
           <ProfileForm currentProfile={userProfile} onSave={handleProfileSave} />
        ) : (
          <div className="h-full">
            {currentView === AppView.PROFILE && (
              <ProfileForm currentProfile={userProfile} onSave={handleProfileSave} />
            )}
            {currentView === AppView.SCENARIO && (
              <ScenarioBuilder profile={userProfile} onSave={handleScenarioSave} />
            )}
            {currentView === AppView.CORPORATE && (
              <CorporatePlanner />
            )}
            {currentView === AppView.LICENSING && (
              <LicensingCalculator />
            )}
            {currentView === AppView.NEGOTIATION && (
              <NegotiationHelper scenarios={scenarios} profile={userProfile} />
            )}
            {currentView === AppView.HISTORY && (
              <HistoryView scenarios={scenarios} profile={userProfile} />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;