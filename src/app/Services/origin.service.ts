import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OriginService {

  origin = 'http://172.16.7.60/VMSApi/';
  // origin = 'http://172.16.7.68/';
  // origin = 'http://172.16.7.69/';
  // origin = 'https://localhost:44372/';

  constructor() { }
}
