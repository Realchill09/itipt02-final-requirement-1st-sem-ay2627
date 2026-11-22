
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
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  ToastController
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  lockClosedOutline,
  personAddOutline,
  restaurantOutline
} from 'ionicons/icons';

import { Auth } from '../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
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
// Collect account details and register a new user.
export class Register {

  private readonly toastController = inject(ToastController);

  username = '';
  email = '';
  password = '';
  confirmPassword = '';

  loading = false;

  // Register the icons used on the registration form.
  constructor(
    private auth: Auth,
    private router: Router,
  ) {
    addIcons({
      personOutline,
      mailOutline,
      lockClosedOutline,
      personAddOutline,
      restaurantOutline
    });
  }

  // Validate the form, create the account, and navigate to login.
  register(): void {

    if (
      !this.username.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.confirmPassword
    ) {
      void this.showToast('Please complete all fields.', 'warning');
      return;
    }

    if (this.password.length < 8) {
      void this.showToast('Password must be at least 8 characters.', 'warning');
      return;
    }

    if (this.password !== this.confirmPassword) {
      void this.showToast('Passwords do not match.', 'warning');
      return;
    }

    this.loading = true;

    this.auth.register({
      username: this.username.trim(),
      email: this.email.trim(),
      password: this.password
    }).subscribe({

      next: async (response) => {
        this.loading = false;

        if (response.success) {
          await this.showSuccessToast();
          this.router.navigate(['/login']);
        } else {
          void this.showToast(response.message || 'Registration failed.');
        }
      },

      error: (error) => {
        this.loading = false;
        console.error('Registration error:', error);
        void this.showToast('Unable to register. Please check your API connection.');
      }

    });
  }

  // Confirm account creation with a brief Ionic toast.
  private async showSuccessToast(): Promise<void> {
    const toast = await this.toastController.create({
      message: 'Account created successfully. You can now log in.',
      duration: 3000,
      position: 'top',
      color: 'success'
    });
    await toast.present();
  }

  private async showToast(
    message: string,
    color: 'success' | 'warning' | 'danger' = 'danger'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }

  // Navigate to the login page.
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}