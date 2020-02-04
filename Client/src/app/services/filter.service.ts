import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {debounceTime, map, tap} from 'rxjs/internal/operators';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  onRefresh = new Subject();

  private _perPage = 10;

  private _spritesSource: BehaviorSubject<any[]> = new BehaviorSubject([]);
  private _isLoadingSource: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _load = new Subject();
  private _autoFilters: any = { from: 0, count: this._perPage };
  private _userFilters: any = {};
  private _nothingToLoad: boolean;


  get spritesSource(): Observable<any[]> {
    return this._spritesSource;
  }

  get sprites(): any[] {
    return this._spritesSource.value;
  }

  get isLoading(): boolean {
    return this._isLoadingSource.value;
  }

  get isLoadingSource(): Observable<boolean> {
    return this._isLoadingSource;
  }


  constructor(private httpClient: HttpClient) {
    this._load
      .pipe(
        debounceTime(100)
      )
      .subscribe(() => {
        this._nothingToLoad = false;
        this.loadSpritesInfo()
          .subscribe((res) => {
            this.onRefresh.next();
            this._spritesSource.next(res);
          });
      });

  }

  public loadSprites(filter?: any) {
    console.log('load sprites');
    this._autoFilters.from = 0;
    if (filter) {
      this.updateFilter(filter);
    }

    this._load.next();
  }

  private updateFilter(filter: any) {
    Object.assign(this._userFilters, filter);
    this.trimEmptyFilters(this._userFilters);

  }

  private trimEmptyFilters(filters: any) {
    for (const propName in filters) {
      if (!filters.hasOwnProperty(propName)) {
        continue;
      }

      const prop = filters[propName];
      if (!prop && prop !== 0) {
        delete this._userFilters[propName];
      }
    }
  }

  public tryLoadNextPage() {
    if (this.isLoading || this._nothingToLoad) {
      return;
    }

    this.loadSpritesInfo().subscribe((res) => {
      res = this._spritesSource.value.concat(res);
      this._spritesSource.next(res);
    });
  }

  private loadSpritesInfo(): Observable<any[]> {
    const params = {};
    Object.assign(params, this._userFilters, this._autoFilters);

    this._isLoadingSource.next(true);

    return this.httpClient.get(environment.backendUrl + '/search', { params })
      .pipe(
        map((res: any[]) => {
          if(!res || res.length === 0) {
            this._nothingToLoad = true;
            return [];
          }

          res.forEach(sprite => {
            sprite.path = environment.artUrl + sprite.path;
            sprite.preview = environment.previewsUrl + sprite.name;
          });

          this._autoFilters.from += this._perPage;
          return res;
        }),
        tap(() => {
          this._isLoadingSource.next(false);
        })
      );
  }
}
