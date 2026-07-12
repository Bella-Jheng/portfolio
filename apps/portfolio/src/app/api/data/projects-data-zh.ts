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
          '參與 HOLA 前端從 single-repo 到 NX mono-repo 的架構重構規劃與落地，範圍涵蓋目錄結構、React 版本、元件寫法、樣式框架、測試框架的全面實測與轉換。',
          '2022/12/13 提出架構需求，開始規劃',
          '2023/7/24 進入首頁、商品頁、館分類頁、大中分類頁、搜尋結果頁的新頁面開發',
          '2023/10/23 進入新頁面整合測試',
          '2023/11/29 正式上線，前後歷時約 365 天',
        ],
        techUsed: ['NX Monorepo', 'Nx Graph', 'React 18', 'TypeScript', 'Tailwind CSS', 'Jest'],
        challenges:
          '舊架構為了因應反覆變更的需求，舊的元件及樣式不敢棄用，只能直接疊加開發新的，導致程式不斷龐大，新舊元件因部分流程共用，舊流程也無法完整移除。另一個關鍵原因是元件沒有模組化，各個專案又各自安裝重複的 node_modules，導致某個頁面不再使用時，沒辦法確定哪些程式碼可以安全刪除、哪些還被其他地方依賴，只能整批留著，遺留大量無用程式碼，最終打包上版時間拉長到約 20 分鐘。\n\n盤點整個 single-repo 的目錄結構後發現，Utilities、Components 底下都是 hola 跟 others 混雜在一起，沒有清楚的模組邊界，這才是複用性低、程式碼持續膨脹的根本原因，不是元件本身寫得不好。同時也重新檢視了 React 17、Class-based 元件、Bootstrap 各自造成的限制，Bootstrap 需要注入在全站最外層，header 與 body 版本有差時頁面會直接跑版，Class-based 元件在複雜情境下 this 指向容易出錯。\n\n後來用 NX 建立 mono-repo 的目錄結構，把 Utilities/Apis/Components 從 hola/tlw 混雜的狀態，改成 Apps 底下依品牌 hola/tlw 獨立分工，各自管理自己的 Utility/Apis/Components，並把常用小工具、元件 header/footer/商品卡提升到最外層共用，同步升級 React 18，拿到 automatic batching 全面套用到所有狀態更新，而非僅限 event listener，並可用 Suspense/Transition，改用 Functional 元件，樣式框架換成 Tailwind，用 scoped 樣式解決感染問題，支援 tree-shaking，並新增 Jest 測試框架。Nx 也內建 nx graph，能快速視覺化元件之間的相依關係，之後要判斷某個元件或頁面能不能刪除，一眼就能看出還有沒有其他地方在用，不用再靠人工翻程式碼確認。',
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
          '打包時間從 17m2s 降到 7m45s，減少超過一半，也學到架構轉型不是每項技術都非黑即白，像 Class-based 在複雜狀態批次操作與生命週期控制上其實仍有優勢，取捨要基於實際情境的限制與代價，而不是單純追新。這麼大的轉型也需要拆成規劃→開發→整合測試→上線分階段推進，才不會失控。也體會到相依關係不透明時，工程師會傾向保守不刪程式碼，久了就是一堆廢 code，把相依關係視覺化之後，砍舊程式碼才有依據，這也是後來能持續維持程式碼庫精簡的關鍵工具。',
      },
      {
        title: '狀態管理演進，從 Redux Toolkit 到 Zustand + React Query',
        tabLabel: '狀態管理',
        whatIDid:
          '專案初期規劃階段確認採用 redux-toolkit 作為狀態管理方案，實際開發後重新評估非同步 API 資料與跨元件共享狀態的處理方式，逐步把 redux-toolkit 換成 React Query + Zustand 的組合。',
        techUsed: ['Zustand', 'React Query', 'Redux Toolkit'],
        challenges:
          '商品頁的非同步請求很多也很雜，包含規格切換、庫存查詢、折價券查詢，照原訂計畫用 redux-toolkit 寫，每加一種查詢就要多寫一個 slice，loading、error 狀態也得自己手動維護，程式碼量越堆越多。\n\n重新盤點這些狀態的性質後發現，它們幾乎都是跟後端要資料的查詢型行為，跟 redux 原本設計拿來處理的跨元件共享同步 UI 狀態性質根本不同，用同一套工具硬做，才是樣板程式碼爆量的根因，同時也在會議中明確定義兩種 hook 的分野，useQuery 用在查詢類，像是折價券查詢，useMutation 用在異動類，像是加入購物車。\n\n後來把非同步 API 資料全部改用 React Query 的 useQuery/useMutation 管理，自動處理 loading、error、cache，redux-toolkit 只保留給少數真正需要跨元件共享的同步狀態，後續這部分也逐步被更輕量的 Zustand 取代，redux-toolkit 最終在專案裡完全淡出。',
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
          '不是先選定一個狀態管理工具就要用到底，而是依資料性質分別選擇，Zustand 處理跨元件共享的同步狀態，React Query 處理非同步資料的 cache 與重新驗證，兩者搭配比單用 Redux Toolkit 更貼近實際需求，也降低樣板程式碼。',
      },
      {
        title: '共用元件邊界設計，從 HOLA 專屬到跨品牌共用',
        tabLabel: '共用元件設計',
        whatIDid:
          '2023 年架構重構時，NX mono-repo 已經把 Apps 底下規劃成 hola、tlw 各自獨立的目錄，但 2024 年 TLW 真正啟動開發時，才發現原本歸在共用層的 libs/hola-layout、libs/hola-ui-component 命名與內容其實是綁死給 HOLA 用的，需要重新界定真正共用與品牌專屬的邊界，同時釐清 libs/utilities 這種真正與業務邏輯無關的共用 function/hook 該收斂哪些內容。',
        techUsed: ['Nx Libs', 'Nx affected build/test', 'Component Boundary Design'],
        challenges:
          'TLW 改版啟動時，第一直覺是直接沿用 HOLA 已經寫好、放在共用層資料夾的 libs/hola-layout、libs/hola-ui-component。\n\n實際攤開這些元件的內容才發現，雖然放在共用的資料夾位置，但命名、樣式變數，甚至部分邏輯都是綁死給 HOLA 用的，若 TLW 直接 import，等於把品牌耦合的程式碼當成通用元件繼承過去，但若每個品牌各自複製一份，又會讓 Nx workspace 只重建真正變動專案的 affected build/test 失去意義，兩個品牌會被迫綁在一起重建。\n\n與團隊討論後，把真正跟業務邏輯脫鉤、任何品牌都能直接套用的部分抽出來另開資料夾管理，hola-layout/hola-ui-component 維持專屬給 HOLA 用，TLW 需要的共用邏輯則獨立拆分，確保 Nx affected 機制仍然只會抓到真正有變動的專案。',
        comparisonTable: {
          columns: ['面向', 'Before TLW 啟動時', 'After 重新界定後'],
          rows: [
            ['libs/hola-layout, hola-ui-component', '被視為共用層，TLW 打算直接沿用', '維持專屬 HOLA，不再視為跨品牌共用'],
            ['真正通用的邏輯', '與品牌邏輯混在同一個 lib 內', '拆分獨立資料夾，供 TLW 與後續品牌共用'],
            ['Nx affected build/test', '若各自複製一份，affected 範圍會失準', '共用邊界清楚後，affected 只重建真正變動的專案'],
          ],
        },
        learnings:
          '放在共用目錄不等於真的可以共用，共用層的判斷標準應該是這段程式碼是否與特定品牌的業務邏輯脫鉤，而不是資料夾位置，之後規劃新共用元件時會先問，這是通用邏輯，還是剛好目前只有一個品牌在用。',
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
    sections: [
      {
        title: '資料模型設計',
        tabLabel: '資料模型',
        whatIDid: [
          '以 Zustand 設計選購資料模型，涵蓋樹種、樹頂星、燈飾、吊飾、緞帶、樹裙六個部位，單選部位存字串、吊飾採可重複的字串陣列記錄款式與數量',
          '吊飾的正反面位置不額外開欄位儲存，而是用陣列順序當作排列依據，索引 0 到 3 對應正面，4 到 6 對應背面，搭配一個全域的正反面 boolean 狀態，渲染時依當前視角決定要畫哪一段陣列',
          '導入 Zustand persist middleware，將 selectedList／selectedSetNum／customSelectedList 存進 sessionStorage，讓使用者中途離開頁面再返回時能還原選擇，直到結帳完成才清除；商品庫存資料與正反面視角則不持久化，重新整理後一律重打 API、預設回到正面',
        ],
        techUsed: ['Zustand', 'Zustand persist middleware', 'TypeScript', 'React'],
        challenges:
          '一開始想過要幫每個裝飾品額外存在哪個視角、第幾個位置，但這樣寫入邏輯會變得很重，新增或刪除都要同步維護位置編號。後來改成讓陣列順序本身就代表位置，視角只用單一全域旗標表示，資料結構單純很多，但也代表所有該顯示正面還是背面的判斷都要在寫入陣列的當下同步算好，不能事後才推導。',
        learnings:
          '不是所有狀態都需要獨立欄位，能用既有結構，像是陣列順序，隱含表達的資訊，就不用另外設計欄位去重複記錄，減少一份資料就少一份要同步的風險，哪些狀態需要持久化、哪些該在重新整理後重置，也要在設計階段就想清楚，而不是全部無腦存。',
      },
      {
        title: '即時運算與 UI 同步控制',
        tabLabel: '即時同步',
        whatIDid: [
          '用 Zustand 的 computed middleware 把 totalPrice、totalQty、isAllSelected 都設計成從 selectedList 衍生的計算屬性，而不是額外用 action 手動更新，選購狀態一變、金額與數量自動重算',
          '串接成品展示圖、價格提示文字、已選清單三處 UI，全部訂閱同一份 store，運算結果與畫面同步更新，確保使用者操作過程中的預算透明度',
        ],
        techUsed: ['Zustand', 'Zustand computed middleware', 'RTK Query', 'React'],
        challenges:
          '同一個操作，像是點選一個吊飾，會牽動畫面上至少三處不同區塊的顯示與一次金額重算，如果各自用 local state 處理，很容易漏更新或算錯總價，如果改成每次選購動作都手動呼叫重算價格的 action，又容易漏呼叫。改用衍生計算屬性後，金額永遠是 selectedList 的函式，不會有忘記重算這種狀態，所有子元件訂閱同一份 store 就能保證畫面與價格同步。',
        learnings:
          '能用衍生計算表達的狀態，就不要存成獨立欄位再手動同步，把 totalPrice 設計成 selectedList 的計算結果，而不是另一個要自己維護的 state，從根本上排除了忘記更新總價這類 bug 的可能性。',
      },
      {
        title: '動態影像載入與定位系統',
        tabLabel: '效能與定位',
        whatIDid: [
          '每個裝飾品的圖片都用非同步函式依 SKU 動態載入，並用固定的絕對定位座標，依斷點切換 px 值，把星星、吊飾、緞帶、樹裙精準釘在聖誕樹圖上',
          '緞帶只存一張圖檔，透過 CSS scale-x(-1) 鏡像出另一側，同一張素材畫出左右兩邊，不用多存一份反向圖檔',
          '用 ResizeObserver 監聽外層容器尺寸，容器寬度小於 120px 時直接隱藏裝飾圖層，避免在極窄螢幕下擠壓變形',
          '切換聖誕樹主體圖片時，樹頂星、吊飾、緞帶、樹裙的定位邏輯完全獨立於底圖，不會因為換了樹種而跑位或被重算',
        ],
        techUsed: ['React', 'ResizeObserver', 'Tailwind CSS', 'Framer Motion'],
        challenges:
          '聖誕樹裝飾是高頻互動的圖形場景，使用者可能快速切換樹種、增減多個吊飾，若每個裝飾都要重新計算座標，介面很容易出現延遲或錯位。挑戰在於把底圖是什麼和裝飾釘在哪裡拆成兩件互不影響的事，底圖只是背景圖替換，裝飾的定位邏輯完全不看底圖是哪一棵樹，換底圖不會觸發任何裝飾重新計算位置。',
        learnings:
          '效能問題往往不是單一元件慢，而是資料與渲染沒有解耦，把裝飾定位設計成完全不依賴底圖選擇，才能在高頻互動下維持流暢，也讓日後新增裝飾類型或調整版型時，不需要牽動底圖切換的邏輯。',
      },
      {
        title: '跨裝置滾動與預覽體驗',
        tabLabel: '滾動體驗',
        whatIDid: [
          '桌機版用 GSAP ScrollTrigger 建立 scrub 動畫，讓右側樹狀預覽面板的捲動位置跟隨左側選購清單的捲動進度等比例同步，而不是單純用 CSS sticky 固定',
          '行動裝置版設計了可收合的預覽小樹迷你列，預設收起，輕點才展開成完整預覽疊層，避免在小螢幕上讓操作區與預覽區永久搶畫面',
          '監聽捲動方向與頁尾位置，讓底部購物條在使用者向下捲動時自動收起、接近頁尾時完全隱藏，減少常駐 UI 對內容的遮擋',
        ],
        techUsed: ['GSAP', 'ScrollTrigger', 'React'],
        challenges:
          '桌機版原本可以直接用 CSS position: sticky 讓預覽面板固定在畫面上，但實際需求是預覽面板要跟著左側清單的捲動進度等比例捲動，而不是完全靜止不動，純 CSS 做不到這種與捲動進度綁定的效果，因此改用 GSAP ScrollTrigger 的 scrub 模式，把左側清單的捲動距離對應到右側面板的捲動位移。行動裝置螢幕小，操作區跟預覽區無法同時常駐，因此拆成預設收合、需要時才展開的互動模式。',
        learnings:
          '不是所有跟著捲動的需求都適合用 CSS sticky 解決，當需要捲動進度跟另一個區塊的位移量綁定時，還是得靠 scrub 動畫這類工具，行動裝置的介面設計也讓我更清楚，預設隱藏、需要才展開比硬塞進畫面更符合小螢幕的操作邏輯。',
      },
      {
        title: '複雜業務邏輯控制',
        tabLabel: '業務邏輯',
        whatIDid: [
          '設計互斥與相容性檢查，用 useEffect 監看選中的樹種 SKU，若符合特定條件，正式站與測試站各自對應不同 SKU 代碼，就自動把樹裙選項禁用並重設為不選擇，樹種換回相容款式時自動解除限制',
          '實作吊飾數量與視角的自動化聯動，每次新增或刪除吊飾都會即時計算目前總數，超過 4 個就自動切到背面視角，少於 5 個就切回正面，讓使用者不用手動切換也能看到剛才動到的裝飾',
          '單選與吊飾複選都遵守同一條規則，只要使用者手動調整任何配件，若目前選的是預設靈感組合就自動切換成自由搭配，避免使用者以為自己在編輯範本，卻其實正在覆蓋不存在的狀態',
        ],
        techUsed: ['Zustand', 'React', 'TypeScript'],
        challenges:
          '這些規則彼此會互相影響，新增一個吊飾同時要判斷陣列長度是否要觸發視角切換，也要判斷目前是不是該從靈感組合轉成自由搭配，兩件事都要在同一次操作裡同步完成，稍有疏漏就會出現畫面切到背面了，但陣列裡其實還在前 4 格之類的邊界情況。做法是把這些判斷都收在同一個事件處理函式裡依序執行，而不是分散成多個各自訂閱、各自反應的 effect，減少互相搶跑的風險。',
        learnings:
          '條件式業務邏輯越多，越需要確保觸發時機是可控的單一入口，而不是讓多個 effect 各自監聽同一份狀態、各自觸發，後者很容易因為執行順序不確定而產生邊界情況，把相關聯的判斷寫在同一個處理函式裡，即使程式碼看起來長一點，也比拆成多個 effect 更容易推理正確性。',
      },
      {
        title: '購物車 API 交易編排與衝突處理',
        tabLabel: '交易控制',
        whatIDid: [
          '設計先查詢、再決定的加入購物車流程，點擊結帳時先呼叫購物車查詢 API，確認購物車裡是否已經有舊的客製化聖誕樹商品，而不是直接把新選購的商品硬塞進去',
          '偵測到衝突時跳出確認彈窗，讓使用者選擇保留原客製或確認更新，使用者選擇更新後，才依序先移除購物車裡的舊樹相關品項，全部移除成功後再依序寫入新選購的每個部位',
          '把新增與移除購物車都拆成單筆 API 依序等待的序列，而不是平行送出，每一筆呼叫都個別收集錯誤訊息，任一筆失敗會彙整成清單顯示給使用者，而不是整批失敗後不知道哪筆出錯',
          '全部品項成功寫入購物車後才清除頁面的選購狀態 sessionStorage 並導向購物車頁，確保頁面看到的客製化樹與購物車裡實際的商品隨時保持一致',
        ],
        techUsed: ['RTK Query', 'Zustand'],
        challenges:
          '這個頁面的操作結果最終要跟購物車這個外部系統對齊，而使用者可能不是第一次來，購物車裡可能已經有一棵舊的客製化樹。如果不先查詢就直接寫入，會變成新舊商品同時存在購物車裡，使用者反而搞不清楚哪組才是最新選的。挑戰在於要用查詢、確認、依序移除、依序新增這個多步驟流程取代單純的一次性寫入，並且每一步都要能個別回報成功或失敗，而不是把六、七個部位包成一個大請求送出去。',
        learnings:
          '涉及外部系統，也就是購物車，且使用者可能重複造訪時，不能假設這是第一次加入購物車，先查詢現況、偵測衝突、讓使用者確認，比事後才發現購物車裡有兩棵樹再讓客服善後，省下的成本高很多。把多筆寫入拆成依序執行並個別收集錯誤，也讓失敗時能明確告訴使用者是哪個品項出了問題，而不是一句籠統的新增失敗。',
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
      '過去官網廣告版位異動都需要工程師改程式、重新部署，一次調整常要等好幾天。我從零設計並開發了一套可視化組版系統（CMS）。\n\n• 讓營運人員能自行拖拉排版、上傳圖片、編輯內容，不必再排工程師時間\n• 把版型結構與內容資料分離，維持前台版型穩定與資料嚴謹\n• 支援即時預覽、權限管理，擴充新版型不需改動核心邏輯\n• 上線後版位更新從跨部門排時程，縮短到營運人員自己幾分鐘內完成',
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
          '完整記錄已經寫在開發記錄 DEVLOG，點擊上方連結可查看完整內容，以下是扼要說明。\n學了線上課程後發現八字規則太多背不起來，實戰常卡關，於是把課程影片字幕爬出來讓 AI 整理成知識庫，並做成網站讓朋友也能用',
        techUsed: ['Next.js 16', 'Firebase', 'Google Gemini API', 'TypeScript'],
        challenges:
          '• 知識庫變大後，AI 提示詞全量塞入知識會讓 token 費用飆升、分析品質下降\n• 朋友用 LINE 打開連結登入 Google 帳號時，被內建瀏覽器擋下回傳 403，完全無法登入\n• Firestore 讀寫邏輯散落在多個 API 路由裡，同樣的業務流程被複製貼上好幾次',
        learnings:
          '這是我離職後做的作品。離職前我有點職業倦怠，AI 取代了我很多解 bug 的成就感，加上在公司大多是做別人的東西、很多決定不由自己，即使喜歡公司環境，我還是選擇離開。\n離職前和主管閒聊，他提到自己在用 AI 做一個以前想都不敢想的皮克敏外掛，過去不懂前端總是卡關，現在靠 AI 終於實現了。他說做了 20 年，成就感也該跟著時代迭代，以前土法煉鋼完成一個專案很有成就感，現在能快速做出過去不敢想的東西更快樂，寫程式不只是為了賺錢，也能把它帶進生活裡。他說：你不妨試試看把程式帶入你的生活。\n當下我似懂非懂，直到做完這個網站才真正明白。它讓我完成更多想做的事，還能跟朋友分享，每次聽到「算得很準」，都讓我更想把它做得更好，更在短短一周內快速學習後端，把我以往不敢嘗試的內容通通做出來。或許本身要做同一個工作這麼久就需要勇氣，還有各種契機去調整自己的心態，這次的嘗試除了打開我的眼界外，更讓我重新愛上寫程式',
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
      '這個作品集網站以 Next.js 打造，用 MSW 模擬完整後端 API，跑出真實的前後端協作流程\n• 支援雙語切換、履歷一鍵匯出 PDF、完整響應式設計，手機電腦體驗一致\n• 整個 Monorepo 用 Nx 管理，方便未來擴充其他子專案\n• 規劃加入後台可視化編輯功能，取代目前手動修改程式碼裡的資料',
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
