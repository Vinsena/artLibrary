import { Injectable } from '@angular/core';
import {Subject, Observable, BehaviorSubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TagsService {

  private _tags = new BehaviorSubject<string[]>([]);
  private _categories = new BehaviorSubject<string[]>([]);

  public get tags(): Observable<string[]> {
    return this._tags.asObservable();
  }

  public get categories(): Observable<string[]> {
    return this._categories.asObservable();
  }

  constructor(private _http: HttpClient) { }

  public refreshTags() {
    // TODO: Add revision checking
    this._http.get(environment.backendUrl + '/tags')
      .subscribe((res: any) => {
        this._tags.next(res.tags);
        this._categories.next(res.categories);
      });
  }
}
