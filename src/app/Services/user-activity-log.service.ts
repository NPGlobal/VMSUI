import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OriginService } from './origin.service';

@Injectable({
  providedIn: 'root'
})
export class UserActivityLogService {

  constructor(private _http: HttpClient,
    private _origin: OriginService) { }

  GetVendorHistory(inputParams: string): Observable<any> {
    const apiUrl = this._origin.origin + 'api/UserActivityLog/GetVendorHistory/' + inputParams;
    return this._http.get<any>(apiUrl);
  }

  ExportLogsToExcel(inputParams: string, fileName: string): Observable<Blob> {
    const apiUrl = this._origin.origin + 'api/UserActivityLog/ExportLogsToExcel';

    return this._http.get<Blob>(apiUrl,
      { params: { 'inputParams': inputParams, 'fileName': fileName }, responseType: 'blob' as 'json' });
  }

  DownloadFile(fileName: string, vendorCode: string): Observable<Blob> {
    const url = this._origin.origin + 'api/UserActivityLog/DownloadFile/';
    return this._http.get<Blob>(url, { params: { fileName: fileName, vendorCode: vendorCode }, responseType: 'blob' as 'json' });
  }
}
