import { create } from 'zustand';
import type { ReactNode } from 'react';

interface ModalState {
  open: boolean;
  title: string;
  message: string;
  content: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  show: (opts: {
    title: string;
    message?: string;
    content?: ReactNode;
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
  content: null,
  confirmLabel: '確定',
  cancelLabel: '取消',
  onConfirm: () => undefined,
  show: (opts) =>
    set({
      open: true,
      title: opts.title,
      message: opts.message ?? '',
      content: opts.content ?? null,
      confirmLabel: opts.confirmLabel ?? '確定',
      cancelLabel: opts.cancelLabel ?? '取消',
      onConfirm: opts.onConfirm,
    }),
  close: () => set({ open: false }),
}));
