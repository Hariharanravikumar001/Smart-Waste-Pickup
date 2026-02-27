import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent implements OnInit {
  changeForm: FormGroup;
  isSubmitting = false;
  token: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.changeForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Check if there is a reset token in the router navigation state (passed from verify-otp)
    const state = history.state;
    this.token = state?.token || null;
    
    if (!this.token) {
      // No token provided in state, invalid access. Redirect to login.
      alert('Invalid access. Password reset session expired or missing.');
      this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { mismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.changeForm.valid && this.token) {
      this.isSubmitting = true;
      const newPassword = this.changeForm.get('newPassword')?.value;

      this.authService.resetPassword(this.token, newPassword).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          alert('Password successfully reset! You can now log in.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isSubmitting = false;
          const errorMessage = err.error?.message || 'Error occurred while resetting password.';
          alert(errorMessage);
        }
      });
    } else {
      this.changeForm.markAllAsTouched();
    }
  }
}

