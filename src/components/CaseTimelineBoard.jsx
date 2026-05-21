import { useMemo, useState } from 'react';
import boardBackground from '../../assets/case_board_background.webp';
import ransomChat from '../../assets/evidence_ransom_chat.webp';
import forgedIdentity from '../../assets/evidence_forged_identity.webp';
import atmFrame from '../../assets/evidence_atm_frame.webp';
import bankTransfer from '../../assets/evidence_bank_transfer.webp';
import payloadFragment from '../../assets/evidence_payload_fragment.webp';
import credentials from '../../assets/evidence_credentials.webp';

const evidenceCards = [
  {
    id: 'ransom_chat',
    title: 'Ransom Channel',
    image: ransomChat,
  },
  {
    id: 'forged_identity',
    title: 'Mule Identity',
    image: forgedIdentity,
  },
  {
    id: 'atm_frame',
    title: 'Cash-out Frame',
    image: atmFrame,
  },
  {
    id: 'bank_transfer',
    title: 'Fraud Transfer',
    image: bankTransfer,
  },
  {
    id: 'payload_fragment',
    title: 'Payload Fragment',
    image: payloadFragment,
  },
  {
    id: 'credentials',
    title: 'Credential Set',
    image: credentials,
  },
];

const correctOrder = evidenceCards.map(card => card.id);
const emptyChain = () => Array(correctOrder.length).fill(null);

const setCustomDragImage = (event, card) => {
  if (!event.dataTransfer || !card) return;

  const preview = document.createElement('div');
  preview.style.cssText = [
    'position: fixed',
    'top: -1000px',
    'left: -1000px',
    'width: 220px',
    'height: 124px',
    'overflow: hidden',
    'border: 1px solid rgba(34, 211, 238, 0.65)',
    'border-radius: 8px',
    'background: rgba(2, 6, 23, 0.94)',
    'box-shadow: 0 0 28px rgba(34, 211, 238, 0.24)',
    'color: #e5e7eb',
    'font: 800 12px monospace',
    'z-index: 9999',
    'pointer-events: none',
  ].join(';');

  const img = document.createElement('img');
  img.src = card.image;
  img.alt = '';
  img.style.cssText = [
    'width: 100%',
    'height: 88px',
    'object-fit: cover',
    'display: block',
    'opacity: 0.92',
  ].join(';');

  const label = document.createElement('div');
  label.textContent = card.title;
  label.style.cssText = 'padding: 8px 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis';

  preview.appendChild(img);
  preview.appendChild(label);
  document.body.appendChild(preview);
  event.dataTransfer.setDragImage(preview, 110, 62);
  window.setTimeout(() => preview.remove(), 0);
};

