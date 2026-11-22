
import { Injectable, signal } from '@angular/core';
import { Observable, tap, finalize } from 'rxjs';
import { Api } from './api';

export interface Comment {
  id: number;
  recipe_id: number;
  user_id: number;
  username: string;
  message: string;
  created_at?: string;
}

export interface CommentResponse {
  success: boolean;
  message: string;
  comments?: Comment[];
  comment?: Comment;
}

@Injectable({
  providedIn: 'root'
})
// Load and manage review comments for recipes.
export class CommentService {

  // Angular Signals
  comments = signal<Comment[]>([]);
  loading = signal<boolean>(false);

  // Keep the shared API client available for comment requests.
  constructor(private api: Api) {}

  // Load comments for one recipe and update the shared comment list.
  getComments(recipeId: number): Observable<CommentResponse> {

    this.loading.set(true);

    return this.api.get<CommentResponse>(
      'comments',
      { recipe_id: recipeId }
    ).pipe(
      tap(response => {
        if (response.success) {
          this.comments.set(response.comments ?? []);
        }
      }),
      finalize(() => {
        this.loading.set(false);
      })
    );
  }

  // Add a review and reload the recipe's comments.
  addComment(
    recipeId: number,
    message: string
  ): Observable<CommentResponse> {

    return this.api.post<CommentResponse>(
      'comments',
      {
        recipe_id: recipeId,
        message
      }
    ).pipe(
      tap(response => {
        if (response.success) {
          this.getComments(recipeId).subscribe();
        }
      })
    );
  }

  // Edit a review and reload the recipe's comments.
  updateComment(
    commentId: number,
    message: string,
    recipeId: number
  ): Observable<CommentResponse> {

    return this.api.patch<CommentResponse>(
      'comments',
      {
        id: commentId,
        message
      }
    ).pipe(
      tap(response => {
        if (response.success) {
          this.getComments(recipeId).subscribe();
        }
      })
    );
  }

  // Delete a review and remove it from the shared comment list.
  deleteComment(
    commentId: number,
    recipeId: number
  ): Observable<CommentResponse> {

    return this.api.delete<CommentResponse>(
      'comments',
      { id: commentId }
    ).pipe(
      tap(response => {
        if (response.success) {
          this.comments.update(comments =>
            comments.filter(comment => comment.id !== commentId)
          );
        }
      })
    );
  }

}
