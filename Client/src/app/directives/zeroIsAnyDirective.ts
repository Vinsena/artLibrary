import {Directive, ElementRef, OnDestroy, Renderer2} from '@angular/core';

@Directive({
  selector: '[appZeroIsAny]'
})
export class ZeroIsAnyDirective implements OnDestroy {
  private _subscription: () => void;

  constructor(private el: ElementRef, renderer: Renderer2) {
    this._subscription = renderer.listen(el.nativeElement, 'change', (event) => {
      console.log(el);
      if (el.nativeElement.value == 0)
        el.nativeElement.value = '';
    });
  }

  ngOnDestroy(): void {
    this._subscription();
  }
}
