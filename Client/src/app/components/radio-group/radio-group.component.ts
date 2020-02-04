import {Component, Input, Output, EventEmitter, OnInit, forwardRef} from '@angular/core';
import {ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR} from '@angular/forms';

export interface RadioGroupItem {
  text?: string;
  value: string;
}

@Component({
  selector: 'app-radio-group',
  templateUrl: './radio-group.component.html',
  styleUrls: ['./radio-group.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioGroupComponent),
      multi: true,
    }
  ],
})
export class RadioGroupComponent implements OnInit, ControlValueAccessor {

  static counter = 0;

  groupName: string;
  @Input() items: RadioGroupItem[] | string[];

  selectedValue: any;
  disabled: boolean;

  onChange: (any) => any;
  onTouched: (any) => any;

  constructor() {
    this.groupName = 'radio' + RadioGroupComponent.counter++;
  }

  ngOnInit(): void {
  }

  onSelectionChange(selected: Event) {
    this.writeValue(selected.target['value']);
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  writeValue(obj: any): void {
    this.selectedValue = obj;
    if (this.onChange)
      this.onChange(obj);
  }
}
