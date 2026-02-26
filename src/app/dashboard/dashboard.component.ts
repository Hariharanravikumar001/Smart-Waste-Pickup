import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  role: string = 'User';

  ngOnInit() {
    if (typeof localStorage !== 'undefined') {
      const storedRole = localStorage.getItem('auth_role');
      if (storedRole) {
        this.role = storedRole;
      }
    }
  }
}
