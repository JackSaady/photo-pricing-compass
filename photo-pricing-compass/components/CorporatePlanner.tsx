import React, { useState } from 'react';
import { getCorporatePlanStrategy } from '../services/geminiService';
import { Users, Clock, Calendar, Sparkles, Loader2 } from 'lucide-react';

const CorporatePlanner: React.FC = () => {
  const [headcount, setHeadcount] = useState(50);
  const [days, setDays] = useState(1);
  const [hoursPerDay, setHoursPerDay] = useState(6);
  const [strategy, setStrategy] = useState('');
  const [loading, setLoading] = useState(false);

  const minsPerPerson = (days * hoursPerDay * 60) / headcount;

  const handleGetStrategy = async () => {
    setLoading(true);
    const advice = await getCorporatePlanStrategy(headcount, days, hoursPerDay);
    setStrategy(advice);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Corporate & Multi-Day Planner</h1>
        <p className="text-slate-600">Logistics calculator for high-volume headshot projects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
          <Users className="w-8 h-8 text-indigo-600 mb-4" />
          <label className="text-sm font-medium text-slate-700 mb-2">Total Headcount</label>
          <input 
            type="number" 
            value={headcount} 
            onChange={(e) => setHeadcount(Number(e.target.value))}
            className="w-24 text-center p-2 border rounded-md text-xl font-bold" 
          />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
          <Calendar className="w-8 h-8 text-indigo-600 mb-4" />
          <label className="text-sm font-medium text-slate-700 mb-2">Shooting Days</label>
          <input 
            type="number" 
            value={days} 
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-24 text-center p-2 border rounded-md text-xl font-bold" 
          />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
          <Clock className="w-8 h-8 text-indigo-600 mb-4" />
          <label className="text-sm font-medium text-slate-700 mb-2">Hours per Day</label>
          <input 
            type="number" 
            value={hoursPerDay} 
            onChange={(e) => setHoursPerDay(Number(e.target.value))}
            className="w-24 text-center p-2 border rounded-md text-xl font-bold" 
          />
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-xl shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-300 mb-1">Pace Calculation</h3>
            <div className="text-5xl font-mono font-bold text-teal-400">{Math.floor(minsPerPerson)}m {Math.round((minsPerPerson % 1) * 60)}s</div>
            <p className="text-slate-400 mt-2">Time allowed per person (shoot + review)</p>
          </div>
          <div className="space-y-2 border-l border-slate-700 pl-8">
            <p className={`text-sm ${minsPerPerson < 5 ? 'text-red-400' : 'text-slate-300'}`}>
              {minsPerPerson < 5 ? '⚠️ WARNING: This pace is extremely fast. Quality may suffer without an assistant.' : '✅ This implies a comfortable pace.'}
            </p>
            <p className="text-sm text-slate-300">Total Shooting Hours: <span className="font-bold">{days * hoursPerDay}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-indigo-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Logistics Strategy
          </h3>
          <button 
            onClick={handleGetStrategy}
            disabled={loading}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin h-3 w-3" /> : 'Generate Plan'}
          </button>
        </div>
        
        {strategy ? (
          <div className="prose prose-indigo text-slate-700 text-sm">
            <p>{strategy}</p>
          </div>
        ) : (
          <p className="text-sm text-indigo-400 italic">Click generate to get a recommended flow for this specific volume.</p>
        )}
      </div>
    </div>
  );
};

export default CorporatePlanner;