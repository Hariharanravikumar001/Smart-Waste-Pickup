import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  role: string = 'User'; // Default

  ngOnInit() {
    if (typeof localStorage !== 'undefined') {
      const storedRole = localStorage.getItem('auth_role');
      if (storedRole) {
        this.role = storedRole;
      }
    }
  }
}
