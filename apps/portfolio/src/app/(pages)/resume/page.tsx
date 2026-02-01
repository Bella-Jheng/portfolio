'use client';

import React, { useRef, useState, useEffect } from 'react';

import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Tag } from '../../components/Atom/Tag';
import { ArrowRight } from '@/public/icon';
import { BlackFlower, RedFlower, BlueFlower } from '@/public/img';
import { RevealOnScroll } from '../../components/Common/RevealOnScroll';

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

const RESUME_DATA = {
  me: [
    {
      label: '【持續學習與成長】',
      content:
        '我的職涯從不僅止於目前的職務。開發者（Frontend）的角色與前端的各種生態系中心化給我了豐富的挑戰。我喜歡隨時隨時地更新我的知識與技術儲備，也不斷將精煉的形式運用在我的專案與設計中。保持好奇心與細節的追求。在過去的技術職涯中，我有幸參與過各種不同規模的專案，技術與實務經驗讓我對開發流程有了更全面的理解，並能在協作中展現效率與執行力。在未來的開發職務中，我也希望保持這樣的研究與成長。不僅在研發職能領先並有優越表現，進一步提升了實質的產品質與競爭能力。',
    },
    {
      label: '【跨界背景】',
      content:
        '我在跨界學界超過三年的時間。從外國語文學系畢業後，在學期過渡期中，我曾服務與多個不同背景的研發團隊，並深耕與多種跨界生態系。在這份工作中，除了具備了多元的文法與語言理解能力。在其中，我參與了多場英文溝通會議，並能高效地理解跨國團隊的需求與需求。在這些具體的實踐中，這份跨學科經歷賦予了我競爭力、對細節的敏銳度、以及與團隊中不同背景的人有效溝通的能力。',
    },
    {
      label: '【結語】',
      content:
        '我相信我的工作不僅是工具，缺乏深度與細緻度的設計是無法打動用戶的。我喜歡研究產品與開發流程的結合，並要求精煉的程式碼。我對開發工作充滿熱忱與追求精進，具有良好溝通習慣、高度執行力、對新事物充滿好奇與自律，期待與貴團隊交流與面談。謝謝！',
    },
  ],
  experience: [
    {
      period: '2022-PRESENT',
      company: '特力屋',
      title: 'Front-End Software Engineer, 特力屋',
      logoType: 'text',
      logoColor: '#E67E22',
      logoText: '特力屋',
      bulletPoints: [
        'HOLA 專案開發：與前端、UI 設計師、PM 合作，進行【HOLA官網優化】更換新版結帳流程、串接新版 API、處理新版結帳流程相關頁面、金融金流串接。',
        'HOLA 官網維護與更新：對現有專案進行環境優化、更新開發套件、研究、測試與實作：從 react 17 更新到 18、從 bootstrap (樣式) 換成 tailwind、導入 typescript、優化與重整電子票卷模組化之。',
        '模組化機制開發：在製作內部的視覺套件，主要設計一具動態的配置系統，包括：連結調整、產品上線、動態導流。',
        '獨立開發專案：串接與開發相關實體 API，監控與測試其上線。',
      ],
      skills: ['React', 'TypeScript', 'Zustand'],
      projectUrl: '/projects?category=testrite',
    },
    {
      period: '2021-2022',
      company: '104',
      title: 'Product Owner, 104',
      logoType: 'italicText',
      logoColor: 'transparent',
      logoText: '104',
      bulletPoints: [
        'HOLA 專案開發：與前端、UI 設計師、PM 合作，進行【HOLA官網優化】更換新版結帳流程、串接新版 API、處理新版結帳流程相關頁面、金融金流串接。',
        'HOLA 官網維護與更新：對現有專案進行環境優化、更新開發套件、研究、測試與實作：從 react 17 更新到 18、從 bootstrap (樣式) 換成 tailwind、導入 typescript、並維修程式碼中不穩定之出工。',
        '模組化系統開發：在製作內部的內部的視覺套件，主要設計一具動態的配置系統，包括：連結調整、產品上線、內容上線、動態導流。',
        '獨立小型項開發：串接與開發相關實體商 API，並對其測試其。',
      ],
      skills: ['React', 'TypeScript', 'Zustand'],
      projectUrl: '/projects?category=104',
    },
  ],
  education: [
    {
      school: '國立臺北大學',
      department: 'Department of Applied Foreign Languages',
      logoColor: '#9B4D96',
    },
  ],
};

