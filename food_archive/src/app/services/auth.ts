import { Injectable, inject, signal } from '@angular/core';
import { finalize, of, tap } from 'rxjs';
import type { Observable } from 'rxjs';

import { Api } from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

@Injectable({
  providedIn: 'root',
})
// Handle registration, profile updates, login sessions, and current-user state.
export class Auth {
  private sessionChecked = false;
  private readonly api = inject(Api);

  // Angular Signals
  currentUser = signal<User | null>(null);

  isLoggedIn = signal(false);

  // Remove the obsolete token left by older versions of the app.
  constructor() {
    localStorage.removeItem('foodarchive_token');
  }

  // Create a user account through the API.
  register(data: { username: string; email: string; password: string }): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/register', data);
  }

  // Log in and store the returned user in application state.
  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/login', data).pipe(
      tap((response) => {
        if (response.success && response.user) {
          this.setUser(response.user);
          this.sessionChecked = true;
        }
      }),
    );
  }

  // Always start each app run logged out; do not restore a previous session.
  checkSession(): Observable<boolean> {
    if (this.sessionChecked) {
      return of(this.isLoggedIn());
    }

    this.clearSession();
    return of(false);
  }

  // End the backend session and clear local user state.
  logout(): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('auth/logout', {}).pipe(finalize(() => this.clearSession()));
  }

  // Update the signed-in user's profile and refresh application state.
  updateProfile(username: string, email: string): Observable<AuthResponse> {
    return this.api.put<AuthResponse>('auth/profile', { username, email }).pipe(
      tap((response) => {
        if (response.success && response.user) {
          this.setUser(response.user);
        }
      }),
    );
  }

  // Clear the current user and mark the session as checked.
  private clearSession(): void {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.sessionChecked = true;
  }

  // Store the signed-in user and mark the app as logged in.
  private setUser(user: User): void {
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
  }

  // Check whether the current user has administrator access.
  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }
}
