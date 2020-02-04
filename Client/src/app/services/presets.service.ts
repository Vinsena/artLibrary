import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PresetsService {

  defaultPresetName = 'New preset';

  private _presets: BehaviorSubject<any[]> = new BehaviorSubject([]);

  get presetsSource(): Observable<any[]> {
    return this._presets;
  }

  currentPreset: BehaviorSubject<any> = new BehaviorSubject({});

  private _currentState = {};

  constructor() {
    this.loadPresetsFromStorage();
   }

  savePreset(presetName: string) {
    this.savePresetImpl(presetName, Object.assign({}, this._currentState));
  }

  private savePresetImpl(presetName: string, preset: any) {
    let newPresetName = presetName || this.defaultPresetName;
    newPresetName = newPresetName.trim();
    if (newPresetName.length > 20) {
      newPresetName = newPresetName.slice(0, 20) + '...';
    }
    let count = 1;
    let temp = newPresetName;
    while (this._presets.value.find(pr => pr.presetName === temp)) {
      count++;
      temp = `${newPresetName} (${count})`;
    }
    preset['presetName'] = temp;
    const presetsCopy = this._presets.value.slice();
    presetsCopy.push(preset);
    console.log(presetsCopy);
    this._presets.next(presetsCopy);

    this.savePresetsInStorage();
  }

  private savePresetsInStorage() {
    localStorage.setItem('_presets', JSON.stringify(this._presets.value));
  }

  private loadPresetsFromStorage() {
    this._presets.next(JSON.parse(localStorage.getItem('_presets')) || []);
  }

  removePreset(index) {
    const presetsCopy = this._presets.value.slice();
    presetsCopy.splice(index, 1);
    this._presets.next(presetsCopy);
    this.savePresetsInStorage();
  }

  loadPreset(index) {
    this.currentPreset.next(this._presets.value[index]);
  }

  updateCurrentState(state: any) {
    Object.assign(this._currentState, state);
  }

  setPropertyValue(propName: string, value: any) {
    this._currentState[propName] = value;
  }
}
