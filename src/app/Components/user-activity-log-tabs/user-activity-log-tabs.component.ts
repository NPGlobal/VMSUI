import { Component, OnInit, SecurityContext, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { UserActivityLogService } from 'src/app/Services/user-activity-log.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-user-activity-log-tabs',
  templateUrl: './user-activity-log-tabs.component.html',
  styleUrls: ['./user-activity-log-tabs.component.css']
})
export class UserActivityLogTabsComponent implements OnInit {

  vendorCode = '';
  tabName = '';
  LogsData: any;
  LogsHeader: any;
  BusinessHeader: any;
  inputParams = '';
  inputParamsForExcel = '';

  tbodyHTML: SafeHtml;
  theadHTML: SafeHtml;

  //#region Alert Modal
  @ViewChild('alertModalButton')
  alertModalButton: ElementRef;
  PopUpMessage = '';
  alertButton: any;
  //#endregion

  //#region Declaration of Form variables

  activityFiltersForm: FormGroup;
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
    private _sanitizer: DomSanitizer) { }

  ngOnInit() {

    this.alertButton = this.alertModalButton.nativeElement as ElementRef;

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

  GetInputParams(): string {
    const fromDate = this.activityFiltersForm.get('FromDate').value;
    const toDate = this.activityFiltersForm.get('ToDate').value;

    return this.vendorCode + '~' + this.tabName + '~' + fromDate + '~' + toDate;
  }

  BuildTheadHTML() {
    let html = '';

    if (this.tabName !== 'business') {
      html = '<tr>';

      const obj = this.LogsHeader[0];

      for (const value of Object.values(obj)) {
        if (value) {
          html += '<th>' + value + '</th>';
        } else {
          html += '<th></th>';
        }
      }

      html += '</tr>';
    } else {
      html += '<tr>';
      for (const value of Object.values(this.BusinessHeader[0])) {
        if (value) {
          html += value;
        } else {
          html += '<th></th>';
        }
      }
      html += '</tr><tr>';
      for (const value of Object.values(this.LogsHeader[0])) {
        if (value) {
          html += value;
        } else {
          html += '<th></th>';
        }
      }
      html += '</tr>';
    }

    // this.theadHTML = this._sanitizer.sanitize(SecurityContext.HTML, html);

    this.theadHTML = this._sanitizer.bypassSecurityTrustHtml(html);

  }

  BuildTbodyHtml() {

    let html = '';

    if (this.LogsData.length > 0) {
      for (let index = 0; index < this.LogsData.length; ++index) {
        html += '<tr>';
        const obj = this.LogsData[index];

        for (const value of Object.values(obj)) {
          if (value) {
            html += value;
          } else {
            html += '<td></td>';
          }
        }

        html += '</tr>';
      }
    } else {
      html += '<tr>' +
        '<td colspan="' + Object.keys(this.LogsHeader[0]).length.toString() + '">No records found</td>' +
        '</tr>';
    }

    // this.tbodyHTML = this._sanitizer.sanitize(SecurityContext.HTML, html);

    this.tbodyHTML = this._sanitizer.bypassSecurityTrustHtml(html);

  }

  GetVendorHistory() {

    this.submitted = true;

    this.inputParams = this.GetInputParams();

    this.inputParamsForExcel = this.inputParams + '~1';

    this.inputParams += '~0';

    this._activityLogService.GetVendorHistory(this.inputParams).subscribe(result => {

      this.submitted = false;

      if (result.Error === '') {

        if (result.data.Table[0].ResultCode === 0) {

          if (this.tabName !== 'business') {
            this.LogsHeader = result.data.Table1;
            this.LogsData = result.data.Table2;
          } else {
            this.BusinessHeader = result.data.Table1;
            this.LogsHeader = result.data.Table2;
            this.LogsData = result.data.Table3;
          }

          this.BuildTheadHTML();
          this.BuildTbodyHtml();
        } else {
          this.PopUpMessage = result.data.Table[0].ErrorMsg;
          this.alertButton.click();
        }

      } else {
        this.PopUpMessage = 'Please contact administrator';
        this.alertButton.click();
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

    const fileName = this.tabName + '_Logs_';

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

  DownloadFile(fileName: string) {
    this._activityLogService.DownloadFile(fileName, this.vendorCode).subscribe((result) => {

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

  CallParent(event: any) {
    const fileName = event.target.attributes['data-filename'].value;
    this.DownloadFile(fileName);
  }


}
