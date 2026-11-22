
import { computed, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  albumsOutline,
  homeOutline,
  logOutOutline,
  personCircleOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';

import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    IonApp,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuToggle,
    IonRouterOutlet,
    IonTitle,
    IonToolbar,
  ],
})
// Provide the top-level Ionic shell that displays the active route.
export class AppComponent {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly toastController = inject(ToastController);

  isLoggedIn = this.auth.isLoggedIn;
  isAdmin = computed(() => this.auth.isAdmin());

  // Register the icons used in the app menu.
  constructor() {
    addIcons({
      albumsOutline,
      homeOutline,
      logOutOutline,
      personCircleOutline,
      shieldCheckmarkOutline,
    });
  }

  // Navigate to a signed-in area from the app menu.
  goHome(): void {
    this.router.navigate(['/home']);
  }

  // Navigate to the user's profile page.
  goProfile(): void {
    this.router.navigate(['/profile']);
  }

  // Navigate to the user's collections page.
  goCollections(): void {
    this.router.navigate(['/collections']);
  }

  // Navigate to the administrator dashboard.
  goAdmin(): void {
    this.router.navigate(['/admin']);
  }

  // End the session and return to the login page.
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
