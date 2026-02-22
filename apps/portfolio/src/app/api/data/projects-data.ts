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
      '原本兩個品牌各自維護專案，React 版本不一致、樣式架構混亂，共用邏輯分散。加入公司不到三個月，我就參與這場前端底層重建。這不是單純升級版本，而是決定未來 3–5 年技術走向的架構轉型。我參與 PoC 驗證與實際落地開發，從新人慢慢成為最熟悉整體架構的人。對我來說，架構的價值在於讓後面的人更好走。',
    imageUrl: Testrite1.src,
    link: '/projects/testrite-refactor',
    tags: [
      'Monorepo Migration',
      'React 18 Upgrade',
      'Architecture Design',
    ],
    technologies: [
      'Next.js',
      'React 18',
      'NX Monorepo',
      'Tailwind CSS',
      'TypeScript',
    ],
    media: [
      { type: 'image', url: Testrite1.src },
      { type: 'image', url: Testrite2.src },
      { type: 'image', url: Testrite3.src },
      { type: 'image', url: Testrite4.src },
      { type: 'image', url: Testrite5.src },
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
      { label: 'HOLA Presentation', url: 'https://docs.google.com/presentation/d/1qkb68aICPlDcfbuCWM9oc-d-gkMQBuno/edit?usp=sharing&ouid=114070508472121616155&rtpof=true&sd=true', type: 'presentation', },
    ],
    sections: [
      {
        title: '技術驗證與導入測試',
        content:
          '最大的難題不是「要不要用 NX」，而是舊專案高度耦合該怎麼拆？React 18 升級會不會出現不可預期問題？Tailwind 與 Bootstrap 如何共存？我與資深工程師一起進行 PoC 測試，實際驗證並行渲染影響範圍、共用 lib 抽離可行性與 TypeScript 轉換成本，整理實測結果提供團隊決策依據。',
      },
      {
        title: '架構落地與實際開發',
        content:
          '架構定案後真正的挑戰才開始。API 邏輯分散、模組邊界模糊、舊頁面需要邊跑邊改。我負責資料流整合與 API 串接，在實務中重新思考模組切分與型別設計，確保架構能長期支撐商業需求。',
      },
      {
        title: '技術傳承與團隊影響',
        content:
          '資深工程師離職後，我成為最熟悉整體架構的人，開始協助新人理解專案結構與開發規範。這段經驗讓我不只是寫功能，而是開始思考如何建立一個能被傳承的系統。',
      },
    ],
  },

  {
    id: 'christmas-tree',
    title: '聖誕樹專案－客製體驗式商品頁',
    category: '前端專案',
    period: '2024',
    description:
      '為聖誕購物季量身打造的高互動活動頁面，整合複雜的客製化邏輯與即時畫面更新，提供消費者身歷其境的購物體驗。',
    imageUrl: XmasTree1.src,
    link: '/projects/christmas-tree',
    tags: ['Interactive', 'State Design', 'Performance'],
    technologies: [
      'React',
      'RTK Query',
      'Zustand',
      'Framer Motion',
      'Tailwind CSS',
    ],
    media: [
      { type: 'image', url: XmasTree1.src },
      { type: 'image', url: XmasTree2.src },
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
        title: '資料流設計與狀態同步機制',
        content:
          '正式區與測試區 SKU 各自獨立，無法直接共用邏輯，因此我先設計一層 SKU mapping abstraction，將不同環境商品映射至統一前端資料模型，避免環境差異污染業務邏輯。\n\n頁面 mount 時呼叫 product-list API 取得完整商品資料，轉換為 normalized 結構後存入 Zustand。狀態依照吊飾類別切分，確保單一分類更新不會觸發整體 re-render。\n\n當使用者加減商品數量時，會：\n1. 更新對應 SKU 數量\n2. 重新計算總價\n3. 根據 SKU 對應圖片與座標配置，動態渲染到樹上\n\n所有邏輯皆集中在狀態層計算，UI 僅負責呈現，確保資料流單向且可追蹤。這讓整個高度互動頁面在複雜條件下仍能維持穩定與一致性。'
      },
      {
        title: '效能優化：降低 Zustand 更新頻率',
        content:
          '在專案初期我更重視功能正確性，但功能穩定後，我會回頭檢視資料流與 render 次數。這次透過合併請求與一次性寫入 store，降低不必要的 state update。\n我習慣在專案完成後，再進行一輪效能與資料流檢討。對我而言，持續優化是工程的一部分。\n初版實作使用 useQuery 以吊飾分類拆開打 product-list API（星星 / 吊飾 / 緞帶…）。雖然拆分後邏輯直覺，但代價是：每個分類 API 回來就觸發一次 Zustand 寫入，導致初始化階段產生大量 state update 與 re-render，頁面載入體感偏重。\n優化後改用 useQueries 併發請求所有分類，並在「全部請求完成」後才進行資料 mapping、分類整理與 normalize，最後一次性寫入 Zustand。\n這個改動的關鍵不是減少 API，而是把多次零碎的 store 更新收斂成一次，明顯改善初始載入的渲染成本與互動順暢度。'
      }
    ],
  },
  {
  id: 'cms-development',
  title: '電商廣告組版系統 (CMS) 開發',
  category: '前端專案',
  period: '2025',
  description:
    '以前更新官網廣告版位都需要工程師修改程式並重新部署，流程耗時且高度依賴技術人員。本專案從零開始設計並實作一套可視化組版系統，使營運人員能自行管理版位內容，同時維持資料結構的嚴謹性與前台版型穩定性。此專案不僅優化營運流程，更重構了版型管理與資料模型之間的關係，建立可擴充與可長期維護的架構基礎。',
  imageUrl: NewBackoffice1.src,
  link: '/projects/cms-development',
  tags: ['Internal Tool', 'Schema Design', 'Dynamic Component', 'CMS'],
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
      title: '專案角色與開發範圍',
      content:
        '主導系統從需求定義到正式上線的完整流程，包含與營運團隊釐清操作情境、設計版型抽象結構與資料 Schema、建立動態元件載入機制、開發可擴充編輯系統、API 串接與發布流程設計。上線後完成交接並持續優化，目前新增版型與功能皆能在既有架構下擴充，無需重構核心邏輯。',
    },
    {
      title: '動態元件載入機制（Dynamic Component Injection）',
      content:
        '前台版位採資料驅動渲染設計，每一種版型對應一個 component mapping。前台依據後台設定的版型 type，動態載入對應元件並渲染內容。此設計使新增版型時僅需註冊對應 component，而不需修改既有渲染流程，大幅降低擴充成本並提升架構穩定性。',
    },
    {
      title: 'Schema-based 編輯系統設計',
      content:
        '同一個編輯區塊可能因版型不同而產生不同輸入欄位（例如 Banner 需要圖片與連結，商品橫滑需要商品 SKU，影片區塊需要影片 URL）。為避免為每種版型撰寫獨立表單，因此設計 schema-based 表單生成機制：每種版型定義欄位結構，系統依據 schema 動態生成對應輸入元件，並統一處理資料驗證與格式轉換。此設計讓新增版型時只需新增 schema，而不需重寫整套編輯邏輯。',
    },
    {
      title: '資料與版型分離設計',
      content:
        '系統將版型結構與內容資料分離。版型負責定義區塊排列與欄位規格，資料僅儲存實際內容與排序資訊。透過此設計，即使調整版型樣式，也不影響既有資料格式，確保長期維護穩定性與向後相容性。',
    },
    {
      title: '功能亮點與系統能力',
      content:
        '系統支援多種版型註冊機制、拖拉排序（DND）、即時預覽、權限管理、操作紀錄追蹤與安全發布流程。前後台資料一致性由統一資料模型控管，避免非法格式破壞前台頁面。此專案將工程部署頻率顯著降低，同時保留版型控制與資料安全。',
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
