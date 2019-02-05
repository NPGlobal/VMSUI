import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { VendorTech } from 'src/app/Models/VendorTech';
import { VendorService } from 'src/app/Services/vendor.service';
import { HttpClient } from '@angular/common/http';
import { Vendor } from 'src/app/Models/vendor';
declare var $: any;

@Component({
  selector: 'app-technical-details',
  templateUrl: './technical-details.component.html',
  styleUrls: ['./technical-details.component.css']
})
export class TechnicalDetailsComponent implements OnInit {
  Code: string;
  VendorTech: VendorTech;
  techDetailsForm: FormGroup;
  personalDetailsForm: FormGroup;
  deptList: any[];
  techSpecList: any[];
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

    this.techDetailsForm = this._fb.group({
      dept: ['', Validators.required],
      techSpec: ['', Validators.required],
      techLineNo: ['', Validators.required],
      efficiency: '',
      unitCount: ['', Validators.required],
      status: true,
      remarks: '',
      IsExpanded: true


    });
  }
  GetVendorDepartments() {
    this._vendorService.GetVendorDeptTech('10', '-1', 'Department').subscribe((data) => {
      this.deptList = data;
    });
  }
  GetVendorTechSpec() {

    // console.log(this.techDetailsForm.get('dept').value);
    this._vendorService.GetVendorTechSpec('10', this.techDetailsForm.get('dept').value, 'TechSpec').subscribe((data) => {
      this.techSpecList = data;
    });
  }

  InitializeFormControls() {

    this.techDetailsForm = this._fb.group({
      dept: [this.VendorTech.dept],
      designation: [this.VendorTech.techSpec],
      techLineNo: [this.VendorTech.TechLineNo],
      efficiency: [this.VendorTech.Efficiency],
      unitCount: [this.VendorTech.UnitCount],
      status: [this.VendorTech.Status],
      remarks: [this.VendorTech.Remarks],
      IsExpanded: true
    });
  }

  ToggleContainer(formGroup: FormGroup) {
    formGroup.controls.IsExpanded.patchValue(!formGroup.controls.IsExpanded.value);
  }

  SaveTechDetails() {
    this.submitted = true;
    let statusObj: any;
    // alert(1);
    if (this.techDetailsForm.invalid) {
     // alert('Something Went Wrong!!!');
      return;
    }
    // console.log(JSON.stringify(this.addressForm));
    this.VendorTech = new VendorTech();
    this.VendorTech.VendorTechDetailsID = 0;
    this.VendorTech.VendorTechConfigID = this.techDetailsForm.get('techSpec').value;
    // this.VendorTech.VendorCode = this.personalDetailsForm.get('code').value;
    this.VendorTech.VendorCode = this.Code;
    this.VendorTech.TechLineNo = this.techDetailsForm.get('techLineNo').value;
    this.VendorTech.Efficiency = this.techDetailsForm.get('efficiency').value;
    this.VendorTech.UnitCount = this.techDetailsForm.get('unitCount').value;
    this.VendorTech.Status = this.techDetailsForm.get('status').value;
    this.VendorTech.Remarks = this.techDetailsForm.get('remarks').value;
    this.VendorTech.CreatedBy = 999999;
    // console.log(JSON.stringify(this.VendorTech));
     alert(JSON.stringify(this.VendorTech));
    this._vendorService.SaveTechInfo(this.VendorTech).subscribe((data) => {
      statusObj = data;

      if (statusObj.Status = true) {
        alert('Saved successfully.');
        this.VendorTech = new VendorTech();
        this.techDetailsForm.reset();
        this.InitializeFormControls();
      } else {
        alert('Error occured while saving.');
      }
    });
  }
}
