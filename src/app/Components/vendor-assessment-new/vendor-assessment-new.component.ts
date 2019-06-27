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
  AssessmentScoreTable: any;
  inputParams: string;
  YearList: number[];
  MonthList: string[];
  DeptList: any;
  SelectedQuarterList: any;
  QuarterList: any;
  FromDate: any;
  ToDate: any;
  VendorName: string;
  VendorCode: string;
  ProductSpecialities: string;
  AssessmentDate: any;
  SelectedDeptList: any;
  submitted = false;
  isDataRecieved = false;
  SelectedPHList = [];
  SelectedParameters: any[] = [];

  Month: any;
  Year: any;
  AssessingPeriods: any;
  AssessingPH: string;
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

  quarterDropdownSettings = {
    singleSelection: false,
    idField: 'QuarterValue',
    textField: 'QuarterText',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    noDataAvailablePlaceholderText: 'No records'
  };
  //#endregion

  //#region  ValidationMessages
  ValidationMessages = {
    'Months': {
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
    }
  };

  formErrors = {
    'Year': '',
    'Months': '',
    'AssessingPHCode': '',
    'ShortName': ''
  };

  options = [];
  config = {};

  invalidDept = false;
  invalidQuarter = false;
  //#endregion

  constructor(private _vendorService: VendorService,
    private _vendorAssessmentService: VendorAssessmentService,
    private _fb: FormBuilder,
    private _validationMess: ValidationMessagesService) {
    this.PopUpMessage = '';
    this.MonthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.SelectedDeptList = [];
    this.QuarterList = [{ QuarterText: 'Quarter 1(Jan-Feb-Mar)', QuarterValue: 1 },
    { QuarterText: 'Quarter 2(Apr-May-Jun)', QuarterValue: 2 },
    { QuarterText: 'Quarter 3(Jul-Aug-Sep)', QuarterValue: 3 },
    { QuarterText: 'Quarter 4(Oct-Nov-Dec)', QuarterValue: 4 }];
  }

  ngOnInit() {
    this.alertButton = this.alertModalButton.nativeElement as HTMLElement;

    this.PopulateYears();
    this.InitializeFormControls();
    this.PopulateMonths();
    this.GetVendors();
    // this.GetPHList();
  }

  //#region GetData
  InitializeFormControls() {
    this.AssessmentForm = this._fb.group({
      ShortName: [null, [Validators.required]],
      Year: [null, [Validators.required]],
      PeriodType: ['M'],
      Months: [null],
      AssessingPHCode: [null, [Validators.required]]
    });
    this.SetValidationForBlocks();
  }

  PopulateMonths() {
    const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    this.AssessmentForm.get('Months').patchValue(null);

    const year = this.AssessmentForm.get('Year').value;
    const currentYear = new Date().getFullYear();
    if (year !== null && currentYear === Number(year)) {
      this.monthsToShow = new Date().getMonth() + 1;
    } else {
      this.monthsToShow = 12;
    }

    this.MonthList = monthList.splice(0, this.monthsToShow);
  }

  GetVendors() {
    this._vendorService.GetVendors(-1, -1, '').subscribe((result) => {
      this.vendorList = result.data.Vendors;
      this.options = this.vendorList.map(function (element) {
        return { VendorCode: element.VendorCode, VendorName: element.VendorName };
      });

      this.config = {
        displayKey: 'VendorName', // if objects array passed which key to be displayed defaults to description
        search: true, // true/false for the search functionlity defaults to false,
        height: '200px',
        placeholder: 'Select', // text to be displayed when no item is selected defaults to Select,
        customComparator: (ob1, ob2) => {
          if (ob1.VendorCode < ob2.VendorCode) {
            return -1;
          }
          if (ob1.VendorCode > ob2.VendorCode) {
            return 1;
          }
          return 0;
        },
        // a custom function using which user wants to sort the items. default is undefined and Array.sort() will be used in that case,
        limitTo: this.options.length, // a number thats limits the no of options displayed in the UI similar to angular's limitTo pipe
        moreText: 'more', // text to be displayed whenmore than one items are selected like Option 1 + 5 more
        noResultsFound: 'No results found!', // text to be displayed when no items are found while searching
        searchPlaceholder: 'Search', // label thats displayed in search input,
        searchOnKey: 'VendorName'
        // key on which search should be performed this will be selective search. if undefined this will be extensive search on all keys
      };
    });
  }

  GetVendorsWithDepartments() {
    this.DeptList = [];
    this.SelectedDeptList = [];

    const shortName = this.AssessmentForm.get('ShortName').value;

    this.SelectedPHList = [];
    if (shortName !== null && shortName !== undefined) {
      this._vendorService.GetVendorsWithDepartments(shortName.VendorCode).subscribe((result) => {
        this.DeptList = result.data.Table;
        this.SelectedPHList = result.data.Table1;

        if (this.SelectedPHList.length > 2) {
          this.AssessmentForm.get('AssessingPHCode').patchValue('-1');
        } else {
          this.AssessmentForm.get('AssessingPHCode').patchValue(this.SelectedPHList[0].OrgUnitCode);
        }

      });
    } else {
      this.AssessmentForm.get('AssessingPHCode').patchValue(null);
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
    this.isDataRecieved = false;
    this._vendorAssessmentService.GetVendorAssessmentReport(this.inputParams).subscribe((result) => {
      const orderQtyDetails = result.data.Table;
      this.SetOrderDetails(result.data.Table, result.data.Table1);

      this.QuantityDetails = result.data.Table2;

      this.GradeDetails1a = result.data.Table3;
      this.GradeDetails1b = result.data.Table4;
      this.GradeDetails2a = result.data.Table5;
      this.GradeDetails2b = result.data.Table6;
      this.AverageGradeDetails = result.data.Table7;

      this.AssessmentScoreTable = result.data.Table8;

      this.SelectedParameters = result.data.Table9;

      this.AssessingPeriods = result.data.Table8.map(function (element) {
        return element.AssessmentPeriod;
      }).join(',');

      this.isDataRecieved = true;
    });
  }

  SetOrderDetails(styleDetails: any[], details: any[]) {
    this.OrderDetails = [];
    for (let counterVar = 0; counterVar < styleDetails.length; ++counterVar) {
      const styleMDD = styleDetails[counterVar].StyleMDDCode;
      const deptCode = styleDetails[counterVar].DeptCode;
      const buyPlanQty = styleDetails[counterVar].BuyPlanQty;
      const batchQty = styleDetails[counterVar].BatchQty;
      const purchaseOrderQty = styleDetails[counterVar].PurchaseOrderQty;

      const existingIndex = this.OrderDetails.findIndex(x => x.StyleMDDCode === styleMDD &&
        x.DeptCode === deptCode &&
        x.BuyPlanQty === buyPlanQty &&
        x.BatchQty === batchQty &&
        x.PurchaseOrderQty === purchaseOrderQty);

      if (existingIndex === -1) {
        this.OrderDetails.push({
          IsExpanded: false,
          StyleMDDCode: styleMDD,
          DeptCode: deptCode,
          BuyPlanQty: buyPlanQty,
          BatchQty: batchQty,
          PurchaseOrderQty: purchaseOrderQty,
          QtyDetails: details.filter(function (x) {
            return x.StyleMDDCode === styleMDD &&
              x.DeptCode === deptCode;
          }).map(function (element) {
            return {
              OrderNo: element.OrderNo,
              OrderQty: element.OrderQty
            };
          })
        });
      }
    }
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

  ValidateQuarters() {
    if (this.SelectedQuarterList.length === 0) {
      this.invalidQuarter = true;
    } else { this.invalidQuarter = false; }
  }

  SetValidationForBlocks() {
    if (this.AssessmentForm.get('PeriodType').value === 'B') {
      this.AssessmentForm.get('Months').patchValue(null);
      this.AssessmentForm.get('Months').setValidators(null);
      this.AssessmentForm.get('Months').updateValueAndValidity();
    } else {
      this.invalidQuarter = false;
      this.SelectedQuarterList = [];
      this.AssessmentForm.get('Months').setValidators([Validators.required]);
      this.AssessmentForm.get('Months').updateValueAndValidity();
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
      this.ValidateQuarters();
      this.submitted = false;
      return;
    }

    this.ValidateDepartment();
    if (this.AssessmentForm.get('PeriodType').value === 'B') {
      this.ValidateQuarters();
    }

    if (this.invalidDept) {
      this.submitted = false;
      return;
    }

    if (this.invalidQuarter) {
      this.submitted = false;
      return;
    }

    let edaFrom: any;
    let edaTo: any;

    const shortName = this.AssessmentForm.get('ShortName').value.VendorCode;
    const deptCode = this.SelectedDeptList.map(function (el) {
      return el.MDDCode;
    }).join();
    const year = this.AssessmentForm.get('Year').value;
    const periodType = this.AssessmentForm.get('PeriodType').value;
    const assessingPHCode = this.AssessmentForm.get('AssessingPHCode').value;

    let periods = '';
    this.AssessingPeriods = '';

    if (periodType === 'M') {
      const month = this.AssessmentForm.get('Months').value;
      edaFrom = new Date(Number(year), Number(month), 1);
      edaTo = new Date(Number(year), Number(month) + 1, 0);

      periods += 'Month~' + this.ToDateCustomFormat(edaFrom) + '^' + this.ToDateCustomFormat(edaTo);

    } else {
      const quarterValueArr = this.SelectedQuarterList.map(function (element) {
        return element.QuarterValue;
      });
      periods += 'Block~';
      for (let counter = 0; counter < quarterValueArr.length; ++counter) {
        const quarter = quarterValueArr[counter];
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

        if (counter === quarterValueArr.length - 1) {
          periods += this.ToDateCustomFormat(edaFrom) + '^' + this.ToDateCustomFormat(edaTo);
        } else {
          periods += this.ToDateCustomFormat(edaFrom) + '^' + this.ToDateCustomFormat(edaTo) + ',';
        }
      }
    }

    this.inputParams = periods + '~' +
      shortName + '~' + deptCode + '~' + assessingPHCode;

    this.FromDate = this.ToDateCustomFormat(edaFrom);
    this.ToDate = this.ToDateCustomFormat(edaTo);
    this.AssessmentDate = this.ToDateCustomFormat(new Date());
    this.VendorCode = shortName;
    this.VendorName = this.vendorList.find(x => x.VendorCode === this.VendorCode).VendorName;
    this.Year = year;

    this.ProductSpecialities = deptCode;

    if (this.AssessmentForm.get('AssessingPHCode').value === '-1') {
      this.AssessingPH = this.SelectedPHList.filter(x => x.OrgUnitCode !== '-1').map(x => x.OrgUnitName).join(',');
    } else {
      this.AssessingPH = this.SelectedPHList.filter(x => x.OrgUnitCode === assessingPHCode).map(x => x.OrgUnitName).join(',');
    }

    this.GetVendorAssessmentReport();
  }

  ExpandCollpase(index: number) {
    this.OrderDetails[index].IsExpanded = !this.OrderDetails[index].IsExpanded;
  }
  //#endregion
}
