import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-tags-list-dialog',
  templateUrl: './tags-list-dialog.component.html',
  styleUrls: ['./tags-list-dialog.component.scss']
})
export class TagsListDialogComponent {

  tags: string[];

  constructor(public dialogRef: MatDialogRef<TagsListDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: any) {
    this.tags = data.tags;
  }
}
