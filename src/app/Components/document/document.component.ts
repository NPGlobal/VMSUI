import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorService } from 'src/app/Services/vendor.service';
// import { VendorBusinessDetails } from 'src/app/Models/vendor-business-details';
import { MasterDataDetailsService } from 'src/app/Services/master-data-details.service';
import { VendorDocumentService } from 'src/app/Services/vendor-document.service';
import { VendorDocument } from 'src/app/Models/vendor-document';
import { HttpRequest } from '@angular/common/http';
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
  vendorDocument: VendorDocument;

  uploadReq: any;

  constructor(
    private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _pager: PagerService,
    private _mddService: MasterDataDetailsService,
    private cd: ChangeDetectorRef,
    private _vendorDocService: VendorDocumentService) { }

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
      docCode: ['', Validators.required],
      uploadedFile: [null]
    });
  }

  dismiss() {
    this.docDetailsForm = this._fb.group({
      id: ['0'],
      actionCode: [''],
      docCode: [''],
      uploadedFile: [null]
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

  OnFileChange(event) {
    const files = event.target.files;
    const formData = new FormData();
    // const reader = new FileReader();
    for (const file of files) {
      formData.append(file.name, file);
    }

    this.uploadReq = formData;

    // if (event.target.files && event.target.files.length) {
    //   const [file] = event.target.files;
    //   reader.readAsDataURL(file);

    //   reader.onload = () => {
    //     this.docDetailsForm.patchValue({
    //       uploadedFile: reader.result
    //     });

    //     // need to run CD since file load runs outside of zone
    //     this.cd.markForCheck();
    //   };
    // }
  }

  SaveDocDetails() {
    // this.vendorDocument = new VendorDocument();
    // this.vendorDocument.CompanyCode = '10';
    // this.vendorDocument.UploadedFile = this.docDetailsForm.get('uploadedFile').value;
    // this.vendorDocument.VendAction_MDDCode = this.docDetailsForm.get('actioncode').value;
    // this.vendorDocument.VendDoc_MDDCode = this.docDetailsForm.get('docCode').value;
    // this.vendorDocument.VendorActionHeaderID = this.docDetailsForm.get('id').value;
    // this.vendorDocument.VendorCode = this.vendorcode;
    // this.vendorDocument.VendorDocDetailsID = this.docDetailsForm.get('id').value;

    console.log(this.vendorDocument);
    console.log(this.docDetailsForm);
    this._vendorDocService.SaveVendorDocuments(this.uploadReq)
      .subscribe((updateStatus) => {
        if (updateStatus.Error === '') {
          alert(updateStatus.status);
        }
      });
  }

}
