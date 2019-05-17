import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OriginService } from './origin.service';

@Injectable({
  providedIn: 'root'
})
export class VendorTechLineReportService {

  constructor(private _http: HttpClient, private _origin: OriginService) { }

  GetTechLineNo(vendorCode: string): Observable<any> {
    const apiUrl = this._origin.origin + 'api/VendorTechLineReport/GetTechLine/' + vendorCode;
    return this._http.get<any>(apiUrl);
  }

  GetTechLineReports(techLineNo: string, vendorCode: string): Observable<any> {
    const apiUrl = this._origin.origin + 'api/VendorTechLineReport/GetTechLineReport/' + techLineNo + '/' + vendorCode;
    return this._http.get<any>(apiUrl);
  }

  // ExportTechLineReport(techLineNo: string, vendorCode: string): Observable<any> {
  //   const apiUrl = this._origin.origin + 'api/VendorTechLineReport/ExportTechLineReport/' + techLineNo + '/' + vendorCode;
  //   return this._http.get<any>(apiUrl);
  // }

  ExportTechLineReport(TechLineNo: string, vendorCode: string, fileName: string): Observable<Blob> {
    const apiUrl = this._origin.origin + 'api/VendorTechLineReport/ExportTechLineReport';

    return this._http.get<Blob>(apiUrl,
      { params: { 'TechLineNo': TechLineNo, 'vendorCode': vendorCode, 'fileName': fileName }, responseType: 'blob' as 'json' });
  }
}
