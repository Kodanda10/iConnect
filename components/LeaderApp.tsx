
import React, { useState, useEffect } from 'react';
import { Phone, Check, MapPin, X, User, Gift, Heart, MessageSquare, Filter, ListChecks, Calendar, Languages, Clock } from 'lucide-react';
import { DB } from '../services/db';
import { GreetingService } from '../services/greetings';
import { EnrichedTask, TaskStatus, TaskType } from '../types';

interface LeaderAppProps {
    isMirrorMode?: boolean;
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
);

export const LeaderApp: React.FC<LeaderAppProps> = ({ isMirrorMode = false }) => {
  const [allTasks, setAllTasks] = useState<EnrichedTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<EnrichedTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appName, setAppName] = useState('AC Connect');
  const [leaderName, setLeaderName] = useState('Pranab Kumar Balabantaray');
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  
  // Filter States
  const [filterStatus, setFilterStatus] = useState<TaskStatus>('PENDING');
  const [filterType, setFilterType] = useState<'ALL' | TaskType>('ALL');

  // Bulk Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  // Action States
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [currentAction, setCurrentAction] = useState<'call' | 'sms' | 'whatsapp' | null>(null);
  
  // Language State
  const [greetingLanguage, setGreetingLanguage] = useState<'ODIA' | 'ENGLISH' | 'HINDI'>('ODIA');

  // History Calendar State
  const [historyMode, setHistoryMode] = useState<'list' | 'calendar'>('list');
  const [historyDate, setHistoryDate] = useState<Date>(new Date());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
        const data = DB.getEnrichedTasks();
        const settings = DB.getSettings();
        setAppName(settings.appName || 'AC Connect');
        setLeaderName(settings.leaderName);
        setHeaderImage(settings.headerImage);
        setAllTasks(data);
        setIsLoading(false);
    }, 1000);
  };

  // --- Derived Data ---
  const filteredTasks = allTasks.filter(t => {
      if (t.status !== filterStatus) return false;
      if (filterType !== 'ALL' && t.type !== filterType) return false;
      
      // History Date Filter
      if (filterStatus === 'COMPLETED' && historyMode === 'calendar') {
          // Check if completion date matches historyDate
          const taskDate = new Date(t.due_date);
          return taskDate.getDate() === historyDate.getDate() && 
                 taskDate.getMonth() === historyDate.getMonth();
      }

      return true;
  });

  const counts = {
      pending: allTasks.filter(t => t.status === 'PENDING').length,
      history: allTasks.filter(t => t.status === 'COMPLETED').length,
      birthdays: allTasks.filter(t => t.status === filterStatus && t.type === 'BIRTHDAY').length,
      anniversaries: allTasks.filter(t => t.status === filterStatus && t.type === 'ANNIVERSARY').length,
      allTypes: allTasks.filter(t => t.status === filterStatus).length
  };

  // --- Selection Logic ---
  const toggleSelectionMode = () => {
      setIsSelectionMode(!isSelectionMode);
      setSelectedTaskIds(new Set());
  };

  const toggleTaskSelection = (id: string) => {
      const newSet = new Set(selectedTaskIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedTaskIds(newSet);
  };

  const selectAll = () => {
      if (selectedTaskIds.size === filteredTasks.length) {
          setSelectedTaskIds(new Set());
      } else {
          setSelectedTaskIds(new Set(filteredTasks.map(t => t.id)));
      }
  };

  // --- Bulk Actions ---
  const handleBulkComplete = () => {
      if (confirm(`Mark ${selectedTaskIds.size} tasks as completed?`)) {
          selectedTaskIds.forEach(id => {
              DB.updateTask(id, { 
                  status: 'COMPLETED', 
                  notes: isMirrorMode ? 'Bulk action by Staff' : 'Bulk action completed',
                  completed_by: isMirrorMode ? 'STAFF' : 'LEADER'
                });
          });
          setIsSelectionMode(false);
          setSelectedTaskIds(new Set());
          loadData();
      }
  };

  const handleBulkSMS = () => {
      // Collect numbers
      const numbers = allTasks
        .filter(t => selectedTaskIds.has(t.id))
        .map(t => t.constituent.mobile_number)
        .join(',');
      
      // Get a generic message suitable for the group (Default Odia)
      const msg = GreetingService.getGenericGroupMessage(filterType);
      
      // Open SMS app
      window.open(`sms:${numbers}?body=${encodeURIComponent(msg)}`);
      
      // Optionally ask to mark as complete
      if(confirm("Opened SMS app. Mark these tasks as completed in the app?")) {
          selectedTaskIds.forEach(id => {
              DB.updateTask(id, { 
                  status: 'COMPLETED', 
                  notes: 'Bulk SMS Sent',
                  action_taken: 'SMS',
                  completed_by: isMirrorMode ? 'STAFF' : 'LEADER'
                });
          });
          setIsSelectionMode(false);
          setSelectedTaskIds(new Set());
          loadData();
      }
  };

  // --- Individual Actions ---
  const handleAction = (task: EnrichedTask, action: 'call' | 'sms' | 'whatsapp') => {
    // Check if task is already completed with this specific action
    if (task.status === 'COMPLETED' && task.action_taken === action.toUpperCase()) {
        const confirmResend = confirm(`You already sent a ${action.toUpperCase()} to ${task.constituent.name}. Do you want to send it again?`);
        if (!confirmResend) return;
    }

    // If in selection mode, clicking the card toggles selection instead of opening action
    if (isSelectionMode) {
        toggleTaskSelection(task.id);
        return;
    }

    setSelectedTask(task);
    setCurrentAction(action);
    setGreetingLanguage('ODIA'); // Reset to default Odia on new open
    
    if (action === 'call') {
      window.location.href = `tel:${task.constituent.mobile_number}`;
      setTimeout(() => {
          setGeneratedMessage(''); 
          setFeedbackMode(true);
      }, 500); // Quick switch to verification
    } else {
        // INSTANT GENERATION - NO LOADING - DEFAULT ODIA
        const msg = GreetingService.getInstantMessage(task.constituent.name, task.type, 'ODIA');
        setGeneratedMessage(msg);
        setFeedbackMode(true);
    }
  };

  const toggleLanguage = () => {
      if (!selectedTask) return;
      const langs: ('ODIA'|'ENGLISH'|'HINDI')[] = ['ODIA', 'ENGLISH', 'HINDI'];
      const nextIdx = (langs.indexOf(greetingLanguage) + 1) % langs.length;
      const newLang = langs[nextIdx];

      setGreetingLanguage(newLang);
      const msg = GreetingService.getInstantMessage(selectedTask.constituent.name, selectedTask.type, newLang);
      setGeneratedMessage(msg);
  }

  const completeTask = () => {
    if (selectedTask) {
      DB.updateTask(selectedTask.id, { 
        status: 'COMPLETED', 
        notes: feedbackNotes || 'Quick Action Confirmed',
        action_taken: currentAction?.toUpperCase() as any,
        completed_by: isMirrorMode ? 'STAFF' : 'LEADER'
      });
      closeModal();
      loadData();
    }
  };

  const closeModal = () => {
      setFeedbackMode(false);
      setSelectedTask(null);
      setFeedbackNotes('');
      setGeneratedMessage('');
      setCurrentAction(null);
  }

  const proceedToMessage = () => {
      if(selectedTask) {
        const encoded = encodeURIComponent(generatedMessage);
        if (currentAction === 'whatsapp') {
            window.location.href = `https://wa.me/${selectedTask.constituent.mobile_number}?text=${encoded}`;
        } else if (currentAction === 'sms') {
            window.location.href = `sms:${selectedTask.constituent.mobile_number}?body=${encoded}`;
        }
        // Switch to Return Trigger / Verification mode
        setGeneratedMessage('');
      }
  }

  const getEmptyStateMessage = () => {
    if (filterStatus === 'PENDING') {
        if (filterType === 'BIRTHDAY') return "No upcoming birthdays.";
        if (filterType === 'ANNIVERSARY') return "No upcoming anniversaries.";
        return "You're all caught up! No pending tasks.";
    } else {
        return "No history found for this category.";
    }
  }

  // Render Card Skeleton
  const renderCardSkeleton = () => (
      <>
        {[1, 2, 3].map(i => (
             <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-pulse">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gray-200 shrink-0"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                    </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-48 mb-4 ml-[3.75rem]"></div>
                <div className="flex gap-2 ml-[3.75rem]">
                    <div className="w-12 h-10 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 h-10 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 h-10 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        ))}
      </>
  );

  return (
    <div className={`w-full max-w-md mx-auto bg-gray-50 flex flex-col shadow-2xl relative overflow-hidden font-sans border-x border-gray-200 ${isMirrorMode ? 'h-full rounded-none' : 'h-screen'}`}>
      
      {/* HEADER - Updated to support Custom Background */}
      <div className={`relative pt-8 pb-4 px-6 overflow-hidden shrink-0 animate-in fade-in duration-700 bg-teal-900`}>
        {/* Actual Image Render Logic - FIXED */}
        {headerImage ? (
            <div className="absolute inset-0 z-0">
                <img src={headerImage} className="w-full h-full object-cover" alt="Header Background" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
            </div>
        ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-teal-700 to-teal-900 z-0"></div>
        )}

        {/* Background Effects (Only if no custom header) */}
        {!headerImage && (
            <>
                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-teal-400/20 rounded-full blur-3xl pointer-events-none z-0"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay z-0"></div>
            </>
        )}

        <div className="relative z-10 flex justify-between items-start mb-6">
            {/* Left Content */}
            <div className="pt-2">
                 {isMirrorMode && (
                    <div className="inline-flex items-center gap-1 bg-red-500/90 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mb-2 shadow-sm border border-red-400/50">
                        <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                        Staff Mirror
                    </div>
                )}
                <h1 className="text-white text-3xl font-black tracking-tight drop-shadow-md">
                    {appName}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                     <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] animate-pulse shrink-0"></div>
                     <p className="text-teal-50 font-medium text-sm drop-shadow-sm">
                        {leaderName}
                     </p>
                </div>
            </div>
        </div>

        {/* Floating Glass Pill Tabs */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full p-1.5 flex relative shadow-lg animate-in slide-in-from-bottom-4 delay-100 gpu z-10">
            <button
                onClick={() => { setFilterStatus('PENDING'); setIsSelectionMode(false); }}
                className={`flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-300 ease-spring flex items-center justify-center gap-2 relative z-10 active:scale-[0.96] ${filterStatus === 'PENDING' ? 'bg-white text-teal-900 shadow-sm' : 'text-teal-50 hover:text-white'}`}
            >
                Pending
                {counts.pending > 0 && (
                    <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black leading-none transition-colors duration-300 ${filterStatus === 'PENDING' ? 'bg-teal-100 text-teal-800' : 'bg-white/20 text-white'}`}>
                        {counts.pending}
                    </span>
                )}
            </button>
            <button
                onClick={() => { setFilterStatus('COMPLETED'); setIsSelectionMode(false); }}
                className={`flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-300 ease-spring flex items-center justify-center gap-2 relative z-10 active:scale-[0.96] ${filterStatus === 'COMPLETED' ? 'bg-white text-teal-900 shadow-sm' : 'text-teal-50 hover:text-white'}`}
            >
                History
            </button>
        </div>
      </div>

      {/* Sub-Filters (Centered Tabs) */}
      <div className="px-6 py-3 bg-white border-b border-gray-100 flex justify-center gap-2 overflow-x-auto hide-scrollbar shrink-0 animate-in fade-in duration-500 delay-200">
            <button 
                onClick={() => setFilterType('ALL')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all ease-spring active:scale-95 whitespace-nowrap ${filterType === 'ALL' ? 'bg-teal-50 text-teal-800 border-teal-200 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
                ALL
            </button>
            <button 
                onClick={() => setFilterType('BIRTHDAY')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all ease-spring active:scale-95 whitespace-nowrap ${filterType === 'BIRTHDAY' ? 'bg-pink-50 text-pink-700 border-pink-200 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
                <Gift className="w-3 h-3" /> 
                Birthdays
                {counts.birthdays > 0 && <span className={`ml-1 ${filterType === 'BIRTHDAY' ? 'text-pink-800' : 'text-gray-400'}`}>({counts.birthdays})</span>}
            </button>
            <button 
                onClick={() => setFilterType('ANNIVERSARY')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all ease-spring active:scale-95 whitespace-nowrap ${filterType === 'ANNIVERSARY' ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
                <Heart className="w-3 h-3" /> 
                Anniversaries
                {counts.anniversaries > 0 && <span className={`ml-1 ${filterType === 'ANNIVERSARY' ? 'text-purple-800' : 'text-gray-400'}`}>({counts.anniversaries})</span>}
            </button>
      </div>

      {/* History Calendar Control */}
      {filterStatus === 'COMPLETED' && (
          <div className="px-6 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {historyMode === 'list' ? 'All History' : historyDate.toLocaleDateString()}
              </div>
              <div className="flex bg-white rounded-lg p-0.5 border border-gray-200 shadow-sm">
                  <button onClick={() => setHistoryMode('list')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${historyMode === 'list' ? 'bg-teal-100 text-teal-800' : 'text-gray-400 hover:text-gray-600'}`}>List</button>
                  <button onClick={() => setHistoryMode('calendar')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${historyMode === 'calendar' ? 'bg-teal-100 text-teal-800' : 'text-gray-400 hover:text-gray-600'}`}>Date</button>
              </div>
          </div>
      )}

      {/* Floating Selection Mode Button */}
      {filterStatus === 'PENDING' && filteredTasks.length > 0 && !isLoading && !isSelectionMode && (
          <button
              onClick={toggleSelectionMode}
              className="absolute bottom-6 right-6 z-30 w-14 h-14 bg-teal-600 hover:bg-teal-500 text-white rounded-full shadow-[0_8px_16px_rgba(13,148,136,0.3)] flex items-center justify-center transition-all ease-spring hover:scale-110 active:scale-90 animate-zoom-in-bounce"
              aria-label="Select Tasks"
          >
              <ListChecks className="w-6 h-6" />
          </button>
      )}

      {/* Bulk Action Bar (Floating) */}
      {isSelectionMode && (
          <div className="absolute bottom-6 left-4 right-4 z-40 bg-gray-800 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-20 fade-in duration-500 border border-gray-700 gpu">
              <div className="flex items-center gap-3 px-2">
                  <div className="bg-gray-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm animate-scale-in">
                      {selectedTaskIds.size}
                  </div>
                  <button onClick={toggleSelectionMode} className="p-1 rounded-full hover:bg-white/10 ml-1 active:scale-90 transition-transform">
                      <X className="w-4 h-4 text-gray-400" />
                  </button>
                  <span className="text-xs font-medium text-gray-300 ml-1">Selected</span>
                  <button onClick={selectAll} className="text-xs font-bold text-teal-400 hover:text-teal-300 ml-2 active:scale-95 transition-transform">
                      {selectedTaskIds.size === filteredTasks.length ? 'Select None' : 'Select All'}
                  </button>
              </div>
              <div className="flex gap-2">
                  <button 
                    disabled={selectedTaskIds.size === 0}
                    onClick={handleBulkSMS}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition-transform ease-spring active:scale-90 shadow-lg shadow-blue-900/20"
                  >
                      <MessageSquare className="w-5 h-5" />
                  </button>
                  <button 
                    disabled={selectedTaskIds.size === 0}
                    onClick={handleBulkComplete}
                    className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition-transform ease-spring active:scale-90 shadow-lg shadow-teal-900/20"
                  >
                      <Check className="w-5 h-5" />
                  </button>
              </div>
          </div>
      )}

      {/* Task List */}
      <div className={`flex-1 overflow-y-auto px-4 py-4 space-y-4 hide-scrollbar bg-gray-50/50 ${isSelectionMode ? 'pb-24' : ''}`}>
        {isLoading ? (
            renderCardSkeleton()
        ) : filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-8 pb-20 animate-in fade-in duration-700">
                <div className="bg-white p-6 rounded-full mb-4 shadow-sm border border-gray-100 animate-in zoom-in duration-500">
                    <Filter className="w-8 h-8 text-gray-300" />
                </div>
                <p className="font-medium text-gray-600">{getEmptyStateMessage()}</p>
            </div>
        ) : (
            filteredTasks.map((task, index) => (
                <div 
                    key={task.id} 
                    onClick={() => isSelectionMode && toggleTaskSelection(task.id)}
                    style={{ 
                        animationDelay: `${index * 80}ms`,
                        animationFillMode: 'backwards' 
                    }}
                    className={`
                        bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 
                        transition-all duration-300 ease-spring animate-ios-slide-up group gpu
                        ${!isSelectionMode ? 'hover:scale-[1.02] hover:shadow-[0_12px_24px_rgba(13,148,136,0.1)] hover:bg-teal-50/10 hover:border-teal-200 cursor-pointer active:scale-[0.98]' : ''}
                        ${isSelectionMode && selectedTaskIds.has(task.id) ? 'ring-2 ring-teal-500 bg-teal-50/30' : ''}
                        ${isSelectionMode ? 'cursor-pointer active:scale-[0.98]' : ''}
                    `}
                >
                    {/* Card content unchanged */}
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:rotate-6 duration-300 ease-spring ${task.type === 'BIRTHDAY' ? 'bg-pink-50 text-pink-500' : 'bg-purple-50 text-purple-500'}`}>
                                {task.type === 'BIRTHDAY' ? <Gift className="w-6 h-6" /> : <Heart className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-primary transition-colors">{task.constituent.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${task.type === 'BIRTHDAY' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'}`}>
                                        {task.type}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded flex items-center gap-1 border border-gray-100">
                                        <Calendar className="w-3 h-3" />
                                        {task.due_date}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {isSelectionMode ? (
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedTaskIds.has(task.id) ? 'bg-teal-500 border-teal-500' : 'border-gray-200'}`}>
                                {selectedTaskIds.has(task.id) && <Check className="w-4 h-4 text-white" />}
                            </div>
                        ) : (
                            <div className="bg-gray-50 px-2.5 py-1 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-wider border border-gray-100">
                                Ward {task.constituent.ward_number}
                            </div>
                        )}
                    </div>

                    {/* Address Line */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 pl-[3.75rem]">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="truncate">{task.constituent.address}</span>
                    </div>

                    {/* Action Buttons */}
                    {!isSelectionMode && (
                        <div className="flex gap-2 mt-2 pl-[3.75rem]">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleAction(task, 'call'); }}
                                className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-transform ease-spring active:scale-95 border shadow-sm group-hover:shadow-md ${task.status === 'COMPLETED' && task.action_taken === 'CALL' ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-help' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-100'}`}
                            >
                                <Phone className="w-4 h-4" /> Call
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleAction(task, 'sms'); }}
                                className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-transform ease-spring active:scale-95 shadow-sm border ${task.status === 'COMPLETED' && task.action_taken === 'SMS' ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-help' : 'bg-blue-50/50 hover:bg-blue-100/80 text-blue-700 border-blue-100/50'}`}
                            >
                                <MessageSquare className="w-4 h-4" /> SMS
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleAction(task, 'whatsapp'); }}
                                className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-transform ease-spring active:scale-95 shadow-sm border ${task.status === 'COMPLETED' && task.action_taken === 'WHATSAPP' ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-help' : 'bg-green-50/50 hover:bg-green-100/80 text-green-700 border-green-100/50'}`}
                            >
                                <WhatsAppIcon className="w-4 h-4" /> WhatsApp
                            </button>
                        </div>
                    )}
                </div>
            ))
        )}
      </div>

      {/* Detail/Action Modal - IOS Bottom Sheet Style */}
      {feedbackMode && selectedTask && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-500 ease-spring mb-safe gpu">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div> {/* Handle for mobile */}
                
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">
                        {generatedMessage ? (currentAction === 'sms' ? 'Send SMS' : 'Send WhatsApp') : 'Outcome for ' + selectedTask.constituent.name + '?'}
                    </h3>
                    <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-transform active:scale-90 bg-gray-50">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {generatedMessage ? (
                    <div>
                        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 p-5 rounded-2xl mb-4 relative shadow-inner">
                            <div className="flex justify-between items-center mb-2">
                                <span className="bg-white px-2 py-0.5 text-[10px] font-bold text-teal-600 uppercase tracking-wider border border-teal-100 rounded shadow-sm">
                                    {greetingLanguage} Greeting
                                </span>
                                <button 
                                    onClick={toggleLanguage}
                                    className="flex items-center gap-1 text-[10px] font-bold bg-teal-200 text-teal-800 px-2 py-0.5 rounded-full hover:bg-teal-300 transition-transform active:scale-95"
                                >
                                    <Languages className="w-3 h-3" />
                                    Switch Language
                                </button>
                            </div>
                            <textarea 
                                value={generatedMessage}
                                onChange={(e) => setGeneratedMessage(e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 text-gray-800 text-sm leading-relaxed font-medium p-0 resize-none h-24"
                            />
                        </div>
                        <button 
                            onClick={proceedToMessage}
                            className={`w-full text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform ease-spring active:scale-[0.96] active:shadow-none ${currentAction === 'sms' ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-200' : 'bg-[#25D366] hover:bg-[#20bd5a] shadow-green-200'}`}
                        >
                            {currentAction === 'sms' ? <MessageSquare className="w-5 h-5" /> : <WhatsAppIcon className="w-5 h-5" />}
                            {currentAction === 'sms' ? 'Open Message App' : 'Open WhatsApp'}
                        </button>
                    </div>
                ) : (
                    // Outcome Selection (Unchanged)
                     <div>
                        <div className="flex items-center gap-3 mb-5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Action taken: <span className="font-bold">{currentAction?.toUpperCase()}</span></p>
                                <p className="text-lg font-bold text-primary leading-none">{selectedTask.constituent.name}</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-3 mt-6">
                            <button 
                                onClick={completeTask}
                                className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-transform ease-spring active:scale-[0.96] flex items-center justify-center gap-2"
                            >
                                <Check className="w-5 h-5" />
                                Connected / Sent
                            </button>

                             <div className="flex gap-3">
                                <button 
                                    onClick={closeModal}
                                    className="flex-1 bg-red-50 border border-red-100 text-red-600 py-3.5 rounded-2xl font-bold hover:bg-red-100 transition-transform ease-spring active:scale-[0.96]"
                                >
                                    No Answer
                                </button>
                                <button 
                                    onClick={closeModal}
                                    className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 py-3.5 rounded-2xl font-bold hover:bg-gray-100 transition-transform ease-spring active:scale-[0.96] flex items-center justify-center gap-2"
                                >
                                    <Clock className="w-4 h-4" /> Reschedule
                                </button>
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};
