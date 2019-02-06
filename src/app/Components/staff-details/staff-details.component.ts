import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorService } from 'src/app/Services/vendor.service';
import { VendorStaff } from 'src/app/Models/VendorStaff';
@Component({
  selector: 'app-staff-details',
  templateUrl: './staff-details.component.html',
  styleUrls: ['./staff-details.component.css']
})
export class StaffDetailsComponent implements OnInit {
  vendorcode: string;

  vendorstaffList: VendorStaff[]; // For added Staff List
  VendorStaff: VendorStaff; // For form value save and update
  totalItems: number;
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[];

  staffDetailsForm: FormGroup;
  deptList: any[];
  designationList: any[];
  status = true;
  submitted = false;

  constructor(
    private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _pager: PagerService
  ) {

  }

  ngOnInit() {
    this.staffDetailsForm = this._fb.group({
      dept: ['', Validators.required],
      designation: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', Validators.email],
      phone: ['', [Validators.minLength(10), Validators.maxLength(10)]],
      priority: ['', Validators.required],
      status: true,
      remarks: '',
      IsExpanded: true
    });

    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorStaffs(this.currentPage);
    });
    this.GetVendorDepartments();
  }

  GetVendorStaffs(index: number) {
    this.currentPage = index;
    this._vendorService.GetVendorStaffByVendorCode(this.vendorcode, this.currentPage, this.pageSize).subscribe(data => {
      this.vendorstaffList = data.VendorStaff;
      this.totalItems = data.VendorStaffCount[0].TotalVendors;
      this.GetVendorsStaffList();
    });
  }
  GetVendorsStaffList() {
    this.pager = this._pager.getPager(this.totalItems, this.currentPage, this.pageSize);
    this.pagedItems = this.vendorstaffList;
  }


  GetVendorDepartments() {
    this._vendorService.GetVendorsDeptStaff('10', '-1', 'Department').subscribe((data) => {
      this.deptList = data;
    });
  }

  GetVendorDesignation() {
    this._vendorService.GetVendorDesignation('10', this.staffDetailsForm.get('dept').value, 'Designation').subscribe((data) => {
      this.designationList = data;
    });
  }

  InitializeFormControls() {
    this.staffDetailsForm = this._fb.group({
      id: [this.VendorStaff.VendorStaffDetailsID],
      dept: [this.VendorStaff.dept],
      designation: [this.VendorStaff.designation],
      name: [this.VendorStaff.ContactName],
      email: [this.VendorStaff.ContactEmail],
      phone: [this.VendorStaff.ContactPhone],
      priority: [this.VendorStaff.Priority],
      status: [this.VendorStaff.Status],
      remarks: [this.VendorStaff.Remarks],
      IsExpanded: true
    });
  }

  SaveStaffDetails() {
    this.submitted = true;
    if (this.staffDetailsForm.invalid) {
      return;
    }
    this.VendorStaff = new VendorStaff();
    this.VendorStaff.VendorStaffDetailsID = this.staffDetailsForm.get('id').value;
    this.VendorStaff.VendorStaffConfigID = this.staffDetailsForm.get('designation').value;
    this.VendorStaff.VendorCode = this.vendorcode;
    this.VendorStaff.ContactName = this.staffDetailsForm.get('name').value;
    this.VendorStaff.ContactEmail = this.staffDetailsForm.get('email').value;
    this.VendorStaff.ContactPhone = this.staffDetailsForm.get('phone').value;
    this.VendorStaff.Priority = this.staffDetailsForm.get('priority').value;
    this.VendorStaff.Status = this.staffDetailsForm.get('status').value;
    this.VendorStaff.Remarks = this.staffDetailsForm.get('remarks').value;
    this.VendorStaff.CreatedBy = 999999;
    this._vendorService.SaveStaffInfo(this.VendorStaff).subscribe((data) => {
      if (data.Msg = '0') {
        this.VendorStaff = new VendorStaff();
        this.staffDetailsForm.reset();
        this.InitializeFormControls();
        this.vendorstaffList = data.VendorStaff;
        this.totalItems = data.VendorStaffCount[0].TotalVendors;
        this.GetVendorsStaffList();
      } else {
        alert('Error occured while saving.');
      }
    });
  }

  GetStaffDetails() {
    alert('call');
    this._vendorService.GetStaffDetails(1).subscribe((data) => {
      this.staffDetailsForm = this._fb.group({
        dept: ['', Validators.required],
        designation: ['', Validators.required],
        name: data[0].ContactName,
        email: ['', Validators.email],
        phone: ['', [Validators.minLength(10), Validators.maxLength(10)]],
        priority: ['', Validators.required],
        status: true,
        remarks: '',
        IsExpanded: true
      });
    });
  }
}

