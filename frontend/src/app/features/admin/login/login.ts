import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form = this.fb.group({ email: '', password: '', remember: false });
  protected readonly showPassword = signal(false);
  protected readonly busy = signal(false);
  protected readonly message = signal('');
  protected readonly ok = signal(false);

  constructor() {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('login-no-scroll');
      document.body.classList.add('login-no-scroll');
      this.destroyRef.onDestroy(() => {
        document.documentElement.classList.remove('login-no-scroll');
        document.body.classList.remove('login-no-scroll');
      });
    }

    // already signed in? go straight to the workspace
    this.auth.check().subscribe((yes) => { if (yes) this.router.navigateByUrl('/admin'); });
  }

  protected submit(): void {
    this.message.set('');
    const { email, password, remember } = this.form.getRawValue();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      document.getElementById('email')?.focus();
      this.fail('Enter a valid admin email address.');
      return;
    }
    if (!password) {
      document.getElementById('password')?.focus();
      this.fail('Enter your password to continue.');
      return;
    }

    this.busy.set(true);
    this.auth.login({ email: email.trim(), password, remember }).subscribe({
      next: (res) => {
        this.busy.set(false);
        if (!res?.success) {
          this.fail(res?.message || 'Sign-in is unavailable right now. Please try again later.');
          return;
        }
        this.ok.set(true);
        this.message.set('Signed in successfully. Opening your admin workspace…');
        const target = res.redirect && res.redirect.startsWith('/') && !res.redirect.startsWith('//') ? res.redirect : '/admin';
        this.router.navigateByUrl(target);
      },
      error: (err: HttpErrorResponse) => {
        this.busy.set(false);
        this.form.controls.password.setValue('');
        document.getElementById('password')?.focus();
        if (err.status === 401) this.fail('That email or password doesn’t match. Please try again.');
        else if (err.status === 0) this.fail('Could not connect to the sign-in service. Check that the server is running.');
        else this.fail((err.error && err.error.message) || 'Sign-in is unavailable right now. Please try again later.');
      },
    });
  }

  private fail(text: string): void {
    this.ok.set(false);
    this.message.set(text);
  }
}
