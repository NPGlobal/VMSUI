import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders } from '@angular/common/http';
import { VendorStaff } from '../Models/VendorStaff';
import { Observable } from 'rxjs';
import { OriginService } from './origin.service';
import { StaffDetails } from '../Models/staff-details';

@Injectable({
  providedIn: 'root'
})
export class VendorStaffService {

  constructor(private _http: HttpClient, private _origin: OriginService) { }
  // Used for save and update Vendor Staff Info
  SaveStaffInfo(vStaff: StaffDetails): Observable<any> {
    const apiUrl = this._origin.origin + 'api/VendorStaff/SaveVendorStaffInfo';
    return this._http.post<any>(apiUrl, vStaff);
  }
  // For Vendor Staff Department
  GetVendorsDeptStaff(companycode: string, deptcode: string, vcode: string, type: string): Observable<any> {
    const apiUrl = this._origin.origin + 'api/VendorStaff/GetVendorsDeptStaff/' + companycode + '/' + deptcode + '/' + vcode + '/' + type;
    return this._http.get<any>(apiUrl);
  }
  // For Vendor Staff Designation by Department
  GetVendorDesignation(companycode: string, deptcode: string, vcode: string, type: string): Observable<any> {
    const apiUrl = this._origin.origin + 'api/VendorStaff/GetVendorsDeptStaff/' + companycode + '/' + deptcode + '/' + vcode + '/' + type;
    return this._http.get<any>(apiUrl);
  }
  // Get Staff Information for Edit
  GetStaffDetails(id: number): Observable<any> {
    const apiUrl = this._origin.origin + 'api/VendorStaff/GetStaffDetails/' + id;
    return this._http.get<any>(apiUrl);
  }
  // Get all Staff of a Vendor
  GetVendorStaffByVendorCode(vcode: string, pageIndex: number, Limit: number, searchText?: string): Observable<any> {
    const apiUrl = this._origin.origin + 'api/VendorStaff/GetVendorStaffByVendorCode/10/'
      + vcode + '/' + pageIndex + '/' + Limit + '/' + searchText;
    return this._http.get<any>(apiUrl);
  }
}
