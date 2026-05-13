import { useRef, useEffect } from 'react';

export default function InvestigationTimeline({ events }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events.length]);

  if (events.length === 0) return null;

  const getEventColor = (type) => {
    switch (type) {
      case 'search': return 'border-purple-500 bg-purple-500';
      case 'navigate': return 'border-blue-500 bg-blue-500';
      case 'stash': return 'border-cyan-500 bg-cyan-500';
      case 'carve': return 'border-green-500 bg-green-500';
      case 'xor': return 'border-yellow-500 bg-yellow-500';
      case 'report': return 'border-emerald-400 bg-emerald-400';
      case 'hint': return 'border-orange-500 bg-orange-500';
      case 'error': return 'border-red-500 bg-red-500';
      default: return 'border-gray-500 bg-gray-500';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'search': return '🔍';
      case 'navigate': return '➜';
      case 'stash': return '📦';
      case 'carve': return '🔧';
      case 'xor': return '🔑';
      case 'report': return '📋';
      case 'hint': return '💡';
      case 'error': return '⚠️';
      default: return '•';
    }
  };

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-lg overflow-hidden shrink-0">
      <div className="px-4 py-2.5 border-b border-gray-800 bg-gray-900">
        <h2 className="text-xs font-bold tracking-widest text-cyan-400 uppercase flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Investigation Timeline
          <span className="text-gray-600 font-normal">({events.length})</span>
        </h2>
      </div>

      <div className="p-3 max-h-40 overflow-y-auto">
        <div className="relative pl-5 space-y-2">
          {/* Vertical timeline line */}
          <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gray-800" />

          {events.map((event, i) => (
            <div key={event.id || i} className="relative flex items-start gap-2.5">
              {/* Timeline dot */}
              <div className={`absolute -left-[13px] top-1 w-2 h-2 rounded-full border ${getEventColor(event.type)}`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px]">{getEventIcon(event.type)}</span>
                  <span className="text-[10px] text-gray-500 tabular-nums shrink-0">{event.time}</span>
                </div>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">{event.text}</p>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
}
