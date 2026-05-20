import { create } from 'zustand';

interface ModalState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  show: (opts: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
  }) => void;
  close: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  open: false,
  title: '',
  message: '',
  confirmLabel: '確定',
  cancelLabel: '取消',
  onConfirm: () => {},
  show: (opts) =>
    set({
      open: true,
      title: opts.title,
      message: opts.message,
      confirmLabel: opts.confirmLabel ?? '確定',
      cancelLabel: opts.cancelLabel ?? '取消',
      onConfirm: opts.onConfirm,
    }),
  close: () => set({ open: false }),
}));
