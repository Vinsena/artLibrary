import {Component, HostListener} from '@angular/core';
import {FileUploadStatus, UploadService, UploadStatus} from '../../services/upload.service';
import {merge, Observable} from 'rxjs/index';
import { map } from 'rxjs/operators';
import {switchMap} from 'rxjs/internal/operators';

@Component({
  selector: 'app-upload-list',
  templateUrl: './upload-list.component.html',
  styleUrls: ['./upload-list.component.scss']
})
export class UploadListComponent {

  uploadList$: Observable<any[]>;
  displayUpload$: Observable<boolean>;
  countInProgress$: Observable<number>;

  private _skipUploadHiding = false;

  constructor(private _uploadService: UploadService) {
    this.uploadList$ = _uploadService.uploadListSource;
    this.displayUpload$ = this._uploadService.showUploadSource;
    this.countInProgress$ = _uploadService.uploadListSource
      .pipe(
        switchMap((files: FileUploadStatus[]) => merge(...files.map(f => f.status))),
        map(() =>
          _uploadService.uploadList
            .filter(f => [UploadStatus.Progress, UploadStatus.Waiting].includes(f.status.value)).length
        )
      );
  }

  @HostListener('window:click', ['$event'])
  click() {
    if (this._skipUploadHiding) {
      this._skipUploadHiding = false;
    } else {
      this._uploadService.showList(false);
    }
  }

  showHideUploadList() {
    this._uploadService.showList(!this._uploadService.showUpload);
    this._skipUploadHiding = true;
  }

  cancel(item) {
    this.preventDefault();
    item.cancel();
  }

  preventDefault() {
    event.preventDefault();
    event.stopPropagation();
  }

  clearAllDone() {
    this._uploadService.clearAllDone();
    if (this._uploadService.uploadList.length === 0) {
      this.showHideUploadList();
    }
  }
}
