import { Business, User } from '../types/business';

const TOKEN_KEY = 'hublivo_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Authentication API
export async function registerUser(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to register account');
  }
  setStoredToken(data.token);
  return data;
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to log in');
  }
  setStoredToken(data.token);
  return data;
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const res = await fetch('/api/auth/me', {
      headers: authHeaders(),
    });
    if (!res.ok) {
      setStoredToken(null);
      return null;
    }
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

export function logoutUser() {
  setStoredToken(null);
}

// Business Portfolios API
export interface BusinessQueryParams {
  search?: string;
  category?: string;
  location?: string;
  service?: string;
  featured?: boolean;
}

export async function fetchBusinesses(params?: BusinessQueryParams): Promise<Business[]> {
  const queryParts: string[] = [];
  if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
  if (params?.category && params.category !== 'All') queryParts.push(`category=${encodeURIComponent(params.category)}`);
  if (params?.location) queryParts.push(`location=${encodeURIComponent(params.location)}`);
  if (params?.service) queryParts.push(`service=${encodeURIComponent(params.service)}`);
  if (params?.featured) queryParts.push('featured=true');

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  const res = await fetch(`/api/businesses${queryString}`);
  if (!res.ok) {
    throw new Error('Failed to load businesses');
  }
  const data = await res.json();
  return data.businesses || [];
}

export async function fetchBusinessById(idOrSlug: string): Promise<Business> {
  const res = await fetch(`/api/businesses/${encodeURIComponent(idOrSlug)}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Business not found');
  }
  return data.business;
}

export async function fetchMyBusinesses(): Promise<Business[]> {
  const res = await fetch('/api/my-businesses', {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load your portfolios');
  }
  return data.businesses || [];
}

export async function createBusiness(payload: Partial<Business>): Promise<Business> {
  const res = await fetch('/api/businesses', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create business portfolio');
  }
  return data.business;
}

export async function updateBusiness(id: string, payload: Partial<Business>): Promise<Business> {
  const res = await fetch(`/api/businesses/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update business portfolio');
  }
  return data.business;
}

export async function deleteBusiness(id: string): Promise<void> {
  const res = await fetch(`/api/businesses/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete portfolio');
  }
}

// Upload Photo API
export async function uploadPhoto(dataUrl: string, filename?: string): Promise<string> {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ dataUrl, filename }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload photo');
  }
  return data.url;
}
