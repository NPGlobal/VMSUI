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

  //#region Form Variables
  vendors: Vendor[];
  totalItems: number;
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: Vendor[];
  isSorted = false;
  searchText = '';
  loading: boolean;
  RegistrationClick = true;
  //#endregion

  //#region Search Parameters
  searchByName: string;
  searchByShortName: string;
  searchByRefVendor: string;
  searchByGST: string;
  searchByPAN: string;
  searchByCreatedOn: string;
  searchByStatus: string;
  //#endregion

  constructor(private _http: HttpClient,
    private _vendorService: VendorService,
    private _pager: PagerService) { }

  ngOnInit() {
    this.searchByName = '';
    this.searchByShortName = '';
    this.searchByRefVendor = '';
    this.searchByGST = '';
    this.searchByPAN = '';
    this.searchByCreatedOn = '';
    this.searchByStatus = '';

    this.GetVendors(this.currentPage);
  }

  //#region Data Binding
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

  GetVendorsList() {
    this.pager = this._pager.getPager(this.totalItems, this.currentPage, this.pageSize);
    this.pagedItems = this.vendors;
  }
  //#endregion

  //#region Searching and Sorting
  SearchVendor(searchText = '') {
    this.searchText = searchText;
    this.GetVendors(1);
  }

  SearchVendorList() {
    this.searchText = this.searchByName + '~' + this.searchByShortName + '~' + this.searchByRefVendor + '~' +
      this.searchByGST + '~' + this.searchByPAN + '~' + this.searchByCreatedOn + '~' + this.searchByStatus;
    this.SearchVendor(this.searchText);
  }

  SortVendorList(ColumnName: string) {
    switch (ColumnName) {
      case 'ProducerName': {
        this.pagedItems.sort((a, b) => a.VendorName.toUpperCase().localeCompare(b.VendorName.toUpperCase()));
        break;
      }
      case 'ShortName': {
        this.pagedItems.sort((a, b) => a.VendorCode.toUpperCase().localeCompare(b.VendorCode.toUpperCase()));
        break;
      }
      case 'RefVendor': {
        this.pagedItems.filter(x => {
          if (x.MasterVendorName === null || x.MasterVendorName === undefined) {
            x.MasterVendorName = '';
          }
        });
        this.pagedItems.sort((a, b) => a.MasterVendorName.toUpperCase().localeCompare(b.MasterVendorName.toUpperCase()));
        break;
      }
      case 'CreatedOn': {
        this.pagedItems.sort((a, b) => new Date(a.CreatedOn).getTime() - new Date(b.CreatedOn).getTime());
        break;
      }
    }
    if (!this.isSorted) {
      this.pagedItems.reverse();
    }
    this.isSorted = !this.isSorted;
  }
  //#endregion

GetVendorStatus(status: any) {
  localStorage.setItem('VendorStatus', status.toUpperCase());
 }

  //#region Open Registration Modal
  OnRegistrationClick() {
    this.RegistrationClick = !this.RegistrationClick;
  }
  //#endregion
}
