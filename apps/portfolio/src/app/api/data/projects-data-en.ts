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

export const PROJECTS_DATA_EN: FullProject[] = [
  {
    id: 'testrite-refactor',
    title: 'HOLA / TLW E-commerce Frontend Architecture Refactor',
    category: '前端專案',
    displayCategory: 'Frontend Project',
    period: '2023 - 2024',
    description:
      'Previously, two brands maintained separate projects with inconsistent React versions and messy style architectures. Within three months of joining, I participated in this core frontend reconstruction. This was not just a version upgrade, but an architectural transformation determining the technical direction for the next 3-5 years. I was involved from PoC validation to actual development, eventually becoming the most knowledgeable person regarding the overall architecture. To me, the value of architecture lies in making the path easier for those who follow.',
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
          'Led the planning and execution of migrating the HOLA frontend from a single-repo to an NX mono-repo, covering a full audit and conversion of folder structure, React version, component style, styling framework, and test framework.',
          '2022/12/13: architecture requirements proposed, planning began',
          '2023/7/24: new page development began (homepage, product page, category pages, search results)',
          '2023/10/23: integration testing began',
          '2023/11/29: launched (roughly 365 days end to end)',
        ],
        techUsed: ['NX Monorepo', 'React 18', 'TypeScript', 'Tailwind CSS', 'Jest'],
        challenges:
          "Symptom: to keep up with constant change requests, the old architecture never dared to retire old components or styles — new ones just got layered on top, so the codebase kept growing. Old and new components shared parts of the same flow, so old flows could never be fully removed either, leaving a lot of dead code behind. Build/deploy time eventually stretched to about 20 minutes.\n\nInvestigation: auditing the single-repo's folder structure showed that Utilities and Components both had \"hola\" and \"others\" code mixed together with no clear module boundary — that was the real root cause of low reusability and the ever-growing codebase, not that the components themselves were badly written. We also re-examined the specific limitations of React 17, class-based components, and Bootstrap: Bootstrap had to be injected at the site's outermost layer, so any version mismatch between header and body would break the layout; class-based components made `this` easy to get wrong in complex scenarios.\n\nFix: proposed an NX mono-repo layout that split Utilities/Apis/Components from a mixed \"hola/tlw\" structure into brand-specific folders under Applications (hola, tlw), each managing its own Utility/Apis/Components, while hoisting genuinely common components (header, footer, product card) to the outer shared layer. In parallel, upgraded to React 18 (automatic batching now applies to all state updates, not just event listeners, plus Suspense/Transition), switched to functional components, replaced Bootstrap with Tailwind (scoped styles fix the leakage problem, plus tree-shaking), and added Jest as the test framework.",
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
          "Build time dropped from 17m2s to 7m45s — more than cut in half. Also learned that architectural migration isn't always black-and-white per technology (class-based components still had real advantages for batched complex state and lifecycle control, for instance) — trade-offs should be based on the actual constraints and costs of the situation, not just chasing what's newer. A transformation this large also needs to be broken into distinct plan → build → integration-test → launch phases to stay under control.",
      },
      {
        title: 'State Management Evolution: From Redux Toolkit to Zustand + React Query',
        tabLabel: 'State Mgmt',
        whatIDid:
          'The project originally planned to use redux-toolkit for state management. After real development began, I helped re-evaluate how async API data and cross-component shared state should be handled, and gradually replaced redux-toolkit with a React Query + Zustand combination.',
        techUsed: ['Zustand', 'React Query (useQuery/useMutation)', 'Redux Toolkit (original plan)'],
        challenges:
          'Symptom: the product page fires a lot of varied async requests (spec switching, stock lookups, coupon checks...). Following the original redux-toolkit plan, every new query meant writing another slice, and loading/error states had to be managed by hand — the codebase kept growing.\n\nInvestigation: re-examining what these states actually were, almost all of them were "fetch data from the backend" query behavior — fundamentally different from the "cross-component synchronous UI state" Redux was designed for. Forcing both into the same tool was the real source of the boilerplate explosion. We also explicitly defined the split in team discussions: useQuery for reads (like coupon checks), useMutation for writes (like add-to-cart).\n\nFix: moved all async API data to React Query\'s useQuery/useMutation (which handles loading/error/cache automatically). Redux Toolkit was kept only for the few cases that truly needed cross-component synchronous state, and even that was gradually replaced by the lighter-weight Zustand — redux-toolkit eventually phased out of the project entirely.',
        comparisonTable: {
          columns: ['Aspect', 'Redux Toolkit (original)', 'React Query + Zustand (after)'],
          rows: [
            ['Async API data', 'Manual slice + thunk; loading/error handled by hand', 'useQuery/useMutation auto-handle loading/error/cache'],
            ['Cross-component sync state', 'Also handled via redux slices', 'Moved to Zustand — lighter, nearly zero boilerplate'],
            ['Adding a new query', 'Requires a new slice + reducer', 'Just call useQuery, no extra boilerplate'],
            ['Final role in the project', 'Sole state solution site-wide', 'Phased out; only transitional leftovers remain'],
          ],
        },
        learnings:
          "It's not about picking one state management tool and sticking with it forever — the right choice depends on the nature of the data: Zustand for cross-component synchronous state, React Query for async data caching and revalidation. The combination fit the actual needs far better than Redux Toolkit alone, and cut boilerplate significantly.",
      },
      {
        title: 'Shared Component Boundaries: From HOLA-Only to Cross-Brand',
        tabLabel: 'Component Boundaries',
        whatIDid:
          "During the 2023 architecture overhaul, the NX mono-repo had already laid out hola and tlw as separate folders under Applications. But when TLW development actually kicked off in 2024, we found that libs/hola-layout and libs/hola-ui-component — nominally in the shared layer — were in fact named and built specifically for HOLA. I had to re-define the boundary between 'genuinely shared' and 'brand-specific,' and clarify what libs/utilities (truly brand-agnostic shared functions/hooks) should actually contain.",
        techUsed: ['Nx Libs', 'Nx affected build/test', 'Component Boundary Design'],
        challenges:
          'Symptom: when TLW started, the first instinct was to directly reuse libs/hola-layout and libs/hola-ui-component, which HOLA had already built and placed under the shared-layer folder.\n\nInvestigation: unpacking what was actually inside these libraries revealed that, despite living in a "shared" folder, their naming, style variables, and even parts of the logic were hard-wired for HOLA. If TLW imported them directly, brand-coupled code would be inherited as if it were generic. But if each brand maintained its own copy instead, Nx workspace\'s affected build/test (which only rebuilds genuinely changed projects) would lose its point — the two brands would end up forced to rebuild together regardless.\n\nFix: after discussing with the team, we extracted the parts that were truly decoupled from brand-specific business logic into their own folder, kept hola-layout/hola-ui-component HOLA-only, and split out the logic TLW actually needed to share — keeping the Nx affected mechanism accurate to what had really changed.',
        comparisonTable: {
          columns: ['Aspect', 'Before (when TLW started)', 'After (boundary redefined)'],
          rows: [
            ['libs/hola-layout, hola-ui-component', 'Treated as shared; TLW planned to reuse directly', 'Kept HOLA-only, no longer considered cross-brand shared'],
            ['Genuinely reusable logic', 'Mixed together with brand-specific logic in the same lib', 'Split into its own folder for TLW and future brands to share'],
            ['Nx affected build/test', 'Would drift out of accuracy if each brand duplicated code', 'Stays accurate once the shared boundary is clear'],
          ],
        },
        learnings:
          'Living in a "shared" folder doesn\'t mean something is actually shareable — the real test is whether the code is decoupled from brand-specific business logic, not its file path. Since then, whenever planning a new shared component, the first question is: is this genuinely generic logic, or does it just happen to be used by one brand right now?',
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
      'A high-interaction campaign page created for the Christmas shopping season, integrating complex customization logic and real-time UI updates to provide an immersive shopping experience.',
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
    sections: [],
  },
  {
    id: 'cms-development',
    title: 'E-commerce Admin CMS Development',
    category: '前端專案',
    displayCategory: 'Frontend Project',
    period: '2025',
    description:
      'Previously, updating ad spots required code changes and deployment, which was time-consuming. This project designed and implemented a visual layout system from scratch, enabling operation teams to manage content while maintaining data integrity and frontend stability. It refactored the relationship between layout management and data models, building a scalable architecture.',
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
    sections: [],
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
          'Audited the full manual workflow for "building a new ad layout component" and found the same steps (registering the ad_code, component-mapping config, type definitions, module exports, test data) had to be hand-edited across {{5-6 different files}} every time \u2014 with the content and location of each edit almost identical, differing only in naming',
          'Distilled this implicit process into a standard SOP document defining {{8 naming parameters}} (e.g. [ad_code], [FolderName], [ComponentName], [HandlerName], [ChineseName]); once those parameters are fixed, every subsequent step \u2014 which file to touch, what to add \u2014 becomes rule-based',
          'For the "build from an existing component" case (copying an existing TLW or HOLA component as a template), the SOP explicitly defines the source-folder parameters so the later script has something concrete to key off of',
        ],
        techUsed: ['SOP Documentation', 'Process Design', 'Naming Convention'],
        challenges:
          "Symptom: building a new layout component by hand took {{5 working days}} on average, including testing. Breaking down where that time actually went showed most of it wasn't spent on logic unique to that component \u2014 it was repetitive boilerplate: adding a near-identical block of code, differing only in variable names, across the type definitions, component mapping, index exports, and test data files. Missing one of those edits usually wasn't caught until a runtime error like \"Element type is invalid\" showed up, and then someone had to track down which step got skipped.\n\nInvestigation: laying out records from past component additions side by side showed the step order and the files involved were almost completely fixed \u2014 the only thing that ever changed was a handful of naming-related parameters. In other words, this wasn't work that needed to be redesigned each time; it was the same rules applied to different parameters, repeated by hand \u2014 a good candidate for abstracting into a standard process and automating, rather than leaving it to each engineer's individual habits.\n\nFix: made the implicit knowledge explicit first, writing it up as an SOP document (with each parameter's definition, format, and example) so anyone filling in the parameter table gets a consistent result. That step was also the precondition for automating it with a script \u2014 without the rules spelled out clearly, no program can know what to generate.",
        learnings:
          "Automation isn't preceded by writing code \u2014 it's preceded by making the process and its rules explicit. A process you can't describe in a clear sentence usually can't be turned into a reliable script either. Just the act of converting implicit knowledge into an explicit SOP already lowered the team's cognitive load around \"how exactly is this step supposed to be done,\" even before any automation was written \u2014 documentation alone made onboarding faster.",
      },
      {
        title: 'Script Automation & Rollout Results',
        tabLabel: 'Automation & Impact',
        whatIDid: [
          "Wrote automation logic matching each step defined in the SOP: given the naming parameters, the script auto-adds the new ad_code type in ad-data.type.ts, inserts the handler import and the AD_CODE_TO_COMPONENT_INFO config object in component-mapping.ts, and adds the component/type exports in index.ts",
          "For the \"build from an existing component\" case, the script copies the file structure (UI component, handler, type) from the source folder named in the parameters, and batch-rewrites style class prefixes to match the target brand (e.g. hola-)",
          "Auto-inserts the corresponding mock JSON into the pageData.ad_data array in the test-data file, so the new component shows up on the local page right after generation without hand-assembling test fixtures",
          "Deliberately left about 20% of the work for engineers to finish by hand (custom UI styling, component-specific business logic) \u2014 the script's target was {{80% completion}} on the parts that are guaranteed to repeat and follow a rule, not full end-to-end automation",
        ],
        techUsed: ['Node.js', 'Codegen Script', 'File System Automation'],
        challenges:
          "The biggest concern early on was whether the generated code could actually be trusted \u2014 if the script missed a file, it would fail at runtime exactly the same way a manual miss would, just with the script as the culprit instead of a person. For the script to genuinely replace most of the manual effort, it needed to cover every one of the SOP's fixed-rule file changes, not just a few of the steps.\n\nFix & verification: mapped each of the SOP's four major steps (system registration, component implementation, module export, test data) to its own processing function in the script, and back-tested each one against real past components \u2014 confirming the generated code's structure, naming, and exports matched what a human had produced by hand before treating it as production-ready. After rollout, tracking actual time spent on several new components confirmed development time including testing dropped {{from an average of 5 working days to 2}}, with the generated skeleton hitting an {{80% completion rate}} \u2014 leaving engineers to focus only on final UI customization and business logic.",
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
          "This made it clearer to me that in an AI/automation era, an engineer's leverage isn't typing speed \u2014 it's the ability to abstract repetitive, rule-following work into a clear process and parameters, then let tooling systematize it. It also taught me that automation doesn't need to chase 100% coverage: handing the predictable, rule-bound 80% to a script while leaving the remaining 20% for engineers to apply real judgment turned out to be a more practical, more maintainable design than forcing full automation.",
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
      'More than just a showcase, this is an integration of frontend best practices including Next.js and MSW for full-stack simulation.',
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
    sections: [],
  },
  {
    id: 'self-management-workflow',
    title: 'Self-Management Workflow',
    category: '其他',
    displayCategory: 'Others',
    period: 'Ongoing',
    description:
      'Established a high-efficiency management flow using Notion for task breakdown and prioritization. This not only allows supervisors to track progress but also creates a knowledge base of technical challenges and solutions.',
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
      'Served as Product Owner, leading cross-team collaboration involving multiple engineering and design teams, and acting as a bridge between business and technical units.',
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
      'Participated in backend development for a travel platform, responsible for email optimization, third-party API integration, and payment services, ensuring stable transaction flows.',
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
