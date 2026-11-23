import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import type { OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline } from 'ionicons/icons';
import { finalize } from 'rxjs';

import { CollectionService } from '../services/collection';
import type { RecipeCollection } from '../services/collection';
import { RecipeService } from '../services/recipe';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.page.html',
  styleUrl: './collections.page.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
  ],
})
// Let users create collections and manage the recipes saved in them.
export class CollectionsPage implements OnInit {
  private collectionService = inject(CollectionService);
  private recipeService = inject(RecipeService);
  private toastController = inject(ToastController);

  collections = signal<RecipeCollection[]>([]);
  recipes = this.recipeService.recipes;
  newCollectionName = signal('');
  selectedRecipeIds = signal<Record<number, number[]>>({});
  creatingCollection = signal(false);
  deletingCollectionIds = signal(new Set<number>());
  private nextTemporaryCollectionId = -1;
  private pendingCollection: RecipeCollection | null = null;
  private pendingRecipeIds: Record<number, number[]> = {};

  // Register the icons used by this page.
  constructor() {
    addIcons({ addOutline, trashOutline });
  }

  // Load available recipes and the user's collections when the page opens.
  ngOnInit(): void {
    this.recipeService.getRecipes().subscribe({
      error: error => {
        console.error('Recipe loading error:', error);
        void this.showToast('Unable to load recipes.');
      },
    });
    this.loadCollections();
  }

  // Fetch the user's collections from the API.
  loadCollections(): void {
    this.collectionService.getCollections().subscribe({
      next: response => {
        const collections = response.collections ?? [];
        const pending = this.pendingCollection;
        this.collections.set(pending
          ? [
              ...collections.filter(collection => collection.name !== pending.name),
              pending,
            ].sort((a, b) => a.name.localeCompare(b.name))
          : collections);
      },
      error: error => {
        console.error('Collections loading error:', error);
        void this.showToast('Unable to load collections.');
      },
    });
  }

  // Create a collection using the entered name.
  createCollection(): void {
    const name = this.newCollectionName().trim();
    if (!name || this.creatingCollection()) {
      return;
    }

    const temporaryCollection: RecipeCollection = {
      id: this.nextTemporaryCollectionId--,
      name,
      recipes: [],
    };
    this.pendingCollection = temporaryCollection;
    this.collections.update(collections => [...collections, temporaryCollection]
      .sort((a, b) => a.name.localeCompare(b.name)));
    this.newCollectionName.set('');
    this.creatingCollection.set(true);
    this.collectionService.createCollection(name).pipe(
      finalize(() => this.creatingCollection.set(false)),
    ).subscribe({
      next: response => {
        const createdCollection = response.collection;
        if (!response.success || !createdCollection) {
          this.removePendingCollection(temporaryCollection.id);
          if (!this.newCollectionName()) {
            this.newCollectionName.set(name);
          }
          void this.showToast(response.message || 'Unable to create collection.');
          return;
        }
        const queuedRecipeIds = this.pendingRecipeIds[temporaryCollection.id] ?? [];
        delete this.pendingRecipeIds[temporaryCollection.id];
        this.pendingCollection = null;
        this.collections.update(collections => collections
          .map(collection => collection.id === temporaryCollection.id
            ? { ...createdCollection, recipes: collection.recipes }
            : collection)
          .sort((a, b) => a.name.localeCompare(b.name)));
        void this.showToast('Collection created.', 'success');
        queuedRecipeIds.forEach(recipeId => {
          this.persistRecipeAddition(createdCollection.id, recipeId);
        });
      },
      error: error => {
        console.error('Collection creation error:', error);
        this.removePendingCollection(temporaryCollection.id);
        if (!this.newCollectionName()) {
          this.newCollectionName.set(name);
        }
        void this.showToast(error.error?.detail || 'Unable to create collection.');
      },
    });
  }

  private removePendingCollection(id: number): void {
    this.pendingCollection = null;
    delete this.pendingRecipeIds[id];
    this.collections.update(collections => collections.filter(collection => collection.id !== id));
  }

  // Check whether a recipe is already in a collection.
  hasRecipe(collection: RecipeCollection, recipeId: number): boolean {
    return collection.recipes.some(recipe => recipe.id === recipeId);
  }

