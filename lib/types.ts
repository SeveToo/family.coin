export interface Transaction {
  id?: string;
  userId: string;
  amount: number;
  type: 'transfer' | 'shop' | 'earn' | 'admin' | 'fine';
  description: string;
  createdAt: number; // timestamp
}

export interface ShopItem {
  id?: string;
  name: string;
  price: number;
  description: string;
  icon?: string; // emoji or url
  isHidden?: boolean;
}

export interface Task {
  id?: string;
  userId: string;
  description: string;
  photoUrl?: string; // Optionalized for template-based tasks
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  userName?: string; 
  taskTemplateId?: string; // ID if it came from AvailableTask
  reward?: number; // Fixed reward from template
}

export interface AvailableTask {
  id?: string;
  description: string;
  reward: number;
  icon?: string;
  isDaily?: boolean;
}

