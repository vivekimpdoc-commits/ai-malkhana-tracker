import { MalkhanaItem, User } from '../types';

const API_BASE = '/api';

export const api = {
  async login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  async getItems(): Promise<MalkhanaItem[]> {
    const res = await fetch(`${API_BASE}/items`);
    return res.json();
  },

  async addItem(item: Partial<MalkhanaItem>): Promise<MalkhanaItem> {
    const res = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return res.json();
  },

  async updateItem(id: string, item: Partial<MalkhanaItem>): Promise<MalkhanaItem> {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return res.json();
  },

  async deleteItem(id: string, deletedBy: string) {
    await fetch(`${API_BASE}/items/${id}?deletedBy=${encodeURIComponent(deletedBy)}`, { method: 'DELETE' });
  },

  async getBacklog(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/backlog`);
    return res.json();
  },

  async restoreItem(id: string) {
    const res = await fetch(`${API_BASE}/backlog/restore/${id}`, { method: 'POST' });
    if (!res.ok) throw new Error('Restore failed');
    return res.json();
  }
};
