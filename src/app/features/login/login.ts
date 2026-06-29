import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StateService } from '../../core/services/state.service';

type AuthScreen = 'splash' | 'login' | 'forgot' | 'reset' | 'otp' | 'two-factor' | 'access-denied';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="auth-wrapper">
      <!-- SPLASH SCREEN -->
      <div class="splash-screen" *ngIf="currentScreen() === 'splash'">
        <div class="splash-content">
          <svg class="splash-logo" width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Left/Top Arc -->
            <path d="M 28 72 A 36 36 0 0 1 72 28" stroke="url(#splash-grad)" stroke-width="8" stroke-linecap="round" />
            <!-- Right/Bottom Arc -->
            <path d="M 78 34 A 36 36 0 0 1 34 78" stroke="url(#splash-grad)" stroke-width="8" stroke-linecap="round" />
            <!-- Zig-zag chart line -->
            <path d="M 22 56 L 38 68 L 56 46 L 70 56 L 86 34" stroke="url(#splash-grad)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
            <!-- Arrow head -->
            <path d="M 70 32 H 88 V 50" stroke="url(#splash-grad)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
            <defs>
              <linearGradient id="splash-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stop-color="#0A2540" />
                <stop offset="1" stop-color="#173B60" />
              </linearGradient>
            </defs>
          </svg>
          <h1 class="splash-title">Central Capital Finance</h1>
          <p class="splash-tagline">Transacting made convenient</p>
          <div class="splash-loader">
            <div class="loader-bar"></div>
          </div>
          <span class="loading-text">Loading banking module...</span>
        </div>
      </div>

      <!-- AUTH SPLIT CONTAINER -->
      <div class="auth-card" *ngIf="currentScreen() !== 'splash'">
        <!-- LEFT BRAND PANEL -->
        <div class="brand-panel">
          <div class="brand-header">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Left/Top Arc -->
              <path d="M 28 72 A 36 36 0 0 1 72 28" stroke="white" stroke-width="8" stroke-linecap="round" />
              <!-- Right/Bottom Arc -->
              <path d="M 78 34 A 36 36 0 0 1 34 78" stroke="white" stroke-width="8" stroke-linecap="round" />
              <!-- Zig-zag chart line -->
              <path d="M 22 56 L 38 68 L 56 46 L 70 56 L 86 34" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
              <!-- Arrow head -->
              <path d="M 70 32 H 88 V 50" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="brand-name">Central Capital Finance</span>
          </div>

          <div class="brand-body">
            <h2 class="promo-title">Enterprise Core Banking</h2>
            <p class="promo-text">
              Secure institutional dashboard managing global assets, loan underwriting models, and real-time compliance ledger auditing.
            </p>
            
            <div class="security-badges">
              <div class="badge-item">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                <span>SSL Encrypted</span>
              </div>
              <div class="badge-item">
                <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                <span>2FA Protected</span>
              </div>
            </div>
          </div>

          <div class="brand-footer">
            <span>© 2026 Central Capital Finance. All rights reserved.</span>
          </div>
        </div>

        <!-- RIGHT FORM PANEL -->
        <div class="form-panel">
          <!-- LOGIN SCREEN -->
          <div class="form-container" *ngIf="currentScreen() === 'login'">
            <h2 class="form-title">Portal Access</h2>
            <p class="form-subtitle">Enter your banking credentials to authenticate</p>

            <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
              <div class="form-group">
                <label>Institutional Email</label>
                <input type="email" class="form-control" formControlName="email" placeholder="e.g. s.jenkins@ccfinance.co.zw" />
                <div class="error-message" *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid">
                  Please enter a valid institutional email
                </div>
              </div>

              <div class="form-group">
                <label>Password</label>
                <input type="password" class="form-control" formControlName="password" placeholder="••••••••" />
                <div class="error-message" *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid">
                  Password must be at least 4 characters long
                </div>
              </div>

              <div class="forgot-wrapper">
                <a (click)="switchScreen('forgot')">Forgot Password?</a>
              </div>

              <div class="error-message general-error" *ngIf="loginError()">
                {{ loginError() }}
              </div>

              <button type="submit" class="btn-primary w-full" [disabled]="loginForm.invalid">
                Authenticate
              </button>
            </form>
          </div>

          <!-- FORGOT PASSWORD SCREEN -->
          <div class="form-container" *ngIf="currentScreen() === 'forgot'">
            <h2 class="form-title">Password Recovery</h2>
            <p class="form-subtitle">Enter your registered email to receive an recovery code</p>

            <form [formGroup]="forgotForm" (ngSubmit)="onForgot()">
              <div class="form-group">
                <label>Institutional Email</label>
                <input type="email" class="form-control" formControlName="email" placeholder="e.g. s.jenkins@ccfinance.co.zw" />
              </div>

              <div class="btn-group">
                <button type="button" class="btn-secondary" (click)="switchScreen('login')">Back to Login</button>
                <button type="submit" class="btn-primary" [disabled]="forgotForm.invalid">Send Code</button>
              </div>
            </form>
          </div>

          <!-- OTP VERIFICATION SCREEN -->
          <div class="form-container" *ngIf="currentScreen() === 'otp'">
            <h2 class="form-title">OTP Verification</h2>
            <p class="form-subtitle">We have sent a verification code to your email. Enter it below.</p>

            <form [formGroup]="otpForm" (ngSubmit)="onVerifyOtp()">
              <div class="form-group">
                <label>6-Digit Verification Code</label>
                <input type="text" class="form-control code-input" formControlName="code" placeholder="000 000" maxlength="6" />
                <div class="error-message" *ngIf="otpForm.get('code')?.touched && otpForm.get('code')?.invalid">
                  Enter exactly 6 digits
                </div>
              </div>

              <div class="btn-group">
                <button type="button" class="btn-secondary" (click)="switchScreen('login')">Cancel</button>
                <button type="submit" class="btn-primary" [disabled]="otpForm.invalid">Verify OTP</button>
              </div>
            </form>
          </div>

          <!-- 2FA TWO FACTOR AUTHENTICATION SCREEN -->
          <div class="form-container" *ngIf="currentScreen() === 'two-factor'">
            <h2 class="form-title">Two-Factor Authentication</h2>
            <p class="form-subtitle">Open your authenticator app and enter the security code.</p>

            <form [formGroup]="twoFactorForm" (ngSubmit)="onVerify2Fa()">
              <div class="form-group">
                <label>Security Code</label>
                <input type="text" class="form-control code-input" formControlName="code" placeholder="000 000" maxlength="6" />
              </div>

              <div class="btn-group">
                <button type="button" class="btn-secondary" (click)="switchScreen('login')">Cancel</button>
                <button type="submit" class="btn-primary" [disabled]="twoFactorForm.invalid">Verify & Login</button>
              </div>
            </form>
          </div>

          <!-- RESET PASSWORD SCREEN -->
          <div class="form-container" *ngIf="currentScreen() === 'reset'">
            <h2 class="form-title">Reset Password</h2>
            <p class="form-subtitle">Create a new secure password for your account</p>

            <form [formGroup]="resetForm" (ngSubmit)="onResetPassword()">
              <div class="form-group">
                <label>New Password</label>
                <input type="password" class="form-control" formControlName="password" placeholder="••••••••" />
              </div>
              <div class="form-group">
                <label>Confirm Password</label>
                <input type="password" class="form-control" formControlName="confirmPassword" placeholder="••••••••" />
                <div class="error-message" *ngIf="resetForm.errors?.['mismatch']">
                  Passwords do not match
                </div>
              </div>

              <button type="submit" class="btn-primary w-full" [disabled]="resetForm.invalid">
                Update Password
              </button>
            </form>
          </div>

          <!-- ACCESS DENIED SCREEN -->
          <div class="form-container" *ngIf="currentScreen() === 'access-denied'">
            <div class="status-icon-wrapper danger">
              <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h2 class="form-title">Access Denied</h2>
            <p class="form-subtitle">Your credentials are valid but your account lacks administrative clearance.</p>

            <button type="button" class="btn-secondary w-full" (click)="switchScreen('login')">
              Return to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg-base);
      padding: 24px;
    }

    // Splash Screen
    .splash-screen {
      text-align: center;
      max-width: 400px;
      animation: fadeIn 0.5s ease-out;

      .splash-logo {
        margin-bottom: 24px;
        filter: drop-shadow(0 10px 20px rgba(15, 12, 232, 0.3));
      }

      .splash-title {
        font-size: 32px;
        font-weight: 800;
        margin-bottom: 8px;
        background: var(--primary-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .splash-tagline {
        color: var(--text-muted);
        letter-spacing: 0.1em;
        text-transform: uppercase;
        font-size: 12px;
        margin-bottom: 32px;
      }

      .splash-loader {
        height: 4px;
        background: var(--border);
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 12px;

        .loader-bar {
          height: 100%;
          background: var(--primary-gradient);
          width: 0%;
          animation: loadProgress 2s infinite ease-in-out;
        }
      }

      .loading-text {
        font-size: 12px;
        color: var(--text-muted);
      }
    }

    @keyframes loadProgress {
      0% { width: 0%; transform: translateX(0%); }
      50% { width: 50%; }
      100% { width: 100%; transform: translateX(100%); }
    }

    // Auth Split Card
    .auth-card {
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: 100%;
      max-width: 960px;
      min-height: 560px;
      background: var(--bg-surface);
      border-radius: var(--radius-xl);
      border: 1px solid var(--border-light);
      box-shadow: var(--shadow-lg);
      overflow: hidden;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .brand-panel {
      background: var(--primary-gradient);
      padding: 48px;
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        width: 300px;
        height: 300px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 50%;
        top: -100px;
        right: -100px;
      }

      .brand-header {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .brand-name {
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 20px;
        }
      }

      .brand-body {
        z-index: 1;
        .promo-title {
          font-size: 32px;
          color: white;
          margin-bottom: 16px;
        }
        .promo-text {
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .security-badges {
          display: flex;
          gap: 16px;
          
          .badge-item {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.15);
            padding: 6px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 500;
          }
        }
      }

      .brand-footer {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
      }

      @media (max-width: 768px) {
        display: none;
      }
    }

    .form-panel {
      padding: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .form-container {
      width: 100%;
      max-width: 360px;
      animation: fadeIn 0.3s ease-out;

      .form-title {
        font-size: 24px;
        margin-bottom: 8px;
      }
      .form-subtitle {
        color: var(--text-muted);
        margin-bottom: 24px;
        font-size: 13.5px;
      }
    }

    .forgot-wrapper {
      text-align: right;
      margin-bottom: 20px;
      a {
        color: var(--primary);
        font-size: 13px;
        cursor: pointer;
        font-weight: 500;
        &:hover { text-decoration: underline; }
      }
    }

    .w-full {
      width: 100%;
      justify-content: center;
    }

    .btn-group {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      
      button {
        flex: 1;
        justify-content: center;
      }
    }

    .code-input {
      text-align: center;
      font-size: 24px;
      letter-spacing: 0.3em;
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
    }

    .general-error {
      margin-bottom: 16px;
      background: var(--danger-light);
      padding: 8px 12px;
      border-radius: var(--radius-md);
      font-weight: 500;
    }

    .status-icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px auto;
      
      &.danger {
        background: var(--danger-light);
        color: var(--danger);
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  currentScreen = signal<AuthScreen>('splash');
  loginError = signal<string>('');

  fb = inject(FormBuilder);
  router = inject(Router);
  stateService = inject(StateService);

  // Form Groups
  loginForm!: FormGroup;
  forgotForm!: FormGroup;
  otpForm!: FormGroup;
  twoFactorForm!: FormGroup;
  resetForm!: FormGroup;

  ngOnInit() {
    // Show splash screen for 2 seconds, then switch to login
    setTimeout(() => {
      this.currentScreen.set('login');
    }, 2000);

    // Initialize Forms
    this.loginForm = this.fb.group({
      email: ['s.jenkins@ccfinance.co.zw', [Validators.required, Validators.email]],
      password: ['admin123', [Validators.required, Validators.minLength(4)]]
    });

    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.otpForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    this.twoFactorForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  switchScreen(screen: AuthScreen) {
    this.loginError.set('');
    this.currentScreen.set(screen);
  }

  onLogin() {
    this.loginError.set('');
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;

    // Check users database in StateService
    const matchedUser = this.stateService.users().find(
      u => u.email === email && password === 'admin123' // default pwd for mockup
    );

    if (matchedUser) {
      // Step to OTP if email matches
      this.switchScreen('otp');
    } else {
      this.loginError.set('Invalid credentials. Use any user email from settings with password: admin123');
    }
  }

  onForgot() {
    // Simulate sending recovery code
    this.switchScreen('otp');
  }

  onVerifyOtp() {
    // Navigate to 2FA for secondary auth
    this.switchScreen('two-factor');
  }

  onVerify2Fa() {
    // Select the admin user or whatever matched user we found
    const email = this.loginForm.value.email;
    const matchedUser = this.stateService.users().find(u => u.email === email) || this.stateService.users()[0];

    // Log the user in
    this.stateService.currentUser.set(matchedUser);
    this.stateService.addAuditLog(`User logged in successfully: ${matchedUser.name}`);

    // Navigate to dashboard
    this.router.navigate(['/portal/dashboard']);
  }

  onResetPassword() {
    // Reset password success
    this.switchScreen('login');
  }
}
