/**
 * @file app/(dashboard)/meeting/page.tsx
 * @description Dual-Mode Meeting Gateway (Video & Audio) with Liquid Glass UI
 * @changelog
 * - 2024-12-15: Complete "Liquid Glass" redesign & Dual-Mode implementation
 * - 2024-12-15: Added GlassCalendar, Message Composer, and Lock Screen Preview
 * - 2024-12-15: QC Fixes - Manual Date Input & Title Case Labels
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import {
    createMeetingTicker,
    endMeetingTicker,
    subscribeToTicker,
    createConferenceBridge,
    ActiveTicker,
    MeetingTickerData
} from '@/lib/services/meeting';
import {
    Video,
    PhoneCall,
    Clock,
    Link as LinkIcon,
    AlertTriangle,
    Loader2,
    Sparkles,
    CheckCircle2,
    MessageSquare,
    Calendar as CalendarIcon,
    Smartphone,
    Database,
    ImageIcon,
    ChevronDown
} from 'lucide-react';
import GlassCalendar from '@/components/ui/GlassCalendar';

export default function MeetingPage() {
    const { user } = useAuth();
    const [activeTicker, setActiveTicker] = useState<ActiveTicker | null>(null);
    const [loading, setLoading] = useState(true);

    // Form State
    const [title, setTitle] = useState('');

    // Date Management
    const [date, setDate] = useState<Date>(new Date());
    const [dateInput, setDateInput] = useState(new Date().toLocaleDateString('en-GB')); // DD/MM/YYYY format default

    const [time, setTime] = useState('10:00');
    const [messageBody, setMessageBody] = useState(''); // CMS Draft State
    const [isDrafting, setIsDrafting] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);

    // Conference Call Only (Video Meet removed)
    const meetingType = 'CONFERENCE_CALL' as const;

    // Conference Specific
    const [dialInNumber, setDialInNumber] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [provisioning, setProvisioning] = useState(false);

    // Submission State
    const [creating, setCreating] = useState(false);
    const [ending, setEnding] = useState(false);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToTicker(user.uid, (ticker) => {
            setActiveTicker(ticker);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    // Sync Calendar selection to Input
    const handleCalendarSelect = (newDate: Date) => {
        setDate(newDate);
        setDateInput(newDate.toLocaleDateString('en-GB')); // Sync text input
        setShowCalendar(false);
    };

    // Handle Manual Date Input (DD/MM/YYYY)
    const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setDateInput(val);

        // Simple validation for DD/MM/YYYY
        const parts = val.split('/');
        if (parts.length === 3) {
            const d = parseInt(parts[0]);
            const m = parseInt(parts[1]) - 1; // Months are 0-indexed
            const y = parseInt(parts[2]);

            const parsedDate = new Date(y, m, d);
            if (!isNaN(parsedDate.getTime()) && parsedDate.getDate() === d) {
                setDate(parsedDate);
            }
        }
    };

    // Handle Gemini AI Drafting Simulation
    const handleGeminiDraft = () => {
        if (!title) {
            alert("Please enter a meeting title to generate a draft.");
            return;
        }
        setIsDrafting(true);
        setMessageBody('');

        // Simulating Gemini API Context
        const context = {
            title: title || 'Upcoming Meeting',
            time: time,
            date: date.toLocaleDateString('en-GB'),
            type: 'Conference Call'
        };

        const draft = `URGENT BROADCAST: ${context.title}

📅 Date: ${context.date}
⏰ Time: ${context.time}
📡 Format: ${context.type}

Please prioritize attendance. Use the provided secure dial-in credentials.
        
Action Required: Review attached materials 15m prior to start.`;

        let i = 0;
        const interval = setInterval(() => {
            setMessageBody(draft.slice(0, i + 1));
            i++;
            if (i > draft.length) {
                clearInterval(interval);
                setIsDrafting(false);
            }
        }, 20); // Typing speed
    };

    // Update Message Preview dynamically when inputs change (if user hasn't manually edited it much)
    useEffect(() => {
        const dateStr = date.toLocaleDateString('en-GB');
        const body = `URGENT: ${title || "Meeting"} scheduled for ${dateStr} at ${time}.\n\nJoin Audio Bridge:\nDial: ${dialInNumber || "..."}\nCode: ${accessCode || "..."}#`;

        // Only update if the user hasn't completely rewritten it
        if (!messageBody || messageBody.startsWith('URGENT:')) {
            setMessageBody(body);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, date, time, dialInNumber, accessCode]);

    // Provision a Conference Bridge
    const handleCreateBridge = async () => {
        setProvisioning(true);
        try {
            const bridge = await createConferenceBridge();
            setDialInNumber(bridge.dialInNumber);
            setAccessCode(bridge.accessCode);
        } catch (error) {
            console.error(error);
            alert('Failed to provision conference bridge');
        } finally {
            setProvisioning(false);
        }
    };

    // Broadcast Meeting
    const handleCreate = async () => {
        if (!user || !title || !time) return;

        // Validation
        if (!dialInNumber || !accessCode) {
            alert('Please provision a Conference Bridge first');
            return;
        }

        setCreating(true);
        try {
            // Combine Date and Time
            const dateTimeStr = `${date.toISOString().split('T')[0]}T${time}`;
            const startDateTime = new Date(dateTimeStr).toISOString();

            const payload: MeetingTickerData = {
                title,
                startTime: startDateTime,
                meetingType,
                leaderUid: user.uid
            };

            payload.dialInNumber = dialInNumber;
            payload.accessCode = accessCode;

            await createMeetingTicker(payload);

            // Reset Form (keep date/time for convenience)
            setTitle('');
            setDialInNumber('');
            setAccessCode('');
            setMessageBody('');
        } catch (error) {
            console.error(error);
            alert('Failed to broadcast meeting');
        } finally {
            setCreating(false);
        }
    };

    const handleEnd = async () => {
        if (!user) return;
        if (!confirm('End current meeting ticker?')) return;
        setEnding(true);
        try {
            await endMeetingTicker(user.uid);
        } catch (error) {
            console.error(error);
            alert('Failed to end meeting');
        } finally {
            setEnding(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>;

    return (
        <div className="space-y-8 animate-fade-in pb-20 max-w-[1600px] mx-auto p-6">

            {/* Header with Glassmorphism */}
            <div className="relative mb-12">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 relative z-10">
                    Meetings
                </h1>
            </div>

            {/* Active Ticker Card (Conditional) */}
            {activeTicker && (
                <div className="glass-card mb-12 p-0 rounded-3xl overflow-hidden border border-emerald-500/30 shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]">
                    <div className="bg-emerald-500/20 px-8 py-3 border-b border-emerald-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-300 font-bold tracking-wider text-xs uppercase">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Live Broadcast Active
                        </div>
                        <span className="text-white/40 text-xs font-mono">ID: {user?.uid.slice(0, 8)}...</span>
                    </div>

                    <div className="p-8 flex flex-col md:flex-row gap-8 items-start">
                        {/* Icon Visual */}
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl shrink-0 ${activeTicker.meetingType === 'CONFERENCE_CALL'
                            ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/30'
                            : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30'
                            }`}>
                            {activeTicker.meetingType === 'CONFERENCE_CALL'
                                ? <PhoneCall className="w-10 h-10 text-white" />
                                : <Video className="w-10 h-10 text-white" />}
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">{activeTicker.title}</h2>
                                <div className="flex flex-wrap gap-4 text-sm text-white/60">
                                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                        <Clock className="w-4 h-4 text-emerald-400" />
                                        <span>
                                            {(activeTicker.startTime && typeof (activeTicker.startTime as unknown as { toDate?: () => Date }).toDate === 'function')
                                                ? (activeTicker.startTime as unknown as { toDate: () => Date }).toDate().toLocaleString()
                                                : new Date(activeTicker.startTime).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                        {activeTicker.meetingType === 'CONFERENCE_CALL' ? (
                                            <>
                                                <PhoneCall className="w-4 h-4 text-purple-400" />
                                                <span className="font-mono text-purple-200">
                                                    Dial: {activeTicker.dialInNumber} • Code: {activeTicker.accessCode}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Video className="w-4 h-4 text-blue-400" />
                                                <a href={activeTicker.meetUrl} target="_blank" className="hover:text-blue-300 underline underline-offset-4 decoration-blue-500/30 truncate max-w-[250px]">
                                                    {activeTicker.meetUrl}
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleEnd}
                            disabled={ending}
                            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {ending ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                            End Broadcast
                        </button>
                    </div>
                </div>
            )}

            {/* Creation Form (Always visible, allows drafting next meeting) */}
            <div className="grid lg:grid-cols-12 gap-8 items-stretch">
                {/* ... existing form content ... */}

                {/* Left Column: Configuration (Spans 7 cols) */}
                <div className="lg:col-span-7 glass-card-light p-8 rounded-3xl relative overflow-visible h-full flex flex-col">
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-yellow-300" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Broadcast New Meeting</h2>
                                <p className="text-white/40 text-sm">Select format and configure details</p>
                            </div>
                        </div>

                        {/* Conference Call Mode Indicator */}
                        <div className="flex items-center gap-2 mb-8 px-4 py-2.5 bg-purple-600/20 rounded-xl w-fit border border-purple-500/30">
                            <PhoneCall className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-bold text-purple-300">Conference Call Mode</span>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-6 flex-1">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70 pl-1">Meeting Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Rapid Response Team Sync"
                                    className="w-full glass-input-dark px-4 py-3.5 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50 font-medium placeholder:text-white/10"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 relative">
                                    <label className="text-sm font-medium text-white/70 pl-1">Date</label>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={dateInput}
                                            onChange={handleDateInputChange}
                                            placeholder="DD/MM/YYYY"
                                            className="w-full glass-input-dark pl-10 pr-10 py-3.5 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                        <button
                                            onClick={() => setShowCalendar(!showCalendar)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {showCalendar && (
                                        <div className="absolute top-full left-0 mt-2 z-50">
                                            <GlassCalendar
                                                selectedDate={date}
                                                onSelect={handleCalendarSelect}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/70 pl-1">Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="w-full glass-input-dark pl-10 pr-4 py-3.5 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <div className="space-y-4 animate-fade-in">
                                    <label className="text-sm font-medium text-purple-400 pl-1 flex items-center gap-1.5">
                                        <PhoneCall className="w-3 h-3" /> Audio Bridge Details
                                    </label>

                                    {!dialInNumber ? (
                                        <button
                                            onClick={handleCreateBridge}
                                            disabled={provisioning}
                                            className="w-full py-4 border-2 border-dashed border-purple-500/30 rounded-xl flex flex-col items-center justify-center gap-2 text-purple-300 hover:bg-purple-500/10 transition-colors group"
                                        >
                                            {provisioning ? (
                                                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                                            ) : (
                                                <>
                                                    <Sparkles className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform" />
                                                    <span className="font-semibold">Provision Conference Bridge</span>
                                                    <span className="text-xs text-white/30">Generates unique dial-in & code</span>
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <span className="text-xs text-white/30 ml-1">Dial-In Number</span>
                                                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-3 font-mono text-purple-200 truncate">
                                                    {dialInNumber}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs text-white/30 ml-1">Access Code</span>
                                                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-3 font-mono text-purple-200 tracking-wider">
                                                    {accessCode}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Message Composer (CMS) & Gemini Draft */}
                            <div className="pt-4 border-t border-white/5 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-2 pl-1">
                                    <label className="text-sm font-medium text-white/70 flex items-center gap-1.5">
                                        <MessageSquare className="w-3 h-3" /> Compose Message
                                    </label>
                                    <button
                                        onClick={handleGeminiDraft}
                                        disabled={isDrafting}
                                        className="text-xs flex items-center gap-1.5 text-purple-300 hover:text-white transition-colors bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg border border-purple-500/20"
                                    >
                                        {isDrafting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-purple-400" />}
                                        <span className="font-semibold">Draft with Gemini</span>
                                    </button>
                                </div>
                                <textarea
                                    value={messageBody}
                                    onChange={(e) => setMessageBody(e.target.value)}
                                    className="w-full glass-input-dark p-4 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono text-sm leading-relaxed resize-none flex-1 min-h-[150px]"
                                    placeholder="Type manually or ask Gemini to draft..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Preview & Action (Spans 5 cols) */}
                <div className="lg:col-span-5 glass-card-light p-6 rounded-2xl flex flex-col">
                    <h2 className="font-bold text-white mb-4 text-center">Live Mobile Preview</h2>

                    {/* Lock Screen Mockup */}
                    <div className="w-64 mx-auto bg-black rounded-[3rem] border-8 border-gray-900 overflow-hidden shadow-2xl relative flex-1 min-h-[500px]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-20"></div>
                        <div className="h-full relative bg-gray-900 w-full overflow-hidden flex flex-col">
                            {/* Wallpaper */}
                            <div className="absolute inset-0 z-0">
                                <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-black opacity-60"></div>
                                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
                            </div>

                            {/* Lock Screen Items */}
                            <div className="relative z-10 p-4 flex flex-col h-full">
                                <div className="mt-12 text-center text-white/90">
                                    <div className="text-5xl font-thin tracking-tight">09:41</div>
                                    <div className="text-sm font-medium mt-1">Tuesday, 12 December</div>
                                </div>

                                <div className="mt-8 space-y-3 flex-1 overflow-visible">
                                    {/* Meeting Notification */}
                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 animate-slide-up shadow-lg relative group transition-all duration-300">

                                        {/* Gemini Effect Overlay */}
                                        {isDrafting && (
                                            <div className="absolute inset-0 bg-purple-500/10 rounded-2xl animate-pulse z-0"></div>
                                        )}

                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-5 h-5 rounded-md gradient-primary flex items-center justify-center"><Database className="w-3 h-3 text-white" /></div>
                                                    <span className="text-[10px] font-bold text-white/80">iConnect</span>
                                                </div>
                                                <span className="text-[10px] text-white/60">now</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                                    Action Required ⚡️
                                                </h4>
                                                <p className="text-xs text-white/90 mt-0.5 leading-relaxed whitespace-pre-wrap">
                                                    {messageBody || "Generating preview..."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto flex justify-between px-4 pb-2">
                                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"><Smartphone className="w-5 h-5 text-white" /></div>
                                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"><ImageIcon className="w-5 h-5 text-white" /></div>
                                </div>
                                <div className="w-24 h-1 bg-white/50 rounded-full mx-auto mb-1"></div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleCreate}
                        disabled={creating || !title || !dialInNumber}
                        className="w-full mt-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-500/20"
                    >
                        {creating ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <CheckCircle2 className="w-5 h-5 text-white" />}
                        <span className="text-white">Broadcast Meeting</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