  // Add the selected recipes to a collection.
  addRecipe(collection: RecipeCollection): void {
    const recipeIds = [...new Set(this.selectedRecipeIds()[collection.id] ?? [])];
    if (recipeIds.length === 0) {
      return;
    }

    const recipesToAdd = this.recipes().filter(recipe => recipeIds.includes(recipe.id));
    if (recipesToAdd.length !== recipeIds.length) {
      void this.showToast('Unable to find one or more selected recipes.');
      return;
    }

    this.selectedRecipeIds.update(selected => ({ ...selected, [collection.id]: [] }));
    this.collections.update(collections => collections.map(item => item.id === collection.id
      ? {
          ...item,
          recipes: [...item.recipes, ...recipesToAdd].sort((a, b) => a.name.localeCompare(b.name)),
        }
      : item));

    if (collection.id < 0) {
      this.pendingRecipeIds[collection.id] = [
        ...(this.pendingRecipeIds[collection.id] ?? []),
        ...recipeIds,
      ];
      return;
    }

    recipeIds.forEach(recipeId => this.persistRecipeAddition(collection.id, recipeId));
  }

  private persistRecipeAddition(collectionId: number, recipeId: number): void {
    const rollback = (): void => {
      this.collections.update(collections => collections.map(item => item.id === collectionId
        ? { ...item, recipes: item.recipes.filter(existing => existing.id !== recipeId) }
        : item));
      const selectedRecipeIds = this.selectedRecipeIds()[collectionId] ?? [];
      if (!selectedRecipeIds.includes(recipeId)) {
        this.selectedRecipeIds.update(selected => ({
          ...selected,
          [collectionId]: [...selectedRecipeIds, recipeId],
        }));
      }
    };

    this.collectionService.addRecipe(collectionId, recipeId).subscribe({
      next: response => {
        if (!response.success) {
          rollback();
          void this.showToast(response.message || 'Unable to add recipe to collection.');
          return;
        }
        void this.showToast('Recipe added to collection.', 'success');
      },
      error: error => {
        console.error('Adding recipe to collection failed:', error);
        rollback();
        void this.showToast(error.error?.detail || 'Unable to add recipe to collection.');
      },
    });
  }

  // Remove a recipe from a collection.
  removeRecipe(collection: RecipeCollection, recipeId: number): void {
    const recipe = collection.recipes.find(item => item.id === recipeId);
    if (!recipe) {
      return;
    }

    this.collections.update(collections => collections.map(item => item.id === collection.id
      ? { ...item, recipes: item.recipes.filter(existing => existing.id !== recipeId) }
      : item));
    const rollback = (): void => {
      this.collections.update(collections => collections.map(item => item.id === collection.id
        ? {
            ...item,
            recipes: [...item.recipes, recipe].sort((a, b) => a.name.localeCompare(b.name)),
          }
        : item));
    };

    this.collectionService.removeRecipe(collection.id, recipeId).subscribe({
      next: response => {
        if (!response.success) {
          rollback();
          void this.showToast(response.message || 'Unable to remove recipe from collection.');
          return;
        }
        void this.showToast('Recipe removed from collection.', 'success');
      },
      error: error => {
        console.error('Removing recipe from collection failed:', error);
        rollback();
        void this.showToast('Unable to remove recipe from collection.');
      },
    });
  }

  // Delete a collection immediately and prevent duplicate requests while pending.
  deleteCollection(collection: RecipeCollection): void {
    if (this.deletingCollectionIds().has(collection.id)) {
      return;
    }

    const originalIndex = this.collections().findIndex(item => item.id === collection.id);
    this.collections.update(collections => collections.filter(item => item.id !== collection.id));
    this.deletingCollectionIds.update(ids => new Set(ids).add(collection.id));
    this.collectionService.deleteCollection(collection.id).pipe(
      finalize(() => this.deletingCollectionIds.update(ids => {
        const updated = new Set(ids);
        updated.delete(collection.id);
        return updated;
      })),
    ).subscribe({
      next: response => {
        if (!response.success) {
          this.restoreCollection(collection, originalIndex);
          void this.showToast(response.message || 'Unable to delete collection.');
          return;
        }
        void this.showToast('Collection deleted.', 'success');
      },
      error: error => {
        console.error('Collection deletion error:', error);
        this.restoreCollection(collection, originalIndex);
        void this.showToast('Unable to delete collection.');
      },
    });
  }

  private restoreCollection(collection: RecipeCollection, index: number): void {
    this.collections.update(collections => {
      if (collections.some(item => item.id === collection.id)) {
        return collections;
      }

      const restored = [...collections];
      restored.splice(Math.max(0, Math.min(index, restored.length)), 0, collection);
      return restored;
    });
  }

  setSelectedRecipes(collectionId: number, recipeIds: number[] | null | undefined): void {
    this.selectedRecipeIds.update(selected => ({
      ...selected,
      [collectionId]: recipeIds ?? [],
    }));
  }

  private async showToast(message: string, color: 'danger' | 'success' = 'danger'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color,
    });
    await toast.present();
  }
}