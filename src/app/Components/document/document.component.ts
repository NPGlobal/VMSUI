import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorService } from 'src/app/Services/vendor.service';
// import { VendorBusinessDetails } from 'src/app/Models/vendor-business-details';
import { MasterDataDetailsService } from 'src/app/Services/master-data-details.service';
import { VendorDocumentService } from 'src/app/Services/vendor-document.service';
import { VendorDocument } from 'src/app/Models/vendor-document';
import { HttpRequest } from '@angular/common/http';
import {ValidationMessagesService } from 'src/app/Services/validation-messages.service';
declare var $: any;

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements OnInit {

  //#region Variables declaration
  vendorcode: string;
  actionHeaderList: any[];
  docHeaderList: any[];
  docDetailsForm: FormGroup;
  vendorDocument: VendorDocument;
  vendDocList: VendorDocument[];
  formData: FormData;
  submitted = false;
  inEditedMode: boolean;
  isRemarksShown: boolean;
  isDeactVendor = false;

  // pattern
  AddressAndRemarksPattern = /^[+,?-@\.\-#'&%\/\w\s]*$/;

  // for searching
  searchText = '';
  searchByAction = '';
  searchByDocument = '';
  searchByFile = '';

  // paging variables
  totalItems = 0;
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[] = [];

  // modal buttons
  @ViewChild('alertModalOpen')
  alertModalOpen: ElementRef;
  alertModalButton: HTMLElement;
  PopUpMessage: string;

  @ViewChild('modalCloseButton')
  modalCloseButton: ElementRef;
  modalCloseBtn: HTMLElement;

  @ViewChild('deleteModalClose')
  deleteModalClose: ElementRef;
  deleteModalCloseBtn: HTMLElement;

  ValidationMessages = {
    'VendAction_MDDCode': {
      'required': ''
    },
    'VendDoc_MDDCode': {
      'required': ''
    },
    'FileName': {
      'required': ''
    },
    'Remarks': {
      'required': '',
      'pattern': this._validatonMess.RemarksPattern
    }
  };

  formErrors = {
    'VendAction_MDDCode': '',
    'VendDoc_MDDCode': '',
    'FileName': '',
    'Remarks': ''
  };
  //#endregion

  constructor(
    private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _pager: PagerService,
    private _mddService: MasterDataDetailsService,
    private cd: ChangeDetectorRef,
    private _vendorDocService: VendorDocumentService,
    private _validatonMess: ValidationMessagesService) {
    this.formData = new FormData();
    this.inEditedMode = false;
    this.isRemarksShown = false;
  }

  ngOnInit() {
    this.modalCloseBtn = this.modalCloseButton.nativeElement as HTMLElement;
    this.alertModalButton = this.alertModalOpen.nativeElement as HTMLElement;
    this.deleteModalCloseBtn = this.deleteModalClose.nativeElement as HTMLElement;

    this.EditDocDetails(null);

    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorDocuments(this.currentPage);
    });

    this.GetActionHeader();
  }

  //#region Data binding
  GetVendorDocuments(index: number) {
    this.currentPage = index;
    this._vendorDocService.GetVendorDocumentsByVendorCode(this.vendorcode, this.currentPage, this.pageSize, this.searchText)
      .subscribe(result => {
        this.vendDocList = result.data.VendorDoc;
        this.totalItems = result.data.VendorDocCount[0].TotalVendors;
        this.GetVendorDocumentsList();
      });
  }

  GetVendorDocumentsList() {
    this.pager = this._pager.getPager(this.totalItems, this.currentPage, this.pageSize);
    this.pagedItems = this.vendDocList;
  }

  GetActionHeader() {
    this._mddService.GetMasterDataDetails('VendAction', '-1').subscribe((result) => {
      this.actionHeaderList = result.data.Table;
    });
  }

  GetDocument() {
    if (this.docDetailsForm.get('VendAction_MDDCode').value === null) {
      this.docHeaderList = [];
      this.docDetailsForm.get('VendDoc_MDDCode').patchValue(null);
    } else {
      this._mddService.GetMasterDataDetails('VendDoc', this.docDetailsForm.get('VendAction_MDDCode').value)
        .subscribe((result) => {
          this.docHeaderList = result.data.Table;
          if (this.docDetailsForm.get('VendDoc_MDDCode').value !== null) {
            const strArray = this.docHeaderList.find((obj) => obj.MDDCode === this.docDetailsForm.get('VendDoc_MDDCode').value);
            if (strArray === undefined) {
              this.docDetailsForm.get('VendDoc_MDDCode').patchValue(null);
            }
          }
        });
    }
  }

  ShowRemarks() {
    if (this.docDetailsForm.get('VendDoc_MDDCode').value !== null &&
      this.docDetailsForm.get('VendDoc_MDDCode').value.toUpperCase() === 'OTHE') {
      this.isRemarksShown = true;
      this.docDetailsForm.get('Remarks').setValidators([Validators.required, Validators.pattern(this.AddressAndRemarksPattern)]);
      this.docDetailsForm.get('Remarks').updateValueAndValidity();
    } else {
      this.isRemarksShown = false;
      this.docDetailsForm.get('Remarks').patchValue(null);
      this.docDetailsForm.get('Remarks').setValidators([]);
      this.docDetailsForm.get('Remarks').updateValueAndValidity();
    }
  }
  //#endregion

  //#region Data save
  OnFileChange(event) {
    this.formData = new FormData();
    const file = event.target.files[0];
    const isFileOk = this.CheckFileValidation(file);
    if (isFileOk) {
      this.formData.append(file.name, file);
    } else {
      return;
    }
  }

  EditDocDetails(docDetails: VendorDocument) {
    if (docDetails === null) {
      this.vendorDocument = new VendorDocument();
      this.vendorDocument.VendorActionHeaderID = 0;
      this.vendorDocument.VendorDocDetailsID = 0;
      this.vendorDocument.CompanyCode = '10';
      this.vendorDocument.VendorCode = this.vendorcode;
      this.vendorDocument.Status = 'A';
      this.InitializeFormControls();
    } else {
      this.inEditedMode = true;
      this.vendorDocument = JSON.parse(JSON.stringify(docDetails));
      this.InitializeFormControls();
      this.GetDocument();
    }
    this.ShowRemarks();
    this.DisableControls();
  }

  SaveDocDetails() {
    this.submitted = true;
    if (this.docDetailsForm.invalid) {
      this.LogValidationErrors();
      return;
    }

    if (!this.inEditedMode) {
      this.vendorDocument.VendAction_MDDCode = this.docDetailsForm.get('VendAction_MDDCode').value;
      this.vendorDocument.VendDoc_MDDCode = this.docDetailsForm.get('VendDoc_MDDCode').value;

      if (this.vendDocList.findIndex(x => x.VendAction_MDDCode === this.vendorDocument.VendAction_MDDCode) > -1 &&
        this.vendDocList.findIndex(x => x.VendDoc_MDDCode === this.vendorDocument.VendDoc_MDDCode) > -1) {
        this.PopUpMessage = 'This data already exists.';
        this.alertModalButton.click();
        return;
      }

    }

    this.vendorDocument.Remarks = this.docDetailsForm.get('Remarks').value;
    this.vendorDocument.CompanyCode = '10';

    this.formData.append('vendorDoc', JSON.stringify(this.vendorDocument));

    try {
      this._vendorDocService.SaveVendorDocuments(this.formData)
        .subscribe((result) => {
          if (result.data.Msg[0].Result === 0) {
            this.vendDocList = result.data.VendorDoc;
            this.totalItems = result.data.VendorDocCount[0].TotalVendors;
            this.GetVendorDocumentsList();
            this.Dismiss();
            this.modalCloseBtn.click();
            this.PopUpMessage = result.data.Msg[0].Message;
            this.alertModalButton.click();
          } else {
            this.PopUpMessage = result.data.Msg[0].Message;
            this.alertModalButton.click();
          }
        });
    } catch {
      this.PopUpMessage = 'There are some technical error. Please contact administrator.';
      this.alertModalButton.click();
    }
  }
  //#endregion

  //#region Data Delete
  DeleteDocDetails(docDetails: VendorDocument) {
    this.vendorDocument = JSON.parse(JSON.stringify(docDetails));
    this.vendorDocument.Status = 'D';
  }
  //#endregion

  //#region Form validation and initialization

  CheckFileValidation(file: File): boolean {
    let status = true;
    let fSize = 0;
    fSize = Number(file.size);

    const splitFileName = file.name.split('.');
    const extension = ['XLS', 'XLSX', 'PDF', 'DOC', 'DOCX'];
    if (extension.indexOf(splitFileName[splitFileName.length - 1].toUpperCase()) !== -1) {
    } else {
      this.PopUpMessage = 'Only ' + extension.join(', ').toLocaleLowerCase() + ' formats are allowed.';
      this.alertModalButton.click();
      this.docDetailsForm.get('FileName').patchValue(null);
      status = false;
    }
    if (fSize > 3 * 1024 * 1024) {
      this.PopUpMessage = 'File size should be less than  3 MB.';
      this.alertModalButton.click();
      this.docDetailsForm.get('FileName').patchValue(null);
      status = false;
    }
    return status;
  }

  DisableControls() {
    if (this.inEditedMode) {
      this.docDetailsForm.get('VendAction_MDDCode').disable();
      this.docDetailsForm.get('VendDoc_MDDCode').disable();
      this.docDetailsForm.get('FileName').setValidators([]);
    } else {
      this.docDetailsForm.get('VendAction_MDDCode').enable();
      this.docDetailsForm.get('VendDoc_MDDCode').enable();
      this.docDetailsForm.get('FileName').setValidators([Validators.required]);
    }
  }

  InitializeFormControls() {
    this.docDetailsForm = this._fb.group({
      VendAction_MDDCode: [this.vendorDocument.VendAction_MDDCode, Validators.required],
      VendDoc_MDDCode: [this.vendorDocument.VendDoc_MDDCode, Validators.required],
      FileName: [null, [Validators.required]],
      Remarks: [this.vendorDocument.Remarks]
    });
    if (localStorage.getItem('VendorStatus') === 'D') {
      this.isDeactVendor = true;
    }
  }

  Dismiss() {
    this.inEditedMode = false;
    this.submitted = false;
    this.docHeaderList = null;
    this.docDetailsForm.reset();
    this.vendorDocument = new VendorDocument();
    this.InitializeFormControls();
    this.LogValidationErrors();
  }

  LogValidationErrors(group: FormGroup = this.docDetailsForm): void {
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
  //#endregion

  //#region Searching functionality
  SearchDocuments(searchText = '') {
    this.searchText = searchText;
    this.GetVendorDocuments(1);
  }
  SearchDocumentList() {
    this.searchText = this.searchByAction + '~' + this.searchByDocument + '~' + this.searchByFile;
    this.SearchDocuments(this.searchText);
  }
  //#endregion

  //#region Download
  DownloadDocument(doc: VendorDocument) {
    this._vendorDocService.DownloadDocument(doc.FileName).subscribe((result) => {
      const newBlob = new Blob([result], { type: result.type });
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(newBlob);
        return;
      }

      const url = window.URL.createObjectURL(newBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = doc.FileName.substring(doc.FileName.lastIndexOf('\\') + 1);
      link.click();

      window.URL.revokeObjectURL(url);
    });
  }
  //#endregion
}
