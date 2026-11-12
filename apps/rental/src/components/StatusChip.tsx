import { STATUS_META, type Status } from '../lib/types';

export function StatusChip({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={
        status === 'rented'
          ? { background: meta.color, color: '#FFFFFF' }
          : { background: meta.softBg, color: meta.softText }
      }
    >
      {meta.label}
    </span>
  );
}

export function StatusDot({ status }: { status: Status }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{ background: STATUS_META[status].color }}
    />
  );
}
