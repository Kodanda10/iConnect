/**
 * @file app/(dashboard)/scheduler/page.tsx
 * @description Scheduler page with calendar and task management
 * @changelog
 * - 2024-12-11: Initial implementation
 * - 2024-12-12: Redesigned to 3-column layout (Calendar, Daily List, Festivals)
 * - 2024-12-12: Added icons to inputs and used GlassCalendar for date picker
 */

'use client';

import React, { useState, useEffect } from 'react';
import { getConstituentsForDateMMDD } from '@/lib/services/constituents';
import { getUpcomingFestivals, addFestival, deleteFestival, DEFAULT_FESTIVALS } from '@/lib/services/festivals';
import { fetchConstituentMetrics, fetchGPMetricsForBlock } from '@/lib/services/metrics';
import { Constituent, Festival, Language } from '@/types';
import GlassCalendar from '@/components/ui/GlassCalendar';
import ValidatedDateInput from '@/components/ui/ValidatedDateInput';
import {
    Gift,
    Heart,
    Phone,
    Calendar,
    Sparkles,
    PartyPopper,
    MapPin,
    Plus,
    X,
    Users,
    Send,
    Loader2,
    Trash2,
    AlertTriangle,
    Building2,
    ChevronDown,
} from 'lucide-react';

// --- Types ---

interface EventItem {
    constituent: Constituent;
    type: 'birthday' | 'anniversary';
}

type WizardStep = 'select' | 'audience' | 'generate' | 'preview';

