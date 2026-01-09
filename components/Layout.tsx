import React, { useState } from 'react';
import { Activity, Menu, ShieldCheck, X, Info, LifeBuoy, CircleHelp } from 'lucide-react';
import { Step } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentStep: Step;
  onAdminClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentStep, onAdminClick }) => {
  const [activeModal, setActiveModal] = useState<'how' | 'about' | 'support' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderModalContent = () => {
    switch(activeModal) {
      case 'how':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CircleHelp className="w-6 h-6 text-blue-600" /> How it Works
            </h3>
            <div className="space-y-3 text-slate-600">
              <p>SmartDevice Rx uses advanced Google Gemini AI to analyze your device problems.</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li><strong>Select Device:</strong> Tell us if it's a laptop, desktop, or mobile.</li>
                <li><strong>Describe Issues:</strong> Select common symptoms or type your problem.</li>
                <li><strong>Enter Specs:</strong> Provide basic details like RAM and Processor.</li>
                <li><strong>AI Diagnosis:</strong> Our engine cross-references symptoms with hardware patterns.</li>
                <li><strong>Get Results:</strong> Receive a fix estimate and upgrade recommendations.</li>
              </ol>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="space-y-4">
             <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-6 h-6 text-blue-600" /> About Us
            </h3>
            <p className="text-slate-600 leading-relaxed">
              SmartDevice Rx was built to reduce e-waste by helping users extend the lifespan of their electronics. 
              Instead of buying new, we help you determine if a simple RAM upgrade or battery replacement can save your device.
            </p>
            <p className="text-slate-600">
              Powered by <strong>Google Gemini</strong>, we provide expert-level hardware advice instantly.
            </p>
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400">Version 1.0.0 | Terms of Service | Privacy Policy</p>
            </div>
          </div>
        );
      case 'support':
        return (
           <div className="space-y-4">
             <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <LifeBuoy className="w-6 h-6 text-blue-600" /> Support
            </h3>
            <p className="text-slate-600">
              Need help using the tool? Or found a bug?
            </p>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-800">Contact Team</p>
              <button className="text-blue-600 hover:underline">support@smartdevicerx.com</button>
            </div>
            <p className="text-xs text-slate-400 mt-4">
              Disclaimer: We provide recommendations based on AI analysis. Always consult a certified professional before performing hardware repairs.
            </p>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans relative">
      {/* Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveModal(null)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative z-10 animate-[fade-in_0.2s_ease-out]">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
            {renderModalContent()}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">SmartDevice<span className="text-blue-600">Rx</span></span>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
            <button onClick={() => setActiveModal('how')} className="hover:text-blue-600 transition-colors">How it works</button>
            <button onClick={() => setActiveModal('about')} className="hover:text-blue-600 transition-colors">About</button>
            <button onClick={() => setActiveModal('support')} className="hover:text-blue-600 transition-colors">Support</button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="w-6 h-6 text-slate-600" />
            </button>
          </div>
        </div>
        
        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-2 space-y-2 shadow-lg absolute w-full z-40">
             <button onClick={() => { setActiveModal('how'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-600 font-medium">How it works</button>
             <button onClick={() => { setActiveModal('about'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-600 font-medium">About</button>
             <button onClick={() => { setActiveModal('support'); setIsMobileMenuOpen(false); }} className="block w-full text-left py-2 text-slate-600 font-medium">Support</button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start py-8 px-4 sm:px-6">
        <div className="w-full max-w-4xl">
           {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm mb-2">
            &copy; {new Date().getFullYear()} SmartDeviceRx. Powered by Google Gemini.
          </p>
          <div className="flex justify-center gap-4 text-xs text-slate-400">
            <button onClick={onAdminClick} className="hover:text-blue-600 transition-colors">Admin Panel</button>
            <button onClick={() => setActiveModal('about')} className="hover:text-blue-600 transition-colors">Privacy Policy</button>
            <button onClick={() => setActiveModal('about')} className="hover:text-blue-600 transition-colors">Terms of Service</button>
          </div>
        </div>
      </footer>
    </div>
  );
};