import { Component, OnInit, Input, ViewChild } from '@angular/core';
import 'node_modules/bootstrap/dist/css/bootstrap.min.css';
import { LoginComponent } from './Components/login/login.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  showOutlet: boolean;
  title = 'Producer Management System';
  constructor() { }

  ngOnInit() {
    const host = window.location.host.toLowerCase();
    let url = window.location.pathname.toLowerCase();
    if (host.indexOf('localhost') === -1) {
      const replaceParm = url.split('/')[1];
      url = url.replace('/' + replaceParm, '');
    }
    if (url.indexOf('login') > 0 || url.indexOf('welcome') > 0 || url === '/') {
      this.showOutlet = true;
    } else {
      this.showOutlet = false;
    }
  }
}

// export class AppComponent implements OnInit {

//   isUserLoggedIn = false;

//   title = 'Producer Management System';
// }
