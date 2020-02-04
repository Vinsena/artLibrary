import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'size'
})
export class SizePipe implements PipeTransform {

  transform(bytesCount: any, args?: any): any {

    const digitsAfterComma = args && args[0] || 1;
    const offset = Math.pow(10, digitsAfterComma);

    if (bytesCount > 1024 * 1024) {
      return Math.round(bytesCount / 1024 / 1024 * offset) / offset + ' mb';
    }

    if(bytesCount > 1024) {
      return Math.round(bytesCount / 1024 * offset) / offset + ' kb';
    }

    return bytesCount + ' bytes';
  }

}
