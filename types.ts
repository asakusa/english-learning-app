export interface WordItem {
  english: string;
  japanese: string;
  kana: string;
  chinese: string;
  sentence: string;
  generatedImageUrl?: string;
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: 'daily' | 'business' | 'travel' | 'food';
  color: string;
}

export interface UserStats {
  streak: number;
  lastLoginDate: string; // ISO Date string
  points: number;
  learnedWords: number;
  wordsToday: number;
  goalToday: number;
}

export enum Tab {
  HOME = 'HOME',
  LEARN = 'LEARN',
  PROFILE = 'PROFILE'
}

export enum LearningState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED'
}