import { FullProject } from '../project-detail-api.type';
import {
  XmasTree1,
  XmasTree2,
  XmasTree3,
  NewBackoffice1,
  NewBackoffice2,
  Portfolio1,
  Portfolio2,
  Portfolio3,
  Portfolio4,
  Portfolio5,
  Management1,
  Management2,
  Management3,
  Testrite1,
  Testrite2,
  Testrite3,
  Testrite4,
  Testrite5,
  PM1,
  BackEnd1,
  BackEnd2,
} from '@/public/img';

export const PROJECTS_DATA: FullProject[] = [
  {
    id: 'testrite-refactor',
    title: 'HOLA / TLW 電商平台前端架構重構',
    category: '前端專案',
    period: '2023 - 2024',
    description:
      '參與 HOLA 與特力屋電商平台前端底層架構轉型，建立穩固的 Monorepo 與 React 18 基礎。自 2023 年起，基於此強大架構陸續完成首頁、商品頁、分類頁與購物車等核心頁面改版。作為核心成員，我不僅負責技術傳承，更見證了新架構如何大幅降低開發門檻，讓團隊成員能高效創造更多價值。',
    imageUrl: Testrite1.src,
    link: '/projects/testrite-refactor',
    tags: [
      'Monorepo Migration',
      'React 18 Upgrade',
      'Cross-team Collaboration',
    ],
    technologies: [
      'Next.js',
      'React 18',
      'NX Monorepo',
      'Tailwind CSS',
      'TypeScript',
    ],
    media: [
      {
        type: 'image',
        url: Testrite1.src,
      },
      {
        type: 'image',
        url: Testrite2.src,
      },
      {
        type: 'image',
        url: Testrite3.src,
      },
      {
        type: 'image',
        url: Testrite4.src,
      },
      {
        type: 'image',
        url: Testrite5.src,
      },
    ],
    links: [
      {
        label: 'HOLA Website',
        url: 'https://www.hola.com.tw/',
        type: 'website',
      },
      {
        label: 'TLW Website',
        url: 'https://www.trplus.com.tw/',
        type: 'website',
      },
      {
        label: 'HOLA Presentation',
        url: 'https://docs.google.com/presentation/d/1qkb68aICPlDcfbuCWM9oc-d-gkMQBuno/edit?usp=sharing&ouid=114070508472121616155&rtpof=true&sd=true',
        type: 'presentation',
      },
    ],
    sections: [
      {
        title: '背景與轉型契機',
        content:
          '原有專案採 Single Repository 架構，品牌專案各自維護且技術版本不一致（React 17 / Bootstrap），共用邏輯分散、維護成本高。隨品牌擴展與功能複雜度提升，團隊決定導入 NX Monorepo 並進行全面技術升級。',
      },
      {
        title: '技術驗證與導入測試',
        content:
          '在架構師規劃方向下，與資深工程師共同負責新技術導入前的驗證與 PoC 測試。評估 Monorepo 與既有專案的耦合程度，測試 React 18 升級相容性、Tailwind 對既有樣式架構的影響，以及 TypeScript 型別遷移可行性。分析各項技術優劣、實測開發效率提升幅度，並整理評估結果供團隊決策參考。',
      },
      {
        title: '架構落地與實際開發',
        content:
          '架構穩定上線後，依序參與頁面與模組實作，負責 API 串接驗測與資料流程整合。在實務開發中深化對模組邊界劃分、型別設計與可維護性結構的理解，確保新架構能穩定支撐實際商業需求。',
      },
      {
        title: '持續改版與架構效益',
        content:
          '基於重構後的穩固架構，自 2023 年至今持續推進首頁、商品頁、分類頁與購物車頁的現代化改版。模組化與標準化的設計不僅加速了功能迭代，更顯著降低了新頁面的開發門檻，讓後續加入的開發人員能在此基礎上快速創造出高品質的頁面與功能。',
      },
      {
        title: '跨團隊溝通與整合角色',
        content:
          '在專案推進過程中，擔任 PM、前端外包團隊與後端團隊之間的技術溝通橋樑。協助釐清 API 規格、對齊實作細節與驗收標準，降低溝通成本並確保開發節奏穩定。',
      },
      {
        title: '成長與影響',
        content:
          '從入職未滿三個月的新人開始參與架構轉型專案，全程見證技術決策到穩定上線過程。在資深前輩離職後，不僅成為團隊中唯一透徹了解整體架構的成員，更承擔起技術傳承的責任，協助新進學弟妹理解專案結構與開發規範。此經驗不僅奠定了架構設計能力，更培養了帶領團隊與知識管理的軟實力。',
      },
    ],
  },
  {
    id: 'christmas-tree',
    title: '聖誕樹專案-客製體驗式商品頁',
    category: '前端專案',
    period: '2024',
    description:
      '為聖誕購物季量身打造的高互動活動頁面，整合複雜的客製化邏輯與即時畫面更新，提供消費者身歷其境的購物體驗。',
    imageUrl: XmasTree1.src,
    link: '/projects/christmas-tree',
    tags: ['Interactive', 'State Management', 'UX'],
    technologies: [
      'React',
      'RTK Query',
      'Zustand',
      'Framer Motion',
      'Tailwind CSS',
    ],
    media: [
      {
        type: 'image',
        url: XmasTree1.src,
      },
      {
        type: 'image',
        url: XmasTree2.src,
      },

      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=bxVzMaaWvIo',
        thumbnailUrl: XmasTree3.src,
      },
    ],
    links: [
      {
        label: 'Video Demo',
        url: 'https://www.youtube.com/watch?v=bxVzMaaWvIo',
        type: 'presentation',
      },
    ],
    sections: [
      {
        title: '專案背景',
        content:
          '聖誕樹商品具有高度多樣性（尺寸、裝飾、底座），傳統的電商商品頁難以展現組合後的樣貌。',
      },
      {
        title: '主要技術核心',
        content:
          '1. 商品選擇後的資料模型設計:\n設計前端資料結構與狀態管理方式，確保多商品組合下的資料可追蹤、可擴充且具備高可維護性。\n2. 即時價格動態計算機制:\n使用前端運算邏輯，在使用者點選商品的同時進行即時價格重算，確保 UI 與最終金額狀態完全同步。\n3. 裝飾圖片動態載入與定位系統:\n根據使用者選擇，動態載入對應裝飾圖片，並精準渲染至指定座標位置，確保畫面互動即時且流暢。\n4. 高效圖片載入與資料存取優化:\n透過資源預載、lazy loading 與狀態快取策略，降低 re-render 與 API 負擔，提升整體畫面效能與使用體驗。\n5. 批次購物車 API 交易控制與rollback機制:\n設計批次發送購物車 API 流程，若任一請求失敗即觸發 rollback，確保資料一致性與交易完整性。',
      },
      {
        title: '核心挑戰',
        content:
          '此頁面為高度互動型客製化商品頁，核心挑戰在於：\n・前端效能優化\n・複雜資料流設計\n・即時運算與 UI 同步控制\n・交易一致性管理\n是一個對「前端架構設計能力」與「效能優化思維」要求極高的專案。',
      },
    ],
  },
  {
    id: 'cms-development',
    title: '電商廣告組版系統 (CMS) 開發',
    category: '前端專案',
    period: '2025',
    description:
      '從零到一開發內部廣告組版工具，讓營運人員能透過後台直接調整官網廣告版位，大幅降低工程端重複性的維護工作。',
    imageUrl: NewBackoffice1.src,
    link: '/projects/cms-development',
    tags: ['Ad', 'Internal Tool', 'CMS', 'Efficiency'],
    technologies: [
      'React',
      'Nx',
      'TypeScript',
      'DND Kit',
      'Tailwind CSS',
      'API Integration',
    ],
    media: [
      {
        type: 'image',
        url: NewBackoffice1.src,
      },
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=SSTAaGTBkQU',
        thumbnailUrl: NewBackoffice2.src,
      },
    ],
    links: [
      {
        label: 'Document Intro',
        url: 'https://hackmd.io/@-pJOuWsHT5qfiLSWl-nBgQ/SJk21fAIge/edit',
        type: 'document',
      },
      {
        label: 'Video Demo',
        url: 'https://www.youtube.com/watch?v=SSTAaGTBkQU',
        type: 'presentation',
      },
    ],
    sections: [
      {
        title: '參與開發項目',
        content:
          '從無到有主導系統開發流程，包含畫面設計、需求釐清、與使用者溝通、切版、邏輯實作、正式上線與後續維運。並交接於學弟妹，目前仍持續維運中、開發更多元的編輯設計及版位需求。',
      },
      {
        title: '需求分析',
        content:
          '以前更新版位需要工程師修改程式碼並重新部署，耗時且效率低。目標是建立一個讓非工程背景的同仁也能簡單操作的系統。',
      },
      {
        title: '功能亮點',
        content:
          '兼容多種版型、多種編輯框、嚴謹資料內容管理、視覺化預覽、即時發布、權限管理與操作紀錄追蹤。支援多種版塊類型（Banner、商品橫滑、影片區塊等）。',
      },
    ],
  },
  {
    id: 'portfolio',
    title: 'Personal Portfolio Platform',
    category: '前端專案',
    period: '2026',
    description:
      '不僅是一個作品展示平台，更是我對前端技術的整合與實踐。透過 Next.js 與 MSW 的整合，實現了前後端協作模式。',
    imageUrl: Portfolio1.src,
    link: '/projects/portfolio',
    tags: ['Tailwind', 'Next.js', 'Personal Design', 'MSW'],
    technologies: ['Next.js', 'Tailwind CSS', 'React Query', 'MSW', 'Zustand'],
    media: [
      {
        type: 'image',
        url: Portfolio1.src,
      },
      {
        type: 'image',
        url: Portfolio2.src,
      },
      {
        type: 'image',
        url: Portfolio3.src,
      },
      {
        type: 'image',
        url: Portfolio4.src,
      },
      {
        type: 'image',
        url: Portfolio5.src,
      },
    ],
    links: [
      {
        label: 'GitHub Code',
        url: 'https://github.com/Bella-Jheng/portfolio',
        type: 'github',
      },
      {
        label: 'Demo Site',
        url: 'https://yiting-portfolio.vercel.app',
        type: 'website',
      },
    ],
    sections: [
      {
        title: '設計理念與技術核心',
        content:
          '想打造一個具備個人特色的作品集。技術上採用 Nx 及 Next.js 架構，並結合 MSW 模擬 API 環境，確保即便在沒有真實後端的情況下，也能模擬完整的資料互動。',
      },
      {
        title: '動態效果與使用者體驗',
        content:
          '為了增加操作的流暢度與互動感，於各頁面增加花的動態元素，以及各區塊的滑入動畫，讓使用者在瀏覽時能有更佳的體驗。',
      },
      {
        title: '架構優化',
        content:
          '架構使用 Nx 進行專案管理，並結合 MSW (Mock Service Worker) 模擬 API 環境，確保即便在沒有真實後端的情況下，也能模擬完整的資料互動。',
      },
      {
        title: '技術挑戰',
        content:
          '如何將履歷與過往的電商經驗結合，並在有限的版面內呈現豐富的內容，同時保持良好的使用者體驗。',
      },
      {
        title: '未來規劃',
        content:
          '持續優化網站並結合廣告平台設置理念，未來我不再需要手工更新 MSW 的測試資料，而是有一個後台能夠隨心所欲入稿。',
      },
    ],
  },
  {
    id: 'self-management-workflow',
    title: '工作排程與管理',
    category: '其他',
    period: 'Ongoing',
    description:
      '建立一套高效的工作管理流程，使用 Notion 進行任務拆解與優先順序排列。這不僅讓主管能即時掌握進度，促進溝通效率，更詳細記錄了每個任務的實作歷程與技術難點，最終將這些寶貴經驗與解法同步回專案管理系統，形成完整的知識庫。',
    imageUrl: Management1.src,
    link: '/projects/self-management-workflow',
    tags: ['Notion', 'Workflow', 'Documentation', 'Communication'],
    technologies: ['Notion', 'Time Management', 'Knowledge Base'],
    media: [
      {
        type: 'image',
        url: Management1.src,
      },
      {
        type: 'image',
        url: Management2.src,
      },
      {
        type: 'image',
        url: Management3.src,
      },
    ],
    links: [],
    sections: [
      {
        title: '任務管理與優先順序',
        content:
          '平時我會使用 Notion 記錄每一張 Task，並進行優先順序的排列，確保重要且緊急的事項能被優先處理，同時也協助我釐清每日的工作重點。',
      },
      {
        title: '透明化溝通',
        content:
          '透過清晰的工單狀態與進度記錄，讓主管能清楚知道我目前手上的工作內容與進度，大幅降低溝通成本，並在遇到需要調整資源的情況時，能有客觀的依據進行討論。',
      },
      {
        title: '實作歷程與知識沉澱',
        content:
          '在執行任務的過程中，我會詳細記錄實作歷程以及遇到的困難。當任務完成後，這些記錄會被整理並同步回公司的工單系統，作為完整的開發紀錄，這不僅方便日後回溯，也能成為團隊的共享知識庫。',
      },
    ],
  },
  {
    id: 'pm-projects',
    title: '預備會員產品專案規格書',
    category: 'PM 專案',
    period: '2021-2022',
    description:
      '擔任 Product Owner，主導多項跨團隊協作專案，包含三個工程團隊、設計團隊、測試團隊、行銷及業務團隊之間的溝通橋樑。',
    imageUrl: PM1.src,
    link: '/projects/pm-projects',
    tags: ['Product Management', 'Cross-team', 'NLP'],
    technologies: ['GA', 'GTM', 'Loki NLP', 'Spec Documentation'],
    media: [
      {
        type: 'image',
        url: PM1.src,
      },
    ],
    links: [
      {
        label: 'Spec Document (Sample)',
        url: 'https://y6sx3j.axshare.com/#g=1&p=%E5%B0%88%E6%A1%88%E7%B0%A1%E4%BB%8B&dp=0&c=1',
        type: 'document',
      },
    ],
    sections: [
      {
        title: '【產品說明】',
        content:
          '規劃將其他平台的資料快速轉換成104履歷的串接流程，目前合作平台：整招簡歷平台、元太數位-大專院校ep系統。',
      },
      {
        title: '【負責工作】',
        content:
          '1. 提案說明\n2. 溝通：與設計討論頁面實用性、與三方串接工程確認細部規格、與QA討論TC、與業務及行銷協調產品走向\n3. 履歷表、註冊、啟用會員流程盤點\n4. 撰寫規格書\n5. 測試網頁製作 (自學前端框架 React 自製外部平台)',
      },
    ],
  },
  {
    id: 'funtour-system',
    title: '旅遊票券平台',
    category: '後端專案',
    period: '2021/2-2021/9',
    description:
      '參與旅遊票券平台後端系統開發，負責購票完成郵件系統優化、第三方 API 串接（貓空纜車）以及金流服務協助開發，確保交易流程穩定可靠。',
    imageUrl: BackEnd1.src,
    link: '/projects/funtour-system',
    tags: ['Backend', 'API Integration', 'Email System'],
    technologies: ['Java', 'Grails', 'MySQL', 'Postman', 'API Documentation'],
    media: [
      {
        type: 'image',
        url: BackEnd1.src,
      },
      {
        type: 'image',
        url: BackEnd2.src,
      },
    ],
    sections: [
      {
        title: '核心工作內容',
        content:
          '優化購票完成郵件系統，規劃系統串接架構並撰寫開發文件。參與貓空纜車第三方串接專案，使用 Postman 進行 API 測試驗證、重構串接文件並撰寫測試程式碼。',
      },
      {
        title: '金流與測試經驗',
        content:
          '協助金流服務系統開發，參與 API 測試、Code Review 並撰寫串接文件。這段經驗培養了我對資料正確性、失敗情境處理與測試流程的高度敏感度。',
      },
      {
        title: '使用介面 UI/UX 優化',
        content: '',
      },
      {
        title: '文件化與協作',
        content:
          '將營運需求轉化為工程規格文件，確保需求正確實作並降低溝通成本。撰寫並維護 API 串接文件，支援外部系統與第三方服務順利整合。',
      },
    ],
  },
];
