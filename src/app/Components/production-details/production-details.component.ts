import { Component, OnInit, SimpleChanges, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorService } from 'src/app/Services/vendor.service';
import { VendorProduction } from 'src/app/Models/VendorProduction';
import { MasterDataDetailsService } from 'src/app/Services/master-data-details.service';
import { MasterDataDetails } from 'src/app/Models/master-data-details';
import { ValidationMessagesService } from 'src/app/Services/validation-messages.service';

@Component({
  selector: 'app-production-details',
  templateUrl: './production-details.component.html',
  styleUrls: ['./production-details.component.css']
})
export class ProductionDetailsComponent implements OnInit {
  constructor(
    private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _pager: PagerService,
    private _mddService: MasterDataDetailsService,
    private _validationMess: ValidationMessagesService
  ) { }

  //#region paging variables
  totalItems = 0;
  searchText = '';
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[] = [];
  //#endregion

  //#region Patterns
  PhonePattern = '^[0-9]{10}$';
  PinPattern = '^[1-9][0-9]{5}$';
  // CityPattern = '^[A-Za-z]+$';
  AddressAndRemarksPattern = /^[+,?-@()\.\-#'&%\/\w\s]*$/;
  NamePattern = /^[@\.\-'&()_\/\w\s]*$/;
  NumericPattern = '^[0-9]*$';
  DecimalPattern = '^[0-9]*[\.\]?[0-9][0-9]*$';
  AlphabetPattern = '^[a-zA-Z ]*[\.\]?[a-zA-Z ]*$';
  isDeactVendor = false;
  // NumericRange = '([0-9]|[1-8][0-9]|9[0-9]|[1-4][0-9]{2}|500)';
  //#endregion

  //#region Form Variables
  vendorcode: string;
  VendorProductionList: VendorProduction[]; // For added Production List
  VendorProduction: VendorProduction; // For form value save and update
  ProductionDetailsForm: FormGroup;
  submitted = false;
  StateList: MasterDataDetails[] = [];
  //#endregion

  //#region Search Parameters
  searchBySubContName: string;
  searchBySubContNature: string;
  searchByApprProdUnits: string;
  searchByMonCapacity: string;
  searchByMinCapacity: string;
  searchByLeanMonths: string;
  searchByLeanCapacity: string;
  //#endregion

  //#region Validation Messages
  ValidationMessages = {
    'ApprovedProductionCount': {
      'required': '',
      'pattern': this._validationMess.NumericPattern
    },
    'SubContractingName': {
      'required': '',
      'pattern': this._validationMess.NamePattern
    },
    'NatureOfSubContracting': {
      'required': '',
      'pattern': this._validationMess.NamePattern
    },
    'MonthlyCapacity': {
      'required': '',
      'pattern': this._validationMess.NumericPattern
    },
    'MinimalCapacity': {
      'required': '',
      'pattern': this._validationMess.NumericPattern
    },
    'LeanMonths': {
      'required': '',
      'pattern': this._validationMess.NumericPattern,
      'max': this._validationMess.MaxLeanMonth
    },
    'LeanCapacity': {
      'required': '',
      'pattern': this._validationMess.NumericPattern
    },
    'Address1': {
      'required': '',
      'pattern': this._validationMess.AddressPattern
    },
    'Address2': {
      'pattern': this._validationMess.AddressPattern
    },
    'Address3': {
      'pattern': this._validationMess.AddressPattern
    },
    'Phone': {
      'required': '',
      'pattern': this._validationMess.PhonePattern
    },
    'StateCode': {
      'required': ''
    },
    'CityCode': {
      'required': '',
      'pattern': this._validationMess.CityPattern
    },
    'Pin': {
      'required': '',
      'pattern': this._validationMess.PinPattern
    },
    'Remarks': {
      'pattern': this._validationMess.RemarksPattern
    }
  };

  formErrors = {
    'ApprovedProductionCount': '',
    'SubContractingName': '',
    'NatureOfSubContracting': '',
    'MonthlyCapacity': '',
    'MinimalCapacity': '',
    'LeanMonths': '',
    'LeanCapacity': '',
    'Address1': '',
    'Phone': '',
    'StateCode': '',
    'CityCode': '',
    'Pin': '',
    'Remarks': ''
  };
  //#endregion

  //#region Modal Popup and Alert
  @ViewChild('modalOpen')
  modalOpen: ElementRef;
  modalOpenButton: HTMLElement;

  @ViewChild('deleteModalOpen')
  deleteModal: ElementRef;
  deleteModalButton: HTMLElement;

  @ViewChild('deleteModalClose')
  deleteModalClose: ElementRef;
  deleteModalCloseBtn: HTMLElement;

  @ViewChild('alertModalOpen')
  alertModalOpen: ElementRef;
  alertModalButton: HTMLElement;
  PopUpMessage: string;
  //#endregion

  ngOnInit() {
    this.alertModalButton = this.alertModalOpen.nativeElement as HTMLElement;
    this.modalOpenButton = this.modalOpen.nativeElement as HTMLElement;
    this.deleteModalButton = this.deleteModal.nativeElement as HTMLElement;
    this.deleteModalCloseBtn = this.deleteModalClose.nativeElement as HTMLElement;

    this.searchBySubContName = '';
    this.searchBySubContNature = '';
    this.searchByApprProdUnits = '';
    this.searchByMonCapacity = '';
    this.searchByMinCapacity = '';
    this.searchByLeanMonths = '';
    this.searchByLeanCapacity = '';

    this.GetStateList();
    this.VendorProduction = new VendorProduction();
    this.InitializeFormControls();
    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorProduction(this.currentPage);
    });
  }

