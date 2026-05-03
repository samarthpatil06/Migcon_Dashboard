import { Injectable } from '@angular/core';

export interface User {
  fullName: string;
  email: string;
  password: string;
  mobile?: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private storageKey = 'migcon_users';
  private users: User[] = [];

  constructor() {
    this.loadUsers();
  }

  // ------------------------
  // Load users from storage
  // ------------------------
  private loadUsers() {
    const data = localStorage.getItem(this.storageKey);
    if (data) {
      this.users = JSON.parse(data);
    } else {
      // Default user (first time only)
      this.users = [
        {
          fullName: 'User1',
          email: 'user1@gmail.com',
          password: '123',
          mobile: '',
          role: 'User'
        }
      ];
      this.saveToStorage();
    }
  }

  // ------------------------
  // Save to localStorage
  // ------------------------
  private saveToStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.users));
  }

  // ------------------------
  // Get all users
  // ------------------------
  getUsers(): User[] {
    return [...this.users]; // return copy
  }

  // ------------------------
  // Get single user
  // ------------------------
  getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email === email);
  }

  // ------------------------
  // Add new user
  // ------------------------
  addUser(user: User): boolean {
    const exists = this.users.some(u => u.email === user.email);

    if (exists) {
      return false; // duplicate email
    }

    this.users.push(user);
    this.saveToStorage();
    return true;
  }

  // ------------------------
  // Delete user
  // ------------------------
  deleteUser(email: string) {
    this.users = this.users.filter(u => u.email !== email);
    this.saveToStorage();
  }

  // ------------------------
  // Update user
  // ------------------------
  updateUser(updatedUser: User) {
    const index = this.users.findIndex(u => u.email === updatedUser.email);

    if (index !== -1) {
      this.users[index] = updatedUser;
      this.saveToStorage();
    }
  }

  // ------------------------
  // Clear all users (for logout/reset)
  // ------------------------
  clearUsers() {
    this.users = [];
    localStorage.removeItem(this.storageKey);
  }
}
