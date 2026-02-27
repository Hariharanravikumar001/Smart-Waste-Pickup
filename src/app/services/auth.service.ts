import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';
  private currentUserRoleSubject = new BehaviorSubject<string | null>(null);
  public currentUserRole$ = this.currentUserRoleSubject.asObservable();

  private currentUserAvatarSubject = new BehaviorSubject<string | null>(null);
  public currentUserAvatar$ = this.currentUserAvatarSubject.asObservable();

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
      const avatar = localStorage.getItem('auth_avatar');
      if (avatar) {
        this.currentUserAvatarSubject.next(avatar);
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

          if (res.avatar) {
            localStorage.setItem('auth_avatar', res.avatar);
            this.currentUserAvatarSubject.next(res.avatar);
          }
        }
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { email, otp });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  getProfile(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.apiUrl}/user/profile`, { headers });
  }

  updateProfile(profileData: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`${this.apiUrl}/user/profile`, profileData, { headers });
  }

  changePasswordInternal(passwordData: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`${this.apiUrl}/user/change-password-internal`, passwordData, { headers });
  }

  getAdminStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/stats`);
  }

  getUserStats(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.apiUrl}/user/stats`, { headers });
  }

  getVolunteerStats(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.apiUrl}/volunteer/stats`, { headers });
  }

  updateAvatar(base64Image: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_avatar', base64Image);
    }
    this.currentUserAvatarSubject.next(base64Image);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_role');
      localStorage.removeItem('auth_avatar');
      this.currentUserRoleSubject.next(null);
      this.currentUserAvatarSubject.next(null);
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
