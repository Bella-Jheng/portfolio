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
  Bazi1,
  Bazi2,
  Bazi3,
  Bazi4,
  Bazi5,
  Bazi6,
} from '@/public/img';

export const PROJECTS_DATA_ZH: FullProject[] = [
  {
    id: 'bazi',
    title: '八字命理：AI 命盤分析工具',
    category: 'AI 實作',
    displayCategory: 'AI 實作',
    period: '2026',
    description:
      '因為自己喜歡算命，買了徐玉蘭老師的課程後，學是學了，但是懶得背規則，所以把徐老師的智慧灌進去，創造了這個網站。歡迎看到這篇的各位也算算看，{{目前已經累積50位用戶，網站經過用戶回饋已校正第三版，有近8成用戶都說準}}，歡迎試算～\n\n輸入出生年月日時即可取得 AI 命理解析。\n\n• 綁定 Google 帳號，每人擁有專屬空間與每日提問額度\n• 知識庫管理後台，AI 自動打標籤並依五行篩選精準檢索\n• 支援分享卡片下載、行動裝置原生分享\n• 上線後成為朋友間話題，也讓我對命盤規則更加熟練',
    imageUrl: Bazi1.src,
    link: '/projects/bazi',
    tags: ['AI Integration', 'RAG', 'Firebase', 'Full-Stack'],
    technologies: [
      'Next.js 16',
      'Firebase Firestore',
      'Google Gemini API',
      'TanStack Query',
      'Tailwind CSS',
      'Vitest',
    ],
    media: [
      { type: 'image', url: Bazi1.src },
      { type: 'image', url: Bazi2.src },
      { type: 'image', url: Bazi3.src },
      { type: 'image', url: Bazi4.src },
      { type: 'image', url: Bazi5.src },
      { type: 'image', url: Bazi6.src },
    ],
    links: [
      {
        label: '展示網站',
        url: 'https://portfolio-bazi.vercel.app/',
        type: 'website',
      },
      {
        label: '開發記錄 DEVLOG',
        url: 'https://github.com/Bella-Jheng/portfolio/blob/main/apps/bazi/DEVLOG.md',
        type: 'document',
      },
    ],
    sections: [
      {
        title: '專案動機與開發心得',
        tabLabel: '開發心得',
        whatIDid:
          '##卡關契機##{{完整記錄已經寫在開發記錄 DEVLOG，點擊上方連結可查看完整內容}}，以下是扼要說明。\n學了線上課程後發現八字規則太多背不起來，實戰常卡關，於是把課程影片字幕爬出來讓 AI 整理成知識庫，並做成網站讓朋友也能用',
        techUsed: ['Next.js 16', 'Firebase', 'Google Gemini API', 'TypeScript'],
        challenges: [
          '##成本飆升##知識庫變大後，AI 提示詞全量塞入知識會讓 token 費用飆升、分析品質下降',
          '##登入卡關##朋友用 LINE 打開連結登入 Google 帳號時，被內建瀏覽器擋下回傳 403，完全無法登入',
          '##邏輯散落##Firestore 讀寫邏輯散落在多個 API 路由裡，同樣的業務流程被複製貼上好幾次',
        ],
        learnings:
          '##離職緣由##這是我離職後做的作品。離職前我有點職業倦怠，AI 取代了我很多解 bug 的成就感，加上在公司大多是做別人的東西、很多決定不由自己，即使喜歡公司環境，我還是選擇離開。\n\n##主管的話##離職前和主管閒聊，他提到自己在用 AI 做一個以前想都不敢想的皮克敏外掛，過去不懂前端總是卡關，現在靠 AI 終於實現了。他說做了 20 年，成就感也該跟著時代迭代，以前土法煉鋼完成一個專案很有成就感，現在能快速做出過去不敢想的東西更快樂，寫程式不只是為了賺錢，也能把它帶進生活裡。他說：你不妨試試看把程式帶入你的生活。\n\n##重新愛上##當下我似懂非懂，直到做完這個網站才真正明白。它讓我完成更多想做的事，還能跟朋友分享，每次聽到「算得很準」，都讓我更想把它做得更好，更在短短一周內快速學習後端，把我以往不敢嘗試的內容通通做出來。或許本身要做同一個工作這麼久就需要勇氣，還有各種契機去調整自己的心態，這次的嘗試除了打開我的眼界外，更讓我重新愛上寫程式',
      },
    ],
  },
  {
    id: 'testrite-refactor',
    title: 'HOLA / TLW 電商平台前端架構重構',
    category: '前端專案',
    displayCategory: '前端專案',
    period: '2023 - 2024',
    description:
      'HOLA 與特力屋 TLW 原本各自維護前端專案，版本落差、樣式混亂、共用邏輯分散，改一個共用問題要改兩次。我加入公司不到三個月就參與這場前端底層重建，這是決定公司未來 3 到 5 年技術走向的架構轉型。\n\n• 主導技術驗證 PoC，用實測結果而非直覺支持架構決策\n• 整合兩品牌進同一個 Monorepo，統一升級框架、改寫元件、換掉樣式系統\n• 建置時間從近 20 分鐘縮短到不到 8 分鐘\n• 資深同事離職後，逐步成為團隊最熟悉整體架構的人，協助新人上手',
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
        title: 'HOLA 前端架構重構，從 Single-repo 到 NX Mono-repo',
        tabLabel: '架構重構',
        whatIDid: [
          '##重構範疇##參與 HOLA 前端從 single-repo 到 NX mono-repo 的架構重構規劃與落地，範圍涵蓋目錄結構、React 版本、元件寫法、樣式框架、測試框架的全面實測與轉換。',
          '##規劃啟動##2022/12/13 提出架構需求，開始規劃',
          '##新頁開發##2023/7/24 進入首頁、商品頁、館分類頁、大中分類頁、搜尋結果頁的新頁面開發',
          '##整合測試##2023/10/23 進入新頁面整合測試',
          '##正式上線##2023/11/29 正式上線，前後歷時約 365 天',
        ],
        techUsed: ['NX Monorepo', 'Nx Graph', 'React 18', 'TypeScript', 'Tailwind CSS', 'Jest'],
        challenges:
          '##舊架構包袱##舊架構為了因應反覆變更的需求，舊的元件及樣式不敢棄用，只能直接疊加開發新的，導致程式不斷龐大，新舊元件因部分流程共用，舊流程也無法完整移除。另一個關鍵原因是元件沒有模組化，各個專案又各自安裝重複的 node_modules，導致某個頁面不再使用時，沒辦法確定哪些程式碼可以安全刪除、哪些還被其他地方依賴，只能整批留著，遺留大量無用程式碼，最終打包上版時間拉長到約 20 分鐘。\n\n##根因盤點##盤點整個 single-repo 的目錄結構後發現，Utilities、Components 底下都是 hola 跟 others 混雜在一起，沒有清楚的模組邊界，這才是複用性低、程式碼持續膨脹的根本原因，不是元件本身寫得不好。同時也重新檢視了 React 17、Class-based 元件、Bootstrap 各自造成的限制，Bootstrap 需要注入在全站最外層，header 與 body 版本有差時頁面會直接跑版，Class-based 元件在複雜情境下 this 指向容易出錯。\n\n##重構方案##後來用 NX 建立 mono-repo 的目錄結構，把 Utilities/Apis/Components 從 hola/tlw 混雜的狀態，改成 Apps 底下依品牌 hola/tlw 獨立分工，各自管理自己的 Utility/Apis/Components，並把常用小工具、元件 header/footer/商品卡提升到最外層共用，同步升級 React 18，拿到 automatic batching 全面套用到所有狀態更新，而非僅限 event listener，並可用 Suspense/Transition，改用 Functional 元件，樣式框架換成 Tailwind，用 scoped 樣式解決感染問題，支援 tree-shaking，並新增 Jest 測試框架。Nx 也內建 nx graph，能快速視覺化元件之間的相依關係，之後要判斷某個元件或頁面能不能刪除，一眼就能看出還有沒有其他地方在用，不用再靠人工翻程式碼確認。',
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
          '##轉型心得##打包時間從 17m2s 降到 7m45s，減少超過一半，也學到架構轉型不是每項技術都非黑即白，像 Class-based 在複雜狀態批次操作與生命週期控制上其實仍有優勢，取捨要基於實際情境的限制與代價，而不是單純追新。這麼大的轉型也需要拆成規劃→開發→整合測試→上線分階段推進，才不會失控。也體會到相依關係不透明時，工程師會傾向保守不刪程式碼，久了就是一堆廢 code，把相依關係視覺化之後，砍舊程式碼才有依據，這也是後來能持續維持程式碼庫精簡的關鍵工具。',
      },
      {
        title: '狀態管理演進，從 Redux Toolkit 到 Zustand + React Query',
        tabLabel: '狀態管理',
        whatIDid:
          '##方案轉換##專案初期規劃階段確認採用 redux-toolkit 作為狀態管理方案，實際開發後重新評估非同步 API 資料與跨元件共享狀態的處理方式，逐步把 redux-toolkit 換成 React Query + Zustand 的組合。',
        techUsed: ['Zustand', 'React Query', 'Redux Toolkit'],
        challenges:
          '##樣板爆量##商品頁的非同步請求很多也很雜，包含規格切換、庫存查詢、折價券查詢，照原訂計畫用 redux-toolkit 寫，每加一種查詢就要多寫一個 slice，loading、error 狀態也得自己手動維護，程式碼量越堆越多。\n\n##性質誤判##重新盤點這些狀態的性質後發現，它們幾乎都是跟後端要資料的查詢型行為，跟 redux 原本設計拿來處理的跨元件共享同步 UI 狀態性質根本不同，用同一套工具硬做，才是樣板程式碼爆量的根因，同時也在會議中明確定義兩種 hook 的分野，useQuery 用在查詢類，像是折價券查詢，useMutation 用在異動類，像是加入購物車。\n\n##逐步淡出##後來把非同步 API 資料全部改用 React Query 的 useQuery/useMutation 管理，自動處理 loading、error、cache，redux-toolkit 只保留給少數真正需要跨元件共享的同步狀態，後續這部分也逐步被更輕量的 Zustand 取代，redux-toolkit 最終在專案裡完全淡出。',
        comparisonTable: {
          columns: ['面向', 'Redux Toolkit 原方案', 'React Query + Zustand 改後'],
          rows: [
            ['非同步 API 資料', '需手動寫 slice + thunk，loading/error 自行維護', 'useQuery/useMutation 自動處理 loading/error/cache'],
            ['跨元件同步狀態', '同樣用 redux slice 處理', '改用 Zustand，API 更輕量、幾乎無侵入性'],
            ['新增一種查詢', '需多寫一個 slice + reducer', '直接呼叫 useQuery，不需額外樣板'],
            ['最終定位', '全站唯一狀態方案', '逐步淡出，僅過渡期殘留'],
          ],
        },
        learnings:
          '##依性質選型##不是先選定一個狀態管理工具就要用到底，而是依資料性質分別選擇，Zustand 處理跨元件共享的同步狀態，React Query 處理非同步資料的 cache 與重新驗證，兩者搭配比單用 Redux Toolkit 更貼近實際需求，也降低樣板程式碼。',
      },
      {
        title: '共用元件邊界設計，從 HOLA 專屬到跨品牌共用',
        tabLabel: '共用元件設計',
        whatIDid:
          '##邊界不明##2023 年架構重構時，NX mono-repo 已經把 Apps 底下規劃成 hola、tlw 各自獨立的目錄，但 2024 年 TLW 真正啟動開發時，才發現原本歸在共用層的 libs/hola-layout、libs/hola-ui-component 命名與內容其實是綁死給 HOLA 用的，需要重新界定真正共用與品牌專屬的邊界，同時釐清 libs/utilities 這種真正與業務邏輯無關的共用 function/hook 該收斂哪些內容。',
        techUsed: ['Nx Libs', 'Nx affected build/test', 'Component Boundary Design'],
        challenges:
          '##直覺沿用##TLW 改版啟動時，第一直覺是直接沿用 HOLA 已經寫好、放在共用層資料夾的 libs/hola-layout、libs/hola-ui-component。\n\n##耦合風險##實際攤開這些元件的內容才發現，雖然放在共用的資料夾位置，但命名、樣式變數，甚至部分邏輯都是綁死給 HOLA 用的，若 TLW 直接 import，等於把品牌耦合的程式碼當成通用元件繼承過去，但若每個品牌各自複製一份，又會讓 Nx workspace 只重建真正變動專案的 affected build/test 失去意義，兩個品牌會被迫綁在一起重建。\n\n##重新分工##與團隊討論後，把真正跟業務邏輯脫鉤、任何品牌都能直接套用的部分抽出來另開資料夾管理，hola-layout/hola-ui-component 維持專屬給 HOLA 用，TLW 需要的共用邏輯則獨立拆分，確保 Nx affected 機制仍然只會抓到真正有變動的專案。',
        comparisonTable: {
          columns: ['面向', 'Before TLW 啟動時', 'After 重新界定後'],
          rows: [
            ['libs/hola-layout, hola-ui-component', '被視為共用層，TLW 打算直接沿用', '維持專屬 HOLA，不再視為跨品牌共用'],
            ['真正通用的邏輯', '與品牌邏輯混在同一個 lib 內', '拆分獨立資料夾，供 TLW 與後續品牌共用'],
            ['Nx affected build/test', '若各自複製一份，affected 範圍會失準', '共用邊界清楚後，affected 只重建真正變動的專案'],
          ],
        },
        learnings:
          '##共用真義##放在共用目錄不等於真的可以共用，共用層的判斷標準應該是這段程式碼是否與特定品牌的業務邏輯脫鉤，而不是資料夾位置，之後規劃新共用元件時會先問，這是通用邏輯，還是剛好目前只有一個品牌在用。',
      },
    ],
  },
  {
    id: 'christmas-tree',
    title: '聖誕樹客製體驗商品頁專案',
    category: '前端專案',
    displayCategory: '前端專案',
    period: '2024',
    description:
      '為聖誕購物季打造的高互動客製化商品頁，讓使用者像組裝真樹一樣，自由搭配樹種、樹頂星、燈飾、吊飾、緞帶、樹裙六個部位配件，組出專屬聖誕樹。\n\n• 支援正反面即時預覽，價格隨選購即時更新\n• 處理多重限制邏輯，特定樹種不相容樹裙、吊飾上限 7 個並自動分配正反面位置\n• 中途離開頁面可保留選擇，直到結帳才清除\n• 串接購物車，處理重複客製化時的確認與覆蓋流程，確保頁面與購物車一致',
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
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=bxVzMaaWvIo',
        thumbnailUrl: XmasTree3.src,
      },
      { type: 'image', url: XmasTree1.src },
      { type: 'image', url: XmasTree2.src },
    ],
    links: [
      {
        label: '專案展示影片',
        url: 'https://www.youtube.com/watch?v=bxVzMaaWvIo',
        type: 'presentation',
      },
    ],
    sections: [
      {
        title: '資料模型設計',
        tabLabel: '資料模型',
        whatIDid: [
          '##選購模型##以 Zustand 設計選購資料模型，涵蓋樹種、樹頂星、燈飾、吊飾、緞帶、樹裙六個部位，單選部位存字串、吊飾採可重複的字串陣列記錄款式與數量',
          '##位置設計##吊飾的正反面位置不額外開欄位儲存，而是用陣列順序當作排列依據，索引 0 到 3 對應正面，4 到 6 對應背面，搭配一個全域的正反面 boolean 狀態，渲染時依當前視角決定要畫哪一段陣列',
          '##持久化策略##導入 Zustand persist middleware，將 selectedList／selectedSetNum／customSelectedList 存進 sessionStorage，讓使用者中途離開頁面再返回時能還原選擇，直到結帳完成才清除；商品庫存資料與正反面視角則不持久化，重新整理後一律重打 API、預設回到正面',
        ],
        techUsed: ['Zustand', 'Zustand persist middleware', 'TypeScript', 'React'],
        challenges:
          '##欄位精簡##一開始想過要幫每個裝飾品額外存在哪個視角、第幾個位置，但這樣寫入邏輯會變得很重，新增或刪除都要同步維護位置編號。後來改成讓陣列順序本身就代表位置，視角只用單一全域旗標表示，資料結構單純很多，但也代表所有該顯示正面還是背面的判斷都要在寫入陣列的當下同步算好，不能事後才推導。',
        learnings:
          '##狀態精簡##不是所有狀態都需要獨立欄位，能用既有結構，像是陣列順序，隱含表達的資訊，就不用另外設計欄位去重複記錄，減少一份資料就少一份要同步的風險，哪些狀態需要持久化、哪些該在重新整理後重置，也要在設計階段就想清楚，而不是全部無腦存。',
      },
      {
        title: '即時運算與 UI 同步控制',
        tabLabel: '即時同步',
        whatIDid: [
          '##衍生計算##用 Zustand 的 computed middleware 把 totalPrice、totalQty、isAllSelected 都設計成從 selectedList 衍生的計算屬性，而不是額外用 action 手動更新，選購狀態一變、金額與數量自動重算',
          '##三處同步##串接成品展示圖、價格提示文字、已選清單三處 UI，全部訂閱同一份 store，運算結果與畫面同步更新，確保使用者操作過程中的預算透明度',
        ],
        techUsed: ['Zustand', 'Zustand computed middleware', 'RTK Query', 'React'],
        challenges:
          '##漏算風險##同一個操作，像是點選一個吊飾，會牽動畫面上至少三處不同區塊的顯示與一次金額重算，如果各自用 local state 處理，很容易漏更新或算錯總價，如果改成每次選購動作都手動呼叫重算價格的 action，又容易漏呼叫。改用衍生計算屬性後，金額永遠是 selectedList 的函式，不會有忘記重算這種狀態，所有子元件訂閱同一份 store 就能保證畫面與價格同步。',
        learnings:
          '##杜絕漏算##能用衍生計算表達的狀態，就不要存成獨立欄位再手動同步，把 totalPrice 設計成 selectedList 的計算結果，而不是另一個要自己維護的 state，從根本上排除了忘記更新總價這類 bug 的可能性。',
      },
      {
        title: '動態影像載入與定位系統',
        tabLabel: '效能與定位',
        whatIDid: [
          '##動態定位##每個裝飾品的圖片都用非同步函式依 SKU 動態載入，並用固定的絕對定位座標，依斷點切換 px 值，把星星、吊飾、緞帶、樹裙精準釘在聖誕樹圖上',
          '##鏡像節省##緞帶只存一張圖檔，透過 CSS scale-x(-1) 鏡像出另一側，同一張素材畫出左右兩邊，不用多存一份反向圖檔',
          '##窄螢幕隱藏##用 ResizeObserver 監聽外層容器尺寸，容器寬度小於 120px 時直接隱藏裝飾圖層，避免在極窄螢幕下擠壓變形',
          '##定位獨立##切換聖誕樹主體圖片時，樹頂星、吊飾、緞帶、樹裙的定位邏輯完全獨立於底圖，不會因為換了樹種而跑位或被重算',
        ],
        techUsed: ['React', 'ResizeObserver', 'Tailwind CSS', 'Framer Motion'],
        challenges:
          '##解耦挑戰##聖誕樹裝飾是高頻互動的圖形場景，使用者可能快速切換樹種、增減多個吊飾，若每個裝飾都要重新計算座標，介面很容易出現延遲或錯位。挑戰在於把底圖是什麼和裝飾釘在哪裡拆成兩件互不影響的事，底圖只是背景圖替換，裝飾的定位邏輯完全不看底圖是哪一棵樹，換底圖不會觸發任何裝飾重新計算位置。',
        learnings:
          '##解耦心得##效能問題往往不是單一元件慢，而是資料與渲染沒有解耦，把裝飾定位設計成完全不依賴底圖選擇，才能在高頻互動下維持流暢，也讓日後新增裝飾類型或調整版型時，不需要牽動底圖切換的邏輯。',
      },
      {
        title: '跨裝置滾動與預覽體驗',
        tabLabel: '滾動體驗',
        whatIDid: [
          '##Scrub 同步##桌機版用 GSAP ScrollTrigger 建立 scrub 動畫，讓右側樹狀預覽面板的捲動位置跟隨左側選購清單的捲動進度等比例同步，而不是單純用 CSS sticky 固定',
          '##收合預覽##行動裝置版設計了可收合的預覽小樹迷你列，預設收起，輕點才展開成完整預覽疊層，避免在小螢幕上讓操作區與預覽區永久搶畫面',
          '##購物條收合##監聽捲動方向與頁尾位置，讓底部購物條在使用者向下捲動時自動收起、接近頁尾時完全隱藏，減少常駐 UI 對內容的遮擋',
        ],
        techUsed: ['GSAP', 'ScrollTrigger', 'React'],
        challenges:
          '##Sticky 侷限##桌機版原本可以直接用 CSS position: sticky 讓預覽面板固定在畫面上，但實際需求是預覽面板要跟著左側清單的捲動進度等比例捲動，而不是完全靜止不動，純 CSS 做不到這種與捲動進度綁定的效果，因此改用 GSAP ScrollTrigger 的 scrub 模式，把左側清單的捲動距離對應到右側面板的捲動位移。行動裝置螢幕小，操作區跟預覽區無法同時常駐，因此拆成預設收合、需要時才展開的互動模式。',
        learnings:
          '##捲動選材##不是所有跟著捲動的需求都適合用 CSS sticky 解決，當需要捲動進度跟另一個區塊的位移量綁定時，還是得靠 scrub 動畫這類工具，行動裝置的介面設計也讓我更清楚，預設隱藏、需要才展開比硬塞進畫面更符合小螢幕的操作邏輯。',
      },
      {
        title: '複雜業務邏輯控制',
        tabLabel: '業務邏輯',
        whatIDid: [
          '##互斥檢查##設計互斥與相容性檢查，用 useEffect 監看選中的樹種 SKU，若符合特定條件，正式站與測試站各自對應不同 SKU 代碼，就自動把樹裙選項禁用並重設為不選擇，樹種換回相容款式時自動解除限制',
          '##視角聯動##實作吊飾數量與視角的自動化聯動，每次新增或刪除吊飾都會即時計算目前總數，超過 4 個就自動切到背面視角，少於 5 個就切回正面，讓使用者不用手動切換也能看到剛才動到的裝飾',
          '##範本切換##單選與吊飾複選都遵守同一條規則，只要使用者手動調整任何配件，若目前選的是預設靈感組合就自動切換成自由搭配，避免使用者以為自己在編輯範本，卻其實正在覆蓋不存在的狀態',
        ],
        techUsed: ['Zustand', 'React', 'TypeScript'],
        challenges:
          '##邊界風險##這些規則彼此會互相影響，新增一個吊飾同時要判斷陣列長度是否要觸發視角切換，也要判斷目前是不是該從靈感組合轉成自由搭配，兩件事都要在同一次操作裡同步完成，稍有疏漏就會出現畫面切到背面了，但陣列裡其實還在前 4 格之類的邊界情況。做法是把這些判斷都收在同一個事件處理函式裡依序執行，而不是分散成多個各自訂閱、各自反應的 effect，減少互相搶跑的風險。',
        learnings:
          '##單一入口##條件式業務邏輯越多，越需要確保觸發時機是可控的單一入口，而不是讓多個 effect 各自監聽同一份狀態、各自觸發，後者很容易因為執行順序不確定而產生邊界情況，把相關聯的判斷寫在同一個處理函式裡，即使程式碼看起來長一點，也比拆成多個 effect 更容易推理正確性。',
      },
      {
        title: '購物車 API 交易編排與衝突處理',
        tabLabel: '交易控制',
        whatIDid: [
          '##先查後寫##設計先查詢、再決定的加入購物車流程，點擊結帳時先呼叫購物車查詢 API，確認購物車裡是否已經有舊的客製化聖誕樹商品，而不是直接把新選購的商品硬塞進去',
          '##衝突確認##偵測到衝突時跳出確認彈窗，讓使用者選擇保留原客製或確認更新，使用者選擇更新後，才依序先移除購物車裡的舊樹相關品項，全部移除成功後再依序寫入新選購的每個部位',
          '##序列送出##把新增與移除購物車都拆成單筆 API 依序等待的序列，而不是平行送出，每一筆呼叫都個別收集錯誤訊息，任一筆失敗會彙整成清單顯示給使用者，而不是整批失敗後不知道哪筆出錯',
          '##狀態一致##全部品項成功寫入購物車後才清除頁面的選購狀態 sessionStorage 並導向購物車頁，確保頁面看到的客製化樹與購物車裡實際的商品隨時保持一致',
        ],
        techUsed: ['RTK Query', 'Zustand'],
        challenges:
          '##重複到訪##這個頁面的操作結果最終要跟購物車這個外部系統對齊，而使用者可能不是第一次來，購物車裡可能已經有一棵舊的客製化樹。如果不先查詢就直接寫入，會變成新舊商品同時存在購物車裡，使用者反而搞不清楚哪組才是最新選的。挑戰在於要用查詢、確認、依序移除、依序新增這個多步驟流程取代單純的一次性寫入，並且每一步都要能個別回報成功或失敗，而不是把六、七個部位包成一個大請求送出去。',
        learnings:
          '##先查後動##涉及外部系統，也就是購物車，且使用者可能重複造訪時，不能假設這是第一次加入購物車，先查詢現況、偵測衝突、讓使用者確認，比事後才發現購物車裡有兩棵樹再讓客服善後，省下的成本高很多。把多筆寫入拆成依序執行並個別收集錯誤，也讓失敗時能明確告訴使用者是哪個品項出了問題，而不是一句籠統的新增失敗。',
      },
    ],
  },
  {
    id: 'cms-development',
    title: '電商廣告組版系統 (CMS) 開發',
    category: '前端專案',
    displayCategory: '前端專案',
    period: '2025',
    description:
      '過去官網廣告版位異動都需要工程師改程式、重新部署，一次調整常要等好幾天。我{{從零設計並開發}}了一套可視化組版系統（CMS）。\n\n• 讓營運人員能自行拖拉排版、上傳圖片、編輯內容，不必再排工程師時間\n• 把版型結構與內容資料分離，維持前台版型穩定與資料嚴謹\n• 支援即時預覽、權限管理，擴充新版型不需改動核心邏輯\n• 上線後版位更新從跨部門排時程，縮短到營運人員自己幾分鐘內完成',
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
        type: 'video',
        url: 'https://www.youtube.com/watch?v=SSTAaGTBkQU',
        thumbnailUrl: NewBackoffice2.src,
      },
      { type: 'image', url: NewBackoffice1.src },
    ],
    links: [
      {
        label: '專案介紹文件',
        url: 'https://hackmd.io/@KkiMC7PPQueku3pX2dHGeg/ryBfTgWNGe',
        type: 'document',
      },
      {
        label: '系統展示影片',
        url: 'https://www.youtube.com/watch?v=SSTAaGTBkQU',
        type: 'presentation',
      },
    ],
    sections: [
      {
        title: '系統架構設計與跨品牌共用',
        tabLabel: '架構設計',
        whatIDid: [
          '##三層架構##把整個系統拆成三個層次來設計：最外層決定畫面整體長怎樣，中間層負責判斷該顯示哪一種內容元件區塊，最底層才是各種內容元件區塊本身（例如商品卡、Banner、文章卡）',
          '##動態載入##各種元件區塊採用{{動態載入}}的方式組成頁面，後台設定用哪個區塊，畫面就會顯示對應的內容，之後新增新的區塊類型也不會影響到既有的區塊',
          '##所見即所得##後台編輯畫面跟正式上線的頁面共用同一套顯示邏輯，{{做到所見即所得}}：營運人員在後台編輯、預覽時看到的畫面，會跟消費者上線後看到的畫面完全一致，不會有「後台看起來對，上線卻跑版」的落差',
          '##雙品牌隔離##因為系統同時服務兩個品牌網站，把每個內容元件區塊拆成「預設資料」跟「資料格式規則」兩部分分開管理，讓「內容元件怎麼運作」跟「內容資料長什麼樣」互不干擾，之後{{其中一個品牌調整內容元件，不會影響到另一個品牌}}',
        ],
        techUsed: ['React', 'TypeScript', 'Nx Monorepo', 'Dynamic Component Loading'],
        challenges:
          '##品牌解耦##兩個品牌共用同一套系統，但各自的品牌樣式、既有商品卡、既有頁面結構都不同，如果內容邏輯直接寫死給單一品牌，之後另一品牌要用就得整包複製一份。把「內容元件區塊怎麼運作」跟「內容資料長什麼樣」拆開管理後，兩者互不干擾，共用的部分留在共用層，品牌專屬的部分各自獨立管理，之後要擴充第三個品牌也能沿用同一套骨架。',
        learnings:
          '##共用層原則##多品牌共用系統的關鍵不是把程式碼硬合併成一份，而是把「資料的樣子」和「內容區塊怎麼運作」分開，讓真正共用的部分留在共用層。這個判斷標準後來也延續套用到後續其他共用元件的規劃上。',
      },
      {
        title: '欄位分群設計，讓後台編輯更有規範',
        tabLabel: '資料設計',
        whatIDid: [
          '##扁平欄位##原本系統最底層的資料欄位沒有分組，所有輸入框都放在同一層，新增或刪除欄位時沒有統一規範，容易越疊越亂',
          '##邏輯分組##依照資料的邏輯關係，把最底層的欄位重新分組',
          '##自動收合##{{依照每個分組的需求，讓畫面自動產生對應的收合框}}，或加上可設定的標題，讓使用者填寫資料時能清楚分辨自己正在編輯哪一組內容',
        ],
        techUsed: ['TypeScript', 'Data Grouping', 'Component Design'],
        challenges:
          '##規範缺失##最底層的資料欄位原本沒有分組，所有輸入框都放在同一層，這代表無論是新增還是刪除一個欄位，都沒有明確的規則可以依循，只能憑經驗判斷要往哪裡插入或刪除，容易越疊越亂，也讓相關的欄位在畫面上看起來雜亂無章、彼此沒有關聯。重新把這些欄位依照邏輯關係分組後，加或減欄位時只需要在對應的分組裡操作，畫面也能依照分組自動產生收合框或標題，讓使用者一眼就能看出哪些欄位是同一組內容。',
        learnings:
          '##分組價值##看似只是「幫欄位分類」這種小事，實際上決定了一個系統好不好維護。沒有分組的資料結構在欄位少的時候看不出問題，但只要欄位一多，新增、刪除就會失去規範，越改越亂。把資料依照邏輯關係分組，不只是讓畫面好看，更是幫後續維護的人（包含未來的自己）建立一套清楚的規則可以依循。',
      },
      {
        title: '跨欄位的必填規則設計',
        tabLabel: '必填檢核',
        whatIDid: [
          '##兩種規則##針對「這幾個欄位只要有一個填了就算通過」或「這幾個欄位都要填才算通過」這類跨欄位規則，設計了兩種基礎規則類型',
          '##邏輯組合##支援把規則用「並且」「或者」的邏輯組合起來，涵蓋像「圖片那組或文字那組，擇一填寫完整即可」這種需要組合判斷的情境',
          '##錯誤提示##規則設定跟畫面上的提示文字綁在一起，使用者按下確認時，系統會統一跑過所有規則，並清楚標出是哪裡沒填對',
        ],
        techUsed: ['TypeScript', 'Validation Rule Design'],
        challenges:
          '##單欄位不足##有些元件的必填邏輯不是單一欄位能決定的，例如「標題、副標、內文三選一有值即可」，沿用單一欄位原本的必填設定完全無法表達這種情境。一開始考慮讓每個元件自己寫檢查邏輯，但這樣要嘛規則寫死在元件裡不好維護，要嘛每個元件的檢查時機、提示文字格式都不一致。最後收斂成兩種規則類型（任一有值、全部有值）搭配「並且/或者」組合，並明訂用「任一有值」規則時，該欄位本身不能再另外設成必填，避免規則互相打架。',
        learnings:
          '##拆解通用##遇到「這個規則好像很特殊」的需求時，先嘗試拆解成更小的通用邏輯（任一、全部），比直接開一個專用的例外處理更划算。兩三種基礎規則搭配「並且/或者」組合，通常就能涵蓋掉大部分實務上的例外情境。',
      },
      {
        title: '編輯即時性與效能的取捨',
        tabLabel: '效能優化',
        whatIDid: [
          '##流程改造##把輸入內容的資料流程從「使用者游標移開輸入框時才更新畫面狀態（onBlur），再逐層往上傳回主要資料庫」，改成「使用者輸入的當下就先在本地更新內容（onChange），再透過（debounce）防抖方式寫回主要資料庫」',
          '##流程精簡##同時簡化了中間的資料傳遞層級，移除不再需要的中介程式與相關檔案',
        ],
        techUsed: ['React', 'State Management', 'Zustand'],
        challenges:
          '##即時換效能##舊流程的資料儲存跟必填檢查都掛在「游標移開輸入框」這個時機點，但檢查邏輯常常搶先在儲存動作之前執行，導致抓到的是使用者上一次輸入的舊資料，而不是當下畫面顯示的值。同時舊架構要層層傳遞資料才能把值送回最上層更新狀態，元件之間耦合度高。改成使用者輸入當下就同步更新內容後，資料即時性提升，但也讓每個欄位多一層額外運算，畫面重新渲染的次數變多，這部分持續優化中，也在評估是否調整整體儲存結構來平衡即時性與效能。',
        learnings:
          '##正確優先##解決「資料不同步」的問題不代表沒有代價，這次是把即時性換成了效能。工程上很多時候沒有兩全其美的解法，重要的是先確保正確性（能拿到當下的真實資料），效能可以之後迭代優化，順序不能顛倒。',
      },
      {
        title: '檔期排程與預覽部署流程',
        tabLabel: '排程部署',
        whatIDid: [
          '##區塊排程##排程功能做到可以精細到「單一內容區塊」而不只是整個頁面，讓廣告版位能在指定時間範圍內自動上下架，不需要營運人員在檔期當天手動操作',
          '##預覽一致##後台預覽直接沿用跟正式上線相同的顯示邏輯，確保營運人員部署前看到的預覽（含手機版、桌機版）跟正式上線後的畫面一致',
          '##草稿機制##把「儲存」與「正式送出部署」拆成兩個階段，讓使用者可以先存草稿反覆調整，確認無誤才正式送出排入部署排程',
        ],
        techUsed: ['React', 'Scheduling Logic', 'Component Reuse'],
        challenges:
          '##排程顆粒度##過去每次檔期上下架都要工程師改程式、重新部署，緊急公告或臨時活動常常來不及跟上時程，跨部門排時程的溝通成本也不小。挑戰在於排程範圍要細到「單一區塊」而不只是整個頁面，因為同一頁面裡常常有些區塊要提前上、有些要延後下，若只能整頁設定排程，營運人員還是得靠工程師手動調整順序。另外要確保預覽畫面跟正式上線後長一模一樣，靠的是後台預覽直接沿用跟正式頁面相同的顯示邏輯來渲染，而不是後台自己另外刻一份相似但不完全相同的預覽畫面，避免兩邊邏輯分岔後預覽失真。',
        learnings:
          '##拿掉瓶頸##內部工具的價值不是功能做得多花俏，而是把原本卡在工程師手上的瓶頸拿掉，讓需要調整的人自己就能完成調整。排程顆粒度要跟著實際使用情境走，頁面級的排程滿足不了「同頁面內不同區塊各自有檔期」的真實需求，這種細節往往要跟營運人員實際訪談才會發現，不是憑工程師自己想像規格。',
      },
    ],
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
          '##流程盤點##盤點新增一個廣告組版元件的完整人工開發流程，發現同樣的步驟，包含註冊 ad_code、元件映射設定、型別定義、模組匯出、測試資料，每次都要在 {{5、6 個不同檔案}}裡手動修改，只有命名不同',
          '##SOP 定義##把這套隱性流程收斂成一份標準 SOP 文件，定義出 {{8 個命名參數}}，像是 [ad_code]、[FolderName]、[ComponentName]、[HandlerName]、[ChineseName]，也涵蓋參考既有 TLW 或 HOLA 元件當範本的情境',
          '##八成自動##產出後保留約 20% 讓工程師手動處理，像是 UI 客製樣式、特殊業務邏輯，script 的目標訂在把重複、有規則可循的部分做到 {{80% 完成率}}，而不是強求全自動',
        ],
        techUsed: ['SOP 文件化', 'Node.js', 'Codegen Script', 'Process Design'],
        challenges:
          '##品質疑慮##人工開發一個新的組版元件平均要花 {{5 個工作天}}，含測試，但把時程攤開後發現，大部分工時並不是花在這個元件獨有的邏輯上，而是重複性的樣板工作，只要漏改其中一個檔案，通常要等到 Runtime 噴錯才會發現。導入初期最擔心產出的程式碼品質不可靠，甚至事後檢查花的時間比自己開發還久，所以每一步都用既有元件的真實案例回測，確認產出的程式碼結構、命名與 export 都跟人工版本一致才算過關。\n\n##成效驗證##上線後追蹤實際工時，證實開發時程{{從平均 5 個工作天縮短到 2 個工作天}}，骨架完成率達到 {{80%}}，工程師只需要專注在最後的 UI 客製與業務邏輯。',
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
          '##槓桿思維##工程師的槓桿在於把重複、有規則可循的工作抽象成清楚的流程與參數，再用工具把它系統化，保留剩下的 20% 讓工程師處理真正需要判斷的部分，比起追求 100% 全自動更務實',
          '##排斥心情##這是 AI 進場後我第一次嘗試用 AI 完成的內容，{{一開始其實很排斥 AI 的到來}}，身為工程師難免有種傲氣和自尊心，不希望自己做的事情被取代',
          '##價值重心##透過這次嘗試更清楚自己的價值，在於更專注在溝通，把使用者真正需要的做出來，也把重心放在產出比以往更細膩的內容',
          '##品質回歸##過去常為了縮短工時而顧不到程式效能與品質，現在用 AI 縮短工時後，能把心思放回程式品質，也趁機磨練自己 review code 的能力',
          '##能力轉變##AI 時代下工程師需要的能力，不再是用的技術有多炫砲、邏輯力有多強，而是能不能發現痛點並解決',
        ],
      },
    ],
  },
  {
    id: 'portfolio',
    title: '個人作品集平台',
    category: 'AI 實作',
    displayCategory: 'AI 實作',
    period: '2026',
    description:
      '這個網站是我離職空窗期，一個人從零蓋起來的作品。沒有設計幫我設計畫面、沒有 PM 規劃 spec，沒有其他人給架構建議，只有我跟奴性堅強的 AI。從架構規劃到實作，我都是自己要決定 AI 怎麼幫我實作，再自己驗證。\n\n• 用 Nx 建立 Monorepo，Next.js 16 + React 19 打造主應用，方便未來擴充其他子專案\n• 用 MSW 模擬完整後端 API，跑出真實的前後端協作流程，之後接真實後端幾乎不用改元件\n• 支援雙語切換、履歷一鍵匯出 PDF、完整響應式設計，手機電腦體驗一致\n• 規劃加入後台可視化編輯功能，取代目前手動修改程式碼裡的資料',
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
        label: 'GitHub 原始碼',
        url: 'https://github.com/Bella-Jheng/portfolio',
        type: 'github',
      },
      {
        label: '預覽展示網站',
        url: 'https://portfolio-liard-pi-12.vercel.app/',
        type: 'website',
      },
    ],
    sections: [
      {
        title: '與 AI 協作的分寸：善用槓桿，但責任在我',
        tabLabel: 'AI 協作觀點',
        whatIDid: [
          '##並肩工作##從打開空白的專案資料夾那一刻起，我幾乎每天都跟 AI（Claude Code）並肩工作，從一開始討論架構「這樣拆合理嗎」，到後來一起把元件一個個刻出來，AI 更像是一個反應很快、隨時都在、但沒有經驗的夥伴，而不是一個工具',
          '##自己拍板##不過每次要做決定時，像是要不要裝某個套件、選哪個函式庫，我都還是會先自己查資料、比較優缺點，想清楚了才回頭跟 AI 說「就照這個方向做」，而不是把決定權交出去',
        ],
        techUsed: ['Claude Code', 'AI Pair Programming', 'Code Review'],
        challenges:
          '##心虛時刻##一開始最掙扎的，其實不是技術問題，而是一種說不出的心虛感：AI 可以幾秒鐘生出一段看起來很像樣的程式碼，如果我沒有先搞懂背後的取捨，出了狀況我根本不知道從哪裡修，那等於是把責任外包出去，卻假裝那是自己的作品。於是我逼自己養成一個習慣：任何套件、任何架構決定，都要先確認自己理解到能為它負責，才讓 AI 去把細節生出來，寫完之後也會回頭一行一行看，確認它真的懂我要的邏輯，而不是「看起來能動就算了」。',
        learnings:
          '##劃清底線##這段經驗延續了我在其他專案裡慢慢想通的事。剛離職那陣子，我對 AI 其實是有點抗拒的，覺得它把我最有成就感的部分，也就是解 bug 的那種「啊，找到了」的快樂，一點一點拿走了。後來做這個網站的過程，反而讓我想通了另一件事：工程師的價值，是能不能看清楚真正的問題在哪裡、該怎麼解，還有做完之後，願不願意為整個結果負責。這個網站裡的每一個技術選擇，我都能講出為什麼，這是我劃給自己的底線，AI 可以幫我跑得更快，但它沒辦法替我背書。',
      },
      {
        title: 'Nx Monorepo 與前端分層架構',
        tabLabel: '架構設計',
        whatIDid: [
          '##打地基##一個人從零開始蓋這個網站的時候，我把它想成蓋房子先打地基：先用 Nx 搭出 Monorepo，apps/portfolio 是主建築，libs/ 是以後隨時可以擴建的公共設施，未來想加 admin 或 blog，不用整個重新來過',
          '##三層拆分##元件則按照「誰該知道什麼」拆成三層，Atom 元件像 Tag、Tabs 這種最基礎的積木，完全不碰業務邏輯；Feature 元件像 Gallery、ProjectSlider，才負責跟資料打交道、處理互動',
          '##型別把關##把 TypeScript strict mode 整個打開，資料結構統一放進 types 目錄管理，寧可一開始多花點時間把型別寫清楚，也不要之後在一堆 any 裡面猜資料到底長什麼樣',
        ],
        techUsed: ['Nx Monorepo', 'Next.js 16', 'React 19', 'TypeScript'],
        challenges:
          '##邊界鬆懈##老實說，一開始我常常分不清楚「這個網站需要的功能」跟「這個元件該負責的範圍」，這兩件事很容易被我混在一起想。Gallery 元件差點就被我塞進跟頁面綁死的邏輯，比如依照目前選的分類決定顯示方式。後來停下來重新想了一次，才把它拆乾淨，讓 Gallery 對外只露出一個 media 陣列，內部要怎麼切換、怎麼同步縮圖、怎麼全螢幕，全部包在裡面，用的人完全不用管。一個人做專案最容易鬆懈的地方就是這種細節，反正自己看得懂，就懶得管邊界清不清楚，可是如果哪天真的要把這些元件搬去別的專案共用，那些偷懶留下的痕跡就會變成絆腳石。',
        learnings:
          '##自問自答##一個人做專案最寂寞的地方，是沒有人會在 code review 時問你「這樣設計真的合理嗎」，所以那個角色只能自己扮演。把分層的界線畫清楚，不是因為現在有誰要接手，而是為了半年後的自己回來看這份程式碼時，還能一眼看懂當初在想什麼。',
      },
      {
        title: '狀態管理：React Query 與 Zustand 的分工',
        tabLabel: '狀態管理',
        whatIDid: [
          '##狀態分家##我把「伺服器給的資料」跟「畫面自己的狀態」當成兩種完全不同的東西來對待：非同步 API 資料的快取、loading、error，全部交給 React Query 打理；語言偏好、全域 loading 這種跟畫面互動有關的，才用 Zustand',
          '##語言連動##切換語言的時候，讓 React Query 的 query key 直接跟著 language 走，語言一變就自動重新去拿對應語系的資料，不用自己動手清快取',
        ],
        techUsed: ['TanStack Query', 'Zustand', 'TypeScript'],
        challenges:
          '##偷懶念頭##一開始我其實動過念頭，想說專案不大，乾脆全部塞進 Zustand 就好，維護兩套工具感覺很麻煩。結果真的把抓資料的邏輯跟畫面狀態混在同一個 store 裡之後，語言切換、loading 動畫、快取什麼時候該失效，全部糾纏在一起，沒多久我自己都追不出來是哪個動作觸發了哪次重新請求。後來靜下心把這兩種狀態的性質拆開來看才發現，從伺服器來的資料，本來就該交給懂得怎麼快取的工具，而不是隨便塞進一個全域變數裡。',
        learnings:
          '##規模藉口##專案小，不代表可以隨便將就，反而是練習「這個工具當初設計出來是為了解決什麼問題」的好機會。這個判斷我會一直帶著走，不會因為下一個專案規模變大或變小就丟掉。',
      },
      {
        title: 'Mock-First API 設計：先跑通流程，再串真後端',
        tabLabel: 'Mock-First API',
        whatIDid: [
          '##攔截模擬##沒有後端可以串的情況下，我用 MSW 在瀏覽器裡攔截 HTTP 請求，模擬出一整套後端 API，而不是把假資料直接寫死在元件裡',
          '##介面解耦##刻意讓 API 函式跟 Mock handler 完全分開，元件只知道自己在跟一個固定的 API 介面拿資料，不知道，也不需要知道背後是 Mock 還是真的後端',
          '##雙語資料##中文、英文各自維護一份 Mock 資料，API 函式依照語言參數回傳對應的內容',
        ],
        techUsed: ['MSW (Mock Service Worker)', 'TanStack Query', 'TypeScript'],
        challenges:
          '##提心吊膽##沒有真的後端可以對接，最讓我提心吊膽的是，很怕自己關在房間裡憑空想像出一套「感覺很合理」的資料格式跟流程，結果哪天真的要接後端，才發現整組都要打掉重練。所以我刻意逼自己把 API 層設計得跟正式串接時一模一樣，連 loading、error 處理都照真實情境走，而不是拿到資料就直接塞進畫面。這樣以後真的要換成真的 API，理論上只要拔掉 MSW、把 fetch 網址換掉就好，元件跟 hook 一行都不用動。',
        learnings:
          '##紀律訓練##沒有後端可以合作，不代表可以偷懶跳過「前後端分離」這件事的訓練。刻意在模擬環境裡也守住這個紀律，比做出這個網站本身更有價值，因為這是一個真的能帶到下一份工作、下一次要跟後端團隊合作時派上用場的習慣。',
      },
      {
        title: '雙語切換與體驗細節',
        tabLabel: 'UX 細節',
        whatIDid: [
          '##偏好記憶##用 Zustand 搭配 localStorage 把語言偏好記下來，讓使用者重新整理頁面，或關掉分頁隔天再打開，都不會被無情地打回預設語言',
          '##輕量翻譯##自己動手寫了一個很輕量的 t({ zh: \'...\', en: \'...\' }) 翻譯小工具，沒有引入完整的 i18n 函式庫，把雙語這件事控制在最小成本，但留了一條之後真的要升級成正式 i18n 方案的路',
          '##減少閃爍##切換分類的時候先讓畫面顯示 Skeleton，履歷頁可以一鍵匯出 PDF，這些都是想讓使用者少一點「畫面在閃」或「東西突然跳出來」的煩躁感',
        ],
        techUsed: ['Zustand', 'localStorage', 'html2canvas', 'jsPDF'],
        challenges:
          '##差點裝重##一開始我差點就直接裝上 next-intl 或 i18next，後來冷靜盤點一下，整個網站其實就那幾頁、資料量也不大，硬裝一個完整的 i18n 函式庫，只會多背一堆不必要的複雜度跟檔案大小。真正難的不是選哪個工具，而是誠實面對「這個專案現在到底需要什麼」，不是業界流行什麼就跟著裝，同時也要幫未來留一條路，萬一真的需要升級，不用整包打掉重寫。',
        learnings:
          '##規模匹配##技術選型從來不是選「最強」的那一個，而是選「跟現在的規模剛剛好」的那一個。這次刻意克制自己不要過度工程化，其實也是在練習判斷「什麼時候該用簡單的方法，什麼時候才真的值得動用重型工具」，這個判斷力，比任何一個工具本身都更難學，也更值得學。',
      },
    ],
  },
  {
    id: 'self-management-workflow',
    title: '工作排程與管理',
    category: '其他',
    displayCategory: '其他',
    period: 'Ongoing',
    description:
      '用 Notion 建立個人工作管理流程，讓工作進度對主管與團隊更透明，也讓過去解決過的問題被系統性地保留下來，而不是解決完就忘記。\n\n• 拆解任務並排列優先順序，主管不用問也能一目了然掌握進度\n• 記錄每個任務的技術難點、嘗試過的方案與解法，累積成可搜尋的知識庫\n• 降低單一成員離職造成的知識斷層風險\n• 依專案性質調整拆解顆粒度，持續優化最適合團隊步調的工作方法',
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
      '擔任產品負責人（Product Owner），主導預備會員相關產品專案，是三個工程團隊、設計、測試、行銷、業務團隊間的溝通橋樑。\n\n• 負責需求蒐集、撰寫規格文件，並協調跨團隊時程與依賴關係\n• 運用 GA、GTM 與 NLP 分析使用者行為，讓規格制定有數據支持而非憑直覺\n• 在有限開發資源下排列多個並行專案的優先順序，避免資源分散\n• 培養跨職能溝通、需求分析與專案管理能力，更能同理不同角色的立場',
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
      '參與旅遊票券平台後端系統開發，讓使用者能線上購買票券（如貓空纜車票）並完成後續兌換與使用。\n\n• 優化購票完成後的郵件通知系統，確保付款成功即時收到正確票券資訊\n• 串接第三方 API，即時查詢庫存並同步訂單，設計重試與錯誤處理機制\n• 協助金流服務開發，確保交易流程穩定、紀錄正確無誤\n• 這是我第一份後端工作，體會到穩定性與資料正確性比開發速度更重要',
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
