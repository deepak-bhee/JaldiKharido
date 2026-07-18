import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [smsAlert, setSmsAlert] = useState(null);

  // General Spring Toast Notification
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // Phone SMS Simulation Notification (Push-style Banner Alert)
  const showSmsNotification = useCallback((phone, message) => {
    setSmsAlert({ phone, message });
    setTimeout(() => setSmsAlert(null), 7000);
  }, []);

  const toastAnimations = {
    initial: { scale: 0.8, opacity: 0, y: 30 },
    animate: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.8, opacity: 0, y: -20 },
    transition: { type: "spring", stiffness: 380, damping: 30 }
  };

  return (
    <ToastContext.Provider value={{ showToast, showSmsNotification }}>
      {children}

      {/* 1. Global Spring-Animated Toast List (Framer Motion List Items) */}
      <div className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              {...toastAnimations}
              layout
              onClick={() => removeToast(t.id)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-semibold cursor-pointer
                shadow-[0_8px_30px_rgba(0,0,0,0.5)] border backdrop-blur-xl transition-all duration-300
                ${t.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : ''}
                ${t.type === 'error'   ? 'bg-red-500/10   border-red-500/20   text-red-400'   : ''}
                ${t.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : ''}
                ${t.type === 'info'    ? 'bg-brand/10 border-brand/20 text-brand-light'  : ''}
              `}
            >
              <span className="text-base flex-shrink-0">
                {t.type === 'success' && '✅'}
                {t.type === 'error'   && '❌'}
                {t.type === 'warning' && '⚠️'}
                {t.type === 'info'    && '🛍️'}
              </span>
              <span className="flex-1 leading-snug">{t.message}</span>
              <span className="opacity-40 hover:opacity-100 text-[10px] flex-shrink-0">✕</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 2. Mock iOS Push Banner (SMS Alert Overlay) */}
      <AnimatePresence>
        {smsAlert && (
          <motion.div
            initial={{ y: -120, opacity: 0, scale: 0.85, x: "-50%" }}
            animate={{ y: 24, opacity: 1, scale: 1, x: "-50%" }}
            exit={{ y: -120, opacity: 0, scale: 0.85, x: "-50%" }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="fixed top-0 left-1/2 z-[10000] w-full max-w-sm px-4"
          >
            <div className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-[24px] p-4 shadow-[0_24px_50px_rgba(0,0,0,0.8)] flex gap-3 text-left">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-lg shadow-glow flex-shrink-0">
                💬
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center text-[9px] font-black text-slate-500 tracking-wider uppercase">
                  <span>Messages</span>
                  <span>now</span>
                </div>
                <div className="text-xs font-bold text-white mt-0.5">To: {smsAlert.phone}</div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed font-medium">
                  {smsAlert.message}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
