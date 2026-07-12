export type ProjectCategory = '前端專案' | 'AI 實作' | 'PM 專案' | '後端專案' | '其他';

export interface Project {
  id: string;
  imageUrl: string;
  link: string;
  tags: string[];
  category: ProjectCategory;
  title: string;
  description: string;
  displayCategory: string; // The translated category label
}

export type ProjectListApiResponse = Project[];
