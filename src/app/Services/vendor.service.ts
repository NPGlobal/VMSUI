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
    const apiUrl = this.origin + 'api/Vendor/GetVendors/' + pageIndex + '/' + Limit;
    return this._http.get<any>(apiUrl);
  }

  GetVendorByCode(code: string): Observable<any> {
    const apiUrl = this.origin + 'api/Vendor/GetVendorByCode/' + code;
    return this._http.get<any>(apiUrl);
  }

  // Added by Shubhi
  SaveStaffInfo(staffForm: any): Observable<any> {
    const apiUrl = this.origin + 'SaveVendorStaff';
    return this._http.post<any>(apiUrl, staffForm);
  }
  GetVendorsDeptStaff(companycode: string, deptcode: string, type: string): Observable<any> {
    const apiUrl = this.origin + 'api/VendorStaff/GetVendorsDeptStaff/' + companycode + '/' + deptcode + '/' + type;
    return this._http.get<any>(apiUrl);
  }
  GetVendorDesignation(companycode: string, deptcode: string, type: string): Observable<any> {
    const apiUrl = this.origin + 'api/VendorStaff/GetVendorsDeptStaff/' + companycode + '/' + deptcode + '/' + type;
    return this._http.get<any>(apiUrl);
  }
}
