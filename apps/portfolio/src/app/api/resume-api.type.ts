export interface MeItem {
  label: string;
  content: string;
}

export interface ExperienceItem {
  period: string;
  company: string;
  title: string;
  logoType: string;
  logoColor: string;
  logoText: string;
  bulletPoints: string[];
  skills: string[];
  projectUrl: string;
}

export interface EducationItem {
  school: string;
  department: string;
  logoColor: string;
}

export interface ResumeData {
  me: MeItem[];
  experience: ExperienceItem[];
  education: EducationItem[];
}
