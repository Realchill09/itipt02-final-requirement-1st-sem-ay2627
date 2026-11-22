import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonMenuButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonAvatar,
  IonBadge,
  IonInput,
  IonSpinner,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  personCircleOutline,
  mailOutline,
  shieldCheckmarkOutline,
  logOutOutline,
} from 'ionicons/icons';

import { Auth } from '../services/auth';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonMenuButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonAvatar,
    IonBadge,
    IonInput,
    IonSpinner,
    FormsModule,
  ],
})
// Display the signed-in user's profile and account role.
export class ProfilePage {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);

  currentUser = this.auth.currentUser;

  isAdmin = computed(() => this.auth.isAdmin());
  username = this.currentUser()?.username ?? '';
  email = this.currentUser()?.email ?? '';
  profileError = '';
  profileSuccess = '';
  profileSaving = false;

  // Register the icons used on the profile page.
  constructor() {
    addIcons({
      personCircleOutline,
      mailOutline,
      shieldCheckmarkOutline,
      logOutOutline,
    });
  }

  // Save the signed-in user's username and email.
  updateProfile(): void {
    this.profileError = '';
    this.profileSuccess = '';
    this.profileSaving = true;

    this.auth.updateProfile(this.username.trim(), this.email.trim()).subscribe({
      next: (response) => {
        this.profileSaving = false;
        this.profileSuccess = response.message;
        if (response.user) {
          this.username = response.user.username;
          this.email = response.user.email;
        }
      },
      error: (error) => {
        console.error('Profile update error:', error);
        this.profileSaving = false;
        this.profileError = error.error?.detail ?? 'Unable to update your profile. Please try again.';
      },
    });
  }

  // End the session and navigate to the login page.
  logout(): void {
    this.auth.logout().subscribe({
      next: () => window.location.reload(),
      error: (error) => {
        console.error('Logout error:', error);
        void this.showToast('Unable to contact the server. Please try again.');
      },
    });
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'danger',
    });
    await toast.present();
  }
}
