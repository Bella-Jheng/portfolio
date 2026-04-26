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
        'Participated in large-scale e-commerce refactoring (Monorepo/Next.js/React 18)',
        'Developed e-commerce CMS systems from 0 to 1',
        'Led development of high-interaction campaign pages and performance optimization',
        'Maintained CI/CD flows and documentation standards',
      ],
      skills: ['NX', 'React', 'Zustand', 'TypeScript', 'Tailwind CSS'],
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
        'Led guest-to-member conversion project, coordinating 6 engineering teams',
        'Refactored UI/UX for common category management systems',
        'Designed NLP segmentation rules for machine learning support',
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
        'Optimized ticketing email systems and backend interfaces',
        'Integrated and validated third-party APIs',
        'Assisted in payment system development and API testing',
      ],
      skills: ['Java', 'Grails', 'MySQL'],
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
