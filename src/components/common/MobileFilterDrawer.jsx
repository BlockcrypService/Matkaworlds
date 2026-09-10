import React, { useEffect } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import Button from './Button';

const MobileFilterDrawer = ({ isOpen, onClose, onApply, children, title = "Filters", onReset }) => {

  useEffect(() => {
    const handleBodyScroll = () => {
      if (isOpen && window.innerWidth < 768) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    };

    handleBodyScroll();
    window.addEventListener("resize", handleBodyScroll);

    return () => {
      window.removeEventListener("resize", handleBodyScroll);
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div className="sm:hidden">
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed bottom-0 left-0 right-0 z-[101] bg-[#090A1B] w-full rounded-t-[32px] border-t border-x border-[var(--border-secondary)] flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-full fade-in duration-300 shadow-[0_-10px_40px_rgba(18,68,255,0.15)]">

        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-white/20 rounded-full"></div>
        </div>

        <div className="flex justify-between items-center md:p-5 p-3 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={20} className="text-[#1244FF]" />
            <h3 className="text-white font-bold text-lg">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-gray)] hover:text-white transition-colors bg-white/5 p-1.5 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="shrink overflow-y-auto hide-scrollbar p-5 space-y-6">
          {children}
        </div>

        <div className="md:p-5 p-4 border-t border-white/5 flex gap-3 bg-[#090A1B] pb-[max(1rem,env(safe-area-inset-bottom))]">
          {onReset && (
            <Button
              isIcon={false}
              variant="outline"
              className="flex-1 w-full border border-white/10 bg-white/5 hover:bg-white/10"
              onPointerDown={(e) => {
                e.preventDefault();
                onReset();
              }}
            >
              RESET
            </Button>
          )}
          <Button
            isIcon={false}
            className="flex-[2] w-full bg-[#1244FF] hover:bg-[#0E35D4]"
            onPointerDown={(e) => {
              e.preventDefault();
              if (onApply) onApply();
              onClose();
            }}
          >
            SAVE FILTERS
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilterDrawer;
