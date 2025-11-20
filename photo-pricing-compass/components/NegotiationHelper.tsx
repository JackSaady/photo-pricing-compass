import React, { useState } from 'react';
import { ScenarioData, UserProfile } from '../types';
import { getNegotiationAdvice } from '../services/geminiService';
import { MessageSquare, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface Props {
  scenarios: ScenarioData[];
  profile: UserProfile;
}

const NegotiationHelper: React.FC<Props> = ({ scenarios, profile }) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('');
  const [clientBudget, setClientBudget] = useState<number>(0);
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const selectedScenario = scenarios.find(s => s.id === selectedScenarioId);

  const handleGetAdvice = async () => {
    if (!selectedScenario) return;
    setLoading(true);
    const result = await getNegotiationAdvice(selectedScenario, clientBudget, profile);
    setAdvice(result);
    setLoading(false);
  };

  if (scenarios.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">No Scenarios Found</h2>
        <p className="text-slate-600 mt-2">Please create and save a pricing scenario first to use the negotiator.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Negotiation Helper</h1>
        <p className="text-slate-600">Bridge the gap between your value and their budget without losing money.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Scenario</label>
            <select 
              className="w-full p-2 border rounded-md bg-white"
              value={selectedScenarioId}
              onChange={e => setSelectedScenarioId(e.target.value)}
            >
              <option value="">-- Choose a Quote --</option>
              {scenarios.map(s => (
                <option key={s.id} value={s.id}>{s.title} ({new Date(s.date).toLocaleDateString()})</option>
              ))}
            </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Client's Stated Budget</label>
             <div className="relative">
               <span className="absolute left-3 top-2 text-slate-500">{profile.currency}</span>
               <input 
                type="number" 
                className="w-full pl-8 p-2 border rounded-md"
                value={clientBudget}
                onChange={e => setClientBudget(Number(e.target.value))}
               />
             </div>
          </div>
        </div>

        {selectedScenario && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Current Quote Range</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              {selectedScenario.tiers.map(tier => (
                <div key={tier.name} className={clientBudget >= tier.price ? 'text-green-600' : 'text-slate-400'}>
                   <div className="text-xs font-medium">{tier.name}</div>
                   <div className="font-bold text-lg">{profile.currency}{tier.price}</div>
                   {clientBudget >= tier.price && <CheckCircle2 className="w-4 h-4 mx-auto mt-1" />}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleGetAdvice}
            disabled={!selectedScenario || !clientBudget || loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            Get AI Strategy
          </button>
        </div>
      </div>

      {advice && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <h3 className="font-bold text-indigo-900 text-lg mb-4 flex items-center gap-2">
            <SparklesIcon /> 
            Strategic Adjustments
          </h3>
          <div className="prose prose-indigo text-slate-700">
            {advice.split('\n').map((line, i) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SparklesIcon = () => (
  <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor"/>
  </svg>
);

export default NegotiationHelper;