export default function SchedulerPage() {
    // --- State: Calendar & Selection ---
    const [selectedDate, setSelectedDate] = useState(new Date());

    // --- State: Daily List ---
    const [dailyEvents, setDailyEvents] = useState<EventItem[]>([]);
    const [loadingDaily, setLoadingDaily] = useState(false);

    // --- State: Festivals ---
    const [upcomingFestivals, setUpcomingFestivals] = useState<Festival[]>([]);
    const [loadingFestivals, setLoadingFestivals] = useState(true);

    // --- State: Modals ---
    const [showAddFestivalModal, setShowAddFestivalModal] = useState(false);
    const [showCampaignWizard, setShowCampaignWizard] = useState(false);
    const [deletingFestivalId, setDeletingFestivalId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- State: Campaign Wizard ---
    const [wizardStep, setWizardStep] = useState<WizardStep>('select');
    const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
    const [campaignAudience, setCampaignAudience] = useState<'ALL' | 'BLOCK' | 'GP'>('ALL');
    const [campaignLanguage, setCampaignLanguage] = useState<Language>('ODIA');
    const [generatedMessages, setGeneratedMessages] = useState<string[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<string>('');

    // --- State: Audience Targeting (Database-Connected) ---
    const [targetBlock, setTargetBlock] = useState('');
    const [targetGP, setTargetGP] = useState('');
    const [blocks, setBlocks] = useState<{ name: string; count: number }[]>([]);
    const [gps, setGps] = useState<{ name: string; count: number }[]>([]);
    const [loadingBlocks, setLoadingBlocks] = useState(false);
    const [loadingGPs, setLoadingGPs] = useState(false);
    const [newFestivalData, setNewFestivalData] = useState({ name: '', date: '', description: '' });

    // --- Calendar Helpers for Mock Events ---
    // Generate some mock event dates for the current month view
    const getMockEventDates = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        // Mock dates: 5th, 12th, 18th, 24th, 28th
        return [
            `${year}-${month}-05`,
            `${year}-${month}-12`,
            `${year}-${month}-18`,
            `${year}-${month}-24`,
            `${year}-${month}-28`
        ];
    };

    const formatMMDD = (date: Date): string => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}-${day}`;
    };



    // --- Effects ---

    // Load Daily Events
    useEffect(() => {
        const fetchDailyEvents = async () => {
            setLoadingDaily(true);
            try {
                const mmdd = formatMMDD(selectedDate);
                const [birthdays, anniversaries] = await Promise.all([
                    getConstituentsForDateMMDD(mmdd, 'birthday'),
                    getConstituentsForDateMMDD(mmdd, 'anniversary'),
                ]);

                setDailyEvents([
                    ...birthdays.map(c => ({ constituent: c, type: 'birthday' as const })),
                    ...anniversaries.map(c => ({ constituent: c, type: 'anniversary' as const })),
                ]);
            } catch (error) {
                console.error('Failed to fetch daily events:', error);
            } finally {
                setLoadingDaily(false);
            }
        };
        fetchDailyEvents();
    }, [selectedDate]);

    // Load Festivals
    useEffect(() => {
        const fetchFestivals = async () => {
            try {
                const fetched = await getUpcomingFestivals();
                if (fetched.length === 0) {
                    const defaultUpcoming = DEFAULT_FESTIVALS
                        .filter(f => new Date(f.date) >= new Date())
                        .slice(0, 3)
                        .map((f, i) => ({ ...f, id: `def-${i}`, isCustom: false } as Festival));
                    setUpcomingFestivals(defaultUpcoming);
                } else {
                    setUpcomingFestivals(fetched.slice(0, 3));
                }
            } catch (error) {
                console.error('Failed to fetch festivals:', error);
            } finally {
                setLoadingFestivals(false);
            }
        };
        fetchFestivals();
    }, []);

    // Fetch blocks from database
    useEffect(() => {
        const fetchBlocks = async () => {
            setLoadingBlocks(true);
            try {
                const metrics = await fetchConstituentMetrics();
                setBlocks(metrics.blocks);
            } catch (err) {
                console.error('Failed to fetch blocks:', err);
            } finally {
                setLoadingBlocks(false);
            }
        };
        fetchBlocks();
    }, []);

    // Fetch GPs when block changes
    useEffect(() => {
        if (campaignAudience === 'GP' && targetBlock) {
            const fetchGPs = async () => {
                setLoadingGPs(true);
                try {
                    const gpData = await fetchGPMetricsForBlock(targetBlock);
                    setGps(gpData);
                } catch (err) {
                    console.error('Failed to fetch GPs:', err);
                } finally {
                    setLoadingGPs(false);
                }
            };
            fetchGPs();
        }
    }, [campaignAudience, targetBlock]);

    // --- Handlers ---

    const handleAddFestival = async () => {
        if (newFestivalData.name && newFestivalData.date) {
            try {
                await addFestival(newFestivalData);
                const fetched = await getUpcomingFestivals();
                setUpcomingFestivals(fetched.slice(0, 3));
                setShowAddFestivalModal(false);
                setNewFestivalData({ name: '', date: '', description: '' });
            } catch (e) {
                console.error("Add festival failed", e);
            }
        }
    };

    const confirmDelete = async () => {
        if (!deletingFestivalId) return;
        setIsDeleting(true);
        try {
            await deleteFestival(deletingFestivalId);
            const fetched = await getUpcomingFestivals();
            setUpcomingFestivals(fetched.slice(0, 3));
            setDeletingFestivalId(null);
        } catch (error) {
            console.error("Delete failed", error);
        } finally {
            setIsDeleting(false);
        }
    };



    const startCampaignWizard = () => {
        if (upcomingFestivals.length > 0) {
            setSelectedFestival(upcomingFestivals[0]);
        }
        setWizardStep('select');
        setShowCampaignWizard(true);
        setGeneratedMessages([]);
        setSelectedMessage('');
    };

    const generateMessages = async () => {
        setWizardStep('generate');
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const sampleMessages = {
            ODIA: [
                `${selectedFestival?.name} ର ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା! ଏହି ପବିତ୍ର ଅବସରରେ ଆପଣ ଓ ଆପଣଙ୍କ ପରିବାର ସୁଖୀ ଓ ସମୃଦ୍ଧ ହୁଅନ୍ତୁ।`,
                `${selectedFestival?.name} ର ଅଶେଷ ଶୁଭକାମନା! ମହାପ୍ରଭୁ ଜଗନ୍ନାଥ ଆପଣଙ୍କୁ ସଦା ସର୍ବଦା ଆଶୀର୍ବାଦ କରନ୍ତୁ।`,
                `${selectedFestival?.name} ଉପଲକ୍ଷେ ଆନ୍ତରିକ ଅଭିନନ୍ଦନ! ଆପଣଙ୍କର ଜୀବନ ଖୁସି ଓ ସଫଳତାରେ ପରିପୂର୍ଣ୍ଣ ହେଉ।`,
            ],
            HINDI: [
                `${selectedFestival?.name} की हार्दिक शुभकामनाएँ! आप और आपके परिवार पर सदैव भगवान की कृपा बनी रहे।`,
                `${selectedFestival?.name} के पावन अवसर पर आपको ढेर सारी बधाई! आपका जीवन खुशियों से भरा रहे।`,
                `${selectedFestival?.name} की मंगलकामनाएँ! आपके घर में सुख-समृद्धि की वर्षा हो।`,
            ],
            ENGLISH: [
                `Warm wishes on ${selectedFestival?.name}! May this auspicious occasion bring joy and prosperity to you and your family.`,
                `Happy ${selectedFestival?.name}! Wishing you blessings, happiness, and success in all your endeavors.`,
                `Heartfelt greetings on ${selectedFestival?.name}! May you be surrounded by love and positivity.`,
            ],
        };

        setGeneratedMessages(sampleMessages[campaignLanguage]);
        setWizardStep('preview');
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <h1 className="text-2xl font-bold text-white">Scheduler</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* --- Column 1: Interactive Calendar --- */}
                <div className="h-fit">
                    <GlassCalendar
                        selectedDate={selectedDate}
                        onSelect={setSelectedDate}
                        eventDates={getMockEventDates(selectedDate)}
                    />

                    <div className="mt-4 flex items-center gap-4 text-xs text-white/40 justify-center">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span> Birthday</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> Anniversary</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Festival</span>
                    </div>
                </div>

                {/* --- Column 2: Daily List --- */}
                <div className="glass-card-light p-6 rounded-2xl h-[500px] flex flex-col">
                    <div className="mb-4">
                        <h3 className="font-bold text-white text-lg">
                            Events for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </h3>
                        <p className="text-white/40 text-xs mt-1">
                            {dailyEvents.length} events scheduled
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {loadingDaily ? (
                            <div className="flex flex-col items-center justify-center h-40 text-white/40">
                                <Loader2 className="w-6 h-6 animate-spin mb-2 text-emerald-400" />
                                <span className="text-xs">Loading...</span>
                            </div>
                        ) : dailyEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-white/30">
                                <Calendar className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm font-medium">No events for today</p>
                                <p className="text-xs mt-1 opacity-60">Select another date from the calendar</p>
                            </div>
                        ) : (
                            dailyEvents.map((event, idx) => (
                                <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${event.type === 'birthday' ? 'bg-pink-500/20 text-pink-400' : 'bg-purple-500/20 text-purple-400'
                                            }`}>
                                            {event.type === 'birthday' ? <Gift className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-white text-sm truncate">{event.constituent.fullName}</h4>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${event.type === 'birthday' ? 'bg-pink-500/20 text-pink-300' : 'bg-purple-500/20 text-purple-300'
                                                    }`}>
                                                    {event.type === 'birthday' ? 'B-Day' : 'Anniv'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1 text-white/80 text-xs font-mono">
                                                <Phone className="w-3 h-3 text-emerald-400" />
                                                {event.constituent.phone || event.constituent.mobileNumber || 'No number'}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2 text-[10px] text-white/50">
                                                <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded">
                                                    <MapPin className="w-3 h-3" />
                                                    Ward {event.constituent.ward || event.constituent.wardNumber || 'N/A'}
                                                </span>
                                                {(event.constituent.block || event.constituent.gpUlb) && (
                                                    <span className="bg-white/5 px-1.5 py-0.5 rounded">
                                                        {event.constituent.block || event.constituent.gpUlb}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* --- Column 3: Festival Manager --- */}
                <div className="glass-card-light p-6 rounded-2xl h-fit">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-white text-lg">Festivals</h3>
                        <button onClick={() => setShowAddFestivalModal(true)} className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-3 mb-6">
                        {loadingFestivals ? (
                            <div className="text-center py-4 text-white/40"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></div>
                        ) : upcomingFestivals.length === 0 ? (
                            <div className="text-center py-4 text-white/40 text-sm">No upcoming festivals.</div>
                        ) : upcomingFestivals.map((festival, idx) => (
                            <div key={idx} className="group relative p-3 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/10 rounded-xl flex items-center gap-3 transition-all">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg">
                                    <PartyPopper className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-white text-sm truncate">{festival.name}</h4>
                                    <p className="text-xs text-white/60">
                                        {new Date(festival.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setDeletingFestivalId(festival.id); }}
                                    className="p-2 rounded-lg bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                                    title="Remove Festival"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={startCampaignWizard}
                        className="w-full py-3 rounded-xl gradient-primary text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Sparkles className="w-4 h-4" />
                        Festival Greetings
                    </button>

                    <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-[10px] text-white/40 leading-relaxed text-center">
                            Plan ahead! Use &apos;Festival Greetings&apos; to draft and schedule messages for upcoming events.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- Modals --- */}

            {/* Add Festival Modal */}
            {showAddFestivalModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in px-4">
                    <div className="glass-card-light p-6 rounded-2xl w-full max-w-sm mx-auto relative z-50">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-bold text-lg">Add New Festival</h3>
                            <button onClick={() => setShowAddFestivalModal(false)}><X className="w-5 h-5 text-white/60 hover:text-white" /></button>
                        </div>
                        <div className="space-y-4">
                            {/* Name Input */}
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 sm:group-hover:text-emerald-400 transition-colors">
                                    <PartyPopper className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Festival Name"
                                    className="w-full glass-input-dark pl-11 pr-4 py-3 rounded-xl text-white outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                                    value={newFestivalData.name}
                                    onChange={e => setNewFestivalData({ ...newFestivalData, name: e.target.value })}
                                />
                            </div>

                            {/* Date Picker Input - Using ValidatedDateInput for consistency */}
                            <ValidatedDateInput
                                label="Festival Date"
                                value={newFestivalData.date}
                                onChange={(val) => setNewFestivalData({ ...newFestivalData, date: val })}
                                allowFuture={true}
                            />

                            <button onClick={handleAddFestival} className="w-full btn-primary py-3 mt-4 text-sm font-bold shadow-lg shadow-emerald-500/20">
                                Add to Calendar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Campaign Wizard Modal */}
            {showCampaignWizard && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="glass-card-light p-6 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl gradient-secondary flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Campaign Wizard</h2>
                                    <p className="text-sm text-white/60">Generate greetings for {selectedFestival?.name || 'Festival'}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowCampaignWizard(false)}><X className="w-5 h-5 text-white/60 hover:text-white" /></button>
                        </div>

                        {/* Steps */}
                        <div className="flex gap-2 mb-8">
                            {['Select', 'Audience', 'Generate', 'Preview'].map((step, i) => (
                                <div key={step} className={`flex-1 h-1 rounded-full ${['select', 'audience', 'generate', 'preview'].indexOf(wizardStep) >= i ? 'bg-emerald-500' : 'bg-white/10'
                                    }`} />
                            ))}
                        </div>

                        {wizardStep === 'select' && (
                            <div className="space-y-4">
                                <h3 className="text-white font-bold">Select Festival</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {upcomingFestivals.map(f => (
                                        <button
                                            key={f.id}
                                            onClick={() => { setSelectedFestival(f); setWizardStep('audience'); }}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${selectedFestival?.id === f.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-emerald-500/50'}`}
                                        >
                                            <p className="text-white font-bold">{f.name}</p>
                                            <p className="text-xs text-white/50">{new Date(f.date).toLocaleDateString()}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {wizardStep === 'audience' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-bold text-emerald-400 mb-3 block flex items-center gap-1.5">
                                        <Users className="w-3 h-3" /> Target Audience
                                    </label>

                                    {/* 3-Button Layout */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => { setCampaignAudience('ALL'); setTargetBlock(''); setTargetGP(''); }}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${campaignAudience === 'ALL' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-white/20'}`}
                                        >
                                            <Users className={`w-5 h-5 ${campaignAudience === 'ALL' ? 'text-emerald-400' : 'text-white/40'}`} />
                                            <span className={`text-sm font-bold ${campaignAudience === 'ALL' ? 'text-emerald-300' : 'text-white/60'}`}>All</span>
                                            <span className="text-[10px] text-white/30">Full Assembly</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setCampaignAudience('BLOCK'); setTargetGP(''); }}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${campaignAudience === 'BLOCK' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-white/20'}`}
                                        >
                                            <MapPin className={`w-5 h-5 ${campaignAudience === 'BLOCK' ? 'text-emerald-400' : 'text-white/40'}`} />
                                            <span className={`text-sm font-bold ${campaignAudience === 'BLOCK' ? 'text-emerald-300' : 'text-white/60'}`}>Block</span>
                                            <span className="text-[10px] text-white/30">Specific Area</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCampaignAudience('GP')}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${campaignAudience === 'GP' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-white/20'}`}
                                        >
                                            <Building2 className={`w-5 h-5 ${campaignAudience === 'GP' ? 'text-emerald-400' : 'text-white/40'}`} />
                                            <span className={`text-sm font-bold ${campaignAudience === 'GP' ? 'text-emerald-300' : 'text-white/60'}`}>GP/ULB</span>
                                            <span className="text-[10px] text-white/30">Panchayat</span>
                                        </button>
                                    </div>

                                    {/* Conditional Dropdowns */}
                                    {campaignAudience !== 'ALL' && (
                                        <div className="grid grid-cols-2 gap-4 mt-4 animate-fade-in">
                                            {/* Block Dropdown */}
                                            <div className="space-y-1">
                                                <label className="text-xs text-white/40 pl-1">Select Block</label>
                                                <div className="relative">
                                                    <select
                                                        value={targetBlock}
                                                        onChange={(e) => { setTargetBlock(e.target.value); setTargetGP(''); }}
                                                        className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
                                                        disabled={loadingBlocks}
                                                    >
                                                        <option value="">-- Select Block --</option>
                                                        {blocks.map((b) => (
                                                            <option key={b.name} value={b.name}>{b.name} ({b.count})</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                                </div>
                                            </div>

                                            {/* GP Dropdown (only for GP mode) */}
                                            {campaignAudience === 'GP' && (
                                                <div className="space-y-1 animate-fade-in">
                                                    <label className="text-xs text-white/40 pl-1">Select GP/ULB</label>
                                                    <div className="relative">
                                                        <select
                                                            value={targetGP}
                                                            onChange={(e) => setTargetGP(e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
                                                            disabled={loadingGPs || !targetBlock}
                                                        >
                                                            <option value="">-- Select GP --</option>
                                                            {gps.map((g) => (
                                                                <option key={g.name} value={g.name}>{g.name} ({g.count})</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-white mb-3 block">Language</label>
                                    <div className="flex gap-2">
                                        {(['ODIA', 'HINDI', 'ENGLISH'] as Language[]).map(lang => (
                                            <button key={lang} onClick={() => setCampaignLanguage(lang)} className={`px-4 py-2 rounded-lg text-sm font-bold ${campaignLanguage === lang ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/60'}`}>
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={generateMessages} className="w-full btn-secondary py-3 flex justify-center gap-2"><Sparkles className="w-4 h-4" /> Generate Messages</button>
                            </div>
                        )}

                        {wizardStep === 'generate' && (
                            <div className="py-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-secondary flex items-center justify-center animate-pulse">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <p className="text-white font-bold">Crafting Messages...</p>
                            </div>
                        )}

                        {wizardStep === 'preview' && (
                            <div className="space-y-4">
                                <h3 className="text-white font-bold">Select Message</h3>
                                <div className="space-y-3">
                                    {generatedMessages.map((msg, i) => (
                                        <div key={i} onClick={() => setSelectedMessage(msg)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedMessage === msg ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10'}`}>
                                            <p className="text-sm text-white/90">{msg}</p>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => setShowCampaignWizard(false)} disabled={!selectedMessage} className="w-full btn-primary py-3 flex justify-center gap-2 disabled:opacity-50">
                                    <Send className="w-4 h-4" /> Schedule Campaign
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingFestivalId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in p-4">
                    <div className="glass-card-light p-6 rounded-2xl w-full max-w-sm mx-auto text-center border-red-500/20 shadow-2xl shadow-red-900/20">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Remove Festival?</h3>
                        <p className="text-white/60 text-sm mb-6">
                            Are you sure you want to remove the festival listing?
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setDeletingFestivalId(null)}
                                className="py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-semibold shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                            >
                                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Yes, Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
