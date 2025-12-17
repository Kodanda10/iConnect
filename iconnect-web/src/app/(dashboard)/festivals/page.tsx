/**
 * @file app/(dashboard)/festivals/page.tsx
 * @description Festival manager and AI campaign wizard
 * @changelog
 * - 2024-12-11: Initial implementation with festival CRUD and campaign generator
 */

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import {
    Calendar,
    Plus,
    Sparkles,
    Send,
    Trash2,
    X,
    PartyPopper,
    Users,
    CheckCircle,
    Copy,
    RefreshCw,
} from 'lucide-react';
import { Festival, Language } from '@/types';
import { DEFAULT_FESTIVALS } from '@/lib/services/festivals';
import GlassCalendar from '@/components/ui/GlassCalendar';
import ValidatedDateInput from '@/components/ui/ValidatedDateInput';

type WizardStep = 'select' | 'audience' | 'generate' | 'preview';

export default function FestivalsPage() {
    const { isStaff } = useAuth();
    const [festivals, setFestivals] = useState<Festival[]>(
        DEFAULT_FESTIVALS.map((f, i) => ({ ...f, id: `default-${i}` }))
    );
    const [showAddModal, setShowAddModal] = useState(false);
    const [showWizard, setShowWizard] = useState(false);
    const [wizardStep, setWizardStep] = useState<WizardStep>('select');
    const [isGenerating, setIsGenerating] = useState(false);

    // New festival form
    const [newFestival, setNewFestival] = useState({
        name: '',
        date: '', // Stored as YYYY-MM-DD
        description: '',
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
    const dateInputRef = React.useRef<HTMLInputElement>(null);

    const formatDateForInput = (dateStr: string) => {
        if (!dateStr) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const [y, m, d] = dateStr.split('-');
            return `${m}/${d}/${y}`;
        }
        return dateStr;
    };

    const handleDateTextInput = (value: string) => {
        const cleaned = value.replace(/[^0-9/]/g, '');
        let formatted = cleaned;
        if (cleaned.length >= 2 && !cleaned.includes('/')) {
            formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        }
        if (cleaned.length >= 5 && cleaned.split('/').length === 2) {
            const parts = formatted.split('/');
            formatted = parts[0] + '/' + parts[1] + '/' + cleaned.slice(5);
        }
        if (formatted.length > 10) {
            formatted = formatted.slice(0, 10);
        }

        const mmddyyyyMatch = formatted.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (mmddyyyyMatch) {
            const [, m, d, y] = mmddyyyyMatch;
            const month = parseInt(m);
            const day = parseInt(d);
            const year = parseInt(y);

            const isValidMonth = month >= 1 && month <= 12;
            const isValidDay = day >= 1 && day <= 31;
            const isValidYear = year >= 1900 && year <= new Date().getFullYear() + 10;

            const testDate = new Date(year, month - 1, day);
            const isRealDate = testDate.getMonth() === month - 1 && testDate.getDate() === day;

            if (isValidMonth && isValidDay && isValidYear && isRealDate) {
                const dateStr = `${y}-${m}-${d}`;
                setNewFestival({ ...newFestival, date: dateStr });
                return;
            }
        }
        setNewFestival({ ...newFestival, date: formatted });
    };

    const handleDateSelect = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        setNewFestival({ ...newFestival, date: `${year}-${month}-${day}` });
        setShowDatePicker(false);
    };

    const openDatePicker = () => {
        if (dateInputRef.current) {
            const rect = dateInputRef.current.getBoundingClientRect();
            setCalendarPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX,
            });
            setShowDatePicker(true);
        }
    };

    // Campaign wizard state
    const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
    const [campaignAudience, setCampaignAudience] = useState<'ALL' | 'WARD'>('ALL');
    const [campaignLanguage, setCampaignLanguage] = useState<Language>('ODIA');
    const [generatedMessages, setGeneratedMessages] = useState<string[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<string>('');

    const handleAddFestival = () => {
        if (newFestival.name && newFestival.date) {
            const festival: Festival = {
                id: `custom-${Date.now()}`,
                name: newFestival.name,
                date: newFestival.date,
                description: newFestival.description,
                isCustom: true,
            };
            setFestivals([...festivals, festival].sort((a, b) => a.date.localeCompare(b.date)));
            setNewFestival({ name: '', date: '', description: '' });
            setShowAddModal(false);
        }
    };

    const handleDeleteFestival = (id: string) => {
        setFestivals(festivals.filter((f) => f.id !== id));
    };

    const startCampaignWizard = (festival: Festival) => {
        setSelectedFestival(festival);
        setWizardStep('select');
        setShowWizard(true);
        setGeneratedMessages([]);
        setSelectedMessage('');
    };

    const generateMessages = async () => {
        setIsGenerating(true);
        setWizardStep('generate');

        // Simulated AI generation - in production would call Cloud Function
        await new Promise((resolve) => setTimeout(resolve, 2000));

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
        setIsGenerating(false);
        setWizardStep('preview');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    if (!isStaff) {
        return (
            <div className="flex items-center justify-center h-64 text-[var(--color-text-secondary)]">
                Staff access required.
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        Festivals & Campaigns
                    </h1>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                        Manage festivals and create AI-powered campaign messages
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary flex items-center gap-2 ripple"
                >
                    <Plus className="w-4 h-4" />
                    Add Festival
                </button>
            </div>

            {/* Festival Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {festivals.map((festival, index) => (
                    <div
                        key={festival.id}
                        className="glass-card-light p-5 rounded-2xl animate-slide-up glow-hover"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                                    <PartyPopper className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[var(--color-text-primary)]">
                                        {festival.name}
                                    </h3>
                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                        {new Date(festival.date).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                            {festival.isCustom && (
                                <button
                                    onClick={() => handleDeleteFestival(festival.id)}
                                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {festival.description && (
                            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                                {festival.description}
                            </p>
                        )}

                        <button
                            onClick={() => startCampaignWizard(festival)}
                            className="w-full py-2.5 rounded-xl bg-black/5 hover:bg-[var(--color-primary)] hover:text-white text-[var(--color-text-secondary)] text-sm font-bold flex items-center justify-center gap-2 transition-all"
                        >
                            <Sparkles className="w-4 h-4" />
                            Create Campaign
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Festival Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="glass-card-light p-6 rounded-2xl w-full max-w-md mx-4 animate-spring-bounce">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                                Add Custom Festival
                            </h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 rounded-lg hover:bg-black/5"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                    Festival Name *
                                </label>
                                <input
                                    type="text"
                                    value={newFestival.name}
                                    onChange={(e) => setNewFestival({ ...newFestival, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    placeholder="e.g., Local Event"
                                />
                            </div>

                            <div>
                                <ValidatedDateInput
                                    label="Date *"
                                    value={newFestival.date}
                                    onChange={(val) => setNewFestival({ ...newFestival, date: val })}
                                    allowFuture={true}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newFestival.description}
                                    onChange={(e) => setNewFestival({ ...newFestival, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                                    placeholder="Brief description"
                                />
                            </div>

                            <button
                                onClick={handleAddFestival}
                                disabled={!newFestival.name || !newFestival.date}
                                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" />
                                Add Festival
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Campaign Wizard Modal */}
            {showWizard && selectedFestival && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="glass-card-light p-6 rounded-2xl w-full max-w-2xl animate-spring-bounce max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl gradient-secondary flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                                        Campaign Wizard
                                    </h2>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        {selectedFestival.name}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowWizard(false)}
                                className="p-2 rounded-lg hover:bg-black/5"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center gap-2 mb-8">
                            {['Audience', 'Generate', 'Preview'].map((step, i) => (
                                <div key={step} className="flex items-center gap-2 flex-1">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i <= ['select', 'audience', 'generate', 'preview'].indexOf(wizardStep) - 1
                                            ? 'gradient-primary text-white'
                                            : 'bg-black/10 text-[var(--color-text-secondary)]'
                                            }`}
                                    >
                                        {i + 1}
                                    </div>
                                    <span className="text-xs text-[var(--color-text-secondary)] hidden sm:block">
                                        {step}
                                    </span>
                                    {i < 2 && (
                                        <div className="flex-1 h-0.5 bg-black/10 rounded" />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Step 1: Audience Selection */}
                        {(wizardStep === 'select' || wizardStep === 'audience') && (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-3">
                                        Target Audience
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setCampaignAudience('ALL')}
                                            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${campaignAudience === 'ALL'
                                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                                                : 'border-black/10 hover:border-[var(--color-primary)]'
                                                }`}
                                        >
                                            <Users className="w-5 h-5 text-[var(--color-primary)]" />
                                            <div className="text-left">
                                                <p className="font-bold text-[var(--color-text-primary)]">All Constituents</p>
                                                <p className="text-xs text-[var(--color-text-secondary)]">Send to everyone</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setCampaignAudience('WARD')}
                                            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${campaignAudience === 'WARD'
                                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                                                : 'border-black/10 hover:border-[var(--color-primary)]'
                                                }`}
                                        >
                                            <Calendar className="w-5 h-5 text-[var(--color-secondary)]" />
                                            <div className="text-left">
                                                <p className="font-bold text-[var(--color-text-primary)]">By Ward</p>
                                                <p className="text-xs text-[var(--color-text-secondary)]">Select specific wards</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-3">
                                        Language
                                    </label>
                                    <div className="flex gap-2">
                                        {(['ODIA', 'HINDI', 'ENGLISH'] as Language[]).map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => setCampaignLanguage(lang)}
                                                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${campaignLanguage === lang
                                                    ? 'gradient-primary text-white'
                                                    : 'bg-black/5 text-[var(--color-text-secondary)] hover:bg-black/10'
                                                    }`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={generateMessages}
                                    className="w-full btn-secondary py-4 flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Generate AI Messages
                                </button>
                            </div>
                        )}

                        {/* Step 2: Generating */}
                        {wizardStep === 'generate' && isGenerating && (
                            <div className="text-center py-12 animate-fade-in">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-secondary flex items-center justify-center animate-pulse">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <p className="font-bold text-[var(--color-text-primary)]">
                                    Generating AI Messages...
                                </p>
                                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                    Creating personalized {campaignLanguage.toLowerCase()} messages
                                </p>
                            </div>
                        )}

                        {/* Step 3: Preview & Select */}
                        {wizardStep === 'preview' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <p className="font-bold text-[var(--color-text-primary)]">
                                        Generated Messages
                                    </p>
                                    <button
                                        onClick={generateMessages}
                                        className="text-sm text-[var(--color-primary)] font-medium flex items-center gap-1 hover:underline"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                        Regenerate
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {generatedMessages.map((msg, i) => (
                                        <div
                                            key={i}
                                            onClick={() => setSelectedMessage(msg)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedMessage === msg
                                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                                                : 'border-black/10 hover:border-[var(--color-primary)]'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="text-sm text-[var(--color-text-primary)]">{msg}</p>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copyToClipboard(msg);
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-black/10"
                                                    title="Copy"
                                                >
                                                    <Copy className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                                </button>
                                            </div>
                                            {selectedMessage === msg && (
                                                <div className="flex items-center gap-1 mt-2 text-[var(--color-primary)]">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span className="text-xs font-bold">Selected</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => {
                                        setShowWizard(false);
                                        // In production: would schedule the campaign
                                    }}
                                    disabled={!selectedMessage}
                                    className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Send className="w-5 h-5" />
                                    Schedule Campaign
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
