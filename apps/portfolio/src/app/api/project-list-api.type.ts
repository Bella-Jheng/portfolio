export interface Project {
  id: string;
  category: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  tags: string[];
}

export type ProjectListApiResponse = Project[];
