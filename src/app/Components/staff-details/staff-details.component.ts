import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { vendorStaff } from 'src/app/Models/vendorStaff';
import { VendorService } from 'src/app/Services/vendor.service';
import { HttpClient } from '@angular/common/http';
declare var $: any;

@Component({
  selector: 'app-staff-details',
  templateUrl: './staff-details.component.html',
  styleUrls: ['./staff-details.component.css']
})
export class StaffDetailsComponent implements OnInit {
  VendorStaff: vendorStaff;
  staffDetailsForm: FormGroup;
  deptList: any[];
  designationList: any[];
  status = true;
  submitted = false;
  constructor(private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder) { }

  ngOnInit() {
    this.GetVendorDepartments();

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
      name: [this.VendorStaff.name],
      email: [this.VendorStaff.email],
      phone: [this.VendorStaff.phone],
      priority: [this.VendorStaff.priority],
      status: [this.VendorStaff.status],
      remarks: [this.VendorStaff.remarks],
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
      alert('something went wrong');
      return;
    }
    console.log(JSON.stringify(this.staffDetailsForm.value));
    alert(JSON.stringify(this.staffDetailsForm.value));
    // console.log(JSON.stringify(this.addressForm));
    this._vendorService.SaveStaffInfo(this.staffDetailsForm.value);
    alert('SUCCESS!! :-)');
  }
  // alert(1);
  // alert(JSON.stringify(this.staffDetailsForm.value));
}

