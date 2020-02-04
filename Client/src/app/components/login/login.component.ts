import { Component } from '@angular/core';
import {ConfigService} from '../../services/config.service';
import {Config} from '../../models/config';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  public isConfigLoaded;

  public config: Config;

  public loginPasswordForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
  });

  constructor(private _router: Router, configService: ConfigService, private _auth: AuthService) {
    configService.configSource.subscribe((config: Config) => {
      this.config = config;
      if(config) {
        this.isConfigLoaded = true;
      }
    });
    configService.getConfig();
  }

  loginByLoginAndPassword() {
    this._auth.signIn(this.loginPasswordForm.value)
      .subscribe(ok => {
        if (ok) {
          console.log('ok');
          this._router.navigate(['/sprites']);
        }
      });
  }

  loginByGoogle() {
    window.open(this.config.googleAuthUrl, '_self');
  }
}
