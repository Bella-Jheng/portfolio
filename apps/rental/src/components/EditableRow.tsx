'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { EditIcon } from './icons';

/** 顯示一個欄位，按鉛筆就地編輯。uncertain = AI 沒把握的欄位，用黃底提示 */
export function EditableRow({
  label,
  value,
  placeholder = '點一下填寫',
  uncertain = false,
  uncertainHint,
  inputMode,
  startEditing = false,
  leading,
  trailing,
  onSave,
}: {
  label: string;
  value: string;
  placeholder?: string;
  uncertain?: boolean;
  uncertainHint?: string;
  inputMode?: 'text' | 'tel' | 'numeric';
  startEditing?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  onSave: (value: string) => void;
}) {
  const [editing, setEditing] = useState(startEditing);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    // startEditing 的「新增」列就算沒填也要通知外面收起來
    if (draft.trim() !== value || startEditing) onSave(draft.trim());
  };

  return (
    <div
      className={clsx(
        'flex items-center gap-2 py-1.5',
        uncertain ? '-mx-2.5 my-1 rounded-xl bg-warn-bg px-2.5' : 'border-b border-[#EEF1F4] last:border-b-0',
      )}
    >
      {leading}
      {editing ? (
        <label className="flex min-w-0 flex-1 flex-col gap-1 py-1">
          <span className="text-xs text-sub">{label}</span>
          <input
            ref={inputRef}
            className="field-input"
            value={draft}
            inputMode={inputMode}
            type={inputMode === 'tel' ? 'tel' : 'text'}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') {
                setDraft(value);
                setEditing(false);
              }
            }}
          />
        </label>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex min-w-0 flex-1 flex-col items-start gap-px py-1 text-left"
          >
            <span className={clsx('text-xs', uncertain ? 'text-warn-text' : 'text-sub')}>
              {label}
              {uncertain && ` · ${uncertainHint ?? '請確認'}`}
            </span>
            <span className={clsx('w-full break-words text-[15px]', !value && 'text-sub')}>
              {value || placeholder}
            </span>
          </button>
          <button
            type="button"
            aria-label={`編輯${label}`}
            onClick={() => setEditing(true)}
            className={clsx(
              'flex h-11 w-11 shrink-0 items-center justify-center',
              uncertain ? 'text-warn-text' : 'text-sub',
            )}
          >
            <EditIcon size={18} />
          </button>
          {trailing}
        </>
      )}
    </div>
  );
}
