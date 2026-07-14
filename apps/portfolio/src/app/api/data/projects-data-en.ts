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

export const PROJECTS_DATA_EN: FullProject[] = [
  {
    id: 'bazi',
    title: 'Bazi: AI-Powered Chinese Astrology Analysis',
    category: 'AI 實作',
    displayCategory: 'AI Implementation',
    period: '2026',
    description:
      "A Bazi (Chinese astrology) analysis tool built with Next.js 16, Firebase Firestore, and the Google Gemini API. Enter a birth date and time to get an AI-generated reading.\n\n• Google sign-in gives each user their own space and a daily question quota\n• Admin knowledge-base panel where AI auto-tags content, retrieved by element for precision\n• Supports downloadable share cards and native mobile sharing\n• Became a talking point among friends after launch, and sharpened my own grasp of chart rules",
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
        label: 'Live Demo',
        url: 'https://portfolio-bazi.vercel.app/',
        type: 'website',
      },
      {
        label: 'DEVLOG',
        url: 'https://github.com/Bella-Jheng/portfolio/blob/main/apps/bazi/DEVLOG.md',
        type: 'document',
      },
    ],
    sections: [
      {
        title: 'Project Motivation & What I Learned',
        tabLabel: 'Dev Notes',
        whatIDid:
          "##Full Write-Up##The full write-up lives in the DEVLOG. Click the link above for the complete story; this is the short version.\n\n##Getting Stuck##After taking an online course on Bazi (Chinese astrology), I found the rules too dense to memorize and kept getting stuck in practice. So I scraped the course video transcripts and had AI turn them into a structured knowledge base, then built it into a site friends could use too, and each person gets their own space via Google sign-in, with a daily question quota.",
        techUsed: ['Next.js 16', 'Firebase', 'Google Gemini API', 'TypeScript'],
        challenges:
          "##Cost Spike##As the knowledge base grew, stuffing the entire thing into the AI prompt drove up token cost and hurt reading quality\n\n##Login Blocked##A friend opening the link in LINE got blocked at Google sign-in with a 403; the in-app browser was the culprit, and login didn't work at all\n\n##Scattered Logic##Firestore read/write logic was scattered across many API routes, with the same business flow copy-pasted several times",
        learnings:
          "##Why I Left##I built this after leaving my job. Before I left, I was burned out, AI had taken over a lot of the bug-fixing that used to be my main source of satisfaction, and at work I was mostly building other people's ideas, with most of the real decisions out of my hands. Even though I liked the company and the people, I still chose to leave.\n\n##My Manager's Words##Before I left, I was chatting with my manager, we were more like friends by that point, and he mentioned he was using AI to build a Pikmin-related plugin he'd never dared attempt before; frontend used to stump him completely, but AI finally let him pull it off. After 20 years in the industry, he said, your sense of accomplishment has to evolve too: grinding out a project by hand used to feel rewarding, but now being able to quickly build something you never thought you could is an even better kind of happy. He used to code for a paycheck; now the resources his job gives him let him bring that into his actual life, and that's what makes him happiest these days. He told me: you should try bringing code into your own life sometime.\n\n##Falling Back in Love##At the time I only half got it. It didn't really click until I finished this site. It let me build more of what I actually wanted, and share it with friends, and every time someone tells me \"this is scarily accurate,\" it makes me want to make it even better.",
      },
    ],
  },
  {
    id: 'testrite-refactor',
    title: 'HOLA / TLW E-commerce Frontend Architecture Refactor',
    category: '前端專案',
    displayCategory: 'Frontend Project',
    period: '2023 - 2024',
    description:
      "HOLA and TRPLUS (TLW) used to run separate frontend projects: mismatched React versions, inconsistent styling, shared logic duplicated across both. Less than three months after joining, I was pulled into this ground-up rebuild, an architectural transformation that would shape the company's technical direction for years.\n\n• Led PoC validation, using test results rather than gut feeling to drive the architecture decision\n• Merged both brands into one Monorepo, upgraded the framework, rewrote components, replaced the styling system\n• Build time dropped from nearly 20 minutes to under 8\n• Became the team's go-to person on the overall architecture as seniors left, helping onboard new hires",
    imageUrl: Testrite1.src,
    link: '/projects/testrite-refactor',
    tags: ['Monorepo Migration', 'React 18 Upgrade', 'Architecture Design'],
    technologies: ['Next.js', 'React 18', 'NX Monorepo', 'Tailwind CSS', 'TypeScript'],
    media: [
      { type: 'image', url: Testrite1.src },
      { type: 'image', url: Testrite2.src },
      { type: 'image', url: Testrite3.src },
      { type: 'image', url: Testrite4.src },
      { type: 'image', url: Testrite5.src },
    ],
    links: [
      { label: 'HOLA Website', url: 'https://www.hola.com.tw/', type: 'website' },
      { label: 'TLW Website', url: 'https://www.trplus.com.tw/', type: 'website' },
      { label: 'HOLA Presentation', url: 'https://docs.google.com/presentation/d/1qkb68aICPlDcfbuCWM9oc-d-gkMQBuno/edit?usp=sharing', type: 'presentation' },
    ],
    sections: [
      {
        title: 'HOLA Frontend Architecture Overhaul: From Single-repo to NX Mono-repo',
        tabLabel: 'Architecture',
        whatIDid: [
          '##Scope##Led the planning and execution of migrating the HOLA frontend from a single-repo to an NX mono-repo, covering a full audit and conversion of folder structure, React version, component style, styling framework, and test framework.',
          '##Kickoff##2022/12/13: architecture requirements proposed, planning began',
          '##New Pages##2023/7/24: new page development began (homepage, product page, category pages, search results)',
          '##Integration Test##2023/10/23: integration testing began',
          '##Launch##2023/11/29: launched (roughly 365 days end to end)',
        ],
        techUsed: ['NX Monorepo', 'React 18', 'TypeScript', 'Tailwind CSS', 'Jest'],
        challenges:
          "##Symptom##To keep up with constant change requests, the old architecture never dared to retire old components or styles; new ones just got layered on top, so the codebase kept growing. Old and new components shared parts of the same flow, so old flows could never be fully removed either, leaving a lot of dead code behind. Build/deploy time eventually stretched to about 20 minutes.\n\n##Investigation##Auditing the single-repo's folder structure showed that Utilities and Components both had \"hola\" and \"others\" code mixed together with no clear module boundary, which was the real root cause of low reusability and the ever-growing codebase, not that the components themselves were badly written. We also re-examined the specific limitations of React 17, class-based components, and Bootstrap: Bootstrap had to be injected at the site's outermost layer, so any version mismatch between header and body would break the layout; class-based components made `this` easy to get wrong in complex scenarios.\n\n##Fix##Proposed an NX mono-repo layout that split Utilities/Apis/Components from a mixed \"hola/tlw\" structure into brand-specific folders under Applications (hola, tlw), each managing its own Utility/Apis/Components, while hoisting genuinely common components (header, footer, product card) to the outer shared layer. In parallel, upgraded to React 18 (automatic batching now applies to all state updates, not just event listeners, plus Suspense/Transition), switched to functional components, replaced Bootstrap with Tailwind (scoped styles fix the leakage problem, plus tree-shaking), and added Jest as the test framework.",
        comparisonTable: {
          columns: ['Aspect', 'Old Architecture', 'New Architecture'],
          rows: [
            ['Folder structure', 'single-repo', 'mono-repo'],
            ['Tooling', 'None', 'NX'],
            ['React version', '17', '18'],
            ['Component style', 'Class-based', 'Functional'],
            ['Styling framework', 'Bootstrap', 'Tailwind'],
            ['Test framework', 'None', 'Jest'],
          ],
        },
        learnings:
          "##Takeaway##Build time dropped from 17m2s to 7m45s, more than cut in half. Also learned that architectural migration isn't always black-and-white per technology (class-based components still had real advantages for batched complex state and lifecycle control, for instance); trade-offs should be based on the actual constraints and costs of the situation, not just chasing what's newer. A transformation this large also needs to be broken into distinct plan → build → integration-test → launch phases to stay under control.",
      },
      {
        title: 'State Management Evolution: From Redux Toolkit to Zustand + React Query',
        tabLabel: 'State Mgmt',
        whatIDid:
          '##Migration##The project originally planned to use redux-toolkit for state management. After real development began, I helped re-evaluate how async API data and cross-component shared state should be handled, and gradually replaced redux-toolkit with a React Query + Zustand combination.',
        techUsed: ['Zustand', 'React Query (useQuery/useMutation)', 'Redux Toolkit (original plan)'],
        challenges:
          '##Symptom##The product page fires a lot of varied async requests (spec switching, stock lookups, coupon checks...). Following the original redux-toolkit plan, every new query meant writing another slice, and loading/error states had to be managed by hand, and the codebase kept growing.\n\n##Investigation##Re-examining what these states actually were, almost all of them were "fetch data from the backend" query behavior, fundamentally different from the "cross-component synchronous UI state" Redux was designed for. Forcing both into the same tool was the real source of the boilerplate explosion. We also explicitly defined the split in team discussions: useQuery for reads (like coupon checks), useMutation for writes (like add-to-cart).\n\n##Fix##Moved all async API data to React Query\'s useQuery/useMutation (which handles loading/error/cache automatically). Redux Toolkit was kept only for the few cases that truly needed cross-component synchronous state, and even that was gradually replaced by the lighter-weight Zustand, and redux-toolkit eventually phased out of the project entirely.',
        comparisonTable: {
          columns: ['Aspect', 'Redux Toolkit (original)', 'React Query + Zustand (after)'],
          rows: [
            ['Async API data', 'Manual slice + thunk; loading/error handled by hand', 'useQuery/useMutation auto-handle loading/error/cache'],
            ['Cross-component sync state', 'Also handled via redux slices', 'Moved to Zustand, lighter and nearly zero boilerplate'],
            ['Adding a new query', 'Requires a new slice + reducer', 'Just call useQuery, no extra boilerplate'],
            ['Final role in the project', 'Sole state solution site-wide', 'Phased out; only transitional leftovers remain'],
          ],
        },
        learnings:
          "##Match Tool to Data##It's not about picking one state management tool and sticking with it forever; the right choice depends on the nature of the data: Zustand for cross-component synchronous state, React Query for async data caching and revalidation. The combination fit the actual needs far better than Redux Toolkit alone, and cut boilerplate significantly.",
      },
      {
        title: 'Shared Component Boundaries: From HOLA-Only to Cross-Brand',
        tabLabel: 'Component Boundaries',
        whatIDid:
          "##Boundary Unclear##During the 2023 architecture overhaul, the NX mono-repo had already laid out hola and tlw as separate folders under Applications. But when TLW development actually kicked off in 2024, we found that libs/hola-layout and libs/hola-ui-component, nominally in the shared layer, were in fact named and built specifically for HOLA. I had to re-define the boundary between 'genuinely shared' and 'brand-specific,' and clarify what libs/utilities (truly brand-agnostic shared functions/hooks) should actually contain.",
        techUsed: ['Nx Libs', 'Nx affected build/test', 'Component Boundary Design'],
        challenges:
          '##Symptom##When TLW started, the first instinct was to directly reuse libs/hola-layout and libs/hola-ui-component, which HOLA had already built and placed under the shared-layer folder.\n\n##Investigation##Unpacking what was actually inside these libraries revealed that, despite living in a "shared" folder, their naming, style variables, and even parts of the logic were hard-wired for HOLA. If TLW imported them directly, brand-coupled code would be inherited as if it were generic. But if each brand maintained its own copy instead, Nx workspace\'s affected build/test (which only rebuilds genuinely changed projects) would lose its point, and the two brands would end up forced to rebuild together regardless.\n\n##Fix##After discussing with the team, we extracted the parts that were truly decoupled from brand-specific business logic into their own folder, kept hola-layout/hola-ui-component HOLA-only, and split out the logic TLW actually needed to share, keeping the Nx affected mechanism accurate to what had really changed.',
        comparisonTable: {
          columns: ['Aspect', 'Before (when TLW started)', 'After (boundary redefined)'],
          rows: [
            ['libs/hola-layout, hola-ui-component', 'Treated as shared; TLW planned to reuse directly', 'Kept HOLA-only, no longer considered cross-brand shared'],
            ['Genuinely reusable logic', 'Mixed together with brand-specific logic in the same lib', 'Split into its own folder for TLW and future brands to share'],
            ['Nx affected build/test', 'Would drift out of accuracy if each brand duplicated code', 'Stays accurate once the shared boundary is clear'],
          ],
        },
        learnings:
          '##Shared ≠ Folder##Living in a "shared" folder doesn\'t mean something is actually shareable; the real test is whether the code is decoupled from brand-specific business logic, not its file path. Since then, whenever planning a new shared component, the first question is: is this genuinely generic logic, or does it just happen to be used by one brand right now?',
      },
    ],
  },
  {
    id: 'christmas-tree',
    title: 'Christmas Tree Project - Interactive Custom Product Page',
    category: '前端專案',
    displayCategory: 'Frontend Project',
    period: '2024',
    description:
      "A highly interactive customization page for the Christmas shopping season, letting users assemble a tree the way they'd decorate a real one, freely picking six categories of decorations to build their own.\n\n• Live front/back preview, with price updating instantly as items are added or removed\n• Handles constraint logic: certain trunks are incompatible with certain skirts; pendants capped at 7, auto-placed front/back\n• Leaving mid-selection keeps choices intact until checkout\n• Integrates with the cart, confirming before overwriting when a user re-customizes",
    imageUrl: XmasTree1.src,
    link: '/projects/christmas-tree',
    tags: ['Interactive', 'State Design', 'Performance'],
    technologies: ['React', 'RTK Query', 'Zustand', 'Framer Motion', 'Tailwind CSS'],
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
        title: 'Data Model Design',
        tabLabel: 'Data Model',
        whatIDid: [
          '##Selection Model##Modeled the selection state in Zustand across six parts (trunk, tree topper, lights, pendants, ribbon, skirt): single-select parts are plain strings, while pendants use a string array that allows repeats to encode both which style and how many',
          "##Position Encoding##Rather than storing a separate field for each pendant's view (front/back), the array order itself encodes position: indices 0–3 render on the front face and 4–6 on the back, paired with a single global boolean for which face is currently shown, computed at render time",
          '##Persistence##Added Zustand\'s persist middleware to write selectedList, selectedSetNum, and customSelectedList to sessionStorage, so a user who leaves mid-selection and returns gets their choices restored, cleared only after checkout; product/stock data and the current view are deliberately left out of persistence and reset to the front face on reload',
        ],
        techUsed: ['Zustand', 'Zustand persist middleware', 'TypeScript', 'React'],
        challenges:
          "##Field Bloat##The first instinct was to give every decoration its own \"which view, which position\" fields, but that makes every add/remove responsible for keeping position numbers in sync too. Letting array order itself represent position, with a single global flag for the active view, kept the data structure much simpler, at the cost of every write to the array needing to already know which face it should end up on, rather than deriving that later.",
        learnings:
          "##Fewer Fields##Not every piece of state needs its own field; information that's already implied by an existing structure (array order, in this case) doesn't need a parallel field duplicating it, and one fewer piece of state is one fewer thing that can drift out of sync. Deciding what should persist versus reset on reload also needs to be a deliberate design choice, not \"just persist everything.\"",
      },
      {
        title: 'Real-time Computation & UI Sync',
        tabLabel: 'Real-time Sync',
        whatIDid: [
          "##Derived Totals##Used Zustand's computed middleware to derive totalPrice, totalQty, and isAllSelected straight from selectedList as computed properties, rather than updating them via a separate manual action, so any change to the selection recalculates them automatically",
          '##Three-Way Sync##Wired up the finished-tree preview, the price hint text, and the selected-items list to the same store, so all three stay in sync with the derived totals, keeping budget visible throughout the flow',
        ],
        techUsed: ['Zustand', 'Zustand computed middleware', 'RTK Query', 'React'],
        challenges:
          '##Missed Updates##A single action (e.g. tapping one pendant) has to move at least three separate UI regions and trigger a price recalculation at once. Handling that with local state per component, or with a manually-called "recalculate" action, both leave room for a missed update or a stale total. Deriving the totals as computed properties of selectedList instead means the price is always a pure function of the selection, so there\'s no separate step to forget to call.',
        learnings:
          "##No More Forgetting##State that can be expressed as a derived computation shouldn't be stored as its own field that you manually keep in sync. Making totalPrice a computed result of selectedList, rather than a parallel piece of state, eliminates an entire class of \"forgot to recalculate the total\" bugs by construction.",
      },
      {
        title: 'Dynamic Image Loading & Positioning',
        tabLabel: 'Performance & Positioning',
        whatIDid: [
          '##Dynamic Pinning##Loaded each decoration image asynchronously by SKU and pinned tree toppers, pendants, ribbons, and skirts to fixed absolute-position coordinates (breakpoint-specific px values) on the tree image',
          '##Mirrored Asset##Stored only one ribbon image and mirrored it for the other side with a CSS scale-x(-1) transform, rendering both sides from a single asset instead of shipping a second flipped file',
          '##Narrow-Screen Hide##Used a ResizeObserver on the outer container to hide the decoration layer entirely once the container drops below 120px wide, avoiding cramped, distorted rendering on very narrow screens',
          "##Independent Positioning##Kept the tree topper, pendant, ribbon, and skirt positioning logic fully independent of the trunk image, so switching trunks never shifts or recalculates any decoration's position",
        ],
        techUsed: ['React', 'ResizeObserver', 'Tailwind CSS', 'Framer Motion'],
        challenges:
          "##Decoupling Challenge##Tree decoration is a high-frequency graphics scenario: users can rapidly switch trunks or add/remove many pendants, and recalculating every decoration's coordinates on each change would quickly show up as lag or misalignment. The challenge was splitting \"which trunk is selected\" from \"where decorations are pinned\" into two things that never affect each other: decoration positioning logic doesn't reference the trunk at all, so swapping trunks never triggers any repositioning.",
        learnings:
          "##Decouple Data##Performance problems are rarely about one slow component; they're usually about data and rendering not being decoupled. Making decoration positioning fully independent of trunk selection is what kept things smooth under heavy interaction, and it also means adding a new decoration type or adjusting the layout later never touches the trunk-switching logic.",
      },
      {
        title: 'Cross-device Scroll & Preview Experience',
        tabLabel: 'Scroll Experience',
        whatIDid: [
          '##Scrub Sync##On desktop, used GSAP ScrollTrigger to scrub-sync the right-hand tree preview panel\'s scroll position proportionally to the scroll progress of the left-hand part-selection list, instead of relying on plain CSS sticky positioning',
          '##Collapsible Preview##On mobile, built a collapsible "preview your tree" mini-bar, collapsed by default and expanding into a full preview overlay on tap, so the selection area and the preview never permanently compete for the same small screen',
          "##Cart Bar Collapse##Tracked scroll direction and proximity to the page footer to auto-collapse the bottom cart bar while scrolling down and hide it entirely near the footer, reducing how much persistent UI covers the content",
        ],
        techUsed: ['GSAP', 'ScrollTrigger', 'React'],
        challenges:
          "##Sticky Wasn't Enough##The desktop preview panel could have just used CSS position: sticky, but the actual requirement was for it to scroll proportionally with the left list's scroll progress, not stay perfectly still. Plain CSS can't bind one region's scroll offset to another region's scroll progress, so GSAP ScrollTrigger's scrub mode was used to map the left list's scroll distance onto the right panel's scroll position. On mobile, the small viewport meant the selection UI and the preview couldn't both stay permanently visible, which led to the collapsed-by-default, expand-on-demand pattern.",
        learnings:
          "##Right Tool for Scroll##Not every \"follows the scroll\" requirement is a job for CSS sticky; once you need one region's scroll progress bound to another region's displacement, you need a scrub-style animation tool instead. Designing for mobile's tighter real estate also clarified that \"hidden by default, expand on demand\" usually serves small screens better than trying to force everything to stay visible at once.",
      },
      {
        title: 'Complex Business Logic Control',
        tabLabel: 'Business Logic',
        whatIDid: [
          "##Exclusion Checks##Designed mutual-exclusion and compatibility checks with a useEffect watching the selected trunk SKU: matching a specific SKU (a different code per environment, UAT vs. production) auto-disables the skirt option and resets it to \"not needed,\" and lifts the restriction automatically once the trunk changes back to a compatible one",
          '##View Auto-Switch##Implemented automatic view-switching tied to pendant count: every add or remove recalculates the total, auto-switching to the back view once the count exceeds 4 and back to the front once it drops below 5, so the just-changed decoration is always visible without a manual toggle',
          '##Template to Custom##Applied the same rule to both single-select parts and the pendant multi-select: any manual edit to a part while a preset "inspiration" combo is active automatically switches the state to "custom," so the user is never silently editing a template that no longer reflects what they see',
        ],
        techUsed: ['Zustand', 'React', 'TypeScript'],
        challenges:
          "##Ordering Risk##These rules interact with each other: adding one pendant has to decide both whether the array length should trigger a view switch and whether the current selection should flip from preset to custom, and both have to resolve within the same operation. Miss the ordering and you get edge cases like \"the view flipped to the back, but the array still only has the front four filled.\" The fix was running all of these checks in sequence inside a single event handler, rather than splitting them into several independent effects that each react to the same state on their own.",
        learnings:
          "##Single Entry Point##The more conditional business logic a feature accumulates, the more it matters that the trigger point stays a single, controllable entry; multiple effects each independently watching the same state is a recipe for order-dependent edge cases. Keeping related checks in one handler, even if that function gets longer, is easier to reason about correctly than splitting them across effects.",
      },
      {
        title: 'Cart API Transaction Orchestration & Conflict Handling',
        tabLabel: 'Transactions',
        whatIDid: [
          '##Check First##Designed a "check first, then decide" add-to-cart flow: checkout first calls a cart-lookup API to check whether an older customized tree is already sitting in the cart, instead of writing the new selection straight in',
          '##Conflict Dialog##On detecting a conflict, surfaces a confirmation dialog ("keep the original" vs. "confirm replace"); once the user confirms, the old tree-related items are removed from the cart first, and only after all removals succeed does it write each part of the new selection',
          '##Sequential Calls##Split both the add and remove operations into sequential single-item API calls (rather than firing them in parallel), collecting errors per call, so one failing item surfaces as a specific error rather than an opaque batch failure',
          '##State Consistency##Only clears the page\'s selection state (sessionStorage) and redirects to the cart page once every item has been written successfully, keeping what the page shows in sync with what\'s actually in the cart',
        ],
        techUsed: ['RTK Query', 'Zustand'],
        challenges:
          "##Repeat Visitors##This page's end state ultimately has to reconcile with an external system (the cart), and the user might not be a first-time visitor; the cart could already hold an older customized tree. Writing the new selection in without checking first would leave both the old and new trees in the cart at once, leaving the user unsure which one is current. The challenge was replacing a single one-shot write with a multi-step \"check → confirm → remove in sequence → add in sequence\" flow where every step can report success or failure independently, instead of bundling six or seven parts into one big request.",
        learnings:
          "##Check Before Write##When a flow touches an external system (the cart) and the user might be a repeat visitor, you can't assume this is their first add-to-cart. Checking current state and surfacing a conflict for the user to confirm costs far less than a support ticket after the fact when two trees show up in someone's cart. Splitting multiple writes into a sequence with per-item error collection also means a failure can point at exactly which item broke, instead of a generic \"add failed\" message.",
      },
    ],
  },
  {
    id: 'cms-development',
    title: 'E-commerce Admin CMS Development',
    category: '前端專案',
    displayCategory: 'Frontend Project',
    period: '2025',
    description:
      "Updating an ad placement on the company site used to require an engineer to change code and redeploy, often days per tweak. I designed and built a visual layout system (CMS) from scratch.\n\n• Lets operations staff drag-and-drop layouts, upload images, and edit content themselves\n• Separates layout structure from content data, keeping the live site stable and data well-formed\n• Supports live preview and permission management; new layout types need no core-logic changes\n• Cross-team-scheduled updates now take operations just minutes on their own",
    imageUrl: NewBackoffice1.src,
    link: '/projects/cms-development',
    tags: ['Internal Tool', 'Schema Design', 'Dynamic Component', 'CMS'],
    technologies: ['React', 'Nx', 'TypeScript', 'DND Kit', 'Tailwind CSS', 'API Integration'],
    media: [
      { type: 'image', url: NewBackoffice1.src },
      { type: 'video', url: 'https://www.youtube.com/watch?v=SSTAaGTBkQU', thumbnailUrl: NewBackoffice2.src },
    ],
    links: [
      { label: 'Document Intro', url: 'https://hackmd.io/@-pJOuWsHT5qfiLSWl-nBgQ/SJk21fAIge/edit', type: 'document' },
      { label: 'Video Demo', url: 'https://www.youtube.com/watch?v=SSTAaGTBkQU', type: 'presentation' },
    ],
    sections: [
      {
        title: 'System Architecture & Cross-Brand Reuse',
        tabLabel: 'Architecture',
        whatIDid: [
          '##Three Layers##Split the whole system into three layers: the outer layer controls what the overall page layout looks like, the middle layer decides which type of content block should appear, and the bottom layer holds the actual content blocks themselves (product cards, banners, article cards, and so on)',
          '##Dynamic Loading##Content blocks load flexibly into the page — the admin settings decide which block to use, and the page displays exactly that one, so adding a new block type later never affects the existing ones',
          "##WYSIWYG##The admin edit screen and the live page share the exact same display logic, making it what-you-see-is-what-you-get: whatever operations staff see while editing and previewing in the admin is guaranteed to match what shoppers see once it goes live",
          '##Brand Isolation##Since the system serves two brand websites at once, split each content block into two parts managed separately: "default data" and "data format rules," keeping "how a block behaves" separate from "what its data looks like," so one brand adjusting a block never affects the other',
        ],
        techUsed: ['React', 'TypeScript', 'Nx Monorepo', 'Dynamic Component Loading'],
        challenges:
          '##Brand Decoupling##Two brands share one system, but each has its own brand styling, existing product cards, and existing page structure. Hard-wiring content logic to one brand would mean the other brand has to duplicate the whole thing to reuse it. Separating "how a block behaves" from "what its data looks like" decoupled the two, so shared parts stay in the shared layer and brand-specific parts are managed independently, leaving the same skeleton reusable when a third brand is added later.',
        learnings:
          '##Shared-Layer Rule##The key to a multi-brand shared system isn\'t merging the code into one copy; it\'s separating "what the data looks like" from "how a block behaves" so the genuinely shared part lives in the shared layer. That same standard carried over into how later shared components got planned.',
      },
      {
        title: 'Grouping Fields for a Maintainable Edit Screen',
        tabLabel: 'Data Design',
        whatIDid: [
          '##Flat Fields##The bottom-most layer of data fields originally had no grouping at all, every input field sat in one flat layer, so there was no clear rule for where to add or remove a field',
          '##Logical Grouping##Reorganized that bottom layer into logical groups based on how the fields actually relate to each other',
          '##Auto Panels##Made the screen automatically generate a collapsible panel or an editable title for each group, so users could clearly tell which group of content they were editing',
        ],
        techUsed: ['TypeScript', 'Data Grouping', 'Component Design'],
        challenges:
          "##No Convention##The bottom-most data fields originally had no grouping, so every input field lived in the same flat layer. That meant there was no clear rule for adding or removing a field, engineers just had to guess where a new one belonged based on experience, and the list kept getting messier as related fields ended up scattered with no visible relationship on screen. Regrouping the fields by their logical relationships meant adding or removing a field only touched its own group, and the screen could automatically generate a collapsible panel or title per group, so users could tell at a glance which fields belonged together.",
        learnings:
          '##Grouping Pays Off##What looks like a small task, just grouping fields, actually determines how maintainable a system stays over time. A flat, ungrouped structure doesn\'t show its problems when there are only a few fields, but once the field count grows, adding or removing fields loses any consistent rule and gets messier with every change. Grouping fields by their logical relationships isn\'t just about a cleaner screen, it gives whoever maintains the system next (including future me) a clear rule to follow.',
      },
      {
        title: 'Cross-Field Required Rule Design',
        tabLabel: 'Validation Rules',
        whatIDid: [
          '##Two Rule Types##Designed two base rule types for cross-field requirements: "any one of these fields must have a value" and "all of these fields must have a value"',
          '##AND/OR Combos##Supported combining rules with "and"/"or" logic, covering cases like "either the image group or the text group must be fully filled in"',
          '##Inline Hints##Tied rule configs to the on-screen hint text, so hitting confirm runs every rule through a single check and clearly flags exactly where something is missing',
        ],
        techUsed: ['TypeScript', 'Validation Rule Design'],
        challenges:
          '##Single Field Fails##Some components\' required-field logic can\'t be decided by a single field — e.g. "title, subtitle, or body text, any one of the three is enough" — which a single field\'s own required setting simply can\'t express. The first instinct was letting each component write its own check, but that either hard-codes rules into components (hard to maintain) or leaves each component with inconsistent check timing and hint-text formats. It converged into two rule types (any-one, all) combined with and/or logic, with an explicit constraint that a field used in an "any-one" rule can\'t also be separately marked required, to avoid the rules contradicting each other.',
        learnings:
          '##Decompose First##When a requirement looks "special," try decomposing it into smaller generic logic (any-one, all) before reaching for a dedicated exception. Two or three base rules combined with and/or usually cover most real-world exceptions.',
      },
      {
        title: 'Trading Off Real-Time Feel for Performance',
        tabLabel: 'Performance',
        whatIDid: [
          '##Flow Redesign##Replaced the input data flow — screen state only updated once the user clicked away from a field, then passed up layer by layer to update the main store — with the screen updating locally the moment the user types, then syncing to the main store',
          '##Fewer Layers##Simplified the layers of data passing in between, removing intermediate code and files that were no longer needed',
        ],
        techUsed: ['React', 'State Management', 'Zustand'],
        challenges:
          '##Freshness vs Speed##The old flow tied both data saving and required-field validation to the moment a user clicked away from a field, but validation often ran before the save, so it read the previous input rather than what was currently on screen. The old architecture also needed data passed layer by layer just to get a value back up to update the shared state, coupling components tightly together. Updating content the moment the user types improved data freshness, but it also adds an extra computation step per field, increasing how often the screen re-renders — that part is still being optimized, alongside evaluating whether the overall store structure needs adjusting to balance freshness against performance.',
        learnings:
          '##Correctness First##Fixing a "data out of sync" problem isn\'t free; this time freshness was traded for performance. Engineering rarely offers a solution with no tradeoff at all — the priority is correctness first (getting the actual current data), with performance as something to iterate on afterward, not the other way around.',
      },
      {
        title: 'Scheduling, Preview & Deploy Flow',
        tabLabel: 'Scheduling & Deploy',
        whatIDid: [
          '##Block-Level Scheduling##Built scheduling down to the single-block level, not just the whole page, so ad placements can auto-publish and auto-expire within a set date range without operations staff having to act manually on the day',
          '##Matching Preview##Made the admin preview reuse the exact same display logic as the live page, so what operations staff see before deploying (desktop and mobile) matches exactly what goes live',
          '##Draft Stage##Split saving into two stages — save as draft, and confirm-deploy — so users can iterate on a draft freely and only commit it to the deploy schedule once it\'s ready',
        ],
        techUsed: ['React', 'Scheduling Logic', 'Component Reuse'],
        challenges:
          "##Granularity Gap##Every placement change used to require an engineer to modify code and redeploy, so urgent announcements or last-minute campaigns often couldn't keep up, and cross-team scheduling itself carried real coordination overhead. The challenge was making the scheduling granularity go down to a single block rather than the whole page, since a page often needs some blocks live earlier and others pulled later; page-level-only scheduling would still force operations staff to rely on an engineer to manually sequence things. Making sure the preview matched the live result exactly meant having the admin preview reuse the live page's own display logic for rendering, instead of building a second, similar-but-not-identical preview that could drift out of sync with the real thing.",
        learnings:
          "##Remove the Bottleneck##An internal tool's value isn't in how flashy its features are, it's in removing a bottleneck that used to sit on an engineer's desk so the person who actually needs the change can make it themselves. Scheduling granularity has to match how the tool is actually used; page-level scheduling doesn't meet the real need of \"different blocks on the same page have different campaign windows,\" and that kind of detail usually only surfaces from talking to operations staff directly, not from an engineer guessing at the spec.",
      },
    ],
  },
  {
    id: 'component-scaffold-script',
    title: 'Faster with AI-Era Tooling: A Parameterized Layout-Component Script',
    category: 'AI 實作',
    displayCategory: 'AI Implementation',
    period: '2026',
    description:
      'Standardized the manual process of "building a new ad layout component" into an SOP, then turned it into a parameterized script: feed in a component\'s naming parameters and it auto-generates the type definitions, component mapping, module exports, and test data. Cut development time (including testing) from {{5 working days}} to {{2}}, with an {{80% completion rate}} \u2014 faster and more accurate than doing it by hand. (The linked SOP document below has been redacted \u2014 internal system names and other commercially sensitive details from my former employer have been removed to protect their confidentiality.)',
    imageUrl: AiScript1.src,
    link: '/projects/component-scaffold-script',
    tags: ['Developer Tooling', 'Process Automation', 'SOP Design'],
    technologies: ['Node.js', 'TypeScript', 'React', 'Codegen'],
    media: [
      { type: 'image', url: AiScript1.src },
    ],
    links: [
      {
        label: 'SOP Document (Redacted)',
        url: 'https://hackmd.io/@KkiMC7PPQueku3pX2dHGeg/BkNETl-VMe',
        type: 'document',
      },
    ],
    sections: [
      {
        title: 'Process Audit & SOP Standardization',
        tabLabel: 'SOP Design',
        whatIDid: [
          '##Workflow Audit##Audited the full manual workflow for "building a new ad layout component" and found the same steps (registering the ad_code, component-mapping config, type definitions, module exports, test data) had to be hand-edited across {{5-6 different files}} every time \u2014 with the content and location of each edit almost identical, differing only in naming',
          '##SOP Parameters##Distilled this implicit process into a standard SOP document defining {{8 naming parameters}} (e.g. [ad_code], [FolderName], [ComponentName], [HandlerName], [ChineseName]); once those parameters are fixed, every subsequent step \u2014 which file to touch, what to add \u2014 becomes rule-based',
          '##Template Case##For the "build from an existing component" case (copying an existing TLW or HOLA component as a template), the SOP explicitly defines the source-folder parameters so the later script has something concrete to key off of',
        ],
        techUsed: ['SOP Documentation', 'Process Design', 'Naming Convention'],
        challenges:
          "##Symptom##Building a new layout component by hand took {{5 working days}} on average, including testing. Breaking down where that time actually went showed most of it wasn't spent on logic unique to that component \u2014 it was repetitive boilerplate: adding a near-identical block of code, differing only in variable names, across the type definitions, component mapping, index exports, and test data files. Missing one of those edits usually wasn't caught until a runtime error like \"Element type is invalid\" showed up, and then someone had to track down which step got skipped.\n\n##Investigation##Laying out records from past component additions side by side showed the step order and the files involved were almost completely fixed \u2014 the only thing that ever changed was a handful of naming-related parameters. In other words, this wasn't work that needed to be redesigned each time; it was the same rules applied to different parameters, repeated by hand \u2014 a good candidate for abstracting into a standard process and automating, rather than leaving it to each engineer's individual habits.\n\n##Fix##Made the implicit knowledge explicit first, writing it up as an SOP document (with each parameter's definition, format, and example) so anyone filling in the parameter table gets a consistent result. That step was also the precondition for automating it with a script \u2014 without the rules spelled out clearly, no program can know what to generate.",
        learnings:
          "##Explicit First##Automation isn't preceded by writing code \u2014 it's preceded by making the process and its rules explicit. A process you can't describe in a clear sentence usually can't be turned into a reliable script either. Just the act of converting implicit knowledge into an explicit SOP already lowered the team's cognitive load around \"how exactly is this step supposed to be done,\" even before any automation was written \u2014 documentation alone made onboarding faster.",
      },
      {
        title: 'Script Automation & Rollout Results',
        tabLabel: 'Automation & Impact',
        whatIDid: [
          "##Step-by-Step Codegen##Wrote automation logic matching each step defined in the SOP: given the naming parameters, the script auto-adds the new ad_code type in ad-data.type.ts, inserts the handler import and the AD_CODE_TO_COMPONENT_INFO config object in component-mapping.ts, and adds the component/type exports in index.ts",
          "##Template Copy##For the \"build from an existing component\" case, the script copies the file structure (UI component, handler, type) from the source folder named in the parameters, and batch-rewrites style class prefixes to match the target brand (e.g. hola-)",
          "##Auto Test Data##Auto-inserts the corresponding mock JSON into the pageData.ad_data array in the test-data file, so the new component shows up on the local page right after generation without hand-assembling test fixtures",
          "##80% Target##Deliberately left about 20% of the work for engineers to finish by hand (custom UI styling, component-specific business logic) \u2014 the script's target was {{80% completion}} on the parts that are guaranteed to repeat and follow a rule, not full end-to-end automation",
        ],
        techUsed: ['Node.js', 'Codegen Script', 'File System Automation'],
        challenges:
          "##Trust Concern##The biggest concern early on was whether the generated code could actually be trusted \u2014 if the script missed a file, it would fail at runtime exactly the same way a manual miss would, just with the script as the culprit instead of a person. For the script to genuinely replace most of the manual effort, it needed to cover every one of the SOP's fixed-rule file changes, not just a few of the steps.\n\n##Verification##Mapped each of the SOP's four major steps (system registration, component implementation, module export, test data) to its own processing function in the script, and back-tested each one against real past components \u2014 confirming the generated code's structure, naming, and exports matched what a human had produced by hand before treating it as production-ready. After rollout, tracking actual time spent on several new components confirmed development time including testing dropped {{from an average of 5 working days to 2}}, with the generated skeleton hitting an {{80% completion rate}} \u2014 leaving engineers to focus only on final UI customization and business logic.",
        comparisonTable: {
          columns: ['Aspect', 'Manual Process', 'Script-Automated Process'],
          rows: [
            ['Development time (incl. testing)', '{{5 working days}}', '{{2 working days}}'],
            ['Files touched', '5-6 files edited by hand, easy to miss one', 'Auto-generated per SOP rules, covers every fixed change point'],
            ['Skeleton completion rate', "Varies with the developer's experience and familiarity", '{{80%}} (types/mapping/exports/test data all in place)'],
            ['Consistency', 'Relies on memory or copying an old component', 'Uniform output driven by parameterized rules'],
          ],
        },
        learnings:
          "##Leverage, Not Speed##This made it clearer to me that in an AI/automation era, an engineer's leverage isn't typing speed \u2014 it's the ability to abstract repetitive, rule-following work into a clear process and parameters, then let tooling systematize it. It also taught me that automation doesn't need to chase 100% coverage: handing the predictable, rule-bound 80% to a script while leaving the remaining 20% for engineers to apply real judgment turned out to be a more practical, more maintainable design than forcing full automation.",
      },
    ],
  },
  {
    id: 'portfolio',
    title: 'Personal Portfolio Platform',
    category: '前端專案',
    displayCategory: 'Frontend Project',
    period: '2026',
    description:
      "This site is something I built alone, from scratch, during the gap after I left my last job. No PM handing me a spec, no team to share the decisions with, just me, a laptop, and an AI collaborator on call whenever I needed one. I called every shot from architecture down to the last line of code; AI helped me move faster through the repetitive, tedious parts, but I held myself to actually understanding every decision before I let it go.\n\n• Built on an Nx monorepo with Next.js 16 + React 19, leaving room to add more sub-projects later\n• Used MSW to mock a full backend API, running a real frontend/backend workflow; swapping in a real backend later needs almost no component changes\n• Supports bilingual switching, one-click resume PDF export, and full responsive design consistent across mobile and desktop\n• Roadmap: a visual admin editor to replace manually editing data in code",
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
      { label: 'GitHub Code', url: 'https://github.com/Bella-Jheng/portfolio', type: 'github' },
      { label: 'Demo Site', url: 'https://portfolio-liard-pi-12.vercel.app/', type: 'website' },
    ],
    sections: [
      {
        title: 'Learning to Work With AI, On My Own Terms',
        tabLabel: 'Working With AI',
        whatIDid: [
          '##Working Side by Side##From the moment I opened an empty project folder, I was basically working side by side with AI (Claude Code) every day, first hashing out "does this architecture actually make sense," then building components together one by one. It felt less like using a tool and more like having a fast, always-available, but inexperienced partner',
          '##I Call the Shots##Still, every time a real decision came up, whether to install a package, which library to pick, I\'d go research it myself first, weigh the tradeoffs, and only once I\'d made up my mind would I tell AI "go with this direction," instead of handing the decision over',
          '##Offloading Labor##Slowly settled into treating AI as something that could take repetitive labor off my plate, bulk copy edits, generating boilerplate, so I could keep my own energy for the parts that actually needed judgment',
        ],
        techUsed: ['Claude Code', 'AI Pair Programming', 'Code Review'],
        challenges:
          '##A Quiet Unease##What I struggled with early on wasn\'t really a technical problem, it was a quieter kind of unease. AI can spit out a plausible-looking chunk of code in seconds, and if I hadn\'t understood the tradeoffs behind it myself, I\'d have no idea how to fix it when something broke, which would mean outsourcing responsibility while pretending the work was still mine. So I made myself build a habit: understand any package or architectural decision well enough to own it before letting AI fill in the details, then go back afterward and read through it line by line to check it actually matched the logic I wanted, not just "well, it runs."',
        learnings:
          '##My Own Line##This continues something I\'d been slowly working out across other projects. Right after I left my last job, I was pretty resistant to AI, it felt like it was quietly taking away the part of the job I found most satisfying, that "got it" feeling of finally tracking down a bug. Building this site helped me land somewhere different: an engineer\'s value was never really about typing speed or how much syntax you remember, it\'s about being able to see the real problem clearly, know how to solve it, and be willing to stand behind the whole result once it\'s done. I can explain why every technical choice on this site was made the way it was, that\'s the line I\'ve drawn for myself. AI can help me move faster. It can\'t vouch for me.',
      },
      {
        title: 'Nx Monorepo & Layered Frontend Architecture',
        tabLabel: 'Architecture',
        whatIDid: [
          "##Laying the Foundation##Building this alone from nothing, I thought of it like laying a foundation before building a house: set up an Nx monorepo first, with apps/portfolio as the main structure and libs/ as the shared utilities I could keep building onto later, so adding something like an admin panel or a blog someday wouldn't mean starting over",
          '##Three Layers##Split components into three layers by "who needs to know what": atom components like Tag and Tabs are the basic building blocks and never touch business logic, while feature components like Gallery and ProjectSlider are the ones that actually talk to data and handle interaction',
          '##Type Discipline##Turned TypeScript strict mode all the way on and centralized every data shape under a types directory, choosing to spend a bit more time up front getting the types right instead of guessing at what the data looked like later through a pile of any',
        ],
        techUsed: ['Nx Monorepo', 'Next.js 16', 'React 19', 'TypeScript'],
        challenges:
          '##Blurred Boundaries##Honestly, early on I kept blurring "what this site needs" with "what this component should be responsible for." The Gallery component nearly ended up with logic wired straight to the page, deciding how to display itself based on whatever category was currently selected. I stopped, rethought it, and pulled it apart cleanly so Gallery only exposes a single media array on the outside, with all the switching, thumbnail syncing, and fullscreen logic packed away inside where callers never have to think about it. That\'s exactly the kind of detail that\'s easiest to let slide on a solo project, since I could always read my own code fine, so why bother keeping the boundaries clean. But the day these components actually need to move into another shared project, that kind of shortcut turns into a real obstacle.',
        learnings:
          '##Asking Myself##The loneliest part of working solo is that there\'s no one in a code review asking "does this design actually hold up," so I have to be the one who asks it. Drawing clean layer boundaries wasn\'t about someone else needing to take this over, it was for the version of me six months from now, coming back to this code and still being able to tell at a glance what I was thinking.',
      },
      {
        title: 'Splitting State: React Query vs. Zustand',
        tabLabel: 'State Management',
        whatIDid: [
          '##Splitting State##Treated "data from the server" and "the screen\'s own state" as two genuinely different things: async API data caching, loading, and error states all go through React Query, while things tied to screen interaction, like language preference and global loading, go through Zustand',
          "##Language-Keyed Cache##Let language ride along in React Query's query key, so switching languages automatically triggers a refetch of the right locale's data without me having to manually clear a cache",
        ],
        techUsed: ['TanStack Query', 'Zustand', 'TypeScript'],
        challenges:
          "##Tempting Shortcut##I actually considered just shoving everything into Zustand at first, the project's small, and maintaining two tools felt like more trouble than it was worth. But once fetch logic and screen state actually got tangled together in the same store, language switching, loading animations, and cache invalidation all started stepping on each other, and before long I couldn't even trace which action had triggered a given refetch myself. Once I slowed down and separated the two by what kind of state they actually were, it became obvious that data coming from a server belongs with a tool built to cache it, not shoved into a plain global variable.",
        learnings:
          "##Size Isn't an Excuse##A small project isn't a reason to get sloppy, if anything it's a good place to actually test why a tool was designed the way it was, instead of letting project size decide whether good habits are worth keeping. That's a judgment call I'll keep carrying forward, regardless of how big or small the next project turns out to be.",
      },
      {
        title: 'Mock-First API Design: Prove the Flow, Then Swap in a Real Backend',
        tabLabel: 'Mock-First API',
        whatIDid: [
          '##Intercept & Mock##With no backend to actually integrate against, used MSW to intercept HTTP requests in the browser and mock out a whole backend API, instead of taking the shortcut of hard-coding fake data straight into components',
          "##Decoupled Interface##Deliberately kept API functions completely separate from the mock handlers, so components only know they're talking to a fixed API interface, they don't know, and don't need to know, whether what's behind it is mocked or real",
          '##Bilingual Mocks##Maintained separate Chinese and English mock data files, with API functions returning the right locale based on a language parameter',
        ],
        techUsed: ['MSW (Mock Service Worker)', 'TanStack Query', 'TypeScript'],
        challenges:
          '##Sitting Alone Worried##With no real backend to work against, what worried me most was the risk of sitting alone in a room, inventing a data shape and workflow that felt reasonable in isolation, only to find the whole thing needs tearing down the day a real backend shows up. So I deliberately forced myself to design the API layer exactly the way I would for a real integration, loading and error handling included, instead of just dropping fetched data straight onto the screen. The idea being that swapping in a real API later should, in theory, mean pulling out the MSW handlers and pointing fetch at a real URL, with not a single line changed in any component or hook.',
        learnings:
          "##Discipline Transfers##Not having a backend to work with doesn't mean I get to skip the discipline of working frontend and backend separated. Holding myself to that discipline even inside a mocked environment mattered more than the site itself, because it's a habit I can actually carry into the next job, the next time I really do have to coordinate with a backend team.",
      },
      {
        title: 'Bilingual Support & Experience Details',
        tabLabel: 'UX Details',
        whatIDid: [
          "##Remembered Preference##Used Zustand with localStorage to remember a user's language preference, so refreshing the page, or closing the tab and coming back the next day, never coldly resets them back to the default language",
          '##Lightweight i18n##Wrote a small, lightweight t({ zh: "...", en: "..." }) translation helper by hand instead of pulling in a full i18n library, keeping the bilingual requirement at minimal cost while leaving a path open to upgrade to a proper i18n setup later',
          '##Less Flicker##Shows a skeleton placeholder while switching project categories, and lets the resume page export to PDF in one click, small things aimed at cutting down that "screen flickering" or "something just jumped" feeling',
        ],
        techUsed: ['Zustand', 'localStorage', 'html2canvas', 'jsPDF'],
        challenges:
          "##Almost Over-Installed##I almost reached straight for next-intl or i18next at the start. Once I actually stopped and sized up what the project needed, a handful of fixed pages, not much data, a full i18n library would've just added complexity and bundle size the project didn't need. The hard part was never choosing which tool, it was honestly facing what this project actually needed right now, instead of installing whatever's popular in the industry, while still leaving a door open in case it genuinely needs to grow into something more later.",
        learnings:
          "##Fit the Scale##Choosing a technology was never about picking the most powerful option, it's about picking the one that actually fits the current scale. Deliberately holding myself back from over-engineering here was really practice in judging when a simple solution is enough and when a heavier tool is genuinely worth it, and that judgment is harder to build, and worth more, than any single tool.",
      },
    ],
  },
  {
    id: 'self-management-workflow',
    title: 'Self-Management Workflow',
    category: '其他',
    displayCategory: 'Others',
    period: 'Ongoing',
    description:
      "A personal work-management workflow built in Notion, making my progress more visible to my manager and team while keeping past solutions from being forgotten.\n\n• Breaks tasks into sub-steps and ranks priority so progress is visible without having to ask\n• Logs each task's difficulties, attempted approaches, and solution into a searchable knowledge base\n• Reduces the risk of knowledge loss when a team member leaves\n• Tunes the breakdown granularity per project, refining the method over time",
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
    title: 'Product Spec for Member Services',
    category: 'PM 專案',
    displayCategory: 'PM Project',
    period: '2021-2022',
    description:
      "Served as Product Owner leading pre-registered-membership product initiatives, the communication bridge between three engineering teams, design, QA, marketing, and business.\n\n• Owned requirements gathering and spec writing, coordinating timelines and dependencies across teams\n• Used GA, GTM, and NLP to analyze user behavior, grounding specs in data rather than gut feeling\n• Prioritized multiple concurrent projects under limited engineering resources\n• Built cross-functional communication, requirements analysis, and project management skills",
    imageUrl: PM1.src,
    link: '/projects/pm-projects',
    tags: ['Product Management', 'Cross-team', 'NLP'],
    technologies: ['GA', 'GTM', 'Loki NLP', 'Spec Documentation'],
    media: [{ type: 'image', url: PM1.src }],
    links: [
      { label: 'Spec Document (Sample)', url: 'https://y6sx3j.axshare.com/#g=1&p=%E5%B0%88%E6%A1%88%E7%B0%A1%E4%BB%8B&dp=0&c=1', type: 'document' },
    ],
    sections: [],
  },
  {
    id: 'funtour-system',
    title: 'Travel Ticket Platform',
    category: '後端專案',
    displayCategory: 'Backend Project',
    period: '2021/2-2021/9',
    description:
      "Backend development for a travel ticketing platform where users buy tickets online (like Maokong Gondola passes) and redeem them.\n\n• Optimized the post-purchase email notification system for accurate, timely ticket info\n• Integrated third-party APIs for real-time inventory checks and order sync, with retry/error handling\n• Helped build payment services to keep transactions reliable and records accurate\n• My first backend role, and I learned that stability and data correctness matter more than shipping speed",
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
