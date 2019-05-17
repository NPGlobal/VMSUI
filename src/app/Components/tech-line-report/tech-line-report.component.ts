import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { VendorTechLineReportService } from 'src/app/Services/vendor-tech-line-report.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tech-line-report',
  templateUrl: './tech-line-report.component.html',
  styleUrls: ['./tech-line-report.component.css']
})
export class TechLineReportComponent implements OnInit {

  TechLineReportForm: FormGroup;
  TechLineNos: any[] = [];
  TechLineReport: any[] = [];
  GetReport = '';
  DownloadURL: string;
  VendorCode: string;

  constructor(private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _techlinerpt: VendorTechLineReportService) { }

  ngOnInit() {

    this._route.parent.paramMap.subscribe((data) => {
      this.VendorCode = (data.get('code'));
      this._techlinerpt.GetTechLineNo(this.VendorCode).subscribe((result) => {
        this.TechLineNos = result;
        this.InitializeFormControls();
      });
    });
  }

  InitializeFormControls() {
    this.TechLineReportForm = this._fb.group({
      TechLineDD: ['-1']
    });
  }

  GetTechLineReports() {
    const techLineNo = this.TechLineReportForm.get('TechLineDD').value;
    if (techLineNo === '-1') {
      return;
    }
    this.GetReport = techLineNo;
    this._techlinerpt.GetTechLineReports(techLineNo, this.VendorCode).subscribe((result) => {
      this.TechLineReport = result.Table;
    });
  }

  ExportToExcel() {
    if (this.GetReport === '') {
      return;
    }
    const fileName = 'TechLineReport_' + Date.now().toString();
    this._techlinerpt.ExportTechLineReport(this.GetReport, this.VendorCode, fileName).subscribe((result) => {
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
