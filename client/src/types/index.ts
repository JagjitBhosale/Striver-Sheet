export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Topic {
  _id: string;
  name: string;
  slug: string;
  order: number;
  description?: string;
  sourceId: string;
  subcategories: Subcategory[];
  problemCount: number;
}

export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  order: number;
  sourceId: string;
}

export interface Problem {
  _id: string;
  topicId: Topic | string;
  subcategorySlug: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  order: number;
  sourceId: string;
  externalUrls: {
    leetcode?: string;
    youtube?: string;
    article?: string;
  };
  tags: string[];
}

export interface Progress {
  _id: string;
  userId: string;
  problemId: string;
  status: 'not_started' | 'attempted' | 'solved' | 'revision_required';
  solvedAt?: string;
  bookmarked: boolean;
  bookmarkCategories: string[];
  revisionStatus: 'not_revised' | 'revision_1' | 'revision_2' | 'revision_3' | 'mastered';
  lastRevised?: string;
  nextRevision?: string;
}

export interface SolutionSection {
  content: string;
  code: string;
  language: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface ProblemNote {
  _id: string;
  userId: string;
  problemId: string;
  keyIdea: string;
  patternUsed: string;
  thingsToRemember: string;
  commonMistake: string;
  myMistake: string;
  interviewTrick: string;
  revisionNote: string;
  brute: SolutionSection;
  better: SolutionSection;
  optimal: SolutionSection;
  personalTags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ImageData {
  _id: string;
  userId: string;
  problemId?: string;
  noteSection?: string;
  cloudinaryPublicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  size: number;
  createdAt: string;
}

export interface Mistake {
  _id: string;
  userId: string;
  problemId: string | Problem;
  mistake: string;
  why: string;
  correctApproach: string;
  lesson: string;
  code: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyActivity {
  date: string;
  problemsSolved: number;
  notesCreated: number;
  revisionsCompleted: number;
}

export interface Statistics {
  totalProblems: number;
  totalSolved: number;
  totalAttempted: number;
  totalUnsolved: number;
  completionPercentage: number;
  difficulty: {
    solved: { Easy: number; Medium: number; Hard: number };
    total: { Easy: number; Medium: number; Hard: number };
  };
  topicProgress: TopicProgressItem[];
  weeklySolved: number;
  monthlySolved: number;
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  notesCount: number;
  imagesCount: number;
  dailyActivity: DailyActivity[];
}

export interface TopicProgressItem {
  topicId: string;
  name: string;
  total: number;
  solved: number;
  percentage: number;
  difficulty: { Easy: number; Medium: number; Hard: number };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
