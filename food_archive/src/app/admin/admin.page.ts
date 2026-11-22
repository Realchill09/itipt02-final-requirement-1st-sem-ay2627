import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

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
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  ToastController
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import {
  addOutline,
  createOutline,
  trashOutline,
  restaurantOutline, saveOutline } from 'ionicons/icons';

import { RecipeService } from '../services/recipe';
import type { Recipe } from '../services/recipe';

// Provide the admin interface for managing recipes and their images.
@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrl: './admin.page.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonSpinner
  ]
})
export class Admin implements OnInit {

  private readonly toastController = inject(ToastController);

  recipes = this.recipeService.recipes;
  loading = this.recipeService.loading;

  editingId = signal<number | null>(null);
  showForm = signal(false);
  uploadingImage = signal(false);

  recipeForm = {
    name: '',
    category: 'Chicken',
    description: '',
    cooking_time: 30,
    image: '',
    ingredients: [] as string[],
    steps: [] as string[]
  };

  newIngredient = '';
  newStep = '';

  // Register the icons used in the admin interface.
  constructor(
    private recipeService: RecipeService
  ) {
    addIcons({restaurantOutline,addOutline,saveOutline,createOutline,trashOutline});
  }

  // Load the recipe list when the admin page opens.
  ngOnInit(): void {
    this.loadRecipes();
  }

  // Fetch recipes from the API and report loading failures.
  loadRecipes(): void {
    this.recipeService.getRecipes().subscribe({
      error: async error => {
        console.error('Recipe loading error:', error);
        await this.showToast('Unable to load recipes.');
      }
    });
  }

  // Clear the form and open it for a new recipe.
  openAddForm(): void {
    this.resetForm();
    this.showForm.set(true);
  }

  // Fill the form with an existing recipe for editing.
  editRecipe(recipe: Recipe): void {
    this.editingId.set(recipe.id);

    this.recipeForm = {
      name: recipe.name,
      category: recipe.category,
      description: recipe.description,
      cooking_time: recipe.cooking_time ?? 30,
      image: recipe.image ?? '',
      ingredients: [...recipe.ingredients],
      steps: [...recipe.steps]
    };

    this.newIngredient = '';
    this.newStep = '';
    this.showForm.set(true);
  }

  // Add the entered ingredient to the recipe form.
  addIngredient(): void {
    const ingredient = this.newIngredient.trim();
    if (!ingredient) {
      return;
    }

    this.recipeForm.ingredients = [...this.recipeForm.ingredients, ingredient];
    this.newIngredient = '';
  }

  // Remove an ingredient from the recipe form by its index.
  removeIngredient(index: number): void {
    this.recipeForm.ingredients = this.recipeForm.ingredients.filter(
      (_, ingredientIndex) => ingredientIndex !== index
    );
  }

  // Add the entered cooking step to the recipe form.
  addStep(): void {
    const step = this.newStep.trim();
    if (!step) {
      return;
    }

    this.recipeForm.steps = [...this.recipeForm.steps, step];
    this.newStep = '';
  }

  // Remove a cooking step from the recipe form by its index.
  removeStep(index: number): void {
    this.recipeForm.steps = this.recipeForm.steps.filter(
      (_, stepIndex) => stepIndex !== index
    );
  }

  // Validate form fields and create or update the recipe.
  async saveRecipe(): Promise<void> {
    const form = this.recipeForm;

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      form.ingredients.length === 0 ||
      form.steps.length === 0
    ) {
      await this.showToast('Please complete all required fields.', 'warning');
      return;
    }

    const data: Partial<Recipe> = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      cooking_time: Number(form.cooking_time),
      image: form.image.trim(),
      ingredients: [...form.ingredients],
      steps: [...form.steps]
    };

    const id = this.editingId();

    const request = id
      ? this.recipeService.updateRecipe(id, data)
      : this.recipeService.addRecipe(data);

    request.subscribe({
      next: async response => {
        if (response.success) {
          await this.showToast(
            id ? 'Recipe updated successfully!' : 'Recipe added successfully!',
            'success'
          );
          this.cancelForm();
          this.loadRecipes();
        } else {
          await this.showToast(response.message || 'Unable to save recipe.');
        }
      },
      error: async error => {
        console.error('Save recipe error:', error);
        await this.showToast('Unable to save recipe. Check your API connection.');
      }
    });
  }

  // Upload the selected image and place its URL in the recipe form.
  uploadRecipeImage(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    const image = input.files?.[0];
    if (!image) {
      return;
    }

    this.uploadingImage.set(true);
    this.recipeService.uploadImage(image).pipe(
      finalize(() => this.uploadingImage.set(false))
    ).subscribe({
      next: async response => {
        input.value = '';
        this.recipeForm.image = response.url;
        await this.showToast('Image uploaded. Save the recipe to keep it.', 'success');
      },
      error: async error => {
        input.value = '';
        console.error('Image upload error:', error);
        await this.showToast(error.error?.detail || 'Unable to upload image.');
      }
    });
  }

  // Ask for confirmation before deleting a recipe.
  deleteRecipe(recipe: Recipe): void {
    if (!confirm(`Delete "${recipe.name}"?`)) return;

    this.recipeService.deleteRecipe(recipe.id).subscribe({
      next: async response => {
        if (response.success) {
          await this.showToast('Recipe deleted successfully!', 'success');
        } else {
          await this.showToast(response.message || 'Unable to delete recipe.');
        }
      },
      error: async error => {
        console.error('Delete recipe error:', error);
        await this.showToast('Unable to delete recipe.');
      }
    });
  }

  // Display a brief notification about an admin action.
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

  // Close the editor and clear its current values.
  cancelForm(): void {
    this.showForm.set(false);
    this.resetForm();
  }

  // Restore the recipe form to its initial values.
  resetForm(): void {
    this.editingId.set(null);

    this.recipeForm = {
      name: '',
      category: 'Chicken',
      description: '',
      cooking_time: 30,
      image: '',
      ingredients: [],
      steps: []
    };
    this.newIngredient = '';
    this.newStep = '';
  }

}
