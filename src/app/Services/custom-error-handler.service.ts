import { Injectable, ErrorHandler } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CustomErrorHandlerService implements ErrorHandler {

  constructor() { }

  handleError(error: any): void {
    // console.warn('Handler caught an error', error);
     alert('We are facing some technical issues. Please contact administrator.');
  }
}
