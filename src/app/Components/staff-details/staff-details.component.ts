import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorStaffService } from 'src/app/Services/vendor-staff.service';
// import { VendorService } from 'src/app/Services/vendor.service';
import { VendorStaff } from 'src/app/Models/VendorStaff';
declare var $: any;

@Component({
  selector: 'app-staff-details',
  templateUrl: './staff-details.component.html',
  styleUrls: ['./staff-details.component.css']
})
export class StaffDetailsComponent implements OnInit {
  vendorcode: string;
  NumericPattern = '^[0-9]*$';
  deptList: any[];
  designationList: any[];
  status = true;
  submitted = false;
  vendorstaffList: VendorStaff[]; // For added Staff List
  VendorStaff: VendorStaff; // For form value save and update
  staffDetailsForm: FormGroup;

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
    private _vendorService: VendorStaffService) {
    this.CreateNewVendorStaff();
  }

  ngOnInit() {
    this.openModal();
    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorStaffs(this.currentPage);
    });
    this.GetVendorDepartments();
  }

  CreateNewVendorStaff() {
    this.VendorStaff = new VendorStaff();
    this.VendorStaff.VendorStaffConfigId = null;
    this.VendorStaff.VendorStaffDetailsId = null;
    this.VendorStaff.dept = '';
    this.VendorStaff.designation = '';
    this.VendorStaff.VendorCode = '';
    this.VendorStaff.ContactName = '';
    this.VendorStaff.ContactEmail = '';
    this.VendorStaff.ContactPhone = null;
    this.VendorStaff.Priority = null;
    this.VendorStaff.Status = 'A';
    this.VendorStaff.Remarks = '';
  }

  GetVendorStaffs(index: number) {
    this.currentPage = index;
    this._vendorService.GetVendorStaffByVendorCode(this.vendorcode, this.currentPage, this.pageSize).subscribe(data => {
      if (data.VendorStaff.length > 0) {
        this.vendorstaffList = data.VendorStaff;
        this.totalItems = data.VendorStaffCount[0].TotalVendors;
        this.GetVendorsStaffList();
      } else {
        this.pagedItems = undefined;
      }
    });
  }

  GetVendorsStaffList() {
    this.pager = this._pager.getPager(this.totalItems, this.currentPage, this.pageSize);
    this.pagedItems = this.vendorstaffList;
  }

  GetVendorDepartments() {
    this._vendorService.GetVendorsDeptStaff('10', '-1', this.vendorcode, 'Department').subscribe((data) => {
      this.deptList = data;
    });
  }

  GetVendorDesignation() {
    if (this.staffDetailsForm.get('dept').value === '') {
      this.designationList = [];
      this.staffDetailsForm.controls.designation.patchValue('');
    } else {
      this._vendorService.GetVendorDesignation('10', this.staffDetailsForm.get('dept').value, this.vendorcode, 'Designation')
        .subscribe((data) => {
          this.designationList = data;
          if (this.staffDetailsForm.get('designation').value !== '') {
            const strArray = this.designationList.find((obj) => obj.VendorConfigID === this.staffDetailsForm.get('designation').value);
            if (strArray === undefined) {
              this.staffDetailsForm.controls.designation.patchValue('');
            }
          }
        });
    }
  }

  openModal() {
    this.InitializeFormControls();
  }

  dismiss() {
    this.CreateNewVendorStaff();
    this.InitializeFormControls();
    this.submitted = false;
    this.designationList = [];
  }
  InitializeFormControls() {
    this.staffDetailsForm = this._fb.group({
      // VendorStaffConfigId: [this.VendorStaff.VendorStaffConfigId],
      // VendorStaffDetailsId: [this.VendorStaff.VendorStaffDetailsId],
      // dept: [this.VendorStaff.dept, Validators.required],
      // designation: [this.VendorStaff.VendorStaffConfigId, Validators.required],
      VendorStaffConfigId: [0],
      VendorStaffDetailsId: [0],
      dept: ['', Validators.required],
      designation: ['', Validators.required],
      ContactName: [this.VendorStaff.ContactName, Validators.required],
      ContactEmail: [this.VendorStaff.ContactEmail, Validators.email],
      ContactPhone: [this.VendorStaff.ContactPhone, [
        Validators.maxLength(10), Validators.pattern(this.NumericPattern)
      ]],
      priority: [this.VendorStaff.Priority, [Validators.required, Validators.pattern(this.NumericPattern)]],
      status: true,
      remarks: [this.VendorStaff.Remarks]
    });
  }

  SaveStaffDetails() {
    this.submitted = true;
    if (this.staffDetailsForm.invalid) {
      return;
    }
    this.VendorStaff = new VendorStaff();
    this.VendorStaff.VendorStaffDetailsId = this.staffDetailsForm.get('VendorStaffDetailsId').value;
    this.VendorStaff.VendorStaffConfigId = this.staffDetailsForm.get('designation').value;
    this.VendorStaff.VendorCode = this.vendorcode;
    this.VendorStaff.ContactName = this.staffDetailsForm.get('ContactName').value;
    this.VendorStaff.ContactEmail = this.staffDetailsForm.get('ContactEmail').value;
    this.VendorStaff.ContactPhone = (this.staffDetailsForm.get('ContactPhone').value === null)
      ? '' : this.staffDetailsForm.get('ContactPhone').value;
    this.VendorStaff.Priority = this.staffDetailsForm.get('priority').value;
    this.VendorStaff.Status = this.staffDetailsForm.get('status').value;
    this.VendorStaff.Remarks = this.staffDetailsForm.get('remarks').value;
    this.VendorStaff.CreatedBy = 999999;
    try {
      this._vendorService.SaveStaffInfo(this.VendorStaff).subscribe((data) => {
        if (data.Msg != null) {
          if (data.Msg[0].Result === 0) {
            this.VendorStaff = new VendorStaff();
            this.vendorstaffList = data.VendorStaff;
            this.totalItems = data.VendorStaffCount[0].TotalVendors;
            this.GetVendorsStaffList();
            alert(data.Msg[0].Message);
            $('#myModal').modal('toggle');
            this.dismiss();
          } else {
            alert(data.Msg[0].Message);
          }
        } else {
          alert('There are some technical error. Please contact administrator 1.');
        }
      });
    } catch {
      alert('There are some technical error. Please contact administrator 2.');
    }
  }
  // GetStaffDetails(vobj: VendorStaff) {
  //   this.VendorStaff = vobj;
  //   this.InitializeFormControls();
  //   this.GetVendorDesignation();
  // }
  GetStaffDetails(vobj: VendorStaff) {
    this.staffDetailsForm = this._fb.group({
      VendorStaffDetailsId: [vobj.VendorStaffDetailsId],
      VendorStaffConfigId: [vobj.VendorStaffConfigId],
      dept: [vobj.dept, Validators.required],
      designation: [vobj.designation, Validators.required],
      name: [vobj.ContactName, Validators.required],
      email: [vobj.ContactEmail, Validators.email],
      phone: [vobj.ContactPhone, [Validators.minLength(10), Validators.maxLength(10), Validators.pattern(this.NumericPattern)]],
      priority: [vobj.Priority, [Validators.required, Validators.pattern(this.NumericPattern)]],
      status: true,
      remarks: vobj.Remarks
    });
    this.GetVendorDesignation();
  }
  // GetStaffDetails(x) {
  //   this._vendorService.GetStaffDetails(x).subscribe((data) => {
  //     this.staffDetailsForm = this._fb.group({
  //       id: [data.Table[0].VendorStaffDetailsID],
  //       dept: [data.Table[0].VendorDept_MDDCode, Validators.required],
  //       designation: [data.Table[0].VendorStaffConfigID, Validators.required],
  //       name: [data.Table[0].ContactName, Validators.required],
  //       email: [data.Table[0].ContactEmail, Validators.email],
  //       phone: [data.Table[0].ContactPhone, [
  // Validators.minLength(10), Validators.maxLength(10), Validators.pattern(this.NumericPattern)]],
  //       priority: [data.Table[0].Priority, [Validators.required, Validators.pattern(this.NumericPattern)]],
  //       status: data.Table[0].Status = 'A' ? true : false,
  //       remarks: data.Table[0].Remarks
  //     });
  //     this.GetVendorDesignation();
  //   });
  // }
}

