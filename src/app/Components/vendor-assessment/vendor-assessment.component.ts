import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { VendorService } from 'src/app/Services/vendor.service';
import { Vendor } from 'src/app/Models/vendor';
import { OrgUnit } from 'src/app/Models/OrgUnit';
import { VendorAssessmentService } from 'src/app/Services/vendor-assessment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { count } from 'rxjs/operators';
import { ValidationMessagesService } from 'src/app/Services/validation-messages.service';

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
  GradeDetails: any;
  DeptList: any;
  FromDate: any;
  ToDate: any;
  AssessmentDate: any;
  SelectedDeptList: any;
  submitted = false;

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

  //#region MultiSelect Dropdown Settings
  deptDropdownSettings = {
    singleSelection: false,
    idField: 'MDDCode',
    textField: 'MDDName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    noDataAvailablePlaceholderText: 'No records'
  };
  //#endregion

  //#region  ValidationMessages
  ValidationMessages = {
    'EDAFrom': {
      'required': ''
    },
    'EDATo': {
      'required': ''
    },
    'AssessingPHCode': {
      'required': ''
    },
    'ShortName': {
      'required': ''
    }
  };

  formErrors = {
    'EDAFrom': '',
    'EDATo': '',
    'AssessingPHCode': '',
    'ShortName': ''
  };

  invalidDept = false;
  //#endregion

  constructor(private _vendorService: VendorService,
    private _vendorAssessmentService: VendorAssessmentService,
    private _fb: FormBuilder,
    private _validationMess: ValidationMessagesService) {
    this.PopUpMessage = '';
    this.MonthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.SelectedDeptList = [];
  }

  ngOnInit() {
    this.alertButton = this.alertModalButton.nativeElement as HTMLElement;

    this.InitializeFormControls();
    this.GetVendors();
    this.GetPHList();
  }

  //#region GetData
  InitializeFormControls() {
    this.AssessmentForm = this._fb.group({
      ShortName: [null, [Validators.required]],
      EDAFrom: [null, [Validators.required]],
      EDATo: [null, [Validators.required]],
      AssessingPHCode: [null, [Validators.required]]
    });
  }

  GetVendors() {
    this._vendorService.GetVendors(-1, -1, '').subscribe((result) => {
      this.vendorList = result.data.Vendors;
    });
  }

  GetVendorsWithDepartments() {
    this.DeptList = [];
    this.SelectedDeptList = [];

    const shortName = this.AssessmentForm.get('ShortName').value;

    if (shortName !== null) {
      this._vendorService.GetVendorsWithDepartments(shortName).subscribe((result) => {
        this.DeptList = result.data.Table;
      });
    }
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

      this.GradeDetails = result.data.Table2;
    });
  }

  ToDateCustomFormat(date: Date) {
    const month_names = ['Jan', 'Feb', 'Mar',
      'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep',
      'Oct', 'Nov', 'Dec'];

    const day = date.getDate();
    const month_index = date.getMonth();
    const year = date.getFullYear();

    return '' + day + '-' + month_names[month_index] + '-' + year;
  }

  CreateRange(range: number) {
    const array = [];

    for (let i = 1; i <= range; ++i) {
      array.push(count);
    }

    return array;
  }
  //#endregion

  //#region GetReportDetails

  GetReport() {
    this.submitted = true;
    if (this.AssessmentForm.invalid) {
      this.LogValidationErrors();
      this.ValidateDepartment();
      this.submitted = false;
      return;
    }

    const shortName = this.AssessmentForm.get('ShortName').value;
    const deptCode = this.SelectedDeptList.map(function (el) {
      return el.MDDCode;
    }).join();
    const edaFrom = this.AssessmentForm.get('EDAFrom').value;
    const edaTo = this.AssessmentForm.get('EDATo').value;
    const assessingPHCode = this.AssessmentForm.get('AssessingPHCode').value;

    this.inputParams = edaFrom + '~' + edaTo + '~' +
      shortName + '~' + deptCode + '~' + assessingPHCode;

    this.FromDate = this.ToDateCustomFormat(new Date(edaFrom));
    this.ToDate = this.ToDateCustomFormat(new Date(edaTo));
    this.AssessmentDate = this.ToDateCustomFormat(new Date());

    this.GetVendorAssessmentReport();
  }

  //#endregion

  //#region Form Validation
  LogValidationErrors(group: FormGroup = this.AssessmentForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.LogValidationErrors(abstractControl);
      } else {
        this.formErrors[key] = '';
        if (this.submitted || (abstractControl && !abstractControl.valid &&
          (abstractControl.touched || abstractControl.dirty))) {
          const messages = this.ValidationMessages[key];
          for (const errorkey in abstractControl.errors) {
            if (errorkey) {
              this.formErrors[key] += messages[errorkey] + ' ';
              break;
            }
          }
        }
      }
    });
  }

  ValidateDepartment() {
    if (this.SelectedDeptList.length === 0) {
      this.invalidDept = true;
    } else { this.invalidDept = false; }
  }
  //#endregion
}
