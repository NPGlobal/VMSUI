import { Component, Input, ViewChild } from '@angular/core';
import 'node_modules/bootstrap/dist/css/bootstrap.min.css';
import { LoginComponent } from './Components/login/login.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild(LoginComponent)
  isUserLoggedIn: LoginComponent;

  title = 'Producer Management System';
}
