import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

import { Api } from './api';
import type { Recipe } from './recipe';

export interface RecipeCollection {
  id: number;
  name: string;
  recipes: Recipe[];
}

export interface CollectionResponse {
  success: boolean;
  message?: string;
  collections?: RecipeCollection[];
  collection?: RecipeCollection;
}

@Injectable({
  providedIn: 'root',
})
// Provide API methods for managing a user's recipe collections.
export class CollectionService {
  private api = inject(Api);

  // Load all collections belonging to the current user.
  getCollections(): Observable<CollectionResponse> {
    return this.api.get<CollectionResponse>('collections');
  }

  // Create a private collection with the supplied name.
  createCollection(name: string): Observable<CollectionResponse> {
    return this.api.post<CollectionResponse>('collections', { name });
  }

  // Delete one of the current user's collections.
  deleteCollection(collectionId: number): Observable<CollectionResponse> {
    return this.api.delete<CollectionResponse>(`collections/${collectionId}`);
  }

  // Add a recipe to a collection.
  addRecipe(collectionId: number, recipeId: number): Observable<CollectionResponse> {
    return this.api.post<CollectionResponse>(
      `collections/${collectionId}/recipes`,
      { recipe_id: recipeId },
    );
  }

  // Remove a recipe from a collection.
  removeRecipe(collectionId: number, recipeId: number): Observable<CollectionResponse> {
    return this.api.delete<CollectionResponse>(
      `collections/${collectionId}/recipes/${recipeId}`,
    );
  }
}
