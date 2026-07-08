import React from 'react';
import { ProjectSection } from '../../../api/project-detail-api.type';

function TextBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="prose prose-sm max-w-none text-txt-darkBrown leading-relaxed">
      <h3 className="text-xl font-bold text-txt-darkBrown mb-2">{title}</h3>
      <p className="whitespace-pre-line">{content}</p>
    </div>
  );
}

function DecisionBlock({
  title,
  problem,
  options,
  decision,
  why,
}: {
  title: string;
  problem: string;
  options?: { label: string; detail: string }[];
  decision: string;
  why?: string[];
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
      <h3 className="text-xl font-bold text-txt-darkBrown">{title}</h3>

      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-widest text-ad-error">
          問題
        </span>
        <p className="text-sm text-txt-darkBrown leading-relaxed">{problem}</p>
      </div>

      {options && options.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
            評估選項
          </span>
          <ul className="space-y-2">
            {options.map((option) => (
              <li key={option.label} className="flex flex-col sm:flex-row sm:gap-3 text-sm">
                <span className="font-bold text-txt-brown shrink-0 sm:w-40">
                  {option.label}
                </span>
                <span className="text-gray-600 leading-relaxed">{option.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-md bg-[#FFFDDE] p-4 space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-ad-success">
          決策
        </span>
        <p className="text-sm font-semibold text-txt-darkBrown leading-relaxed">{decision}</p>
        {why && why.length > 0 && (
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {why.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ComparisonBlock({
  title,
  content,
  columns,
  rows,
}: {
  title: string;
  content?: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold text-txt-darkBrown">{title}</h3>
      {content && (
        <p className="text-sm text-txt-darkBrown leading-relaxed">{content}</p>
      )}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-2 font-bold text-txt-darkBrown whitespace-nowrap"
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
                    className="px-4 py-2 text-gray-700 align-top leading-relaxed"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProjectSectionBlock({ section }: { section: ProjectSection }) {
  if (section.type === 'decision') {
    return <DecisionBlock {...section} />;
  }
  if (section.type === 'comparison') {
    return <ComparisonBlock {...section} />;
  }
  return <TextBlock title={section.title} content={section.content} />;
}
