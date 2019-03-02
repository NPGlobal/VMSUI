import { Component, OnInit, Input, HostListener } from '@angular/core';
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
  isSorted = false;
  searchText = '';
  loading: boolean;
  searchByName: string;
  searchByShortName: string;
  searchByRefVendor: string;
  searchByGST: string;
  searchByPAN: string;
  searchByCreatedOn: string;

  constructor(private _http: HttpClient,
    private _vendorService: VendorService,
    private _pager: PagerService) { }

  ngOnInit() {
    this.GetVendors(this.currentPage);
  }
  GetVendors(index: number) {
    this.loading = true;
    this.currentPage = index;
    this._vendorService.GetVendors(this.currentPage, this.pageSize, this.searchText).subscribe(result => {
      this.loading = false;
      this.vendors = result.data.Vendors;
      this.totalItems = result.data.VendorsCount[0].TotalVendors;
      this.GetVendorsList();
    });
  }

  SearchVendor(searchText = '') {
    this.searchText = searchText;
    this.GetVendors(1);
  }
  SearchVendorList() {
    this.searchText = this.searchByName + '~' + this.searchByShortName + '~' + this.searchByRefVendor + '~' +
    this.searchByGST + '~' + this.searchByPAN + '~' + this.searchByCreatedOn;
    this.SearchVendor(this.searchText);
  }
  GetVendorsList() {
    this.pager = this._pager.getPager(this.totalItems, this.currentPage, this.pageSize);
    this.pagedItems = this.vendors;
  }

  SortVendorList(ColumnName: string) {
    if (ColumnName === 'ProducerName') {
      if (this.isSorted) {
        this.isSorted = !this.isSorted;
        this.pagedItems.reverse();
      } else {
        this.isSorted = !this.isSorted;
        this.pagedItems.sort((a, b) => a.VendorName.localeCompare(b.VendorName));
      }
    } else if (ColumnName === 'ShortName') {
      if (this.isSorted) {
        this.isSorted = !this.isSorted;
        this.pagedItems.reverse();
      } else {
        this.isSorted = !this.isSorted;
        this.pagedItems.reverse();
      }
    } else if (ColumnName === 'RefVendor') {
      if (this.isSorted) {
        this.isSorted = !this.isSorted;
        this.pagedItems.reverse();
      } else {
        this.isSorted = !this.isSorted;
        this.pagedItems.sort((a, b) => a.MasterVendorName.localeCompare(b.MasterVendorName));
      }
    } else {
      if (this.isSorted) {
        this.isSorted = !this.isSorted;
        this.pagedItems.reverse();
      } else {
        this.isSorted = !this.isSorted;
        this.pagedItems.sort((a, b) => a.CreatedOn.localeCompare(b.CreatedOn));
      }
    }
  }
}
