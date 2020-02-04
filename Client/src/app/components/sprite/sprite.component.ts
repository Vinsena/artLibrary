import {Component, Input, OnInit} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { TagsListDialogComponent } from '../tags-list-dialog/tags-list-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sprite',
  templateUrl: './sprite.component.html',
  styleUrls: ['./sprite.component.scss']
})
export class SpriteComponent implements OnInit {

  @Input() sprite: any;

  constructor(private _matDialog: MatDialog, private _router: Router) { }

  ngOnInit() {
  }

  expandTags() {
    this._matDialog.open(TagsListDialogComponent, {
      data: {tags: this.sprite.projectMeta.tags}
    } as MatDialogConfig);
  }
}
