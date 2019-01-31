import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendorService {

  origin = 'http://172.16.7.68/';
  constructor(private _http: HttpClient) { }

  GetVendors(pageIndex: number, Limit: number): Observable<any> {
    const apiUrl = this.origin + 'v1/Vendor/GetVendors/' + pageIndex + '/' + Limit;
    return this._http.get<any>(apiUrl);
  }

  GetVendorByCode(code: string): Observable<any> {
    const apiUrl = this.origin + 'v1/Vendor/GetVendorByCode/' + code;
    return this._http.get<any>(apiUrl);
  }

  //Added by Shubhi
  SaveStaffInfo(staffForm: any): Observable<any> {
    const apiUrl = this.origin+'SaveVendorStaff';
    return this._http.post<any>(apiUrl,staffForm);
  }

}
