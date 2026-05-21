import { useState, useEffect, useRef } from 'react';

/**
 * ObjectiveToast - shows a brief animated notification when an objective is completed.
 * Monitors the objectives array and detects transitions from incomplete → completed.
 */
export default function ObjectiveToast({ objectives }) {
  const [toasts, setToasts] = useState([]);
  const prevObjectivesRef = useRef(null);
  const idCounter = useRef(0);

  useEffect(() => {
    if (!objectives || objectives.length === 0) return;

    const prev = prevObjectivesRef.current;
    prevObjectivesRef.current = objectives.map(o => ({ ...o }));

    // Skip first render (no comparison)
    if (!prev) return;

    // Detect newly completed objectives
    objectives.forEach((obj, i) => {
      if (obj.completed && prev[i] && !prev[i].completed) {
        const id = ++idCounter.current;
        setToasts(t => [...t, { id, text: obj.text }]);

        // Auto-remove after 3.5s
        setTimeout(() => {
          setToasts(t => t.filter(toast => toast.id !== id));
        }, 3500);
      }
    });
  }, [objectives]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-40 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="animate-slide-in-right bg-green-950/90 border border-green-500/50 rounded-lg px-4 py-3 max-w-sm backdrop-blur-sm"
          style={{
            boxShadow: '0 0 20px rgba(74,222,128,0.2), 0 0 40px rgba(74,222,128,0.05)',
            animation: 'slideInRight 0.35s ease-out, fadeOut 0.5s ease-in 3s forwards',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-lg">✓</span>
            <div>
              <div className="text-[9px] text-green-500 uppercase tracking-[0.2em] font-bold">
                Objective Complete
              </div>
              <div className="text-xs text-green-300/90 mt-0.5 leading-tight">
                {toast.text}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
