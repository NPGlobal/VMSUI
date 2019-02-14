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

  SaveVendorDocuments(vendorDocObj: any, formData: FormData): Observable<any> {
    const apiUrl = this.origin + 'api/VendorDoc/UploadFile';
    const uploadReq = new HttpRequest('POST', apiUrl, vendorDocObj, {
      reportProgress: true,
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Body': formData
    });

    return this._http.post(apiUrl, vendorDocObj,)
    return this._http.request<any>(uploadReq);
  }
}
