import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorStaffService } from 'src/app/Services/vendor-staff.service';
import { VendorStaff } from 'src/app/Models/VendorStaff';
import { CommonModule, NgStyle} from '@angular/common';
declare var $: any;

@Component({
  selector: 'app-staff-details',
  templateUrl: './staff-details.component.html',
  styleUrls: ['./staff-details.component.css']
})
export class StaffDetailsComponent implements OnInit {
  vendorcode: string;
  PhonePattern = '^[0-9]{10}$';
  NumericPattern = '^[0-9]*$';
  deptList: any[];
  deptSelectList = [];
  designationList: any[];
  priorityListTemp: any[];
  submitted = false;
  vendorstaffList: VendorStaff[]; // For added Staff List
  VendorStaff: VendorStaff; // For form value save and update
  editedVendorStaff: any; // For Check of Vendor Staff Edited Value
  staffDetailsForm: FormGroup;
  ActionMessage: string;
  MaxPriority = 0;
  @ViewChild('modalOpenMsgButton')
  modalOpenMsgButton: ElementRef;
  el: any;

  // paging variables
  totalItems = 0;
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[];

  _originalValue: string;
  searchText = '';
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
      'pattern': 'Please enter a valid phone'
    },
    'priority': {
      'required': ''
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
  deptDropdownSettings = {
    singleSelection: false,
    idField: 'DeptCode',
    textField: 'DeptName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 3,
    allowSearchFilter: true,
    noDataAvailablePlaceholderText : 'No records'
  };
  PriorityList(n: any): any[] {
    return Array(n);
  }
 ngOnInit() {
    this.openModal();
    this.el = this.modalOpenMsgButton.nativeElement as HTMLElement;
    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorStaffs(this.currentPage);
    });
    this.GetVendorDesignation();
    // this.staffDetailsForm.valueChanges.subscribe((data) => {
    //   this.logValidationErrors();
    // });
    this.GetVendorStaffs(this.currentPage);
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
    // this.VendorStaff.VendorStaffDetailsId = '';s
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
        Validators.maxLength(10), Validators.pattern(this.PhonePattern)
      ]],
      priority: [this.VendorStaff.Priority, Validators.required],
      Status: [this.VendorStaff.Status],
      remarks: [this.VendorStaff.Remarks]
    });
    // this.staffDetailsForm.valueChanges.subscribe((data) => {
    //   this.logValidationErrors(this.staffDetailsForm);
    // });
  }
  openModal() {
    this.InitializeFormControls();
  }
  dismiss() {
    this.MaxPriority = 0;
    this.submitted = false;
    this.CreateNewVendorStaff();
    this.InitializeFormControls();
    this.logValidationErrors();
   // this.designationList = [];
   this.deptList = [];
    this.editedVendorStaff = undefined;
  }
  GetVendorStaffs(index: number) {
    this.currentPage = index;
    this._vendorService.GetVendorStaffByVendorCode(this.vendorcode, this.currentPage, this.pageSize, this.searchText)
      .subscribe(data => {
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

   GetVendorDesignation() {
    this._vendorService.GetVendorDesignation('10', '-1', this.vendorcode, 'Designation').subscribe((data) => {
           this.designationList = data;
   });
  }
  onDeptSelect(item: any) {
  //  alert(item.DeptCode);
  //  alert(item.DeptName);
  //  alert(this.staffDetailsForm.get('deptSelectList').value);
  //  console.log(item);
  }
  onDeptSelectAll(items: any) {
   // items.forEach(function (i) {
   //   console.log(i);
    //  this.dept += i.DeptCode;
    //  alert(this.dept);
    // });
   // alert(items.DeptCode);
   // console.log(items);
  }
//  this.sequenceService.GetSequences().subscribe(res => {
//       this.sequences = res;
//     });
    GetVendorDepartments() {
    if (this.staffDetailsForm.get('designation').value === null) {
      this.deptList = [];
      this.MaxPriority = 0;
      this.deptSelectList = null;
      this.staffDetailsForm.controls.priority.patchValue(null);
    } else {
      this._vendorService.GetVendorsDeptStaff('10', this.staffDetailsForm.get('designation').value, this.vendorcode, 'Department')
        .subscribe((data) => {
          this.deptList = data;
          this.MaxPriority = data.max_allowed;
          if (this.staffDetailsForm.get('designation').value !== null) {
            const strArray = this.deptList.find((obj) => obj.DeptName === this.deptSelectList);
            if (strArray === undefined) {
              this.deptSelectList = null;
            } else { this.GetVendorPriority(); }
            }
             if (this.staffDetailsForm.get('VendorStaffDetailsId').value === null) {
             this.staffDetailsForm.controls.priority.patchValue(null);
             this.MaxPriority = 0; }
          });
    }
  }
  // GetVendorDepartments() {
  //   this._vendorService.GetVendorsDeptStaff('10', '-1', this.vendorcode, 'Department').subscribe((data) => {
  //     this.deptList = data;
  //   });
  // }

  // GetVendorDesignation() {
  //   if (this.staffDetailsForm.get('dept').value === null) {
  //     this.designationList = [];
  //     this.MaxPriority = 0;
  //     this.staffDetailsForm.controls.designation.patchValue(null);
  //     this.staffDetailsForm.controls.priority.patchValue(null);
  //   } else {
  //     this._vendorService.GetVendorDesignation('10', this.staffDetailsForm.get('dept').value, this.vendorcode, 'Designation')
  //       .subscribe((data) => {
  //         this.designationList = data;
  //      //   this.MaxPriority = data.max_allowed;
  //         if (this.staffDetailsForm.get('designation').value !== null) {
  //           const strArray = this.designationList.find((obj) => obj.VendorConfigID === this.staffDetailsForm.get('designation').value);
  //           if (strArray === undefined) {
  //             this.staffDetailsForm.controls.designation.patchValue(null);
  //           } else { this.GetVendorPriority(); }
  //            }
  //            if (this.staffDetailsForm.get('VendorStaffDetailsId').value === null) {
  //            this.staffDetailsForm.controls.priority.patchValue(null);
  //            this.MaxPriority = 0; }
  //         });
  //   }
  // }
  GetVendorPriority() {
    if (this.staffDetailsForm.get('VendorStaffDetailsId').value === null) {
     this.staffDetailsForm.controls.priority.patchValue(null); }
    if (this.staffDetailsForm.get('designation').value !== null) {
    // tslint:disable-next-line:triple-equals
    this.priorityListTemp = this.designationList.filter(book => book.VendorConfigID == this.staffDetailsForm.get('designation').value);
    this.MaxPriority = this.priorityListTemp[0].Max_Allowed;
    } else {
      this.priorityListTemp = [];
      this.MaxPriority = 0; }}
  SaveStaffDetails() {
    this.submitted = true;
    if (this.staffDetailsForm.invalid) {
      this.logValidationErrors();
      return;
    }
    if (this.editedVendorStaff !== undefined) {
      if (
        this.staffDetailsForm.get('designation').value === this.editedVendorStaff.VendorStaffConfigID
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

  SearchStaffDetails(searchText = '') {
    this.searchText = searchText;
    this.GetVendorStaffs(1);
  }
}
