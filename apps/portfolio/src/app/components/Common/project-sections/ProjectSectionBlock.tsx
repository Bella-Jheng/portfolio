import React from 'react';
import { ProjectSection } from '../../../api/project-detail-api.type';
import { highlightText } from '../highlight-text';

const LABEL_CLASS = 'text-tiny font-bold uppercase tracking-widest text-txt-darkBrown/60';
const BODY_CLASS = 'text-tiny text-txt-darkBrown leading-relaxed';

function Field({
  label,
  children,
}: {
  label: string;
  children: string | string[];
}) {
  return (
    <div className="space-y-1.5">
      <span className={LABEL_CLASS}>{label}</span>
      {Array.isArray(children) ? (
        <ul className={`list-disc list-inside space-y-1 ${BODY_CLASS}`}>
          {children.map((item) => (
            <li key={item}>{highlightText(item)}</li>
          ))}
        </ul>
      ) : (
        <div className={`whitespace-pre-line ${BODY_CLASS}`}>{highlightText(children)}</div>
      )}
    </div>
  );
}

function ComparisonTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-tiny text-left border-collapse">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="px-4 py-2 font-bold text-txt-darkBrown border-b border-gray-200 whitespace-nowrap"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-gray-200">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`px-4 py-2 align-top leading-relaxed text-txt-darkBrown ${
                    cellIndex === 0 ? 'font-semibold' : ''
                  }`}
                >
                  {highlightText(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProjectSectionBlock({ section }: { section: ProjectSection }) {
  const { title, whatIDid, techUsed, challenges, comparisonTable, learnings } = section;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-6">
      <h3 className="text-xl font-bold text-txt-darkBrown">{title}</h3>

      <Field label="我做了什麼">{whatIDid}</Field>

      <Field label="遇到的困難">{challenges}</Field>

      {comparisonTable && (
        <ComparisonTable columns={comparisonTable.columns} rows={comparisonTable.rows} />
      )}

      <Field label="學習了什麼">{learnings}</Field>

      {techUsed.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-gray-200 pt-4">
          {techUsed.map((tech) => (
            <span key={tech} className="text-tiny font-bold text-txt-brown">
              #{tech}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
