import { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';

export default function FileUploader({ onFileUploaded }: { onFileUploaded: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUploaded(e.dataTransfer.files[0]);
    }
  }, [onFileUploaded]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center gap-4 transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'
      }`}
    >
      <Upload size={48} className="text-slate-400" />
      <div className="text-center">
        <p className="font-semibold text-lg">Drag & Drop Quality Data File</p>
        <p className="text-sm text-slate-500">or click to upload Excel/CSV</p>
      </div>
      <input type="file" className="hidden" id="file-upload" onChange={(e) => e.target.files && onFileUploaded(e.target.files[0])} />
      <label htmlFor="file-upload" className="bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700">
        Browse Files
      </label>
    </div>
  );
}
