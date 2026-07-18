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
        '參與大型電商前端架構改版，將 Single Repo 重構為 Monorepo，並從 React 17 升級至 React 18、Bootstrap 轉換為 Tailwind CSS，全面導入 TypeScript',
        '主導特力屋與 HOLA 官網畫面改版與獨立化，盤點既有 API 與前端邏輯，重構頁面並開發新功能',
        '從 0 到 1 獨立開發電商後台組版系統，建立可擴充前端架構，支援業務快速調整廣告版位',
        '獨立開發聖誕樹活動頁，實作複雜的商品選擇邏輯與狀態管理，並串接購物車與結帳流程',
        '制定 coding style 與 folder structure 並落實文件化，維護前端套件版本策略與 CI/CD 流程',
        '協助導入 AI 工具於開發流程，並參與 code review 協助新進同仁上手',
      ],
      skills: ['NX', 'React', 'Redux', 'Zustand', 'TypeScript', 'Tailwind CSS'],
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
        '主導新會員導入專案，整合 6 個工程團隊，協調產品與工程需求邊界，預期轉換率達 50%',
        '重構全公司共用的類目管理後台，優化十年舊系統的操作流程與可讀性，提升跨團隊協作效率',
        '主導自我推薦信改版專案，跨部門協作推進上線，瀏覽量提升 3 倍以上',
        '應用自然語言處理 (NLP) 模組設計文字切詞與判斷規則，建立職缺語意辭典支援機器學習訓練',
        '透過 GA／GTM 追蹤使用者行為與成效，作為產品迭代依據',
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
        '開發旅遊票券平台核心流程，涵蓋線上購票、搶票與交易通知',
        '優化購票完成郵件系統與後台介面，撰寫開發與串接文件',
        '主導貓空纜車第三方 API 串接專案，使用 Postman 測試驗證並撰寫測試程式碼',
        '協助金流服務系統 API 測試與 code review，確保串接穩定性與資料正確性',
      ],
      skills: ['Java', 'Grails', 'MySQL', 'jQuery'],
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
