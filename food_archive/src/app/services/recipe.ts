
import { Injectable, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { Api } from './api';

export interface Recipe {
  id: number;
  name: string;
  category: string;
  description: string;
  ingredients: string[];
  steps: string[];
  image?: string;
  cooking_time?: number;
  created_by?: number;
}

export interface RecipeResponse {
  success: boolean;
  message: string;
  recipes?: Recipe[];
  recipe?: Recipe;
}

export interface FavoritesResponse {
  success: boolean;
  message?: string;
  favorites?: number[];
}

export interface RatingSummary {
  average_rating: number;
  rating_count: number;
  user_rating: number | null;
}

export interface RatingResponse {
  success: boolean;
  message?: string;
  rating: RatingSummary;
}

export interface ImageUploadResponse {
  success: boolean;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
// Provide API methods and shared state for recipes, favorites, ratings, and images.
export class RecipeService {

  // Angular Signals
  recipes = signal<Recipe[]>([]);
  favoriteIds = signal<number[]>([]);
  loading = signal<boolean>(false);

  // Keep the shared API client available for recipe requests.
  constructor(private api: Api) {}

  // Load every recipe and update the shared recipe list.
  getRecipes(): Observable<RecipeResponse> {

    this.loading.set(true);

    return this.api.get<RecipeResponse>('recipes').pipe(
      tap(response => {
        if (response.success) {
          this.recipes.set(response.recipes ?? []);
        }
      }),
      finalize(() => {
        this.loading.set(false);
      })
    );
  }

  // Load a single recipe by its ID.
  getRecipe(id: number): Observable<RecipeResponse> {

    return this.api.get<RecipeResponse>(
      'recipes',
      { id }
    );
  }

  // Load and store the current user's favorite recipe IDs.
  getFavorites(): Observable<FavoritesResponse> {
    return this.api.get<FavoritesResponse>('favorites').pipe(
      tap(response => {
        if (response.success) {
          this.favoriteIds.set(response.favorites ?? []);
        }
      })
    );
  }

  // Add a recipe to favorites and update shared state.
  addFavorite(recipeId: number): Observable<FavoritesResponse> {
    return this.api.post<FavoritesResponse>('favorites', {
      recipe_id: recipeId
    }).pipe(
      tap(response => {
        if (response.success) {
          this.favoriteIds.update(ids =>
            ids.includes(recipeId) ? ids : [...ids, recipeId]
          );
        }
      })
    );
  }

  // Remove a recipe from favorites and update shared state.
  removeFavorite(recipeId: number): Observable<FavoritesResponse> {
    return this.api.delete<FavoritesResponse>('favorites', {
      recipe_id: recipeId
    }).pipe(
      tap(response => {
        if (response.success) {
          this.favoriteIds.update(ids =>
            ids.filter(id => id !== recipeId)
          );
        }
      })
    );
  }

  // Get the rating summary for a recipe.
  getRating(recipeId: number): Observable<RatingResponse> {
    return this.api.get<RatingResponse>('ratings', {
      recipe_id: recipeId
    });
  }

  // Save the current user's rating for a recipe.
  saveRating(recipeId: number, rating: number): Observable<RatingResponse> {
    return this.api.put<RatingResponse>('ratings', {
      recipe_id: recipeId,
      rating
    });
  }

  // Send an image file to the backend and return its public URL.
  uploadImage(image: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', image);
    return this.api.post<ImageUploadResponse>('uploads', formData);
  }

  // Create a recipe and refresh the shared recipe list.
  addRecipe(data: Partial<Recipe>): Observable<RecipeResponse> {

    return this.api.post<RecipeResponse>(
      'recipes',
      data
    ).pipe(
      tap(response => {
        if (response.success) {
          this.getRecipes().subscribe();
        }
      })
    );
  }

  // Replace a recipe's saved details and refresh the shared list.
  updateRecipe(
    id: number,
    data: Partial<Recipe>
  ): Observable<RecipeResponse> {

    return this.api.put<RecipeResponse>(
      'recipes',
      {
        id,
        ...data
      }
    ).pipe(
      tap(response => {
        if (response.success) {
          this.getRecipes().subscribe();
        }
      })
    );
  }

  // Delete a recipe and remove it from the shared recipe list.
  deleteRecipe(id: number): Observable<RecipeResponse> {

    return this.api.delete<RecipeResponse>(
      'recipes',
      { id }
    ).pipe(
      tap(response => {
        if (response.success) {
          this.recipes.update(recipes =>
            recipes.filter(recipe => recipe.id !== id)
          );
        }
      })
    );
  }

}
