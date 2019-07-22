import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OriginService {

  // origin = 'http://172.16.7.60/VMSApi/';
  origin = 'http://172.16.7.60/PMSApis/';
  // origin = 'http://172.16.7.68/';
  // origin = 'http://172.16.7.69/';
  // origin = 'https://localhost:44372/';

  constructor() { }
  GetOriginWithSubDirectoryPath(): string {
    const host = window.location.host.toLowerCase();
    let path = '';
    if (host.indexOf('localhost') === -1) {
      path = window.location.origin + '/' + window.location.pathname.split('/')[1] + '/';
    } else {
      path = window.location.origin + '/';
    }
    return path;
  } 
}
