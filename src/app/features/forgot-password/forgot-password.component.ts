import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StateService } from '../../core/services/state.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  fb = inject(FormBuilder);
  router = inject(Router);
  stateService = inject(StateService);

  step = signal<number>(1);
  requestForm!: FormGroup;
  resetForm!: FormGroup;

  errorMsg = signal<string>('');
  
  // Timer States
  timerSeconds = signal<number>(600); // 10 minutes expiry
  resendCountdown = signal<number>(60); // 60 seconds resend wait
  canResend = signal<boolean>(false);

  private timerInterval: any;
  private resendInterval: any;

  ngOnInit() {
    this.requestForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Password validation: Min 8 chars, 1 uppercase, 1 number
    this.resetForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnDestroy() {
    this.clearTimers();
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  sendOtp() {
    this.errorMsg.set('');
    const email = this.requestForm.value.email;

    // Check if user email is inside ccfinance staff directory
    const userExists = this.stateService.users().some(u => u.email.toLowerCase() === email.toLowerCase());

    if (userExists) {
      this.stateService.addAuditLog(`Requested password reset OTP for ${email}`);
      this.step.set(2);
      this.startTimers();
    } else {
      this.errorMsg.set('Institutional email not found in directory.');
    }
  }

  startTimers() {
    this.clearTimers();
    
    // 10 minutes OTP Expiry Countdown
    this.timerSeconds.set(600);
    this.timerInterval = setInterval(() => {
      this.timerSeconds.update(s => {
        if (s <= 1) {
          clearInterval(this.timerInterval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    // 60 seconds Resend countdown
    this.resendCountdown.set(60);
    this.canResend.set(false);
    this.resendInterval = setInterval(() => {
      this.resendCountdown.update(c => {
        if (c <= 1) {
          clearInterval(this.resendInterval);
          this.canResend.set(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  resendOtp() {
    this.stateService.addAuditLog(`Resent password reset OTP for email`);
    this.startTimers();
  }

  formatTimer(): string {
    const mins = Math.floor(this.timerSeconds() / 60);
    const secs = this.timerSeconds() % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  submitReset() {
    this.errorMsg.set('');
    const otp = this.resetForm.value.otp;

    if (this.timerSeconds() === 0) {
      this.errorMsg.set('Verification token has expired. Request a new OTP.');
      return;
    }

    // Mock validation of OTP
    if (otp.length === 6) {
      this.stateService.addAuditLog(`Password reset successful for user account`);
      alert('Password updated successfully! Redirecting to login.');
      this.router.navigate(['/auth/login']);
    } else {
      this.errorMsg.set('Invalid OTP code. Check your inbox and try again.');
    }
  }

  private clearTimers() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.resendInterval) clearInterval(this.resendInterval);
  }
}
