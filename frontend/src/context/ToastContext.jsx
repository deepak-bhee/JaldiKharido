import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            className={`toast-enter flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer
              shadow-lg border backdrop-blur-md
              ${t.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-300' : ''}
              ${t.type === 'error'   ? 'bg-red-500/10   border-red-500/30   text-red-300'   : ''}
              ${t.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' : ''}
              ${t.type === 'info'    ? 'bg-blue-500/10  border-blue-500/30  text-blue-300'  : ''}
            `}
          >
            <span>
              {t.type === 'success' && '✅'}
              {t.type === 'error'   && '❌'}
              {t.type === 'warning' && '⚠️'}
              {t.type === 'info'    && 'ℹ️'}
            </span>
            <span className="flex-1">{t.message}</span>
            <span className="opacity-50 text-xs">✕</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
