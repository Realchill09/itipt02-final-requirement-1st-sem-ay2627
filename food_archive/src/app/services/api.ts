import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
// Send typed HTTP requests to the backend with the login cookie attached.
export class Api {
  private apiUrl = environment.apiUrl.replace(/\/+$/, '');
  private http = inject(HttpClient);

  // Combine the configured API address with an endpoint path.
  private endpoint(route: string): string {
    return `${this.apiUrl}/${route}`;
  }

  // Read data from the backend, optionally with query parameters.
  get<T>(route: string, params: any = {}): Observable<T> {
    let httpParams = new HttpParams();

    Object.keys(params).forEach((key) => {
      httpParams = httpParams.set(key, String(params[key]));
    });

    return this.http.get<T>(this.endpoint(route), {
      params: httpParams,
      withCredentials: true,
    });
  }

  // Create data or trigger an action on the backend.
  post<T>(route: string, data: any): Observable<T> {
    return this.http.post<T>(this.endpoint(route), data, {
      withCredentials: true,
    });
  }

  // Replace or fully update backend data.
  put<T>(route: string, data: any): Observable<T> {
    return this.http.put<T>(this.endpoint(route), data, {
      withCredentials: true,
    });
  }

  // Partially update backend data.
  patch<T>(route: string, data: any): Observable<T> {
    return this.http.patch<T>(this.endpoint(route), data, {
      withCredentials: true,
    });
  }

  // Delete backend data, optionally using query parameters.
  delete<T>(route: string, params: any = {}): Observable<T> {
    let httpParams = new HttpParams();

    Object.keys(params).forEach((key) => {
      httpParams = httpParams.set(key, String(params[key]));
    });

    return this.http.delete<T>(this.endpoint(route), {
      params: httpParams,
      withCredentials: true,
    });
  }
}
