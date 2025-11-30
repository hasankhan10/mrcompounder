import React, { useRef, useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    onChange: (file: File | null) => void;
    value?: File | null;
    accept?: string;
    className?: string;
    label?: string;
}

export function FileUpload({ onChange, value, accept, className, label = "SVG, PNG, JPG or GIF" }: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onChange(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            onChange(e.target.files[0]);
        }
    };

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className={cn("w-full", className)}>
            <div
                className={cn(
                    "relative flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden group",
                    dragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300",
                    value ? "border-green-500 bg-green-50" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleChange}
                />

                {value ? (
                    <div className="flex items-center gap-3 p-4 w-full h-full animate-fade-in">
                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100 flex-shrink-0">
                            {value.type.startsWith('image/') ? (
                                <img src={URL.createObjectURL(value)} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <FileText className="w-6 h-6 text-blue-500" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-gray-900 truncate">{value.name}</p>
                            <p className="text-xs text-gray-500">{(value.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                            onClick={removeFile}
                            className="p-1.5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                        <div className="w-10 h-10 mb-3 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <Upload className="w-5 h-5" />
                        </div>
                        <p className="mb-1 text-sm text-gray-600 font-medium">
                            <span className="text-blue-600 hover:underline">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">{label}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
