import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OriginService } from './origin.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

   constructor(private _http: HttpClient, private _origin: OriginService) { }

  UserAuthentication(userName: string, password: string, periodicPwd): Observable<any> {
    const apiUrl = this._origin.origin + 'api/Login/GetLogin/' + userName + '/' + password + '/' + periodicPwd;
    return this._http.get<any>(apiUrl);
  }
}
