import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {FilterService} from '../../services/filter.service';
import {map} from 'rxjs/internal/operators';
import {PresetsService} from '../../services/presets.service';
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @ViewChild('searchInput') searchInput: ElementRef;

  searchExample = 'progress, background, experience';
  displayHelp = false;
  childRoute: Observable<string>;

  private _skipHelpHiding = false;

  defaultPreset = {
    search: '',
  };

  form = new FormGroup({
      search: new FormControl(),
    }
  );

  constructor(private _filterService: FilterService, private _presetService: PresetsService, private route: ActivatedRoute) {
    this.childRoute = route.params.pipe(
      map(({child}) => child)
    );
  }

  ngOnInit() {
    this.form.valueChanges
      .subscribe(ch => {
        this._presetService.updateCurrentState(this.form.value);
        this._filterService.loadSprites(this.form.value);
      });

    this._presetService.currentPreset.subscribe(preset => this.setPreset(preset));
  }

  @HostListener('window:keydown', ['$event'])
  keydown(event: KeyboardEvent) {
    // F3 and ctrl+f
    if (event.keyCode === 114 || (event.ctrlKey && event.keyCode === 70)) {
      event.preventDefault();
      this.selectSearchField(true);
    }

    if(event.keyCode === 27) {
      event.preventDefault();
      this.selectSearchField(false);
    }
  }

  @HostListener('window:click', ['$event'])
  click(event) {
    if (this._skipHelpHiding) {
      this._skipHelpHiding = false;
    } else {
      this.displayHelp = false;
    }
  }

  selectSearchField(select: boolean = true) {
    if(select)
      this.searchInput.nativeElement.select();
    else
      this.searchInput.nativeElement.blur();
  }

  setPreset(preset) {
    for (const prop in this.defaultPreset) {
      if (this.defaultPreset.hasOwnProperty(prop)) {
        this.form.controls[prop].setValue(preset[prop]);
      }
    }
  }

  showHelp() {
    this.displayHelp = !this.displayHelp;
    this._skipHelpHiding = true;
  }

  setExample() {
    this.form.controls['search'].setValue(this.searchExample);
  }

  clearSearch() {
    if (this.form.controls['search'].value)
      this.form.controls['search'].setValue(undefined);
  }
}
