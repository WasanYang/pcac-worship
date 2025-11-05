import { placeholderImages } from './placeholder-images.json';
import type { Timestamp } from 'firebase/firestore';

export type Song = {
  id: string;
  title: string;
  author: string;
  key: string;
  bpm: number;
  ccli: string;
  lastPlayed: string;
  lastUsedBy: string;
  themes: string[];
  style: string;
  dynamic: string;
  usage: { date: string; service: string; worshipLeader: string }[];
};

export type Service = {
  id: string;
  theme: string;
  sermonTheme: string;
  /**
   * firebase timestamp
   */
  date: Timestamp;
  worshipLeaderId: string;
  imageUrl: string;
  team: { memberId: string }[];
  setlist: Song[];
};

export type Role =
  | 'admin'
  | 'worship leader'
  | 'vocalist'
  | 'keys'
  | 'guitar (acoustic)'
  | 'guitar (electric)'
  | 'bass'
  | 'drums'
  | 'sound'
  | 'media'
  | 'team member';

export type UserProfile = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
};

export type TeamMember = {
  id: string;
  name: string;
  role: Role[] | string;
  avatarUrl: string;
  email: string;
  skills: { skill: string; progress: number }[];
  mentoringNotes: { date: string; note: string }[];
  userId: string;
  blockoutDates?: string[];
};

export type AccountabilityGroup = {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  memberIds: string[];
  members: { id: string; contactStatus: 'Contacted' | 'Pending' | 'Missed' }[];
};

export const recentSongs: Song[] = [
  {
    id: '1',
    title: 'Goodness of God',
    author: 'Bethel Music',
    key: 'G',
    bpm: 126,
    ccli: '7117726',
    lastPlayed: '2024-05-12',
    lastUsedBy: 'Alex Ray',
    themes: ['Goodness', 'Faithfulness'],
    style: 'Ballad',
    dynamic: 'Medium',
    usage: [
      {
        date: '2024-05-12',
        service: 'Sunday Morning Worship',
        worshipLeader: 'Alex Ray',
      },
      {
        date: '2024-03-10',
        service: 'Sunday Morning Worship',
        worshipLeader: 'Alex Ray',
      },
      {
        date: '2024-01-21',
        service: 'Mid-week Prayer',
        worshipLeader: 'Taylor Green',
      },
    ],
  },
  {
    id: '2',
    title: 'What A Beautiful Name',
    author: 'Hillsong Worship',
    key: 'D',
    bpm: 136,
    ccli: '7068424',
    lastPlayed: '2024-05-05',
    lastUsedBy: 'Taylor Green',
    themes: ['Jesus', 'Power', 'Majesty'],
    style: 'Anthem',
    dynamic: 'High',
    usage: [
      {
        date: '2024-05-05',
        service: 'Sunday Morning Worship',
        worshipLeader: 'Taylor Green',
      },
      {
        date: '2024-02-18',
        service: 'Youth Night',
        worshipLeader: 'Taylor Green',
      },
    ],
  },
  {
    id: '3',
    title: 'Way Maker',
    author: 'Sinach',
    key: 'E♭',
    bpm: 132,
    ccli: '7115744',
    lastPlayed: '2024-04-28',
    lastUsedBy: 'Alex Ray',
    themes: ['Promise', 'Miracle'],
    style: 'Gospel',
    dynamic: 'Medium',
    usage: [
      {
        date: '2024-04-28',
        service: 'Sunday Morning Worship',
        worshipLeader: 'Alex Ray',
      },
    ],
  },
  {
    id: '4',
    title: 'Raise a Hallelujah',
    author: 'Bethel Music',
    key: 'C',
    bpm: 82,
    ccli: '7119315',
    lastPlayed: '2024-04-21',
    lastUsedBy: 'Jordan Lee',
    themes: ['Victory', 'Praise'],
    style: 'Rock',
    dynamic: 'High',
    usage: [
      {
        date: '2024-04-21',
        service: 'Mid-week Prayer',
        worshipLeader: 'Jordan Lee',
      },
    ],
  },
  {
    id: '5',
    title: 'Living Hope',
    author: 'Phil Wickham',
    key: 'A',
    bpm: 144,
    ccli: '7106807',
    lastPlayed: '2024-05-19',
    lastUsedBy: 'Taylor Green',
    themes: ['Salvation', 'Hope'],
    style: 'Contemporary',
    dynamic: 'Medium',
    usage: [
      {
        date: '2024-05-19',
        service: 'Sunday Morning Worship',
        worshipLeader: 'Taylor Green',
      },
      {
        date: '2024-04-07',
        service: 'Sunday Morning Worship',
        worshipLeader: 'Alex Ray',
      },
    ],
  },
  {
    id: '6',
    title: 'King of Kings',
    author: 'Hillsong Worship',
    key: 'D',
    bpm: 138,
    ccli: '7127647',
    lastPlayed: '2024-03-31',
    lastUsedBy: 'Alex Ray',
    themes: ['Gospel Story', 'Majesty'],
    style: 'Anthem',
    dynamic: 'High',
    usage: [],
  },
  {
    id: '7',
    title: 'The Blessing',
    author: 'Kari Jobe, Cody Carnes',
    key: 'B',
    bpm: 140,
    ccli: '7147007',
    lastPlayed: '2024-04-14',
    lastUsedBy: 'Jordan Lee',
    themes: ['Blessing', 'Generation'],
    style: 'Ballad',
    dynamic: 'Building',
    usage: [],
  },
];
