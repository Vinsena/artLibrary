import {Component, OnInit, HostListener} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PresetsService} from '../../services/presets.service';
import {Observable} from 'rxjs/index';
import {FilterService} from '../../services/filter.service';

export enum SimpleState {
  Any = 'Any',
  Yes = 'Yes',
  No = 'No'
}

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent implements OnInit {

  presetName: string;
  presets: Observable<any[]>;

  alphaFilterItems = [SimpleState.Any, SimpleState.Yes, SimpleState.No];
  sliceFilterItems = [SimpleState.Any, SimpleState.Yes, SimpleState.No];

  form = new FormGroup({
      xMin: new FormControl('', [Validators.min(0)]),
      xMax: new FormControl('', [Validators.min(0)]),
      yMin: new FormControl('', [Validators.min(0)]),
      yMax: new FormControl('', [Validators.min(0)]),
      alpha: new FormControl(''),
      //slice: new FormControl(''),
    }
  );

  defaultPreset = {
    alpha: SimpleState.Any,
    //slice: SimpleState.Any,
    xMin: '',
    xMax: '',
    yMin: '',
    yMax: '',
  };

  constructor(private _presetService: PresetsService, private _filterService: FilterService) {
    this.resetForm();
    this.presets = _presetService.presetsSource;
  }

  ngOnInit() {
    this.form.valueChanges.subscribe(() => this.onChange());

    this._presetService.currentPreset.subscribe(preset => this.setPreset(preset));
  }

  @HostListener('window:keydown', ['$event'])
  keydown(event: KeyboardEvent) {
    // ctrl+S
    if (event.ctrlKey && event.keyCode === 83) {
      this.savePreset();
      event.preventDefault();
    }
  }

  onChange() {
    console.log('changed');
    this._filterService.loadSprites(this.form.value);
  }

  savePreset() {
    const preset = this.form.value;
    this._presetService.updateCurrentState(preset);
    this._presetService.savePreset(this.presetName);
    this.presetName = undefined;
  }

  setPreset(preset) {
    for (const prop in this.defaultPreset) {
      if (preset.hasOwnProperty(prop)) {
        this.form.controls[prop].setValue(preset[prop]);
      }
    }
  }

  loadPreset(index) {
    this._presetService.loadPreset(index);
  }

  removePreset(index) {
    this._presetService.removePreset(index);
  }

  resetForm() {
    this.setPreset(this.defaultPreset);
  }
}
