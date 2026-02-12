'use client';

import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const FileUploader = ({ label, file, setFile, existingUrl, onDelete, color = "indigo", icon }: { label: string, file: File | null, setFile: (f: File | null) => void, existingUrl?: string, onDelete?: () => void, color?: string, icon: React.ReactNode }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        const str = URL.createObjectURL(file);
        setPreviewUrl(str);
        return () => URL.revokeObjectURL(str);
    }, [file]);

    const isPdf = file?.type === 'application/pdf';

    // Check if existing URL is a PDF (simple extension check or Cloudinary format)
    const isExistingPdf = existingUrl && (existingUrl.toLowerCase().endsWith('.pdf') || existingUrl.includes('.pdf'));

    const colorClasses: Record<string, string> = {
        indigo: 'hover:border-indigo-500/50 hover:bg-indigo-50/30',
        blue: 'hover:border-blue-500/50 hover:bg-blue-50/30',
        purple: 'hover:border-purple-500/50 hover:bg-purple-50/30',
        green: 'hover:border-green-500/50 hover:bg-green-50/30',
        orange: 'hover:border-orange-500/50 hover:bg-orange-50/30',
        red: 'hover:border-red-500/50 hover:bg-red-50/30',
        teal: 'hover:border-teal-500/50 hover:bg-teal-50/30',
    };

    return (
        <div className={`group relative rounded-xl border-2 border-dashed border-slate-200 ${colorClasses[color] || colorClasses.indigo} transition-all duration-200 p-4 text-center h-52 flex flex-col items-center justify-center overflow-hidden`}>

            {/* Case 1: Existing URL exists and NO new file selected -> Show Existing */}
            {existingUrl && !file ? (
                <div className="relative w-full h-full rounded-lg overflow-hidden group/img flex items-center justify-center bg-gray-50">
                    {isExistingPdf ? (
                        <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 10h6" />
                            </svg>
                            <a href={existingUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-slate-900 truncate max-w-[150px] hover:underline hover:text-indigo-600 z-30 relative">View PDF</a>
                        </div>
                    ) : (
                        <img src={existingUrl} alt={label} className="w-full h-full object-contain" />
                    )}

                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-20 gap-2">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.open(existingUrl, '_blank');
                            }}
                            className="bg-white/90 text-slate-700 p-2 rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all"
                            title="Preview"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                        {onDelete && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                className="bg-white/90 text-red-600 px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-white hover:scale-105 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </button>
                        )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 z-10">
                        Current File
                    </div>
                </div>
            ) : (
                /* Case 2: No Existing URL OR New File Selected -> Show Upload/Preview */
                <>
                    <label className="absolute inset-0 w-full h-full cursor-pointer z-20 flex flex-col items-center justify-center">
                        <input
                            type="file"
                            accept="image/png, image/jpeg, application/pdf"
                            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                            className="hidden"
                        />
                        {!previewUrl && (
                            <>
                                <div className="mb-3 p-3 bg-white rounded-full shadow-sm ring-1 ring-slate-100 group-hover:scale-110 transition-transform">
                                    {icon}
                                </div>
                                <span className="block text-sm font-semibold text-slate-900 mb-1">{label}</span>
                                <span className="text-xs text-slate-500">Click to upload</span>
                            </>
                        )}
                    </label>

                    {previewUrl && (
                        <div className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center p-2">
                            {isPdf ? (
                                <div className="flex flex-col items-center">
                                    <svg className="w-12 h-12 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 10h6" />
                                    </svg>
                                    <p className="text-xs font-medium text-slate-900 truncate max-w-[150px]">{file?.name}</p>
                                    <p className="text-[10px] text-slate-500 uppercase mt-0.5">PDF Document</p>
                                </div>
                            ) : (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                            )}

                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none gap-2">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        window.open(previewUrl, '_blank');
                                    }}
                                    className="bg-white/90 text-slate-700 p-2 rounded-full shadow-lg hover:bg-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100 pointer-events-auto transform translate-y-4 group-hover:translate-y-0"
                                    title="Preview"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                                <span className="opacity-0 group-hover:opacity-100 bg-white/90 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm transform translate-y-4 group-hover:translate-y-0 transition-all text-slate-700 pointer-events-auto cursor-pointer">
                                    Change
                                </span>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

function EditForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [columns, setColumns] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm();

    // UI States
    const [collectedByType, setCollectedByType] = useState('Me');
    const [currentUser, setCurrentUser] = useState<string>('');

    // File states
    const [filePerson, setFilePerson] = useState<File | null>(null);
    const [fileFront, setFileFront] = useState<File | null>(null);
    const [fileBack, setFileBack] = useState<File | null>(null);
    const [fileAadharFront, setFileAadharFront] = useState<File | null>(null);
    const [fileAadharBack, setFileAadharBack] = useState<File | null>(null);
    const [filePancard, setFilePancard] = useState<File | null>(null);
    const [filePassbook, setFilePassbook] = useState<File | null>(null);
    // Added Medical File state
    const [fileMedical, setFileMedical] = useState<File | null>(null);
    const [declarationChecked, setDeclarationChecked] = useState(false);

    // Initial Data for pre-fill check
    const [initialData, setInitialData] = useState<any>(null);

    // Watch passport number for file uploads
    const ppKey = columns.findIndex(c => /passport\s*no/i.test(c));
    const passportNumber = watch(`field_${ppKey}`) || initialData?.['Passport No. ( in capital letters)'] || '';

    useEffect(() => {
        if (!id) {
            alert('No ID provided');
            router.push('/');
            return;
        }

        const fetchData = async () => {
            // Fetch current user
            try {
                const userRes = await fetch('/api/user');
                const userData = await userRes.json();
                if (userData.user) {
                    setCurrentUser(userData.user.name || userData.user.username);
                }
            } catch (e) {
                console.error(e);
            }

            // Fetch Row Data
            try {
                const res = await fetch(`/api/data?id=${id}`);
                const result = await res.json();

                if (result.headers) {
                    setColumns(result.headers);
                }

                if (result.data && result.data.length > 0) {
                    const row = result.data[0];
                    setInitialData(row);

                    // Pre-fill form using index-based keys
                    if (result.headers) {
                        result.headers.forEach((col: string, index: number) => {
                            let val = row[col];
                            // Format date if needed (DD/MM/YYYY -> YYYY-MM-DD) for boolean date inputs
                            if (col.toLowerCase().includes('dob') || col.toLowerCase().includes('date of birth') || col.toLowerCase().includes('date')) {
                                if (val) {
                                    // Handle DD/MM/YYYY or DD-MM-YYYY -> YYYY-MM-DD
                                    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(val)) {
                                        const [d, m, y] = val.split(/[\/\-]/);
                                        val = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                                    }
                                    // If already YYYY-MM-DD, leave it as is
                                }
                            }
                            setValue(`field_${index}`, val);
                        });
                    }

                    // Handle logic fields
                    const collectedBy = row['Collected by'];
                    if (collectedBy === 'Me' || collectedBy === currentUser) {
                        setCollectedByType('Me');
                    } else if (collectedBy) {
                        setCollectedByType('Other');
                        setValue('collected_by_other_input', collectedBy);
                    }
                } else {
                    alert('Entry not found');
                    router.push('/');
                }
            } catch (err) {
                console.error(err);
                alert('Failed to load data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, router, setValue]);

    const uploadFile = async (file: File, filename: string, folderType: 'photo' | 'copy' | 'adhar' | 'pancard' | 'passbook' | 'medical') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('filename', filename);
        formData.append('folderType', folderType);

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        return data.webViewLink;
    };

    const handleDeleteImage = async (url: string, colName: string) => {
        if (!confirm('Are you sure you want to delete this file? This cannot be undone.')) return;

        try {
            // 1. Delete from Cloudinary
            const res = await fetch('/api/upload', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const result = await res.json();
            if (!result.success) throw new Error(result.error || 'Failed to delete image');

            // 2. Clear cell in Google Sheet
            const updateRes = await fetch('/api/data', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slNo: id,
                    data: { [colName]: '' } // Clear specific column
                }),
            });
            if (!updateRes.ok) throw new Error('Failed to update sheet');

            // 3. Update Local State
            setInitialData((prev: any) => ({
                ...prev,
                [colName]: ''
            }));

            // Clear any pending file upload for this slot if user had selected one then deleted (edge case)
            if (colName.includes('passport size')) setFilePerson(null);
            if (colName.includes('passport photo (front)')) setFileFront(null);
            if (colName.includes('passport photo (back)')) setFileBack(null);
            if (colName.includes('aadhar image (front)')) setFileAadharFront(null);
            if (colName.includes('aadhar image (back)')) setFileAadharBack(null);
            if (colName.includes('pancard image')) setFilePancard(null);
            if (colName.includes('bank pasbook')) setFilePassbook(null);
            if (colName.includes('medical documents')) setFileMedical(null);

            alert('File deleted successfully');
        } catch (error: any) {
            console.error(error);
            alert(`Failed to delete: ${error.message}`);
        }
    };

    const onSubmit = async (rawData: any) => {
        try {
            // Helper to format date from YYYY-MM-DD to DD/MM/YYYY
            const formatDate = (dateStr: string) => {
                if (!dateStr) return '';
                const [year, month, day] = dateStr.split('-');
                return `${day}/${month}/${year}`;
            };

            // Restore original keys from index-based keys
            const data: any = {};

            // Handle index-based fields
            Object.keys(rawData).forEach(k => {
                if (k.startsWith('field_')) {
                    const index = parseInt(k.replace('field_', ''));
                    const colName = columns[index];
                    if (colName) {
                        let value = rawData[k];
                        // Format dates if applicable
                        if (colName.toLowerCase().includes('dob') || colName.toLowerCase().includes('expiry date') || colName.toLowerCase().includes('date')) {
                            // Check if it's in YYYY-MM-DD format (from input type=date)
                            if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
                                value = formatDate(value);
                            }
                        }
                        data[colName] = value;
                    }
                } else {
                    // Copy other fields (like collected_by_other_input)
                    data[k] = rawData[k];
                }
            });

            // Validation: Expiry Date validation is now handled by min constraint in UI or preserved from sheet


            // Logic: Collected By
            if (collectedByType === 'Me') {
                data['Collected by'] = currentUser || 'Me';
            } else {
                if (!data['collected_by_other_input'] && !data['Collected by']) {
                    // fallthrough
                }
                if (data['collected_by_other_input']) {
                    data['Collected by'] = data['collected_by_other_input'];
                }
            }
            // Cleanup temp field
            delete data['collected_by_other_input'];

            // Passport Number Logic for Uploads
            const ppKey = Object.keys(data).find(k => /passport\s*no/i.test(k));
            const ppVal = ppKey ? data[ppKey] : '';

            // If uploading new files, we need valid PP No
            if ((filePerson || fileFront || fileBack || fileMedical) && !ppVal) {
                alert('Passport Number is required for new uploads');
                return;
            }

            setUploading(true);

            // Helper
            const getExt = (file: File) => file.type === 'application/pdf' ? '.pdf' : '.jpg';

            // 1. Upload Person Photo
            if (filePerson) {
                setStatusMsg('Uploading Passport Photo...');
                const filename = `${ppVal}_person${getExt(filePerson)}`;
                const url = await uploadFile(filePerson, filename, 'photo');
                data['photo (passport size)'] = url;
            }

            // 2. Upload Front Copy
            if (fileFront) {
                setStatusMsg('Uploading Passport Front...');
                const filename = `${ppVal}_passportCopy_front${getExt(fileFront)}`;
                const url = await uploadFile(fileFront, filename, 'copy');
                data['passport photo (front)'] = url;
            }

            // 3. Upload Back Copy
            if (fileBack) {
                setStatusMsg('Uploading Passport Back...');
                const filename = `${ppVal}_passportCopy_back${getExt(fileBack)}`;
                const url = await uploadFile(fileBack, filename, 'copy');
                data['passport photo (back)'] = url;
            }

            // 4. Upload Aadhar Front
            if (fileAadharFront) {
                setStatusMsg('Uploading Aadhar (Front)...');
                const filename = `${ppVal}_aadhar_front${getExt(fileAadharFront)}`;
                const url = await uploadFile(fileAadharFront, filename, 'adhar');
                data['Aadhar Image (front)'] = url;
            }

            // 5. Upload Aadhar Back
            if (fileAadharBack) {
                setStatusMsg('Uploading Aadhar (Back)...');
                const filename = `${ppVal}_aadhar_back${getExt(fileAadharBack)}`;
                const url = await uploadFile(fileAadharBack, filename, 'adhar');
                data['Aadhar Image (back)'] = url;
            }

            // 6. Upload Pancard
            if (filePancard) {
                setStatusMsg('Uploading Pan Card...');
                const filename = `${ppVal}_pancard${getExt(filePancard)}`;
                const url = await uploadFile(filePancard, filename, 'pancard');
                data['pancard image'] = url;
            }

            // 7. Upload Passbook
            if (filePassbook) {
                setStatusMsg('Uploading Bank Passbook...');
                const filename = `${ppVal}_passbook${getExt(filePassbook)}`;
                const url = await uploadFile(filePassbook, filename, 'passbook');
                data['bank pasbook'] = url;
            }

            // 8. Upload Medical Documents
            if (fileMedical) {
                setStatusMsg('Uploading Medical Docs...');
                const filename = `${ppVal}_medical${getExt(fileMedical)}`; // Cloudinary handles extension
                const url = await uploadFile(fileMedical, filename, 'medical');
                data['Medical Documents (If any)'] = url;
            }

            setStatusMsg('Updating Data...');

            // 4. Submit Data (PUT)
            const res = await fetch('/api/data', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slNo: id,
                    data: data
                }),
            });

            if (!res.ok) throw new Error('Failed to update data');

            router.push('/');
            router.refresh();
        } catch (error: any) {
            console.error(error);
            setUploading(false);
            setStatusMsg('');
            alert(`Error: ${error.message}`);
        }
    };

    if (isLoading) return <div className="p-12 text-center text-gray-500">Loading entry...</div>;

    // Helper to filter out system columns or image columns from text inputs
    const isImageColumn = (col: string) => {
        const c = col.toLowerCase();
        return c.includes('photo (passport size)') ||
            c.includes('passport photo (front)') ||
            c.includes('passport photo (back)') ||
            c.includes('aadhar image') ||
            c.includes('pancard image') ||
            c.includes('bank pasbook') ||
            c.includes('medical documents') ||
            c === 'photo upload' ||
            c === 'passport copy front' ||
            c === 'passport copy back';
    };

    // Helper to determine input type
    const getInputType = (col: string) => {
        const c = col.toLowerCase();
        if (c.includes('dob') || c.includes('expiry date') || c.includes('date')) return 'date';
        if (c === 'age') return 'number';
        return 'text';
    };

    const isSelectColumn = (col: string) => {
        const c = col.toLowerCase();
        return c === 'sex';
    };

    return (
        <main className="min-h-screen bg-white relative selection:bg-indigo-50 selection:text-indigo-900 font-sans text-slate-900">
            {/* Abstract Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-indigo-100/40 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob"></div>
                <div className="absolute top-[20%] left-[-10%] w-[35rem] h-[35rem] bg-blue-100/40 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] right-[20%] w-[45rem] h-[45rem] bg-purple-100/40 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center md:p-12">
                <div className="w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 p-8 sm:p-10 border border-white/50">
                    <div className="mb-10 text-center sm:text-left">
                        <Link href="/" className="inline-flex items-center bg-white/80 backdrop-blur-xl rounded-full ring-1 ring-slate-900/5 p-2 sm:p-2 border border-white/50 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-6 group">
                            <svg className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">Edit Entry #{id}</h1>
                        <p className="text-sm text-slate-600">Update traveler details and documents.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
                            {columns.map((col, index) => {
                                // Skip image columns/Sl No
                                if (isImageColumn(col)) return null;
                                if (col.toLowerCase().includes('sl no')) return null;

                                const isRequired = (col.toLowerCase().includes('passport no') || col.toLowerCase().includes('name')) && !col.toLowerCase().includes('bank');
                                const fieldKey = `field_${index}`;

                                // Render Logic (Similar to Add Page)
                                if (col.toLowerCase().includes('collected by')) {
                                    return (
                                        <div key={col} className="space-y-2">
                                            <label className="block text-sm font-semibold text-slate-700 capitalize">{col}</label>
                                            <select
                                                value={collectedByType}
                                                onChange={(e) => setCollectedByType(e.target.value)}
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200 shadow-sm font-medium mb-2"
                                            >
                                                <option value="Me">Me</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            {collectedByType === 'Other' && (
                                                <input
                                                    {...register('collected_by_other_input', { required: true })}
                                                    className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200 shadow-sm font-medium placeholder:text-slate-400"
                                                    placeholder="Enter Name"
                                                />
                                            )}
                                        </div>
                                    );
                                }

                                if (col.toLowerCase().includes('expiry date')) {
                                    return (
                                        <div key={col} className="space-y-2">
                                            <label className="block text-sm font-semibold text-slate-700 capitalize">{col}</label>
                                            <input
                                                type="date"
                                                min={new Date().toISOString().split('T')[0]} // Must be after today (or today)
                                                {...register(fieldKey)}
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200 shadow-sm font-medium placeholder:text-slate-400"
                                            />
                                        </div>
                                    );
                                }

                                if (col.toLowerCase().includes('dob') || col.toLowerCase().includes('date of birth') || col.toLowerCase().includes('date')) {
                                    return (
                                        <div key={col} className="space-y-2">
                                            <label className="block text-sm font-semibold text-slate-700 capitalize">{col}</label>
                                            <input
                                                type="date"
                                                max={new Date().toISOString().split('T')[0]} // Must be before today (or today)
                                                {...register(fieldKey)}
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200 shadow-sm font-medium placeholder:text-slate-400"
                                            />
                                        </div>
                                    );
                                }

                                if (col.toLowerCase().includes('ifsc')) {
                                    return (
                                        <div key={col} className="space-y-2">
                                            <label className="block text-sm font-semibold text-slate-700 capitalize">
                                                {col}
                                            </label>
                                            <input
                                                {...register(fieldKey)}
                                                onChange={(e) => {
                                                    const val = e.target.value.toUpperCase();
                                                    setValue(fieldKey, val);
                                                }}
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200 shadow-sm font-medium placeholder:text-slate-400 uppercase"
                                                placeholder={`Enter ${col}`}
                                            />
                                        </div>
                                    );
                                }

                                if (col.toLowerCase().includes('saudi arabia')) {
                                    return (
                                        <div key={col} className="space-y-2">
                                            <label className="block text-sm font-semibold text-slate-700">
                                                Are you someone who previously went to Saudi Arabia, got into legal issues there, and then returned back to your home country?
                                            </label>
                                            <select
                                                {...register(fieldKey)}
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200 shadow-sm font-medium"
                                            >
                                                <option value="">Select Option</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                        </div>
                                    );
                                }

                                if (col.toLowerCase().includes('hajj done before')) {
                                    return (
                                        <div key={col} className="space-y-2">
                                            <label className="block text-sm font-semibold text-slate-700 capitalize">
                                                {col}
                                            </label>
                                            <select
                                                {...register(fieldKey)}
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200 shadow-sm font-medium"
                                            >
                                                <option value="">Select Option</option>
                                                <option value="no">no</option>
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="more">more</option>
                                            </select>
                                        </div>
                                    );
                                }

                                if (col.toLowerCase().includes('passport no')) {
                                    return (
                                        <div key={col} className="space-y-2">
                                            <label className="block text-sm font-semibold text-slate-700 capitalize">
                                                {col} <span className="text-indigo-600">*</span>
                                            </label>
                                            <input
                                                {...register(fieldKey, { required: true })}
                                                onChange={(e) => {
                                                    const val = e.target.value.toUpperCase();
                                                    setValue(fieldKey, val);
                                                }}
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200 shadow-sm font-medium placeholder:text-slate-400 uppercase"
                                                placeholder={`Enter ${col}`}
                                            />
                                            {errors[fieldKey] && <span className="text-xs font-medium text-red-500 flex items-center mt-1">
                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                This field is required
                                            </span>}
                                        </div>
                                    );
                                }

                                if (col.toLowerCase() === 'age') {
                                    return (
                                        <div key={col} className="space-y-2">
                                            <label className="block text-sm font-semibold text-slate-700 capitalize">
                                                {col}
                                            </label>
                                            <input
                                                type="number"
                                                max="100"
                                                {...register(fieldKey)}
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200 shadow-sm font-medium placeholder:text-slate-400"
                                                placeholder={`Enter ${col}`}
                                            />
                                        </div>
                                    );
                                }

                                return (
                                    <div key={col} className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700 capitalize">
                                            {col} {isRequired && <span className="text-indigo-600">*</span>}
                                        </label>

                                        {isSelectColumn(col) ? (
                                            <select
                                                {...register(fieldKey, { required: isRequired })}
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200 shadow-sm font-medium"
                                            >
                                                <option value="">Select Sex</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        ) : (
                                            <input
                                                type={getInputType(col)}
                                                {...register(fieldKey, { required: isRequired })}
                                                className="block w-full rounded-xl border-slate-200 bg-slate-50/50 px-4 py-2 text-slate-900 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all duration-200 shadow-sm font-medium placeholder:text-slate-400"
                                                placeholder={`Enter ${col}`}
                                            />
                                        )}

                                        {errors[fieldKey] && <span className="text-xs font-medium text-red-500 flex items-center mt-1">
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            This field is required
                                        </span>}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="border-t border-slate-100 pt-8 space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-slate-900">Document Uploads (Optional updates)</h3>
                                <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">Images & PDFs</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* 1. Person Photo */}
                                <FileUploader
                                    label="Person Photo (Passport Size)"
                                    file={filePerson}
                                    setFile={setFilePerson}
                                    existingUrl={initialData?.['photo (passport size)']}
                                    onDelete={async () => {
                                        if (!initialData?.['photo (passport size)']) return;
                                        await handleDeleteImage(initialData['photo (passport size)'], 'photo (passport size)');
                                    }}
                                    color="indigo"
                                    icon={
                                        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    }
                                />

                                {/* 2. Front Copy */}
                                <FileUploader
                                    label="Passport (Front)"
                                    file={fileFront}
                                    setFile={setFileFront}
                                    existingUrl={initialData?.['passport photo (front)']}
                                    onDelete={async () => {
                                        if (!initialData?.['passport photo (front)']) return;
                                        await handleDeleteImage(initialData['passport photo (front)'], 'passport photo (front)');
                                    }}
                                    color="blue"
                                    icon={
                                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    }
                                />

                                {/* 3. Back Copy */}
                                <FileUploader
                                    label="Passport (Back)"
                                    file={fileBack}
                                    setFile={setFileBack}
                                    existingUrl={initialData?.['passport photo (back)']}
                                    onDelete={async () => {
                                        if (!initialData?.['passport photo (back)']) return;
                                        await handleDeleteImage(initialData['passport photo (back)'], 'passport photo (back)');
                                    }}
                                    color="purple"
                                    icon={
                                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                    }
                                />

                                {/* 4. Aadhar Front */}
                                <FileUploader
                                    label="Aadhar Image (Front)"
                                    file={fileAadharFront}
                                    setFile={setFileAadharFront}
                                    existingUrl={initialData?.['Aadhar Image (front)']}
                                    onDelete={async () => {
                                        if (!initialData?.['Aadhar Image (front)']) return;
                                        await handleDeleteImage(initialData['Aadhar Image (front)'], 'Aadhar Image (front)');
                                    }}
                                    color="green"
                                    icon={
                                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                        </svg>
                                    }
                                />

                                {/* 5. Aadhar Back */}
                                <FileUploader
                                    label="Aadhar Image (Back)"
                                    file={fileAadharBack}
                                    setFile={setFileAadharBack}
                                    existingUrl={initialData?.['Aadhar Image (back)']}
                                    onDelete={async () => {
                                        if (!initialData?.['Aadhar Image (back)']) return;
                                        await handleDeleteImage(initialData['Aadhar Image (back)'], 'Aadhar Image (back)');
                                    }}
                                    color="green"
                                    icon={
                                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                        </svg>
                                    }
                                />

                                {/* 6. Pan Card */}
                                <FileUploader
                                    label="Pan Card Image"
                                    file={filePancard}
                                    setFile={setFilePancard}
                                    existingUrl={initialData?.['pancard image']}
                                    onDelete={async () => {
                                        if (!initialData?.['pancard image']) return;
                                        await handleDeleteImage(initialData['pancard image'], 'pancard image');
                                    }}
                                    color="orange"
                                    icon={
                                        <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    }
                                />

                                {/* 7. Bank Passbook */}
                                <FileUploader
                                    label="Bank Passbook"
                                    file={filePassbook}
                                    setFile={setFilePassbook}
                                    existingUrl={initialData?.['bank pasbook']}
                                    onDelete={async () => {
                                        if (!initialData?.['bank pasbook']) return;
                                        await handleDeleteImage(initialData['bank pasbook'], 'bank pasbook');
                                    }}
                                    color="red"
                                    icon={
                                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                        </svg>
                                    }
                                />

                                {/* 8. Medical Documents */}
                                <FileUploader
                                    label="Medical Documents (If any)"
                                    file={fileMedical}
                                    setFile={setFileMedical}
                                    existingUrl={initialData?.['Medical Documents (If any)']}
                                    onDelete={async () => {
                                        if (!initialData?.['Medical Documents (If any)']) return;
                                        await handleDeleteImage(initialData['Medical Documents (If any)'], 'Medical Documents (If any)');
                                    }}
                                    color="teal"
                                    icon={
                                        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    }
                                />
                            </div>
                        </div>

                        <div className="pt-6 space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="flex h-6 items-center">
                                    <input
                                        id="declaration"
                                        name="declaration"
                                        type="checkbox"
                                        checked={declarationChecked}
                                        onChange={(e) => setDeclarationChecked(e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                                    />
                                </div>
                                <div className="text-sm leading-6">
                                    <label htmlFor="declaration" className="font-medium text-slate-900">
                                        I certify that the information provided is true and correct to the best of my knowledge. I understand that any inaccuracies may result in the disqualification or termination of my application.                                    </label>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting || uploading || !declarationChecked}
                                className="w-full py-4 px-6 text-white bg-slate-900 hover:bg-slate-800 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 flex justify-center items-center ring-offset-2 focus:ring-2 focus:ring-slate-900"
                            >
                                {uploading ? (
                                    <span className="flex items-center gap-3">
                                        <svg className="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {statusMsg || 'Processing Uploads...'}
                                    </span>
                                ) : isSubmitting ? (
                                    <span className="flex items-center gap-3">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving Updates...
                                    </span>
                                ) : (
                                    'Update Entry'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div >
        </main >
    );
}

export default function EditPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EditForm />
        </Suspense>
    );
}
