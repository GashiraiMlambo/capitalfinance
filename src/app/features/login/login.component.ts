import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StateService, User } from '../../core/services/state.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',})
export class LoginComponent implements OnInit {
  fb = inject(FormBuilder);
  router = inject(Router);
  stateService = inject(StateService);

  loginForm!: FormGroup;
  otpForm!: FormGroup;

  isOnline = signal<boolean>(true);
  showPassword = signal<boolean>(false);
  showOtp = signal<boolean>(false);
  errorMsg = signal<string>('');
  otpErrorMsg = signal<string>('');

  matchedUser: User | null = null;
  attempts = 0;

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberDevice: [false]
    });

    this.otpForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    // Handle offline status check
    this.isOnline.set(navigator.onLine);
    window.addEventListener('online', () => this.isOnline.set(true));
    window.addEventListener('offline', () => this.isOnline.set(false));
  }

  togglePasswordVisibility() {
    this.showPassword.update(p => !p);
  }

  quickSelectUser(u: User) {
    this.loginForm.patchValue({
      email: u.email,
      password: 'admin123'
    });
    this.matchedUser = u;
    this.errorMsg.set('');
  }

  submitLogin() {
    this.errorMsg.set('');
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    // Check credentials against state users list
    const user = this.stateService.users().find(
      u => (u.email.toLowerCase() === email.toLowerCase() || u.name.toLowerCase() === email.toLowerCase())
    );

    if (user && password === 'admin123') {
      this.matchedUser = user;
      this.showOtp.set(true);
    } else {
      this.attempts++;
      if (this.attempts >= 3) {
        this.errorMsg.set('Account temporarily locked after 3 failed login attempts. Contact Admin.');
        this.loginForm.disable();
      } else {
        this.errorMsg.set(`Invalid credentials. Attempt ${this.attempts} of 3. (Use password: admin123)`);
      }
    }
  }

  cancelOtp() {
    this.showOtp.set(false);
    this.otpForm.reset();
    this.otpErrorMsg.set('');
  }

  verifyOtp() {
    this.otpErrorMsg.set('');
    const code = this.otpForm.value.code;

    // Any 6 digits will succeed in mockup
    if (code === '123456' || code.length === 6) {
      if (this.matchedUser) {
        this.stateService.currentUser.set(this.matchedUser);
        this.stateService.addAuditLog(`User logged in via 2FA: ${this.matchedUser.name} (${this.matchedUser.role})`);

        // Dynamic routing based on role
        this.redirectUserByRole(this.matchedUser.role);
      }
    } else {
      this.otpErrorMsg.set('Invalid OTP verification code. Try again.');
    }
  }

  private redirectUserByRole(role: string) {
    switch (role) {
      case 'Teller':
        this.router.navigate(['/teller/dashboard']);
        break;
      case 'Branch Manager':
        this.router.navigate(['/branch/dashboard']);
        break;
      case 'Compliance Officer':
        this.router.navigate(['/compliance/dashboard']);
        break;
      case 'System Admin':
        this.router.navigate(['/admin/users']);
        break;
      case 'Field Agent':
        this.router.navigate(['/onboarding/new']);
        break;
      case 'Customer (Self-Service)':
        this.router.navigate(['/portal/home']);
        break;
      default:
        this.router.navigate(['/auth/login']);
    }
  }
}
