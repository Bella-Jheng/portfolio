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
        type: 'decision',
        title: 'Technical Validation & PoC',
        tabLabel: 'Validation',
        problem:
          'The hard question was not "should we use NX," but how to decouple two highly coupled legacy projects, whether the React 18 upgrade would introduce unpredictable issues, and how Tailwind and Bootstrap could coexist.',
        options: [
          {
            label: 'Full rewrite',
            detail:
              'Highest risk — business logic for both brands could not be validated in time without risking a production outage.',
          },
          {
            label: 'Keep two separate projects, upgrade independently',
            detail:
              'Does not solve the root problem of scattered shared logic and inconsistent React versions — just delays the architectural debt.',
          },
          {
            label: 'PoC first, then adopt NX Monorepo (chosen)',
            detail:
              'Worked with a senior engineer to test concurrent rendering impact, shared-lib extraction feasibility, and TypeScript conversion cost, then used the results to drive the decision.',
          },
        ],
        decision:
          'Adopted NX Monorepo + React 18 upgrade, backed by PoC data rather than gut feeling.',
        why: [
          'Reduced uncertainty on a transformation this consequential before committing',
          'This decision would shape the technical direction for the next 3-5 years — not something to guess on',
        ],
      },
      {
        type: 'comparison',
        title: 'Architecture: Before & After',
        tabLabel: 'Architecture',
        content:
          'Once the direction was set, the abstract "architecture upgrade" broke down into concrete, comparable changes.',
        columns: ['Aspect', 'Before', 'After'],
        rows: [
          ['Project management', 'HOLA / TLW in separate repos, shared logic copy-pasted', 'NX Monorepo with extracted shared libraries'],
          ['React version', 'Inconsistent across the two brands', 'Unified upgrade to React 18'],
          ['Styling', 'Bootstrap + per-brand custom CSS, hard to share', 'Unified Tailwind CSS system'],
          ['Type safety', 'No or partial TypeScript', 'Fully typed with TypeScript'],
          ['API logic', 'Scattered across pages, unclear module boundaries', 'Redesigned data flow and module boundaries'],
        ],
      },
      {
        title: 'Knowledge Transfer',
        tabLabel: 'Team Impact',
        content: 'After senior engineers left, I became the primary architect contact, assisting newcomers in understanding project structures and development standards. This experience taught me to build systems that can be passed on, not just write features.',
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
    sections: [
      {
        title: 'Data Flow & State Sync',
        content: 'Independent SKU management across environments required an abstraction layer for SKU mapping. I used Zustand for normalized state management, ensuring single-category updates without triggering full re-renders. Every logic is centralized in the state layer, ensuring unidirectional and traceable data flow.',
      },
      {
        title: 'Performance Optimization',
        content: 'Initial implementation triggered multiple state updates and re-renders. After optimization using concurrent requests and batch store writes, I significantly improved initial load rendering costs and interaction smoothness.',
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
    sections: [
      {
        title: 'Project Roles & Scope',
        content: 'Led the entire process from requirement definition to launch, including role-based workflows and API design. Current architecture allows adding new features and layouts without refactoring core logic.',
      },
      {
        title: 'Dynamic Component Injection',
        content: 'Frontend slots are data-driven. Each layout corresponds to a component mapping. Frontend dynamically loads components based on backend-defined types, significantly reducing expansion costs.',
      },
      {
        title: 'Schema-based Form Generator',
        content: 'Developed a schema-based form system to avoid duplicate form logic for different layout types. Each layout defines its fields, and the system dynamically generates input components and handles validation.',
      },
      {
        title: 'Data & Template Separation',
        content: 'Separated layout structures from content data. Layout handles field specs while data stores content and sorting, ensuring backward compatibility even during style adjustments.',
      },
      {
        title: 'Highlights & Capabilities',
        content: 'Supports DND sorting, real-time preview, permission management, and secure deployment flows. Reduced deployment frequency significantly while keeping content safe.',
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
    sections: [
      {
        title: 'Philosophy & Technical Core',
        content: 'Wanted to build a portfolio with personal character. Using Nx and Next.js, along with MSW to simulate a real API environment for full data interaction simulation.',
      },
      {
        title: 'Animation & User Experience',
        content: 'Added dynamic flower elements and scroll animations to enhance browsing experience and interaction smoothness.',
      },
      {
        title: 'Architecture Optimization',
        content: 'Used Nx for monorepo management and MSW for mocking, ensuring the project can be tested and showcased without a real backend.',
      },
      {
        title: 'Technical Challenges',
        content: 'Integrating previous e-commerce experience into a portfolio while maintaining good UX within limited space.',
      },
      {
        title: 'Future Plans',
        content: 'Continue optimizing the site and integrate a backend for easier content updates, moving away from manual MSW data updates.',
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
    sections: [
      {
        title: 'Task Management',
        content: 'Utilizing Notion to track every task and prioritize them, ensuring urgent and important items are handled first while clarifying daily focus.',
      },
      {
        title: 'Transparent Communication',
        content: 'By using clear status and progress records, supervisors can understand current workload and priorities, significantly reducing communication costs.',
      },
      {
        title: 'Implementation History',
        content: 'Detailed records of implementation and difficulties are documented and synced back to company systems, serving as shared knowledge for the team.',
      },
    ],
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
    sections: [
      {
        title: 'Product Overview',
        content: 'Planned cross-platform data synchronization to convert external data into resume profiles.',
      },
      {
        title: 'Responsibilities',
        content: 'Includes requirement gathering, cross-team coordination (Engineering, QA, Business), drafting specifications, and building demo sites for testing.',
      },
    ],
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
    sections: [
      {
        title: 'Core Responsibilities',
        content: 'Optimized ticketing email systems and planned architectural integrations. Performed API testing and validation using Postman.',
      },
      {
        title: 'Payment Services & Testing',
        content: 'Assisted in payment service development, performed code reviews, and drafted integration documents, building sensitivity to data accuracy and edge cases.',
      },
      {
        title: 'UI/UX Optimization',
        content: 'Participated in backend interface improvements to enhance internal tool usability.',
      },
      {
        title: 'Documentation & Collaboration',
        content: 'Translated business needs into engineering specs and maintained API documentation for third-party service integration.',
      },
    ],
  },
];
