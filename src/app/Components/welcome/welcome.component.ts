import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  Redirect() {
    if (typeof(Storage) !== undefined) {
      if (sessionStorage.getItem('userid') !== null) {
        const host = window.location.host.toLowerCase();
        if (host.indexOf('localhost')  === -1) {
          window.location.href = window.location.origin + '/vmsapp/vendor';
        } else {
          window.location.href = window.location.origin + '/vendor';
        }
      }
    } else {
      // alert('Sorry! No Web Storage support..');
    }
  }
}
