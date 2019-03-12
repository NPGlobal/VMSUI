import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  //#region Logout and Clear Session
  LogoutUser() {
    sessionStorage.removeItem('userid');
    const host = window.location.host.toLowerCase();
    if (host.indexOf('localhost') === -1) {
      window.location.href = window.location.origin + '/vmsapp';
    } else {
      window.location.href = window.location.origin;
    }
  }
  //#endregion

  //#region Redirect user to Home page
  MoveToVendorList() {
    const host = window.location.host.toLowerCase();
    if (host.indexOf('localhost') === -1) {
      window.location.href = window.location.origin + '/vmsapp/vendor';
    } else {
      window.location.href = window.location.origin + '/vendor';
    }
  }
  //#endregion
}
