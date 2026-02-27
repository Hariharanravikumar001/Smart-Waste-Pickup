import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  role: string = 'User';
  adminStats: any = {
    totalUsers: '...',
    activeVolunteers: '...',
    totalRecycled: '...'
  };
  userStats: any = {
    totalPickups: '...',
    pendingRequests: '...',
    wasteRecycled: '...'
  };
  volunteerStats: any = {
    pickupsCompleted: '...',
    activeTasks: '...',
    weightCollected: '...'
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    if (typeof localStorage !== 'undefined') {
      const storedRole = localStorage.getItem('auth_role');
      if (storedRole) {
        this.role = storedRole;
      }
    }

    if (this.role === 'Admin') {
      this.fetchAdminStats();
    } else if (this.role === 'User') {
      this.fetchUserStats();
    } else if (this.role === 'Volunteer') {
      this.fetchVolunteerStats();
    }
  }

  fetchAdminStats() {
    this.authService.getAdminStats().subscribe({
      next: (stats) => {
        this.adminStats = stats;
      },
      error: (err) => {
        console.error('Error fetching admin stats', err);
      }
    });
  }

  fetchUserStats() {
    this.authService.getUserStats().subscribe({
      next: (stats) => {
        this.userStats = stats;
      },
      error: (err) => {
        console.error('Error fetching user stats', err);
      }
    });
  }

  fetchVolunteerStats() {
    this.authService.getVolunteerStats().subscribe({
      next: (stats) => {
        this.volunteerStats = stats;
      },
      error: (err) => {
        console.error('Error fetching volunteer stats', err);
      }
    });
  }
}
