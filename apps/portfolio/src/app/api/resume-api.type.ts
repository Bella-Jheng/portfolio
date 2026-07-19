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
  logoText: string;
}

export interface ResumeData {
  me: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
}
