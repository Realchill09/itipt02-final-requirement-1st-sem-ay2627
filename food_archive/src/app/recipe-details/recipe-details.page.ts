import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  IonTextarea,
  IonList,
  IonSpinner,
  ToastController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  createOutline,
  trashOutline,
  sendOutline,
  restaurantOutline,
  star,
  starOutline,
} from 'ionicons/icons';

import { Auth } from '../services/auth';
import type { Comment } from '../services/comment';
import { CommentService } from '../services/comment';
import type { RatingSummary, Recipe } from '../services/recipe';
import { RecipeService } from '../services/recipe';

@Component({
  selector: 'app-recipe-details',
  templateUrl: './recipe-details.page.html',
  styleUrl: './recipe-details.page.scss',
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
    IonTextarea,
    IonList,
    IonSpinner,
  ],
})
// Display recipe instructions and support ratings and reviews.
export class RecipeDetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private recipeService = inject(RecipeService);
  private commentService = inject(CommentService);
  private auth = inject(Auth);
  private toastController = inject(ToastController);

  recipe = signal<Recipe | null>(null);

  comments = this.commentService.comments;

  newComment = signal('');

  editingCommentId = signal<number | null>(null);

  editedMessage = signal('');

  loading = signal(false);

  currentUser = this.auth.currentUser;

  rating = signal<RatingSummary>({
    average_rating: 0,
    rating_count: 0,
    user_rating: null,
  });

  ratingStars = [1, 2, 3, 4, 5];

  // Register the icons used for recipe actions and ratings.
  constructor() {
    addIcons({
      createOutline,
      trashOutline,
      sendOutline,
      restaurantOutline,
      star,
      starOutline,
    });
  }

  // Read the recipe ID from the URL and load its details and activity.
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || Number.isNaN(id)) {
      this.router.navigate(['/home']);
      return;
    }

    this.loadRecipe(id);
    this.loadComments(id);
    this.loadRating(id);
  }

  // Fetch and display the selected recipe.
  loadRecipe(id: number): void {
    this.loading.set(true);

    this.recipeService.getRecipe(id).subscribe({
      next: (response) => {
        if (response.success && response.recipe) {
          this.recipe.set(response.recipe);
        } else {
          void this.showToast(response.message || 'Recipe not found.');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Recipe loading error:', error);
        void this.showToast('Unable to load recipe.');
        this.loading.set(false);
      },
    });
  }

  // Fetch reviews for the selected recipe.
  loadComments(recipeId: number): void {
    this.commentService.getComments(recipeId).subscribe({
      error: (error) => {
        console.error('Comment loading error:', error);
      },
    });
  }

  // Fetch the average rating and this user's rating.
  loadRating(recipeId: number): void {
    this.recipeService.getRating(recipeId).subscribe({
      next: response => this.rating.set(response.rating),
      error: error => {
        console.error('Rating loading error:', error);
      },
    });
  }

  // Save the user's rating and refresh the rating summary.
  saveRating(value: number): void {
    const recipe = this.recipe();
    if (!recipe) {
      return;
    }

    this.recipeService.saveRating(recipe.id, value).subscribe({
      next: response => this.rating.set(response.rating),
      error: error => {
        console.error('Rating save error:', error);
        void this.showToast('Unable to save rating.');
      },
    });
  }

  // Submit a new review for the selected recipe.
  addComment(): void {
    const recipe = this.recipe();
    const message = this.newComment().trim();

    if (!recipe || !message) {
      return;
    }

    this.commentService.addComment(recipe.id, message).subscribe({
      next: (response) => {
        if (response.success) {
          this.newComment.set('');
        } else {
          void this.showToast(response.message || 'Unable to add comment.');
        }
      },
      error: (error) => {
        console.error('Add comment error:', error);
        void this.showToast('Unable to add comment.');
      },
    });
  }

  // Put a review into edit mode and copy its current message.
  startEdit(comment: Comment): void {
    this.editingCommentId.set(comment.id);
    this.editedMessage.set(comment.message);
  }

  // Leave edit mode without saving changes.
  cancelEdit(): void {
    this.editingCommentId.set(null);
    this.editedMessage.set('');
  }

  // Save the edited review message.
  updateComment(comment: Comment): void {
    const recipe = this.recipe();
    const message = this.editedMessage().trim();

    if (!recipe || !message) {
      return;
    }

    this.commentService.updateComment(comment.id, message, recipe.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.cancelEdit();
        } else {
          void this.showToast(response.message || 'Unable to update comment.');
        }
      },
      error: (error) => {
        console.error('Update comment error:', error);
        void this.showToast('Unable to update comment.');
      },
    });
  }

  // Confirm and delete the selected review.
  deleteComment(comment: Comment): void {
    const recipe = this.recipe();

    if (!recipe) {
      return;
    }

    this.commentService.deleteComment(comment.id, recipe.id).subscribe({
      next: (response) => {
        if (!response.success) {
          void this.showToast(response.message || 'Unable to delete comment.');
        } else {
          void this.showToast('Comment deleted.', 'success');
        }
      },
      error: (error) => {
        console.error('Delete comment error:', error);
        void this.showToast('Unable to delete comment.');
      },
    });
  }

  // Check whether the current user wrote this review.
  isCommentOwner(comment: Comment): boolean {
    return comment.user_id === this.currentUser()?.id;
  }

  // Check whether the signed-in user has administrator access.
  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  // Return to the home page.
  goBack(): void {
    this.router.navigate(['/home']);
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