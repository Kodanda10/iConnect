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
import { getFirebaseDb } from '@/lib/firebase';
import { writeBatch, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getConstituents, addConstituent } from '@/lib/services/constituents';
import { createTask } from '@/lib/services/tasks';
import { downloadConstituentsAsCSV, downloadConstituentsAsPDF } from '@/lib/utils/download';
import { Constituent, Task } from '@/types';
import ValidatedDateInput from '@/components/ui/ValidatedDateInput';
import {
    Upload,
    FileText,
    UserPlus,
    CheckCircle,
    AlertCircle,
    Loader2,
    Database,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Download,
    FileDown,
    User,
} from 'lucide-react';
import { isValidIndianMobile, isValidWhatsApp } from '@/lib/utils/validation';
import { validateConstituentDates } from '@/lib/utils/dateRequirements';
import { validateCsvData, CsvDataValidation, CsvRowData } from '@/lib/utils/csvValidation';
import DataMetricsCard from '@/components/dashboard/DataMetricsCard';

export default function UploadPage() {
    const { user, isStaff, isLeader } = useAuth();
    const [isDragging, setIsDragging] = useState(false);
    const [csvContent, setCsvContent] = useState('');
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Constituents from Firestore
    const [constituents, setConstituents] = useState<Constituent[]>([]);
    const [isLoadingConstituents, setIsLoadingConstituents] = useState(true);
    const [isSeeding, setIsSeeding] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [seedStatus, setSeedStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // CSV validation state
    const [csvValidation, setCsvValidation] = useState<CsvDataValidation | null>(null);
    const [showCsvErrors, setShowCsvErrors] = useState(false);

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

    // Wipe Database
    const handleResetDatabase = async () => {
        if (!window.confirm('WARNING: THIS WILL DELETE ALL CONSTITUENTS AND TASKS.\n\nAre you sure you want to wipe the database?')) {
            return;
        }

        setIsResetting(true);
        try {
            const db = getFirebaseDb();

            // 1. Clear Constituents
            const cSnapshot = await getDocs(collection(db, 'constituents'));
            const cBatch = writeBatch(db);
            cSnapshot.docs.forEach((d) => cBatch.delete(d.ref));
            await cBatch.commit();

            // 2. Clear Tasks
            const tSnapshot = await getDocs(collection(db, 'tasks'));
            const tBatch = writeBatch(db);
            tSnapshot.docs.forEach((d) => tBatch.delete(d.ref));
            await tBatch.commit();

            // 3. Clear Action Logs (Optional but good for clean slate)
            const aSnapshot = await getDocs(collection(db, 'action_logs'));
            const aBatch = writeBatch(db);
            aSnapshot.docs.forEach((d) => aBatch.delete(d.ref));
            await aBatch.commit();

            await fetchConstituents();
            alert('Database wiped successfully. Please refresh the page to update metrics.');
            window.location.reload(); // Force reload to update metrics card
        } catch (error) {
            console.error('Reset failed:', error);
            const msg = error instanceof Error ? error.message : String(error);
            alert(`Failed to reset database: ${msg}`);
        } finally {
            setIsResetting(false);
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

    const normalizeStorageDate = (value: string): string => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
        return '';
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

    /**
     * Helper to convert DD/MM/YYYY to YYYY-MM-DD
     */
    const parseDDMMYYYY = (dateStr?: string): string | undefined => {
        if (!dateStr) return undefined;
        // Check if already YYYY-MM-DD
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;

        // Handle DD/MM/YYYY or DD-MM-YYYY
        const parts = dateStr.split(/[\/\-]/);
        if (parts.length === 3) {
            const [d, m, y] = parts;
            // Ensure padding
            const day = d.padStart(2, '0');
            const month = m.padStart(2, '0');
            // Handle 2 digit year? Assuming 4 for now based on CSV
            return `${y}-${month}-${day}`;
        }
        return undefined;
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

    /**
     * Parse CSV content into row objects
     */
    const parseCsvToRows = (content: string): CsvRowData[] => {
        const lines = content.trim().split('\n');
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const rows: CsvRowData[] = [];

        for (let i = 1; i < lines.length; i++) {
            // Trim and remove surrounding quotes
            const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const row: CsvRowData = {};

            headers.forEach((header, index) => {
                const value = values[index] || '';
                // Map common header variations (headers are lowercased)
                if (header === 'name' || header === 'full_name' || header === 'fullname') {
                    row.name = value;
                } else if (header === 'mobile' || header === 'mobile_number' || header === 'phone') {
                    row.mobile = value;
                } else if (header === 'whatsapp' || header === 'whatsapp_number') {
                    row.whatsapp = value;
                } else if (header === 'dob' || header === 'date_of_birth' || header === 'birthday') {
                    // Parse DD/MM/YYYY to YYYY-MM-DD immediately
                    row.dob = parseDDMMYYYY(value) || value;
                } else if (header === 'anniversary') {
                    // Parse DD/MM/YYYY to YYYY-MM-DD immediately
                    row.anniversary = parseDDMMYYYY(value) || value;
                } else if (header === 'block') {
                    row.block = value;
                } else if (header === 'gp_ulb' || header === 'gp' || header === 'ulb' || header === 'gp/ulb') {
                    row.gp_ulb = value;
                } else if (header === 'ward' || header === 'ward_number') {
                    row.ward = value;
                }
            });

            rows.push(row);
        }

        return rows;
    };

    const handleCsvUpload = async () => {
        if (!csvContent) return;

        // Parse and validate CSV
        const rows = parseCsvToRows(csvContent);
        const validation = validateCsvData(rows);
        setCsvValidation(validation);

        // If there are invalid rows, show error summary but don't block valid rows
        if (!validation.isAllValid) {
            setShowCsvErrors(true);
            // Don't proceed with upload yet - let user review errors
            return;
        }

        // All rows valid - proceed with upload
        await uploadValidRows(rows);
    };

    const uploadValidRows = async (rows: CsvRowData[]) => {
        setIsLoading(true);
        try {
            // Add each valid constituent
            const currentYear = new Date().getFullYear();

            // Helper to clean date strings for Tasks (returns Date object)
            const parseDateToObj = (dateStr?: string): Date | null => {
                const isoStr = parseDDMMYYYY(dateStr);
                if (!isoStr) return null;
                return new Date(isoStr);
            };

            for (const row of rows) {
                // 1. Create Constituent
                // FIX: Parse dates before sending
                const dobISO = parseDDMMYYYY(row.dob);
                const annISO = parseDDMMYYYY(row.anniversary);

                const constituentId = await addConstituent({
                    name: row.name || '',
                    mobile_number: row.mobile || '',
                    dob: dobISO,
                    anniversary: annISO,
                    block: row.block || undefined,
                    gp_ulb: row.gp_ulb || undefined,
                    ward_number: row.ward || undefined,
                    whatsapp: row.whatsapp || undefined,
                });

                // 2. Create Tasks (Birthday/Anniversary) for THIS year
                console.log('[Upload] Creating tasks for:', row.name, 'uid:', user?.uid);
                if (user?.uid) {
                    // Birthday
                    const dob = parseDateToObj(row.dob);
                    console.log('[Upload] DOB parsed:', row.dob, '->', dob);
                    if (dob) {
                        const bdayDueDate = new Date(currentYear, dob.getMonth(), dob.getDate(), 12, 0, 0);
                        console.log('[Upload] Creating BIRTHDAY task, due:', bdayDueDate.toISOString());
                        await createTask({
                            constituent_id: constituentId,
                            uid: user.uid,
                            type: 'BIRTHDAY',
                            status: 'PENDING',
                            due_date: bdayDueDate,
                            call_sent: false,
                            sms_sent: false,
                            whatsapp_sent: false,
                            constituent_name: row.name || '',
                            constituent_mobile: row.mobile || '',
                            ward_number: row.ward,
                        });
                        console.log('[Upload] BIRTHDAY task created successfully');
                    }

                    // Anniversary
                    const ann = parseDateToObj(row.anniversary);
                    console.log('[Upload] Anniversary parsed:', row.anniversary, '->', ann);
                    if (ann) {
                        const annDueDate = new Date(currentYear, ann.getMonth(), ann.getDate(), 12, 0, 0);
                        console.log('[Upload] Creating ANNIVERSARY task, due:', annDueDate.toISOString());
                        await createTask({
                            constituent_id: constituentId,
                            uid: user.uid,
                            type: 'ANNIVERSARY',
                            status: 'PENDING',
                            due_date: annDueDate,
                            call_sent: false,
                            sms_sent: false,
                            whatsapp_sent: false,
                            constituent_name: row.name || '',
                            constituent_mobile: row.mobile || '',
                            ward_number: row.ward,
                        });
                        console.log('[Upload] ANNIVERSARY task created successfully');
                    }
                } else {
                    console.warn('[Upload] No user.uid - tasks NOT created!');
                }
            }

            setUploadStatus('success');
            setCsvContent('');
            setCsvValidation(null);
            setShowCsvErrors(false);
            await fetchConstituents();
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

        // Validate that at least DOB or Anniversary is provided
        const normalizedDob = normalizeStorageDate(formData.dob);
        const normalizedAnniversary = normalizeStorageDate(formData.anniversary);
        const dateValidation = validateConstituentDates(normalizedDob, normalizedAnniversary);
        if (!dateValidation.isValid) {
            setUploadStatus('error');
            setErrorMessage(dateValidation.error || 'Invalid date selection');
            // Allow the error toast to show
            setTimeout(() => {
                setUploadStatus('idle');
                setErrorMessage('');
            }, 3000);
            return;
        }

        setIsLoading(true);
        try {
            const constituentId = await addConstituent({
                name: formData.name,
                mobile_number: formData.mobile,
                dob: normalizedDob || undefined,
                anniversary: normalizedAnniversary || undefined,
                block: formData.block || undefined,
                gp_ulb: formData.gp_ulb || undefined,
                ward_number: formData.ward || undefined,
                whatsapp: formData.whatsapp || undefined,
            });

            // Create Tasks manually for the single entry too
            if (user?.uid) {
                const currentYear = new Date().getFullYear();

                if (normalizedDob) {
                    const dob = new Date(normalizedDob);
                    const bdayDueDate = new Date(currentYear, dob.getMonth(), dob.getDate(), 12, 0, 0);
                    await createTask({
                        constituent_id: constituentId,
                        uid: user.uid,
                        type: 'BIRTHDAY',
                        status: 'PENDING',
                        due_date: bdayDueDate,
                        call_sent: false,
                        sms_sent: false,
                        whatsapp_sent: false,
                        constituent_name: formData.name,
                        constituent_mobile: formData.mobile,
                        ward_number: formData.ward,
                    });
                }

                if (normalizedAnniversary) {
                    const ann = new Date(normalizedAnniversary);
                    const annDueDate = new Date(currentYear, ann.getMonth(), ann.getDate(), 12, 0, 0);
                    await createTask({
                        constituent_id: constituentId,
                        uid: user.uid,
                        type: 'ANNIVERSARY',
                        status: 'PENDING',
                        due_date: annDueDate,
                        call_sent: false,
                        sms_sent: false,
                        whatsapp_sent: false,
                        constituent_name: formData.name,
                        constituent_mobile: formData.mobile,
                        ward_number: formData.ward,
                    });
                }
            }
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
        c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm) ||
        c.mobile_number?.includes(searchTerm) ||
        c.ward_number?.includes(searchTerm) ||
        c.ward?.includes(searchTerm)
    );

    // Redirect non-staff users
    if (!isStaff && !isLeader) {
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

                    {/* CSV Validation Errors */}
                    {showCsvErrors && csvValidation && !csvValidation.isAllValid && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-slide-up space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                    <span className="font-bold text-white">
                                        {csvValidation.invalidCount} row{csvValidation.invalidCount !== 1 ? 's' : ''} have errors
                                    </span>
                                </div>
                                <span className="text-sm text-emerald-400">
                                    {csvValidation.validCount} valid
                                </span>
                            </div>

                            {/* Error list - collapsed by default, expandable */}
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {csvValidation.invalidRows.slice(0, 10).map((row) => (
                                    <div key={row.rowNumber} className="text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded">
                                        <span className="font-bold">Row {row.rowNumber}</span>
                                        {row.name && <span className="text-white/60"> ({row.name})</span>}: {row.errors.join(', ')}
                                    </div>
                                ))}
                                {csvValidation.invalidRows.length > 10 && (
                                    <div className="text-xs text-white/50 italic">
                                        ...and {csvValidation.invalidRows.length - 10} more errors
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2 pt-2 border-t border-white/10">
                                {csvValidation.validCount > 0 && (
                                    <button
                                        onClick={() => {
                                            const rows = parseCsvToRows(csvContent);
                                            const validRows = rows.filter((_, i) =>
                                                !csvValidation.invalidRows.some(r => r.rowNumber === i + 1)
                                            );
                                            uploadValidRows(validRows);
                                        }}
                                        className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-bold hover:bg-emerald-500/30 transition-colors"
                                    >
                                        Upload {csvValidation.validCount} Valid Rows
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setShowCsvErrors(false);
                                        setCsvValidation(null);
                                        setCsvContent('');
                                    }}
                                    className="flex-1 py-2 bg-white/5 text-white/70 rounded-lg text-sm font-bold hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
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

                    {/* Inline Error/Success Banner */}
                    {uploadStatus !== 'idle' && (
                        <div className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl animate-slide-up
                            ${uploadStatus === 'success' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-200' : 'bg-red-500/20 border border-red-500/30 text-red-200'}
                        `}>
                            {uploadStatus === 'success' ? (
                                <CheckCircle className="w-5 h-5 shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 shrink-0" />
                            )}
                            <span className="font-medium text-sm">
                                {uploadStatus === 'success' ? 'Data saved successfully!' : (errorMessage || 'Upload failed')}
                            </span>
                        </div>
                    )}

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
                                Ward No.
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.ward}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                                        setFormData({ ...formData, ward: val });
                                    }}
                                    className={`
                                        glass-input-dark h-11 w-full px-3 text-sm transition-colors
                                        ${formData.ward && formData.ward.length >= 1 ? '!border-emerald-500/50 focus:!border-emerald-500' : ''}
                                        ${!formData.ward && uploadStatus === 'error' ? '!border-red-500/50 focus:!border-red-500' : ''}
                                    `}
                                    placeholder="Ward #"
                                />
                                {formData.ward && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Date of Birth */}
                        <ValidatedDateInput
                            label="Date of Birth"
                            value={formData.dob}
                            onChange={(val) => setFormData(prev => ({ ...prev, dob: val }))}
                            allowFuture={false}
                        />

                        {/* Anniversary */}
                        <ValidatedDateInput
                            label="Anniversary"
                            value={formData.anniversary}
                            onChange={(val) => setFormData(prev => ({ ...prev, anniversary: val }))}
                            allowFuture={false}
                        />
                    </div>

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
                            <div className="flex gap-2">
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
                            </div>
                        )}
                        {/* Reset DB Button (Always visible for Staff for now) */}
                        <button
                            onClick={handleResetDatabase}
                            disabled={isResetting}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-sm py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            {isResetting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            Reset DB
                        </button>
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
                                            {c.full_name || c.name}
                                        </td>
                                        <td className="py-3 px-3 text-white/80">
                                            {c.phone || c.mobile_number}
                                        </td>
                                        <td className="py-3 px-3 text-white/80">
                                            {c.ward_number || c.ward || '-'}
                                        </td>
                                        <td className="py-3 px-3 text-white/80">
                                            {c.block || '-'}
                                        </td>
                                        <td className="py-3 px-3 text-white/80">
                                            {c.gp_ulb || '-'}
                                        </td>
                                        <td className="py-3 px-3 text-white/80">
                                            {c.dob || c.birthday_mmdd || '-'}
                                        </td>
                                        <td className="py-3 px-3 text-white/80">
                                            {typeof c.anniversary === 'string' ? c.anniversary : c.anniversary_mmdd || '-'}
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