  //#region Form Initialization
  InitializeFormControls() {
    this.ProductionDetailsForm = this._fb.group({
      ApprovedProductionCount: [this.VendorProduction.ApprovedProductionCount,
      [Validators.required, Validators.pattern(this.NumericPattern)]],
      SubContractingName: [this.VendorProduction.SubContractingName, [Validators.required,
      Validators.pattern(this.NamePattern)]],
      NatureOfSubContracting: [this.VendorProduction.NatureOfSubContracting, [Validators.required,
      Validators.pattern(this.NamePattern)]],
      MonthlyCapacity: [this.VendorProduction.MonthlyCapacity, [Validators.required, Validators.pattern(this.DecimalPattern)]],
      MinimalCapacity: [this.VendorProduction.MinimalCapacity, [Validators.required, Validators.pattern(this.DecimalPattern)]],
      LeanMonths: [this.VendorProduction.LeanMonths,
      [Validators.required, Validators.pattern(this.NumericPattern), Validators.max(500)]],
      LeanCapacity: [this.VendorProduction.LeanCapacity, [Validators.required, Validators.pattern(this.DecimalPattern)]],
      Address1: [this.VendorProduction.Address1, [Validators.required, Validators.pattern(this.AddressAndRemarksPattern)]],
      Address2: [this.VendorProduction.Address2, Validators.pattern(this.AddressAndRemarksPattern)],
      Address3: [this.VendorProduction.Address3, Validators.pattern(this.AddressAndRemarksPattern)],
      Phone: [this.VendorProduction.Phone, [Validators.required, Validators.pattern(this.PhonePattern)]],
      StateCode: [this.VendorProduction.StateCode, [Validators.required, Validators.required]],
      CityCode: [this.VendorProduction.CityCode, [Validators.required, Validators.pattern(this.AlphabetPattern)]],
      Pin: [this.VendorProduction.Pin, [Validators.required, Validators.pattern(this.PinPattern)]],
      Remarks: [this.VendorProduction.Remarks, Validators.pattern(this.AddressAndRemarksPattern)]
    });
    // this.ProductionDetailsForm.valueChanges.subscribe((data) => {
    //   this.LogValidationErrors(this.ProductionDetailsForm);
    // });
    if (localStorage.getItem('VendorStatus') === 'D') {
      this.isDeactVendor = true;
    }
  }

  EditProductionDetail(production: VendorProduction) {
    if (production === null || production === undefined) {
      this.VendorProduction = new VendorProduction();
      this.VendorProduction.VendorProductionDetailsID = 0;
    } else {
      this.VendorProduction = JSON.parse(JSON.stringify(production));
    }
    this.VendorProduction.Status = 'A';
    this.InitializeFormControls();
    this.modalOpenButton.click();
  }
  //#endregion

  //#region  Data Binding and Search
  GetVendorProduction(index: number) {
    this.currentPage = index;
    this._vendorService.GetVendorProductionByVendorCode(this.vendorcode, this.currentPage, this.pageSize, this.searchText)
      .subscribe(result => {
        this.VendorProductionList = result.data.Table;
        this.totalItems = result.data.Table1[0].TotalVendors;
        this.GetVendorsProductionList();
      });
  }

  GetVendorsProductionList() {
    this.pager = this._pager.getPager(this.totalItems, this.currentPage, this.pageSize);
    this.pagedItems = this.VendorProductionList;
  }

  GetStateList() {
    this._mddService.GetMasterDataDetails('STATE', '-1').subscribe(result => {
      this.StateList = result.data.Table;
    });
  }

