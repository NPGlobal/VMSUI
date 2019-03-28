import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  constructor(private _router: Router) { }

  ngOnInit() {
  }
  Redirect() {
    if (typeof (Storage) !== undefined) {
      if (sessionStorage.getItem('userid') !== null && sessionStorage.getItem('userid') !== undefined) {
        this._router.navigate(['/vendor']);
        // window.location.href = this._originService.GetOriginWithSubDirectoryPath() + 'vendor';
      }
    } else {
      // alert('Sorry! No Web Storage support..');
    }
  }
}
