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
        },
    });

    // Local preview image
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Load settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedSettings = await getSettings();
                setSettings({
                    appName: savedSettings.appName || 'iConnect',
                    leaderName: savedSettings.leaderName || 'Political Leader',
                    headerImageUrl: savedSettings.headerImageUrl || '',
                    alertSettings: savedSettings.alertSettings || { headsUp: true, action: true },
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
                const imageUrl = await uploadHeaderImage(pendingImageFile);
                setSettings(prev => ({ ...prev, headerImageUrl: imageUrl }));
                setPendingImageFile(null);
            }

            // Save other settings
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
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        CMS
                    </h1>
                    <p className="text-white/60 mt-1">
                        Customize app appearance and notifications
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary flex items-center gap-2 ripple"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : saveSuccess ? (
                        <>
                            <CheckCircle className="w-4 h-4" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* App Customization */}
                <div className="glass-card-light p-6 rounded-2xl space-y-6">
                    <div className="flex items-center gap-2 text-white">
                        <Smartphone className="w-5 h-5 text-emerald-400" />
                        <h2 className="font-bold">Mobile App Visuals</h2>
                    </div>

                    {/* App Name */}
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
                                className="glass-input-dark pl-12"
                            />
                        </div>
                    </div>

                    {/* Leader Name */}
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
                                className="glass-input-dark pl-12"
                            />
                        </div>
                    </div>

                    {/* Header Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                            Header Background Image
                        </label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                            onDrop={handleDrop}
                            className={`
                border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
                transition-all duration-300 glow-hover
                ${isDragging
                                    ? 'border-emerald-400 bg-emerald-400/10 scale-[1.02]'
                                    : 'border-white/40 hover:border-emerald-400'
                                }
              `}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                                className="hidden"
                            />
                            {previewImage ? (
                                <div className="relative">
                                    <img
                                        src={previewImage}
                                        alt="Header preview"
                                        className="w-full h-32 object-cover rounded-xl"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                                        <span className="text-white font-medium">Click to replace</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-3 animate-float">
                                        <ImageIcon className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <p className="font-medium text-white">
                                        Drag & drop or click to upload
                                    </p>
                                    <p className="text-xs text-white/50 mt-1">
                                        Recommended: 1200 x 600px
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notifications & Preview */}
                <div className="space-y-6">
                    {/* Notification Settings */}
                    <div className="glass-card-light p-6 rounded-2xl">
                        <div className="flex items-center gap-2 text-white mb-6">
                            <Bell className="w-5 h-5 text-emerald-400" />
                            <h2 className="font-bold">Notification Settings</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                                <div>
                                    <p className="font-medium text-white">
                                        Heads Up Alerts
                                    </p>
                                    <p className="text-sm text-white/60">
                                        Show notification before task due
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        setSettings({
                                            ...settings,
                                            alertSettings: {
                                                ...settings.alertSettings,
                                                headsUp: !settings.alertSettings.headsUp,
                                            },
                                        })
                                    }
                                    className="transition-transform active:scale-90"
                                >
                                    {settings.alertSettings.headsUp ? (
                                        <ToggleRight className="w-10 h-10 text-emerald-400" />
                                    ) : (
                                        <ToggleLeft className="w-10 h-10 text-white/40" />
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                                <div>
                                    <p className="font-medium text-white">
                                        Action Reminders
                                    </p>
                                    <p className="text-sm text-white/60">
                                        Remind to mark tasks complete
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        setSettings({
                                            ...settings,
                                            alertSettings: {
                                                ...settings.alertSettings,
                                                action: !settings.alertSettings.action,
                                            },
                                        })
                                    }
                                    className="transition-transform active:scale-90"
                                >
                                    {settings.alertSettings.action ? (
                                        <ToggleRight className="w-10 h-10 text-emerald-400" />
                                    ) : (
                                        <ToggleLeft className="w-10 h-10 text-white/40" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Live Preview */}
                    <div className="glass-card-light p-6 rounded-2xl">
                        <h2 className="font-bold text-white mb-4 text-center">
                            Live Preview
                        </h2>
                        <div className="w-48 mx-auto bg-gray-900 rounded-[2rem] border-4 border-gray-800 overflow-hidden shadow-2xl">
                            {/* Mini phone mockup */}
                            <div className="relative h-24 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-dark)] p-3 overflow-hidden">
                                {previewImage && (
                                    <img
                                        src={previewImage}
                                        alt=""
                                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                                    />
                                )}
                                <div className="relative z-10">
                                    <p className="text-white font-bold text-sm truncate">
                                        {settings.appName}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                        <p className="text-white/80 text-[8px] truncate">
                                            {settings.leaderName}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="h-20 bg-gray-50 p-2">
                                <div className="h-4 w-24 bg-gray-200 rounded skeleton-light" />
                                <div className="h-3 w-16 bg-gray-200 rounded mt-1 skeleton-light" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
