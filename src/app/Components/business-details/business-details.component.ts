import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorBusinessService } from 'src/app/Services/vendor-business.service';
import { VendorBusinessDetails } from 'src/app/Models/vendor-business-details';
import { BusinessProduction } from 'src/app/Models/business-production';
import { VendorService } from 'src/app/Services/vendor.service';
import { Vendor } from 'src/app/Models/vendor';
declare var $: any;

@Component({
  selector: 'app-business-details',
  templateUrl: './business-details.component.html',
  styleUrls: ['./business-details.component.css']
})
export class BusinessDetailsComponent implements OnInit {
  //#region Paging
  totalItems = 0;
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[] = [];
  //#endregion

  //#region Modal Popup and Alert
  @ViewChild('alertModalButton')
  alertModalButton: ElementRef;
  PopUpMessage: string;
  alertButton: HTMLElement;
  isError = '';

  // @ViewChild('modalOpenButton')
  // modalOpenButton: ElementRef;

  // @ViewChild('modalCloseButton')
  // modalCloseBtn: ElementRef;
  // modalCloseButton: HTMLElement;
  //#endregion

  //#region Form Variables
  vendor: Vendor;
  vendorcode: string;
  submitted = false;
  businessList: VendorBusinessDetails[]; // For added Business List
  // businessDetails: VendorBusinessDetails[]; // For data save
  searchText = '';
  CurrentFinancialYear: string;
  NextFinancialYear: string;
  DecimalPattern = '^[0-9]*[\.\]?[0-9][0-9]*$';
  isDeactVendor = false;
  isDPVendor = false;
  isJWVendor = false;
  //#endregion

  constructor(
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _pager: PagerService,
    private _vendorBusiService: VendorBusinessService,
    private _vendorService: VendorService) {
    this.CurrentFinancialYear = '';
    this.NextFinancialYear = '';
  }

