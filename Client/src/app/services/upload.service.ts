import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject, concat} from 'rxjs/index';
import {HttpClient, HttpEventType, HttpHeaders} from '@angular/common/http';
import {catchError, map, finalize, takeWhile} from 'rxjs/internal/operators';
import {environment} from '../../environments/environment';
import {SpriteDto} from "../models/SpriteDto";

export enum UploadStatus {
  Unknown = 0,
  Waiting = 1,
  Progress = 2,
  Success = 3,
  Failed = 4,
  Canceled = 5
}

export enum FailReason {
  Unknown = 0,
  FileIsTooBig = 1,
  UnsupportedExtension = 2,
  ConnectionLost = 3,
  NoPermissions = 4
}

export class FileUploadStatus {

  status = new BehaviorSubject<UploadStatus>(UploadStatus.Unknown);
  loaded = new BehaviorSubject<number>(0);
  progress = new BehaviorSubject<number>(0);

  onSuccess: Subject<FileUploadStatus> = new Subject();
  onCancel: Subject<FileUploadStatus> = new Subject();
  onError: Subject<FileUploadStatus> = new Subject();
  onFinish: Subject<FileUploadStatus> = new Subject();

  failReason: FailReason = FailReason.Unknown;
  additionalInfo: any;

  private _request: Observable<any>;
  private _canceled: boolean;


  get request() {
    return this._request;
  }

  set request(req: Observable<any>) {
    this._request  = req.pipe(
      takeWhile(() => !this._canceled)
    );
  }

  constructor(public name: string, public total: number) {
    this.loaded.subscribe(loaded => {
      this.progress.next(loaded / this.total);
    });
  }

  cancel() {
    this._canceled = true;
    this.status.next(UploadStatus.Canceled);
    this.onCancel.next(this);
    this.onFinish.next(this);
  }
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  supportedFormats = ['.png', '.jpeg', '.jpg']; // TODO: Get it from backend
  maxFileSize = 1024 * 1024 * 200; // 200 mb // TODO: Get it from backend

  allDone = new Subject<boolean>();

  private _showUploadMenu: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _uploadList: BehaviorSubject<FileUploadStatus[]> = new BehaviorSubject([]);
  private _newUploaded = 0;

  private _uploadQueue: Observable<any>[] = [];

  get showUploadSource(): Observable<boolean> {
    return this._showUploadMenu;
  }

  get showUpload() {
    return this._showUploadMenu.value;
  }

  get uploadListSource(): Observable<FileUploadStatus[]> {
    return this._uploadList.asObservable();
  }

  get uploadList(): FileUploadStatus[] {
    return this._uploadList.value;
  }


  constructor(private _httpClient: HttpClient) {
  }

  showList(show: boolean) {
    this._showUploadMenu.next(show);
  }

  upload(files: SpriteDto[]) {
    const uploads: FileUploadStatus[] = [];
    for (let i = 0; i < files.length; i++) {
      const obs = this.postFile(files[i]);
      // Notify on events to display on ui
      obs.onCancel.subscribe(() => {
        this.uploadList.splice(this.uploadList.indexOf(obs), 1);
        this._uploadList.next(this.uploadList.slice());
      });
      obs.onFinish.subscribe(() => {
        this._uploadList.next(this.uploadList.slice());
      });
      obs.onSuccess.subscribe(() => {
        this._newUploaded++;
      });
      uploads.push(obs);
    }

    // Start next upload in queue after finish
    const req = concat(...uploads.map(u => u.request))
      .pipe(
        finalize(() => {
          this._uploadQueue.splice(0, 1);
          if (this._uploadQueue.length > 0) {
            this._uploadQueue[0].subscribe();
          } else {
            this.allDone.next(this._newUploaded > 0);
            this._newUploaded = 0;
          }
        })
      );

    this._uploadQueue.push(req);
    // if no previously started uploads
    if (this._uploadQueue.length === 1) {
      req.subscribe();
    }

    this._uploadList.next(this.uploadList.concat(uploads));
  }

  clearAllDone() {
    this._uploadList.next(this.uploadList.filter(file => ![UploadStatus.Success, UploadStatus.Failed, UploadStatus.Canceled].includes(file.status.value)).slice());
  }

  private postFile(dto: SpriteDto): FileUploadStatus {
    const endpoint = environment.backendUrl + '/upload';
    const formData: FormData = new FormData();
    formData.append('file', dto.file, dto.file.name);
    formData.append('tags', JSON.stringify(dto.tags));

    const status = new FileUploadStatus(dto.file.name, dto.file.size);
    if (!this.isValidExtension(dto.file.name)) {
      status.status.next(UploadStatus.Failed);
      status.failReason = FailReason.UnsupportedExtension;
      status.additionalInfo = this.supportedFormats;
      status.request = of(status);
      return status;
    }
    if (!this.isSizeValid(dto.file.size)) {
      status.status.next(UploadStatus.Failed);
      status.failReason = FailReason.FileIsTooBig;
      status.additionalInfo = this.maxFileSize;
      status.request = of(status);
      return status;
    }

    status.status.next(UploadStatus.Waiting);

    status.request = this._httpClient
      .post(endpoint, formData, {
        reportProgress: true,
        observe: 'events'
      })
      .pipe(
        map((event: any) => {
          switch (event.type) {
            case HttpEventType.Sent:
              break;
            case HttpEventType.UploadProgress:
              status.status.next(UploadStatus.Progress);
              status.loaded.next(event.loaded);

              if (event.loaded > 0 && event.loaded === event.total) {
                status.status.next(UploadStatus.Success);
                status.onSuccess.next(status);
                status.onFinish.next(status);
              }
              break;

            case HttpEventType.Response:
              // status.body = event['body'];
              // TODO: Unknown state. Check it
              break;

            default:
              console.log(`Unhandled event error: event type ${event.type}`);

              status.status.next(UploadStatus.Failed);
              status.onError.next(event);
              status.onFinish.next(status);
              break;
          }

          return status;
        }),
        catchError((e) => {
          status.status.next(UploadStatus.Failed);
          status.onError.next(status);
          status.onFinish.next(status);
          return of(e);
        }),
        takeWhile(() => status.progress.value < 1)
      );

      return status;
  }

  isValidExtension(names: string | string[]) {
    if (Array.isArray(names)) {
      return names.every(name => this.supportedFormats.some(ext => name.endsWith(ext)));
    }

    return this.supportedFormats.some(ext => (names as string).endsWith(ext));
  }

  isValidMediaType(names: string | string[]) {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (Array.isArray(names)) {
      return names.every(name => validTypes.includes(name));
    }

    return validTypes.includes(names);
  }

  isSizeValid(size: number) {
    return this.maxFileSize >= size;
  }
}
