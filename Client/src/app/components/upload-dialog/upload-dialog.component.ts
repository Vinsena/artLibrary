import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {TagsService} from '../../services/tags.service';
import {SpriteDto} from '../../models/SpriteDto';

@Component({
  selector: 'app-upload-dialog',
  templateUrl: './upload-dialog.component.html',
  styleUrls: ['./upload-dialog.component.scss']
})
export class UploadDialogComponent implements OnInit {

  sprites: SpriteDto[];

  constructor(private _dialogRef: MatDialogRef<UploadDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: any,
              private _tagsService: TagsService) {
  }

  ngOnInit() {
    this.sprites = this.data.files.map(f => {
      return {
        file: f,
        name: f.name,
        tags: []
      } as SpriteDto;
    });
    this._tagsService.refreshTags();
  }

  cancel() {
    this._dialogRef.close(false);
  }

  upload() {
    console.log(this.sprites);
    this._dialogRef.close(this.sprites);
  }

  remove(sprite) {
    this.data.files.splice(this.sprites.indexOf(sprite), 1);
    if (this.sprites.length <= 0) {
      this._dialogRef.close();
    }
  }
}

