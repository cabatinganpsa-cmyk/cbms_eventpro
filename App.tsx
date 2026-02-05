
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { storageService } from './services/storageService';
import { Participant } from './types';
import { EventForm } from './components/EventForm';
import { Dashboard } from './components/Dashboard';
import { RecordTable } from './components/RecordTable';
import { AdminSettings } from './components/AdminSettings';
import { analyzeLogistics } from './services/geminiService';

const App: React.FC = () => {
  const [records, setRecords] = useState<Participant[]>([]);
  const [activeTab, setActiveTab] = useState<'register' | 'dashboard' | 'records' | 'admin'>('dashboard');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  
  const pollTimer = useRef<number | null>(null);

  const refreshData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setSyncStatus('syncing');
    
    try {
      const data = await storageService.fetchCloudRecords();
      setRecords(data);
      setSyncStatus('idle');
    } catch (e) {
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    refreshData(true);

    // Setup 30s auto-refresh
    pollTimer.current = window.setInterval(() => {
      refreshData();
    }, 30000);

    const handleRecordsUpdate = () => refreshData();
    window.addEventListener('records_updated', handleRecordsUpdate);
    
    return () => {
      window.removeEventListener('records_updated', handleRecordsUpdate);
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [refreshData]);

  const handleRunAnalysis = async () => {
    if (records.length === 0) {
      alert("No data available for analysis.");
      return;
    }
    setIsAnalyzing(true);
    const filteredRecords = selectedEvent === 'all' 
      ? records 
      : records.filter(r => r.eventName === selectedEvent);
    
    const result = await analyzeLogistics(filteredRecords);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  CBMS Events System
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">Sorsogon Logistics Hub</p>
                  <div className={`h-1.5 w-1.5 rounded-full ${syncStatus === 'syncing' ? 'bg-amber-400 animate-pulse' : syncStatus === 'error' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                </div>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-1">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('records')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'records' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Records
              </button>
              <button 
                onClick={() => setActiveTab('register')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'register' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Registration
              </button>
              <div className="w-px h-6 bg-slate-200 mx-2"></div>
              <button 
                onClick={() => setActiveTab('admin')}
                className={`p-2 rounded-lg transition ${activeTab === 'admin' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-100'}`}
                title="Admin Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col gap-8">
          
          <div className="space-y-8 animate-in fade-in duration-500">
            {activeTab === 'dashboard' && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-800">Analytics Dashboard</h2>
                    <button 
                      onClick={() => refreshData(true)} 
                      className={`p-2 text-slate-400 hover:text-indigo-600 transition ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}
                      title="Force Refresh Data"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                  </div>
                  <button 
                    onClick={handleRunAnalysis}
                    disabled={isAnalyzing || records.length === 0}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm disabled:opacity-50 shadow-md"
                  >
                    {isAnalyzing ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                    Generate AI Insight
                  </button>
                </div>

                {aiAnalysis && (
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-900 p-0.5 rounded-2xl shadow-xl shadow-indigo-100 animate-in zoom-in-95 duration-500">
                    <div className="bg-white p-6 rounded-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                          <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                          </svg>
                        </div>
                        <span className="text-slate-900 font-bold">
                          Gemini Intelligence Report
                        </span>
                      </div>
                      <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {aiAnalysis}
                      </div>
                      <button onClick={() => setAiAnalysis(null)} className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-indigo-600 transition">Dismiss Report</button>
                    </div>
                  </div>
                )}

                {isLoading ? (
                  <div className="h-64 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200">
                    <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-slate-500 font-medium">Fetching records from Google Sheets...</p>
                  </div>
                ) : (
                  <>
                    <Dashboard 
                      records={records} 
                      selectedEvent={selectedEvent} 
                      setSelectedEvent={setSelectedEvent} 
                    />
                    <RecordTable 
                      records={records} 
                      selectedEvent={selectedEvent} 
                    />
                  </>
                )}
              </>
            )}

            {activeTab === 'register' && (
              <div className="max-w-2xl mx-auto py-4">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-900">Event Registration</h2>
                  <p className="text-slate-500 mt-2">Please fill in your details to confirm your attendance.</p>
                </div>
                <EventForm />
              </div>
            )}

            {activeTab === 'records' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-800">Master Record List</h2>
                  {isLoading && <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>}
                </div>
                <RecordTable records={records} selectedEvent="all" />
              </div>
            )}

            {activeTab === 'admin' && (
              <div className="max-w-2xl mx-auto py-4">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Administrator Controls</h2>
                <AdminSettings />
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Footer and Navigation stays the same */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-around items-center z-50">
        <button onClick={() => setActiveTab('dashboard')} className={`p-2 rounded-lg ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
        </button>
        <button onClick={() => setActiveTab('register')} className={`p-3 rounded-full -mt-8 shadow-lg ${activeTab === 'register' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
        </button>
        <button onClick={() => setActiveTab('admin')} className={`p-2 rounded-lg ${activeTab === 'admin' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
        </button>
      </div>

      <footer className="mt-20 py-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            Province of Sorsogon • Official Event Logistics Management System
          </p>
          <div className="flex justify-center gap-4 mt-4">
             <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></div>
             <span className="text-[10px] text-slate-300 font-medium italic">Database Sync Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
