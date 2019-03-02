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
  LogoutUser() {
    sessionStorage.removeItem('userid');
    const url = window.location.origin;
    window.location.href = url;
  }
  MoveToVendorList() {
    const url = window.location.origin + '/vendor';
    window.location.href = url;
  }
}
