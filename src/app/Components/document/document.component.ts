import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorService } from 'src/app/Services/vendor.service';
// import { VendorBusinessDetails } from 'src/app/Models/vendor-business-details';
import { MasterDataDetailsService } from 'src/app/Services/master-data-details.service';
declare var $: any;

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements OnInit {
  vendorcode: string;
  totalItems: number;
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[];
  actionHeaderList: any[];
  docHeaderList: any[];
  // status = true;
  submitted = false;
  docDetailsForm: FormGroup;
  constructor(
    private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _pager: PagerService,
    private _mddService: MasterDataDetailsService,
  ) {
  }
  ngOnInit() {
    this.openModal();
    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      // this.GetVendorBusiness(this.currentPage);
    });
    this.GetActionHeader();
  }
  openModal() {
    this.docDetailsForm = this._fb.group({
      id: ['0'],
      actionCode: ['', Validators.required],
      docCode: ['', Validators.required]
    });
  }
  dismiss() {
    this.docDetailsForm = this._fb.group({
      id: ['0'],
      actionCode: [''],
      docCode: ['']
    });
    this.submitted = false;
    this.actionHeaderList = null;
  }
  GetActionHeader() {
    this._mddService.GetMasterDataDetails('VendAction', '-1').subscribe((result) => {
      this.actionHeaderList = result.data.Table;
    });
  }
  GetDocument() {
    if (this.docDetailsForm.get('actionCode').value === '') {
      this.docHeaderList = [];
      this.docDetailsForm.controls.docCode.patchValue('');
    } else {
    this._mddService.GetMasterDataDetails('VendDoc', this.docDetailsForm.get('actionCode').value)
    .subscribe((result) => {
        this.docHeaderList = result.data.Table;
        if (this.docDetailsForm.get('docCode').value !== '') {
          const strArray = this.docHeaderList.find((obj) => obj.MDDCode === this.docDetailsForm.get('docCode').value);
          if (strArray === undefined) {
            this.docDetailsForm.controls.docCode.patchValue('');
          }
        }
      });
    }
  }
}
