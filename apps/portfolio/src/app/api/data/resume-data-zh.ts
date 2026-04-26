import { ResumeData } from '../resume-api.type';

export const RESUME_DATA_ZH: ResumeData = {
  me: [
    {
      label: '【核心理念】',
      content: '我是一名前端軟體工程師，具備電商前後台與平台型系統的開發經驗。相較於單純完成畫面或功能，我更在意的是：工程實作是否能被正確理解、是否能在現實條件下穩定運作，並且長期被團隊使用與維護。',
    },
    {
      label: '【跨角色轉譯與決策】',
      content: '我的職涯曾歷經後端開發、專案管理（PM）與前端工程的角色，這樣的背景讓我能同時理解工程實作的限制、資料結構的複雜度，以及產品與營運端真正關心的重點。',
    },
    {
      label: '【技術敏銳度與嚴謹性】',
      content: '過去曾參與交易型與電商平台系統，開發經驗培養我對資料正確性、失敗情境與測試流程的高度敏感度。',
    },
  ],
  experience: [
    {
      period: '2022-PRESENT',
      company: 'Testrite (特力屋)',
      title: '前端軟體工程師',
      logoType: 'text',
      logoColor: '#E67E22',
      logoText: '特力屋',
      bulletPoints: [
        '參與大型電商重構專案 (Monorepo/Next.js/React 18)',
        '從 0 到 1 獨立開發電商 CMS 系統',
        '主導高互動活動頁開發與效能優化',
        '維護 CI/CD 流程與程式碼開發規範文件 (Coding Style)',
      ],
      skills: ['NX', 'React', 'Zustand', 'TypeScript', 'Tailwind CSS'],
      projectUrl: '/projects?category=frontend',
    },
    {
      period: '2021-2022',
      company: '104 Job Bank',
      title: '產品經理 (Product Owner)',
      logoType: 'italicText',
      logoColor: 'transparent',
      logoText: '104',
      bulletPoints: [
        '主導新會員導入專案，協調 6 個工程團隊',
        '重構共用類目管理後台介面與體驗 (UI/UX)',
        '應用自然語言處理 (NLP) 模組設計文字切詞規則',
      ],
      skills: ['Project Management', 'GA/GTM', 'NLP'],
      projectUrl: '/projects?category=pm',
    },
    {
      period: '2021/2-2021/9',
      company: 'ft (豐趣科技)',
      title: '後端軟體工程師',
      logoType: 'text',
      logoColor: '#F39C12',
      logoText: 'ft',
      bulletPoints: [
        '優化購票完成郵件系統與後台介面',
        '參與第三方 API 串接與測試驗證',
        '協助金流服務系統開發與 API 測試',
      ],
      skills: ['Java', 'Grails', 'MySQL'],
      projectUrl: '/projects?category=backend',
    },
  ],
  education: [
    {
      school: '國立臺北商業大學',
      department: '應用外語系',
      logoColor: '#9B4D96',
      logoText: 'NTUB',
    },
  ],
};
