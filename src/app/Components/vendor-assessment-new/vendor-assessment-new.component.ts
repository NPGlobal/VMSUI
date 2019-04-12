import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Vendor } from 'src/app/Models/vendor';
import { OrgUnit } from 'src/app/Models/OrgUnit';
import { VendorService } from 'src/app/Services/vendor.service';
import { VendorAssessmentService } from 'src/app/Services/vendor-assessment.service';
import { ValidationMessagesService } from 'src/app/Services/validation-messages.service';

@Component({
  selector: 'app-vendor-assessment-new',
  templateUrl: './vendor-assessment-new.component.html',
  styleUrls: ['./vendor-assessment-new.component.css']
})
export class VendorAssessmentNewComponent implements OnInit {

  //#region  Properties Declaration
  vendorList: Vendor[];
  AllPHList: OrgUnit[];
  OrderDetails: any;
  QuantityDetails: any;
  GradeDetails1a: any;
  GradeDetails1b: any;
  GradeDetails2a: any;
  GradeDetails2b: any;
  AverageGradeDetails: any;
  inputParams: string;
  YearList: number[];
  MonthList: string[];
  DeptList: any;
  FromDate: any;
  ToDate: any;
  VendorName: string;
  VendorCode: string;
  ProductSpecialities: string;
  AssessmentDate: any;
  SelectedDeptList: any;
  submitted = false;

  Month: any;
  Year: any;
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
    'Month': {
      'required': ''
    },
    'Year': {
      'required': ''
    },
    'AssessingPHCode': {
      'required': ''
    },
    'ShortName': {
      'required': ''
    },
    'Quarter': {
      'required': ''
    },
  };

  formErrors = {
    'Year': '',
    'Month': '',
    'AssessingPHCode': '',
    'ShortName': '',
    'Quarter': ''
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

    this.PopulateYears();
    this.InitializeFormControls();
    this.GetVendors();
    this.GetPHList();
    // this.inputParams = '2018-01-01~2018-12-31~5EL~WI~DL11';
    // this.GetVendorAssessmentReport();
  }

  //#region GetData
  InitializeFormControls() {
    this.AssessmentForm = this._fb.group({
      ShortName: [null, [Validators.required]],
      Year: [null, [Validators.required]],
      PeriodType: ['M'],
      Month: [null],
      Quarter: [null],
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

      this.QuantityDetails = result.data.Table1;

      this.GradeDetails1a = result.data.Table2;
      this.GradeDetails1b = result.data.Table3;
      this.GradeDetails2a = result.data.Table4;
      this.GradeDetails2b = result.data.Table5;
      this.AverageGradeDetails = result.data.Table6;
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

  PopulateYears() {
    this.YearList = [];
    for (let i = (new Date()).getFullYear(); i >= ((new Date()).getFullYear() - 20); i--) {
      this.YearList.push(i);
    }
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

  SetValidationForBlocks() {
    if (this.AssessmentForm.get('PeriodType').value === 'B') {
      this.AssessmentForm.get('Quarter').setValidators([Validators.required]);
      this.AssessmentForm.get('Month').setValidators([]);
    } else {
      this.AssessmentForm.get('Quarter').setValidators([]);
      this.AssessmentForm.get('Month').setValidators([Validators.required]);
    }
  }
  //#endregion

  //#region GetReportDetails

  GetReport() {
    this.submitted = true;
    this.OrderDetails = [];
    if (this.AssessmentForm.invalid) {
      this.LogValidationErrors();
      this.ValidateDepartment();
      this.submitted = false;
      return;
    }

    this.ValidateDepartment();

    if (this.invalidDept) {
      this.submitted = false;
      return;
    }

    let edaFrom: any;
    let edaTo: any;

    const shortName = this.AssessmentForm.get('ShortName').value;
    const deptCode = this.SelectedDeptList.map(function (el) {
      return el.MDDCode;
    }).join();
    const year = this.AssessmentForm.get('Year').value;
    const periodType = this.AssessmentForm.get('PeriodType').value;
    const assessingPHCode = this.AssessmentForm.get('AssessingPHCode').value;

    if (periodType === 'M') {
      const month = this.AssessmentForm.get('Month').value;
      edaFrom = new Date(Number(year), Number(month), 1);
      edaTo = new Date(Number(year), Number(month) + 1, 0);
    } else {
      const quarter = Number(this.AssessmentForm.get('Quarter').value);
      switch (quarter) {
        case 1: {
          edaFrom = new Date(Number(year), 0, 1);
          edaTo = new Date(Number(year), 3, 0);
          break;
        }
        case 2: {
          edaFrom = new Date(Number(year), 3, 1);
          edaTo = new Date(Number(year), 6, 0);
          break;
        }
        case 3: {
          edaFrom = new Date(Number(year), 6, 1);
          edaTo = new Date(Number(year), 9, 0);
          break;
        }
        case 4: {
          edaFrom = new Date(Number(year), 9, 1);
          edaTo = new Date(Number(year), 12, 0);
          break;
        }
      }
    }

    this.inputParams = this.ToDateCustomFormat(edaFrom) + '~' + this.ToDateCustomFormat(edaTo) + '~' +
      shortName + '~' + deptCode + '~' + assessingPHCode;

    this.FromDate = this.ToDateCustomFormat(edaFrom);
    this.ToDate = this.ToDateCustomFormat(edaTo);
    this.AssessmentDate = this.ToDateCustomFormat(new Date());
    this.VendorCode = shortName;
    this.VendorName = this.vendorList.find(x => x.VendorCode === this.VendorCode).VendorName;

    this.ProductSpecialities = deptCode;
    console.log(this.inputParams);

    // this.GetVendorAssessmentReport();
  }

  //#endregion
}
