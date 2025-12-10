
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Activity, CheckCircle, Database, Calendar as CalendarIcon, ChevronLeft, ChevronRight, UserPlus, Gift, Heart, Plus, Save, FileText, Search, Users, Smartphone, Loader2, Send, LayoutTemplate, MapPin, Briefcase, Clock, Check, Sparkles, ArrowRight, Phone, MessageSquare, X, Languages, ListChecks, Bell, ToggleLeft, ToggleRight, Image as ImageIcon, PartyPopper } from 'lucide-react';
import { DB } from '../services/db';
import { Constituent, EnrichedTask, Task, TaskStatus, TaskType, Festival } from '../types';
import { GreetingService } from '../services/greetings';
import { getCampaignVariations } from '../services/gemini';
import { v4 as uuidv4 } from 'uuid';

const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
);

// Helper to compress image for LocalStorage (Max ~5MB limit)
const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Resize logic: Max width 800px to ensure it fits in localStorage
                const maxWidth = 800;
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    // Compress to JPEG with 0.7 quality
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                } else {
                    reject(new Error("Canvas context failed"));
                }
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

export const StaffPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'dashboard' | 'scheduler'>('dashboard');
  const [constituents, setConstituents] = useState<Constituent[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [csvContent, setCsvContent] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [scanResult, setScanResult] = useState<number | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Database View State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Data Entry Mode
  const [entryMode, setEntryMode] = useState<'csv' | 'manual'>('csv');
  
  // Manual Form State
  const [manualForm, setManualForm] = useState({
      name: '',
      mobile: '',
      dob: '',
      anniversary: '',
      block: '',
      gp_ulb: '',
      ward: '',
      address: ''
  });

  // Scheduler / Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Sidebar Filters
  const [filterStatus, setFilterStatus] = useState<TaskStatus>('PENDING');
  const [filterType, setFilterType] = useState<'ALL' | TaskType>('ALL');

  // Festival Manager State
  const [festivalModalOpen, setFestivalModalOpen] = useState(false);
  const [newFestivalForm, setNewFestivalForm] = useState({
      name: '',
      date: '',
      description: ''
  });
  const [showAddFestivalForm, setShowAddFestivalForm] = useState(false);

  // Campaign Wizard State
  const [campaignWizardOpen, setCampaignWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedFestival, setSelectedFestival] = useState<string>('');
  const [campaignData, setCampaignData] = useState<{
      audience: string;
      message: string;
      language: 'ODIA' | 'ENGLISH' | 'HINDI';
      scheduleType: string;
      scheduleDate: string;
      scheduleTime: string;
  }>({
      audience: 'ALL',
      message: '',
      language: 'ODIA',
      scheduleType: 'NOW',
      scheduleDate: '',
      scheduleTime: '09:00'
  });
  const [scheduledCampaigns, setScheduledCampaigns] = useState<any[]>([]);
  const [aiVariations, setAiVariations] = useState<string[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Action / Feedback State (for Staff execution)
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState<EnrichedTask | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [currentAction, setCurrentAction] = useState<'call' | 'sms' | 'whatsapp' | null>(null);
  const [greetingLanguage, setGreetingLanguage] = useState<'ODIA' | 'ENGLISH' | 'HINDI'>('ODIA');

  // CMS Dashboard State
  const [appName, setAppName] = useState('AC Connect');
  const [leaderName, setLeaderName] = useState('Pranab Kumar Balabantaray');
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
      headsUp: true,
      action: true
  });


  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setIsLoading(true);
    // Simulate network delay for realistic loading effect
    setTimeout(() => {
        setConstituents(DB.getConstituents());
        setFestivals(DB.getFestivals());
        const settings = DB.getSettings();
        setAppName(settings.appName || 'AC Connect');
        setLeaderName(settings.leaderName);
        setHeaderImage(settings.headerImage);
        setIsLoading(false);
    }, 800);
  };

  const handleAppNameChange = (name: string) => {
      setAppName(name);
      DB.saveSettings({ appName: name, leaderName, headerImage });
  };

  const handleLeaderNameChange = (name: string) => {
      setLeaderName(name);
      DB.saveSettings({ appName, leaderName: name, headerImage });
  };

  const validateMobile = (mobile: string): boolean => {
      // Must be exactly 10 digits
      if (!/^\d{10}$/.test(mobile)) return false;
      
      // Block dummy numbers
      const dummyPatterns = [
          '0000000000', '1234567890', '0123456789', 
          '9999999999', '8888888888', '1111111111', 
          '2222222222', '3333333333', '4444444444', 
          '5555555555', '6666666666', '7777777777'
      ];
      if (dummyPatterns.includes(mobile)) return false;

      return true;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) setCsvContent(evt.target.result as string);
      };
      reader.readAsText(file);
    }
  };

  // --- Header Image Upload Handlers with Compression ---
  const handleImageFile = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
        try {
            // Compress image to ensure it doesn't break LocalStorage quota
            const compressedImg = await compressImage(file);
            setHeaderImage(compressedImg);
            
            // Attempt to save to LocalStorage
            const success = DB.saveSettings({ appName, leaderName, headerImage: compressedImg });
            
            if (!success) {
                alert("Storage Error: The image is still too large for the browser's storage limits. Please try a smaller image.");
            }
        } catch (error) {
            console.error("Error processing image:", error);
            alert("Failed to process image. Please try another file.");
        }
    }
  };

  const onHeaderImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          handleImageFile(e.target.files[0]);
      }
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleImageFile(e.dataTransfer.files[0]);
      }
  };

  const processCsv = () => {
    try {
      setCsvError(null);
      const lines = csvContent.split('\n');
      const newData: any[] = [];
      let skippedCount = 0;
      
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        if (row.length >= 3) {
            const name = row[0]?.trim();
            const mobile = row[1]?.trim();
            
            if(!name || !mobile) continue;

            if (!validateMobile(mobile)) {
                skippedCount++;
                continue;
            }

            newData.push({
                name: name,
                mobile_number: mobile,
                dob: row[2].trim(),
                anniversary: row[3]?.trim() || undefined,
                ward_number: row[4]?.trim() || 'General',
                address: row[5]?.trim() || 'Local',
                // New Fields in CSV
                block: row[6]?.trim() || '',
                gp_ulb: row[7]?.trim() || ''
            });
        }
      }

      if (newData.length === 0 && skippedCount > 0) {
          setUploadStatus('error');
          setCsvError(`All ${skippedCount} records were skipped due to invalid mobile numbers.`);
          return;
      }

      DB.addConstituents(newData);
      setUploadStatus('success');
      setCsvContent('');
      if (skippedCount > 0) {
          setCsvError(`Uploaded ${newData.length} records. Skipped ${skippedCount} invalid numbers.`);
      }
      refreshData();
      setTimeout(() => { setUploadStatus('idle'); setCsvError(null); }, 4000);
    } catch (err) {
      console.error(err);
      setUploadStatus('error');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(!manualForm.name || !manualForm.mobile || !manualForm.dob) return;

      if (!validateMobile(manualForm.mobile)) {
          alert("Invalid Mobile Number. Must be 10 digits and not a dummy sequence.");
          return;
      }

      DB.addConstituents([{
          name: manualForm.name,
          mobile_number: manualForm.mobile,
          dob: manualForm.dob,
          anniversary: manualForm.anniversary || undefined,
          block: manualForm.block,
          gp_ulb: manualForm.gp_ulb,
          ward_number: manualForm.ward || 'General',
          address: manualForm.address || 'Local'
      }]);

      setUploadStatus('success');
      setManualForm({ name: '', mobile: '', dob: '', anniversary: '', block: '', gp_ulb: '', ward: '', address: '' });
      refreshData();
      setTimeout(() => setUploadStatus('idle'), 3000);
  };

  const generateSynthetic = () => {
      DB.seedSampleData();
      setUploadStatus('success');
      refreshData();
      setTimeout(() => setUploadStatus('idle'), 3000);
  }

  const triggerSystemBrain = () => {
    const result = DB.runDailyScan();
    setScanResult(result.newTasks);
    setTimeout(() => setScanResult(null), 4000);
    refreshData();
  };

  // --- Campaign Wizard Logic ---
  const handleAddFestival = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newFestivalForm.name || !newFestivalForm.date) return;
      
      DB.addFestival(newFestivalForm);
      setFestivals(DB.getFestivals()); // Refresh list
      setNewFestivalForm({ name: '', date: '', description: '' });
      setShowAddFestivalForm(false);
  };

  const openCampaignWizard = (festivalName: string, date: string = '') => {
      setFestivalModalOpen(false); // Close manager if open
      setSelectedFestival(festivalName);
      // Auto-Draft Default
      const defaultMsg = `Wishing you and your family a very happy ${festivalName}! - ${leaderName}`;
      
      setCampaignData({
          audience: 'ALL',
          message: defaultMsg,
          language: 'ODIA',
          scheduleType: 'NOW',
          scheduleDate: date,
          scheduleTime: '09:00'
      });
      setAiVariations([]); // Reset AI
      setWizardStep(1);
      setCampaignWizardOpen(true);
  };

  const handleAiRewrite = async () => {
      if (!selectedFestival) return;
      setIsGeneratingAi(true);
      const variations = await getCampaignVariations(selectedFestival, leaderName, campaignData.language);
      setAiVariations(variations);
      setIsGeneratingAi(false);
  };

  const finalizeCampaign = () => {
      setScheduledCampaigns(prev => [...prev, {
          id: Date.now(),
          name: selectedFestival,
          audience: campaignData.audience,
          count: campaignData.audience === 'ALL' ? constituents.length : Math.floor(constituents.length * 0.3),
          scheduledFor: campaignData.scheduleType === 'NOW' ? 'Sent Just Now' : `${campaignData.scheduleDate} @ ${campaignData.scheduleTime}`,
          status: campaignData.scheduleType === 'NOW' ? 'COMPLETED' : 'SCHEDULED'
      }]);
      setCampaignWizardOpen(false);
  };

  // --- Task Action Logic (Staff Version) ---
  const handleTaskAction = (task: EnrichedTask, action: 'call' | 'sms' | 'whatsapp') => {
      if (task.status === 'COMPLETED' && task.action_taken === action.toUpperCase()) {
        const confirmResend = confirm(`Already sent a ${action.toUpperCase()} to ${task.constituent.name}. Send again?`);
        if (!confirmResend) return;
      }
      
      setSelectedTask(task);
      setCurrentAction(action);
      setGreetingLanguage('ODIA');

      if (action === 'call') {
          // Use location.href for smoother phone dialer launch on mobile/web
          window.location.href = `tel:${task.constituent.mobile_number}`;
          setTimeout(() => {
              setGeneratedMessage('');
              setFeedbackMode(true);
          }, 1000);
      } else {
          // Instant Message Generation
          const msg = GreetingService.getInstantMessage(task.constituent.name, task.type, 'ODIA');
          setGeneratedMessage(msg);
          setFeedbackMode(true);
      }
  };

  const completeTask = () => {
      if (selectedTask) {
          const allTasks = DB.getTasks();
          const existingIndex = allTasks.findIndex(t => t.id === selectedTask.id);
          
          if (existingIndex !== -1) {
              // Update existing real task
              DB.updateTask(selectedTask.id, {
                  status: 'COMPLETED',
                  notes: feedbackNotes || 'Action taken via Staff Portal',
                  action_taken: currentAction?.toUpperCase() as any,
                  completed_by: 'STAFF'
              });
          } else {
              // Create new completed task from virtual task
              const newTask: Task = {
                  id: uuidv4(),
                  constituent_id: selectedTask.constituent.id,
                  type: selectedTask.type,
                  due_date: selectedTask.due_date,
                  status: 'COMPLETED',
                  notes: feedbackNotes || 'Action taken via Staff Portal',
                  action_taken: currentAction?.toUpperCase() as any,
                  completed_by: 'STAFF',
                  created_at: new Date().toISOString()
              };
              // Manually push to storage since DB service doesn't have createCompleted method exposed directly
              allTasks.push(newTask);
              localStorage.setItem('ac_connect_tasks', JSON.stringify(allTasks));
          }
          
          setFeedbackMode(false);
          setSelectedTask(null);
          refreshData(); 
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
  
    const proceedToMessage = () => {
      if(selectedTask) {
        const encoded = encodeURIComponent(generatedMessage);
        if (currentAction === 'whatsapp') {
            // Using window.open for WhatsApp/SMS as it's an external app intent
            window.location.href = `https://wa.me/${selectedTask.constituent.mobile_number}?text=${encoded}`;
        } else if (currentAction === 'sms') {
            window.location.href = `sms:${selectedTask.constituent.mobile_number}?body=${encoded}`;
        }
        // Staff portal also mimics the "Return Trigger" logic
        setGeneratedMessage(''); // Clear message to show verification options
      }
  }


  // --- Search & Pagination Logic ---
  const filteredConstituents = constituents.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.mobile_number.includes(searchTerm) ||
      c.ward_number.includes(searchTerm) ||
      (c.block && c.block.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const totalPages = Math.ceil(filteredConstituents.length / itemsPerPage);
  const currentData = filteredConstituents.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const goToPage = (p: number) => {
      if (p >= 1 && p <= totalPages) setCurrentPage(p);
  }

  // --- Calendar & Scheduler Helpers ---
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const getEventsForDay = (day: number) => {
      return constituents.filter(c => {
          const dob = new Date(c.dob);
          const ann = c.anniversary ? new Date(c.anniversary) : null;
          
          const isBirthday = dob.getDate() === day && dob.getMonth() === currentDate.getMonth();
          const isAnniversary = ann && ann.getDate() === day && ann.getMonth() === currentDate.getMonth();
          
          return isBirthday || isAnniversary;
      });
  };
  
  const getFestivalsForDay = (day: number) => {
      return festivals.filter(f => {
          const fDate = new Date(f.date);
          return fDate.getDate() === day && fDate.getMonth() === currentDate.getMonth() && fDate.getFullYear() === currentDate.getFullYear();
      });
  }

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  // --- Compute Tasks for Selected Date (Sidebar Logic) ---
  const getSidebarTasks = () => {
      // 1. Get real tasks from DB for this date
      const allDbTasks = DB.getEnrichedTasks();
      // Adjust selectedDate to match storage string format (YYYY-MM-DD)
      // Note: This relies on local time, simple string matching
      const dateStr = selectedDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      
      const realTasks = allDbTasks.filter(t => t.due_date === dateStr);
      
      // 2. Get potential events for this date (Virtual Pending Tasks)
      const events = getEventsForDay(selectedDate.getDate());
      
      const combinedTasks: EnrichedTask[] = [...realTasks];
      
      // Add virtual tasks for constituents who have an event but no real task record
      events.forEach(c => {
          const hasRealTask = realTasks.some(t => t.constituent_id === c.id);
          if (!hasRealTask) {
                const dob = new Date(c.dob);
                const isBirthday = dob.getDate() === selectedDate.getDate() && dob.getMonth() === selectedDate.getMonth();
                
                combinedTasks.push({
                    id: `virtual-${c.id}`, // Virtual ID
                    constituent_id: c.id,
                    constituent: c,
                    type: isBirthday ? 'BIRTHDAY' : 'ANNIVERSARY',
                    due_date: dateStr,
                    status: 'PENDING',
                    created_at: new Date().toISOString()
                } as EnrichedTask);
          }
      });
      
      return combinedTasks;
  };
  
  const rawSidebarTasks = getSidebarTasks();

  const filteredSidebarTasks = rawSidebarTasks.filter(t => {
      if (t.status !== filterStatus) return false;
      if (filterType !== 'ALL' && t.type !== filterType) return false;
      return true;
  });

  const sidebarCounts = {
      pending: rawSidebarTasks.filter(t => t.status === 'PENDING').length,
      history: rawSidebarTasks.filter(t => t.status === 'COMPLETED').length,
      birthdays: rawSidebarTasks.filter(t => t.status === filterStatus && t.type === 'BIRTHDAY').length,
      anniversaries: rawSidebarTasks.filter(t => t.status === filterStatus && t.type === 'ANNIVERSARY').length
  };

  // Render Table Row Skeleton
  const renderTableSkeleton = () => (
      <>
        {[1, 2, 3, 4, 5].map((i) => (
             <tr key={i} className="animate-pulse">
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-10"></div></td>
            </tr>
        ))}
      </>
  );

  // --- LIVE PREVIEW DATA HELPER ---
  const getPreviewItems = () => {
    const today = new Date();
    
    // 1. Try to find actual events for today
    let items = constituents.filter(c => {
         const dob = new Date(c.dob);
         const isBday = dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth();
         const ann = c.anniversary ? new Date(c.anniversary) : null;
         const isAnn = ann && ann.getDate() === today.getDate() && ann.getMonth() === today.getMonth();
         return isBday || isAnn;
    }).map(c => {
         const dob = new Date(c.dob);
         const isBday = dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth();
         return { ...c, type: isBday ? 'BIRTHDAY' : 'ANNIVERSARY' };
    });

    // 2. Fallback: If no events today, show first 3 constituents as "Mock" events for visual demo
    if (items.length === 0 && constituents.length > 0) {
        items = constituents.slice(0, 3).map((c, i) => ({
            ...c, 
            type: i % 2 === 0 ? 'BIRTHDAY' : 'ANNIVERSARY' // Alternating types
        }));
    }
    
    return items.slice(0, 4); // Max 4 items in preview
  };

  const previewItems = getPreviewItems();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 font-sans relative">
      {/* Header - Made Responsive (Stack on mobile, row on MD) */}
      <header className="bg-white/80 border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between sticky top-0 z-30 shadow-sm/50 backdrop-blur-md gap-4 animate-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-primary to-teal-500 p-2.5 rounded-xl shadow-lg shadow-teal-200 shrink-0 transform transition hover:scale-105">
                <Database className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">{appName}</h1>
                <p className="text-xs text-gray-500 font-medium">Staff Portal & Admin Control</p>
            </div>
          </div>
          
          {/* Notification Bell (Mobile/Desktop) */}
          <div className="relative cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors md:hidden">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
        </div>
        
        {/* Scrollable Tabs for Mobile */}
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-full md:w-auto overflow-x-auto hide-scrollbar flex-1">
                <div className="flex bg-gray-100/50 p-1 rounded-xl border border-gray-200 w-max shadow-inner">
                    <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all duration-300 whitespace-nowrap active:scale-95 ${activeTab === 'dashboard' ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}
                    >
                        CMS & Admin
                    </button>
                    <button 
                        onClick={() => setActiveTab('scheduler')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all duration-300 whitespace-nowrap active:scale-95 ${activeTab === 'scheduler' ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}
                    >
                        Scheduler
                    </button>
                    <button 
                        onClick={() => setActiveTab('upload')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all duration-300 whitespace-nowrap active:scale-95 ${activeTab === 'upload' ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}`}
                    >
                        Data Entry
                    </button>
                </div>
            </div>
             {/* Notification Bell (Desktop) */}
            <div className="relative cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors hidden md:block group">
                <Bell className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 relative z-0">
        
        {/* System Brain Status Panel */}
        <div className="bg-gradient-to-r from-gray-900 to-teal-900 rounded-2xl p-6 mb-8 text-white flex flex-col md:flex-row items-center justify-between shadow-xl shadow-teal-900/10 relative overflow-hidden group animate-in zoom-in-95 duration-700">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="relative z-10 text-center md:text-left mb-4 md:mb-0">
                <h2 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                    <Activity className="text-green-400 animate-pulse-slow" /> 
                    System Brain
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                    Automated daily scan for birthdays & anniversaries.
                </p>
            </div>
            <div className="flex flex-col items-center md:items-end relative z-10">
                <button 
                    onClick={triggerSystemBrain}
                    className="bg-secondary hover:bg-amber-600 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-amber-900/20 transition-all hover:shadow-amber-900/40 active:scale-95 flex items-center gap-2"
                >
                    <CheckCircle className="w-4 h-4" />
                    Force Daily Scan
                </button>
                {scanResult !== null && (
                    <span className="text-green-400 text-sm font-bold mt-2 animate-bounce">
                        Generated {scanResult} new tasks!
                    </span>
                )}
            </div>
        </div>

        {/* --- CMS & ADMIN DASHBOARD --- */}
        {activeTab === 'dashboard' && (
            <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                {/* ZONE A: App Customization (50%) */}
                <div className="lg:w-1/2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-teal-600" />
                        <h3 className="font-bold text-gray-900">Mobile App Visuals</h3>
                    </div>
                    
                    <div className="p-6 space-y-8">
                         {/* App Name */}
                         <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">App Name</label>
                             <input 
                                type="text" 
                                value={appName}
                                onChange={(e) => handleAppNameChange(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium bg-white text-gray-900"
                             />
                         </div>

                         {/* Leader Name */}
                         <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Leader Display Name</label>
                             <input 
                                type="text" 
                                value={leaderName}
                                onChange={(e) => handleLeaderNameChange(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium bg-white text-gray-900"
                             />
                         </div>

                         {/* Image Upload */}
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">App Header Image</label>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer group ${isDragging ? 'border-primary bg-teal-50' : 'border-gray-200 bg-gray-50 hover:bg-teal-50'}`}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={onHeaderImageChange}
                                />
                                <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                    <ImageIcon className={`w-6 h-6 transition-colors ${isDragging ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`} />
                                </div>
                                <span className="text-sm font-bold text-gray-600">
                                    {headerImage ? 'Click to Replace Image' : 'Drag & Drop or Click to Upload'}
                                </span>
                                <p className="text-xs text-gray-400 mt-2 text-center max-w-[250px]">
                                    Recommended Size: 1200 x 600px (Aspect Ratio 2:1). Ensure the subject is centered for perfect responsiveness.
                                </p>
                            </div>
                         </div>

                         {/* Mobile Preview */}
                         <div className="mt-4">
                             <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">Live Preview</label>
                             <div className="w-[320px] mx-auto bg-gray-50 rounded-[2.5rem] border-8 border-gray-900 shadow-2xl overflow-hidden relative h-[550px]">
                                {/* Actual Leader App Header Replica */}
                                <div className="relative pt-6 pb-4 px-5 overflow-hidden shrink-0 bg-teal-900">
                                     {/* Background Image Layer */}
                                     {headerImage ? (
                                         <div className="absolute inset-0 z-0">
                                             <img src={headerImage} className="w-full h-full object-cover" alt="Header Background" />
                                             <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
                                         </div>
                                     ) : (
                                         <div className="absolute inset-0 bg-gradient-to-b from-teal-700 to-teal-900 z-0"></div>
                                     )}
                                     
                                     {/* Background Effects (If no image or overlay) */}
                                     <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-teal-400/20 rounded-full blur-3xl pointer-events-none z-0"></div>
                                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay z-0"></div>

                                    <div className="relative z-10 flex justify-between items-start mb-6">
                                        {/* Left Content */}
                                        <div className="pt-2 max-w-[60%]">
                                            <h1 className="text-white text-2xl font-black tracking-tight drop-shadow-md leading-none">
                                                {appName}
                                            </h1>
                                            <div className="flex items-center gap-1.5 mt-2">
                                                 <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)] shrink-0"></div>
                                                 <p className="text-teal-50 font-medium text-xs leading-tight truncate">
                                                    {leaderName || "Leader Name"}
                                                 </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Floating Glass Pill Tabs */}
                                    <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-full p-1 flex shadow-lg">
                                        <div className="flex-1 py-2 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-1 bg-white text-teal-900 shadow-sm">
                                            Pending
                                            <span className="w-4 h-4 flex items-center justify-center rounded-full text-[8px] font-black leading-none bg-teal-100 text-teal-800">
                                                {previewItems.length || 2}
                                            </span>
                                        </div>
                                        <div className="flex-1 py-2 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-1 text-teal-50">
                                            History
                                        </div>
                                    </div>
                                </div>

                                {/* Sub-Filters Mock */}
                                <div className="px-4 py-2 bg-white border-b border-gray-100 flex justify-center gap-2 overflow-x-hidden">
                                     <div className="px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-wide border bg-teal-50 text-teal-800 border-teal-200 shadow-sm">ALL</div>
                                     <div className="px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-wide border bg-white border-gray-200 text-gray-400">BIRTHDAYS</div>
                                     <div className="px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-wide border bg-white border-gray-200 text-gray-400">ANNIV.</div>
                                </div>

                                {/* Real Data Preview List */}
                                <div className="p-4 space-y-3 bg-gray-50 flex-1 overflow-hidden">
                                     {previewItems.map((item, index) => (
                                         <div key={index} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 transform scale-[0.95] origin-top">
                                             <div className="flex justify-between items-start mb-2">
                                                 <div className="flex gap-2">
                                                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.type === 'BIRTHDAY' ? 'bg-pink-50 text-pink-500' : 'bg-purple-50 text-purple-500'}`}>
                                                         {item.type === 'BIRTHDAY' ? <Gift className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                                                     </div>
                                                     <div>
                                                         <div className="font-bold text-gray-900 text-xs">{item.name}</div>
                                                         <div className="flex items-center gap-1 mt-0.5">
                                                             <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${item.type === 'BIRTHDAY' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'}`}>
                                                                 {item.type}
                                                             </span>
                                                         </div>
                                                     </div>
                                                 </div>
                                                 <div className="bg-gray-50 px-1.5 py-0.5 rounded text-[8px] font-bold text-gray-500 border border-gray-100">
                                                     Ward {item.ward_number}
                                                 </div>
                                             </div>
                                             {/* Action Buttons Mock */}
                                             <div className="flex gap-1 mt-2">
                                                 <div className="flex-1 h-6 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center">
                                                     <Phone className="w-3 h-3 text-gray-400" />
                                                 </div>
                                                 <div className="flex-1 h-6 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center">
                                                     <MessageSquare className="w-3 h-3 text-blue-400" />
                                                 </div>
                                                 <div className="flex-1 h-6 bg-green-50 border border-green-100 rounded-lg flex items-center justify-center">
                                                     <WhatsAppIcon className="w-3 h-3 text-green-500" />
                                                 </div>
                                             </div>
                                         </div>
                                     ))}
                                </div>
                                
                                {/* Selection FAB Mock */}
                                <div className="absolute bottom-4 right-4 w-10 h-10 bg-teal-600 rounded-full shadow-lg flex items-center justify-center text-white">
                                    <ListChecks className="w-5 h-5" />
                                </div>
                             </div>
                         </div>
                    </div>
                </div>

                {/* ZONE B: Command Center (50%) */}
                <div className="lg:w-1/2 flex flex-col gap-6">
                     {/* Alert Settings */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                            <Bell className="w-5 h-5 text-orange-500" />
                            <h3 className="font-bold text-gray-900">Automated Alert Settings</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Heads-Up Protocol (8:00 PM)</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Sends a summary of <span className="font-bold text-gray-700">tomorrow's</span> birthdays/events.</p>
                                </div>
                                <button 
                                    onClick={() => setAlertSettings(prev => ({...prev, headsUp: !prev.headsUp}))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${alertSettings.headsUp ? 'bg-primary' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${alertSettings.headsUp ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Action Protocol (8:00 AM)</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Sends the actionable list of <span className="font-bold text-gray-700">today's</span> tasks.</p>
                                </div>
                                <button 
                                    onClick={() => setAlertSettings(prev => ({...prev, action: !prev.action}))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${alertSettings.action ? 'bg-primary' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${alertSettings.action ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats (Retained simplified version) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
                        <h3 className="font-bold text-gray-900 mb-4">Database Snapshot</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-teal-50 rounded-xl border border-teal-100">
                                <span className="text-teal-600 font-bold text-2xl block">{constituents.length}</span>
                                <span className="text-teal-800/60 text-xs font-bold uppercase tracking-wide">Total Constituents</span>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <span className="text-orange-600 font-bold text-2xl block">{DB.getTasks().filter(t => t.status === 'PENDING').length}</span>
                                <span className="text-orange-800/60 text-xs font-bold uppercase tracking-wide">Pending Tasks</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* ... (Previous Tab Content: Upload) ... */}
        {activeTab === 'upload' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto overflow-hidden animate-in zoom-in-95 duration-500">
                {/* Header for Upload Section */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Import Data</h3>
                        <p className="text-gray-500 text-sm mt-1">Add constituents via CSV or manual form.</p>
                    </div>
                    <div className="flex bg-white rounded-xl p-1 border border-gray-200 shadow-sm w-full sm:w-auto">
                        <button
                            onClick={() => setEntryMode('csv')}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 active:scale-95 ${entryMode === 'csv' ? 'bg-teal-100 text-teal-800 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <FileText className="w-4 h-4" /> CSV Upload
                        </button>
                        <button
                            onClick={() => setEntryMode('manual')}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 active:scale-95 ${entryMode === 'manual' ? 'bg-teal-100 text-teal-800 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Plus className="w-4 h-4" /> Manual Entry
                        </button>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    {/* CSV MODE */}
                    {entryMode === 'csv' && (
                        <div className="animate-in fade-in duration-300">
                             <div className="flex justify-end mb-4">
                                <button 
                                    onClick={generateSynthetic}
                                    className="flex items-center gap-2 bg-teal-50 text-teal-700 hover:bg-teal-100 px-4 py-2 rounded-lg text-xs font-bold transition border border-teal-200 active:scale-95"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Generate 50 Sample Records
                                </button>
                             </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-teal-50 transition-colors duration-300 mb-6 group text-center cursor-pointer">
                                <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary transition-colors" />
                                </div>
                                <label className="cursor-pointer">
                                    <span className="bg-white border border-gray-300 text-gray-700 hover:text-primary px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition hover:shadow-md block">
                                        Select CSV File
                                    </span>
                                    <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                                </label>
                                <p className="text-xs text-gray-400 mt-2">or paste CSV content below</p>
                            </div>

                            <textarea 
                                className="w-full h-32 p-4 border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow bg-white text-gray-900"
                                placeholder="Name,Mobile,DOB,Anniversary,Ward,Address,Block,GP_ULB..."
                                value={csvContent}
                                onChange={(e) => setCsvContent(e.target.value)}
                            />

                            {/* CSV Error Report */}
                            {csvError && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-sm text-red-700 animate-in slide-in-from-top-2">
                                    <Activity className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{csvError}</span>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end">
                                <button 
                                    onClick={processCsv}
                                    disabled={!csvContent}
                                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition transform active:scale-95 ${!csvContent ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-teal-800 shadow-lg shadow-teal-900/20'}`}
                                >
                                    {uploadStatus === 'success' ? <CheckCircle className="w-5 h-5" /> : <Database className="w-5 h-5" />}
                                    {uploadStatus === 'success' ? 'Imported!' : 'Import Data'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* MANUAL FORM MODE - REORGANIZED LAYOUT */}
                    {entryMode === 'manual' && (
                        <form onSubmit={handleManualSubmit} className="animate-in fade-in duration-300 space-y-6">
                            
                            {/* Row 1: Name and DOB */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow bg-white text-gray-900"
                                        placeholder="e.g. Rahul Sharma"
                                        value={manualForm.name}
                                        onChange={(e) => setManualForm({...manualForm, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Date of Birth</label>
                                    <input 
                                        type="date" 
                                        required
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow bg-white text-gray-900"
                                        value={manualForm.dob}
                                        onChange={(e) => setManualForm({...manualForm, dob: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Row 2: Mobile and Anniversary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number</label>
                                    <input 
                                        type="tel" 
                                        required
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow bg-white text-gray-900"
                                        placeholder="e.g. 9876543210"
                                        value={manualForm.mobile}
                                        onChange={(e) => setManualForm({...manualForm, mobile: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Anniversary (Optional)</label>
                                    <input 
                                        type="date" 
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow bg-white text-gray-900"
                                        value={manualForm.anniversary}
                                        onChange={(e) => setManualForm({...manualForm, anniversary: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Row 3: Block and Address */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Block</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow bg-white text-gray-900"
                                        placeholder="e.g. Bhubaneswar Block"
                                        value={manualForm.block}
                                        onChange={(e) => setManualForm({...manualForm, block: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow bg-white text-gray-900"
                                        placeholder="e.g. House No. 5, Sector 15"
                                        value={manualForm.address}
                                        onChange={(e) => setManualForm({...manualForm, address: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Row 4: GP/ULB and Ward - ADJACENT AS REQUESTED */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Gram Panchayat / ULB</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow bg-white text-gray-900"
                                        placeholder="e.g. Madanpur GP"
                                        value={manualForm.gp_ulb}
                                        onChange={(e) => setManualForm({...manualForm, gp_ulb: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Ward Number</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow bg-white text-gray-900"
                                        placeholder="e.g. 12"
                                        value={manualForm.ward}
                                        onChange={(e) => setManualForm({...manualForm, ward: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <button 
                                    type="submit"
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-primary hover:bg-teal-800 shadow-lg shadow-teal-900/20 transition transform active:scale-95"
                                >
                                    {uploadStatus === 'success' ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                                    {uploadStatus === 'success' ? 'Saved!' : 'Save Record'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        )}

        {/* --- SCHEDULER DASHBOARD (70/30 Split) --- */}
        {activeTab === 'scheduler' && (
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-250px)] min-h-[600px] animate-in fade-in slide-in-from-bottom-5 duration-500">
                {/* LEFT ZONE: VISUAL PLANNER (70%) */}
                <div className="lg:w-[70%] bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300">
                    {/* Calendar Header */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                         <div className="flex items-center gap-4">
                             <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <CalendarIcon className="w-6 h-6 text-primary" />
                                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                             </h2>
                             <div className="flex gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                                <button onClick={prevMonth} className="p-1.5 hover:bg-gray-50 rounded-md transition active:scale-90"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
                                <button onClick={nextMonth} className="p-1.5 hover:bg-gray-50 rounded-md transition active:scale-90"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
                            </div>
                         </div>
                         <button 
                            onClick={() => setFestivalModalOpen(true)}
                            className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-gray-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                         >
                            <PartyPopper className="w-4 h-4 text-amber-400" />
                            Festival Greetings
                         </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="flex-1 flex flex-col p-6 pt-0 overflow-y-auto">
                        {/* Days Header */}
                        <div className="grid grid-cols-7 mb-2 border-b border-gray-100">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase py-3">
                                    {day}
                                </div>
                            ))}
                        </div>
                        
                        {/* Days Grid */}
                        <div className="grid grid-cols-7 flex-1 gap-2 auto-rows-fr">
                            {Array.from({ length: firstDayOfMonth(currentDate) }).map((_, i) => (
                                <div key={`empty-${i}`} className="min-h-[80px]" />
                            ))}

                            {Array.from({ length: daysInMonth(currentDate) }).map((_, i) => {
                                const day = i + 1;
                                const events = getEventsForDay(day);
                                const festivalsForDay = getFestivalsForDay(day);
                                const hasFestival = festivalsForDay.length > 0;
                                
                                const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth();
                                const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth();
                                
                                return (
                                    <div 
                                        key={day} 
                                        onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                                        className={`
                                            rounded-xl border p-2 cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[80px] relative group overflow-visible
                                            ${isSelected ? 'border-primary bg-teal-50 ring-1 ring-primary shadow-inner' : 'border-gray-100 hover:border-teal-200 hover:shadow-md hover:-translate-y-0.5 hover:bg-white'}
                                        `}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors ${isToday ? 'bg-primary text-white shadow-md shadow-teal-500/30' : 'text-gray-700 group-hover:text-primary'}`}>
                                                {day}
                                            </span>
                                            {/* Festival Dot */}
                                            {hasFestival && (
                                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" title={festivalsForDay[0].name}></div>
                                            )}
                                        </div>

                                        {/* Event Dots */}
                                        <div className="flex gap-1 flex-wrap content-end mt-1">
                                            {hasFestival && (
                                                <span className="text-[9px] font-bold text-orange-600 bg-orange-100 px-1 rounded truncate w-full mb-1 border border-orange-200">
                                                    {festivalsForDay[0].name}
                                                </span>
                                            )}
                                            {events.slice(0, 5).map((e, idx) => {
                                                 const isBday = new Date(e.dob).getDate() === day;
                                                 return (
                                                     <div 
                                                        key={idx} 
                                                        className={`w-2 h-2 rounded-full ring-1 ring-white ${isBday ? 'bg-pink-400' : 'bg-purple-400'}`}
                                                     ></div>
                                                 )
                                            })}
                                            {events.length > 5 && (
                                                <span className="text-[9px] text-gray-400 font-bold">+</span>
                                            )}
                                        </div>

                                        {/* HOVER TOOLTIP */}
                                        <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 w-max max-w-[180px] bg-white rounded-xl shadow-xl border border-gray-100 p-3 animate-in zoom-in-95 duration-200 pointer-events-none">
                                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-gray-100 transform rotate-45"></div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">
                                                {new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                            {hasFestival && (
                                                <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-orange-600">
                                                    <PartyPopper className="w-3 h-3" />
                                                    {festivalsForDay[0].name}
                                                </div>
                                            )}
                                            {events.length > 0 ? (
                                                <div className="space-y-1">
                                                    {events.slice(0, 3).map((e, idx) => {
                                                        const isBday = new Date(e.dob).getDate() === day;
                                                        return (
                                                            <div key={idx} className="flex items-center gap-1.5 text-[10px] font-medium text-gray-700 truncate">
                                                                <div className={`w-1.5 h-1.5 rounded-full ${isBday ? 'bg-pink-400' : 'bg-purple-400'}`}></div>
                                                                {e.name}
                                                            </div>
                                                        )
                                                    })}
                                                    {events.length > 3 && <div className="text-[9px] text-gray-400 pl-3">+{events.length - 3} more</div>}
                                                </div>
                                            ) : !hasFestival && (
                                                <div className="text-[10px] text-gray-400 italic">No events</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* RIGHT ZONE: ACTION SIDEBAR (30%) */}
                <div className="lg:w-[30%] bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 flex flex-col overflow-hidden relative transition-all hover:shadow-xl">
                     {/* Header - TEAL GRADIENT MATCHING LEADER APP */}
                     <div className="bg-gradient-to-b from-teal-700 to-teal-900 p-6 text-white shrink-0 relative overflow-hidden">
                         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                         
                         <div className="relative z-10">
                            <h3 className="text-teal-200 text-xs font-bold uppercase tracking-wider mb-1">Schedule For</h3>
                            <h2 className="text-2xl font-black text-white mb-4 drop-shadow-sm">
                                {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </h2>
                            {/* ... Pending/History Toggle ... */}
                             <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full p-1.5 flex shadow-lg">
                                <button
                                    onClick={() => setFilterStatus('PENDING')}
                                    className={`flex-1 py-2 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${filterStatus === 'PENDING' ? 'bg-white text-teal-900 shadow-sm' : 'text-teal-50 hover:text-white'}`}
                                >
                                    Pending
                                    {sidebarCounts.pending > 0 && (
                                        <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-black leading-none ${filterStatus === 'PENDING' ? 'bg-teal-100 text-teal-800' : 'bg-white/20 text-white'}`}>
                                            {sidebarCounts.pending}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setFilterStatus('COMPLETED')}
                                    className={`flex-1 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${filterStatus === 'COMPLETED' ? 'bg-white text-teal-900 shadow-sm' : 'text-teal-50 hover:text-white'}`}
                                >
                                    History
                                </button>
                            </div>
                         </div>
                     </div>
                     
                     {/* Filter Chips */}
                     <div className="px-4 py-3 bg-white border-b border-gray-100 flex gap-2 overflow-x-auto hide-scrollbar shrink-0">
                        <button 
                            onClick={() => setFilterType('ALL')}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all active:scale-95 whitespace-nowrap ${filterType === 'ALL' ? 'bg-teal-50 text-teal-800 border-teal-200 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        >
                            ALL
                        </button>
                        <button 
                            onClick={() => setFilterType('BIRTHDAY')}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all active:scale-95 whitespace-nowrap ${filterType === 'BIRTHDAY' ? 'bg-pink-50 text-pink-700 border-pink-200 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Gift className="w-3 h-3" /> 
                            B-Day
                            {sidebarCounts.birthdays > 0 && <span className="ml-1 opacity-70">({sidebarCounts.birthdays})</span>}
                        </button>
                        <button 
                            onClick={() => setFilterType('ANNIVERSARY')}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all active:scale-95 whitespace-nowrap ${filterType === 'ANNIVERSARY' ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Heart className="w-3 h-3" /> 
                            Anniv.
                            {sidebarCounts.anniversaries > 0 && <span className="ml-1 opacity-70">({sidebarCounts.anniversaries})</span>}
                        </button>
                     </div>

                     {/* Scrollable List */}
                     <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                        {filteredSidebarTasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                                <div className="bg-gray-100 p-4 rounded-full mb-3">
                                    <ListChecks className="w-6 h-6 opacity-30" />
                                </div>
                                <p className="text-sm font-medium">No {filterStatus.toLowerCase()} tasks found.</p>
                            </div>
                        ) : (
                            filteredSidebarTasks.map((task, index) => (
                                <div 
                                    key={task.id} 
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-teal-200 hover:-translate-y-1 transition-all duration-300 group animate-in slide-in-from-bottom-2 fill-mode-backwards"
                                >
                                     {/* Header Row: Name & Badge */}
                                     <div className="flex justify-between items-start mb-3">
                                         <div>
                                             <h4 className="font-bold text-gray-900 text-base">{task.constituent.name}</h4>
                                             <div className="flex gap-2 mt-1">
                                                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${task.type === 'BIRTHDAY' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'}`}>
                                                     {task.type}
                                                 </span>
                                                 <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                                     Ward {task.constituent.ward_number}
                                                 </span>
                                             </div>
                                         </div>
                                         {task.status === 'COMPLETED' ? (
                                             <div className="bg-green-100 text-green-700 p-1 rounded-full">
                                                 <Check className="w-4 h-4" />
                                             </div>
                                         ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 transition group-hover:bg-gray-100 group-hover:text-primary">
                                                {task.type === 'BIRTHDAY' ? <Gift className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                                            </div>
                                         )}
                                     </div>

                                     {/* Address Line */}
                                     <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                                        <MapPin className="w-3 h-3 text-gray-400" />
                                        <span className="truncate max-w-[200px]">{task.constituent.address}</span>
                                     </div>

                                     {/* Action Buttons: 3-Button Layout - Standardized */}
                                     <div className="flex gap-2 mt-2">
                                         <button 
                                            onClick={() => handleTaskAction(task, 'call')}
                                            className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 border shadow-sm ${task.status === 'COMPLETED' && task.action_taken === 'CALL' ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-help' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-100'}`}
                                            title="Call"
                                         >
                                             <Phone className="w-4 h-4" /> Call
                                         </button>
                                         <button 
                                            onClick={() => handleTaskAction(task, 'sms')}
                                            className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm border ${task.status === 'COMPLETED' && task.action_taken === 'SMS' ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-help' : 'bg-blue-50/50 hover:bg-blue-100/80 text-blue-700 border-blue-100/50'}`}
                                            title="Send SMS"
                                         >
                                             <MessageSquare className="w-4 h-4" /> SMS
                                         </button>
                                         <button 
                                            onClick={() => handleTaskAction(task, 'whatsapp')}
                                            className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm border ${task.status === 'COMPLETED' && task.action_taken === 'WHATSAPP' ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-help' : 'bg-green-50/50 hover:bg-green-100/80 text-green-700 border-green-100/50'}`}
                                            title="Send WhatsApp"
                                         >
                                             <WhatsAppIcon className="w-4 h-4" /> WhatsApp
                                         </button>
                                     </div>
                                </div>
                            ))
                        )}
                     </div>
                </div>
            </div>
        )}
      </main>

      {/* --- FESTIVAL GREETINGS MANAGER MODAL (Updated Z-Index & Position) --- */}
        {festivalModalOpen && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <PartyPopper className="w-6 h-6 text-amber-500" />
                                Festival Greetings
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Manage upcoming events and plan greeting campaigns.</p>
                        </div>
                        <button onClick={() => setFestivalModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
                        {/* Add Event Section */}
                        <div className="mb-8">
                            <button 
                                onClick={() => setShowAddFestivalForm(!showAddFestivalForm)}
                                className="flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800 transition-colors mb-4"
                            >
                                <div className={`p-1 rounded bg-teal-100 transition-transform duration-300 ${showAddFestivalForm ? 'rotate-45' : ''}`}>
                                    <Plus className="w-4 h-4" />
                                </div>
                                {showAddFestivalForm ? 'Cancel New Event' : 'Add Custom Event to Calendar'}
                            </button>

                            {showAddFestivalForm && (
                                <form onSubmit={handleAddFestival} className="bg-white p-4 rounded-xl border border-teal-100 shadow-sm animate-in slide-in-from-top-2">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1">Event Name</label>
                                            <input 
                                                required
                                                type="text" 
                                                placeholder="e.g. Independence Day"
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                                value={newFestivalForm.name}
                                                onChange={e => setNewFestivalForm({...newFestivalForm, name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1">Date</label>
                                            <input 
                                                required
                                                type="date" 
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                                value={newFestivalForm.date}
                                                onChange={e => setNewFestivalForm({...newFestivalForm, date: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Description (Optional)</label>
                                        <input 
                                            type="text" 
                                            placeholder="Short description..."
                                            className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                            value={newFestivalForm.description}
                                            onChange={e => setNewFestivalForm({...newFestivalForm, description: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm">
                                            Add to Calendar
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Festival List */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Upcoming Festivals</h3>
                            {festivals.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">No festivals found. Add one above!</div>
                            ) : (
                                festivals.map((fest) => {
                                    const dateObj = new Date(fest.date);
                                    const isPast = dateObj < new Date(new Date().setHours(0,0,0,0));
                                    return (
                                        <div key={fest.id} className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-teal-200 transition-all ${isPast ? 'opacity-60' : ''}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border ${isPast ? 'bg-gray-50 border-gray-200 text-gray-400' : 'bg-orange-50 border-orange-100 text-orange-600'}`}>
                                                    <span className="text-[10px] font-bold uppercase">{dateObj.toLocaleString('default', { month: 'short' })}</span>
                                                    <span className="text-lg font-bold leading-none">{dateObj.getDate()}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors">{fest.name}</h4>
                                                    <p className="text-xs text-gray-500">{fest.description || 'Public Holiday'}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => openCampaignWizard(fest.name, fest.date)}
                                                className="bg-white border border-gray-200 hover:bg-teal-50 hover:border-teal-200 text-gray-600 hover:text-teal-700 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2"
                                            >
                                                <Sparkles className="w-3.5 h-3.5" />
                                                Plan Campaign
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- CAMPAIGN WIZARD (Updated with AI Rewrite + Language Toggle) --- */}
        {campaignWizardOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                    <div className="bg-gray-900 p-6 text-white flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Sparkles className="text-amber-400" />
                                {selectedFestival} Campaign
                            </h2>
                            <p className="text-gray-400 text-xs mt-1">Step {wizardStep} of 3</p>
                        </div>
                        <button onClick={() => setCampaignWizardOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6">
                        {wizardStep === 1 && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                <label className="block text-sm font-bold text-gray-700">Select Audience</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setCampaignData({...campaignData, audience: 'ALL'})}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${campaignData.audience === 'ALL' ? 'border-primary bg-teal-50' : 'border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <Users className={`w-6 h-6 mb-2 ${campaignData.audience === 'ALL' ? 'text-primary' : 'text-gray-400'}`} />
                                        <div className="font-bold text-sm">All Constituents</div>
                                        <div className="text-xs text-gray-500 mt-1">{constituents.length} Recipents</div>
                                    </button>
                                    <button 
                                        onClick={() => setCampaignData({...campaignData, audience: 'GROUP'})}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${campaignData.audience === 'GROUP' ? 'border-primary bg-teal-50' : 'border-gray-100 hover:border-gray-200'}`}
                                    >
                                        <LayoutTemplate className={`w-6 h-6 mb-2 ${campaignData.audience === 'GROUP' ? 'text-primary' : 'text-gray-400'}`} />
                                        <div className="font-bold text-sm">Specific Wards</div>
                                        <div className="text-xs text-gray-500 mt-1">Select Manually</div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {wizardStep === 2 && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                
                                <div className="flex justify-between items-end">
                                    <label className="block text-sm font-bold text-gray-700">Message Draft</label>
                                    {/* Language Selector */}
                                    <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                                        <button 
                                            onClick={() => setCampaignData({...campaignData, language: 'ODIA'})} 
                                            className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${campaignData.language === 'ODIA' ? 'bg-white shadow text-teal-800' : 'text-gray-500 hover:text-gray-900'}`}
                                        >
                                            Odia
                                        </button>
                                        <button 
                                            onClick={() => setCampaignData({...campaignData, language: 'ENGLISH'})}
                                            className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${campaignData.language === 'ENGLISH' ? 'bg-white shadow text-teal-800' : 'text-gray-500 hover:text-gray-900'}`}
                                        >
                                            English
                                        </button>
                                        <button 
                                            onClick={() => setCampaignData({...campaignData, language: 'HINDI'})}
                                            className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${campaignData.language === 'HINDI' ? 'bg-white shadow text-teal-800' : 'text-gray-500 hover:text-gray-900'}`}
                                        >
                                            Hindi
                                        </button>
                                    </div>
                                </div>
                                
                                <textarea 
                                    className="w-full h-32 p-4 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                                    value={campaignData.message}
                                    onChange={(e) => setCampaignData({...campaignData, message: e.target.value})}
                                />

                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-gray-400">Review the message before sending.</p>
                                    <button 
                                        onClick={handleAiRewrite}
                                        disabled={isGeneratingAi}
                                        className="text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 disabled:opacity-50 border border-purple-100"
                                    >
                                        {isGeneratingAi ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                        Rewrite with AI ({campaignData.language})
                                    </button>
                                </div>

                                {/* AI Variations List */}
                                {aiVariations.length > 0 && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Suggestions (Click to Apply)</p>
                                        <div className="flex flex-col gap-2">
                                            {aiVariations.map((v, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCampaignData({...campaignData, message: v})}
                                                    className="text-left text-xs bg-purple-50 hover:bg-purple-100 text-gray-700 p-3 rounded-lg border border-purple-100 hover:border-purple-200 transition-all active:scale-[0.99]"
                                                >
                                                    "{v}"
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {wizardStep === 3 && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                <label className="block text-sm font-bold text-gray-700">Schedule Delivery</label>
                                <div className="space-y-3">
                                    <button 
                                        onClick={() => setCampaignData({...campaignData, scheduleType: 'NOW'})}
                                        className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all ${campaignData.scheduleType === 'NOW' ? 'border-primary bg-teal-50 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <Send className={`w-5 h-5 ${campaignData.scheduleType === 'NOW' ? 'text-primary' : 'text-gray-400'}`} />
                                        <div className="text-left">
                                            <div className="font-bold text-sm text-gray-900">Send Immediately</div>
                                            <div className="text-xs text-gray-500">Will start processing now</div>
                                        </div>
                                    </button>

                                    <button 
                                        onClick={() => setCampaignData({...campaignData, scheduleType: 'LATER'})}
                                        className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all ${campaignData.scheduleType === 'LATER' ? 'border-primary bg-teal-50 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        <Clock className={`w-5 h-5 ${campaignData.scheduleType === 'LATER' ? 'text-primary' : 'text-gray-400'}`} />
                                        <div className="text-left">
                                            <div className="font-bold text-sm text-gray-900">Schedule for Later</div>
                                            <div className="text-xs text-gray-500">Pick a specific date & time</div>
                                        </div>
                                    </button>
                                </div>

                                {campaignData.scheduleType === 'LATER' && (
                                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Date</label>
                                            <input 
                                                type="date" 
                                                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                                value={campaignData.scheduleDate}
                                                onChange={(e) => setCampaignData({...campaignData, scheduleDate: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Time</label>
                                            <input 
                                                type="time" 
                                                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                                value={campaignData.scheduleTime}
                                                onChange={(e) => setCampaignData({...campaignData, scheduleTime: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-gray-50 flex justify-between items-center border-t border-gray-200">
                        {wizardStep > 1 ? (
                            <button 
                                onClick={() => setWizardStep(s => s - 1)}
                                className="px-4 py-2 rounded-lg text-gray-600 font-bold text-sm hover:bg-gray-200 transition"
                            >
                                Back
                            </button>
                        ) : ( <div></div> )}
                        
                        <button 
                            onClick={() => {
                                if (wizardStep < 3) setWizardStep(s => s + 1);
                                else finalizeCampaign();
                            }}
                            className="bg-primary hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg shadow-teal-900/20 transition-all active:scale-95 flex items-center gap-2"
                        >
                            {wizardStep === 3 ? (campaignData.scheduleType === 'NOW' ? 'Send Campaign' : 'Schedule Campaign') : 'Next Step'}
                            {wizardStep < 3 && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
