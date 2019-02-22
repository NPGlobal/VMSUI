import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorStaffService } from 'src/app/Services/vendor-staff.service';
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
  submitted = false;
  vendorstaffList: VendorStaff[]; // For added Staff List
  VendorStaff: VendorStaff; // For form value save and update
  editedVendorStaff: any; // For Check of Vendor Staff Edited Value
  staffDetailsForm: FormGroup;
  ActionMessage: string;
  @ViewChild('modalOpenMsgButton')
  modalOpenMsgButton: ElementRef;
  el: any;

  // paging variables
  totalItems: number;
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[];

  _originalValue: string;

  constructor(
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _pager: PagerService,
    private _vendorService: VendorStaffService) {
    this.CreateNewVendorStaff();
  }
  ValidationMessages = {
    'dept': {
      'required': ''
    },
    'designation': {
      'required': ''
    },
    'ContactName': {
      'required': ''
    },
    'ContactEmail': {
      'email': 'Please enter a valid email'
    },
    'ContactPhone': {
      'maxlength': 'Should not exceed 10 characters',
      'pattern': 'Only numbers allowed'
    },
    'priority': {
      'required': '',
      'pattern': 'Only numbers allowed'
    }
  };
  formErrors = {
    'dept': '',
    'designation': '',
    'ContactName': '',
    'ContactEmail': '',
    'ContactPhone': '',
    'priority': ''
  };
  ngOnInit() {
    this.openModal();
    this.el = this.modalOpenMsgButton.nativeElement as HTMLElement;
    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorStaffs(this.currentPage);
    });
    this.GetVendorDepartments();
    this.staffDetailsForm.valueChanges.subscribe((data) => {
      this.logValidationErrors();
    });
  }
  logValidationErrors(group: FormGroup = this.staffDetailsForm): void {
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
  CreateNewVendorStaff() {
    this.VendorStaff = new VendorStaff();
    // this.VendorStaff.VendorStaffConfigId = '';
    // this.VendorStaff.VendorStaffDetailsId = '';
    // this.VendorStaff.dept = '';
    this.VendorStaff.designation = '';
    this.VendorStaff.VendorCode = '';
    this.VendorStaff.ContactName = '';
    this.VendorStaff.ContactEmail = '';
    this.VendorStaff.ContactPhone = null;
    this.VendorStaff.Priority = null;
    this.VendorStaff.Status = 'A';
    this.VendorStaff.Remarks = '';
  }
  InitializeFormControls() {
    this.staffDetailsForm = this._fb.group({
      VendorStaffConfigId: [this.VendorStaff.VendorStaffConfigId],
      VendorStaffDetailsId: [this.VendorStaff.VendorStaffDetailsId],
      dept: [this.VendorStaff.dept, Validators.required],
      designation: [this.VendorStaff.VendorStaffConfigId, Validators.required],
      ContactName: [this.VendorStaff.ContactName, Validators.required],
      ContactEmail: [this.VendorStaff.ContactEmail, Validators.email],
      ContactPhone: [this.VendorStaff.ContactPhone, [
        Validators.maxLength(10), Validators.pattern(this.NumericPattern)
      ]],
      priority: [this.VendorStaff.Priority, [Validators.required, Validators.pattern(this.NumericPattern)]],
      Status: [this.VendorStaff.Status],
      remarks: [this.VendorStaff.Remarks]
    });
  }
  openModal() {
    this.InitializeFormControls();
  }
  dismiss() {
    this.submitted = false;
    this.CreateNewVendorStaff();
    this.InitializeFormControls();
    this.logValidationErrors();
    this.designationList = [];
    this.editedVendorStaff = undefined;
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
    if (this.staffDetailsForm.get('dept').value === null) {
      this.designationList = [];
      this.staffDetailsForm.controls.designation.patchValue(null);
    } else {
      this._vendorService.GetVendorDesignation('10', this.staffDetailsForm.get('dept').value, this.vendorcode, 'Designation')
        .subscribe((data) => {
          this.designationList = data;
          if (this.staffDetailsForm.get('designation').value !== null) {
            const strArray = this.designationList.find((obj) => obj.VendorConfigID === this.staffDetailsForm.get('designation').value);
            if (strArray === undefined) {
              this.staffDetailsForm.controls.designation.patchValue(null);
            }
          }
        });
    }
  }

  // showPopUpMessage(msg: string) {
  //   // alert('There is nothing to change for save.');
  //   this.ActionMessage = msg;
  //   const el = this.modalOpenMsgButton.nativeElement as HTMLElement;
  //   // $('#modalOpenMsgButton').click();
  //   el.click();
  // }

  SaveStaffDetails() {
    this.submitted = true;
    if (this.staffDetailsForm.invalid) {
      this.logValidationErrors();
      return;
    }
    if (this.editedVendorStaff !== undefined) {
      if (
        this.staffDetailsForm.get('designation').value === this.editedVendorStaff.VendorStaffConfigId
        && this.staffDetailsForm.get('ContactName').value === this.editedVendorStaff.ContactName
        && this.staffDetailsForm.get('ContactEmail').value === this.editedVendorStaff.ContactEmail
        && this.staffDetailsForm.get('ContactPhone').value === this.editedVendorStaff.ContactPhone
        && this.staffDetailsForm.get('priority').value === this.editedVendorStaff.Priority
        && this.staffDetailsForm.get('remarks').value === this.editedVendorStaff.Remarks
      ) {
        // this.showPopUpMessage('There is nothing to change for save.');
        this.ActionMessage = 'There is nothing to change for save.';
        this.el.click();
        return;
      }
    }
    this.sendFormData();
  }
  DeleteStaffDetails() {
    this.sendFormData();
  }
  sendFormData() {
    const st = this.staffDetailsForm.get('Status').value;
    this.VendorStaff = new VendorStaff();
    this.VendorStaff.VendorStaffDetailsId = (this.staffDetailsForm.get('VendorStaffDetailsId').value === null)
    ? 0 : this.staffDetailsForm.get('VendorStaffDetailsId').value;
    this.VendorStaff.VendorStaffConfigId = this.staffDetailsForm.get('designation').value;
    this.VendorStaff.VendorCode = this.vendorcode;
    this.VendorStaff.ContactName = this.staffDetailsForm.get('ContactName').value.trim();
    this.VendorStaff.ContactEmail = this.staffDetailsForm.get('ContactEmail').value.trim();
    this.VendorStaff.ContactPhone = (this.staffDetailsForm.get('ContactPhone').value === null)
      ? '' : this.staffDetailsForm.get('ContactPhone').value.trim();
    this.VendorStaff.Priority = this.staffDetailsForm.get('priority').value;
    this.VendorStaff.Status = st;
    this.VendorStaff.Remarks = this.staffDetailsForm.get('remarks').value.trim();
    this.VendorStaff.CreatedBy = 999999;

    console.log(JSON.stringify(this.VendorStaff));

    try {
      this._vendorService.SaveStaffInfo(this.VendorStaff).subscribe((data) => {
        if (data.Msg != null) {
          if (data.Msg[0].Result === 0) {
            this.VendorStaff = new VendorStaff();
            this.vendorstaffList = data.VendorStaff;
            this.totalItems = data.VendorStaffCount[0].TotalVendors;
            this.GetVendorsStaffList();
            // alert(data.Msg[0].Message);
            // this.showPopUpMessage(data.Msg[0].Message);
            this.ActionMessage = data.Msg[0].Message;
            this.el.click();
            if (st === 'A') {
              $('#myModal').modal('toggle');
            } else {
              $('#deleteModal').modal('toggle');
            }
            this.dismiss();
          } else {
            // alert(data.Msg[0].Message);
            // this.showPopUpMessage(data.Msg[0].Message);
            this.ActionMessage = data.Msg[0].Message;
            this.el.click();
          }
        } else {
          // this.showPopUpMessage('There are some technical error. Please contact administrator.');
          this.ActionMessage = 'There are some technical error. Please contact administrator.';
          this.el.click();
        }
      });
    } catch {
      this.ActionMessage = 'There are some technical error. Please contact administrator.';
      this.el.click();
    }
  }
  GetStaffDetails(vobj: VendorStaff) {
    this.editedVendorStaff = vobj;
    this.VendorStaff = vobj;
    vobj.Status = 'A';
    this.InitializeFormControls();
    this.GetVendorDesignation();
  }
  DeleteStaffDetailPopup(vobj: VendorStaff) {
    vobj.Status = 'D';
    this.VendorStaff = vobj;
    this.InitializeFormControls();
  }
}