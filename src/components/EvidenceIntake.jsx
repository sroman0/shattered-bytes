import { useMemo, useState } from 'react';
import labBackground from '../../assets/lab_intake_background.webp';
import sealedDrive from '../../assets/sealed_evidence_drive_cutout.png';
import writeBlocker from '../../assets/write_blocker_device_cutout.png';
import workstation from '../../assets/forensic_workstation_cutout.png';
import hashCard from '../../assets/hash_verification_card_cutout.png';

const tools = [
  {
    id: 'drive',
    label: 'Sealed drive',
    image: sealedDrive,
  },
  {
    id: 'blocker',
    label: 'Write blocker',
    image: writeBlocker,
  },
  {
    id: 'workstation',
    label: 'Forensic workstation',
    image: workstation,
  },
  {
    id: 'hash',
    label: 'Hash verification',
    image: hashCard,
  },
];

const shuffleItems = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

function ToolPreview({ tool, className = '' }) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded border border-cyan-900/40 bg-gray-950/55 ${className}`}>
      <img
        src={tool.image}
        alt={tool.label}
        className="h-full w-full object-contain p-1.5"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-cyan-400/35" />
    </div>
  );
}

const setCustomDragImage = (event, tool) => {
  if (!event.dataTransfer || !tool) return;

  const preview = document.createElement('div');
  preview.style.cssText = [
    'position: fixed',
    'top: -1000px',
    'left: -1000px',
    'width: 190px',
    'height: 86px',
    'display: flex',
    'align-items: center',
    'gap: 10px',
    'padding: 8px',
    'border: 1px solid rgba(34, 211, 238, 0.65)',
    'border-radius: 8px',
    'background: rgba(2, 6, 23, 0.94)',
    'box-shadow: 0 0 24px rgba(34, 211, 238, 0.22)',
    'color: #e5e7eb',
    'font: 700 12px monospace',
    'z-index: 9999',
    'pointer-events: none',
  ].join(';');

  const img = document.createElement('img');
  img.src = tool.image;
  img.alt = '';
  img.style.cssText = [
    'width: 72px',
    'height: 56px',
    'object-fit: cover',
    'border-radius: 4px',
    'border: 1px solid rgba(14, 165, 233, 0.35)',
  ].join(';');

  const label = document.createElement('div');
  label.textContent = tool.label;
  label.style.cssText = 'line-height: 1.25; max-width: 92px';

  preview.appendChild(img);
  preview.appendChild(label);
  document.body.appendChild(preview);
  event.dataTransfer.setDragImage(preview, 96, 43);
  window.setTimeout(() => preview.remove(), 0);
};

const workflow = [
  {
    id: 'source',
    label: '???',
    expected: 'drive',
    accepted: 'Original media remains sealed and identified.',
  },
  {
    id: 'protection',
    label: '???',
    expected: 'blocker',
    accepted: 'Write blocker placed between source and workstation.',
  },
  {
    id: 'imaging',
    label: '???',
    expected: 'workstation',
    accepted: 'Analysis will run on a controlled forensic image.',
  },
  {
    id: 'integrity',
    label: '???',
    expected: 'hash',
    accepted: 'Hash verification recorded before investigation.',
  },
];

export default function EvidenceIntake({ onComplete }) {
  const [shuffledTools, setShuffledTools] = useState(() => shuffleItems(tools));
  const [selectedTool, setSelectedTool] = useState(null);
  const [draggedTool, setDraggedTool] = useState(null);
  const [slots, setSlots] = useState({});
  const [notice, setNotice] = useState('Prepare the evidence path before opening the first case.');
  const [riskCount, setRiskCount] = useState(0);

  const selected = useMemo(
    () => tools.find(tool => tool.id === selectedTool),
    [selectedTool],
  );

  const completed = workflow.every(step => slots[step.id] === step.expected);

  const placeTool = (step, toolId = selectedTool) => {
    if (!toolId) {
      setNotice('Select a lab item first.');
      return;
    }

    if (slots[step.id]) {
      setNotice(`${step.label} is already documented.`);
      return;
    }

    if (toolId !== step.expected) {
      setRiskCount(prev => prev + 1);
      setNotice('Procedure risk: this item belongs to a different point of the intake chain.');
      return;
    }

    setSlots(prev => ({ ...prev, [step.id]: toolId }));
    setSelectedTool(null);
    setDraggedTool(null);
    setNotice(step.accepted);
  };

  const startToolDrag = (event, toolId) => {
    const tool = tools.find(item => item.id === toolId);
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/x-shattered-tool', toolId);
    setCustomDragImage(event, tool);
    setDraggedTool(toolId);
    setSelectedTool(toolId);
  };

  const dropTool = (event, step) => {
    event.preventDefault();
    const toolId = event.dataTransfer.getData('application/x-shattered-tool') || draggedTool;
    placeTool(step, toolId);
  };

  const reset = () => {
    setSelectedTool(null);
    setDraggedTool(null);
    setSlots({});
    setShuffledTools(shuffleItems(tools));
    setNotice('Prepare the evidence path before opening the first case.');
    setRiskCount(0);
  };

  return (
    <div className="fixed inset-0 z-[80] bg-gray-950 text-gray-100 font-mono overflow-hidden">
      <img
        src={labBackground}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-75 brightness-75 contrast-110"
      />
      <div className="absolute inset-0 bg-gray-950/48" />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/25 via-transparent to-gray-950/70" />

      <div className="relative h-full flex flex-col p-5 lg:p-7">
        <header className="flex items-start justify-between gap-4 border-b border-cyan-900/40 pb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.34em] text-cyan-500 font-bold">
              Evidence Intake
            </div>
            <h1 className="mt-1 text-2xl lg:text-3xl font-black tracking-[0.16em] text-green-300 uppercase">
              Lab Preparation
            </h1>
          </div>
          <div className="rounded border border-gray-700/80 bg-gray-950/80 px-3 py-2 text-right">
            <div className="text-[10px] uppercase tracking-wider text-gray-500">Procedure risks</div>
            <div className={`text-lg font-black ${riskCount ? 'text-amber-300' : 'text-green-300'}`}>
              {riskCount}
            </div>
          </div>
        </header>

        <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 py-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <section className="rounded-lg border border-gray-800 bg-gray-950/72 p-3 backdrop-blur-[2px]">
            <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-cyan-500 font-bold">
              Lab items
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              {shuffledTools.map(tool => (
                <button
                  key={tool.id}
                  type="button"
                  draggable
                  onClick={() => setSelectedTool(tool.id)}
                  onDragStart={(event) => startToolDrag(event, tool.id)}
                  onDragEnd={() => setDraggedTool(null)}
                  className={`group flex min-h-[94px] items-center gap-3 rounded-md border p-2 text-left transition-all
                    ${selectedTool === tool.id || draggedTool === tool.id
                      ? 'border-green-500/80 bg-green-950/35 shadow-[0_0_18px_rgba(34,197,94,0.16)]'
                      : 'border-gray-800 bg-gray-900/70 hover:border-cyan-700/70 hover:bg-cyan-950/25'
                    }`}
                >
                  <ToolPreview tool={tool} className="h-16 w-20" />
                  <span className="text-xs font-bold text-gray-200">{tool.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="min-h-0 rounded-lg border border-gray-800 bg-gray-950/72 p-4 backdrop-blur-[2px]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-green-500 font-bold">
                  Chain setup
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  {selected ? `Selected: ${selected.label}` : 'Select an item, then place it in the correct step.'}
                </div>
              </div>
              <button
                type="button"
                onClick={reset}
                className="rounded border border-gray-700 bg-gray-900 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:border-cyan-700 hover:text-cyan-200"
              >
                Reset
              </button>
            </div>

            <div className="grid gap-3 lg:grid-cols-4">
              {workflow.map((step, idx) => {
                const placedTool = tools.find(tool => tool.id === slots[step.id]);
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => placeTool(step)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = 'copy';
                    }}
                    onDrop={(event) => dropTool(event, step)}
                    className={`relative flex min-h-[220px] flex-col items-center justify-center rounded-lg border p-3 text-center transition-all
                      ${placedTool
                        ? 'border-green-600/70 bg-green-950/25'
                        : draggedTool
                          ? 'border-dashed border-cyan-500/80 bg-cyan-950/25'
                          : 'border-dashed border-gray-700 bg-gray-900/55 hover:border-cyan-600 hover:bg-cyan-950/20'
                      }`}
                  >
                    <div className="absolute left-3 top-3 text-[10px] text-gray-500">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    {placedTool ? (
                      <>
                        <ToolPreview tool={placedTool} className="mb-3 h-24 w-32" />
                        <div className="text-xs font-bold text-green-200">{placedTool.label}</div>
                        <div className="mt-2 text-[10px] uppercase tracking-wider text-green-500">
                          documented
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mb-3 h-12 w-12 rounded-full border border-gray-700 bg-gray-950/70" />
                        <div className="text-sm font-bold text-gray-200">{step.label}</div>
                        <div className="mt-2 max-w-[150px] text-[10px] leading-relaxed text-gray-500">
                          Awaiting intake item
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-900/50 bg-cyan-950/20 px-4 py-3">
              <p className="text-xs leading-relaxed text-cyan-100">{notice}</p>
              <button
                type="button"
                disabled={!completed}
                onClick={() => onComplete?.({ risks: riskCount })}
                className="rounded bg-green-700 px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-800 disabled:text-gray-600"
              >
                Begin Case
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
