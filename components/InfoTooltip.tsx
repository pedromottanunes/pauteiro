import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface TooltipPosition {
  x: number;
  y: number;
}

interface InfoTooltipProps {
  title: string;
  shortDescription: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * InfoTooltip - Mostra tooltip rápido no hover e modal detalhado no click
 */
export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title,
  shortDescription,
  children,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTooltip(false);
    setShowModal(true);
  };

  // Fecha modal ao clicar fora
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={`inline-flex items-center justify-center p-1 rounded-full hover:bg-slate-100 transition-colors cursor-help ${className}`}
        aria-label={`Informações sobre ${title}`}
      >
        <HelpCircle size={16} className="text-slate-400 hover:text-indigo-500" />
      </button>

      {/* Tooltip rápido */}
      {showTooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg max-w-xs">
            <p className="font-semibold mb-1">{title}</p>
            <p className="text-slate-300">{shortDescription}</p>
            <p className="text-indigo-300 text-[10px] mt-1">Clique para mais detalhes</p>
          </div>
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"
          />
        </div>
      )}

      {/* Modal detalhado */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">{title}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {children || (
                <p className="text-slate-600">{shortDescription}</p>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-3 bg-slate-50">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InfoTooltip;
