import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorService } from 'src/app/Services/vendor.service';
import { VendorBusinessDetails } from 'src/app/Models/vendor-business-details';
declare var $: any;

@Component({
  selector: 'app-business-details',
  templateUrl: './business-details.component.html',
  styleUrls: ['./business-details.component.css']
})
export class BusinessDetailsComponent implements OnInit {
  constructor(
    private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _pager: PagerService
  ) {

  }

  vendorcode: string;
  // NumericPattern = '^[0-9]*$';
  businessList: VendorBusinessDetails[]; // For added Staff List
  businessObj: VendorBusinessDetails; // For form value save and update
  totalItems: number;
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[];

  businessDetailsForm: FormGroup;
  divisionList: any[];
  departmentList: any[];
  status = true;
  submitted = false;
  ngOnInit() {
    this.openModal();
    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorBusiness(this.currentPage);
    });
    this.GetDivisions();
  }

  GetVendorBusiness(index: number) {
    this.currentPage = index;
    this._vendorService.GetVendorBusinessByVendorCode(this.vendorcode, this.currentPage, this.pageSize).subscribe(data => {
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

  openModal() {
    this.businessDetailsForm = this._fb.group({
      id: ['0'],
      divisionCode: ['', Validators.required],
      deptCode: ['', Validators.required],
      ActualDPValueQty: ['', Validators.required],
      ActualDPGrnQty: ['', Validators.required],
      ActualJWValueQty: ['', Validators.required],
      ActualJWGrnQty: ['', Validators.required],
      ProposedDPValueQty: ['', Validators.required],
      ProposedDPGrnQty: ['', Validators.required],
      ProposedJWValueQty: ['', Validators.required],
      ProposedJWGrnQty: ['', Validators.required],
      status: true,
      remarks: ''
    });
  }
  dismiss() {
    this.businessDetailsForm = this._fb.group({
      id: ['0'],
      divisionCode: [''],
      deptCode: [''],
      ActualDPValueQty: [''],
      ActualDPGrnQty: [''],
      ActualJWValueQty: [''],
      ActualJWGrnQty: [''],
      ProposedDPValueQty: [''],
      ProposedDPGrnQty: [''],
      ProposedJWValueQty: [''],
      ProposedJWGrnQty: [''],
      status: true,
      remarks: ''
    });
    this.submitted = false;
  }
  SaveBusinessDetails() {
    this.submitted = true;
    if (this.businessDetailsForm.invalid) {
      return;
    }
    this.businessObj.VendorBusinessDetailsID = this.businessDetailsForm.get('id').value;
    this.businessObj.FinancialYear = this.businessDetailsForm.get('financialYear').value;
    this.businessObj.CompanyCode = this.businessDetailsForm.get('companyCode').value;
    this.businessObj.VendorCode = this.vendorcode;
    this.businessObj.divisionCode = this.businessDetailsForm.get('divisionCode').value;
    this.businessObj.deptCode = this.businessDetailsForm.get('deptCode').value;
    this.businessObj.ActualDPGrnQty = this.businessDetailsForm.get('ActualDPGrnQty').value;
    this.businessObj.ActualDPValueQty = this.businessDetailsForm.get('ActualDPValueQty').value;
    this.businessObj.ActualJWGrnQty = this.businessDetailsForm.get('ActualJWGrnQty').value;
    this.businessObj.ActualJWValueQty = this.businessDetailsForm.get('ActualJWValueQty').value;
    this.businessObj.ProposedDPGrnQty = this.businessDetailsForm.get('ProposedDPGrnQty').value;
    this.businessObj.ProposedDPValueQty = this.businessDetailsForm.get('ProposedDPValueQty').value;
    this.businessObj.ProposedJWGrnQty = this.businessDetailsForm.get('ProposedJWGrnQty').value;
    this.businessObj.ProposedJWValueQty = this.businessDetailsForm.get('ProposedJWValueQty').value;
    this.businessObj.Status = this.businessDetailsForm.get('status').value;
    this.businessObj.Remarks = this.businessDetailsForm.get('remarks').value;
    this.businessObj.CreatedBy = 999999;

    this._vendorService.SaveVendorBusinessInfo(this.businessObj).subscribe((data) => {
      if (data.Msg[0].Result === 0) {
        this.businessObj = new VendorBusinessDetails();
        this.businessDetailsForm.reset();
        this.InitializeFormControls();
        this.businessList = data.VendorBusiness;
        this.totalItems = data.VendorBusinessCount[0].TotalVendors;
        // this.GetVendorsStaffList();
        this.departmentList = [];
        alert(data.Msg[0].Message);
        $('#myModal').modal('toggle');
        this.dismiss();
      } else {
        alert(data.Msg[0].Message);
      }
    });
  }
  InitializeFormControls() {
    this.businessDetailsForm = this._fb.group({
      id: ['0'],
      divisionCode: [''],
      deptCode: [''],
      ActualDPValueQty: [this.businessObj.ActualDPValueQty],
      ActualDPGrnQty: [this.businessObj.ActualDPGrnQty],
      ActualJWValueQty: [this.businessObj.ActualJWValueQty],
      ActualJWGrnQty: [this.businessObj.ActualJWGrnQty],
      ProposedDPValueQty: [this.businessObj.ProposedDPValueQty],
      ProposedDPGrnQty: [this.businessObj.ProposedDPGrnQty],
      ProposedJWValueQty: [this.businessObj.ProposedJWValueQty],
      ProposedJWGrnQty: [this.businessObj.ProposedJWGrnQty],
      status: [this.businessObj.Status],
      remarks: [this.businessObj.Remarks]
    });
  }
  GetDepartment() {
    if (this.businessDetailsForm.get('divisionCode').value === '') {
      this.departmentList = [];
      this.businessDetailsForm.controls.designation.patchValue('');
    } else {
    this._vendorService.GetVendorDesignation('10', this.businessDetailsForm.get('divisionCode').value, this.vendorcode, 'Division')
    .subscribe((data) => {
        this.departmentList = data;
      });
    }
  }
  GetDivisions() {
    this._vendorService.GetVendorsDeptStaff('10', '-1', this.vendorcode, 'Department').subscribe((data) => {
      this.divisionList = data;
    });
  }

  GetStaffDetails(x) {
    this._vendorService.GetBusinessDetails(x).subscribe((data) => {
      this.businessDetailsForm = this._fb.group({
        id: [data.Table[0].VendorBusinessDetailsID],
        divisionCode: [data.Table[0].DivisionCode, Validators.required],
        deptCode: [data.Table[0].DeptCode, Validators.required],
        ActualDPValueQty: [data.Table[0].ActualDPValueQty, Validators.required],
        ActualDPGrnQty: [data.Table[0].ActualDPGrnQty, Validators.required],
        ActualJWValueQty: [data.Table[0].ActualJWValueQty, Validators.required],
        ActualJWGrnQty: [data.Table[0].ActualJWGrnQty, Validators.required],
        ProposedDPValueQty: [data.Table[0].ProposedDPValueQty, Validators.required],
        ProposedDPGrnQty: [data.Table[0].ProposedDPGrnQty, Validators.required],
        ProposedJWValueQty: [data.Table[0].ProposedJWValueQty, Validators.required],
        ProposedJWGrnQty: [data.Table[0].ProposedJWGrnQty, Validators.required],
        status: data.Table[0].Status = 'A' ? true : false,
        remarks: data.Table[0].Remarks
      });
      this.GetDepartment();
    });
  }
}
