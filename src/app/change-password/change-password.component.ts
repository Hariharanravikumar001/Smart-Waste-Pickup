import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  changeForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.changeForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
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
    if (this.changeForm.valid) {
      this.isSubmitting = true;
      // Simulate backend password change
      setTimeout(() => {
        this.router.navigate(['/login']);
        this.isSubmitting = false;
      }, 800);
    } else {
      this.changeForm.markAllAsTouched();
    }
  }
}

