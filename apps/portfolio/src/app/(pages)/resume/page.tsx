'use client';

import React, { useRef, useState, useEffect } from 'react';

import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Tag } from '../../components/Atom/Tag';
import { ArrowRight } from '@/public/icon';
import { BlackFlower, RedFlower, BlueFlower, Resume } from '@/public/img';
import { RevealOnScroll } from '../../components/Common/RevealOnScroll';
import { useResume } from '../../api/resume-api';

const FLOWERS = [
  {
    type: 'black',
    className:
      'top-[5%] left-[2%] md:top-[12%] md:left-[5%] md:w-10 w-8 md:h-10 h-8 opacity-60',
  },
  {
    type: 'black',
    className:
      'top-[45%] left-[5%] md:top-[40%] md:left-[8%] md:w-8 w-6 md:h-8 h-6 opacity-50',
  },
  {
    type: 'black',
    className:
      'top-[30%] right-[3%] md:top-[28%] md:right-[10%] md:w-10 w-8 md:h-10 h-8 opacity-60',
  },
  {
    type: 'black',
    className:
      'bottom-[12%] right-[2%] md:bottom-[15%] md:right-[5%] md:w-8 w-6 md:h-8 h-6 opacity-60',
  },
];

export default function ResumePage() {
  const { data: resumeData, isLoading, isError } = useResume();
  const [isExporting, setIsExporting] = useState(false);
  const [rotatingIndex, setRotatingIndex] = useState<number | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingIndex((prev) => {
        if (prev === null) return 0;
        return (prev + 1) % FLOWERS.length;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleDownloadPdf = async () => {
    if (resumeRef.current === null) {
      return;
    }

    setIsExporting(true);
    // Wait for the state update to reflect in the DOM
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const dataUrl = await toPng(resumeRef.current, {
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
      pdf.save(`yiting-resume-${dateString}.pdf`);
    } catch (err) {
      console.error('Failed to download PDF', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (isError || !resumeData) {
    return (
      <div className="bg-[#FBFAF1] min-h-screen flex items-center justify-center">
        <div className="text-[#B23A3A] font-bold">
          Error loading resume data.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FBFAF1] min-h-screen pb-10 pt-24 md:pt-32 px-4 md:px-0 relative overflow-hidden">
      {!isExporting &&
        FLOWERS.map((flower, index) => (
          <img
            key={index}
            src={flower.type === 'black' ? BlackFlower.src : BlueFlower.src}
            alt=""
            className={`absolute select-none transition-transform duration-700 pointer-events-none ${
              flower.className
            } ${rotatingIndex === index ? 'rotate-180' : ''}`}
          />
        ))}

      <div className="max-w-6xl mx-auto mb-8 flex justify-end relative z-10">
        <button
          onClick={handleDownloadPdf}
          className="group flex items-center text-txt-darkBrown font-bold text-sm uppercase tracking-widest hover:text-[#5E7985] transition-all duration-300"
        >
          Download PDF
          <span className="ml-2 text-lg group-hover:translate-x-1 transition-transform">
            →
          </span>
        </button>
      </div>

      <div
        ref={resumeRef}
        className="max-w-6xl mx-auto md:bg-white p-8 pt-0 md:p-16 shadow-lg rounded-sm text-txt-darkBrown font-sans text-base"
        id="resume-content"
      >
        {/* Basic Section - Only visible during PDF export */}
        {isExporting && (
          <>
            <section className="mb-12">
              <div className="flex items-center gap-2 mb-6 text-[#A6C98A]">
                <h2 className="text-4xl font-black">Basic</h2>
                <img src={BlackFlower.src} alt="" className="w-6 h-6" />
              </div>

              <div className="space-y-2 text-base text-txt-darkBrown">
                <p className="font-bold text-xl text-txt-darkBrown mb-4">
                  鄭伊婷 yiting
                </p>
                <p>
                  <span className="font-bold">職位:</span> 前端軟體工程師
                  Front-End Software Engineer
                </p>
                <p>
                  <span className="font-bold">聯絡電話:</span> 0909015558
                </p>
                <p>
                  <span className="font-bold">聯絡信箱:</span>{' '}
                  bz850308@gmail.com
                </p>
              </div>
            </section>

            <div className="border-b-2 border-dashed border-gray-300 my-10"></div>
          </>
        )}

        {/* Me Section */}
        <RevealOnScroll>
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-4xl font-black">Me</h2>
              <img src={BlackFlower.src} alt="" className="w-6 h-6" />
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1 space-y-6 text-base leading-relaxed text-txt-darkBrown">
                {resumeData.me.map((item, idx) => (
                  <div key={idx}>
                    <p className="font-bold mb-2">{item.label}</p>
                    <p>{item.content}</p>
                  </div>
                ))}
              </div>
              <div className="w-2/3 md:w-1/4 p-2 shadow-sm transition-transform duration-300 hover:scale-105">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={Resume.src}
                    alt="Portrait"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>
        </RevealOnScroll>

        <RevealOnScroll delay={200}>
          <div className="border-b-2 border-dashed border-gray-300 my-10"></div>
        </RevealOnScroll>

        {/* Experience Section with Vertical Timeline */}
        <section className="mb-12 relative">
          <RevealOnScroll delay={300}>
            <div className="flex items-center gap-2 mb-8">
              <h2 className="text-4xl font-black text-[#5E7985]">Experience</h2>
              <img src={BlueFlower.src} alt="" className="w-8 h-8" />
            </div>
          </RevealOnScroll>

          {/* Vertical Line (Desktop Only) */}
          <div className="absolute left-[8.5rem] top-24 bottom-10 w-[1px] bg-gray-200 hidden md:block z-0" />

          <div className="space-y-12">
            {resumeData.experience.map((exp, idx) => (
              <RevealOnScroll key={idx} delay={400 + idx * 200}>
                <div
                  className="group flex flex-col md:flex-row gap-8 p-6 md:p-6 bg-white md:bg-transparent border border-gray-100 md:border-none rounded-2xl md:rounded-none transition-all duration-300 relative hover:shadow-lg md:hover:shadow-none md:hover:bg-gray-50/50 md:rounded-xl"
                  style={{ zIndex: 1 }}
                >
                  <div className="relative">
                    <p className="text-base font-bold text-gray-400 mb-4 font-mono tracking-tighter">
                      {exp.period}
                    </p>

                    <div
                      className={`w-16 h-16 md:w-20 md:h-20 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md ${
                        exp.logoType === 'text'
                          ? 'rounded-2xl flex items-center justify-center p-2'
                          : 'flex items-center justify-center text-[#333] italic'
                      }`}
                      style={{ backgroundColor: exp.logoColor }}
                    >
                      <span
                        className={
                          exp.logoType === 'text'
                            ? 'text-white font-black text-xl md:text-2xl text-center'
                            : 'font-black text-3xl md:text-4xl italic'
                        }
                      >
                        {exp.logoText}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-2xl font-black mb-6 text-txt-darkBrown group-hover:text-[#5E7985] transition-colors duration-300">
                      {exp.title}
                    </h3>
                    <ul className="text-base space-y-2 text-txt-darkBrown flex-grow">
                      {exp.bulletPoints.map((point, pIdx) => (
                        <li key={pIdx} className="pl-2">
                          {point}
                        </li>
                      ))}
                    </ul>

                    <div className="pt-8 border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {exp.skills.map((skill, sIdx) => (
                          <div
                            key={sIdx}
                            className="transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                          >
                            <Tag className="shadow-sm group-hover/tag:shadow-md group-hover/tag:bg-[#DEDCA8]">
                              {skill}
                            </Tag>
                          </div>
                        ))}
                      </div>

                      {!isExporting && exp.projectUrl && (
                        <a
                          href={exp.projectUrl}
                          className="group/link flex items-center text-txt-darkBrown font-bold text-sm uppercase tracking-widest hover:text-[#5E7985] transition-all duration-300 underline md:no-underline underline-offset-4"
                        >
                          more projects
                          <ArrowRight className="ml-1 w-4 h-4 transform transition-transform duration-300 group-hover/link:translate-x-1" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </section>

        <RevealOnScroll delay={500}>
          <div className="border-b-2 border-dashed border-gray-300 my-10"></div>
        </RevealOnScroll>

        {/* Education Section */}
        <RevealOnScroll delay={600}>
          <section>
            <div className="flex items-center gap-2 mb-8">
              <h2 className="text-4xl font-black text-[#B23A3A]">Education</h2>
              <img src={RedFlower.src} alt="" className="w-6 h-6" />
            </div>

            <div className="space-y-8">
              {resumeData.education.map((edu, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-8 group hover:bg-gray-50 p-4 rounded-xl transition-colors duration-300"
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center p-2 transition-transform duration-500 group-hover:rotate-12"
                    style={{ backgroundColor: edu.logoColor }}
                  >
                    <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center">
                      <span className="text-white text-sm text-center font-bold">
                        {edu.school}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-xl">{edu.school}</p>
                    <p className="text-base text-gray-700">{edu.department}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </RevealOnScroll>
      </div>
    </div>
  );
}
