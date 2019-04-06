import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { VendorService } from 'src/app/Services/vendor.service';
import { Vendor } from 'src/app/Models/vendor';
import { OrgUnit } from 'src/app/Models/OrgUnit';
import { VendorAssessmentService } from 'src/app/Services/vendor-assessment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { count } from 'rxjs/operators';

@Component({
  selector: 'app-vendor-assessment',
  templateUrl: './vendor-assessment.component.html',
  styleUrls: ['./vendor-assessment.component.css']
})
export class VendorAssessmentComponent implements OnInit {

  //#region  Properties Declaration
  vendorList: Vendor[];
  AllPHList: OrgUnit[];
  OrderDetails: any;
  inputParams: string;
  YearList: number[];
  MonthList: string[];

  TotalPieces: number;
  TotalOrders: number;
  GRNQtyAsPerDeliveryDate: number;
  TotalDelayedPieces: number;
  TotalGRNQty: number;
  DifferenceQty: number;
  DifferenceQtyWithResp: number;
  //#endregion

  //#region  Form Variables
  AssessmentForm: FormGroup;
  //#endregion

  //#region  Modal Variables
  @ViewChild('alertModalButton')
  alertModalButton: ElementRef;
  PopUpMessage: string;
  alertButton: any;
  monthsToShow: number;
  //#endregion

  constructor(private _vendorService: VendorService,
    private _vendorAssessmentService: VendorAssessmentService,
    private _fb: FormBuilder) {
    this.PopUpMessage = '';
    this.MonthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  }

  ngOnInit() {
    this.alertButton = this.alertModalButton.nativeElement as HTMLElement;

    this.InitializeFormControls();
    this.PopulateYears();
    this.GetVendors();
    this.GetPHList();

    this.GetVendorAssessmentReport();
  }

  //#region GetData
  InitializeFormControls() {
    this.AssessmentForm = this._fb.group({
      EDAYear: [null, [Validators.required]],
      EDAMonth: [null]
    });
  }

  GetVendors() {
    this._vendorService.GetVendors(-1, -1, '').subscribe((result) => {
      this.vendorList = result.data.Vendors;
    });
  }

  GetPHList() {
    this._vendorService.GetPHList().subscribe((result) => {
      this.AllPHList = result.data.Table.filter(function (el) {
        return el.OrgUnitTypeCode === 'P';
      });
    });
  }

  GetVendorAssessmentReport() {
    this._vendorAssessmentService.GetVendorAssessmentReport(this.inputParams).subscribe((result) => {
      this.OrderDetails = result.data.Table;

      this.TotalPieces = result.data.Table1[0].TotalPieces;
      this.TotalOrders = result.data.Table1[0].TotalOrders;
      this.GRNQtyAsPerDeliveryDate = result.data.Table1[0].GRNQtyAsPerDeliveryDate;
      this.TotalDelayedPieces = result.data.Table1[0].TotalDelayedPieces;
      this.TotalGRNQty = result.data.Table1[0].TotalGRNQty;
      this.DifferenceQty = result.data.Table1[0].DifferenceQty;
      this.DifferenceQtyWithResp = result.data.Table1[0].DifferenceQtyWithResp;
    });
  }

  PopulateYears() {
    this.YearList = [];
    for (let i = (new Date()).getFullYear(); i >= ((new Date()).getFullYear() - 20); i--) {
      this.YearList.push(i);
    }
  }

  PopulateMonths() {
    const year = this.AssessmentForm.get('EDAYear').value;
    this.AssessmentForm.get('EDAMonth').patchValue(null);
    if (year === null) {
      this.monthsToShow = 0;
    } else {
      const currentMonth = (new Date()).getMonth();
      const currentYear = (new Date()).getFullYear();

      this.monthsToShow = year === currentYear.toString() ? (currentMonth + 1) : 12;
    }
  }

  CreateRange(range: number) {
    const array = [];

    for (let i = 1; i <= range; ++i) {
      array.push(count);
    }

    return array;
  }
  //#endregion

}
