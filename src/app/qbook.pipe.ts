import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'qbook'
})
export class QbookPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
