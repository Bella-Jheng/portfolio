import { ResumeData } from '../resume-api.type';

export const RESUME_DATA_EN: ResumeData = {
  me: [
    {
      label: '【Core Philosophy】',
      content: 'I am a Frontend Software Engineer with experience in e-commerce backend/frontend and platform systems. I care deeply about whether implementations are understandable, stable, and maintainable for the long term.',
    },
    {
      label: '【Cross-role Translation】',
      content: 'Having held roles in Backend Dev, PM, and Frontend, I can bridge the gap between technical limitations and business priorities, helping teams make pragmatic decisions.',
    },
    {
      label: '【Technical Rigor】',
      content: 'Experience in transactional systems has built a high sensitivity to data accuracy, edge cases, and testing robustness.',
    },
  ],
  experience: [
    {
      period: '2022-PRESENT',
      company: 'Testrite (TLW)',
      title: 'Front-End Software Engineer',
      logoType: 'text',
      logoColor: '#E67E22',
      logoText: 'TLW',
      bulletPoints: [
        'Led a large-scale frontend architecture overhaul, migrating a single repo to a Monorepo, upgrading React 17 to React 18, replacing Bootstrap with Tailwind CSS, and adopting TypeScript across the board',
        'Led the redesign and decoupling of the Testrite and HOLA websites, auditing existing APIs and frontend logic while rebuilding pages and shipping new features',
        'Built an e-commerce page-building CMS from 0 to 1, with an extensible frontend architecture that lets business teams adjust ad placements on demand',
        'Independently built an interactive Christmas tree campaign page with complex product selection logic and state management, integrated with cart and checkout',
        'Defined coding style and folder structure standards, maintained frontend dependency strategy, and managed CI/CD pipelines',
        'Helped introduce AI tools into the development workflow and conducted code reviews to onboard new teammates',
      ],
      skills: ['NX', 'React', 'Redux', 'Zustand', 'TypeScript', 'Tailwind CSS'],
      projectUrl: '/projects?category=frontend',
    },
    {
      period: '2021-2022',
      company: '104 Job Bank',
      title: 'Product Owner',
      logoType: 'italicText',
      logoColor: 'transparent',
      logoText: '104',
      bulletPoints: [
        'Led the guest-to-member conversion project, coordinating 6 engineering teams and aligning product and engineering requirements, targeting a 50% conversion rate',
        'Redesigned the company-wide category management backend, improving the UX of a decade-old system and boosting cross-team collaboration',
        'Led the self-referral letter revamp project across departments, driving a 3x increase in page views after launch',
        'Designed NLP text segmentation rules and built a job-related semantic dictionary to support machine learning training',
        'Tracked user behavior and outcomes via GA/GTM to inform product iteration',
      ],
      skills: ['Project Management', 'GA/GTM', 'NLP'],
      projectUrl: '/projects?category=pm',
    },
    {
      period: '2021/2-2021/9',
      company: 'ft (Funtour)',
      title: 'Backend Software Engineer',
      logoType: 'text',
      logoColor: '#F39C12',
      logoText: 'ft',
      bulletPoints: [
        'Built core flows for a ticketing platform, covering online purchases, flash sales, and transaction notifications',
        'Optimized the post-purchase email system and backend interface, and wrote development and integration docs',
        'Led a third-party API integration project, using Postman for testing and writing automated test scripts',
        'Supported payment system API testing and code review to ensure integration stability and data accuracy',
      ],
      skills: ['Java', 'Grails', 'MySQL', 'jQuery'],
      projectUrl: '/projects?category=backend',
    },
  ],
  education: [
    {
      school: 'National Taipei University of Business',
      department: 'Applied Foreign Languages',
      logoColor: '#9B4D96',
      logoText: 'NTUB',
    },
  ],
};
