import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OriginService } from './origin.service';

@Injectable({
  providedIn: 'root'
})
export class MasterDataDetailsService {

  constructor(private _http: HttpClient, private _origin: OriginService) { }

  GetMasterDataDetails(MDHCode: string, parentCode: string): Observable<any> {
    const apiUrl = this._origin.origin + 'api/MasterDataDetails/GetMasterDataDetails/' + MDHCode + '/' + parentCode;
    return this._http.get<any>(apiUrl);
  }
}
