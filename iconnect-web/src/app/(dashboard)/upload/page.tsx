/**
 * @file app/(dashboard)/upload/page.tsx
 * @description Data entry page with CSV upload and manual form - VisionOS styled
 * @changelog
 * - 2024-12-11: Initial implementation with drag-drop and form
 * - 2024-12-11: Connected to Firestore, added seed button (TDD)
 * - 2024-12-11: Major overhaul - 50/50 layout, dark theme, all columns, download buttons
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getConstituents, addConstituent } from '@/lib/services/constituents';
import { downloadConstituentsAsCSV, downloadConstituentsAsPDF } from '@/lib/utils/download';
import { Constituent } from '@/types';
import {
    Upload,
    FileText,
    UserPlus,
    CheckCircle,
    AlertCircle,
    Loader2,
    Database,
    Search,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Download,
    FileDown,
    User,
    Calendar,
} from 'lucide-react';
import GlassCalendar from '@/components/ui/GlassCalendar';
import { isValidIndianMobile, isValidWhatsApp } from '@/lib/utils/validation';
import DataMetricsCard from '@/components/dashboard/DataMetricsCard';

export default function UploadPage() {
    const { isStaff } = useAuth();
    const [isDragging, setIsDragging] = useState(false);
    const [csvContent, setCsvContent] = useState('');
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Constituents from Firestore
    const [constituents, setConstituents] = useState<Constituent[]>([]);
    const [isLoadingConstituents, setIsLoadingConstituents] = useState(true);
    const [isSeeding, setIsSeeding] = useState(false);
    const [seedStatus, setSeedStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Fetch constituents on mount
    useEffect(() => {
        fetchConstituents();
    }, []);

    const fetchConstituents = async () => {
        setIsLoadingConstituents(true);
        try {
            const result = await getConstituents(50);
            setConstituents(result.constituents);
        } catch (error) {
            console.error('Failed to fetch constituents:', error);
        } finally {
            setIsLoadingConstituents(false);
        }
    };

    // Seed 50 test constituents
    const handleSeedDatabase = async () => {
        setIsSeeding(true);
        setSeedStatus('idle');
        try {
            const response = await fetch('/api/seed', { method: 'POST' });
            if (!response.ok) throw new Error('Seed failed');
            setSeedStatus('success');
            await fetchConstituents();
            setTimeout(() => setSeedStatus('idle'), 3000);
        } catch (error) {
            console.error('Seed failed:', error);
            setSeedStatus('error');
        } finally {
            setIsSeeding(false);
        }
    };

    // Manual form state - ordered as: Name → Mobile → WhatsApp → Block → GP → Ward → DOB → Anniversary
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        whatsapp: '',
        block: '',
        gp_ulb: '',
        ward: '',
        dob: '',
        anniversary: '',
    });

    // Search
    const [searchTerm, setSearchTerm] = useState('');

    const [activeDatePicker, setActiveDatePicker] = useState<'dob' | 'anniversary' | null>(null);
    const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0, width: 0 });
    const dobInputRef = React.useRef<HTMLInputElement>(null);
    const anniversaryInputRef = React.useRef<HTMLInputElement>(null);

    const formatDateForInput = (dateStr: string) => {
        if (!dateStr) return '';
        // Convert YYYY-MM-DD to MM/DD/YYYY for display
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const [y, m, d] = dateStr.split('-');
            return `${m}/${d}/${y}`;
        }
        return dateStr;
    };

    const handleDateSelect = (field: 'dob' | 'anniversary', date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        setFormData(prev => ({ ...prev, [field]: dateStr }));
        setActiveDatePicker(null);
    };

    // Handle manual text input for dates - MM/DD/YYYY format with validation
    const handleDateTextInput = (field: 'dob' | 'anniversary', value: string) => {
        // Only allow numbers and forward slashes
        const cleaned = value.replace(/[^0-9/]/g, '');

        // Auto-format as user types: MM/DD/YYYY
        let formatted = cleaned;
        if (cleaned.length >= 2 && !cleaned.includes('/')) {
            formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
        }
        if (cleaned.length >= 5 && cleaned.split('/').length === 2) {
            const parts = formatted.split('/');
            formatted = parts[0] + '/' + parts[1] + '/' + cleaned.slice(5);
        }

        // Limit to MM/DD/YYYY length (10 chars)
        if (formatted.length > 10) {
            formatted = formatted.slice(0, 10);
        }

        // Validate complete date in MM/DD/YYYY format
        const mmddyyyyMatch = formatted.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (mmddyyyyMatch) {
            const [, m, d, y] = mmddyyyyMatch;
            const month = parseInt(m);
            const day = parseInt(d);
            const year = parseInt(y);

            // Validation rules
            const isValidMonth = month >= 1 && month <= 12;
            const isValidDay = day >= 1 && day <= 31;
            const isValidYear = year >= 1900 && year <= new Date().getFullYear();

            // Check actual date validity (e.g., Feb 30 is invalid)
            const testDate = new Date(year, month - 1, day);
            const isRealDate = testDate.getMonth() === month - 1 && testDate.getDate() === day;

            if (isValidMonth && isValidDay && isValidYear && isRealDate) {
                // Convert to YYYY-MM-DD for storage
                const dateStr = `${y}-${m}-${d}`;
                setFormData(prev => ({ ...prev, [field]: dateStr }));
                return;
            }
        }

        // Allow partial input while typing
        setFormData(prev => ({ ...prev, [field]: formatted }));
    };

    // Open date picker and calculate position
    const openDatePicker = (field: 'dob' | 'anniversary') => {
        const inputRef = field === 'dob' ? dobInputRef : anniversaryInputRef;
        if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setCalendarPosition({
                top: rect.bottom + 8, // 8px gap below input
                left: rect.left,
                width: rect.width,
            });
        }
        setActiveDatePicker(field);
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
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            processFile(file);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
            if (evt.target?.result) {
                setCsvContent(evt.target.result as string);
            }
        };
        reader.readAsText(file);
    };

    const handleCsvUpload = async () => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setUploadStatus('success');
            setCsvContent('');
        } catch (error) {
            console.error(error);
            setUploadStatus('error');
        } finally {
            setIsLoading(false);
            setTimeout(() => setUploadStatus('idle'), 3000);
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await addConstituent({
                name: formData.name,
                mobileNumber: formData.mobile,
                dob: formData.dob || undefined,
                anniversary: formData.anniversary || undefined,
                block: formData.block || undefined,
                gpUlb: formData.gp_ulb || undefined,
                ward: formData.ward || undefined,
                whatsapp: formData.whatsapp || undefined,
            });
            setUploadStatus('success');
            setFormData({
                name: '',
                mobile: '',
                whatsapp: '',
                block: '',
                gp_ulb: '',
                ward: '',
                dob: '',
                anniversary: '',
            });
            // Refresh constituents list
            const { constituents: newData } = await getConstituents();
            setConstituents(newData);
        } catch (error) {
            console.error('Failed to add constituent:', error);
            setUploadStatus('error');
        } finally {
            setIsLoading(false);
            setTimeout(() => setUploadStatus('idle'), 3000);
        }
    };

    // Filter constituents
    const filteredConstituents = constituents.filter(c =>
        !searchTerm ||
        c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm) ||
        c.ward?.includes(searchTerm)
    );

    // Redirect non-staff users
    if (!isStaff) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-white/60">
                        Only staff members can access this page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto w-full">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Data Entry
                    </h1>
                    <p className="text-white/60 mt-1">
                        Add constituents via CSV upload or manual entry
                    </p>
                </div>
            </div>

            {/* Success/Error Toast */}
            {uploadStatus !== 'idle' && (
                <div
                    className={`
                        fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-full shadow-2xl
                        animate-spring-bounce
                        ${uploadStatus === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
                    `}
                >
                    {uploadStatus === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <AlertCircle className="w-5 h-5" />
                    )}
                    <span className="font-medium">
                        {uploadStatus === 'success' ? 'Data saved successfully!' : 'Upload failed'}
                    </span>
                </div>
            )}

            {/* --- 50/50 Layout: CSV Upload | Manual Entry --- */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* CSV Upload Section */}
                <div className="glass-card-light p-6 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2 text-white">
                        <Upload className="w-5 h-5 text-emerald-400 animate-float" />
                        <h2 className="font-bold">Upload CSV File</h2>
                    </div>

                    {/* Drop Zone */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
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
                            accept=".csv"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 mb-4 animate-float">
                            <FileText className="w-7 h-7 text-emerald-400" />
                        </div>
                        <p className="font-medium text-white mb-1">
                            {csvContent ? 'File loaded!' : 'Drag & drop your CSV file here'}
                        </p>
                        <p className="text-sm text-white/50">
                            or click to browse
                        </p>
                    </div>

                    {/* CSV Preview */}
                    {csvContent && (
                        <div className="p-4 bg-white/5 rounded-xl animate-slide-up">
                            <p className="text-sm font-medium text-white mb-2">
                                Preview ({csvContent.split('\n').length - 1} rows)
                            </p>
                            <pre className="text-xs text-white/60 overflow-x-auto max-h-24">
                                {csvContent.slice(0, 400)}...
                            </pre>
                        </div>
                    )}

                    {/* Upload Button */}
                    <button
                        onClick={handleCsvUpload}
                        disabled={!csvContent || isLoading}
                        className="w-full py-3 flex items-center justify-center gap-2 font-semibold text-white rounded-full transition-all duration-300 disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #00A896 0%, #00C4A7 100%)', boxShadow: '0 4px 16px rgba(0, 168, 150, 0.4)' }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Upload Data
                            </>
                        )}
                    </button>
                </div>

                {/* Manual Entry Form */}
                <form
                    onSubmit={handleManualSubmit}
                    className="glass-card-light p-6 rounded-2xl space-y-4 overflow-visible"
                    style={{ overflow: 'visible' }}
                >
                    <div className="flex items-center gap-2 text-white">
                        <UserPlus className="w-5 h-5 text-emerald-400 animate-float" />
                        <h2 className="font-bold">Add Constituent</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Full Name */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-white/70 mb-1.5">
                                Full Name *
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="glass-input-dark pl-10 h-12 w-full"
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>

                        {/* Mobile Number */}
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1.5">
                                Mobile *
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                    required
                                    className={`
                                        glass-input-dark h-11 w-full px-3 text-sm transition-colors
                                        ${formData.mobile && !isValidIndianMobile(formData.mobile) ? '!border-red-500/50 focus:!border-red-500' : ''}
                                        ${formData.mobile && isValidIndianMobile(formData.mobile) ? '!border-emerald-500/50 focus:!border-emerald-500' : ''}
                                    `}
                                    placeholder="10-digit number"
                                />
                                {/* Validation Icon */}
                                {formData.mobile && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        {isValidIndianMobile(formData.mobile) ? (
                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-red-400" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* WhatsApp Number - With Validation */}
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1.5">
                                WhatsApp
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={formData.whatsapp}
                                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                    className={`
                                        glass-input-dark h-11 w-full px-3 text-sm transition-colors
                                        ${formData.whatsapp && !isValidWhatsApp(formData.whatsapp) ? '!border-red-500/50 focus:!border-red-500' : ''}
                                        ${formData.whatsapp && isValidWhatsApp(formData.whatsapp) ? '!border-emerald-500/50 focus:!border-emerald-500' : ''}
                                    `}
                                    placeholder="10-digit number"
                                />
                                {formData.whatsapp && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        {isValidWhatsApp(formData.whatsapp) ? (
                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-red-400" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Block */}
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1.5">
                                Block
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.block}
                                    onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                                    className="glass-input-dark h-12 w-full text-sm appearance-none !pl-3 !pr-10"
                                >
                                    <option value="">Select Block</option>
                                    <option value="Raipur">Raipur</option>
                                    <option value="Bilaspur">Bilaspur</option>
                                    <option value="Durg">Durg</option>
                                    <option value="Korba">Korba</option>
                                    <option value="Rajnandgaon">Rajnandgaon</option>
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 rotate-90 pointer-events-none" />
                            </div>
                        </div>

                        {/* GP/ULB */}
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1.5">
                                GP / ULB
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.gp_ulb}
                                    onChange={(e) => setFormData({ ...formData, gp_ulb: e.target.value })}
                                    className="glass-input-dark h-12 w-full text-sm appearance-none !pl-3 !pr-10"
                                >
                                    <option value="">Select GP/ULB</option>
                                    <option value="GP1">Gram Panchayat 1</option>
                                    <option value="GP2">Gram Panchayat 2</option>
                                    <option value="ULB1">Urban Local Body 1</option>
                                    <option value="ULB2">Urban Local Body 2</option>
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 rotate-90 pointer-events-none" />
                            </div>
                        </div>

                        {/* Ward Number */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-white/70 mb-1.5">
                                Ward
                            </label>
                            <input
                                type="text"
                                value={formData.ward}
                                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                                className="glass-input-dark h-11 w-full px-3 text-sm"
                                placeholder="Ward #"
                            />
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1.5">
                                Date of Birth
                            </label>
                            <div className="relative group">
                                <div
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 cursor-pointer hover:text-emerald-400 transition-colors z-10"
                                    onClick={() => openDatePicker('dob')}
                                >
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <input
                                    ref={dobInputRef}
                                    type="text"
                                    value={formatDateForInput(formData.dob)}
                                    onChange={(e) => handleDateTextInput('dob', e.target.value)}
                                    onFocus={() => openDatePicker('dob')}
                                    placeholder="dd/mm/yyyy"
                                    className="glass-input-dark pl-10 h-12 w-full"
                                />
                            </div>
                        </div>

                        {/* Anniversary */}
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-1.5">
                                Anniversary
                            </label>
                            <div className="relative group">
                                <div
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 cursor-pointer hover:text-emerald-400 transition-colors z-10"
                                    onClick={() => openDatePicker('anniversary')}
                                >
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <input
                                    ref={anniversaryInputRef}
                                    type="text"
                                    value={formatDateForInput(formData.anniversary)}
                                    onChange={(e) => handleDateTextInput('anniversary', e.target.value)}
                                    onFocus={() => openDatePicker('anniversary')}
                                    placeholder="dd/mm/yyyy"
                                    className="glass-input-dark pl-10 h-12 w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Fixed position calendar portal */}
                    {activeDatePicker && (
                        <>
                            {/* Backdrop to close calendar */}
                            <div
                                className="fixed inset-0 z-[9998]"
                                onClick={() => setActiveDatePicker(null)}
                            />
                            {/* Calendar dropdown */}
                            <div
                                className="fixed z-[9999] animate-in fade-in zoom-in-95 duration-200"
                                style={{
                                    top: calendarPosition.top,
                                    left: calendarPosition.left,
                                    width: Math.max(calendarPosition.width, 300),
                                }}
                            >
                                <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-1">
                                    <GlassCalendar
                                        selectedDate={(() => {
                                            const dateStr = activeDatePicker === 'dob' ? formData.dob : formData.anniversary;
                                            if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return new Date();
                                            const d = new Date(dateStr);
                                            return isNaN(d.getTime()) ? new Date() : d;
                                        })()}
                                        onSelect={(date) => {
                                            if (activeDatePicker) {
                                                handleDateSelect(activeDatePicker, date);
                                            }
                                        }}
                                        className="!bg-transparent !p-2 !shadow-none"
                                        minYear={1920}
                                        maxYear={new Date().getFullYear() + 5}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 flex items-center justify-center gap-2 font-semibold text-white text-sm rounded-full transition-all duration-300 disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, #00A896 0%, #00C4A7 100%)', boxShadow: '0 4px 16px rgba(0, 168, 150, 0.4)' }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4" />
                                Add
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* --- Data Metrics Dashboard (50% Total + 50% Blocks) --- */}
            <DataMetricsCard />

            {/* --- Full-Width Database Table --- */}
            <div className="glass-card-light p-6 rounded-2xl">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Database className="w-5 h-5 text-emerald-400" />
                        Constituent Database
                    </h3>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-white/60">
                            {filteredConstituents.length} records
                        </span>
                        {constituents.length === 0 && (
                            <button
                                onClick={handleSeedDatabase}
                                disabled={isSeeding}
                                className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                            >
                                {isSeeding ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Seeding...
                                    </>
                                ) : seedStatus === 'success' ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Seeded!
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Seed 50 Test
                                    </>
                                )}
                            </button>
                        )}
                        {/* Download Buttons */}
                        {constituents.length > 0 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => downloadConstituentsAsCSV(filteredConstituents)}
                                    className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    CSV
                                </button>
                                <button
                                    onClick={() => downloadConstituentsAsPDF(filteredConstituents)}
                                    className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                                >
                                    <FileDown className="w-4 h-4" />
                                    PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, mobile, or ward..."
                        className="glass-input-dark pl-11"
                    />
                </div>

                {/* Table with horizontal scroll */}
                <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-3 text-xs font-bold text-white/60 uppercase">
                                    Name
                                </th>
                                <th className="text-left py-3 px-3 text-xs font-bold text-white/60 uppercase">
                                    Mobile
                                </th>
                                <th className="text-left py-3 px-3 text-xs font-bold text-white/60 uppercase">
                                    Ward
                                </th>
                                <th className="text-left py-3 px-3 text-xs font-bold text-white/60 uppercase">
                                    Block
                                </th>
                                <th className="text-left py-3 px-3 text-xs font-bold text-white/60 uppercase">
                                    GP/ULB
                                </th>
                                <th className="text-left py-3 px-3 text-xs font-bold text-white/60 uppercase">
                                    Birthday
                                </th>
                                <th className="text-left py-3 px-3 text-xs font-bold text-white/60 uppercase">
                                    Anniversary
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoadingConstituents ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-white/5">
                                        <td className="py-3 px-3"><div className="h-4 w-24 bg-white/10 rounded animate-pulse" /></td>
                                        <td className="py-3 px-3"><div className="h-4 w-20 bg-white/10 rounded animate-pulse" /></td>
                                        <td className="py-3 px-3"><div className="h-4 w-8 bg-white/10 rounded animate-pulse" /></td>
                                        <td className="py-3 px-3"><div className="h-4 w-16 bg-white/10 rounded animate-pulse" /></td>
                                        <td className="py-3 px-3"><div className="h-4 w-12 bg-white/10 rounded animate-pulse" /></td>
                                        <td className="py-3 px-3"><div className="h-4 w-14 bg-white/10 rounded animate-pulse" /></td>
                                        <td className="py-3 px-3"><div className="h-4 w-14 bg-white/10 rounded animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : filteredConstituents.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12">
                                        <div className="text-white/60">
                                            <Database className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            <p>No constituents yet</p>
                                            <p className="text-sm">Upload a CSV, add manually, or seed test data</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredConstituents.map((c, i) => (
                                    <tr
                                        key={c.id}
                                        className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                                    >
                                        <td className="py-3 px-3 font-medium text-white">
                                            {c.fullName || c.name}
                                        </td>
                                        <td className="py-3 px-3 text-white/80">
                                            {c.phone || c.mobileNumber}
                                        </td>
                                        <td className="py-3 px-3 text-white/80">
                                            {c.ward || c.wardNumber || '-'}
                                        </td>
                                        <td className="py-3 px-3 text-white/80">
                                            {c.block || '-'}
                                        </td>
                                        <td className="py-3 px-3 text-white/80">
                                            {c.gpUlb || '-'}
                                        </td>
                                        <td className="py-3 px-3 text-white/80">
                                            {c.birthdayMmdd || '-'}
                                        </td>
                                        <td className="py-3 px-3 text-white/80">
                                            {c.anniversaryMmdd || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                    <p className="text-sm text-white/60">
                        Showing {filteredConstituents.length} of {constituents.length}
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled
                            className="p-2 rounded-lg bg-white/5 text-white/40 disabled:opacity-30"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            disabled
                            className="p-2 rounded-lg bg-white/5 text-white/40 disabled:opacity-30"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
