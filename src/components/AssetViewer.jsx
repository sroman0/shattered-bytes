export default function AssetViewer({ carvedUrl, carvedText }) {
  const hasContent = carvedUrl || carvedText;

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-lg overflow-hidden flex flex-col">
      <div className="px-4 py-2.5 border-b border-gray-800 bg-gray-900 shrink-0">
        <h2 className="text-xs font-bold tracking-widest text-yellow-400 uppercase flex items-center gap-2">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Asset Viewer
          {hasContent && (
            <span className="text-green-500 text-[10px] bg-green-900/30 px-1.5 py-0.5 rounded ml-auto flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              DECODED
            </span>
          )}
        </h2>
      </div>

      <div className="flex-1 bg-black/50 p-3 flex items-center justify-center min-h-[120px]">
        {!hasContent && (
          <div className="text-center">
            <div className="text-gray-700 text-2xl mb-2">◇</div>
            <span className="text-gray-600 text-[10px] uppercase tracking-wider">
              No asset constructed
            </span>
            <p className="text-gray-700 text-[9px] mt-1">Carve items from the Workbench to render here</p>
          </div>
        )}

        {carvedText && (
          <div className="w-full">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Decoded Text Payload</div>
            <pre className="text-sm text-green-400 whitespace-pre-wrap bg-gray-900/60 rounded p-3 border border-green-900/30 font-mono break-all">
              {carvedText}
            </pre>
          </div>
        )}

        {carvedUrl && (
          <img
            src={carvedUrl}
            alt="Carved Data"
            className="max-w-full max-h-full object-contain rounded border border-green-500/30"
            style={{ imageRendering: 'pixelated' }}
          />
        )}
      </div>
    </div>
  );
}
