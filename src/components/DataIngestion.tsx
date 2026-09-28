import React from 'react';
import { Upload, Fingerprint, Loader2, FileText, TrendingUp } from 'lucide-react';
import { DropzoneRootProps, DropzoneInputProps } from 'react-dropzone';

interface DataIngestionProps {
  apiMode: boolean;
  setApiMode: (mode: boolean) => void;
  bureauApiKey: string;
  setBureauApiKey: (key: string) => void;
  getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
  isDragActive: boolean;
  loading: boolean;
  files: File[];
  handleAnalyze: () => void;
}

export const DataIngestion: React.FC<DataIngestionProps> = ({
  apiMode,
  setApiMode,
  bureauApiKey,
  setBureauApiKey,
  getRootProps,
  getInputProps,
  isDragActive,
  loading,
  files,
  handleAnalyze,
}) => {
  return (
    <>
      <div className="text-amber-500 mb-4 animate-pulse">
        <Upload className="w-12 h-12" />
      </div>
      <h2 className="text-xl text-zinc-100 uppercase tracking-widest mb-2">
        Initialize Data Ingestion
      </h2>
      <p className="text-zinc-500 mb-8 text-center max-w-md">
        Upload financial documents (PDF, Image) for automated extraction, verification, and risk
        analysis.
      </p>

      {/* Bureau Integrations Panel */}
      <div className="w-full max-w-2xl border border-zinc-800 bg-black p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Bureau Integrations
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] font-medium uppercase tracking-tighter ${!apiMode ? 'text-amber-500' : 'text-zinc-600'}`}
            >
              Gemini Generated (Mock)
            </span>
            <button type="button"
              onClick={() => setApiMode(!apiMode)}
              className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${
                apiMode ? 'bg-amber-600' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                  apiMode ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-[10px] font-medium uppercase tracking-tighter ${apiMode ? 'text-amber-500' : 'text-zinc-600'}`}
            >
              Real API
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest">
            External Bureau API Key
          </label>
          <input
            type="password"
            value={bureauApiKey}
            onChange={(e) => setBureauApiKey(e.target.value)}
            placeholder="Enter your API key for real-time bureau checks..."
            className="w-full px-3 py-2 bg-[#050505] border border-zinc-800 text-zinc-300 text-xs focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-zinc-700"
          />
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`w-full max-w-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-amber-500 bg-amber-500/5'
            : 'border-zinc-800 hover:border-zinc-600 bg-black'
        }`}
      >
        <input {...getInputProps()} />
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <p className="text-amber-500 uppercase tracking-widest animate-pulse">
              Processing & Verifying Data...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-zinc-400 uppercase tracking-wider">
              Drag & drop files here, or click to select
            </p>
            <p className="text-zinc-600 text-xs mt-2">Supported: PDF, JPEG, PNG</p>
          </div>
        )}
      </div>

      {files.length > 0 && !loading && (
        <div className="mt-4 w-full max-w-2xl">
          <p className="text-zinc-400 text-xs uppercase mb-2">Uploaded Documents:</p>
          <ul className="space-y-1">
            {files.map((f, i) => (
              <li key={i} className="text-zinc-500 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {f.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {files.length > 0 && !loading && (
        <button type="button"
          onClick={handleAnalyze}
          className="mt-6 border border-amber-500 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black px-8 py-3 uppercase tracking-widest font-bold transition-colors flex items-center gap-2"
        >
          <TrendingUp className="w-5 h-5" />
          Execute Analysis
        </button>
      )}
    </>
  );
};
export default DataIngestion;
