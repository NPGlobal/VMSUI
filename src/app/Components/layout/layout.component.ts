import { Component, OnInit } from '@angular/core';
import { OriginService } from 'src/app/Services/origin.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  constructor(private _originService: OriginService) { }

  ngOnInit() {
  }

  //#region Logout and Clear Session
  LogoutUser() {
    sessionStorage.removeItem('userid');
    const host = window.location.host.toLowerCase();
    window.location.href = this._originService.GetOriginWithSubDirectoryPath();
  }
  //#endregion

  //#region Redirect user to Home page
  MoveToVendorList() {
    window.location.href = this._originService.GetOriginWithSubDirectoryPath() + 'vendor';
  }
  //#endregion
}
