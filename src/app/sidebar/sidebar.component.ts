import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  role: string = 'User'; // Default
  avatarUrl: string | null = null;
  currentTheme: string = 'light';

  constructor(
    private authService: AuthService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    // Listen for real-time role changes
    this.authService.currentUserRole$.subscribe(role => {
      if (role) {
        this.role = role;
      } else if (typeof localStorage !== 'undefined') {
        // Fallback for initial load if subject is empty
        const storedRole = localStorage.getItem('auth_role');
        if (storedRole) {
          this.role = storedRole;
        }
      }
    });

    // Listen for real-time avatar changes
    this.authService.currentUserAvatar$.subscribe(avatar => {
      if (avatar) {
        this.avatarUrl = avatar;
      } else if (typeof localStorage !== 'undefined') {
        const storedAvatar = localStorage.getItem('auth_avatar');
        if (storedAvatar) {
          this.avatarUrl = storedAvatar;
        }
      }
    });

    // Listen for theme changes
    this.themeService.theme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  toggleTheme(event: Event) {
    event.preventDefault(); // Prevent standard routerLink behavior
    event.stopPropagation();
    this.themeService.toggleTheme();
  }
}
