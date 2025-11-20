import React, { useState } from 'react';
import { ScenarioData, UserProfile } from '../types';
import { Calendar, FileText, Copy, Check, ArrowUpRight } from 'lucide-react';

interface Props {
  scenarios: ScenarioData[];
  profile: UserProfile;
}

const HistoryView: React.FC<Props> = ({ scenarios, profile }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (scenario: ScenarioData) => {
    const lines = [
      `QUOTE: ${scenario.title}`,
      `DATE: ${new Date(scenario.date).toLocaleDateString()}`,
      `--------------------------------`,
      `OPTION 1: ${scenario.tiers[0].name} - ${profile.currency}${scenario.tiers[0].price}`,
      `Includes: ${scenario.tiers[0].features.join(', ')}`,
      ``,
      `OPTION 2: ${scenario.tiers[1].name} - ${profile.currency}${scenario.tiers[1].price} (Recommended)`,
      `Includes: ${scenario.tiers[1].features.join(', ')}`,
      ``,
      `OPTION 3: ${scenario.tiers[2].name} - ${profile.currency}${scenario.tiers[2].price}`,
      `Includes: ${scenario.tiers[2].features.join(', ')}`,
      `--------------------------------`,
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedId(scenario.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (scenarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400">
        <FileText className="w-16 h-16 mb-4 opacity-20" />
        <p>No saved scenarios yet.</p>
        <p className="text-sm mt-2">Create a new quote to see it here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-end mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Pricing History</h1>
        <div className="text-sm text-slate-500">{scenarios.length} scenarios saved</div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {scenarios.slice().reverse().map(scenario => (
          <div key={scenario.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold uppercase tracking-wide ${
                    scenario.type === 'Individual Session' ? 'bg-blue-50 text-blue-700' :
                    scenario.type === 'Team/Group Headshots' ? 'bg-teal-50 text-teal-700' :
                    scenario.type === 'Monthly Retainer' ? 'bg-purple-50 text-purple-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {scenario.type}
                  </span>
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(scenario.date).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{scenario.title}</h3>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleCopy(scenario)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    copiedId === scenario.id 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  {copiedId === scenario.id ? <Check size={14} /> : <Copy size={14} />}
                  {copiedId === scenario.id ? 'Copied!' : 'Copy Details'}
                </button>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
               <div className="text-center p-2 rounded hover:bg-slate-50 transition-colors">
                 <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">{scenario.tiers[0].name}</div>
                 <div className="font-medium text-slate-700">{profile.currency}{scenario.tiers[0].price.toLocaleString()}</div>
               </div>
               <div className="text-center p-2 rounded bg-indigo-50 border border-indigo-100 relative">
                 <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[8px] px-2 py-0.5 rounded-full font-bold uppercase">Recommended</div>
                 <div className="text-indigo-600 text-[10px] uppercase font-bold tracking-wider mb-1">{scenario.tiers[1].name}</div>
                 <div className="font-bold text-indigo-700 text-lg">{profile.currency}{scenario.tiers[1].price.toLocaleString()}</div>
               </div>
               <div className="text-center p-2 rounded hover:bg-slate-50 transition-colors">
                 <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">{scenario.tiers[2].name}</div>
                 <div className="font-medium text-slate-700">{profile.currency}{scenario.tiers[2].price.toLocaleString()}</div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;