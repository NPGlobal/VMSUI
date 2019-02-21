import { Component, OnInit } from '@angular/core';
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
  vendorcode: string;
  divisionList: any[];
  departmentList: any[];
  status = true;
  submitted = false;
  businessList: VendorBusinessDetails[]; // For added Business List
  businessObj: VendorBusinessDetails; // For form value save and update
  businessDetailsForm: FormGroup;

  // paging variables
  totalItems: number;
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[];

  constructor(
    // private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _pager: PagerService,
    private _mddService: MasterDataDetailsService,
    private _vendorBusiService: VendorBusinessService) {
    this.CreateNewVendorBusiness();
  }
  ngOnInit() {
    this.openModal();
    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorBusiness(this.currentPage);
    });
    this.GetDivisions();
  }

  CreateNewVendorBusiness() {
    this.businessObj = new VendorBusinessDetails();
    this.businessObj.VendorBusinessDetailsID = 0;
    this.businessObj.FinancialYear = '';
    this.businessObj.divisionCode = '';
    this.businessObj.deptCode = '';
    this.businessObj.ProposedDPValueQty = null;
    this.businessObj.ProposedDPGrnQty = null;
    this.businessObj.ProposedJWValueQty = null;
    this.businessObj.ProposedJWGrnQty = null;
    this.businessObj.Status = 'A';
    this.businessObj.Remarks = '';
  }

  GetVendorBusiness(index: number) {
    this.currentPage = index;
    this._vendorBusiService.GetVendorBusinessByVendorCode(this.vendorcode, this.currentPage, this.pageSize).subscribe(data => {
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
  InitializeFormControls() {
    this.businessDetailsForm = this._fb.group({
      VendorBusinessDetailsID: ['0'],
      divisionCode: ['', Validators.required],
      deptCode: ['', Validators.required],
      // ActualDPValueQty: [this.businessObj.ActualDPValueQty, [Validators.required, Validators.maxLength(14)]],
      // ActualDPGrnQty: [this.businessObj.ActualDPGrnQty, [Validators.required, Validators.maxLength(14)]],
      // ActualJWValueQty: [this.businessObj.ActualJWValueQty, [Validators.required, Validators.maxLength(14)]],
      // ActualJWGrnQty: [this.businessObj.ActualJWGrnQty, [Validators.required, Validators.maxLength(14)]],
      ProposedDPValueQty: [this.businessObj.ProposedDPValueQty, [Validators.required, Validators.maxLength(14)]],
      ProposedDPGrnQty: [this.businessObj.ProposedDPGrnQty, [Validators.required, Validators.maxLength(14)]],
      ProposedJWValueQty: [this.businessObj.ProposedJWValueQty, [Validators.required, Validators.maxLength(14)]],
      ProposedJWGrnQty: [this.businessObj.ProposedJWGrnQty, [Validators.required, Validators.maxLength(14)]],
      status: true,
      remarks: ''
    });
  }

  openModal() {
    this.InitializeFormControls();
  }
  dismiss() {
    this.CreateNewVendorBusiness();
    this.InitializeFormControls();
    this.submitted = false;
    this.departmentList = null;
  }
  SaveBusinessDetails() {
    this.submitted = true;
    if (this.businessDetailsForm.invalid) {
      return;
    }
    this.sendFormData();
  }
  DeleteBusinessDetails() {
    this.sendFormData();
  }
  sendFormData() {
    const st = this.businessDetailsForm.get('status').value;
    // console.log(JSON.stringify(this.businessDetailsForm.value));
    this.businessObj = new VendorBusinessDetails();
    this.businessObj.VendorBusinessDetailsID = this.businessDetailsForm.get('VendorBusinessDetailsID').value;
    this.businessObj.FinancialYear = '2018-19'; // this.businessDetailsForm.get('financialYear').value;
    this.businessObj.CompanyCode = '10'; // this.businessDetailsForm.get('companyCode').value;
    this.businessObj.VendorCode = this.vendorcode;
    this.businessObj.divisionCode = this.businessDetailsForm.get('divisionCode').value.trim();
    this.businessObj.deptCode = this.businessDetailsForm.get('deptCode').value.trim();
    // this.businessObj.ActualDPGrnQty = 0; // this.businessDetailsForm.get('ActualDPGrnQty').value;
    // this.businessObj.ActualDPValueQty = 0; // this.businessDetailsForm.get('ActualDPValueQty').value;
    // this.businessObj.ActualJWGrnQty = 0; // this.businessDetailsForm.get('ActualJWGrnQty').value;
    // this.businessObj.ActualJWValueQty = 0; // this.businessDetailsForm.get('ActualJWValueQty').value;
    this.businessObj.ProposedDPGrnQty = this.businessDetailsForm.get('ProposedDPGrnQty').value;
    this.businessObj.ProposedDPValueQty = this.businessDetailsForm.get('ProposedDPValueQty').value;
    this.businessObj.ProposedJWGrnQty = this.businessDetailsForm.get('ProposedJWGrnQty').value;
    this.businessObj.ProposedJWValueQty = this.businessDetailsForm.get('ProposedJWValueQty').value;
    this.businessObj.Status = this.businessDetailsForm.get('status').value;
    this.businessObj.Remarks = this.businessDetailsForm.get('remarks').value;
    this.businessObj.CreatedBy = 999999;

    try {
      this._vendorBusiService.SaveVendorBusinessInfo(this.businessObj).subscribe((data) => {
        if (data.Msg != null) {
          if (data.Msg[0].Result === 0) {
            this.businessList = data.VendorBusiness;
            this.totalItems = data.VendorBusinessCount[0].TotalVendors;
            this.GetVendorsBusinessList();
            alert(data.Msg[0].Message);
            if (st === true) {
              $('#myModal').modal('toggle');
            } else {
              $('#deleteModal').modal('toggle');
            }
            this.dismiss();
          } else {
            alert(data.Msg[0].Message);
          }
        } else {
          alert('There are some technical error. Please contact administrator.');
        }
      });
    } catch {
      alert('There are some technical error. Please contact administrator.');
    }
  }
  GetBusinessDetails(vobj: VendorBusinessDetails) {
    this.businessDetailsForm = this._fb.group({
      VendorBusinessDetailsID: [vobj.VendorBusinessDetailsID],
      divisionCode: [vobj.divisionCode, Validators.required],
      deptCode: [vobj.deptCode, Validators.required],
      // ActualDPValueQty: [data.Table[0].ActualDPValueQty, [Validators.required, Validators.maxLength(14)]],
      // ActualDPGrnQty: [data.Table[0].ActualDPGrnQty, [Validators.required, Validators.maxLength(14)]],
      // ActualJWValueQty: [data.Table[0].ActualJWValueQty, [Validators.required, Validators.maxLength(14)]],
      // ActualJWGrnQty: [data.Table[0].ActualJWGrnQty, [Validators.required, Validators.maxLength(14)]],
      ProposedDPValueQty: [vobj.ProposedDPValueQty, [Validators.required, Validators.maxLength(14)]],
      ProposedDPGrnQty: [vobj.ProposedDPGrnQty, [Validators.required, Validators.maxLength(14)]],
      ProposedJWValueQty: [vobj.ProposedJWValueQty, [Validators.required, Validators.maxLength(14)]],
      ProposedJWGrnQty: [vobj.ProposedJWGrnQty, [Validators.required, Validators.maxLength(14)]],
      status: true, // vobj.Status = 'A' ? true : false,
      remarks: ''
    });
    this.GetDepartment();
  }
  DeleteBusinessDetailPopup(vobj: VendorBusinessDetails) {
    this.businessDetailsForm = this._fb.group({
      VendorBusinessDetailsID: [vobj.VendorBusinessDetailsID],
      divisionCode: [vobj.divisionCode, Validators.required],
      deptCode: [vobj.deptCode, Validators.required],
      // ActualDPValueQty: [data.Table[0].ActualDPValueQty, [Validators.required, Validators.maxLength(14)]],
      // ActualDPGrnQty: [data.Table[0].ActualDPGrnQty, [Validators.required, Validators.maxLength(14)]],
      // ActualJWValueQty: [data.Table[0].ActualJWValueQty, [Validators.required, Validators.maxLength(14)]],
      // ActualJWGrnQty: [data.Table[0].ActualJWGrnQty, [Validators.required, Validators.maxLength(14)]],
      ProposedDPValueQty: [vobj.ProposedDPValueQty, [Validators.required, Validators.maxLength(14)]],
      ProposedDPGrnQty: [vobj.ProposedDPGrnQty, [Validators.required, Validators.maxLength(14)]],
      ProposedJWValueQty: [vobj.ProposedJWValueQty, [Validators.required, Validators.maxLength(14)]],
      ProposedJWGrnQty: [vobj.ProposedJWGrnQty, [Validators.required, Validators.maxLength(14)]],
      status: false,
      remarks: ''
    });
  }
  // This function is used for get data from database.
  // GetBusinessDetails(x) {
  //   this._vendorBusiService.GetBusinessDetails(x).subscribe((data) => {
  //     this.businessDetailsForm = this._fb.group({
  //       VendorBusinessDetailsID: [data.Table[0].VendorBusinessDetailsID],
  //       divisionCode: [data.Table[0].DivisionCode, Validators.required],
  //       deptCode: [data.Table[0].DeptCode, Validators.required],
  //       // ActualDPValueQty: [data.Table[0].ActualDPValueQty, [Validators.required, Validators.maxLength(14)]],
  //       // ActualDPGrnQty: [data.Table[0].ActualDPGrnQty, [Validators.required, Validators.maxLength(14)]],
  //       // ActualJWValueQty: [data.Table[0].ActualJWValueQty, [Validators.required, Validators.maxLength(14)]],
  //       // ActualJWGrnQty: [data.Table[0].ActualJWGrnQty, [Validators.required, Validators.maxLength(14)]],
  //       ProposedDPValueQty: [data.Table[0].ProposedDPValueQty, [Validators.required, Validators.maxLength(14)]],
  //       ProposedDPGrnQty: [data.Table[0].ProposedDPGrnQty, [Validators.required, Validators.maxLength(14)]],
  //       ProposedJWValueQty: [data.Table[0].ProposedJWValueQty, [Validators.required, Validators.maxLength(14)]],
  //       ProposedJWGrnQty: [data.Table[0].ProposedJWGrnQty, [Validators.required, Validators.maxLength(14)]],
  //       status: data.Table[0].Status = 'A' ? true : false,
  //       remarks: data.Table[0].Remarks
  //     });
  //     this.GetDepartment();
  //   });
  // }
}
