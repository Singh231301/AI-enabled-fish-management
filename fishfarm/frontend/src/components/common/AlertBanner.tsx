import React from 'react';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

interface AlertBannerProps {
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type,
  title,
  message,
  actionLabel,
  onAction,
  onDismiss
}) => {
  const styles = {
    danger: {
      container: 'bg-red-500/10 border-l-4 border-red-500',
      icon: <AlertTriangle className="text-red-500" size={24} />,
      title: 'text-red-200',
      text: 'text-red-300',
      button: 'bg-red-500 hover:bg-red-600 text-white',
      dismiss: 'text-red-400 hover:bg-red-500/20'
    },
    warning: {
      container: 'bg-amber-500/10 border-l-4 border-amber-500',
      icon: <AlertTriangle className="text-amber-500" size={24} />,
      title: 'text-amber-200',
      text: 'text-amber-300',
      button: 'bg-amber-500 hover:bg-amber-600 text-slate-900',
      dismiss: 'text-amber-400 hover:bg-amber-500/20'
    },
    info: {
      container: 'bg-sky-500/10 border-l-4 border-sky-500',
      icon: <Info className="text-sky-500" size={24} />,
      title: 'text-sky-200',
      text: 'text-sky-300',
      button: 'bg-sky-500 hover:bg-sky-600 text-white',
      dismiss: 'text-sky-400 hover:bg-sky-500/20'
    },
    success: {
      container: 'bg-green-500/10 border-l-4 border-green-500',
      icon: <CheckCircle className="text-green-500" size={24} />,
      title: 'text-green-200',
      text: 'text-green-300',
      button: 'bg-green-500 hover:bg-green-600 text-white',
      dismiss: 'text-green-400 hover:bg-green-500/20'
    }
  };

  const style = styles[type];

  return (
    <div className={`relative p-4 rounded-r-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${style.container}`}>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`absolute top-2 right-2 p-1 rounded-lg transition-colors ${style.dismiss} sm:hidden`}
          aria-label="Dismiss alert"
        >
          <X size={18} />
        </button>
      )}

      <div className="flex gap-3 sm:gap-4 items-start sm:items-center w-full pr-6 sm:pr-0">
        <div className="shrink-0 mt-0.5 sm:mt-0">{style.icon}</div>
        <div className="flex-1">
          <h4 className={`font-semibold ${style.title}`}>{title}</h4>
          <p className={`text-sm mt-1 ${style.text}`}>{message}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className={`text-sm font-medium px-4 py-2 sm:py-1.5 rounded-lg transition-colors whitespace-nowrap w-full sm:w-auto text-center ${style.button}`}
          >
            {actionLabel}
          </button>
        )}
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`hidden sm:block p-1.5 rounded-lg transition-colors ${style.dismiss}`}
            aria-label="Dismiss alert"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
