import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css'
})
export class ForgetPasswordComponent {
  forgetForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.forgetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgetForm.valid) {
      this.isSubmitting = true;
      // Simulate backend email validation
      setTimeout(() => {
        // Once validated, navigate to change password
        this.router.navigate(['/change-password']);
        this.isSubmitting = false;
      }, 800);
    } else {
      this.forgetForm.get('email')?.markAsTouched();
    }
  }
}

