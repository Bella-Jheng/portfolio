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
  AiScript1,
} from '@/public/img';

export const PROJECTS_DATA_ZH: FullProject[] = [
  {
    id: 'testrite-refactor',
    title: 'HOLA / TLW 電商平台前端架構重構',
    category: '前端專案',
    displayCategory: '前端專案',
    period: '2023 - 2024',
    description:
      '原本兩個品牌各自維護專案，React 版本不一致、樣式架構混亂，共用邏輯分散。加入公司不到三個月，我就參與這場前端底層重建。這是決定未來 3–5 年技術走向的架構轉型。我參與 PoC 驗證與實際落地開發，從新人慢慢成為最熟悉整體架構的人。對我來說，架構的價值在於讓後面的人更好走。',
    imageUrl: Testrite1.src,
    link: '/projects/testrite-refactor',
    tags: ['Monorepo Migration', 'React 18 Upgrade', 'Architecture Design'],
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
        label: 'HOLA 專案簡報',
        url: 'https://docs.google.com/presentation/d/1qkb68aICPlDcfbuCWM9oc-d-gkMQBuno/edit?usp=sharing&ouid=114070508472121616155&rtpof=true&sd=true',
        type: 'presentation',
      },
      {
        label: 'HOLA 官網',
        url: 'https://www.hola.com.tw/',
        type: 'website',
      },
      {
        label: '特力屋官網',
        url: 'https://www.trplus.com.tw/',
        type: 'website',
      },
    ],
    sections: [
      {
        title: 'HOLA 前端架構重構：從 Single-repo 到 NX Mono-repo',
        tabLabel: '架構重構',
        whatIDid: [
          '參與 HOLA 前端從 single-repo 到 NX mono-repo 的架構重構規劃與落地，範圍涵蓋目錄結構、React 版本、元件寫法、樣式框架、測試框架的全面實測與轉換。',
          '2022/12/13：提出架構需求，開始規劃',
          '2023/7/24：進入首頁、商品頁、館分類頁、大中分類頁、搜尋結果頁的新頁面開發',
          '2023/10/23：進入新頁面整合測試',
          '2023/11/29：正式上線（前後歷時約 365 天）',
        ],
        techUsed: ['NX Monorepo', 'React 18', 'TypeScript', 'Tailwind CSS', 'Jest'],
        challenges:
          '現象：舊架構為了因應反覆變更的需求，舊的元件及樣式不敢棄用，只能直接疊加開發新的，導致程式不斷龐大；新舊元件因部分流程共用，舊流程也無法完整移除，遺留大量無用程式碼；最終打包（上版）時間拉長到約 20 分鐘。\n\n除錯過程：盤點整個 single-repo 的目錄結構後發現，Utilities、Components 底下都是「hola」跟「others」混雜在一起，沒有清楚的模組邊界——這才是複用性低、程式碼持續膨脹的根本原因，不是元件本身寫得不好。同時也重新檢視了 React 17、Class-based 元件、Bootstrap 各自造成的限制：Bootstrap 需要注入在全站最外層，header 與 body 版本有差時頁面會直接跑版；Class-based 元件在複雜情境下 this 指向容易出錯。\n\n解法：以 NX 建立 mono-repo 的目錄需求，把 Utilities/Apis/Components 從「hola/tlw 混雜」改成 Apps 底下依品牌（hola/tlw）獨立分工、各自管理自己的 Utility/Apis/Components，並把常用小工具、元件（header/footer/商品卡）提升到最外層共用；同步升級 React 18（拿到 automatic batching 全面套用到所有狀態更新，而非僅限 event listener，並可用 Suspense/Transition）、改用 Functional 元件、樣式框架換成 Tailwind（scoped 樣式解決感染問題、支援 tree-shaking），並新增 Jest 測試框架。',
        comparisonTable: {
          columns: ['項目', '原架構', '新架構'],
          rows: [
            ['目錄架構', 'single-repo', 'mono-repo'],
            ['開發工具', '無', 'NX'],
            ['React 版本', '17 版', '18 版'],
            ['元件寫法', 'Class-based', 'Functional'],
            ['樣式框架', 'Bootstrap', 'Tailwind'],
            ['測試框架', '無', 'Jest'],
          ],
        },
        learnings:
          '打包時間從 17m2s 降到 7m45s，減少超過一半；也學到架構轉型不是每項技術都非黑即白（例如 Class-based 在複雜狀態批次操作與生命週期控制上其實仍有優勢），取捨要基於實際情境的限制與代價，而不是單純追新。這麼大的轉型也需要拆成規劃→開發→整合測試→上線分階段推進，才不會失控。',
      },
      {
        title: '狀態管理演進：從 Redux Toolkit 到 Zustand + React Query',
        tabLabel: '狀態管理',
        whatIDid:
          '專案初期規劃階段確認採用 redux-toolkit 作為狀態管理方案，實際開發後重新評估非同步 API 資料與跨元件共享狀態的處理方式，逐步把 redux-toolkit 換成 React Query + Zustand 的組合。',
        techUsed: ['Zustand', 'React Query (useQuery/useMutation)', 'Redux Toolkit（前期方案）'],
        challenges:
          '現象：商品頁的非同步請求很多也很雜（規格切換、庫存查詢、折價券查詢…），照原訂計畫用 redux-toolkit 寫，每加一種查詢就要多寫一個 slice，loading/error 狀態也得自己手動維護，程式碼量越堆越多。\n\n除錯過程：重新盤點這些狀態的性質後發現，它們幾乎都是「跟後端要資料」的查詢型行為，跟 redux 原本設計拿來處理的「跨元件共享同步 UI 狀態」性質根本不同，用同一套工具硬做，才是樣板程式碼爆量的根因；同時也在會議中明確定義兩種 hook 的分野：useQuery 用在查詢類（如折價券查詢），useMutation 用在異動類（如加入購物車）。\n\n解法：把「非同步 API 資料」全部改用 React Query 的 useQuery/useMutation 管理（自動處理 loading/error/cache），redux-toolkit 只保留給少數真正需要跨元件共享的同步狀態，後續這部分也逐步被更輕量的 Zustand 取代，redux-toolkit 最終在專案裡完全淡出。',
        comparisonTable: {
          columns: ['面向', 'Redux Toolkit（原方案）', 'React Query + Zustand（改後）'],
          rows: [
            ['非同步 API 資料', '需手動寫 slice + thunk，loading/error 自行維護', 'useQuery/useMutation 自動處理 loading/error/cache'],
            ['跨元件同步狀態', '同樣用 redux slice 處理', '改用 Zustand，API 更輕量、幾乎無侵入性'],
            ['新增一種查詢', '需多寫一個 slice + reducer', '直接呼叫 useQuery，不需額外樣板'],
            ['最終定位', '全站唯一狀態方案', '逐步淡出，僅過渡期殘留'],
          ],
        },
        learnings:
          '不是「先選定一個狀態管理工具就要用到底」，而是依資料性質分別選擇：Zustand 處理跨元件共享的同步狀態，React Query 處理非同步資料的 cache 與重新驗證；兩者搭配比單用 Redux Toolkit 更貼近實際需求，也降低樣板程式碼。',
      },
      {
        title: '共用元件邊界設計：從 HOLA 專屬到跨品牌共用',
        tabLabel: '共用元件設計',
        whatIDid:
          '2023 年架構重構時，NX mono-repo 已經把 Apps 底下規劃成 hola、tlw 各自獨立的目錄；但 2024 年 TLW 真正啟動開發時，才發現原本歸在共用層的 libs/hola-layout、libs/hola-ui-component 命名與內容其實是綁死給 HOLA 用的，需要重新界定「真正共用」與「品牌專屬」的邊界，同時釐清 libs/utilities（真正與業務邏輯無關的共用 function/hook）該收斂哪些內容。',
        techUsed: ['Nx Libs', 'Nx affected build/test', 'Component Boundary Design'],
        challenges:
          '現象：TLW 改版啟動時，第一直覺是直接沿用 HOLA 已經寫好、放在共用層資料夾的 libs/hola-layout、libs/hola-ui-component。\n\n除錯過程：實際攤開這些元件的內容才發現，雖然放在「共用」的資料夾位置，但命名、樣式變數、甚至部分邏輯都是綁死給 HOLA 用的；若 TLW 直接 import，等於把品牌耦合的程式碼當成通用元件繼承過去，但若每個品牌各自複製一份，又會讓 Nx workspace 的 affected build/test（只重建真正變動的專案）失去意義，兩個品牌會被迫綁在一起重建。\n\n解法：與團隊討論後，把「真正跟業務邏輯脫鉤、任何品牌都能直接套用」的部分抽出來另開資料夾管理，hola-layout/hola-ui-component 維持專屬給 HOLA 用，TLW 需要的共用邏輯則獨立拆分，確保 Nx affected 機制仍然只會抓到真正有變動的專案。',
        comparisonTable: {
          columns: ['面向', 'Before（TLW 啟動時）', 'After（重新界定後）'],
          rows: [
            ['libs/hola-layout, hola-ui-component', '被視為共用層，TLW 打算直接沿用', '維持專屬 HOLA，不再視為跨品牌共用'],
            ['真正通用的邏輯', '與品牌邏輯混在同一個 lib 內', '拆分獨立資料夾，供 TLW 與後續品牌共用'],
            ['Nx affected build/test', '若各自複製一份，affected 範圍會失準', '共用邊界清楚後，affected 只重建真正變動的專案'],
          ],
        },
        learnings:
          '「放在共用目錄」不等於「真的可以共用」，共用層的判斷標準應該是「這段程式碼是否與特定品牌的業務邏輯脫鉤」，而不是資料夾位置；之後規劃新共用元件時會先問「這是通用邏輯，還是剛好目前只有一個品牌在用」。',
      },
    ],
  },
  {
    id: 'christmas-tree',
    title: '聖誕樹專案－客製體驗式商品頁',
    category: '前端專案',
    displayCategory: '前端專案',
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
        label: '專案展示影片',
        url: 'https://www.youtube.com/watch?v=bxVzMaaWvIo',
        type: 'presentation',
      },
    ],
    sections: [],
  },
  {
    id: 'cms-development',
    title: '電商廣告組版系統 (CMS) 開發',
    category: '前端專案',
    displayCategory: '前端專案',
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
      { type: 'image', url: NewBackoffice1.src },
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=SSTAaGTBkQU',
        thumbnailUrl: NewBackoffice2.src,
      },
    ],
    links: [
      {
        label: '專案文案介紹',
        url: 'https://hackmd.io/@-pJOuWsHT5qfiLSWl-nBgQ/SJk21fAIge/edit',
        type: 'document',
      },
      {
        label: '系統展示影片',
        url: 'https://www.youtube.com/watch?v=SSTAaGTBkQU',
        type: 'presentation',
      },
    ],
    sections: [],
  },
  {
    id: 'component-scaffold-script',
    title: 'AI 輔助開發組版元件自動化腳本',
    category: 'AI 實作',
    displayCategory: 'AI 實作',
    period: '2026',
    description:
      '將新增一個廣告組版元件的人工開發流程標準化成 SOP，並寫成一支參數化 script，只要填入元件的命名參數，就能自動產出型別定義、元件映射、模組匯出與測試資料，把原本含測試需要 {{5 個工作天}} 的開發時程縮短到 {{2 天}}，完成率達 {{80%}}，比人工更快速也更準確。下方連結的 SOP 文件已經過隱碼處理，隱去前公司內部系統名稱與商業機敏資訊，以保護前公司資安與隱私。',
    imageUrl: AiScript1.src,
    link: '/projects/component-scaffold-script',
    tags: ['Developer Tooling', 'Process Automation', 'SOP Design'],
    technologies: ['Node.js', 'TypeScript', 'React', 'Codegen'],
    media: [
      { type: 'image', url: AiScript1.src },
    ],
    links: [
      {
        label: 'SOP 文件已隱碼處理',
        url: 'https://hackmd.io/@KkiMC7PPQueku3pX2dHGeg/BkNETl-VMe',
        type: 'document',
      },
    ],
    sections: [
      {
        title: 'SOP 標準化與 Script 自動化開發',
        tabLabel: 'SOP 與自動化',
        whatIDid: [
          '盤點新增一個廣告組版元件的完整人工開發流程，發現同樣的步驟，包含註冊 ad_code、元件映射設定、型別定義、模組匯出、測試資料，每次都要在 {{5、6 個不同檔案}}裡手動修改，只有命名不同',
          '把這套隱性流程收斂成一份標準 SOP 文件，定義出 {{8 個命名參數}}，像是 [ad_code]、[FolderName]、[ComponentName]、[HandlerName]、[ChineseName]，也涵蓋參考既有 TLW 或 HOLA 元件當範本的情境',
          '產出後保留約 20% 讓工程師手動處理，像是 UI 客製樣式、特殊業務邏輯，script 的目標訂在把重複、有規則可循的部分做到 {{80% 完成率}}，而不是強求全自動',
        ],
        techUsed: ['SOP 文件化', 'Node.js', 'Codegen Script', 'Process Design'],
        challenges:
          '人工開發一個新的組版元件平均要花 {{5 個工作天}}，含測試，但把時程攤開後發現，大部分工時並不是花在這個元件獨有的邏輯上，而是重複性的樣板工作，只要漏改其中一個檔案，通常要等到 Runtime 噴錯才會發現。導入初期最擔心產出的程式碼品質不可靠，甚至事後檢查花的時間比自己開發還久，所以每一步都用既有元件的真實案例回測，確認產出的程式碼結構、命名與 export 都跟人工版本一致才算過關。\n\n上線後追蹤實際工時，證實開發時程{{從平均 5 個工作天縮短到 2 個工作天}}，骨架完成率達到 {{80%}}，工程師只需要專注在最後的 UI 客製與業務邏輯。',
        comparisonTable: {
          columns: ['項目', '人工開發流程', 'Script 自動化流程'],
          rows: [
            ['開發時程含測試', '{{5 個工作天}}', '{{2 個工作天}}'],
            ['涉及檔案異動', '需手動修改 5～6 個檔案，容易漏改', '依 SOP 規則自動產生，涵蓋所有固定異動點'],
            ['元件骨架完成率', '依開發者經驗與熟悉度浮動', '{{80%}}，型別、映射、匯出、測試資料全部就位'],
            ['一致性', '依賴開發者記憶或複製舊元件', '統一透過參數化規則產出，結果一致'],
          ],
        },
        learnings: [
          '工程師的槓桿在於把重複、有規則可循的工作抽象成清楚的流程與參數，再用工具把它系統化，保留剩下的 20% 讓工程師處理真正需要判斷的部分，比起追求 100% 全自動更務實',
          '這是 AI 進場後我第一次嘗試用 AI 完成的內容，{{一開始其實很排斥 AI 的到來}}，身為工程師難免有種傲氣和自尊心，不希望自己做的事情被取代',
          '透過這次嘗試更清楚自己的價值，在於更專注在溝通，把使用者真正需要的做出來，也把重心放在產出比以往更細膩的內容',
          '過去常為了縮短工時而顧不到程式效能與品質，現在用 AI 縮短工時後，能把心思放回程式品質，也趁機磨練自己 review code 的能力',
          'AI 時代下工程師需要的能力，不再是用的技術有多炫砲、邏輯力有多強，而是能不能發現痛點並解決',
        ],
      },
    ],
  },
  {
    id: 'portfolio',
    title: '個人作品集平台',
    category: '前端專案',
    displayCategory: '前端專案',
    period: '2026',
    description:
      '不僅是一個作品展示平台，更是我對前端技術的整合與實踐。透過 Next.js 與 MSW 的整合，實現了前後端協作模式。',
    imageUrl: Portfolio1.src,
    link: '/projects/portfolio',
    tags: ['Tailwind', 'Next.js', 'Personal Design', 'MSW'],
    technologies: ['Next.js', 'Tailwind CSS', 'React Query', 'MSW', 'Zustand'],
    media: [
      { type: 'image', url: Portfolio1.src },
      { type: 'image', url: Portfolio2.src },
      { type: 'image', url: Portfolio3.src },
      { type: 'image', url: Portfolio4.src },
      { type: 'image', url: Portfolio5.src },
    ],
    links: [
      {
        label: 'GitHub 原始碼匯總',
        url: 'https://github.com/Bella-Jheng/portfolio',
        type: 'github',
      },
      {
        label: '預覽展示網站',
        url: 'https://portfolio-liard-pi-12.vercel.app/',
        type: 'website',
      },
    ],
    sections: [],
  },
  {
    id: 'self-management-workflow',
    title: '工作排程與管理',
    category: '其他',
    displayCategory: '其他',
    period: 'Ongoing',
    description:
      '建立一套高效的工作管理流程，使用 Notion 進行任務拆解與優先順序排列。這不僅讓主管能即時掌握進度，促進溝通效率，更詳細記錄了每個任務的實作歷程與技術難點，最終將這些寶貴經驗與解法同步回專案管理系統，形成完整的知識庫。',
    imageUrl: Management1.src,
    link: '/projects/self-management-workflow',
    tags: ['Notion', 'Workflow', 'Documentation', 'Communication'],
    technologies: ['Notion', 'Time Management', 'Knowledge Base'],
    media: [
      { type: 'image', url: Management1.src },
      { type: 'image', url: Management2.src },
      { type: 'image', url: Management3.src },
    ],
    links: [],
    sections: [],
  },
  {
    id: 'pm-projects',
    title: '預備會員產品專案規格書',
    category: 'PM 專案',
    displayCategory: 'PM 專案',
    period: '2021-2022',
    description:
      '擔任產品負責人（Product Owner），主導多項跨團隊協作專案，包含三個工程團隊、設計團隊、測試團隊、行銷及業務團隊之間的溝通橋樑。',
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
        label: '規格書範例展示',
        url: 'https://y6sx3j.axshare.com/#g=1&p=%E5%B0%88%E6%A1%88%E7%B0%A1%E4%BB%8B&dp=0&c=1',
        type: 'document',
      },
    ],
    sections: [],
  },
  {
    id: 'funtour-system',
    title: '旅遊票券平台',
    category: '後端專案',
    displayCategory: '後端專案',
    period: '2021/2-2021/9',
    description:
      '參與旅遊票券平台後端系統開發，負責購票完成郵件系統優化、第三方 API 串接（如貓空纜車）以及金流服務協助開發，確保交易流程穩定可靠。',
    imageUrl: BackEnd1.src,
    link: '/projects/funtour-system',
    tags: ['Backend', 'API Integration', 'Email System'],
    technologies: ['Java', 'Grails', 'MySQL', 'Postman', 'API Documentation'],
    media: [
      { type: 'image', url: BackEnd1.src },
      { type: 'image', url: BackEnd2.src },
    ],
    links: [],
    sections: [],
  },
];
