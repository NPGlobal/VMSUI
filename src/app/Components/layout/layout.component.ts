import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, AfterViewInit {

  IsLogVisible = false;
  VendorCode = '';

  subscription: Subscription;

  constructor(private _router: Router) { }

  ngOnInit() {

  }

  ngAfterViewInit() {

  }
  //#region Logout and Clear Session
  LogoutUser() {
    sessionStorage.removeItem('userid');
    sessionStorage.clear();
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

  changeOfRoutes(event) {
    const url = this._router.url;
    if (url && url.split('/')[2]) {
      this.VendorCode = url.split('/')[2];
      this.IsLogVisible = true;
    } else {
      this.IsLogVisible = false;
    }
  }
  //#endregion
}
