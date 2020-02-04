import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import {Observable} from 'rxjs/index';
import {tap} from 'rxjs/internal/operators';
import {Router} from '@angular/router';
import { AuthService } from '../services/auth.service';


@Injectable()
export class RequestInterceptor implements HttpInterceptor {

  constructor(private _router: Router, private _auth: AuthService) {

  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token: string = this._auth.getToken();
    if (token) {
        request = request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + token) });
    }

    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {}, (err: any) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            this._auth.clearToken();
            this._router.navigate(['login']);
          }
        }
      })
    );
  }
}
