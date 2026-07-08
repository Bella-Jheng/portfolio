'use client';

import { useModalStore } from '../../../lib/modal-store';

export function Modal() {
  const { open, title, message, content, confirmLabel, cancelLabel, onConfirm, close } = useModalStore();

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm();
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />
      <div className="relative bg-white border border-bz-border rounded-2xl p-7 max-w-sm w-full space-y-5 shadow-xl">
        <h3 className="text-bz-brown font-serif text-lg tracking-wide">{title}</h3>
        {content ?? <p className="text-bz-mid text-sm leading-relaxed">{message}</p>}
        <div className="flex gap-3 pt-1">
          <button
            onClick={close}
            className="flex-1 border border-bz-border text-bz-mid py-2.5 rounded-xl text-sm hover:border-bz-brown/30 transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-bz-terra text-white py-2.5 rounded-xl text-sm hover:bg-bz-terra-dark transition-all"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
