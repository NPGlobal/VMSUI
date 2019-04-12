import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OriginService } from './origin.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendorAssessmentService {

  origin: string;
  constructor(private _http: HttpClient, private _originService: OriginService) {
    this.origin = this._originService.origin;
  }

  GetVendorAssessmentReport(inputParams: string): Observable<any> {
    const url = this.origin + 'api/VendorAssessment/GetVendorAssessmentReport/' + inputParams;
    return this._http.get<any>(url);
  }
}
