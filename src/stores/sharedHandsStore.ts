
import { ShareHandFormData } from '@/types/shareHand';

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
  avatar: string;
}

interface SharedHand {
  id: string;
  formData: ShareHandFormData;
  tags: string[];
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  createdAt: Date;
  likes: number;
  comments: number;
  dummyComments?: Comment[];
}

class SharedHandsStore {
  private hands: SharedHand[] = [
    {
      id: 'dummy-hand-1',
      formData: {
        title: 'Tricky River Decision with Top Pair',
        description: 'Had top pair on the river facing a large bet. Villain had been playing tight all session. What would you do in this spot?',
        gameType: 'nlhe',
        gameFormat: 'cash',
        smallBlind: '$1',
        bigBlind: '$2',
        heroPosition: 'BB',
        villainPosition: 'BTN',
        tableSize: '6-max',
        stackSize: '100',
        heroStackSize: [200],
        villainStackSize: [150],
        holeCards: ['As', 'Kh'],
        flopCards: ['Ah', '7c', '2d'],
        turnCard: ['9s'],
        riverCard: ['Qh'],
        preflopActions: [],
        preflopDescription: 'Standard pre-flop play',
        flopActions: [],
        flopDescription: 'Hit top pair on a dry board',
        turnActions: [],
        turnDescription: 'Turn brought a possible straight draw',
        riverActions: [],
        riverDescription: 'River completed possible straight, facing large bet'
      },
      tags: ['Top Pair', 'River Decision', 'Value Bet', 'Bluff Catcher'],
      authorName: 'Sarah Chen',
      authorUsername: '@sarahpoker',
      authorAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      likes: 15,
      comments: 3,
      dummyComments: [
        {
          id: '1',
          author: 'Mike Johnson',
          content: 'I think this is a clear fold. The sizing screams value and tight players don\'t usually bluff river.',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg'
        },
        {
          id: '2',
          author: 'Emma Davis',
          content: 'What was the bet sizing exactly? If it\'s pot or overbet I agree with folding, but if it\'s like 40-60% pot I might call.',
          createdAt: new Date(Date.now() - 45 * 60 * 1000),
          avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg'
        },
        {
          id: '3',
          author: 'Alex Rivera',
          content: 'Tough spot! I\'d need more info about villain\'s tendencies. Has he shown any bluffs before?',
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
          avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg'
        }
      ]
    }
  ];
  private listeners: (() => void)[] = [];

  addHand(formData: ShareHandFormData, tags: string[]): string {
    const id = Date.now().toString();
    const newHand: SharedHand = {
      id,
      formData,
      tags,
      authorName: 'You',
      authorUsername: '@hero',
      authorAvatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      dummyComments: []
    };
    
    this.hands.unshift(newHand); // Add to beginning
    this.notifyListeners();
    return id;
  }

  getHands(): SharedHand[] {
    return this.hands;
  }

  getHand(id: string): SharedHand | null {
    return this.hands.find(hand => hand.id === id) || null;
  }

  getHandById(id: string): SharedHand | undefined {
    return this.hands.find(hand => hand.id === id);
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const sharedHandsStore = new SharedHandsStore();
export type { SharedHand, Comment };
