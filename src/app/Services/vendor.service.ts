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

  // Added by Shubhi
  SaveStaffInfo(VendorStaff: any): Observable<any> {
    const apiUrl = this.origin + 'api/VendorStaff/SaveVendorStaffInfo';
    return this._http.post<any>(apiUrl, VendorStaff);
  }
  SaveTechInfo(VendorTech: any): Observable<any> {
    const apiUrl = this.origin + 'api/VendorTech/SaveVendorTechInfo';
    return this._http.post<any>(apiUrl, VendorTech);
  }
  GetVendorsDeptStaff(companycode: string, deptcode: string, type: string): Observable<any> {
    const apiUrl = this.origin + 'api/VendorStaff/GetVendorsDeptStaff/' + companycode + '/' + deptcode + '/' + type;
    return this._http.get<any>(apiUrl);
  }

  GetVendorDesignation(companycode: string, deptcode: string, type: string): Observable<any> {
    const apiUrl = this.origin + 'api/VendorStaff/GetVendorsDeptStaff/' + companycode + '/' + deptcode + '/' + type;
    return this._http.get<any>(apiUrl);
  }

  GetVendorDeptTech(companycode: string, deptcode: string, type: string): Observable<any> {
    const apiUrl = this.origin + 'api/VendorTech/GetVendorsDeptTech/' + companycode + '/' + deptcode + '/' + type;
    return this._http.get<any>(apiUrl);
  }

  GetVendorTechSpec(companycode: string, deptcode: string, type: string): Observable<any> {
    const apiUrl = this.origin + 'api/VendorTech/GetVendorsDeptTech/' + companycode + '/' + deptcode + '/' + type;
    return this._http.get<any>(apiUrl);
  }

  GetVendorStaffByVendorCode(vcode:string, pageIndex: number, Limit: number): Observable<any> {
    const apiUrl = this.origin + 'api/VendorStaff/GetVendorStaffList/10/'  + vcode + '/'+ pageIndex + '/' + Limit;
    return this._http.get<any>(apiUrl);
  }

  GetVendorTechByVendorCode(vcode:string, pageIndex: number, Limit: number): Observable<any> {
    const apiUrl = this.origin + 'api/VendorTech/GetVendorTechList/10/'  + vcode + '/'+ pageIndex + '/' + Limit;
    return this._http.get<any>(apiUrl);
  }
}
