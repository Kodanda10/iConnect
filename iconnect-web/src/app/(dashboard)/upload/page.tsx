/**
 * @file app/(dashboard)/upload/page.tsx
 * @description Data entry page with CSV upload and manual form
 * @changelog
 * - 2024-12-11: Initial implementation with drag-drop and form
 */

'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
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
} from 'lucide-react';

type EntryMode = 'csv' | 'manual';

export default function UploadPage() {
    const { isStaff } = useAuth();
    const [entryMode, setEntryMode] = useState<EntryMode>('csv');
    const [isDragging, setIsDragging] = useState(false);
    const [csvContent, setCsvContent] = useState('');
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Manual form state
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        dob: '',
        anniversary: '',
        block: '',
        gp_ulb: '',
        ward: '',
        address: '',
    });

    // Search and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

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
        // Simulate upload - in production this would call addConstituents service
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setUploadStatus('success');
        setCsvContent('');
        setIsLoading(false);
        setTimeout(() => setUploadStatus('idle'), 3000);
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate submission
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setUploadStatus('success');
        setFormData({
            name: '',
            mobile: '',
            dob: '',
            anniversary: '',
            block: '',
            gp_ulb: '',
            ward: '',
            address: '',
        });
        setIsLoading(false);
        setTimeout(() => setUploadStatus('idle'), 3000);
    };

    // Redirect non-staff users
    if (!isStaff) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-[var(--color-text-secondary)]">
                        Only staff members can access this page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        Data Entry
                    </h1>
                    <p className="text-[var(--color-text-secondary)] mt-1">
                        Add constituents via CSV upload or manual entry
                    </p>
                </div>
            </div>

            {/* Success/Error Toast */}
            {uploadStatus !== 'idle' && (
                <div
                    className={`
            fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl
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

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Entry Form */}
                <div className="space-y-6">
                    {/* Mode Tabs */}
                    <div className="flex gap-2 p-1 glass-card-light rounded-xl w-fit">
                        <button
                            onClick={() => setEntryMode('csv')}
                            className={`
                flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all magnetic-btn
                ${entryMode === 'csv'
                                    ? 'gradient-primary text-white shadow-lg'
                                    : 'text-[var(--color-text-secondary)] hover:bg-black/5'
                                }
              `}
                        >
                            <Upload className="w-4 h-4" />
                            CSV Upload
                        </button>
                        <button
                            onClick={() => setEntryMode('manual')}
                            className={`
                flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all magnetic-btn
                ${entryMode === 'manual'
                                    ? 'gradient-primary text-white shadow-lg'
                                    : 'text-[var(--color-text-secondary)] hover:bg-black/5'
                                }
              `}
                        >
                            <UserPlus className="w-4 h-4" />
                            Manual Entry
                        </button>
                    </div>

                    {/* CSV Upload Mode */}
                    {entryMode === 'csv' && (
                        <div className="glass-card-light p-6 rounded-2xl animate-scale-in">
                            <h3 className="font-bold text-[var(--color-text-primary)] mb-4">
                                Upload CSV File
                            </h3>

                            {/* Drop Zone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`
                  border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
                  transition-all duration-300 glow-hover
                  ${isDragging
                                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 scale-[1.02]'
                                        : 'border-black/20 hover:border-[var(--color-primary)]'
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
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black/5 mb-4 animate-float">
                                    <FileText className="w-8 h-8 text-[var(--color-primary)]" />
                                </div>
                                <p className="font-medium text-[var(--color-text-primary)] mb-1">
                                    {csvContent ? 'File loaded!' : 'Drag & drop your CSV file here'}
                                </p>
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    or click to browse
                                </p>
                            </div>

                            {/* CSV Preview */}
                            {csvContent && (
                                <div className="mt-4 p-4 bg-black/5 rounded-xl animate-slide-up">
                                    <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
                                        Preview ({csvContent.split('\n').length - 1} rows)
                                    </p>
                                    <pre className="text-xs text-[var(--color-text-secondary)] overflow-x-auto max-h-32">
                                        {csvContent.slice(0, 500)}...
                                    </pre>
                                </div>
                            )}

                            {/* Upload Button */}
                            <button
                                onClick={handleCsvUpload}
                                disabled={!csvContent || isLoading}
                                className="w-full btn-primary py-4 mt-6 flex items-center justify-center gap-2 ripple disabled:opacity-50"
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
                    )}

                    {/* Manual Entry Mode */}
                    {entryMode === 'manual' && (
                        <form
                            onSubmit={handleManualSubmit}
                            className="glass-card-light p-6 rounded-2xl animate-scale-in space-y-5"
                        >
                            <h3 className="font-bold text-[var(--color-text-primary)]">
                                Add Constituent
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                                        placeholder="Enter full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        Mobile Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                        required
                                        pattern="[0-9]{10}"
                                        className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                                        placeholder="10-digit number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        Ward Number
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.ward}
                                        onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                                        placeholder="Ward #"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        Date of Birth *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        Anniversary
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.anniversary}
                                        onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                        Address
                                    </label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        rows={2}
                                        className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all resize-none"
                                        placeholder="Full address"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary py-4 flex items-center justify-center gap-2 ripple"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-5 h-5" />
                                        Add Constituent
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Right Column - Database View */}
                <div className="glass-card-light p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                            <Database className="w-5 h-5 text-[var(--color-primary)]" />
                            Constituent Database
                        </h3>
                        <span className="text-sm text-[var(--color-text-secondary)]">
                            0 records
                        </span>
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, mobile, or ward..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/10 bg-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                        />
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-black/10">
                                    <th className="text-left py-3 px-2 text-xs font-bold text-[var(--color-text-secondary)] uppercase">
                                        Name
                                    </th>
                                    <th className="text-left py-3 px-2 text-xs font-bold text-[var(--color-text-secondary)] uppercase">
                                        Mobile
                                    </th>
                                    <th className="text-left py-3 px-2 text-xs font-bold text-[var(--color-text-secondary)] uppercase">
                                        Ward
                                    </th>
                                    <th className="text-left py-3 px-2 text-xs font-bold text-[var(--color-text-secondary)] uppercase">
                                        DOB
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Empty state */}
                                <tr>
                                    <td colSpan={4} className="text-center py-12">
                                        <div className="text-[var(--color-text-secondary)]">
                                            <Database className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                            <p>No constituents yet</p>
                                            <p className="text-sm">Upload a CSV or add manually</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/10">
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            Page {currentPage} of 1
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled
                                className="p-2 rounded-lg bg-black/5 disabled:opacity-30"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                disabled
                                className="p-2 rounded-lg bg-black/5 disabled:opacity-30"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
