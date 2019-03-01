import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders } from '@angular/common/http';
import { VendorDocument } from '../Models/vendor-document';
import { Observable } from 'rxjs';
import { OriginService } from './origin.service';

@Injectable({
  providedIn: 'root'
})
export class VendorBusinessService {

  constructor(private _http: HttpClient, private _origin: OriginService) { }

  // Used for save and update Vendor Business Info
  SaveVendorBusinessInfo(VendorBusiness: any): Observable<any> {
    const apiUrl = this._origin.origin + 'api/VendorBusiness/SaveVendorBusinessInfo';
    return this._http.post<any>(apiUrl, VendorBusiness);
  }
  // Get Vendor Business Information for Edit
  GetBusinessDetails(id: number): Observable<any> {
    const apiUrl = this._origin.origin + 'api/VendorBusiness/GetBusinessDetails/' + id;
    return this._http.get<any>(apiUrl);
  }
  // Get all Staff of a Vendor
  GetVendorBusinessByVendorCode(vcode: string, pageIndex: number, Limit: number, searchText?: string): Observable<any> {
    const apiUrl = this._origin.origin + 'api/VendorBusiness/GetVendorBusinessByVendorCode/10/'
    + vcode + '/' + pageIndex + '/' + Limit + '/' + searchText;
    return this._http.get<any>(apiUrl);
  }
}
