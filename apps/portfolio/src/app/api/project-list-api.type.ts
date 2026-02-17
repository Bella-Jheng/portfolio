export type ProjectCategory = '前端專案' | 'PM 專案' | '後端專案' | '其他';

export interface Project {
  id: string;
  category: ProjectCategory;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  tags: string[];
}

export type ProjectListApiResponse = Project[];
