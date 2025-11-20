
import React, { useState, useEffect } from 'react';
import { ScenarioType, UserProfile, QuoteTier, ScenarioData, ProjectExpense } from '../types';
import { Briefcase, Users, Calendar, Image as ImageIcon, Save, CheckCircle, Info, ChevronDown, ChevronUp, Plus, Trash2, RotateCcw, Sparkles } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onSave: (scenario: ScenarioData) => void;
  initialScenario?: ScenarioData | null;
}

interface TierConfig {
  name: string;
  description: string;
  features: string[];
}

const DEFAULT_TIER_CONFIGS: TierConfig[] = [
  {
    name: 'Essential',
    description: 'Efficient coverage to get the job done.',
    features: ['Standard Turnaround', 'Web Usage Rights', 'Basic Retouching']
  },
  {
    name: 'Standard',
    description: 'Recommended balance of value and impact.',
    features: ['Priority Turnaround', 'Print & Web Usage', 'High-End Retouching', 'Strategy Call']
  },
  {
    name: 'Premium',
    description: 'White-glove service with maximum flexibility.',
    features: ['Rush Delivery (24h)', 'Full Buyout / Extensive Usage', 'Unlimited Looks', 'Hair & Makeup Included']
  }
];

const FEATURE_SUGGESTIONS = [
  "High-End Retouching", "24h Rush Delivery", "Full Buyout", 
  "RAW Files", "Social Media Crops", "Print Release", 
  "Online Gallery", "Wardrobe Styling", "Hair & Makeup", 
  "Commercial License", "Same-Day Selects"
];

