import React from 'react';
import { AppError } from '../types';
import { AlertTriangle, ChevronRight } from 'lucide-react';

interface ErrorDisplayProps {
  error: AppError | null;
  setError: (error: AppError | null) => void;
  showLogs: boolean;
  setShowLogs: (show: boolean) => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  setError,
  showLogs,
  setShowLogs,
}) => {
  if (!error) return null;

  return (
    <div className="mt-6 border border-rose-900 bg-rose-950/30 p-4 w-full max-w-2xl">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-rose-500 font-bold uppercase tracking-widest text-xs">
              {error.type.replace('_', ' ')}: {error.message}
            </h3>
            <span className="text-[10px] text-rose-900 font-mono">CODE: {error.type}</span>
          </div>
          {error.details && (
            <p className="text-rose-400/80 text-[11px] leading-relaxed font-mono">
              {error.details}
            </p>
          )}
          {error.action && (
            <div className="pt-2 flex items-center gap-2">
              <div className="h-1 w-1 bg-amber-500 rounded-full animate-pulse" />
              <p className="text-amber-500 text-[10px] uppercase tracking-wider font-bold">
                Suggested Action: {error.action}
              </p>
            </div>
          )}

          {error.rawLogs && (
            <div className="mt-4 border-t border-rose-900/30 pt-3">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="flex items-center gap-2 text-[10px] text-rose-400/60 hover:text-rose-400 uppercase tracking-widest transition-colors"
              >
                <ChevronRight
                  className={`w-3 h-3 transition-transform ${showLogs ? 'rotate-90' : ''}`}
                />
                {showLogs ? 'Hide Technical Logs' : 'View Technical Logs'}
              </button>

              {showLogs && (
                <div className="mt-2 bg-black/50 p-3 border border-rose-900/20 overflow-x-auto">
                  <pre className="text-[9px] text-rose-400/70 font-mono leading-tight whitespace-pre-wrap break-all">
                    {error.rawLogs}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => {
          setError(null);
          setShowLogs(false);
        }}
        className="mt-4 w-full py-1 border border-rose-900/50 hover:bg-rose-900/20 text-rose-500 text-[10px] uppercase tracking-widest transition-colors"
      >
        Dismiss Error
      </button>
    </div>
  );
};
export default ErrorDisplay;