const shuffleItems = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export default function CaseTimelineBoard({ onComplete }) {
  const [deck, setDeck] = useState(() => shuffleItems(evidenceCards));
  const [chain, setChain] = useState(() => emptyChain());
  const [draggedCard, setDraggedCard] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [validated, setValidated] = useState(false);
  const [status, setStatus] = useState('Build the incident chain from the recovered evidence.');

  const chainIds = useMemo(
    () => chain.filter(Boolean),
    [chain],
  );

  const availableCards = useMemo(
    () => deck.filter(card => !chainIds.includes(card.id)),
    [deck, chainIds],
  );

  const isComplete = chain.every(Boolean);
  const correctSequence = isComplete && chain.every((id, idx) => id === correctOrder[idx]);
  const solved = validated && correctSequence;

  const addToChain = (id) => {
    if (chainIds.includes(id) || solved) return;
    const firstEmptyIdx = chain.findIndex(slot => slot === null);
    if (firstEmptyIdx === -1) {
      setStatus('All timeline slots are already occupied.');
      return;
    }
    setValidated(false);
    setChain(prev => {
      const next = [...prev];
      next[firstEmptyIdx] = id;
      return next;
    });
    setStatus('Evidence linked. Review the sequence before sealing the report.');
  };

  const removeFromChain = (idx) => {
    if (solved) return;
    setValidated(false);
    setChain(prev => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
    setStatus('Evidence removed from chain.');
  };

  const startCardDrag = (event, cardId) => {
    const card = evidenceCards.find(item => item.id === cardId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/x-shattered-card', cardId);
    setCustomDragImage(event, card);
    setDraggedCard(cardId);
  };

  const placeCardAt = (cardId, targetIdx) => {
    if (!cardId || solved) return;

    const sourceIdx = chain.indexOf(cardId);
    const targetId = chain[targetIdx];

    if (sourceIdx === -1 && targetId) {
      setStatus('That slot is occupied. Drop recovered artefacts into an empty slot, or drag placed artefacts to swap them.');
      return;
    }

    setValidated(false);
    setChain(prev => {
      const next = [...prev];
      const currentIdx = next.indexOf(cardId);
      const currentTarget = next[targetIdx];

      if (currentIdx >= 0) {
        next[currentIdx] = currentTarget || null;
      }

      next[targetIdx] = cardId;
      return next;
    });
    setStatus('Evidence position updated. Validate the chain when all slots are filled.');
  };

  const dropCard = (event, targetIdx) => {
    event.preventDefault();
    const cardId = event.dataTransfer.getData('application/x-shattered-card') || draggedCard;
    placeCardAt(cardId, targetIdx);
    setDraggedCard(null);
  };

  const reset = () => {
    setDeck(shuffleItems(evidenceCards));
    setChain(emptyChain());
    setDraggedCard(null);
    setValidated(false);
    setStatus('Build the incident chain from the recovered evidence.');
  };

  const submit = () => {
    if (!isComplete) {
      setStatus('The chain is incomplete.');
      return;
    }

    if (correctSequence) {
      setValidated(true);
      setStatus('Incident chain sealed. The final report is ready.');
      return;
    }

    setValidated(false);
    setAttempts(prev => prev + 1);
    setStatus('The sequence does not yet explain the incident progression. Reorder the evidence.');
  };

  return (
    <div className="fixed inset-0 z-[75] bg-gray-950 text-gray-100 font-mono overflow-hidden">
      <img
        src={boardBackground}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-70 brightness-75 contrast-110"
      />
      <div className="absolute inset-0 bg-gray-950/52" />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/30 via-transparent to-gray-950/70" />

      <div className="relative flex h-full flex-col p-5 lg:p-7">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-cyan-900/40 pb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.34em] text-cyan-500 font-bold">
              Case Reconstruction
            </div>
            <h1 className="mt-1 text-2xl lg:text-3xl font-black tracking-[0.16em] text-green-300 uppercase">
              Evidence Timeline
            </h1>
          </div>
          <div className="rounded border border-gray-700/80 bg-gray-950/80 px-3 py-2 text-right">
            <div className="text-[10px] uppercase tracking-wider text-gray-500">Revisions</div>
            <div className={`text-lg font-black ${attempts ? 'text-amber-300' : 'text-green-300'}`}>
              {attempts}
            </div>
          </div>
        </header>

        <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 py-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <section className="min-h-0 rounded-lg border border-gray-800 bg-gray-950/72 p-3 backdrop-blur-[2px]">
            <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-cyan-500 font-bold">
              Recovered artefacts
            </div>
            <div className="grid max-h-full grid-cols-2 gap-3 overflow-y-auto pr-1 xl:grid-cols-1">
              {availableCards.map(card => (
                <button
                  key={card.id}
                  type="button"
                  draggable={!solved}
                  onClick={() => addToChain(card.id)}
                  onDragStart={(event) => startCardDrag(event, card.id)}
                  onDragEnd={() => setDraggedCard(null)}
                  className="group overflow-hidden rounded-md border border-gray-800 bg-gray-900/80 text-left transition-all hover:border-cyan-700/70 hover:bg-cyan-950/25"
                >
                  <img src={card.image} alt={card.title} className="h-24 w-full object-cover opacity-85" />
                  <div className="p-2">
                    <div className="text-xs font-bold text-gray-200">{card.title}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="flex min-h-0 flex-col rounded-lg border border-gray-800 bg-gray-950/72 p-4 backdrop-blur-[2px]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.28em] text-green-500 font-bold">
                  Incident chain
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  Place each recovered artefact in the order it supports the investigation.
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={solved}
                  onClick={reset}
                  className="rounded border border-gray-700 bg-gray-900 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-300 hover:border-cyan-700 hover:text-cyan-200 disabled:opacity-40"
                >
                  Reset
                </button>
                <button
                  type="button"
                  disabled={!isComplete}
                  onClick={submit}
                  className="rounded bg-cyan-800 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-cyan-50 hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-gray-800 disabled:text-gray-600"
                >
                  Validate Chain
                </button>
              </div>
            </div>

            <div className="grid flex-1 auto-rows-fr grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2 2xl:grid-cols-3">
              {chain.map((cardId, idx) => {
                const card = evidenceCards.find(item => item.id === cardId);
                const wrongAfterAttempt = attempts > 0 && card && card.id !== correctOrder[idx];
                return (
                  <div
                    key={idx}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(event) => dropCard(event, idx)}
                    className={`relative min-h-[180px] overflow-hidden rounded-lg border p-3
                      ${card
                        ? wrongAfterAttempt
                          ? 'border-red-700/70 bg-red-950/20'
                          : 'border-green-700/50 bg-green-950/20'
                        : 'border-dashed border-gray-700 bg-gray-900/55'
                      }`}
                  >
                    <div className="absolute left-3 top-3 z-10 rounded bg-gray-950/80 px-2 py-1 text-[10px] text-gray-400">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    {card ? (
                      <button
                        type="button"
                        draggable={!solved}
                        onClick={() => removeFromChain(idx)}
                        onDragStart={(event) => startCardDrag(event, card.id)}
                        onDragEnd={() => setDraggedCard(null)}
                        className={`block h-full w-full text-left ${draggedCard === card.id ? 'opacity-60' : ''}`}
                      >
                        <img src={card.image} alt={card.title} className="h-28 w-full rounded object-cover opacity-85" />
                        <div className="mt-3">
                          <div className="text-sm font-black text-gray-100">{card.title}</div>
                        </div>
                      </button>
                    ) : (
                      <div className="flex h-full min-h-[150px] items-center justify-center text-center">
                        <div>
                          <div className="mx-auto mb-3 h-10 w-10 rounded-full border border-gray-700" />
                          <div className="text-xs text-gray-500">Timeline slot</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-900/50 bg-cyan-950/20 px-4 py-3">
              <p className={`text-xs leading-relaxed ${solved ? 'text-green-200' : 'text-cyan-100'}`}>
                {status}
              </p>
              <button
                type="button"
                disabled={!solved}
                onClick={onComplete}
                className="rounded bg-green-700 px-5 py-2 text-xs font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-800 disabled:text-gray-600"
              >
                Seal Final Report
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
