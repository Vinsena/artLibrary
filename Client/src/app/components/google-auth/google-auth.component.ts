import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {switchMap} from 'rxjs/internal/operators';

@Component({
  selector: 'app-google-auth',
  templateUrl: './google-auth.component.html',
  styleUrls: ['./google-auth.component.scss']
})
export class GoogleAuthComponent {

  constructor(router: Router, route: ActivatedRoute, auth: AuthService) {
    route.queryParams.pipe(
      switchMap(params => auth.signInWithGoogle(params['code']))
    ).subscribe((res: any) => {
      if (!res.token) {
        router.navigate(['login']);
        return;
      }

      auth.saveToken(res.token);
      router.navigate(['sprites']);
    });
  }
}
