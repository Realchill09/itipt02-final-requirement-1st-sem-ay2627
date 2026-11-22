
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  IonMenu,
  IonMenuToggle,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonSearchbar,
  ToastController
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  menuOutline,
  restaurantOutline,
  personCircleOutline,
  shieldCheckmarkOutline,
  logOutOutline,
  heart,
  heartOutline,
  albumsOutline
} from 'ionicons/icons';

import { RecipeService, Recipe } from '../services/recipe';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  standalone: true,
  imports: [
    CommonModule,
    IonMenu,
    IonMenuToggle,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonSearchbar
  ]
})
// Show recipes with search, category, favorite, and navigation controls.
export class HomePage implements OnInit {
  private readonly toastController = inject(ToastController);

  categories = [
    'All Recipes',
    'Favorites',
    'Chicken',
    'Beef',
    'Pasta',
    'Dessert'
  ];

  selectedCategory = signal('All Recipes');
  searchTerm = signal('');

  recipes = this.recipeService.recipes;
  favoriteIds = this.recipeService.favoriteIds;

  // Filter recipes using the selected category and search text.
  filteredRecipes = computed(() => {
    const selected = this.selectedCategory();
    const searchTerm = this.searchTerm().trim().toLowerCase();

    return this.recipes().filter(recipe => {
      const matchesCategory =
        selected === 'All Recipes' ||
        (selected === 'Favorites'
          ? this.favoriteIds().includes(recipe.id)
          : recipe.category.toLowerCase() === selected.toLowerCase());
      const searchableText = [
        recipe.name,
        recipe.category,
        recipe.description,
        ...recipe.ingredients
      ].join(' ').toLowerCase();
      return matchesCategory && searchableText.includes(searchTerm);
    });
  });

  // Register the icons used in the home menu and recipe cards.
  constructor(
    private recipeService: RecipeService,
    private auth: Auth,
    private router: Router
  ) {
    addIcons({
      menuOutline,
      restaurantOutline,
      personCircleOutline,
      shieldCheckmarkOutline,
      logOutOutline,
      heart,
      heartOutline,
      albumsOutline
    });
  }

  // Load recipes and favorites when the home page opens.
  ngOnInit(): void {
    this.loadRecipes();
    this.loadFavorites();
  }

  // Fetch recipes and log any API errors.
  loadRecipes(): void {
    this.recipeService.getRecipes().subscribe({
      error: error => {
        console.error('Recipe loading error:', error);
      }
    });
  }

  // Fetch the signed-in user's favorite recipe IDs.
  loadFavorites(): void {
    this.recipeService.getFavorites().subscribe({
      error: error => {
        console.error('Favorites loading error:', error);
      }
    });
  }

  // Select a category or the favorites filter.
  chooseCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  // Navigate to the selected recipe's details page.
  openRecipe(recipe: Recipe): void {
    this.router.navigate(['/recipe-details', recipe.id]);
  }

  // Check whether the recipe is in the user's favorites.
  isFavorite(recipeId: number): boolean {
    return this.favoriteIds().includes(recipeId);
  }

  // Add or remove the recipe from the user's favorites.
  toggleFavorite(recipe: Recipe): void {
    const request = this.isFavorite(recipe.id)
      ? this.recipeService.removeFavorite(recipe.id)
      : this.recipeService.addFavorite(recipe.id);

    request.subscribe({
      error: error => {
        console.error('Favorite update error:', error);
        void this.showToast('Unable to update favorites.');
      }
    });
  }

  // Navigate to the user's profile.
  goProfile(): void {
    this.router.navigate(['/profile']);
  }

  // Navigate to the user's collections.
  goCollections(): void {
    this.router.navigate(['/collections']);
  }

  // Navigate to the admin page.
  goAdmin(): void {
    this.router.navigate(['/admin']);
  }

  // Check whether the current user has the admin role.
  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  // End the session and return to the login page.
  logout(): void {
    this.auth.logout().subscribe({
      next: () => window.location.reload(),
      error: error => {
        console.error('Logout error:', error);
        void this.showToast('Unable to contact the server.');
      }
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