  SearchProductionDetails() {
    this.searchText = this.searchBySubContName + '~' +
      this.searchBySubContNature + '~' +
      this.searchByApprProdUnits + '~' +
      this.searchByMonCapacity + '~' +
      this.searchByMinCapacity + '~' +
      this.searchByLeanMonths + '~' +
      this.searchByLeanCapacity;
    this.SearchProduction(this.searchText);
  }

  SearchProduction(searchText = '') {
    this.searchText = searchText;
    this.GetVendorProduction(1);
  }

  // GetProductionDetails(vendor: VendorProduction) {
  // }
  //#endregion

  //#region Form Validation
  LogValidationErrors(group: FormGroup = this.ProductionDetailsForm): void {
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

  CheckLeanMonth() {
    const value = this.ProductionDetailsForm.get('LeanMonths').value.split('.');
    if (value.length > 2) {
      this.LogValidationErrors();
    } else if (Number(value[1]) === 0) {
      this.ProductionDetailsForm.get('LeanMonths').patchValue(value[0]);
    }
  }
  //#endregion

  //#region Delete or Reset Form Data
  DeleteProductionDetail(production: VendorProduction) {
    this.VendorProduction = JSON.parse(JSON.stringify(production));
    this.VendorProduction.Status = 'D';
    this.InitializeFormControls();
    this.deleteModalButton.click();
  }

  Dismiss() {
    this.submitted = false;
    // this.VendorProduction = new VendorProduction();
    // this.ProductionDetailsForm.reset();

    this.InitializeFormControls();
    this.LogValidationErrors();

    this.modalOpenButton.click();
  }
  //#endregion

  //#region Save Form Data
  SaveProductionDetails() {
    this.submitted = true;
    if (this.ProductionDetailsForm.invalid) {
      this.LogValidationErrors();
      return;
    }

    if (this.VendorProduction.Status !== 'D') {
      this.VendorProduction.DivisionCode = '-1';
      this.VendorProduction.DeptCode = '-1';
      this.VendorProduction.CompanyCode = '10';
      this.VendorProduction.VendorShortCode = this.vendorcode;
      this.VendorProduction.ApprovedProductionCount = this.ProductionDetailsForm.get('ApprovedProductionCount').value;
      this.VendorProduction.SubContractingName = this.ProductionDetailsForm.get('SubContractingName').value;
      this.VendorProduction.NatureOfSubContracting = this.ProductionDetailsForm.get('NatureOfSubContracting').value;
      this.VendorProduction.MonthlyCapacity = this.ProductionDetailsForm.get('MonthlyCapacity').value;
      this.VendorProduction.MinimalCapacity = this.ProductionDetailsForm.get('MinimalCapacity').value;
      this.VendorProduction.LeanMonths = this.ProductionDetailsForm.get('LeanMonths').value;
      this.VendorProduction.LeanCapacity = this.ProductionDetailsForm.get('LeanCapacity').value;
      this.VendorProduction.Address1 = this.ProductionDetailsForm.get('Address1').value;
      this.VendorProduction.Address2 = this.ProductionDetailsForm.get('Address2').value;
      this.VendorProduction.Address3 = this.ProductionDetailsForm.get('Address3').value;
      this.VendorProduction.Phone = this.ProductionDetailsForm.get('Phone').value;
      this.VendorProduction.StateCode = this.ProductionDetailsForm.get('StateCode').value;
      this.VendorProduction.CityCode = this.ProductionDetailsForm.get('CityCode').value;
      this.VendorProduction.Pin = this.ProductionDetailsForm.get('Pin').value;
      this.VendorProduction.Remarks = this.ProductionDetailsForm.get('Remarks').value;
    }

    try {
      this._vendorService.SaveVendorProductionInfo(this.VendorProduction).subscribe((result) => {
        if (result.data.Table[0].ResultCode === 0) {
          this.VendorProductionList = result.data.Table1;
          this.totalItems = result.data.Table2[0].TotalVendors;
          this.GetVendorsProductionList();
          this.Dismiss();
          this.GetVendorProduction(this.currentPage);
          this.PopUpMessage = result.data.Table[0].Message;
          this.alertModalButton.click();
        } else if (result.data.Table[0].ResultCode === 2) { // delete condition
          this.VendorProductionList = result.data.Table1;
          this.totalItems = result.data.Table2[0].TotalVendors;
          this.GetVendorProduction(this.currentPage);
          this.GetVendorsProductionList();
          this.PopUpMessage = result.data.Table[0].Message;
          this.deleteModalCloseBtn.click();
          this.alertModalButton.click();
        } else {
          this.PopUpMessage = result.data.Table[0].Message;
          this.alertModalButton.click();
        }
      });
    } catch {
      this.PopUpMessage = 'There are some technical error. Please contact administrator.';
      this.alertModalButton.click();
    }
  }
  //#endregion

}
