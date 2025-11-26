import { Scene } from './types';

export const INITIAL_SCENES: Scene[] = [
  {
    id: 'coffee-shop',
    title: 'Coffee Shop',
    description: 'Ordering drinks and snacks',
    imageUrl: 'https://picsum.photos/seed/coffee/600/400',
    category: 'food',
    color: 'bg-amber-100 text-amber-800'
  },
  {
    id: 'subway',
    title: 'Subway Station',
    description: 'Navigating public transport',
    imageUrl: 'https://picsum.photos/seed/subway/600/400',
    category: 'travel',
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'office',
    title: 'Business Meeting',
    description: 'Workplace vocabulary',
    imageUrl: 'https://picsum.photos/seed/office/600/400',
    category: 'business',
    color: 'bg-slate-100 text-slate-800'
  },
  {
    id: 'supermarket',
    title: 'Supermarket',
    description: 'Buying groceries',
    imageUrl: 'https://picsum.photos/seed/market/600/400',
    category: 'daily',
    color: 'bg-green-100 text-green-800'
  }
];

export const INITIAL_STATS = {
  streak: 0,
  lastLoginDate: '',
  points: 0,
  learnedWords: 0,
  wordsToday: 0,
  goalToday: 10
};
