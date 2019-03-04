import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PagerService } from 'src/app/Services/pager.service';
import { MasterDataDetailsService } from 'src/app/Services/master-data-details.service';
import { VendorBusinessService } from 'src/app/Services/vendor-business.service';
import { VendorBusinessDetails } from 'src/app/Models/vendor-business-details';
import { HttpRequest } from '@angular/common/http';
declare var $: any;

@Component({
  selector: 'app-business-details',
  templateUrl: './business-details.component.html',
  styleUrls: ['./business-details.component.css']
})
export class BusinessDetailsComponent implements OnInit {
  NumericPattern = '^[0-9]*$';
  vendorcode: string;
  divisionList: any[];
  departmentList: any[];
  status = true;
  submitted = false;
  businessList: VendorBusinessDetails[]; // For added Business List
  businessObj: VendorBusinessDetails; // For form value save and update
  editedVendorBusiness: any; // For Check of Vendor Business Edited Value
  businessDetailsForm: FormGroup;

  ActionMessage: string;
  @ViewChild('modalOpenMsgButton')
  modalOpenMsgButton: ElementRef;
  el: any;

  // paging variables
  totalItems = 0;
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[] = [];
  searchText = '';

  constructor(
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _pager: PagerService,
    private _mddService: MasterDataDetailsService,
    private _vendorBusiService: VendorBusinessService) {
    this.CreateNewVendorBusiness();
  }
  ValidationMessages = {
    'divisionCode': {
      'required': ''
    },
    'deptCode': {
      'required': ''
    },
    'ProposedDPValueQty': {
      'required': '',
      'maxlength': 'Should not exceed 14 characters',
      'pattern': 'Only numbers allowed'
    },
    'ProposedDPGrnQty': {
      'required': '',
      'maxlength': 'Should not exceed 14 characters',
      'pattern': 'Only numbers allowed'
    },
    'ProposedJWValueQty': {
      'required': '',
      'maxlength': 'Should not exceed 14 characters',
      'pattern': 'Only numbers allowed'
    },
    'ProposedJWGrnQty': {
      'required': '',
      'maxlength': 'Should not exceed 14 characters',
      'pattern': 'Only numbers allowed'
    }
  };
  formErrors = {
    'divisionCode': '',
    'deptCode': '',
    'ProposedDPValueQty': '',
    'ProposedDPGrnQty': '',
    'ProposedJWValueQty': '',
    'ProposedJWGrnQty': ''
  };
  ngOnInit() {
    this.openModal();
    this.el = this.modalOpenMsgButton.nativeElement as HTMLElement;
    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorBusiness(this.currentPage);
    });
    this.GetDivisions();
  }

  logValidationErrors(group: FormGroup = this.businessDetailsForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
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

  CreateNewVendorBusiness() {
    this.businessObj = new VendorBusinessDetails();
    this.businessObj.VendorBusinessDetailsID = 0;
    this.businessObj.FinancialYear = '';
    this.businessObj.DivisionCode = '';
    this.businessObj.DeptCode = '';
    this.businessObj.ProposedDPValueQty = null;
    this.businessObj.ProposedDPGrnQty = null;
    this.businessObj.ProposedJWValueQty = null;
    this.businessObj.ProposedJWGrnQty = null;
    this.businessObj.Status = 'A';
    this.businessObj.Remarks = '';
  }

  InitializeFormControls() {
    this.businessDetailsForm = this._fb.group({
      VendorBusinessDetailsID: [this.businessObj.VendorBusinessDetailsID],
      divisionCode: [this.businessObj.DivisionCode, Validators.required],
      deptCode: [this.businessObj.DeptCode, Validators.required],
      // ActualDPValueQty: [this.businessObj.ActualDPValueQty, [Validators.required, Validators.maxLength(14)]],
      // ActualDPGrnQty: [this.businessObj.ActualDPGrnQty, [Validators.required, Validators.maxLength(14)]],
      // ActualJWValueQty: [this.businessObj.ActualJWValueQty, [Validators.required, Validators.maxLength(14)]],
      // ActualJWGrnQty: [this.businessObj.ActualJWGrnQty, [Validators.required, Validators.maxLength(14)]],
      ProposedDPValueQty: [this.businessObj.ProposedDPValueQty, [Validators.required, Validators.maxLength(14),
      Validators.pattern(this.NumericPattern)]],
      ProposedDPGrnQty: [this.businessObj.ProposedDPGrnQty, [Validators.required, Validators.maxLength(14),
      Validators.pattern(this.NumericPattern)]],
      ProposedJWValueQty: [this.businessObj.ProposedJWValueQty,
      [Validators.required, Validators.maxLength(14), Validators.pattern(this.NumericPattern)]],
      ProposedJWGrnQty: [this.businessObj.ProposedJWGrnQty, [Validators.required,
      Validators.maxLength(14), Validators.pattern(this.NumericPattern)]],
      Status: [this.businessObj.Status],
      remarks: ''
    });

    // this.businessDetailsForm.valueChanges.subscribe((data) => {
    //   this.logValidationErrors(this.businessDetailsForm);
    // });
  }

  openModal() {
    this.InitializeFormControls();
  }

  dismiss() {
    this.submitted = false;
    this.CreateNewVendorBusiness();
    this.InitializeFormControls();
    this.logValidationErrors();
    this.departmentList = null;
    this.editedVendorBusiness = undefined;
  }

  GetVendorBusiness(index: number) {
    this.currentPage = index;
    this._vendorBusiService.GetVendorBusinessByVendorCode(this.vendorcode, this.currentPage, this.pageSize, this.searchText)
      .subscribe(data => {
        if (data.VendorBusiness.length > 0) {
          this.businessList = data.VendorBusiness;
          this.totalItems = data.VendorBusinessCount[0].TotalVendors;
          this.GetVendorsBusinessList();
        }
      });
  }

  GetVendorsBusinessList() {
    this.pager = this._pager.getPager(this.totalItems, this.currentPage, this.pageSize);
    this.pagedItems = this.businessList;
  }

  GetDivisions() {
    this._mddService.GetMasterDataDetails('Division', '-1').subscribe((result) => {
      this.divisionList = result.data.Table;
    });
  }

  GetDepartment() {
    if (this.businessDetailsForm.get('divisionCode').value === '') {
      this.departmentList = [];
      this.businessDetailsForm.controls.deptCode.patchValue('');
    } else {
      this._mddService.GetMasterDataDetails('Dept', this.businessDetailsForm.get('divisionCode').value)
        .subscribe((result) => {
          this.departmentList = result.data.Table;
          if (this.businessDetailsForm.get('deptCode').value !== '') {
            const strArray = this.departmentList.find((obj) => obj.MDDCode === this.businessDetailsForm.get('deptCode').value);
            if (strArray === undefined) {
              this.businessDetailsForm.controls.deptCode.patchValue('');
            }
          }
        });
    }
  }

  SaveBusinessDetails() {
    this.submitted = true;
    if (this.businessDetailsForm.invalid) {
      this.logValidationErrors();
      return;
    }
    // console.log(JSON.stringify (this.editedVendorBusiness));
    if (this.editedVendorBusiness !== undefined) {
      if (
        this.businessDetailsForm.get('divisionCode').value === this.editedVendorBusiness.divisionCode
        && this.businessDetailsForm.get('deptCode').value === this.editedVendorBusiness.deptCode
        && this.businessDetailsForm.get('ProposedDPValueQty').value === this.editedVendorBusiness.ProposedDPValueQty
        && this.businessDetailsForm.get('ProposedDPGrnQty').value === this.editedVendorBusiness.ProposedDPGrnQty
        && this.businessDetailsForm.get('ProposedJWValueQty').value === this.editedVendorBusiness.ProposedJWValueQty
        && this.businessDetailsForm.get('ProposedJWGrnQty').value === this.editedVendorBusiness.ProposedJWGrnQty
      ) {
        this.ActionMessage = 'There is nothing to change for save.';
        this.el.click();
        return;
      }
    }
    this.sendFormData();
  }

  DeleteBusinessDetails() {
    this.sendFormData();
  }

  sendFormData() {
    const st = this.businessDetailsForm.get('Status').value;
    // console.log(JSON.stringify(this.businessDetailsForm.value));
    this.businessObj = new VendorBusinessDetails();
    this.businessObj.VendorBusinessDetailsID = this.businessDetailsForm.get('VendorBusinessDetailsID').value;
    this.businessObj.FinancialYear = '2018-19'; // this.businessDetailsForm.get('financialYear').value;
    this.businessObj.CompanyCode = '10'; // this.businessDetailsForm.get('companyCode').value;
    this.businessObj.VendorShortCode = this.vendorcode;
    this.businessObj.DivisionCode = this.businessDetailsForm.get('divisionCode').value.trim();
    this.businessObj.DeptCode = this.businessDetailsForm.get('deptCode').value.trim();
    // this.businessObj.ActualDPGrnQty = 0; // this.businessDetailsForm.get('ActualDPGrnQty').value;
    // this.businessObj.ActualDPValueQty = 0; // this.businessDetailsForm.get('ActualDPValueQty').value;
    // this.businessObj.ActualJWGrnQty = 0; // this.businessDetailsForm.get('ActualJWGrnQty').value;
    // this.businessObj.ActualJWValueQty = 0; // this.businessDetailsForm.get('ActualJWValueQty').value;
    this.businessObj.ProposedDPGrnQty = this.businessDetailsForm.get('ProposedDPGrnQty').value;
    this.businessObj.ProposedDPValueQty = this.businessDetailsForm.get('ProposedDPValueQty').value;
    this.businessObj.ProposedJWGrnQty = this.businessDetailsForm.get('ProposedJWGrnQty').value;
    this.businessObj.ProposedJWValueQty = this.businessDetailsForm.get('ProposedJWValueQty').value;
    this.businessObj.Status = st;
    this.businessObj.Remarks = this.businessDetailsForm.get('remarks').value;
    this.businessObj.CreatedBy = 999999;

    try {
      this._vendorBusiService.SaveVendorBusinessInfo(this.businessObj).subscribe((data) => {
        if (data.Msg != null) {
          if (data.Msg[0].Result === 0) {
            this.businessList = data.VendorBusiness;
            this.totalItems = data.VendorBusinessCount[0].TotalVendors;
            this.GetVendorsBusinessList();
            this.ActionMessage = data.Msg[0].Message;
            this.el.click();
            if (st === 'A') {
              $('#myModal').modal('toggle');
            } else {
              $('#deleteModal').modal('toggle');
            }
            this.dismiss();
          } else {
            this.ActionMessage = data.Msg[0].Message;
            this.el.click();
          }
        } else {
          this.ActionMessage = 'There are some technical error. Please contact administrator.';
          this.el.click();
        }
      });
    } catch {
      this.ActionMessage = 'There are some technical error. Please contact administrator.';
      this.el.click();
    }
  }
  GetBusinessDetails(vobj: VendorBusinessDetails) {
    this.editedVendorBusiness = vobj;
    this.businessObj = vobj;
    vobj.Status = 'A';
    this.InitializeFormControls();
    this.GetDepartment();
  }
  DeleteBusinessDetailPopup(vobj: VendorBusinessDetails) {
    vobj.Status = 'D';
    this.businessObj = vobj;
    this.InitializeFormControls();
  }

  SearchBusinessDetails(searchText = '') {
    this.searchText = searchText;
    this.GetVendorBusiness(1);
  }
}
