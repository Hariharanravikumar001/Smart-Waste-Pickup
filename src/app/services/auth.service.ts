import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';
  private currentUserRoleSubject = new BehaviorSubject<string | null>(null);
  public currentUserRole$ = this.currentUserRoleSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const role = localStorage.getItem('auth_role');
      if (role) {
        this.currentUserRoleSubject.next(role);
      }
    }
  }

  register(userData: any): Observable<any> {
    // Note: lowercasing role to match backend expectations (user, volunteer, admin)
    userData.role = userData.role.toLowerCase();
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('auth_token', res.token);
          // Standardizing role format from backend
          const standardizedRole = res.role.charAt(0).toUpperCase() + res.role.slice(1);
          localStorage.setItem('auth_role', standardizedRole);
          this.currentUserRoleSubject.next(standardizedRole);
        }
      })
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_role');
      this.currentUserRoleSubject.next(null);
      this.router.navigate(['/login']);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_role');
    }
    return null;
  }
}
