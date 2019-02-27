import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  // origin = 'http://172.16.7.60/VMSApi/';
  // origin = 'http://172.16.7.68/';
  // origin = 'http://172.16.7.69/';
  origin = 'https://localhost:44372/';
  constructor(private _http: HttpClient) { }

  UserAuthentication(userName: string, password: string, periodicPwd): Observable<any> {
    const apiUrl = this.origin + 'api/Login/GetLogin/' + userName + '/' + password + '/' + periodicPwd;
    return this._http.get<any>(apiUrl);
  }
}
