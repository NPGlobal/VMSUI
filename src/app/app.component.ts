import { Component, OnInit, Input, ViewChild } from '@angular/core';
import 'node_modules/bootstrap/dist/css/bootstrap.min.css';
import { LoginComponent } from './Components/login/login.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  isUserLoggedIn: boolean;
  title = 'Producer Management System';
  constructor() { }

  ngOnInit() {
    const url = window.location.pathname.toLowerCase();
    if (url.indexOf('login') > 0 || url.indexOf('welcome') > 0 || url === '/') {
      this.isUserLoggedIn = false;
    } else {
      this.isUserLoggedIn = true;
    }
    // alert(url);
  }
}

// export class AppComponent implements OnInit {

//   isUserLoggedIn = false;

//   title = 'Producer Management System';
// }
