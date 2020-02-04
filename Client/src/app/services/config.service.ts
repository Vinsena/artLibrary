import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {BehaviorSubject, Observable} from 'rxjs';
import {Config} from '../models/config';


@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private _config = new BehaviorSubject<Config>(null);

  public get configSource(): Observable<Config> {
    return this._config.asObservable();
  }

  public get config(): Config {
    return this._config.value;
  }

  constructor(private _http: HttpClient) {
  }

  getConfig() {
    const url = environment.backendUrl + '/config';
    this._http.get(url)
      .subscribe((config: Config) => this._config.next(config));
  }
}
