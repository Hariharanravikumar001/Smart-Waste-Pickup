import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  
  isProfileLoading = true;
  isProfileSubmitting = false;
  profileSuccessMsg = '';
  profileErrorMsg = '';

  isPasswordSubmitting = false;
  passwordSuccessMsg = '';
  passwordErrorMsg = '';

  currentAvatarPreview: string | null = null;
  selectedAvatarBase64: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      username: [''],
      email: ['', [Validators.required, Validators.email]],
      role: [{ value: '', disabled: true }], // Role should not be editable by user here
      location: ['']
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.fetchProfile();
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  fetchProfile(): void {
    this.isProfileLoading = true;
    this.authService.getProfile().subscribe({
      next: (userData) => {
        // Standardize role display capitalization
        const displayRole = userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : '';
        
        this.profileForm.patchValue({
          name: userData.name,
          username: userData.username,
          email: userData.email,
          role: displayRole,
          location: userData.location
        });

        if (userData.avatar) {
          this.currentAvatarPreview = userData.avatar;
          this.authService.updateAvatar(userData.avatar);
        }

        this.isProfileLoading = false;
      },
      error: (err) => {
        console.error('Error fetching profile', err);
        this.profileErrorMsg = 'Failed to load profile data.';
        this.isProfileLoading = false;
      }
    });
  }

  onAvatarSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.match(/image\/*/)) {
        this.profileErrorMsg = 'Only images are supported for avatars.';
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentAvatarPreview = e.target.result;
        this.selectedAvatarBase64 = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onProfileSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isProfileSubmitting = true;
    this.profileSuccessMsg = '';
    this.profileErrorMsg = '';

    // Extract raw value to ignore disabled fields if we want, or use getRawValue
    const updatedData = {
      name: this.profileForm.get('name')?.value,
      username: this.profileForm.get('username')?.value,
      email: this.profileForm.get('email')?.value,
      location: this.profileForm.get('location')?.value,
      avatar: this.selectedAvatarBase64 || this.currentAvatarPreview
    };

    this.authService.updateProfile(updatedData).subscribe({
      next: (res) => {
        this.profileSuccessMsg = res.message || 'Profile updated successfully!';
        this.isProfileSubmitting = false;
        
        // Broadcast new avatar to whole app if it changed
        if (this.selectedAvatarBase64) {
          this.authService.updateAvatar(this.selectedAvatarBase64);
        }
        
        // Clear message after 3 seconds
        setTimeout(() => this.profileSuccessMsg = '', 3000);
      },
      error: (err) => {
        this.profileErrorMsg = err.error?.message || 'Failed to update profile.';
        this.isProfileSubmitting = false;
      }
    });
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isPasswordSubmitting = true;
    this.passwordSuccessMsg = '';
    this.passwordErrorMsg = '';

    const passwordData = {
      oldPassword: this.passwordForm.get('oldPassword')?.value,
      newPassword: this.passwordForm.get('newPassword')?.value
    };

    this.authService.changePasswordInternal(passwordData).subscribe({
      next: (res) => {
        this.passwordSuccessMsg = res.message || 'Password changed successfully!';
        this.isPasswordSubmitting = false;
        this.passwordForm.reset();
        
        // Clear message after 3 seconds
        setTimeout(() => this.passwordSuccessMsg = '', 3000);
      },
      error: (err) => {
        this.passwordErrorMsg = err.error?.message || 'Failed to change password.';
        this.isPasswordSubmitting = false;
      }
    });
  }
}
