import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TagsService} from "../../services/tags.service";

@Component({
  selector: 'app-upload-dialog-file',
  templateUrl: './upload-dialog-file.component.html',
  styleUrls: ['./upload-dialog-file.component.scss']
})
export class UploadDialogFileComponent implements OnInit {

  @Input() sprite;
  @Output() remove = new EventEmitter();
  src: string;
  autocompleteItems: string[] = [];

  constructor(private _tagsService: TagsService) {
  }

  ngOnInit() {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.src = reader.result as string;
    };
    reader.readAsDataURL(this.sprite.file);

    this._tagsService.tags.subscribe(tags => {
      this.autocompleteItems = tags;
    });
  }
}
