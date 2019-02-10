import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorService } from 'src/app/Services/vendor.service';
import { Vendor } from 'src/app/Models/vendor';
import { Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-vendor-list',
  templateUrl: './vendor-list.component.html',
  styleUrls: ['./vendor-list.component.css']
})
export class VendorListComponent implements OnInit {

  vendors: Vendor[];
  totalItems: number;
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[];


  constructor(private _http: HttpClient,
    private _vendorService: VendorService,
    private _pager: PagerService) { }

  ngOnInit() {
    this.GetVendors(this.currentPage);
  }
  GetVendors(index: number) {
    this.currentPage = index;
    this._vendorService.GetVendors(this.currentPage, this.pageSize).subscribe(result => {
      this.vendors = result.data.Vendors;
      this.totalItems = result.data.VendorsCount[0].TotalVendors;
      this.GetVendorsList();
    });
  }

  SearchVendor(searchValue : string) {
    console.log(searchValue);
    this._vendorService.GetFilteredVendor(searchValue).subscribe(result => {
      this.vendors = result.data.Vendors;
      this.totalItems = result.data.VendorsCount[0].TotalVendors;
      this.GetVendorsList();
    });
  }

  GetVendorsList() {
    this.pager = this._pager.getPager(this.totalItems, this.currentPage, this.pageSize);
    this.pagedItems = this.vendors;
  }
}
