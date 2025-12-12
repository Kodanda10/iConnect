/**
 * @file app/(dashboard)/settings/page.tsx
 * @description Settings page for app customization and visual management
 * @changelog
 * - 2024-12-11: Initial implementation with image upload and CMS controls
 * - 2024-12-11: Connected to Firebase for real persistence (TDD)
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getSettings, updateSettings, uploadHeaderImage } from '@/lib/services/settings';
import {
    Settings,
    Image as ImageIcon,
    Save,
    Bell,
    ToggleLeft,
    ToggleRight,
    Loader2,
    CheckCircle,
    Smartphone,
    AlertCircle,
    User,
    Database,
} from 'lucide-react';

export default function SettingsPage() {
    const { isStaff, user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

    // Settings state
    const [settings, setSettings] = useState({
        appName: 'iConnect',
        leaderName: 'Political Leader',
        headerImageUrl: '',
        alertSettings: {
            headsUp: true,
            action: true,
            // New Editable Fields
            headsUpMessage: "Tomorrow's Celebrations! 5 constituents have birthdays tomorrow. Tap to view the list and prepare.",
            includeNamesHeadsUp: false,
            actionMessage: "Action Required! Send wishes to 5 people celebrating today. Don't miss out!",
            includeNamesAction: false,
        },
    });

    // Local preview image
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Dynamic Preview Data State
    const [previewData, setPreviewData] = useState<{
        headsUpBirthdays: string[];
        headsUpAnniversaries: string[];
        actionBirthdays: string[];
        actionAnniversaries: string[];
    }>({
        headsUpBirthdays: [],
        headsUpAnniversaries: [],
        actionBirthdays: [],
        actionAnniversaries: [],
    });

    // Load settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedSettings = await getSettings();
                console.log('[DEBUG] Loaded settings:', savedSettings);
                setSettings({
                    appName: savedSettings.appName || 'iConnect',
                    leaderName: savedSettings.leaderName || 'Political Leader',
                    headerImageUrl: savedSettings.headerImageUrl || '',
                    alertSettings: {
                        headsUp: savedSettings.alertSettings?.headsUp ?? true,
                        action: savedSettings.alertSettings?.action ?? true,
                        headsUpMessage: savedSettings.alertSettings?.headsUpMessage || "Tomorrow's Celebrations! 5 constituents have birthdays tomorrow. Tap to view the list and prepare.",
                        includeNamesHeadsUp: savedSettings.alertSettings?.includeNamesHeadsUp || false,
                        actionMessage: savedSettings.alertSettings?.actionMessage || "Action Required! Send wishes to 5 people celebrating today. Don't miss out!",
                        includeNamesAction: savedSettings.alertSettings?.includeNamesAction || false,
                    },
                });
                if (savedSettings.headerImageUrl) {
                    setPreviewImage(savedSettings.headerImageUrl);
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadSettings();
    }, []);

    // Fetch dynamic data for Preview (Tomorrow and Today)
    useEffect(() => {
        const fetchPreviewData = async () => {
            try {
                const today = new Date();
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                // Import dynamically to avoid circular deps if any (though standard import is fine here, treating as service)
                const { getConstituentsForDate } = await import('@/lib/services/constituents');

                // Heads Up (Tomorrow)
                const tmrwBdays = await getConstituentsForDate(tomorrow.getMonth() + 1, tomorrow.getDate(), 'birthday');
                const tmrwAnns = await getConstituentsForDate(tomorrow.getMonth() + 1, tomorrow.getDate(), 'anniversary');

                // Action Reminder (Today)
                const todayBdays = await getConstituentsForDate(today.getMonth() + 1, today.getDate(), 'birthday');
                const todayAnns = await getConstituentsForDate(today.getMonth() + 1, today.getDate(), 'anniversary');

                setPreviewData({
                    headsUpBirthdays: tmrwBdays.map(c => c.name || 'Unknown'),
                    headsUpAnniversaries: tmrwAnns.map(c => c.name || 'Unknown'),
                    actionBirthdays: todayBdays.map(c => c.name || 'Unknown'),
                    actionAnniversaries: todayAnns.map(c => c.name || 'Unknown'),
                });
            } catch (error) {
                console.error("Failed to fetch preview data:", error);
            }
        };

        fetchPreviewData();
    }, []);

    // Handle image selection - store file for upload on save
    const handleImageFile = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            setPendingImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setPreviewImage(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files[0]) {
            handleImageFile(e.dataTransfer.files[0]);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Upload image if a new one was selected
            if (pendingImageFile) {
                console.log('[DEBUG] Uploading header image...');
                const imageUrl = await uploadHeaderImage(pendingImageFile);
                console.log('[DEBUG] Upload complete, URL:', imageUrl);
                setSettings(prev => ({ ...prev, headerImageUrl: imageUrl }));
                setPreviewImage(imageUrl); // Also update preview to the permanent URL
                setPendingImageFile(null);
            }

            // Save other settings
            console.log('[DEBUG] Saving settings:', {
                appName: settings.appName,
                leaderName: settings.leaderName,
                alertSettings: settings.alertSettings,
            });
            await updateSettings({
                appName: settings.appName,
                leaderName: settings.leaderName,
                alertSettings: settings.alertSettings,
            });

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isStaff) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-[var(--color-text-secondary)]">
                        Only staff members can access settings.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-[1600px] mx-auto w-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">CMS</h1>
                    <p className="text-white/60 mt-1">Customize app appearance and notifications</p>
                </div>
            </div>

            {/* Row 1: Visual Configuration (Merged) */}
            <div className="glass-card-light p-8 rounded-2xl">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2 text-white">
                        <Smartphone className="w-5 h-5 text-emerald-400" />
                        <h2 className="font-bold text-lg">Visual Configuration</h2>
                    </div>
                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-all flex items-center gap-1.5 disabled:opacity-50">
                        {isSaving ? (
                            <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</>
                        ) : saveSuccess ? (
                            <><CheckCircle className="w-3 h-3" /> Saved</>
                        ) : (
                            <><Save className="w-3 h-3" /> Save</>
                        )}
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-12 items-center">
                    {/* Col 1: Inputs */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                App Name
                            </label>
                            <div className="relative">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    value={settings.appName}
                                    onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                                    className="glass-input-dark pl-12 w-full"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Leader Display Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    value={settings.leaderName}
                                    onChange={(e) => setSettings({ ...settings, leaderName: e.target.value })}
                                    className="glass-input-dark pl-12 w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Col 2: Header Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            Header Image
                        </label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                            onDrop={handleDrop}
                            className={`
                                border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer h-[240px] flex flex-col items-center justify-center
                                transition-all duration-300 glow-hover w-full
                                ${isDragging ? 'border-emerald-400 bg-emerald-400/10 scale-[1.02]' : 'border-white/40 hover:border-emerald-400'}
                            `}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                                className="hidden"
                            />
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-3 animate-float">
                                <ImageIcon className="w-6 h-6 text-emerald-400" />
                            </div>
                            <p className="font-medium text-white">Drag & drop or click</p>
                            <p className="text-xs text-white/50 mt-1">Rec: 1200 x 600px</p>
                        </div>
                    </div>

                    {/* Col 3: Header Preview (Mobile) */}
                    <div className="flex flex-col items-center">
                        <label className="block text-sm font-medium text-white/70 mb-4 text-center">
                            Mobile Header Preview
                        </label>
                        {/* Mini Phone Mockup */}
                        <div className="w-48 bg-black rounded-[2rem] border-4 border-gray-900 overflow-hidden shadow-xl aspect-[9/16] relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-b-lg z-20"></div>
                            {/* Content */}
                            <div className="w-full h-full bg-gray-900 relative">
                                {/* Header Area */}
                                <div className="h-1/3 relative w-full overflow-hidden">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Header" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-black"></div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <h3 className="text-[10px] font-bold text-white">{settings.leaderName}</h3>
                                        <p className="text-[8px] text-emerald-400 max-w-full truncate">{settings.appName}</p>
                                    </div>
                                </div>
                                {/* Body Placeholder */}
                                <div className="p-3 space-y-2">
                                    <div className="h-2 w-3/4 bg-white/10 rounded"></div>
                                    <div className="h-2 w-1/2 bg-white/10 rounded"></div>
                                    <div className="h-20 w-full bg-white/5 rounded mt-4"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: Notifications */}
            <div className="grid lg:grid-cols-12 gap-8 items-stretch">

                {/* Notification Manager (Spans 7 cols) */}
                <div className="lg:col-span-7 glass-card-light p-6 rounded-2xl h-full flex flex-col">
                    <div className="flex items-center gap-2 text-white mb-6">
                        <Bell className="w-5 h-5 text-emerald-400" />
                        <h2 className="font-bold">Notification Manager</h2>
                    </div>

                    {/* Internal Grid for Heads Up / Action Side-by-Side */}
                    <div className="grid md:grid-cols-2 gap-6 flex-1">
                        {/* Heads Up Config */}
                        <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">8:00 PM</span>
                                        <p className="font-bold text-white text-sm">Heads Up Alert</p>
                                    </div>
                                    <p className="text-[10px] text-white/60 mt-1">Evening before event</p>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, alertSettings: { ...settings.alertSettings, headsUp: !settings.alertSettings.headsUp } })}
                                    className="scale-90"
                                >
                                    {settings.alertSettings.headsUp ? <ToggleRight className="w-10 h-10 text-emerald-400" /> : <ToggleLeft className="w-10 h-10 text-white/40" />}
                                </button>
                            </div>

                            {settings.alertSettings.headsUp && (
                                <div className="space-y-3 animate-slide-up flex-1 flex flex-col">
                                    <textarea
                                        value={settings.alertSettings.headsUpMessage}
                                        onChange={(e) => setSettings({ ...settings, alertSettings: { ...settings.alertSettings, headsUpMessage: e.target.value } })}
                                        className="w-full glass-input-dark h-64 text-xs leading-relaxed resize-none p-3 flex-1"
                                        placeholder="Enter notification message..."
                                    />
                                    <div className="flex items-center gap-2 cursor-pointer pt-2" onClick={() => setSettings({ ...settings, alertSettings: { ...settings.alertSettings, includeNamesHeadsUp: !settings.alertSettings.includeNamesHeadsUp } })}>
                                        <div className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${settings.alertSettings.includeNamesHeadsUp ? 'bg-emerald-500 border-emerald-500' : 'border-white/40'}`}>
                                            {settings.alertSettings.includeNamesHeadsUp && <CheckCircle className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className="text-xs text-white/80 select-none">Include names list</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Reminder Config */}
                        <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/5 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">8:00 AM</span>
                                        <p className="font-bold text-white text-sm">Action Reminder</p>
                                    </div>
                                    <p className="text-[10px] text-white/60 mt-1">Morning of event</p>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, alertSettings: { ...settings.alertSettings, action: !settings.alertSettings.action } })}
                                    className="scale-90"
                                >
                                    {settings.alertSettings.action ? <ToggleRight className="w-10 h-10 text-emerald-400" /> : <ToggleLeft className="w-10 h-10 text-white/40" />}
                                </button>
                            </div>

                            {settings.alertSettings.action && (
                                <div className="space-y-3 animate-slide-up flex-1 flex flex-col">
                                    <textarea
                                        value={settings.alertSettings.actionMessage}
                                        onChange={(e) => setSettings({ ...settings, alertSettings: { ...settings.alertSettings, actionMessage: e.target.value } })}
                                        className="w-full glass-input-dark h-64 text-xs leading-relaxed resize-none p-3 flex-1"
                                        placeholder="Enter notification message..."
                                    />
                                    <div className="flex items-center gap-2 cursor-pointer pt-2" onClick={() => setSettings({ ...settings, alertSettings: { ...settings.alertSettings, includeNamesAction: !settings.alertSettings.includeNamesAction } })}>
                                        <div className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${settings.alertSettings.includeNamesAction ? 'bg-emerald-500 border-emerald-500' : 'border-white/40'}`}>
                                            {settings.alertSettings.includeNamesAction && <CheckCircle className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className="text-xs text-white/80 select-none">Include names list</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notification Preview (Spans 5 cols) */}
                <div className="lg:col-span-5 glass-card-light p-6 rounded-2xl flex flex-col">
                    <h2 className="font-bold text-white mb-4 text-center">Notification Preview</h2>

                    <div className="w-64 mx-auto bg-black rounded-[3rem] border-8 border-gray-900 overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-20"></div>
                        <div className="h-[500px] relative bg-gray-900 w-full overflow-hidden flex flex-col">
                            {/* Wallpaper */}
                            <div className="absolute inset-0 z-0">
                                {previewImage ? <img src={previewImage} alt="Wallpaper" className="w-full h-full object-cover opacity-60" /> : <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-black opacity-60"></div>}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>
                            </div>

                            {/* Lock Screen Items */}
                            <div className="relative z-10 p-4 flex flex-col h-full">
                                <div className="mt-12 text-center text-white/90">
                                    <div className="text-5xl font-thin tracking-tight">09:41</div>
                                    <div className="text-sm font-medium mt-1">Tuesday, 12 December</div>
                                </div>

                                <div className="mt-8 space-y-3 flex-1 overflow-visible scrollbar-hide overflow-y-auto">
                                    {/* Heads Up Notification */}
                                    {settings.alertSettings.headsUp && (
                                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 animate-slide-up shadow-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-5 h-5 rounded-md gradient-primary flex items-center justify-center"><Database className="w-3 h-3 text-white" /></div>
                                                    <span className="text-[10px] font-bold text-white/80">{settings.appName}</span>
                                                </div>
                                                <span className="text-[10px] text-white/60">Yesterday, 8:00 PM</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white">Tomorrow's Celebrations 🎉</h4>
                                                <p className="text-xs text-white/90 mt-0.5 leading-relaxed">{settings.alertSettings.headsUpMessage}</p>
                                                {settings.alertSettings.includeNamesHeadsUp && (
                                                    <div className="mt-2 pt-2 border-t border-white/10 space-y-2">
                                                        {previewData.headsUpBirthdays.length > 0 && (
                                                            <div>
                                                                <p className="text-[10px] font-bold text-white/80 uppercase tracking-wider mb-0.5">Birthday:</p>
                                                                <ul className="text-[10px] text-white/90 space-y-0.5 pl-1.5 border-l-2 border-purple-400/50">
                                                                    {previewData.headsUpBirthdays.map((name, i) => <li key={i}>{name}</li>)}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {previewData.headsUpAnniversaries.length > 0 && (
                                                            <div>
                                                                <p className="text-[10px] font-bold text-white/80 uppercase tracking-wider mb-0.5">Anniversary:</p>
                                                                <ul className="text-[10px] text-white/90 space-y-0.5 pl-1.5 border-l-2 border-amber-400/50">
                                                                    {previewData.headsUpAnniversaries.map((name, i) => <li key={i}>{name}</li>)}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {previewData.headsUpBirthdays.length === 0 && previewData.headsUpAnniversaries.length === 0 && (
                                                            <p className="text-[10px] text-white/50 italic">No events found for tomorrow in DB.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Reminder Notification */}
                                    {settings.alertSettings.action && (
                                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 animate-slide-up shadow-lg delay-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-5 h-5 rounded-md gradient-primary flex items-center justify-center"><Database className="w-3 h-3 text-white" /></div>
                                                        <span className="text-[10px] font-bold text-white/80">{settings.appName}</span>
                                                    </div>
                                                    <span className="text-[10px] text-white/60">Today, 8:00 AM</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white">Action Required ⚡️</h4>
                                                <p className="text-xs text-white/90 mt-0.5 leading-relaxed">{settings.alertSettings.actionMessage}</p>
                                                {settings.alertSettings.includeNamesAction && (
                                                    <div className="mt-2 pt-2 border-t border-white/10 space-y-2">
                                                        {previewData.actionBirthdays.length > 0 && (
                                                            <div>
                                                                <p className="text-[10px] font-bold text-white/80 uppercase tracking-wider mb-0.5">Birthday:</p>
                                                                <ul className="text-[10px] text-white/90 space-y-0.5 pl-1.5 border-l-2 border-purple-400/50">
                                                                    {previewData.actionBirthdays.map((name, i) => <li key={i}>{name}</li>)}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {previewData.actionAnniversaries.length > 0 && (
                                                            <div>
                                                                <p className="text-[10px] font-bold text-white/80 uppercase tracking-wider mb-0.5">Anniversary:</p>
                                                                <ul className="text-[10px] text-white/90 space-y-0.5 pl-1.5 border-l-2 border-amber-400/50">
                                                                    {previewData.actionAnniversaries.map((name, i) => <li key={i}>{name}</li>)}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {previewData.actionBirthdays.length === 0 && previewData.actionAnniversaries.length === 0 && (
                                                            <p className="text-[10px] text-white/50 italic">No events found for today in DB.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {!settings.alertSettings.headsUp && !settings.alertSettings.action && (
                                        <div className="text-center mt-10">
                                            <p className="text-xs text-white/40 italic">Notifications Disabled</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-auto flex justify-between px-4 pb-2">
                                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"><Smartphone className="w-5 h-5 text-white" /></div>
                                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"><ImageIcon className="w-5 h-5 text-white" /></div>
                                </div>
                                <div className="w-24 h-1 bg-white/50 rounded-full mx-auto mb-1"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
