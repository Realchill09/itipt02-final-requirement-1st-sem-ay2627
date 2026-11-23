
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  ToastController
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  personOutline,
  lockClosedOutline,
  logInOutline,
  restaurantOutline
} from 'ionicons/icons';

import { Auth } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner
  ]
})
// Collect credentials and sign an existing user into the app.
export class Login {

  private readonly toastController = inject(ToastController);

  email = '';
  password = '';
  loading = false;

  // Register the icons used on the login form.
  constructor(
    private auth: Auth,
    private router: Router
  ) {
    addIcons({
      personOutline,
      lockClosedOutline,
      logInOutline,
      restaurantOutline
    });
  }

  // Clear stale credentials and loading state whenever the login page opens.
  ionViewWillEnter(): void {
    this.email = '';
    this.password = '';
    this.loading = false;
  }

  // Validate credentials, submit them, and navigate after login.
  login(): void {
    if (!this.email.trim() || !this.password.trim()) {
      void this.showLoginErrorToast('Please enter your email and password.');
      return;
    }

    this.loading = true;

    this.auth.login({
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: async (response) => {
        this.loading = false;

        if (response.success) {
          this.router.navigate([response.user?.role === 'admin' ? '/admin' : '/home']);
        } else {
          await this.showLoginErrorToast(response.message || 'Incorrect email or password.');
        }
      },
      error: async (error) => {
        this.loading = false;

        if (error.status === 400) {
          await this.showLoginErrorToast('Incorrect email or password.');
          return;
        }

        console.error('Login error:', error);
        await this.showLoginErrorToast('Login failed. Please check your API connection.');
      }
    });
  }

  // Show invalid credentials in a brief Ionic toast.
  private async showLoginErrorToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  }

  // Navigate to the account registration page.
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
