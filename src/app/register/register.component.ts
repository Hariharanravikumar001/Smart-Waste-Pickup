import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['User', Validators.required],
      location: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      const formData = this.registerForm.value;
      
      this.authService.register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        location: formData.location
      }).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          // After successful registration, route to login or auto-login
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Registration failed', err);
          alert('Registration failed. Try again.');
        }
      });
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }
}
