import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders } from '@angular/common/http';
import { VendorDocument } from '../Models/vendor-document';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendorDocumentService {

  // origin = 'http://172.16.7.60/VMSApi/';
  // origin = 'http://172.16.7.68/';
  origin = 'https://localhost:44372/';
  constructor(private _http: HttpClient) { }

  GetVendorDocumentsByVendorCode(vcode: string, pageIndex: number, Limit: number): Observable<any> {
    const apiUrl = this.origin + 'api/VendorDoc/GetVendorDocumentsByVendorCode/10/' + vcode + '/' + pageIndex + '/' + Limit;
    return this._http.get<any>(apiUrl);
  }
 // Get Vendor Business Information for Edit
 GetDocDetails(id: number): Observable<any> {
    const apiUrl = this.origin + 'api/VendorDoc/GetDocDetails/' + id;
    return this._http.get<any>(apiUrl);
  }
  SaveVendorDocuments(formData: FormData): Observable<any> {
    const apiUrl = this.origin + 'api/VendorDoc/UploadFile';

    return this._http.post(apiUrl, formData
    );
  }
}
