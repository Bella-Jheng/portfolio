import { Project } from '../api/project-list-api.type';

export function getProjectListApiResponse(): Project[] {
  return [
    {
      id: 'alpha',
      title: 'Project Alpha',
      category: '特力集團（特力屋、HOLA）',
      description:
        'A comprehensive e-commerce platform built with Next.js and Tailwind CSS, focusing on user experience and performance.',
      imageUrl:
        'https://cdn.hola.com.tw/medias/sys_master/advimage/advimage/h9e/h1a/10099943014430/PALETTE-.jpg',
      link: '/projects/alpha',
      tags: ['Next.js', 'Tailwind', 'e-commerce'],
    },
    {
      id: 'beta',
      title: 'Beta Dashboard',
      category: '104人力銀行',
      description:
        'An interactive analytics dashboard providing real-time data visualization and insightful metrics for business growth.',
      imageUrl:
        'https://cdn.hola.com.tw/medias/sys_master/advimage/advimage/h56/hac/10099943145502/PALETTE-.jpg',
      link: '/projects/beta',
      tags: ['React', 'Chart.js', 'Analytics'],
    },
    {
      id: 'gamma',
      title: 'Gamma Mobile App',
      category: '特力集團（特力屋、HOLA）',
      description:
        'A sleek and responsive mobile application designed to streamline daily tasks and improve productivity for professionals.',
      imageUrl:
        'https://cdn.hola.com.tw/medias/sys_master/advimage/advimage/h62/hf6/10099943276574/-.jpg',
      link: '/projects/gamma',
      tags: ['React Native', 'Firebase', 'Mobile'],
    },
    {
      id: 'delta',
      title: 'Delta Portfolio',
      category: '104人力銀行',
      description:
        'A premium portfolio template featuring smooth animations and a minimalist design to showcase creative work effectively.',
      imageUrl:
        'https://pcm.trplus.com.tw/1000x1000/sys-master/productImages/h96/hd5/12454123831326/000000000014379154-gallery-01-20250415150807143.jpg',
      link: '/projects/delta',
      tags: ['Framer Motion', 'Minimalist', 'Design'],
    },
  ];
}
