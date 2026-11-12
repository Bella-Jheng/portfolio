'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { CheckIcon, EditIcon } from './icons';

/**
 * 顯示一個欄位，按鉛筆就地編輯。uncertain = AI 沒把握的欄位，用黃底提示；
 * 有 onConfirm 時會多一個「✓ 沒問題」按鈕，內容正確不用改也能把黃底取消（編輯後沒改內容直接存也算確認）
 */
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
  onConfirm,
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
  onConfirm?: () => void;
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
    else if (uncertain) onConfirm?.();
  };

  return (
    <div
      className={clsx(
        'flex items-center gap-2 py-1.5',
        uncertain ? '-mx-2.5 my-1 rounded-xl bg-warn-bg px-2.5' : 'border-b border-[#F1EEE8] last:border-b-0',
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
          {uncertain && onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              aria-label={`${label}沒問題`}
              className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-white px-2.5 text-[13px] font-medium text-warn-text"
            >
              <CheckIcon size={15} />
              沒問題
            </button>
          )}
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
