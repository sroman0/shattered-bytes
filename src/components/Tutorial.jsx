import { useState } from 'react';

const TUTORIAL_STEPS = [
  {
    title: 'Welcome to Shattered Bytes',
    icon: '🔬',
    content: 'You are a digital forensic investigator. Your mission: recover deleted files from raw disk images by analyzing hex data, recognizing file signatures, and carving evidence.',
    tip: 'Each case builds on new forensic skills. Take your time to understand the concepts.',
  },
  {
    title: 'The Hex Editor',
    icon: '📊',
    content: 'The center panel displays the raw bytes of the forensic image. Each row shows 16 bytes with their hex values and ASCII interpretation. Use the page navigation arrows to browse the dump.',
    tip: 'File signatures appear as recognizable hex patterns — learn to spot them!',
  },
  {
    title: 'Selecting & Stashing Bytes',
    icon: '🎯',
    content: 'Select bytes by dragging, by shift-clicking the endpoint, or by entering start/end offsets in Range Select. Then click "Stash" to add the selection to your Workbench. You can stash multiple fragments and reorder them by dragging.',
    tip: 'For long ranges, use Range Select or the terminal command select <start> <end> so exact boundaries do not depend on scrolling.',
  },
  {
    title: 'The Terminal',
    icon: '💻',
    content: 'The terminal on the right provides forensic commands. Use "search <hex>" to find patterns, "go <offset>" to navigate, "select <start> <end>" for exact ranges, "entropy" for anomaly triage, "info" for level metadata, and "hint" for guidance.',
    tip: 'Type "help" in the terminal to see all available commands.',
  },
  {
    title: 'Composing & Carving',
    icon: '🧩',
    content: 'Once you have stashed the correct byte ranges in order, click "Compose & Carve" to reconstruct the file. The result appears in the Asset Viewer below the hex editor.',
    tip: 'For fragmented files, the order of stashed fragments matters!',
  },
  {
    title: 'Submitting Your Report',
    icon: '📋',
    content: 'After a successful carve, submit your forensic conclusion via the terminal: "report recovered" for full recovery, or "report partial" for incomplete evidence.',
    tip: 'Overclaiming evidence undermines forensic integrity — choose accurately.',
  },
  {
    title: 'Scoring & Objectives',
    icon: '⭐',
    content: 'Each case has specific objectives shown in the sidebar. Using hints (-15 pts), making bad selections (-25 pts), and extra carve attempts (-30 pts) reduce your score. Speed bonuses reward efficiency.',
    tip: 'Check the Signature Reference panel for known file magic numbers.',
  },
];

export default function Tutorial({ onComplete }) {
  const [step, setStep] = useState(0);
  const current = TUTORIAL_STEPS[step];
  const total = TUTORIAL_STEPS.length;

  return (
    <div className="fixed inset-0 bg-black/80 z-[90] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-gray-900 border border-cyan-500/30 rounded-xl p-6 max-w-lg w-full mx-4"
        style={{ boxShadow: '0 0 40px rgba(6,182,212,0.1)' }}>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-5">
          {TUTORIAL_STEPS.map((_, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === step ? 'bg-cyan-400 scale-125' : i < step ? 'bg-cyan-700' : 'bg-gray-700'
            }`} />
          ))}
        </div>

        {/* Step counter */}
        <div className="text-center text-[10px] text-gray-600 uppercase tracking-widest mb-4">
          Step {step + 1} / {total}
        </div>

        {/* Icon */}
        <div className="text-center text-4xl mb-3">{current.icon}</div>

        {/* Title */}
        <h2 className="text-lg font-bold text-cyan-400 text-center mb-3 tracking-wide">
          {current.title}
        </h2>

        {/* Content */}
        <p className="text-sm text-gray-300 leading-relaxed mb-4 text-center">
          {current.content}
        </p>

        {/* Tip box */}
        <div className="bg-cyan-950/30 border border-cyan-800/30 rounded-lg px-4 py-3 mb-6">
          <div className="text-[10px] text-cyan-600 uppercase tracking-wider mb-1 font-bold">
            💡 Tip
          </div>
          <p className="text-xs text-cyan-300/80">{current.tip}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onComplete()}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            ▷ Skip Tutorial
          </button>

          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg text-xs transition-all"
              >
                ‹ Back
              </button>
            )}
            <button
              onClick={() => step < total - 1 ? setStep(s => s + 1) : onComplete()}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs transition-all tracking-wider"
            >
              {step < total - 1 ? 'Next ›' : 'Start Playing'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
