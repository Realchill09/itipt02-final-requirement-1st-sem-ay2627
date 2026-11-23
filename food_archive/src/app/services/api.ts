import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';

// Hardcoded backend address - edit this value directly if the API moves.
const API_URL = 'http://127.0.0.1:8000/api';

@Injectable({
  providedIn: 'root',
})
// Send typed HTTP requests to the backend with the login cookie attached.
export class Api {
  private apiUrl = this.resolveApiUrl();
  private http = inject(HttpClient);

  // Use the page's host for local development so the login cookie is sent.
  private resolveApiUrl(): string {
    const apiUrl = new URL(API_URL);
    const localHosts = ['localhost', '127.0.0.1'];
    const pageHost = window.location.hostname;

    if (localHosts.includes(apiUrl.hostname) && localHosts.includes(pageHost)) {
      apiUrl.hostname = pageHost;
    }

    return apiUrl.toString().replace(/\/+$/, '');
  }

  // Combine the hardcoded API address with an endpoint path.
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
