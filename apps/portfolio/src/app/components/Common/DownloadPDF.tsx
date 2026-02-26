'use client';

import React, { useState } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import './DownloadPDF.scss';

interface DownloadPDFProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  onExportingChange?: (isExporting: boolean) => void;
  fileName?: string;
}

export const DownloadPDF: React.FC<DownloadPDFProps> = ({
  targetRef,
  onExportingChange,
  fileName = 'resume',
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('Downloading');

  const handleDownloadPdf = async () => {
    if (targetRef.current === null) {
      return;
    }

    setIsExporting(true);
    onExportingChange?.(true);
    setDownloadStatus('Capturing');

    // Wait for the state update and for potential layout shifts to settle
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const dataUrl = await toPng(targetRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        style: {
          margin: '0',
          transform: 'scale(1)',
          boxShadow: 'none',
        },
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(dataUrl);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add subsequent pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const day = today.getDate();
      const formattedMonth = String(month).padStart(2, '0');
      const formattedDay = String(day).padStart(2, '0');
      const dateString = `${year}-${formattedMonth}-${formattedDay}`;
      pdf.save(`yiting-${fileName}-${dateString}.pdf`);
    } catch (err) {
      console.error('Failed to download PDF', err);
    } finally {
      setIsExporting(false);
      onExportingChange?.(false);
      setDownloadStatus('Downloading');
    }
  };

  return (
    <button
      onClick={handleDownloadPdf}
      disabled={isExporting}
      className={`group flex items-center font-bold text-sm uppercase tracking-widest transition-all duration-300 min-w-[160px] justify-end ${
        isExporting
          ? 'text-gray-700 cursor-not-allowed'
          : 'text-txt-darkBrown hover:text-[#5E7985]'
      }`}
    >
      {isExporting ? (
        <>
          {downloadStatus}
          <span className="ml-2 flex items-center h-5">
            <span className="animate-dot1">.</span>
            <span className="animate-dot2">.</span>
            <span className="animate-dot3">.</span>
          </span>
        </>
      ) : (
        <>
          Download PDF
          <span className="ml-2 text-lg group-hover:translate-x-1 transition-transform">
            →
          </span>
        </>
      )}
    </button>
  );
};
