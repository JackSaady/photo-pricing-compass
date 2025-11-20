import React, { useState, useEffect } from 'react';
import { UserProfile, Expense } from '../types';
import { Calculator, Plus, Trash2, Save, ArrowRight, Info, HelpCircle, Target } from 'lucide-react';

interface Props {
  currentProfile: UserProfile | null;
  onSave: (profile: UserProfile) => void;
}

const DEFAULT_EXPENSES: Expense[] = [
  { id: '1', name: 'Software Subscriptions (Adobe, CRM)', amount: 60 },
  { id: '2', name: 'Gear Insurance', amount: 40 },
  { id: '3', name: 'Website Hosting', amount: 30 },
  { id: '4', name: 'Marketing/Ads', amount: 200 },
];

const ProfileForm: React.FC<Props> = ({ currentProfile, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>(
    currentProfile || {
      name: '',
      currency: '$',
      annualIncomeGoal: 80000,
      taxRate: 30,
      workWeeksPerYear: 48,
      daysPerWeek: 4,
      hoursPerDay: 8,
      percentBillable: 35,
      expenses: DEFAULT_EXPENSES,
      targetHourlyRate: 0,
      codbHourly: 0,
      targetShootsPerYear: 50,
    }
  );

  const [calculated, setCalculated] = useState({ 
    codb: 0, 
    target: 0, 
    annualExpenses: 0, 
    billableHours: 0,
    grossRevenue: 0 
  });

  const [hypotheticalAvg, setHypotheticalAvg] = useState(1500);

  useEffect(() => {
    const totalMonthlyFixed = formData.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const annualFixed = totalMonthlyFixed * 12;
    
    const totalHoursAvailable = formData.workWeeksPerYear * formData.daysPerWeek * formData.hoursPerDay;
    const annualBillableHours = totalHoursAvailable * (formData.percentBillable / 100);
    
    // Gross Income Needed = NetGoal / (1 - taxRate) + AnnualExpenses
    const taxFactor = 1 - (formData.taxRate / 100);
    const grossRevenueNeeded = (formData.annualIncomeGoal / (taxFactor > 0 ? taxFactor : 1)) + annualFixed;

    const codbHourly = annualBillableHours > 0 ? annualFixed / annualBillableHours : 0;
    const targetHourly = annualBillableHours > 0 ? grossRevenueNeeded / annualBillableHours : 0;

    setCalculated({
      codb: codbHourly,
      target: targetHourly,
      annualExpenses: annualFixed,
      billableHours: annualBillableHours,
      grossRevenue: grossRevenueNeeded
    });
  }, [formData]);

  const handleSave = () => {
    onSave({
      ...formData,
      codbHourly: calculated.codb,
      targetHourlyRate: calculated.target
    });
  };

  const updateExpense = (id: string, field: keyof Expense, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  const addExpense = () => {
    setFormData(prev => ({
      ...prev,
      expenses: [...prev.expenses, { id: Date.now().toString(), name: 'New Expense', amount: 0 }]
    }));
  };

  const removeExpense = (id: string) => {
    setFormData(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id)
    }));
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Your Business Profile</h1>
        <p className="text-slate-600">Let's calculate your true Cost of Doing Business (CODB) to set your pricing floor.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Inputs */}
        <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-lg border-b pb-2 text-slate-800">Business Basics</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <input 
                type="text" 
                value={formData.currency}
                onChange={e => setFormData({...formData, currency: e.target.value})}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="$"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tax Rate (%)</label>
              <input 
                type="number" 
                value={formData.taxRate}
                onChange={e => setFormData({...formData, taxRate: Number(e.target.value)})}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1 group relative w-fit cursor-help">
              Net Annual Income Goal (Take Home)
              <HelpCircle size={14} className="text-slate-400" />
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-3 bg-slate-900 text-slate-200 text-xs rounded-lg shadow-xl z-50 font-normal border border-slate-700">
                This is the actual cash you want to put in your personal pocket this year after all business expenses and taxes have been paid.
              </div>
            </label>
            <input 
              type="number" 
              value={formData.annualIncomeGoal}
              onChange={e => setFormData({...formData, annualIncomeGoal: Number(e.target.value)})}
              className="w-full p-2 border rounded-md text-lg font-semibold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target # of Shoots / Year</label>
            <input 
              type="number" 
              value={formData.targetShootsPerYear}
              onChange={e => setFormData({...formData, targetShootsPerYear: Number(e.target.value)})}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">How many jobs do you ideally want to do?</p>
          </div>

          <h3 className="font-semibold text-lg border-b pb-2 pt-4 text-slate-800">Time Availability</h3>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Work Weeks/Year</label>
              <input 
                type="number" 
                value={formData.workWeeksPerYear}
                onChange={e => setFormData({...formData, workWeeksPerYear: Number(e.target.value)})}
                className="w-full p-2 border rounded-md"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Work Days/Week</label>
              <input 
                type="number" 
                value={formData.daysPerWeek}
                onChange={e => setFormData({...formData, daysPerWeek: Number(e.target.value)})}
                className="w-full p-2 border rounded-md"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Hours/Day</label>
              <input 
                type="number" 
                value={formData.hoursPerDay}
                onChange={e => setFormData({...formData, hoursPerDay: Number(e.target.value)})}
                className="w-full p-2 border rounded-md"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">% Billable Time</label>
              <input 
                type="number" 
                value={formData.percentBillable}
                onChange={e => setFormData({...formData, percentBillable: Number(e.target.value)})}
                className="w-full p-2 border rounded-md"
              />
              <p className="text-xs text-slate-400 mt-1">Time actually shooting/editing paid work.</p>
            </div>
          </div>

          <h3 className="font-semibold text-lg border-b pb-2 pt-4 flex justify-between items-center text-slate-800">
            Monthly Expenses
            <button onClick={addExpense} className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50"><Plus size={18} /></button>
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {formData.expenses.map(expense => (
              <div key={expense.id} className="flex gap-2 items-center">
                <input 
                  value={expense.name}
                  onChange={e => updateExpense(expense.id, 'name', e.target.value)}
                  className="flex-1 p-2 border rounded-md text-sm"
                  placeholder="Expense Name"
                />
                <input 
                  type="number"
                  value={expense.amount}
                  onChange={e => updateExpense(expense.id, 'amount', Number(e.target.value))}
                  className="w-24 p-2 border rounded-md text-sm"
                />
                <button onClick={() => removeExpense(expense.id)} className="text-red-400 hover:text-red-600 p-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Results */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-xl shadow-lg space-y-8 sticky top-6">
            <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
              <Calculator className="text-teal-400 h-6 w-6" />
              <h2 className="text-xl font-bold">Your Rate Compass</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 relative group hover:border-indigo-500 transition-colors">
                <div className="flex items-center gap-2 mb-1 cursor-help">
                  <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Minimum Hourly Rate</div>
                  <HelpCircle size={14} className="text-slate-500" />
                </div>
                
                {/* Tooltip */}
                <div className="absolute top-full left-0 mt-2 hidden group-hover:block w-80 p-5 bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded-xl shadow-2xl z-50">
                  <p className="font-semibold mb-3 text-teal-400 text-sm">How is this calculated?</p>
                  <div className="space-y-2 font-mono text-xs text-slate-300">
                    <div className="flex justify-between">
                       <span>Annual Net Goal:</span>
                       <span>{formData.currency}{formData.annualIncomeGoal.toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between text-amber-400">
                       <span>+ Tax Buffer ({formData.taxRate}%):</span>
                       <span>{formData.currency}{Math.round((formData.annualIncomeGoal / (1 - formData.taxRate/100)) - formData.annualIncomeGoal).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-red-400">
                       <span>+ Annual Expenses:</span>
                       <span>{formData.currency}{calculated.annualExpenses.toLocaleString()}</span>
                    </div>
                     <div className="border-t border-slate-600 my-1 pt-1 flex justify-between font-bold text-white">
                       <span>= Gross Revenue Needed:</span>
                       <span>{formData.currency}{Math.round(calculated.grossRevenue).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-teal-400 pt-1 border-t border-slate-700 mt-2">
                       <span>÷ Billable Hours ({formData.percentBillable}%):</span>
                       <span>{Math.round(calculated.billableHours)} hrs</span>
                    </div>
                  </div>
                </div>

                <div className="text-5xl font-bold text-teal-400 mt-2 font-mono">
                  {formData.currency}{calculated.target.toFixed(2)}
                </div>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                  This is your <strong>absolute floor</strong>. You must charge at least this for every hour spent working (shooting, editing, driving) to meet your income goal.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 relative group hover:border-indigo-500 transition-colors">
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="text-slate-400 text-xs uppercase font-semibold">CODB (Hourly)</div>
                    <HelpCircle size={12} className="text-slate-500" />
                  </div>

                   {/* Tooltip */}
                   <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-4 bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded-xl shadow-xl z-50">
                      <p className="font-semibold mb-2 text-white">Cost of Doing Business</p>
                      <p className="mb-2">This is what it costs you to keep the lights on per billable hour, before you pay yourself a single dollar.</p>
                      <div className="font-mono bg-slate-950 p-2 rounded border border-slate-700">
                        {formData.currency}{calculated.annualExpenses.toLocaleString()} (Exp) ÷ {Math.round(calculated.billableHours)} (Hrs)
                      </div>
                    </div>

                  <div className="text-2xl font-semibold text-white mt-1">
                    {formData.currency}{calculated.codb.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Break-even point</div>
                </div>
                
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <div className="text-slate-400 text-xs uppercase font-semibold">Billable Hours/Yr</div>
                  <div className="text-2xl font-semibold text-white mt-1">
                    {Math.round(calculated.billableHours)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Capacity limit ({formData.percentBillable}%)</div>
                </div>
              </div>

              {/* Volume Strategy Card */}
              <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 relative">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={16} className="text-indigo-400" />
                  <h3 className="text-slate-200 font-semibold text-sm">Volume Strategy</h3>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Required Average Sale per Shoot</div>
                    <div className="text-3xl font-bold text-white font-mono">
                      {formData.currency}{Math.round(calculated.grossRevenue / (formData.targetShootsPerYear || 1)).toLocaleString()}
                    </div>
                    <div className="text-xs text-indigo-300 mt-1">
                      Based on {formData.targetShootsPerYear} shoots / year
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-700">
                    <label className="text-xs text-slate-400 block mb-2">Reverse Calculator: If I charge...</label>
                    <div className="flex items-center gap-2">
                      <div className="relative w-24">
                        <span className="absolute left-2 top-1.5 text-slate-500 text-xs">{formData.currency}</span>
                        <input 
                          type="number" 
                          value={hypotheticalAvg}
                          onChange={(e) => setHypotheticalAvg(Number(e.target.value))}
                          className="w-full pl-5 p-1 text-sm bg-slate-900 border border-slate-600 rounded text-white"
                        />
                      </div>
                      <div className="text-sm text-slate-300">
                        → need <span className="font-bold text-white">{Math.ceil(calculated.grossRevenue / (hypotheticalAvg || 1))}</span> shoots/yr
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-4">
              <button 
                onClick={handleSave}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-900/20"
              >
                <Save size={20} />
                Save Profile & Start Pricing
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;