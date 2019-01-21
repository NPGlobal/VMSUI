import { Component, OnInit } from '@angular/core';
import { Vendor } from 'src/app/Models/vendor';

@Component({
  selector: 'app-add-vendor',
  templateUrl: './add-vendor.component.html',
  styleUrls: ['./add-vendor.component.css']
})
export class AddVendorComponent implements OnInit {

  producer: Vendor;
  constructor() { }

  ngOnInit() {
    this.producer = new Vendor;
  }


}
