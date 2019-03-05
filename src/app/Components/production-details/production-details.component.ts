import { Component, OnInit, SimpleChanges, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorService } from 'src/app/Services/vendor.service';
import { VendorProduction } from 'src/app/Models/VendorProduction';
import { MasterDataDetailsService } from 'src/app/Services/master-data-details.service';
import { MasterDataDetails } from 'src/app/Models/master-data-details';

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
    private _mddService: MasterDataDetailsService
  ) { }

  vendorcode: string;

  VendorProductionList: VendorProduction[]; // For added Production List
  VendorProduction: VendorProduction; // For form value save and update

  totalItems = 0;
  searchText = '';
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[] = [];

  // form group variables
  PhonePattern = '^[0-9]{10}$';
  PinPattern = '^[1-9][0-9]{5}$';
  CityPattern = '^[A-Za-z]+$';
  NumericPattern = '^[0-9]*$';
  DecimalPattern = '^[0-9]*[\.\]?[0-9][0-9]*$';
  ProductionDetailsForm: FormGroup;
  submitted = false;
  StateList: MasterDataDetails[] = [];

  ValidationMessages = {
    'ApprovedProductionCount': {
      'required': '',
      'pattern': 'Only numbers allowed'
    },
    'SubContractingName': {
      'required': '',
      'pattern': 'Only numbers allowed'
    },
    'NatureOfSubContracting': {
      'required': ''
    },
    'MonthlyCapacity': {
      'required': '',
      'pattern': 'Numeric value allowed'
    },
    'MinimalCapacity': {
      'required': '',
      'pattern': 'Numeric value allowed'
    },
    'LeanMonths': {
      'required': '',
      'pattern': 'Only numbers allowed'
    },
    'LeanCapacity': {
      'required': '',
      'pattern': 'Numeric value allowed'
    },
    'Address1': {
      'required': ''
    },
    'Phone': {
      'required': '',
      'pattern': 'Please enter a valid phone number'
    },
    'StateCode': {
      'required': ''
    },
    'CityCode': {
      'required': '',
      'pattern': 'Please enter a valid city'
    },
    'Pin': {
      'required': '',
      'pattern': 'Please enter a valid pincode'
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
  };

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

  ngOnInit() {
    this.alertModalButton = this.alertModalOpen.nativeElement as HTMLElement;
    this.modalOpenButton = this.modalOpen.nativeElement as HTMLElement;
    this.deleteModalButton = this.deleteModal.nativeElement as HTMLElement;
    this.deleteModalCloseBtn = this.deleteModalClose.nativeElement as HTMLElement;

    this.GetStateList();
    this.VendorProduction = new VendorProduction();
    this.InitializeFormControls();
    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorProduction(this.currentPage);
    });
  }

  //#region  GetProductionDetails
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
  //#endregion

  InitializeFormControls() {
    this.ProductionDetailsForm = this._fb.group({
      ApprovedProductionCount: [this.VendorProduction.ApprovedProductionCount,
      [Validators.required, Validators.pattern(this.NumericPattern)]],
      SubContractingName: [this.VendorProduction.SubContractingName, Validators.required],
      NatureOfSubContracting: [this.VendorProduction.NatureOfSubContracting, Validators.required],
      MonthlyCapacity: [this.VendorProduction.MonthlyCapacity, [Validators.required, Validators.pattern(this.DecimalPattern)]],
      MinimalCapacity: [this.VendorProduction.MinimalCapacity, [Validators.required, Validators.pattern(this.DecimalPattern)]],
      LeanMonths: [this.VendorProduction.LeanMonths, [Validators.required, Validators.pattern(this.NumericPattern)]],
      LeanCapacity: [this.VendorProduction.LeanCapacity, [Validators.required, Validators.pattern(this.DecimalPattern)]],
      Address1: [this.VendorProduction.Address1, Validators.required],
      Address2: [this.VendorProduction.Address2],
      Address3: [this.VendorProduction.Address3],
      Phone: [this.VendorProduction.Phone, [Validators.required, Validators.pattern(this.PhonePattern)]],
      StateCode: [this.VendorProduction.StateCode, [Validators.required, Validators.required]],
      CityCode: [this.VendorProduction.CityCode, [Validators.required, Validators.pattern(this.CityPattern)]],
      Pin: [this.VendorProduction.Pin, [Validators.required, Validators.pattern(this.PinPattern)]],
      Remarks: [this.VendorProduction.Remarks]
    });
    this.ProductionDetailsForm.valueChanges.subscribe((data) => {
      this.LogValidationErrors(this.ProductionDetailsForm);
    });
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

  SearchProductionDetails(searchText = '') {
    this.searchText = searchText;
    this.GetVendorProduction(1);
  }

  LogValidationErrors(group: FormGroup = this.ProductionDetailsForm): void {
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

  Dismiss() {
    this.submitted = false;
    this.VendorProduction = new VendorProduction();
    this.InitializeFormControls();

    this.ProductionDetailsForm.reset();
    this.modalOpenButton.click();
  }

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
          this.PopUpMessage = result.data.Table[0].Message;
          this.alertModalButton.click();
          this.Dismiss();
        } else if (result.data.Table[0].ResultCode === 2) { // delete condition
          this.VendorProductionList = result.data.Table1;
          this.totalItems = result.data.Table2[0].TotalVendors;
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

  GetProductionDetails(vendor: VendorProduction) {
  }

  DeleteProductionDetail(production: VendorProduction) {
    this.VendorProduction = JSON.parse(JSON.stringify(production));
    this.VendorProduction.Status = 'D';
    this.InitializeFormControls();
    this.deleteModalButton.click();
  }
}
