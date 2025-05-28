
import { ShareHandFormData } from '@/types/shareHand';

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
}

class SharedHandsStore {
  private hands: SharedHand[] = [];
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
      comments: 0
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
export type { SharedHand };
