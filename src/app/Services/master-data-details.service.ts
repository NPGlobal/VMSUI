import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MasterDataDetailsService {

   // origin = 'http://172.16.7.60/VMSApi/';
    // origin = 'http://172.16.7.68/';
    origin = 'http://172.16.7.69/';
  //  origin = 'https://localhost:44372/';

  constructor(private _http: HttpClient) { }

  GetMasterDataDetails(MDHCode: string, parentCode: string): Observable<any> {
    const apiUrl = this.origin + 'api/MasterDataDetails/GetMasterDataDetails/' + MDHCode + '/' + parentCode;
    return this._http.get<any>(apiUrl);
  }
}
