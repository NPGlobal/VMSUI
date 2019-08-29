import { Component, OnInit } from '@angular/core';
import { UserActivityLogService } from 'src/app/Services/user-activity-log.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { VendorService } from 'src/app/Services/vendor.service';
import { VendorBusinessDetails } from 'src/app/Models/vendor-business-details';

@Component({
  selector: 'app-business-details-logs',
  templateUrl: './business-details-logs.component.html',
  styleUrls: ['./business-details-logs.component.css']
})
export class BusinessDetailsLogsComponent implements OnInit {

  vendorCode = '';
  tabName = '';
  tableHtml = '';
  tableHeaders = [];
  CurrentFinancialYear: string;
  NextFinancialYear: string;
  isDPVendor = false;
  isJWVendor = false;
  businessList = [];

  //#region Declaration of Form variables

  activityFiltersForm: FormGroup;
  LogsData: any;
  inputParams = '';
  inputParamsForExcel = '';
  submitted = false;

  maxDate = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
  minDate = '2017-04-01';
  //#endregion

  //#region  Validation Messages
  ValidationMessages = {
    'FromDate': {
      'required': ''
    },
    'ToDate': {
      'required': ''
    }
  };

  formErrors = {
    'FromDate': '',
    'ToDate': ''
  };
  //#endregion

  constructor(private _activityLogService: UserActivityLogService,
    private _fb: FormBuilder,
    private datepipe: DatePipe,
    private _route: ActivatedRoute,
    private _vendorService: VendorService) { }

  ngOnInit() {
    this.InitializeFormControls();

    this._route.parent.paramMap.subscribe((data) => {
      this.vendorCode = (data.get('code'));
      this.tabName = this._route.snapshot.url[0].path;
    });

  }

  InitializeFormControls() {
    this.activityFiltersForm = this._fb.group({
      ToDate: [null],
      FromDate: [null]
    });
  }

  GetVendorByCode() {
    this._vendorService.GetVendorByCode(this.vendorCode).subscribe((result) => {
      this.isDPVendor = result.data.Vendor[0].IsDirectVendor;
      this.isJWVendor = result.data.Vendor[0].IsJWVendor;
    });
  }

  GetInputParams(): string {
    const fromDate = this.activityFiltersForm.get('FromDate').value;
    const toDate = this.activityFiltersForm.get('ToDate').value;

    return this.vendorCode + '~' + this.tabName + '~' + fromDate + '~' + toDate;
  }

  BuildHtml() {

    this.tableHtml = '';

    const dpKeyArr = ['CurrentYearProposedDPGrnQty', 'CurrentYearProposedDPGrnValue',
      'NextYearProposedDPGrnQty', 'NextYearProposedDPGrnValue'];

    const jwKeyArr = ['CurrentYearProposedJWGrnQty', 'CurrentYearProposedJWGrnValue',
      'NextYearProposedJWGrnQty', 'NextYearProposedJWGrnValue'];

    for (let index = 0; index < this.businessList.length; ++index) {
      this.tableHtml += '<tr>';
      const obj = this.businessList[index];

      for (const key in obj) {
        if (dpKeyArr.findIndex(x => x === key) > -1 && !this.isDPVendor) {

        } else if (key !== '' && !this.isDPVendor) {

        } else {

        }
      }

      for (const value of Object.values(obj)) {
        this.tableHtml += value;
      }

      this.tableHtml += '</tr>';
    }

  }

  GetVendorBusinessHistory() {

    this.submitted = true;

    this.inputParams = this.GetInputParams();

    this.inputParamsForExcel = this.inputParams + '~1';

    this.inputParams += '~0';

    this._activityLogService.GetVendorHistory(this.inputParams).subscribe(result => {

      this.submitted = false;

      if (result.Error === '') {
        this.businessList = result.data.Table;

        this.BuildHtml();

      } else {
        alert('error');
      }

    });

    this.inputParams = '';
  }

  LogValidationErrors(group: FormGroup = this.activityFiltersForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);

      if (this.ValidationMessages[key] &&
        this.ValidationMessages[key].required !== undefined &&
        this.ValidationMessages[key].required !== null &&
        abstractControl.value !== null) {
        abstractControl.patchValue(abstractControl.value.trim());
      }
    });

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
            }
          }
        }
      }
    });
  }

  ExportToExcel() {

    const fileName = this.tabName + '_Logs_' + Date.now().toString();

    console.log(this.inputParamsForExcel);

    this._activityLogService.ExportLogsToExcel(this.inputParamsForExcel, fileName).subscribe((result) => {
      const newBlob = new Blob([result], { type: result.type });
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(newBlob);
        return;
      }

      const url = window.URL.createObjectURL(newBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();

      window.URL.revokeObjectURL(url);
    });

  }


}
