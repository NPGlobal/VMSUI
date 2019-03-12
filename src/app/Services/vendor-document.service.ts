import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders, HttpParams } from '@angular/common/http';
import { VendorDocument } from '../Models/vendor-document';
import { Observable } from 'rxjs';
import { OriginService } from './origin.service';

@Injectable({
  providedIn: 'root'
})
export class VendorDocumentService {

  constructor(private _http: HttpClient, private _origin: OriginService) { }

  GetVendorDocumentsByVendorCode(vcode: string, pageIndex: number, Limit: number, searchText?: string): Observable<any> {
    const apiUrl = this._origin.origin + 'api/VendorDoc/GetVendorDocumentsByVendorCode/10/'
      + vcode + '/' + pageIndex + '/' + Limit + '/' + searchText;
    return this._http.get<any>(apiUrl);
  }
  // Get Vendor Business Information for Edit
  GetDocDetails(id: number): Observable<any> {
    const apiUrl = this._origin.origin + 'api/VendorDoc/GetDocDetails/' + id;
    return this._http.get<any>(apiUrl);
  }
  SaveVendorDocuments(formData: FormData): Observable<any> {
    const apiUrl = this._origin.origin + 'api/VendorDoc/UploadFile';

    return this._http.post(apiUrl, formData
    );
  }
  DownloadDocument(fileName: string): Observable<Blob> {
    const apiUrl = this._origin.origin + 'api/VendorDoc/DownloadFile';

    return this._http.get<Blob>(apiUrl, { params: { 'filename': fileName }, responseType: 'blob' as 'json' });
  }
}