  ngOnInit() {
    this.PopUpMessage = '';
    this.alertButton = this.alertModalButton.nativeElement as HTMLElement;

    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorByCode();
      this.GetVendorBusiness(this.currentPage);
    });
    // this.GetDivisions();
    if (localStorage.getItem('VendorStatus') !== 'A') {
      this.isDeactVendor = true;
    }
  }

  //#region Data Binding
  GetVendorByCode() {
    this._vendorService.GetVendorByCode(this.vendorcode).subscribe((result) => {
      this.vendor = result.data.Vendor[0];
      this.isDPVendor = this.vendor.IsDirectVendor;
      this.isJWVendor = this.vendor.IsJWVendor;
    });
  }

  GetVendorBusiness(index: number) {
    this.currentPage = index;
    this._vendorBusiService.GetVendorBusinessByVendorCode(this.vendorcode, this.currentPage, this.pageSize, this.searchText)
      .subscribe(data => {
        this.CurrentFinancialYear = data.FinancialData[0].CurrentFinancialYear;
        this.NextFinancialYear = data.FinancialData[0].NextFinancialYear;
        if (data.VendorBusiness !== undefined &&
          data.VendorBusiness.length > 0) {
          this.businessList = data.VendorBusiness;
          this.totalItems = data.VendorBusinessCount[0].TotalVendors;
          this.GetVendorsBusinessList();
        }
      });
  }

  GetVendorsBusinessList() {
    this.pager = this._pager.getPager(this.totalItems, this.currentPage, this.pageSize);
    this.businessList.filter(x => {
      x.ErrorList = [];
      x.ValueErrorList = [];
      x.QtyErrorList = [];
    });
    this.pagedItems = this.businessList;
  }
  //#endregion

  //#region Error Validator
  ValidateField(business: VendorBusinessDetails, val: string, index: number) {
    const regex = new RegExp(this.DecimalPattern);
    const success = regex.test(val);
    if ((val !== null && val !== '' && val !== undefined) && !success) {
      business.ErrorList[index] = 'Numeric value allowed';
    } else {
      business.ErrorList[index] = undefined;
    }
    if ((val !== null && val !== '' && val !== undefined) && success) {
      if (!Number(val)) {
        business.ErrorList[index] = 'Value can not be zero';
      }
    }
  }

  ValidateValues(business: VendorBusinessDetails, val: number, qty: number, index: number) {
    if ((!qty) && (!val)) {
      business.ValueErrorList[index] = undefined;
      business.ErrorList[index] = undefined;
    } else {
      if ((!val) && Number(qty) > 0) {
        business.ValueErrorList[index] = 'Value can not be empty';
        business.ErrorList[index] = 'Value can not be empty';
      } else if (Number(val) > 0 && Number(qty) > 0) {
        business.ValueErrorList[index] = undefined;
        business.ErrorList[index] = undefined;
      }
    }
  }

  ValidateQty(business: VendorBusinessDetails, val: number, qty: number, index: number) {
    if ((!qty) && (!val)) {
      business.QtyErrorList[index] = undefined;
      business.ErrorList[index] = undefined;
    } else {
      if ((!qty) && Number(val) > 0) {
        business.QtyErrorList[index] = 'Qty can not be empty';
        business.ErrorList[index] = 'Qty can not be empty';
      } else if (Number(val) > 0 && Number(qty) > 0) {
        business.QtyErrorList[index] = undefined;
        business.ErrorList[index] = undefined;
      }
    }

  }
  //#endregion

  //#region Save Form Data
  SaveBusinessDetails() {

    // Business Details
    try {
      const busProd = new BusinessProduction();
      busProd.BusinessDetails = this.businessList;

      let hasError = false;
      let valError = false;
      let QtyError = false;

      for (let count = 0; count < busProd.BusinessDetails.length; ++count) {
        const data = busProd.BusinessDetails[count];

        if (data.CurrentYearProposedDPGrnValue !== null) {
          this.ValidateField(data, data.CurrentYearProposedDPGrnValue.toString(), 0);
        }
        if (data.CurrentYearProposedDPGrnQty !== null) {
          this.ValidateField(data, data.CurrentYearProposedDPGrnQty.toString(), 1);
        }
        if (data.CurrentYearProposedJWGrnValue !== null) {
          this.ValidateField(data, data.CurrentYearProposedJWGrnValue.toString(), 2);
        }
        if (data.CurrentYearProposedJWGrnQty !== null) {
          this.ValidateField(data, data.CurrentYearProposedJWGrnQty.toString(), 3);
        }
        if (data.NextYearProposedDPGrnValue !== null) {
          this.ValidateField(data, data.NextYearProposedDPGrnValue.toString(), 4);
        }
        if (data.NextYearProposedDPGrnQty !== null) {
          this.ValidateField(data, data.NextYearProposedDPGrnQty.toString(), 5);
        }
        if (data.NextYearProposedJWGrnValue !== null) {
          this.ValidateField(data, data.NextYearProposedJWGrnValue.toString(), 6);
        }
        if (data.NextYearProposedJWGrnQty !== null) {
          this.ValidateField(data, data.NextYearProposedJWGrnQty.toString(), 7);
        }

        valError = (data.ValueErrorList.findIndex(x => x !== undefined && x.length > 0) > -1);
        QtyError = (data.QtyErrorList.findIndex(x => x !== undefined && x.length > 0) > -1);

        hasError = (data.ErrorList.findIndex(x => x !== undefined && x.length > 0) > -1);
        if (valError || QtyError || hasError) { continue; }

        this.ValidateValues(data, data.CurrentYearProposedDPGrnValue, data.CurrentYearProposedDPGrnQty, 0);
        this.ValidateQty(data, data.CurrentYearProposedDPGrnValue, data.CurrentYearProposedDPGrnQty, 1);

        this.ValidateValues(data, data.CurrentYearProposedJWGrnValue, data.CurrentYearProposedJWGrnQty, 2);
        this.ValidateQty(data, data.CurrentYearProposedJWGrnValue, data.CurrentYearProposedJWGrnQty, 3);

        this.ValidateValues(data, data.NextYearProposedDPGrnValue, data.NextYearProposedDPGrnQty, 4);
        this.ValidateQty(data, data.NextYearProposedDPGrnValue, data.NextYearProposedDPGrnQty, 5);

        this.ValidateValues(data, data.NextYearProposedJWGrnValue, data.NextYearProposedJWGrnQty, 6);
        this.ValidateQty(data, data.NextYearProposedJWGrnValue, data.NextYearProposedJWGrnQty, 7);

        valError = (data.ValueErrorList.findIndex(x => x !== undefined && x.length > 0) > -1);
        QtyError = (data.QtyErrorList.findIndex(x => x !== undefined && x.length > 0) > -1);

        hasError = (data.ErrorList.findIndex(x => x !== undefined && x.length > 0) > -1);
        if (valError || QtyError || hasError) { continue; }
      }

      const errCount = busProd.BusinessDetails.filter(function (element) {
        return (element.ErrorList.findIndex(x => x !== undefined && x.length > 0) > -1);
      }).length > 0;

      if (errCount) { return; }


      this._vendorBusiService.SaveVendorBusinessInfo(busProd).subscribe((result) => {
        if (result.data.Msg[0].ResultCode === 0) {
          this.businessList = result.data.VendorBusiness;
          this.totalItems = result.data.VendorBusinessCount[0].TotalVendors;
          this.CurrentFinancialYear = result.data.FinancialData[0].CurrentFinancialYear;
          this.NextFinancialYear = result.data.FinancialData[0].NextFinancialYear;
          this.GetVendorsBusinessList();
          this.PopUpMessage = result.data.Msg[0].Message;
        } else {
          this.PopUpMessage = result.data.Msg[0].Message;
        }
      });
    } catch {
      this.PopUpMessage = 'There are some technical error. Please contact administrator.';
    }
    this.alertButton.click();
  }
  //#endregion
}

