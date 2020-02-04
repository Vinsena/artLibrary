import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';
import { Observable, of, Subscriber } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private static TOKEN_KEY = 'token';

  constructor(private _http: HttpClient) {
  }

  signInWithGoogle(code: string): Observable<any> {
    return this._http.post(environment.backendUrl + '/google-auth', {code});
  }

  signIn(creds: {username: string, password: string}) {

    return new Observable(sub => {

      this._http.post(environment.backendUrl + '/auth', creds)
      .pipe(
        catchError(err => {
          console.log(err);
          sub.next(false);
          return of(err);
        })
      )
      .subscribe(res => {
        if (res.token) {
          this.saveToken(res.token);
          sub.next(true);
        }
      });

    });
  }

  get(url: string): Observable<any> {
    return new Observable((observer: Subscriber<any>) => {
        let objectUrl: string = null;

        const token = this.getToken();
        const headers = new HttpHeaders();
        if (token) {
          headers.set('Authorization', 'Bearer ' + token);
        }

        this._http
            .get(url, {
                headers: headers,
                responseType: 'blob'
            })
            .subscribe(m => {
                objectUrl = URL.createObjectURL(m);
                observer.next(objectUrl);
            });

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
                objectUrl = null;
            }
        };
    });
  }

  saveToken(token: string): void {
    localStorage.setItem(AuthService.TOKEN_KEY, token);
  }

  getToken(): string {
    return localStorage.getItem(AuthService.TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(AuthService.TOKEN_KEY);
  }
}