export default function ResumePage() {
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

      <div className="max-w-4xl mx-auto mb-8 flex justify-end relative z-10">
        <button
          onClick={handleDownloadPdf}
          className="group flex items-center text-[#2D1B1B] font-bold text-sm uppercase tracking-widest hover:text-[#5E7985] transition-all duration-300"
        >
          Download PDF
          <span className="ml-2 text-lg group-hover:translate-x-1 transition-transform">
            →
          </span>
        </button>
      </div>

      <div
        ref={resumeRef}
        className="max-w-4xl mx-auto md:bg-white p-8 pt-0 md:p-16 shadow-lg rounded-sm text-[#2D1B1B] font-sans"
        id="resume-content"
      >
        {/* Basic Section - Only visible during PDF export */}
        {isExporting && (
          <>
            <section className="mb-12">
              <div className="flex items-center gap-2 mb-6 text-[#A6C98A]">
                <h2 className="text-3xl font-black">Basic</h2>
                <img src={BlackFlower.src} alt="" className="w-6 h-6" />
              </div>

              <div className="space-y-2 text-sm text-gray-800">
                <p className="font-bold text-lg text-[#2D1B1B] mb-4">
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
              <h2 className="text-3xl font-black">Me</h2>
              <img src={BlackFlower.src} alt="" className="w-6 h-6" />
            </div>

            <div className="space-y-6 text-sm leading-relaxed text-gray-800">
              {RESUME_DATA.me.map((item, idx) => (
                <div key={idx}>
                  <p className="font-bold mb-2">{item.label}</p>
                  <p>{item.content}</p>
                </div>
              ))}
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
              <h2 className="text-3xl font-black text-[#5E7985]">Experience</h2>
              <img src={BlueFlower.src} alt="" className="w-8 h-8" />
            </div>
          </RevealOnScroll>

          {/* Vertical Line (Desktop Only) */}
          <div className="absolute left-[8.5rem] top-24 bottom-10 w-[1px] bg-gray-200 hidden md:block z-0" />

          <div className="space-y-12">
            {RESUME_DATA.experience.map((exp, idx) => (
              <RevealOnScroll key={idx} delay={400 + idx * 200}>
                <div
                  className="group flex flex-col md:flex-row gap-8 p-6 md:p-6 bg-white md:bg-transparent border border-gray-100 md:border-none rounded-2xl md:rounded-none transition-all duration-300 relative hover:shadow-lg md:hover:shadow-none md:hover:bg-gray-50/50 md:rounded-xl"
                  style={{ zIndex: 1 }}
                >
                  <div className="md:w-1/4 relative">
                    <p className="text-sm font-bold text-gray-400 mb-4 font-mono tracking-tighter">
                      {exp.period}
                    </p>

                    {/* Timeline Dot (Desktop Only) */}
                    <div className="hidden md:block absolute right-[-2.6rem] top-[3.5rem] w-3 h-3 rounded-full bg-white border-2 border-[#5E7985] z-10 group-hover:bg-[#5E7985] transition-colors duration-300"></div>

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
                            ? 'text-white font-black text-lg md:text-xl text-center'
                            : 'font-black text-2xl md:text-3xl italic'
                        }
                      >
                        {exp.logoText}
                      </span>
                    </div>
                  </div>
                  <div className="md:w-3/4 flex flex-col">
                    <h3 className="text-xl font-black mb-6 text-[#2D1B1B] group-hover:text-[#5E7985] transition-colors duration-300">
                      {exp.title}
                    </h3>
                    <ul className="text-sm space-y-4 list-decimal list-inside text-gray-700 flex-grow">
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
                          className="group/link flex items-center text-[#2D1B1B] font-bold text-[11px] uppercase tracking-widest hover:text-[#5E7985] transition-all duration-300 underline md:no-underline underline-offset-4"
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
              <h2 className="text-3xl font-black text-[#B23A3A]">Education</h2>
              <img src={RedFlower.src} alt="" className="w-6 h-6" />
            </div>

            <div className="space-y-8">
              {RESUME_DATA.education.map((edu, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-8 group hover:bg-gray-50 p-4 rounded-xl transition-colors duration-300"
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center p-2 transition-transform duration-500 group-hover:rotate-12"
                    style={{ backgroundColor: edu.logoColor }}
                  >
                    <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center">
                      <span className="text-white text-[10px] text-center font-bold">
                        {edu.school}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-lg">{edu.school}</p>
                    <p className="text-sm text-gray-700">{edu.department}</p>
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
