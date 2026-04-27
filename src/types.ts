export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
  name: string;
}

export interface MalkhanaItem {
  id: string;
  caseNumber: string;
  firNumber: string;
  itemName: string;
  description: string;
  dateReceived: string;
  officerName: string;
  location: {
    room: string;
    rack: string;
  };
  status: 'जमा' | 'रिलीज़' | 'नष्ट';
  createdAt: string;
  updatedAt?: string;
}

export interface AIInsights {
  duplicates: string[];
  alerts: string[];
  suggestions: string[];
  summary: string;
}
