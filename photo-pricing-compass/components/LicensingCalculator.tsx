import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

const LicensingCalculator: React.FC = () => {
  const [baseFee, setBaseFee] = useState(500);
  
  const [factors, setFactors] = useState({
    media: 1.0, // Web vs Print
    duration: 1.0, // 1 year vs Perpetual
    territory: 1.0, // Local vs Global
    exclusivity: 1.0 // Non-exclusive vs Exclusive
  });

  const calculateTotal = () => {
    return baseFee * factors.media * factors.duration * factors.territory * factors.exclusivity;
  };

  const updateFactor = (key: keyof typeof factors, value: number) => {
    setFactors(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Licensing Calculator</h1>
        <p className="text-slate-600">Determine the value of image usage based on standard multipliers.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
           <label className="block text-sm font-medium text-slate-700 mb-2">Base Creative Fee (Creation Cost)</label>
           <div className="relative">
             <span className="absolute left-3 top-2.5 text-slate-500">$</span>
             <input 
              type="number" 
              value={baseFee}
              onChange={e => setBaseFee(Number(e.target.value))}
              className="w-full pl-8 p-2 border rounded-md font-bold text-lg"
             />
           </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Media Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Media Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Web/Social Only', val: 1.0 },
                { label: 'Print + Web (Small)', val: 1.5 },
                { label: 'Advertising / Billboard', val: 3.0 }
              ].map(opt => (
                <button 
                  key={opt.label}
                  onClick={() => updateFactor('media', opt.val)}
                  className={`p-2 text-sm rounded border ${factors.media === opt.val ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Duration</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '1 Year', val: 1.0 },
                { label: '3-5 Years', val: 1.5 },
                { label: 'Perpetual', val: 2.5 }
              ].map(opt => (
                <button 
                  key={opt.label}
                  onClick={() => updateFactor('duration', opt.val)}
                  className={`p-2 text-sm rounded border ${factors.duration === opt.val ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Territory */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Territory</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Local/Regional', val: 1.0 },
                { label: 'National', val: 1.5 },
                { label: 'Worldwide', val: 2.0 }
              ].map(opt => (
                <button 
                  key={opt.label}
                  onClick={() => updateFactor('territory', opt.val)}
                  className={`p-2 text-sm rounded border ${factors.territory === opt.val ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
           <div>
             <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Usage Fee Only</div>
             <div className="text-xs text-slate-500">Does not include creation costs</div>
           </div>
           <div className="text-right">
             <div className="text-3xl font-bold text-teal-400 font-mono">
               ${Math.round(calculateTotal() - baseFee).toLocaleString()}
             </div>
             <div className="text-sm text-slate-400">
               Total w/ Base: <span className="text-white font-semibold">${Math.round(calculateTotal()).toLocaleString()}</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LicensingCalculator;