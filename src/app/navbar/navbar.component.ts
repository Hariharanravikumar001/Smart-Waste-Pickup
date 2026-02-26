import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
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
