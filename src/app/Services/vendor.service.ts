import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vendor } from '../Models/vendor';

@Injectable({
  providedIn: 'root'
})
export class VendorService {

  // origin = 'http://172.16.7.60/VMSApi/';
  origin = 'http://172.16.7.68/';
  constructor(private _http: HttpClient) { }

  GetVendors(pageIndex: number, Limit: number): Observable<any> {
    const apiUrl = this.origin + 'api/Vendor/GetVendors/' + pageIndex + '/' + Limit;
    return this._http.get<any>(apiUrl);
  }

  GetVendorByCode(code: string): Observable<any> {
    const apiUrl = this.origin + 'api/Vendor/GetVendorByCode/' + code;
    return this._http.get<any>(apiUrl);
  }

  GetPHList(): Observable<any> {
    const apiUrl = this.origin + 'api/OrgUnit/GetPHList';
    return this._http.get<any>(apiUrl);
  }

  SaveVendorPrimaryInfo(vendor: Vendor): Observable<any> {
    const apiUrl = this.origin + 'api/Vendor/SaveVendorPrimaryData';
    return this._http.post<any>(apiUrl, vendor);
  }

}
