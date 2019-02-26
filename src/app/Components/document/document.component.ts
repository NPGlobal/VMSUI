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
  actionHeaderList: any[];
  docHeaderList: any[];
  submitted = false;
  docDetailsForm: FormGroup;
  vendorDocument: VendorDocument;
  searchText = '';
  vendDocList: VendorDocument[];

  // paging variables
  totalItems = 0;
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[] = [];

  formData: FormData;

  constructor(
    private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _pager: PagerService,
    private _mddService: MasterDataDetailsService,
    private cd: ChangeDetectorRef,
    private _vendorDocService: VendorDocumentService) {
    this.formData = new FormData();
    this.CreateNewVendorDocument();
  }

  ngOnInit() {
    this.openModal();
    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorDocuments(this.currentPage);
    });
    this.GetActionHeader();
  }

  CreateNewVendorDocument() {
    this.vendorDocument = new VendorDocument();
    this.vendorDocument.VendorActionHeaderID = 0;
    this.vendorDocument.VendorDocDetailsID = 0;
    this.vendorDocument.VendDoc_MDDCode = '';
    this.vendorDocument.VendAction_MDDCode = '';
    this.vendorDocument.FileName = '';
  }

  GetVendorDocuments(index: number) {
    this.currentPage = index;
    this._vendorDocService.GetVendorDocumentsByVendorCode(this.vendorcode, this.currentPage, this.pageSize, this.searchText)
    .subscribe(result => {
      if (result.data.VendorDoc.length > 0) {
        this.vendDocList = result.data.VendorDoc;
        this.totalItems = result.data.VendorDocCount[0].TotalVendors;
        this.GetVendorDocumentsList();
      }
    });
  }

  GetVendorDocumentsList() {
    this.pager = this._pager.getPager(this.totalItems, this.currentPage, this.pageSize);
    this.pagedItems = this.vendDocList;
  }

  InitializeFormControls() {
    this.docDetailsForm = this._fb.group({
      VendorActionHeaderID: [this.vendorDocument.VendorActionHeaderID],
      VendorDocDetailsID: [this.vendorDocument.VendorDocDetailsID],
      VendAction_MDDCode: [this.vendorDocument.VendAction_MDDCode, Validators.required],
      VendDoc_MDDCode: [this.vendorDocument.VendDoc_MDDCode, Validators.required],
      FileName: [this.vendorDocument.FileName]
    });
  }

  openModal() {
    this.InitializeFormControls();
  }

  dismiss() {
    this.CreateNewVendorDocument();
    this.InitializeFormControls();
    this.submitted = false;
    this.docHeaderList = null;
  }

  GetActionHeader() {
    this._mddService.GetMasterDataDetails('VendAction', '-1').subscribe((result) => {
      this.actionHeaderList = result.data.Table;
    });
  }

  GetDocument() {
    if (this.docDetailsForm.get('VendAction_MDDCode').value === '') {
      this.docHeaderList = [];
      this.docDetailsForm.controls.VendDoc_MDDCode.patchValue('');
    } else {
      this._mddService.GetMasterDataDetails('VendDoc', this.docDetailsForm.get('VendAction_MDDCode').value)
        .subscribe((result) => {
          this.docHeaderList = result.data.Table;
          if (this.docDetailsForm.get('VendDoc_MDDCode').value !== '') {
            const strArray = this.docHeaderList.find((obj) => obj.MDDCode === this.docDetailsForm.get('VendDoc_MDDCode').value);
            if (strArray === undefined) {
              this.docDetailsForm.controls.docCode.patchValue('');
            }
          }
        });
    }
  }

  OnFileChange(event) {
    const files = event.target.files;
    for (const file of files) {
      this.formData.append(file.name, file);
    }
  }

  SaveDocDetails() {
    this.submitted = true;
    if (this.docDetailsForm.invalid) {
      return;
    }
    // console.log(this.docDetailsForm.value);
    this.vendorDocument = new VendorDocument();
    this.vendorDocument.CompanyCode = '10';
    this.vendorDocument.VendAction_MDDCode = this.docDetailsForm.get('VendAction_MDDCode').value;
    this.vendorDocument.VendDoc_MDDCode = this.docDetailsForm.get('VendDoc_MDDCode').value;
    this.vendorDocument.VendorActionHeaderID = this.docDetailsForm.get('VendorActionHeaderID').value;
    this.vendorDocument.VendorCode = this.vendorcode;
    this.vendorDocument.VendorDocDetailsID = this.docDetailsForm.get('VendorDocDetailsID').value;
    this.vendorDocument.CreatedBy = 999999;

    this.formData.append('vendorDoc', JSON.stringify(this.vendorDocument));

    try {
      this._vendorDocService.SaveVendorDocuments(this.formData)
      .subscribe((updateStatus) => {
        if (updateStatus.Error === '') {
          this.vendDocList = updateStatus.data.VendorDoc;
          this.totalItems = updateStatus.data.VendorDocCount[0].TotalVendors;
          this.GetVendorDocumentsList();
          alert(updateStatus.data.Msg[0].Message);
          this.dismiss();
          $('#myModal').modal('toggle');
        } else {
          alert('There are some technical error. Please contact administrator.');
        }
      });
    } catch {
      alert('There are some technical error. Please contact administrator.');
    }
  }
  GetDocDetails(vDoc: VendorDocument) {
    this.docDetailsForm = this._fb.group({
      VendorActionHeaderID: [vDoc.VendorActionHeaderID],
      VendorDocDetailsID: [vDoc.VendorDocDetailsID],
      VendAction_MDDCode: [vDoc.VendAction_MDDCode, Validators.required],
      VendDoc_MDDCode: [vDoc.VendDoc_MDDCode, Validators.required] // ,
      // FileName: [vDoc.FileName, Validators.required]
    });
    this.GetDocument();
  }

  SearchDocuments(searchText = '') {
    this.searchText = searchText;
    this.GetVendorDocuments(1);
  }
  // GetDocDetails(vDoc: VendorDocument) {
  //   const x =  vDoc.VendorDocDetailsID;
  //   this._vendorDocService.GetDocDetails(x).subscribe((data) => {
  //      this.docDetailsForm = this._fb.group({
  //        VendorActionHeaderID: [data.Table[0].VendorActionHeaderID],
  //        VendorDocDetailsID: [data.Table[0].VendorDocDetailsID],
  //        VendAction_MDDCode: [data.Table[0].VendAction_MDDCode, Validators.required],
  //        VendDoc_MDDCode: [data.Table[0].VendDoc_MDDCode, Validators.required] // ,
  //        // FileName: [data.Table[0].FileName, Validators.required]
  //      });
  //      this.GetDocument();
  //    });
  // }
}
