/**
 * @file app/(dashboard)/meeting/page.tsx
 * @description Conference Call Broadcast with Single Card Layout
 * @changelog
 * - 2024-12-15: Complete "Liquid Glass" redesign & Dual-Mode implementation
 * - 2025-12-17: Removed mobile preview, single card layout, database-connected dropdowns
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
import { fetchConstituentMetrics, fetchGPMetricsForBlock } from '@/lib/services/metrics';
import {
    PhoneCall,
    Clock,
    AlertTriangle,
    Loader2,
    Sparkles,
    CheckCircle2,
    MessageSquare,
    Users,
    MapPin,
    Building2,
    ChevronDown,
} from 'lucide-react';
import ValidatedDateInput from '@/components/ui/ValidatedDateInput';
import { parseDateInput } from '@/lib/utils/dateValidation';

// Types for metrics
interface BlockMetric { name: string; count: number; }
interface GPMetric { name: string; count: number; }

export default function MeetingPage() {
    const { user } = useAuth();
    const [activeTicker, setActiveTicker] = useState<ActiveTicker | null>(null);
    const [loading, setLoading] = useState(true);

    // Form State
    const [title, setTitle] = useState('');

    // Date Management
    const [date, setDate] = useState<Date>(new Date());
    const [dateInput, setDateInput] = useState(new Date().toLocaleDateString('en-GB'));

    const [time, setTime] = useState('10:00');
    const [messageBody, setMessageBody] = useState('');
    const [isDrafting, setIsDrafting] = useState(false);

    // Conference Call Only
    const meetingType = 'CONFERENCE_CALL' as const;

    const [dialInNumber, setDialInNumber] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [provisioning, setProvisioning] = useState(false);

    // Audience Targeting
    const [targetAudience, setTargetAudience] = useState<'ALL' | 'BLOCK' | 'GP'>('ALL');
    const [targetBlock, setTargetBlock] = useState('');
    const [targetGP, setTargetGP] = useState('');

    // Database-connected dropdowns
    const [blocks, setBlocks] = useState<BlockMetric[]>([]);
    const [gps, setGps] = useState<GPMetric[]>([]);
    const [loadingBlocks, setLoadingBlocks] = useState(false);
    const [loadingGPs, setLoadingGPs] = useState(false);

    // Submission State
    const [creating, setCreating] = useState(false);
    const [ending, setEnding] = useState(false);

    // Subscribe to active ticker
    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToTicker(user.uid, (ticker) => {
            setActiveTicker(ticker);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

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
        if (targetAudience === 'GP' && targetBlock) {
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
    }, [targetAudience, targetBlock]);

    // Handle Gemini AI Drafting
    const handleGeminiDraft = () => {
        if (!title) {
            alert("Please enter a meeting title to generate a draft.");
            return;
        }
        setIsDrafting(true);
        setMessageBody('');

        const context = {
            title: title || 'Upcoming Meeting',
            time: time,
            date: date.toLocaleDateString('en-GB'),
        };

        const draft = `URGENT BROADCAST: ${context.title}

📅 Date: ${context.date}
⏰ Time: ${context.time}

Join Audio Bridge:
Dial: ...
Code: ...#

Kindly join on time.`;

        // Simulate streaming
        let idx = 0;
        const interval = setInterval(() => {
            if (idx < draft.length) {
                setMessageBody(draft.slice(0, idx + 1));
                idx++;
            } else {
                clearInterval(interval);
                setIsDrafting(false);
            }
        }, 20);
    };

    // Provision Conference Bridge
    const handleCreateBridge = async () => {
        setProvisioning(true);
        try {
            const bridge = await createConferenceBridge();
            setDialInNumber(bridge.dialInNumber);
            setAccessCode(bridge.accessCode);
        } catch (error) {
            console.error('Failed to provision bridge:', error);
            alert('Failed to provision conference bridge');
        } finally {
            setProvisioning(false);
        }
    };

    // Broadcast Meeting
    const handleCreate = async () => {
        if (!user || !title || !time) return;

        if (!dialInNumber || !accessCode) {
            alert('Please provision a Conference Bridge first');
            return;
        }

        setCreating(true);
        try {
            const dateTimeStr = `${date.toISOString().split('T')[0]}T${time}`;
            const startDateTime = new Date(dateTimeStr).toISOString();

            const payload: MeetingTickerData = {
                title,
                startTime: startDateTime,
                meetingType,
                leaderUid: user.uid,
                targetAudience,
                targetBlock: targetAudience !== 'ALL' ? targetBlock : undefined,
                targetGP: targetAudience === 'GP' ? targetGP : undefined,
            };

            payload.dialInNumber = dialInNumber;
            payload.accessCode = accessCode;

            await createMeetingTicker(payload);

            // Reset Form
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

    // End Meeting
    const handleEnd = async () => {
        if (!user) return;
        setEnding(true);
        try {
            await endMeetingTicker(user.uid);
        } catch (error) {
            console.error('Failed to end meeting:', error);
        } finally {
            setEnding(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>;

    return (
        <div className="space-y-8 animate-fade-in pb-20 max-w-3xl mx-auto p-6">

            {/* Header */}
            <div className="relative mb-8">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 relative z-10">
                    Conference Call
                </h1>
            </div>

            {/* Active Ticker Card */}
            {activeTicker && (
                <div className="glass-card mb-8 p-0 rounded-3xl overflow-hidden border border-emerald-500/30 shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]">
                    <div className="bg-emerald-500/20 px-6 py-3 border-b border-emerald-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-300 font-bold tracking-wider text-xs uppercase">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Live Broadcast Active
                        </div>
                    </div>
                    <div className="p-6 flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl shrink-0 bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/30">
                            <PhoneCall className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1 space-y-3">
                            <h2 className="text-xl font-bold text-white">{activeTicker.title}</h2>
                            <div className="flex flex-wrap gap-3 text-sm text-white/60">
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                                    <Clock className="w-4 h-4 text-emerald-400" />
                                    <span>{new Date(activeTicker.startTime).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg font-mono text-purple-200">
                                    <PhoneCall className="w-4 h-4 text-purple-400" />
                                    Dial: {activeTicker.dialInNumber} • Code: {activeTicker.accessCode}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleEnd}
                            disabled={ending}
                            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {ending ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                            End Broadcast
                        </button>
                    </div>
                </div>
            )}

            {/* Single Card Form */}
            <div className="glass-card-light p-8 rounded-3xl relative overflow-visible">
                <div className="relative z-10 space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-600/20 border border-purple-500/20 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-purple-300" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Schedule a Conference Call</h2>
                            <p className="text-white/40 text-sm">Configure and broadcast to constituents</p>
                        </div>
                    </div>

                    {/* Meeting Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70 pl-1">Meeting Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Rapid Response Team Sync"
                            className="w-full glass-input-dark px-4 py-3.5 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500/50 font-medium placeholder:text-white/20"
                        />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <ValidatedDateInput
                                label="Date"
                                value={dateInput}
                                onChange={(val) => {
                                    setDateInput(val);
                                    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                                        setDate(new Date(val));
                                        return;
                                    }
                                    const parsed = parseDateInput(val);
                                    if (parsed) setDate(new Date(parsed));
                                }}
                                allowFuture={true}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/70 pl-1">Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full glass-input-dark pl-10 pr-4 py-3.5 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Audience Targeting */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <label className="text-sm font-medium text-emerald-400 pl-1 flex items-center gap-1.5">
                            <Users className="w-3 h-3" /> Target Audience
                        </label>

                        {/* Audience Type Buttons (Card Style) */}
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => { setTargetAudience('ALL'); setTargetBlock(''); setTargetGP(''); }}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${targetAudience === 'ALL'
                                        ? 'border-emerald-500 bg-emerald-500/10'
                                        : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <Users className={`w-5 h-5 ${targetAudience === 'ALL' ? 'text-emerald-400' : 'text-white/40'}`} />
                                <span className={`text-sm font-bold ${targetAudience === 'ALL' ? 'text-emerald-300' : 'text-white/60'}`}>All</span>
                                <span className="text-[10px] text-white/30">Full Assembly</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setTargetAudience('BLOCK'); setTargetGP(''); }}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${targetAudience === 'BLOCK'
                                        ? 'border-emerald-500 bg-emerald-500/10'
                                        : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <MapPin className={`w-5 h-5 ${targetAudience === 'BLOCK' ? 'text-emerald-400' : 'text-white/40'}`} />
                                <span className={`text-sm font-bold ${targetAudience === 'BLOCK' ? 'text-emerald-300' : 'text-white/60'}`}>Block</span>
                                <span className="text-[10px] text-white/30">Specific Area</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setTargetAudience('GP')}
                                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${targetAudience === 'GP'
                                        ? 'border-emerald-500 bg-emerald-500/10'
                                        : 'border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <Building2 className={`w-5 h-5 ${targetAudience === 'GP' ? 'text-emerald-400' : 'text-white/40'}`} />
                                <span className={`text-sm font-bold ${targetAudience === 'GP' ? 'text-emerald-300' : 'text-white/60'}`}>GP/ULB</span>
                                <span className="text-[10px] text-white/30">Panchayat</span>
                            </button>
                        </div>

                        {/* Conditional Dropdowns */}
                        {targetAudience !== 'ALL' && (
                            <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                {/* Block Dropdown */}
                                <div className="space-y-1">
                                    <label className="text-xs text-white/40 pl-1">Select Block</label>
                                    <div className="relative">
                                        <select
                                            value={targetBlock}
                                            onChange={(e) => { setTargetBlock(e.target.value); setTargetGP(''); }}
                                            className="w-full glass-input-dark px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
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
                                {targetAudience === 'GP' && (
                                    <div className="space-y-1 animate-fade-in">
                                        <label className="text-xs text-white/40 pl-1">Select GP/ULB</label>
                                        <div className="relative">
                                            <select
                                                value={targetGP}
                                                onChange={(e) => setTargetGP(e.target.value)}
                                                className="w-full glass-input-dark px-4 py-3 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer"
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

                    {/* Audio Bridge */}
                    <div className="pt-4 border-t border-white/5">
                        <label className="text-sm font-medium text-purple-400 pl-1 flex items-center gap-1.5 mb-4">
                            <PhoneCall className="w-3 h-3" /> Audio Bridge
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

                    {/* Message Composer */}
                    <div className="pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-white/70 flex items-center gap-1.5">
                                <MessageSquare className="w-3 h-3" /> Compose Message
                            </label>
                            <button
                                onClick={handleGeminiDraft}
                                disabled={isDrafting}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-colors text-xs disabled:opacity-50"
                            >
                                {isDrafting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-purple-400" />}
                                <span className="font-semibold">Draft with Gemini</span>
                            </button>
                        </div>
                        <textarea
                            value={messageBody}
                            onChange={(e) => setMessageBody(e.target.value)}
                            className="w-full glass-input-dark p-4 rounded-xl text-white outline-none focus:ring-2 focus:ring-purple-500/50 font-mono text-sm leading-relaxed resize-none min-h-[120px]"
                            placeholder="Type manually or ask Gemini to draft..."
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleCreate}
                        disabled={creating || !title || !dialInNumber}
                        className="w-full mt-4 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/20"
                    >
                        {creating ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <CheckCircle2 className="w-5 h-5 text-white" />}
                        <span className="text-white">Broadcast Conference Call</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
