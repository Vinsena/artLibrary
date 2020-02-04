import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class HasTokenGuard implements CanActivate  {

  constructor(private _router: Router, private _auth: AuthService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const token = this._auth.getToken();
    if (!token) {
      this._router.navigate(['login']);
      return false;
    }
    return true;
  }

}
