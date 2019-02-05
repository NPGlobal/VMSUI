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

  status = true;
  submitted = false;
  constructor(private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder) { }

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
    if (this.staffDetailsForm.invalid) {
      return;
    }
    console.log(JSON.stringify(this.staffDetailsForm.value));
    // alert(JSON.stringify(this.staffDetailsForm.value));
    // console.log(JSON.stringify(this.addressForm));
    this._vendorService.SaveStaffInfo(this.staffDetailsForm.value);
  }
}

