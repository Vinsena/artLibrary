import { Component, OnInit } from '@angular/core';
import { TagsService } from '../../services/tags.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  categories: Observable<string[]>;
  tags: Observable<string[]>;

  constructor(private _tagsService: TagsService) { }

  ngOnInit() {
      this.tags = this._tagsService.tags;
      this.categories = this._tagsService.categories;
      this._tagsService.refreshTags();
  }
}
