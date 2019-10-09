import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-activity-log',
  templateUrl: './user-activity-log.component.html',
  styleUrls: ['./user-activity-log.component.css']
})
export class UserActivityLogComponent implements OnInit {

  //#region Declaration of variables
  vendorName = '';
  ashuBackLink = '';
  //#endregion

  constructor(private router: Router) { }

  ngOnInit() {
    this.vendorName = localStorage.getItem('VendorName');
    this.ashuBackLink = '/' + this.router.url.split('/')[1] + '/' + this.router.url.split('/')[2] + '/personal';
  }

}
