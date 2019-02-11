import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorService } from 'src/app/Services/vendor.service';
import { Vendor } from 'src/app/Models/vendor';

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
  searchText = '';


  constructor(private _http: HttpClient,
    private _vendorService: VendorService,
    private _pager: PagerService) { }

  ngOnInit() {
    this.GetVendors(this.currentPage);
  }
  GetVendors(index: number) {
    console.log({a: this.pageSize, b: this.currentPage, c: this.searchText});
    this.currentPage = index;
    this._vendorService.GetVendors(this.currentPage, this.pageSize, this.searchText).subscribe(result => {
      this.vendors = result.data.Vendors;
      this.totalItems = result.data.VendorsCount[0].TotalVendors;
      this.GetVendorsList();
    });
  }

  SearchVendor(searchText = '') {
    this.searchText = searchText;
    console.log(searchText);
    this.GetVendors(1);
  }

  GetVendorsList() {
    this.pager = this._pager.getPager(this.totalItems, this.currentPage, this.pageSize);
    this.pagedItems = this.vendors;
  }
}
