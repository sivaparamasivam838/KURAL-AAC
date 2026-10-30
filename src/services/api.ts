import { HistoryItem, SettingsState, User, UserRole, Language } from '../types';

const TOKEN_KEY = 'kural_aac_token';
const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:4000/api' : '/api';

export interface SignupInput {
  name: string;
  nameTa?: string;
  email: string;
  password: string;
  role: UserRole;
  preferredLanguage: Language;
  avatar: string;
  bio?: string;
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function saveSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem('kural_aac_current_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('kural_aac_current_user');
}

export function getSessionUser(): User | null {
  try {
    const raw = localStorage.getItem('kural_aac_current_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function login(input: { email: string; password: string }) {
  const result = await request<{ user: User; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  saveSession(result.token, result.user);
  return result.user;
}

export async function signup(input: SignupInput) {
  const result = await request<{ user: User; token: string }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  saveSession(result.token, result.user);
  return result.user;
}

export async function requestPasswordReset(email: string) {
  return request<{ message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, password: string) {
  return request<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export async function loadCurrentUser() {
  const result = await request<{ user: User }>('/me');
  localStorage.setItem('kural_aac_current_user', JSON.stringify(result.user));
  return result.user;
}

export async function updateProfile(updates: Partial<Pick<User, 'name' | 'nameTa' | 'bio' | 'avatar' | 'preferredLanguage'>>) {
  const result = await request<{ user: User }>('/me', { method: 'PATCH', body: JSON.stringify(updates) });
  localStorage.setItem('kural_aac_current_user', JSON.stringify(result.user));
  return result.user;
}

export async function loadSettings() {
  return request<{ settings: SettingsState | null }>('/me/settings');
}

export async function saveSettings(settings: SettingsState) {
  return request<{ settings: SettingsState }>('/me/settings', { method: 'PUT', body: JSON.stringify(settings) });
}

export async function loadHistory() {
  return request<{ history: HistoryItem[] }>('/me/history');
}

export async function saveHistoryItem(item: HistoryItem) {
  return request<{ item: HistoryItem }>('/me/history', { method: 'POST', body: JSON.stringify(item) });
}

export async function updateHistoryItem(id: string, updates: Partial<HistoryItem>) {
  return request<{ ok: boolean }>(`/me/history/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(updates) });
}

export async function deleteHistoryItem(id: string) {
  return request<void>(`/me/history/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function clearHistory() {
  return request<void>('/me/history', { method: 'DELETE' });
}
