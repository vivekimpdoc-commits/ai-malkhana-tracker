import { MalkhanaItem, User } from '../types';

// Mock database helper
const DB_KEY = 'malkhana_db';

const getDB = () => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    const initialData = {
      items: [],
      backlog: [],
      users: [
        { id: '1', username: 'admin', password: 'admin123', role: 'admin', name: 'Admin Officer' },
        { id: '2', username: 'staff', password: 'staff123', role: 'staff', name: 'Malkhana Staff' }
      ]
    };
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(data);
};

const saveDB = (data: any) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

export const api = {
  async login(username: string, password: string) {
    // Artificial delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const db = getDB();
    const user = db.users.find((u: any) => u.username === username && u.password === password);
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return { 
        token: 'mock-jwt-token', 
        user: userWithoutPassword 
      };
    } else {
      throw new Error('Invalid credentials');
    }
  },

  async getItems(): Promise<MalkhanaItem[]> {
    const db = getDB();
    return db.items;
  },

  async addItem(item: Partial<MalkhanaItem>): Promise<MalkhanaItem> {
    const db = getDB();
    const newItem = {
      ...item,
      id: `ITEM-${Date.now()}`,
      createdAt: new Date().toISOString()
    } as MalkhanaItem;
    
    db.items.push(newItem);
    saveDB(db);
    return newItem;
  },

  async updateItem(id: string, item: Partial<MalkhanaItem>): Promise<MalkhanaItem> {
    const db = getDB();
    const index = db.items.findIndex((i: any) => i.id === id);
    if (index !== -1) {
      db.items[index] = { ...db.items[index], ...item, updatedAt: new Date().toISOString() };
      saveDB(db);
      return db.items[index];
    }
    throw new Error('Item not found');
  },

  async deleteItem(id: string, deletedBy: string) {
    const db = getDB();
    const itemToDelete = db.items.find((i: any) => i.id === id);
    if (itemToDelete) {
      db.backlog.push({
        ...itemToDelete,
        deletedAt: new Date().toISOString(),
        deletedBy
      });
      db.items = db.items.filter((i: any) => i.id !== id);
      saveDB(db);
    }
  },

  async getBacklog(): Promise<any[]> {
    const db = getDB();
    return db.backlog || [];
  },

  async restoreItem(id: string) {
    const db = getDB();
    const backlogIndex = db.backlog.findIndex((i: any) => i.id === id);
    if (backlogIndex !== -1) {
      const itemToRestore = db.backlog[backlogIndex];
      db.backlog.splice(backlogIndex, 1);
      
      const { deletedAt, deletedBy, ...rest } = itemToRestore;
      const restoredItem = {
        ...rest,
        restoredAt: new Date().toISOString()
      };
      db.items.push(restoredItem);
      saveDB(db);
      return { message: 'Item restored successfully' };
    }
    throw new Error('Item not found in backlog');
  }
};
