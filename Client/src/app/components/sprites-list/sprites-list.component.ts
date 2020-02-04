import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {Observable} from 'rxjs/index';
import {FilterService} from '../../services/filter.service';
import { UploadService } from '../../services/upload.service';
import {take, skip} from "rxjs/operators";

@Component({
  selector: 'app-sprites-list',
  templateUrl: './sprites-list.component.html',
  styleUrls: ['./sprites-list.component.scss']
})
export class SpritesListComponent implements OnInit {

  sprites$: Observable<any[]>;
  isLoading$: Observable<boolean>;
  initializing = true;
  @ViewChild('container') _container: ElementRef;

  private _nextPageLoadDistance = 500;


  constructor(private _filterService: FilterService, private _uploadService: UploadService) {
    this._filterService.onRefresh
      .subscribe(() => {
        document.documentElement.scrollTop = 0;
      });
  }

  @HostListener('scroll', ['$event'])
  scroll(event) {
    const content = this._container.nativeElement;
    const bounds = content.getBoundingClientRect();

    if (content.offsetHeight <= window.innerHeight - bounds.y + this._nextPageLoadDistance) {
      this._filterService.tryLoadNextPage();
    }
  }

  ngOnInit() {
    this.sprites$ = this._filterService.spritesSource;
    this.isLoading$ = this._filterService.isLoadingSource;
    this._uploadService.allDone.subscribe((hasNew) => {
      if (hasNew) {
        this._filterService.loadSprites();
      }
    });

    this.sprites$
      .pipe(
        skip(1),
        take(1)
      )
      .subscribe(() => {
        this.initializing = false;
      });
  }
}