const ScenarioBuilder: React.FC<Props> = ({ profile, onSave, initialScenario }) => {
  const [type, setType] = useState<ScenarioType>(initialScenario?.type || ScenarioType.INDIVIDUAL);
  const [title, setTitle] = useState(initialScenario?.title || '');
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  const [inputs, setInputs] = useState<Record<string, number | string>>({
    shootHours: 2,
    editTimeRatio: 0.5, 
    travelHours: 1,
    images: 5,
    retouchTime: 15, 
    peopleCount: 1,
    minsPerPerson: 15,
    monthlyHours: 10,
    adminHours: 2,
    baseLicenseFee: 500,
    licensingMultiplier: 1.0,
    ...initialScenario?.inputs
  });

  // Itemized Expenses
  const [projectExpenses, setProjectExpenses] = useState<ProjectExpense[]>(initialScenario?.projectExpenses || [
    { id: '1', name: 'Assistant / Grip', amount: 0 },
    { id: '2', name: 'Studio Rental', amount: 0 },
    { id: '3', name: 'Parking / Meals', amount: 0 },
  ]);

  // Editable Content for Tiers
  const [tierConfigs, setTierConfigs] = useState<TierConfig[]>(
    initialScenario?.tiers.map(t => ({
      name: t.name,
      description: t.description,
      features: t.features
    })) || DEFAULT_TIER_CONFIGS
  );

  // Calculated values (prices, margins)
  const [calculatedStats, setCalculatedStats] = useState<Array<{price: number, hourly: number, margin: number}>>([]);
  const [debugData, setDebugData] = useState<any>(null);

  useEffect(() => {
    calculatePricing();
  }, [inputs, type, profile, projectExpenses]);

  const updateInput = (key: string, value: any) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const addProjectExpense = () => {
    setProjectExpenses(prev => [...prev, { id: Date.now().toString(), name: '', amount: 0 }]);
  };

  const updateProjectExpense = (id: string, field: keyof ProjectExpense, value: string | number) => {
    setProjectExpenses(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeProjectExpense = (id: string) => {
    setProjectExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Tier Content Handlers
  const updateTierConfig = (index: number, field: keyof TierConfig, value: any) => {
    setTierConfigs(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
  };

  const addFeatureToTier = (tierIndex: number, feature: string) => {
    const currentFeatures = tierConfigs[tierIndex].features;
    if (!currentFeatures.includes(feature)) {
      updateTierConfig(tierIndex, 'features', [...currentFeatures, feature]);
    }
  };

  const removeFeatureFromTier = (tierIndex: number, featureIndex: number) => {
    const newFeatures = tierConfigs[tierIndex].features.filter((_, i) => i !== featureIndex);
    updateTierConfig(tierIndex, 'features', newFeatures);
  };

  const calculatePricing = () => {
    let totalHours = 0;
    let breakdown = { shoot: 0, edit: 0, travel: 0, admin: 0, retouch: 0 };
    
    // 1. Calculate Total Time
    if (type === ScenarioType.INDIVIDUAL) {
      breakdown.shoot = Number(inputs.shootHours);
      const baseEditHours = breakdown.shoot * Number(inputs.editTimeRatio);
      const retouchHours = (Number(inputs.images) * Number(inputs.retouchTime)) / 60;
      breakdown.retouch = retouchHours;
      breakdown.edit = baseEditHours + retouchHours;
      breakdown.travel = Number(inputs.travelHours);
      breakdown.admin = Number(inputs.adminHours);
    } else if (type === ScenarioType.TEAM) {
      const minsPerPerson = Number(inputs.minsPerPerson || 15);
      breakdown.shoot = (Number(inputs.peopleCount) * minsPerPerson) / 60;
      const baseEditHours = breakdown.shoot * Number(inputs.editTimeRatio);
      const retouchMins = Number(inputs.retouchTime) || 10;
      const retouchHours = (Number(inputs.peopleCount) * retouchMins) / 60;
      breakdown.retouch = retouchHours;
      breakdown.edit = baseEditHours + retouchHours;
      breakdown.travel = Number(inputs.travelHours);
      breakdown.admin = Number(inputs.adminHours);
    } else if (type === ScenarioType.RETAINER) {
      breakdown.shoot = Number(inputs.monthlyHours || 10);
      breakdown.admin = Number(inputs.adminHours);
    } else if (type === ScenarioType.LICENSING) {
      breakdown.admin = Number(inputs.adminHours);
    }

    totalHours = breakdown.shoot + breakdown.edit + breakdown.travel + breakdown.admin;

    // 2. Calculate Base Cost (CODB)
    const costBasis = totalHours * profile.codbHourly;
    const laborValue = totalHours * profile.targetHourlyRate;
    
    // Sum Itemized Expenses
    const totalHardCosts = projectExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
    
    const licensingBase = type === ScenarioType.LICENSING ? Number(inputs.baseLicenseFee) : 0;

    const basePrice = laborValue + totalHardCosts + licensingBase;

    // 3. Tier Multipliers
    // Essential: Bare minimum target
    const essentialPrice = basePrice;
    
    // Standard: Target + 25% buffer + Licensing Factor
    const standardPrice = (basePrice * 1.25) * (Number(inputs.licensingMultiplier) || 1);
    
    // Premium: Target + 50% buffer + Rush/HighTouch
    const premiumPrice = (basePrice * 1.6) * (Number(inputs.licensingMultiplier) || 1);

    const calculateMargin = (price: number) => {
      if (price === 0) return 0;
      const totalCost = costBasis + totalHardCosts; 
      return Math.round(((price - totalCost) / price) * 100);
    };

    setDebugData({
      breakdown,
      totalHours,
      laborValue,
      expenses: totalHardCosts,
      costBasis
    });

    setCalculatedStats([
      {
        price: Math.round(essentialPrice),
        hourly: totalHours > 0 ? essentialPrice / totalHours : 0,
        margin: calculateMargin(essentialPrice)
      },
      {
        price: Math.round(standardPrice),
        hourly: totalHours > 0 ? standardPrice / totalHours : 0,
        margin: calculateMargin(standardPrice)
      },
      {
        price: Math.round(premiumPrice),
        hourly: totalHours > 0 ? premiumPrice / totalHours : 0,
        margin: calculateMargin(premiumPrice)
      }
    ]);
  };

  const handleSave = () => {
    if (calculatedStats.length !== 3) return;
    
    const finalTiers: [QuoteTier, QuoteTier, QuoteTier] = [
      { ...tierConfigs[0], price: calculatedStats[0].price, hourlyRateEffective: calculatedStats[0].hourly, margin: calculatedStats[0].margin },
      { ...tierConfigs[1], price: calculatedStats[1].price, hourlyRateEffective: calculatedStats[1].hourly, margin: calculatedStats[1].margin },
      { ...tierConfigs[2], price: calculatedStats[2].price, hourlyRateEffective: calculatedStats[2].hourly, margin: calculatedStats[2].margin }
    ];

    onSave({
      id: initialScenario?.id || Date.now().toString(),
      date: new Date().toISOString(),
      type,
      title: title || `${type} Quote`,
      inputs,
      projectExpenses,
      tiers: finalTiers,
      status: 'Draft'
    });
  };

  const TypeCard = ({ t, icon: Icon, label }: any) => (
    <button 
      onClick={() => setType(t)}
      className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all h-20 ${type === t ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-indigo-200 text-slate-600'}`}
    >
      <Icon className="mb-1 h-5 w-5" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Left Panel: Inputs (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Create Pricing Scenario</h2>
          <input 
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Client Name / Project Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          <TypeCard t={ScenarioType.INDIVIDUAL} icon={Briefcase} label="Indiv" />
          <TypeCard t={ScenarioType.TEAM} icon={Users} label="Team" />
          <TypeCard t={ScenarioType.RETAINER} icon={Calendar} label="Retainer" />
          <TypeCard t={ScenarioType.LICENSING} icon={ImageIcon} label="License" />
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-semibold text-slate-800 border-b pb-2 text-sm uppercase tracking-wide">Scope Inputs</h3>
          
          {type === ScenarioType.INDIVIDUAL && (
            <>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Shoot Duration (Hours)</label>
                <input type="number" className="w-full p-2 border rounded bg-slate-50" value={inputs.shootHours} onChange={e => updateInput('shootHours', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Images</label>
                  <input type="number" className="w-full p-2 border rounded bg-slate-50" value={inputs.images} onChange={e => updateInput('images', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Retouch (mins)</label>
                  <input type="number" className="w-full p-2 border rounded bg-slate-50" value={inputs.retouchTime} onChange={e => updateInput('retouchTime', e.target.value)} />
                  <span className="text-[10px] text-slate-400">Per image</span>
                </div>
              </div>
            </>
          )}

          {type === ScenarioType.TEAM && (
            <>
               <div>
                <label className="block text-sm text-slate-600 mb-1">Number of People</label>
                <input type="number" className="w-full p-2 border rounded bg-slate-50" value={inputs.peopleCount} onChange={e => updateInput('peopleCount', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Mins/Person</label>
                  <input type="number" className="w-full p-2 border rounded bg-slate-50" value={inputs.minsPerPerson} onChange={e => updateInput('minsPerPerson', e.target.value)} />
                  <span className="text-[10px] text-slate-400">Shooting time</span>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Retouch (mins)</label>
                  <input type="number" className="w-full p-2 border rounded bg-slate-50" value={inputs.retouchTime} onChange={e => updateInput('retouchTime', e.target.value)} />
                  <span className="text-[10px] text-slate-400">Per person</span>
                </div>
              </div>
            </>
          )}

          {type === ScenarioType.RETAINER && (
            <div>
               <label className="block text-sm text-slate-600 mb-1">Monthly Hours</label>
               <input type="number" className="w-full p-2 border rounded bg-slate-50" value={inputs.monthlyHours} onChange={e => updateInput('monthlyHours', e.target.value)} />
             </div>
          )}

          {type === ScenarioType.LICENSING && (
            <div>
              <label className="block text-sm text-slate-600 mb-1">Base License Fee</label>
              <input type="number" className="w-full p-2 border rounded bg-slate-50" value={inputs.baseLicenseFee} onChange={e => updateInput('baseLicenseFee', e.target.value)} />
            </div>
          )}

          <div className="pt-4 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Travel (Hrs)</label>
                <input type="number" className="w-full p-2 border rounded text-sm" value={inputs.travelHours} onChange={e => updateInput('travelHours', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Cull/Admin Ratio</label>
                <input type="number" step="0.1" className="w-full p-2 border rounded text-sm" value={inputs.editTimeRatio} onChange={e => updateInput('editTimeRatio', e.target.value)} />
                <span className="text-[10px] text-slate-400">Multiplied by shoot time</span>
              </div>
            </div>
            <div className="mt-3">
                <label className="block text-xs text-slate-500 mb-1">Admin Hours (Fixed)</label>
                <input type="number" className="w-full p-2 border rounded text-sm" value={inputs.adminHours} onChange={e => updateInput('adminHours', e.target.value)} />
            </div>
          </div>

          {/* Itemized Expenses */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center mb-2">
               <label className="block text-xs text-slate-500 uppercase tracking-wider font-bold">Job Expenses</label>
               <button onClick={addProjectExpense} className="text-xs bg-slate-100 hover:bg-slate-200 p-1 rounded text-slate-600 flex items-center gap-1">
                 <Plus size={12} /> Add
               </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
              {projectExpenses.map(exp => (
                <div key={exp.id} className="flex gap-1 items-center">
                  <input 
                    className="flex-1 p-1.5 border rounded text-xs bg-slate-50"
                    placeholder="Item"
                    value={exp.name}
                    onChange={e => updateProjectExpense(exp.id, 'name', e.target.value)}
                  />
                  <div className="relative w-20">
                    <span className="absolute left-1.5 top-1.5 text-xs text-slate-400">$</span>
                    <input 
                      type="number"
                      className="w-full pl-3.5 p-1.5 border rounded text-xs text-right bg-slate-50"
                      value={exp.amount}
                      onChange={e => updateProjectExpense(exp.id, 'amount', Number(e.target.value))}
                    />
                  </div>
                  <button onClick={() => removeProjectExpense(exp.id)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 size={12}/></button>
                </div>
              ))}
              <div className="text-right text-xs font-bold text-slate-700 pt-1">
                Total: {profile.currency}{projectExpenses.reduce((acc, cur) => acc + Number(cur.amount), 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Output (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
         
         {/* Breakdown Toggle */}
         {debugData && (
           <div className="bg-indigo-50 border border-indigo-100 rounded-lg overflow-hidden">
             <button 
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full flex justify-between items-center p-3 text-sm font-medium text-indigo-800 hover:bg-indigo-100 transition-colors"
             >
               <div className="flex items-center gap-2">
                 <Info className="w-4 h-4" />
                 Pricing Breakdown
               </div>
               {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
             </button>
             
             {showBreakdown && (
               <div className="p-4 bg-white text-sm text-slate-600 space-y-3">
                 <p className="text-xs text-slate-500 mb-2">
                   Total Cost = (Total Hours × Target Hourly Rate {profile.currency}{profile.targetHourlyRate.toFixed(0)}) + Hard Expenses
                 </p>
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 bg-slate-50 rounded border border-slate-100">
                    <div>
                      <div className="text-[10px] uppercase text-slate-400 font-bold">Shooting</div>
                      <div className="font-mono text-indigo-600">{debugData.breakdown.shoot.toFixed(1)}h</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-slate-400 font-bold">Retouch</div>
                      <div className="font-mono text-indigo-600">{debugData.breakdown.retouch.toFixed(1)}h</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-slate-400 font-bold">Cull/Admin</div>
                      <div className="font-mono text-indigo-600">{(debugData.breakdown.edit - debugData.breakdown.retouch + debugData.breakdown.admin).toFixed(1)}h</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-slate-400 font-bold">Travel</div>
                      <div className="font-mono text-indigo-600">{debugData.breakdown.travel.toFixed(1)}h</div>
                    </div>
                    <div className="border-l pl-2 border-slate-200">
                      <div className="text-[10px] uppercase text-slate-400 font-bold">Total</div>
                      <div className="font-mono font-bold text-slate-900">{debugData.totalHours.toFixed(1)}h</div>
                    </div>
                 </div>
                 <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                   <span>Calculation: {debugData.totalHours.toFixed(1)} hrs × {profile.currency}{profile.targetHourlyRate.toFixed(0)}/hr + {profile.currency}{debugData.expenses} Exp</span>
                   <span className="font-bold">Base Cost: {profile.currency}{Math.round(debugData.laborValue + debugData.expenses)}</span>
                 </div>
               </div>
             )}
           </div>
         )}

         {/* Tiers Display */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {calculatedStats.length > 0 && calculatedStats.map((stat, idx) => (
              <div key={idx} className={`rounded-xl overflow-hidden border-2 flex flex-col ${idx === 1 ? 'border-indigo-500 shadow-lg ring-1 ring-indigo-500 relative transform md:-translate-y-2 bg-white' : 'border-slate-200 bg-white'}`}>
                {idx === 1 && <div className="bg-indigo-500 text-white text-xs font-bold text-center py-1">RECOMMENDED</div>}
                
                <div className="p-4 flex-1 flex flex-col space-y-3">
                  {/* Editable Name */}
                  <input 
                    value={tierConfigs[idx].name}
                    onChange={(e) => updateTierConfig(idx, 'name', e.target.value)}
                    className={`w-full text-lg font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none ${idx === 1 ? 'text-indigo-600' : 'text-slate-800'}`}
                  />
                  
                  <div className="text-3xl font-bold text-slate-900">
                    {profile.currency}{stat.price.toLocaleString()}
                  </div>

                  {/* Editable Description */}
                  <textarea 
                    value={tierConfigs[idx].description}
                    onChange={(e) => updateTierConfig(idx, 'description', e.target.value)}
                    className="w-full text-sm text-slate-500 bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-300 rounded p-1 resize-none outline-none h-16"
                  />
                  
                  {/* Editable Features */}
                  <div className="flex-1 space-y-2">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Includes</div>
                    <ul className="space-y-2">
                      {tierConfigs[idx].features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 group">
                          <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                          <span className="flex-1">{f}</span>
                          <button 
                            onClick={() => removeFeatureFromTier(idx, i)}
                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400"
                          >
                            <Trash2 size={12} />
                          </button>
                        </li>
                      ))}
                    </ul>

                    {/* Add Feature Input */}
                    <div className="relative group mt-2">
                      <input 
                        placeholder="+ Add feature"
                        className="w-full text-xs p-1.5 pl-2 bg-slate-50 rounded border border-transparent hover:border-slate-200 focus:border-indigo-300 outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addFeatureToTier(idx, e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Suggestion Chips */}
                  {idx === 1 && (
                    <div className="pt-4 border-t border-slate-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1">
                        <Sparkles size={10} /> Quick Add Features
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {FEATURE_SUGGESTIONS.map(s => (
                          <button 
                            key={s}
                            onClick={() => addFeatureToTier(idx, s)}
                            className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 rounded-full transition-colors"
                          >
                            + {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 space-y-2 mt-auto">
                     <div className="flex justify-between text-xs text-slate-500">
                       <span>Effective Rate:</span>
                       <span className="font-mono font-medium text-slate-700">{profile.currency}{Math.round(stat.hourly)}/hr</span>
                     </div>
                     <div className="flex justify-between text-xs text-slate-500">
                       <span>Profit Margin:</span>
                       <span className={`font-mono font-medium ${stat.margin > 50 ? 'text-green-600' : stat.margin > 20 ? 'text-amber-600' : 'text-red-500'}`}>{Math.round(stat.margin)}%</span>
                     </div>
                  </div>
                </div>
              </div>
            ))}
         </div>

         <div className="flex justify-between items-center">
            <button 
              onClick={() => setTierConfigs(DEFAULT_TIER_CONFIGS)}
              className="text-slate-400 hover:text-slate-600 text-sm flex items-center gap-2 px-3 py-2"
            >
              <RotateCcw size={14} />
              Reset Defaults
            </button>
            <button 
              onClick={handleSave}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              <Save size={18} />
              Save Scenario to History
            </button>
         </div>
      </div>
    </div>
  );
};

export default ScenarioBuilder;
