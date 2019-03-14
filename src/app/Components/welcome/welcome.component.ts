import { Component, OnInit } from '@angular/core';
import { OriginService } from 'src/app/Services/origin.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  constructor(private _originService: OriginService) { }

  ngOnInit() {
  }
  Redirect() {
    if (typeof (Storage) !== undefined) {
      if (sessionStorage.getItem('userid') !== null) {
        window.location.href = this._originService.GetOriginWithSubDirectoryPath() + 'vendor';
      }
    } else {
      // alert('Sorry! No Web Storage support..');
    }
  }
}
