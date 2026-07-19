import { ResumeData } from '../resume-api.type';

export const RESUME_DATA_EN: ResumeData = {
  me: [
    "I studied Applied Foreign Languages, not computer science. During a college internship at the front desk of the Grand Hotel, I realized for the first time that being fluent in English alone made me easy to replace. After the internship, I started picking up other skills to stand out, even flying to Thailand to learn Thai. Then COVID hit, and jobs built around face-to-face language work shrank fast.",
    'A friend introduced me to TibaMe, a coding bootcamp. I started with backend, and taught myself frontend along the way so I could ship a complete project. It was in the process of actually building something that I noticed how much I cared about how a screen looked and how it felt to use, far more than I cared about shaving a few seconds off a query. My first backend job only made that feeling more certain.',
    'To figure out what I actually wanted, I took a Product Manager role, close to the whole picture, working directly with frontend, backend, design, and QA, watching what each side actually cared about and where they got stuck. Six months into that role, I started teaching myself frontend again, and luckily, six months after that, I joined Testrite.',
    "At Testrite, I helped rebuild the e-commerce frontend architecture from the ground up. Within a year, the redesign's impact earned me a promotion, and I started leading junior engineers in maintaining the system and building development standards the whole team could follow. That experience taught me something beyond getting the architecture right: how to turn judgment calls that used to live only in my head into a process other people could actually follow. Going further back, my time as a PM taught me how to find solutions that could actually ship within both engineering constraints and business goals, and how to translate what each role cared about into language everyone could understand. Both are things I want to bring to my next team.",
    "When AI started becoming mainstream, I didn't treat it as a threat. I used it to solve a problem I understood better than anyone: building a new page component from scratch used to take about five workdays, most of it spent on repetitive, easy-to-miss boilerplate. I turned that manual process into a fixed set of rules, then wrote an automation script around it, cutting the timeline to two days with an 80% completion rate on the base structure, freeing engineers to focus on the UI details and business logic that actually needed judgment. That experience made something click for me: in an AI-driven world, my value isn't in how fast I can type code, it's in spotting recurring bottlenecks, systematizing the fix, and owning every line I ship.",
    'Eventually I chose to leave, wanting to bring these skills somewhere they could go further. I am currently looking for my next front-end engineering role, hoping to bring this same commitment to systems, process, and user experience to the next team.',
  ],
  experience: [
    {
      period: '2022-2026',
      company: 'Testrite (TLW)',
      title: 'Front-End Software Engineer → Senior Engineer',
      logoType: 'text',
      logoColor: '#E67E22',
      logoText: 'TLW',
      bulletPoints: [
        'Promoted to Senior Engineer within a year for driving a high-impact redesign, and began leading junior engineers in maintaining the system',
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
