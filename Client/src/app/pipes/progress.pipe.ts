import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'progress'
})
export class ProgressPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return value >= 1 ? 'Done!' : (Math.round(value * 100) + '%');
  }

}
