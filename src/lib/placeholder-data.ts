import { placeholderImages } from './placeholder-images.json';

export type Song = {
  id: string;
  title: string;
  author: string;
  key: string;
  bpm: number;
  ccli: string;
  lastPlayed: string;
  themes: string[];
  style: string;
  dynamic: string;
};

export type Service = {
  id: string;
  theme: string;
  sermonTheme: string;
  date: string;
  worshipLeader: string;
  imageUrl: string;
  team: { role: string; member: string | null }[];
  setlist: Song[];
};

export type Role = "Admin" | "Worship Leader" | "Vocalist" | "Keys" | "Guitar (Acoustic)" | "Guitar (Electric)" | "Bass" | "Drums" | "Sound" | "Media" | "Team Member";

export type TeamMember = {
  id: string;
  name: string;
  role: Role[] | string;
  avatarUrl: string;
  email: string;
  skills: { skill: string; progress: number }[];
  mentoringNotes: { date: string; note: string }[];
  userId: string;
};

export type AccountabilityGroup = {
  id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
  members: { name: string; contactStatus: 'Contacted' | 'Pending' | 'Missed' }[];
};

export type Schedule = {
    id: string;
    serviceId: string;
    teamMemberId: string;
    acceptanceStatus: 'accepted' | 'rejected' | 'pending';
}


export const recentSongs: Song[] = [
  { id: '1', title: "Goodness of God", author: "Bethel Music", key: "G", bpm: 126, ccli: '7117726', lastPlayed: '2024-05-12', themes: ['Goodness', 'Faithfulness'], style: 'Ballad', dynamic: 'Medium' },
  { id: '2', title: "What A Beautiful Name", author: "Hillsong Worship", key: "D", bpm: 136, ccli: '7068424', lastPlayed: '2024-05-05', themes: ['Jesus', 'Power', 'Majesty'], style: 'Anthem', dynamic: 'High' },
  { id: '3', title: "Way Maker", author: "Sinach", key: "E♭", bpm: 132, ccli: '7115744', lastPlayed: '2024-04-28', themes: ['Promise', 'Miracle'], style: 'Gospel', dynamic: 'Medium' },
  { id: '4', title: "Raise a Hallelujah", author: "Bethel Music", key: "C", bpm: 82, ccli: '7119315', lastPlayed: '2024-04-21', themes: ['Victory', 'Praise'], style: 'Rock', dynamic: 'High' },
  { id: '5', title: "Living Hope", author: "Phil Wickham", key: "A", bpm: 144, ccli: '7106807', lastPlayed: '2024-05-19', themes: ['Salvation', 'Hope'], style: 'Contemporary', dynamic: 'Medium' },
  { id: '6', title: "King of Kings", author: "Hillsong Worship", key: "D", bpm: 138, ccli: '7127647', lastPlayed: '2024-03-31', themes: ['Gospel Story', 'Majesty'], style: 'Anthem', dynamic: 'High' },
  { id: '7', title: "The Blessing", author: "Kari Jobe, Cody Carnes", key: "B", bpm: 140, ccli: '7147007', lastPlayed: '2024-04-14', themes: ['Blessing', 'Generation'], style: 'Ballad', dynamic: 'Building' },
];

export const teamMembers: TeamMember[] = [
  { id: '1', name: "Alex Ray", role: "Worship Leader", avatarUrl: placeholderImages.find(p => p.id === 'user1')?.imageUrl || '', email: 'alex@example.com', skills: [{skill: 'Vocal Control', progress: 80}, {skill: 'Stage Presence', progress: 70}], mentoringNotes: [{date: '2024-05-10', note: 'Worked on transitioning between songs.'}], userId: '1' },
  { id: '2', name: "Jordan Lee", role: "Keys", avatarUrl: placeholderImages.find(p => p.id === 'user2')?.imageUrl || '', email: 'jordan@example.com', skills: [{skill: 'Chord Voicing', progress: 90}, {skill: 'Improvisation', progress: 60}], mentoringNotes: [{date: '2024-05-11', note: 'Practiced using pads effectively.'}], userId: '2' },
  { id: '3', name: "Casey Smith", role: "Drums", avatarUrl: placeholderImages.find(p => p.id === 'user3')?.imageUrl || '', email: 'casey@example.com', skills: [{skill: 'Timing', progress: 95}, {skill: 'Dynamic Control', progress: 85}], mentoringNotes: [], userId: '3' },
  { id: '4', name: "Taylor Green", role: "Vocalist", avatarUrl: placeholderImages.find(p => p.id === 'user4')?.imageUrl || '', email: 'taylor@example.com', skills: [{skill: 'Harmony', progress: 88}, {skill: 'Pitch Accuracy', progress: 92}], mentoringNotes: [{date: '2024-05-15', note: 'Improving confidence on high notes.'}], userId: '4' },
  { id: '5', name: "Morgan Blue", role: "Guitar (Electric)", avatarUrl: placeholderImages.find(p => p.id === 'user5')?.imageUrl || '', email: 'morgan@example.com', skills: [{skill: 'Tone Shaping', progress: 75}, {skill: 'Lead Lines', progress: 65}], mentoringNotes: [], userId: '5' },
];

export const upcomingServices: Service[] = [
  { id: '1', theme: "Sunday Morning Worship", sermonTheme: "Love That Lasts", date: "May 26, 2024", worshipLeader: "Alex Ray", imageUrl: placeholderImages.find(p => p.id === 'service1')?.imageUrl || '', team: [], setlist: [] },
  { id: '2', theme: "Youth Night", sermonTheme: "Fearless Generation", date: "May 31, 2024", worshipLeader: "Taylor Green", imageUrl: placeholderImages.find(p => p.id === 'service2')?.imageUrl || '', team: [], setlist: [] },
  { id: '3', theme: "Sunday Morning Worship", sermonTheme: "Foundations of Faith", date: "June 2, 2024", worshipLeader: "Alex Ray", imageUrl: placeholderImages.find(p => p.id === 'service3')?.imageUrl || '', team: [], setlist: [] },
  { id: '4', theme: "Mid-week Prayer", sermonTheme: "The Power of Prayer", date: "June 5, 2024", worshipLeader: "Jordan Lee", imageUrl: placeholderImages.find(p => p.id === 'service4')?.imageUrl || '', team: [], setlist: [] },
];

export const accountabilityGroups: AccountabilityGroup[] = [
  { id: '1', name: "The Iron Men", leaderId: "1", memberIds: ['2', '3'], members: [{ name: "Jordan Lee", contactStatus: 'Contacted' }, { name: "Casey Smith", contactStatus: 'Pending' }] },
  { id: '2', name: "Sisters in Spirit", leaderId: "4", memberIds: ['5'], members: [{ name: "Morgan Blue", contactStatus: 'Contacted' }] },
];
