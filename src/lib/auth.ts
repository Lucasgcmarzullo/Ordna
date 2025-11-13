export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('odrna_current_user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('odrna_current_user');
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
