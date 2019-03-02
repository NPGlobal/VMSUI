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
    // debugger;
    if (typeof(Storage) !== undefined) {
      if (sessionStorage.getItem('userid') !== null) {
        const url = window.location.origin + '/vendor';
        // alert('hi');
        window.location.href = url;
      }
    } else {
      // alert('Sorry! No Web Storage support..');
    }
  }
}
