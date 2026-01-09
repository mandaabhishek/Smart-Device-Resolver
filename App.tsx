import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Stepper } from './components/Stepper';
import { diagnoseDevice } from './services/geminiService';
import { AppState, Step, DeviceType, DeviceSpecs, DiagnosisResult } from './types';
import { 
  Laptop, Smartphone, Monitor, HardDrive, Cpu, 
  ArrowRight, AlertTriangle, CheckCircle, RefreshCcw, 
  Thermometer, Battery, Activity, Search
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

// --- Sub-Components (Usually separate files, but combined for single-file requirement context) ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' }> = ({ 
  children, variant = 'primary', className = '', ...props 
}) => {
  const baseStyle = "px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 focus:ring-blue-500",
    secondary: "bg-slate-800 hover:bg-slate-900 text-white shadow-lg focus:ring-slate-500",
    outline: "border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-600 bg-transparent"
  };
  return <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void; selected?: boolean }> = ({ 
  children, className = '', onClick, selected 
}) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-2xl p-6 border transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md' : ''} 
    ${selected ? 'border-blue-600 ring-2 ring-blue-100 shadow-md' : 'border-slate-200 shadow-sm'} ${className}`}
  >
    {children}
  </div>
);

// --- Main App ---

export default function App() {
  const [state, setState] = useState<AppState>({
    currentStep: Step.LANDING,
    deviceType: null,
    symptoms: '',
    selectedSymptomTags: [],
    specs: {
      brand: '',
      model: '',
      ram: '',
      storage: '',
      processor: '',
      ageYears: 1
    },
    diagnosis: null,
    isLoading: false,
    error: null
  });

  const nextStep = () => setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
  const prevStep = () => setState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
  const setStep = (step: Step) => setState(prev => ({ ...prev, currentStep: step }));

  // Handlers
  const handleDiagnosis = async () => {
    setState(prev => ({ ...prev, currentStep: Step.ANALYZING, isLoading: true, error: null }));
    try {
      const result = await diagnoseDevice(
        state.deviceType!,
        state.specs,
        state.symptoms,
        state.selectedSymptomTags
      );
      setState(prev => ({ ...prev, diagnosis: result, isLoading: false, currentStep: Step.RESULTS }));
    } catch (e) {
      setState(prev => ({ ...prev, isLoading: false, error: "Failed to diagnose device. Please try again." }));
    }
  };

  const resetApp = () => {
    setState({
      currentStep: Step.LANDING,
      deviceType: null,
      symptoms: '',
      selectedSymptomTags: [],
      specs: { brand: '', model: '', ram: '', storage: '', processor: '', ageYears: 1 },
      diagnosis: null,
      isLoading: false,
      error: null
    });
  };

  // --- Screens ---

  const renderLanding = () => (
    <div className="text-center py-12 space-y-8 animate-fade-in">
      <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-4">
        <Activity className="w-8 h-8 text-blue-600" />
      </div>
      <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
        Diagnose & Upgrade <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          Your Electronics
        </span>
      </h1>
      <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
        Is your laptop slow? Overheating? Use our AI-powered tool to identify issues and get tailored upgrade recommendations instantly.
      </p>
      <div className="flex justify-center gap-4 pt-4">
        <Button onClick={nextStep} className="text-lg px-8 py-4">
          Start Checkup <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
        {[
          { title: "Identify Issues", desc: "Pinpoint hardware failures or bottlenecks.", icon: <Search className="w-6 h-6 text-blue-500" /> },
          { title: "Get Recommendations", desc: "Find exact RAM or SSD upgrades compatible with your model.", icon: <Cpu className="w-6 h-6 text-indigo-500" /> },
          { title: "Estimate Costs", desc: "See price estimates for parts and repairs.", icon: <CheckCircle className="w-6 h-6 text-emerald-500" /> }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4 bg-slate-50 w-12 h-12 rounded-lg flex items-center justify-center">{item.icon}</div>
            <h3 className="font-bold text-lg mb-2 text-slate-800">{item.title}</h3>
            <p className="text-slate-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCategory = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">What device are you checking?</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { type: DeviceType.LAPTOP, icon: <Laptop className="w-8 h-8" /> },
          { type: DeviceType.DESKTOP, icon: <Monitor className="w-8 h-8" /> },
          { type: DeviceType.SMARTPHONE, icon: <Smartphone className="w-8 h-8" /> },
        ].map((item) => (
          <Card 
            key={item.type} 
            selected={state.deviceType === item.type}
            onClick={() => setState(prev => ({ ...prev, deviceType: item.type }))}
            className="flex flex-col items-center justify-center gap-4 py-10 hover:border-blue-300"
          >
            <div className={`p-4 rounded-full ${state.deviceType === item.type ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
              {item.icon}
            </div>
            <span className="font-semibold">{item.type}</span>
          </Card>
        ))}
      </div>
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={prevStep}>Back</Button>
        <Button disabled={!state.deviceType} onClick={nextStep}>Next Step</Button>
      </div>
    </div>
  );

  const renderSymptoms = () => {
    const commonTags = ["Slow Performance", "Overheating", "Blue Screen", "Battery Draining Fast", "Noisy Fan", "Wifi Issues", "App Crashes"];
    
    const toggleTag = (tag: string) => {
      if (state.selectedSymptomTags.includes(tag)) {
        setState(prev => ({ ...prev, selectedSymptomTags: prev.selectedSymptomTags.filter(t => t !== tag) }));
      } else {
        setState(prev => ({ ...prev, selectedSymptomTags: [...prev.selectedSymptomTags, tag] }));
      }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">What's wrong?</h2>
        <p className="text-slate-500">Select all that apply or describe the issue below.</p>
        
        <div className="flex flex-wrap gap-2">
          {commonTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                state.selectedSymptomTags.includes(tag) 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Detailed Description</label>
          <textarea
            className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-32"
            placeholder="E.g., My laptop freezes when I open more than 3 tabs..."
            value={state.symptoms}
            onChange={(e) => setState(prev => ({ ...prev, symptoms: e.target.value }))}
          />
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={prevStep}>Back</Button>
          <Button disabled={state.selectedSymptomTags.length === 0 && state.symptoms.length < 5} onClick={nextStep}>Next Step</Button>
        </div>
      </div>
    );
  };

  const renderSpecs = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Device Specifications</h2>
      <p className="text-slate-500">Provide details to help us recommend compatible parts.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
          <input 
            type="text" 
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. Dell, Apple, Lenovo"
            value={state.specs.brand}
            onChange={(e) => setState(prev => ({ ...prev, specs: { ...prev.specs, brand: e.target.value } }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Model (if known)</label>
          <input 
            type="text" 
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. XPS 15, MacBook Air M1"
            value={state.specs.model}
            onChange={(e) => setState(prev => ({ ...prev, specs: { ...prev.specs, model: e.target.value } }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Current RAM</label>
          <select 
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={state.specs.ram}
            onChange={(e) => setState(prev => ({ ...prev, specs: { ...prev.specs, ram: e.target.value } }))}
          >
            <option value="">Select RAM</option>
            <option value="4GB">4GB</option>
            <option value="8GB">8GB</option>
            <option value="16GB">16GB</option>
            <option value="32GB+">32GB+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Processor Type</label>
          <input 
            type="text" 
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g. Intel i5, Ryzen 5"
            value={state.specs.processor}
            onChange={(e) => setState(prev => ({ ...prev, specs: { ...prev.specs, processor: e.target.value } }))}
          />
        </div>
         <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Device Age (Years)</label>
          <input 
            type="number" 
            min="0"
            max="20"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={state.specs.ageYears}
            onChange={(e) => setState(prev => ({ ...prev, specs: { ...prev.specs, ageYears: parseInt(e.target.value) || 0 } }))}
          />
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={prevStep}>Back</Button>
        <Button onClick={handleDiagnosis}>Analyze Device</Button>
      </div>
    </div>
  );

  const renderAnalyzing = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-pulse">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <Cpu className="w-10 h-10 text-blue-600 animate-spin-slow" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing your device...</h2>
      <p className="text-slate-500">Gemini AI is reviewing your specs and symptoms.</p>
    </div>
  );

  const renderResults = () => {
    if (!state.diagnosis) return <div>No results</div>;

    const severityColors = {
      'Critical': 'text-red-600 bg-red-50 border-red-200',
      'Moderate': 'text-orange-600 bg-orange-50 border-orange-200',
      'Low': 'text-green-600 bg-green-50 border-green-200'
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Diagnosis Report</h2>
          <span className={`px-4 py-1 rounded-full text-sm font-bold border ${severityColors[state.diagnosis.severity]}`}>
            {state.diagnosis.severity.toUpperCase()}
          </span>
        </div>

        <Card className="bg-slate-50 border-slate-200">
          <h3 className="text-lg font-semibold mb-2">Summary</h3>
          <p className="text-slate-700 leading-relaxed">{state.diagnosis.diagnosisSummary}</p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
             <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold">Potential Causes</h3>
             </div>
             <ul className="list-disc list-inside space-y-2 text-slate-600">
               {state.diagnosis.potentialCauses.map((cause, i) => (
                 <li key={i}>{cause}</li>
               ))}
             </ul>
          </Card>
           <Card>
             <div className="flex items-center gap-2 mb-4">
                <RefreshCcw className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">Maintenance Tips</h3>
             </div>
             <ul className="list-disc list-inside space-y-2 text-slate-600">
               {state.diagnosis.maintenanceTips.map((tip, i) => (
                 <li key={i}>{tip}</li>
               ))}
             </ul>
          </Card>
        </div>

        <div className="flex justify-between pt-6">
           <Button variant="outline" onClick={resetApp}>Start Over</Button>
           <Button onClick={nextStep}>View Upgrades</Button>
        </div>
      </div>
    );
  };

  const renderUpgrades = () => {
    if (!state.diagnosis) return null;
    const upgrades = state.diagnosis.recommendedUpgrades;

    // Data for Chart
    const data = upgrades.map(u => ({
      name: u.component.split(' ').slice(0,2).join(' '),
      boost: u.performanceBoostPercentage
    }));

    return (
      <div className="space-y-8">
         <h2 className="text-2xl font-bold text-slate-900">Recommended Upgrades</h2>
         
         {upgrades.length === 0 ? (
           <div className="p-8 text-center bg-slate-50 rounded-xl">
             <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
             <p className="text-lg font-medium text-slate-700">Good news! No hardware upgrades are strictly necessary based on your symptoms.</p>
             <p className="text-slate-500">Try the software maintenance tips from the previous page.</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="space-y-4">
               {upgrades.map((upgrade, idx) => (
                 <Card key={idx} className="relative overflow-hidden hover:border-blue-400">
                    <div className="absolute top-0 right-0 p-2">
                       <span className={`text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-600`}>
                         {upgrade.priority} Priority
                       </span>
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-slate-800">{upgrade.component}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">{upgrade.reason}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-emerald-600 font-semibold">
                         <span>~${upgrade.estimatedCostUSD}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                        <Activity className="w-4 h-4" /> +{upgrade.performanceBoostPercentage}% Perf
                      </div>
                    </div>
                 </Card>
               ))}
             </div>

             {/* Chart Section */}
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-80">
                <h3 className="font-semibold text-slate-700 mb-6">Performance Impact Estimate</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" unit="%" />
                    <RechartsTooltip 
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                    />
                    <Bar dataKey="boost" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
           </div>
         )}
         
         <div className="flex justify-between pt-6">
           <Button variant="outline" onClick={prevStep}>Back to Report</Button>
           <Button onClick={nextStep}>Final Summary</Button>
         </div>
      </div>
    );
  };

  const renderSummary = () => {
    if (!state.diagnosis) return null;
    const totalUpgradeCost = state.diagnosis.recommendedUpgrades.reduce((acc, curr) => acc + curr.estimatedCostUSD, 0);
    const fixCost = state.diagnosis.estimatedFixPriceUSD;

    return (
      <div className="space-y-6 text-center py-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Decision Time</h2>
        <p className="text-slate-500 max-w-lg mx-auto">Based on the age of your device ({state.specs.ageYears} years) and the estimated costs.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-8">
           <Card className="bg-slate-50 border-slate-200">
             <h3 className="text-lg font-semibold text-slate-700">Repair & Upgrade</h3>
             <div className="text-3xl font-bold text-blue-600 my-4">~${fixCost + totalUpgradeCost}</div>
             <p className="text-sm text-slate-500 mb-4">Estimated total for parts and service</p>
             <ul className="text-left text-sm space-y-2 text-slate-600 pl-4">
               <li>• Extends life by ~1-2 years</li>
               <li>• Keeps your data and settings</li>
               <li>• Environmentally friendly</li>
             </ul>
           </Card>

           <Card className={`border-2 ${totalUpgradeCost > 300 ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200'}`}>
             <h3 className="text-lg font-semibold text-slate-700">New Device (Est.)</h3>
             <div className="text-3xl font-bold text-slate-800 my-4">$600 - $1200</div>
             <p className="text-sm text-slate-500 mb-4">Entry to Mid-level modern replacement</p>
             <ul className="text-left text-sm space-y-2 text-slate-600 pl-4">
               <li>• Latest technology & warranty</li>
               <li>• Better battery life</li>
               <li>• {totalUpgradeCost > 300 ? "Might be better value" : "More expensive option"}</li>
             </ul>
           </Card>
        </div>

        <div className="pt-10 flex justify-center gap-4">
           <Button variant="outline" onClick={() => window.print()}>Print Report</Button>
           <Button onClick={resetApp}>Diagnose Another Device</Button>
        </div>
      </div>
    );
  };

  const renderAdmin = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
        <Button variant="outline" onClick={() => setStep(Step.LANDING)}>Exit Admin</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wide">Total Diagnoses</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">1,248</p>
        </Card>
        <Card>
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wide">Most Common Issue</h3>
          <p className="text-3xl font-bold text-slate-900 mt-2">RAM Bottle..</p>
        </Card>
        <Card>
          <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wide">API Latency</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">840ms</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-bold mb-4">Recent System Logs</h3>
        <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
          <div className="mb-2"><span className="text-blue-400">[INFO]</span> System initialized</div>
          <div className="mb-2"><span className="text-green-400">[SUCCESS]</span> Gemini API connected</div>
          <div className="mb-2"><span className="text-blue-400">[INFO]</span> User #8821 started diagnosis (Laptop)</div>
          <div className="mb-2"><span className="text-yellow-400">[WARN]</span> High volume of requests for 'Overheating'</div>
          <div><span className="text-blue-400">[INFO]</span> New model config loaded: gemini-3-flash-preview</div>
        </div>
      </Card>
    </div>
  );

  const getStepContent = () => {
    switch (state.currentStep) {
      case Step.LANDING: return renderLanding();
      case Step.CATEGORY: return renderCategory();
      case Step.SYMPTOMS: return renderSymptoms();
      case Step.SPECS: return renderSpecs();
      case Step.ANALYZING: return renderAnalyzing();
      case Step.RESULTS: return renderResults();
      case Step.UPGRADES: return renderUpgrades();
      case Step.SUMMARY: return renderSummary();
      case Step.ADMIN: return renderAdmin();
      default: return renderLanding();
    }
  };

  return (
    <Layout currentStep={state.currentStep} onAdminClick={() => setStep(Step.ADMIN)}>
      <Stepper currentStep={state.currentStep} />
      {getStepContent()}
    </Layout>
  );
}
