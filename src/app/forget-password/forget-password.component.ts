import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponent {
  forgetForm: FormGroup;
  isSubmitting = false;
  step: 1 | 2 = 1; // 1 = Email, 2 = OTP
  emailSentTo = '';

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.forgetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: [''] // Added conditionally later
    });
  }

  onSubmit() {
    if (this.forgetForm.valid) {
      if (this.step === 1) {
        this.requestOtp();
      } else if (this.step === 2) {
        this.verifyOtp();
      }
    } else {
      this.forgetForm.markAllAsTouched();
    }
  }

  requestOtp() {
    this.isSubmitting = true;
    const email = this.forgetForm.get('email')?.value;
    
    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.emailSentTo = email;
        this.step = 2; // Move to OTP step
        
        // Make OTP required for step 2
        this.forgetForm.get('otp')?.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(6)]);
        this.forgetForm.get('otp')?.updateValueAndValidity();
        
        alert('OTP sent! Please check your email (or backend terminal for simulation).');
      },
      error: (err) => {
        this.isSubmitting = false;
        const errorMessage = err.error?.message || 'Error occurred. Try again.';
        alert(errorMessage);
      }
    });
  }

  verifyOtp() {
    this.isSubmitting = true;
    const email = this.emailSentTo;
    const otp = this.forgetForm.get('otp')?.value;

    this.authService.verifyOtp(email, otp).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        alert('OTP verified! You can now change your password.');
        // Pass the temporary reset token to the change-password page securely via state
        this.router.navigate(['/change-password'], { state: { token: res.resetToken } });
      },
      error: (err) => {
        this.isSubmitting = false;
        const errorMessage = err.error?.message || 'Invalid OTP. Try again.';
        alert(errorMessage);
      }
    });
  }
}
