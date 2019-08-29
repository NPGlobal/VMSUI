import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { VendorService } from 'src/app/Services/vendor.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-vendor',
  templateUrl: './add-vendor.component.html',
  styleUrls: ['./add-vendor.component.css']
})
export class AddVendorComponent implements OnInit {

  vendorForm: FormGroup;
  vendorCode: string;
  vendorName: string;

  get VendorCode() {
    return this.vendorCode;
  }

  constructor(private _fb: FormBuilder,
    private _vendorService: VendorService,
    private _router: ActivatedRoute) { }

  ngOnInit() {
    this._router.paramMap.subscribe((data) => {
      this.vendorCode = data.get('code');
    });

    this.GetVendorByCode();
  }

  GetVendorByCode() {
    this._vendorService.GetVendorByCode(this.vendorCode).subscribe((result) => {
      if (result.error === '') {
        localStorage.setItem('VendorName', result.data.Vendor[0].VendorName);
      }

      this.vendorName = localStorage.getItem('VendorName');
    });
  }

}
