import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

  login(email: string, password: string): boolean {
    if (email === 'admin@migcon.com' && password === 'admin') {
      localStorage.setItem('token', 'true');
      return true;
    }
    return false;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }
}
