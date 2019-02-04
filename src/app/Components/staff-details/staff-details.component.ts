import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { VendorStaff } from 'src/app/Models/VendorStaff';
import { VendorService } from 'src/app/Services/vendor.service';
import { HttpClient } from '@angular/common/http';
import { Vendor } from 'src/app/Models/vendor';
declare var $: any;

@Component({
  selector: 'app-staff-details',
  templateUrl: './staff-details.component.html',
  styleUrls: ['./staff-details.component.css']
})
export class StaffDetailsComponent implements OnInit {
  Code: string;
  VendorStaff: VendorStaff;
  staffDetailsForm: FormGroup;
  personalDetailsForm: FormGroup;
  deptList: any[];
  designationList: any[];
  status = true;
  submitted = false;
  constructor(private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder) { }

  ngOnInit() {
    this.GetVendorDepartments();

    this._route.parent.paramMap.subscribe((data) => {
      this.Code = (data.get('code'));
    });

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
  }
  GetVendorDepartments() {
    this._vendorService.GetVendorsDeptStaff('10', '-1', 'Department').subscribe((data) => {
      this.deptList = data;
    });
  }
  GetVendorDesignation() {

    // console.log(this.staffDetailsForm.get('dept').value);
    this._vendorService.GetVendorDesignation('10', this.staffDetailsForm.get('dept').value, 'Designation').subscribe((data) => {
      this.designationList = data;
    });
  }

  InitializeFormControls() {

    this.staffDetailsForm = this._fb.group({
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

  ToggleContainer(formGroup: FormGroup) {
    formGroup.controls.IsExpanded.patchValue(!formGroup.controls.IsExpanded.value);
  }

  SaveStaffDetails() {
    this.submitted = true;
    // alert(1);
    if (this.staffDetailsForm.invalid) {
      alert('Something Went Wrong!!!');
      return;
    }
    // console.log(JSON.stringify(this.addressForm));
    this.VendorStaff = new VendorStaff();
    this.VendorStaff.VendorStaffDetailsID = 0;
    this.VendorStaff.VendorStaffConfigID = 1;
    // this.VendorStaff.VendorCode = this.personalDetailsForm.get('code').value;
    this.VendorStaff.VendorCode = this.Code;
    this.VendorStaff.ContactName = this.staffDetailsForm.get('name').value;
    this.VendorStaff.ContactEmail = this.staffDetailsForm.get('email').value;
    this.VendorStaff.ContactPhone = this.staffDetailsForm.get('phone').value;
    this.VendorStaff.Priority = this.staffDetailsForm.get('priority').value;
    this.VendorStaff.Status = this.staffDetailsForm.get('status').value;
    this.VendorStaff.Remarks = this.staffDetailsForm.get('remarks').value;
    this.VendorStaff.CreatedBy = 999999;
    console.log(JSON.stringify(this.VendorStaff));
    alert(JSON.stringify(this.VendorStaff));
    this._vendorService.SaveStaffInfo(this.VendorStaff).subscribe();
    alert('SUCCESS!! :-)');
  }
  // alert(1);
  // alert(JSON.stringify(this.staffDetailsForm.value));
}

