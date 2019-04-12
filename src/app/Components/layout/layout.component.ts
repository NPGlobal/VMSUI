import { Component, OnInit } from '@angular/core';
import { OriginService } from 'src/app/Services/origin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  constructor(private _originService: OriginService,
              private _router: Router) { }

  ngOnInit() {
  }

  //#region Logout and Clear Session
  LogoutUser() {
    sessionStorage.removeItem('userid');
    this._router.navigate(['/login']);
    // const host = window.location.host.toLowerCase();
    // window.location.href = this._originService.GetOriginWithSubDirectoryPath();
  }
  //#endregion

  //#region Redirect user to Home page
  MoveToVendorList() {
    // window.location.href = this._originService.GetOriginWithSubDirectoryPath() + 'vendor';
    this._router.navigate(['/vendor']);
  }
  //#endregion
}
