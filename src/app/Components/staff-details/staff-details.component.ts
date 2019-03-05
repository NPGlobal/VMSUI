import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorStaffService } from 'src/app/Services/vendor-staff.service';
import { VendorStaff } from 'src/app/Models/VendorStaff';
import { CommonModule, NgStyle } from '@angular/common';
import { MasterDataDetails } from 'src/app/Models/master-data-details';
declare var $: any;

@Component({
  selector: 'app-staff-details',
  templateUrl: './staff-details.component.html',
  styleUrls: ['./staff-details.component.css']
})
export class StaffDetailsComponent implements OnInit {
  invalid = false;
  priority = 1;
  vendorcode: string;
  PhonePattern = '^[0-9]{10}$';
  NumericPattern = '^[0-9]*$';
  deptList: any[];
  deptSelectList = [];
  designationList: any[];
  //  priorityListTemp: any[];
  submitted = false;
  vendorstaffList: VendorStaff[]; // For added Staff List
  VendorStaff: VendorStaff; // For form value save and update
  editedVendorStaff: any; // For Check of Vendor Staff Edited Value
  staffDetailsForm: FormGroup;
  ActionMessage: string;
  //  MaxPriority = 0;
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
  // Search Variables
  searchText = '';
  searchByName: string;
  searchByDepartment: string;
  searchByDesignation: string;
  searchByEmail: string;
  searchByPhone: string;

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
      'required': '',
      'maxlength': 'Should not exceed 10 characters',
      'pattern': 'Please enter a valid phone'
    },
    // 'priority': {
    //   'required': ''
    // }
  };
  formErrors = {
    'dept': '',
    'designation': '',
    'ContactName': '',
    'ContactEmail': '',
    'ContactPhone': '',
    //  'priority': ''
  };
  deptDropdownSettings = {
    singleSelection: false,
    idField: 'DeptCode',
    textField: 'DeptName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    itemsShowLimit: 1,
    allowSearchFilter: true,
    noDataAvailablePlaceholderText: 'No records'
  };
  // PriorityList(n: any): any[] {
  //   return Array(n);
  // }
  ngOnInit() {
    this.searchByName = '';
    this.searchByDepartment = '';
    this.searchByDesignation = '';
    this.searchByEmail = '';
    this.searchByPhone = '';
    this.openModal();
    this.el = this.modalOpenMsgButton.nativeElement as HTMLElement;
    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorStaffs(this.currentPage);
    });
    this.staffDetailsForm.get('designation').patchValue(null);
    this.GetVendorDesignation();
    // this.staffDetailsForm.valueChanges.subscribe((data) => {
    //   this.logValidationErrors();
    // });
    this.GetVendorStaffs(this.currentPage);
  }
  logValidationErrors(group: FormGroup = this.staffDetailsForm): void {
    // this.ValidateDepartment();
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
    this.VendorStaff.dept = '';
    this.VendorStaff.Designation = '';
    this.VendorStaff.VendorCode = '';
    this.VendorStaff.ContactName = '';
    this.VendorStaff.ContactEmail = '';
    this.VendorStaff.ContactPhone = null;
    this.VendorStaff.Priority = 1;
    this.VendorStaff.Status = 'A';
    this.VendorStaff.Remarks = '';
    // this.deptSelectList = null;
  }
  InitializeFormControls() {
    this.staffDetailsForm = this._fb.group({
      //   VendorStaffConfigId: [this.VendorStaff.VendorStaffConfigId],
      VendorStaffDetailsId: [this.VendorStaff.VendorStaffDetailsId],
      dept: [this.VendorStaff.dept],
      designation: [this.VendorStaff.Designation, Validators.required],
      ContactName: [this.VendorStaff.ContactName, Validators.required],
      ContactEmail: [this.VendorStaff.ContactEmail, Validators.email],
      ContactPhone: [this.VendorStaff.ContactPhone, [
        Validators.required, Validators.maxLength(10), Validators.pattern(this.PhonePattern)
      ]],
      priority: [this.VendorStaff.Priority],
      Status: [this.VendorStaff.Status],
      remarks: [this.VendorStaff.Remarks]
    });
  }
  openModal() {
    this.InitializeFormControls();
  }
  dismiss() {
    // this.MaxPriority = 0;
    this.invalid = false;
    this.submitted = false;
    this.deptList = [];
    this.deptSelectList = null;
    this.CreateNewVendorStaff();
    this.InitializeFormControls();
    this.logValidationErrors();
    // this.DesignationList = [];
    this.editedVendorStaff = undefined;
    //  this.staffDetailsForm.get('Designation').patchValue(null);
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

  GetSelectedDepartments(selectedItems: any) {
    this.deptSelectList = selectedItems;
    if (selectedItems === null || selectedItems === undefined) {
      this.formErrors.dept = 'required';
    }
  }
  onDeptSelect(items: any) {
    this.invalid = false;
  }
  onDeptSelectAll(items: any) {
    this.invalid = false;
  }
  GetVendorDepartments() {
    if (this.staffDetailsForm.get('designation').value === '') {
      this.deptList = [];
      this.deptSelectList = [];
    } else {
      this._vendorService.GetVendorsDeptStaff('10', this.staffDetailsForm.get('designation').value, this.vendorcode, 'Department')
        .subscribe((data) => {
          this.deptList = data;
          if (this.staffDetailsForm.get('designation').value !== null) {
            const strArray = this.deptList.find((obj) => obj.DeptCode === this.deptSelectList[0].DeptCode);
            if (strArray === undefined) {
              this.deptSelectList = [];
            }
          }
        });
    }
  }
  ValidateDepartment() {
    // tslint:disable-next-line:triple-equals
    if (this.VendorStaff.dept == '' || this.deptSelectList.length === 0) {
      this.invalid = true;
      // alert(this.invalid);
    } else { this.invalid = false; }
  }

  SaveStaffDetails() {
    this.submitted = true;
    //  alert(JSON.stringify(this.staffDetailsForm.value));
    if (this.staffDetailsForm.invalid || this.deptSelectList.length === 0) {
      this.logValidationErrors();
      this.ValidateDepartment();
      return;
    }
    if (this.editedVendorStaff !== undefined) {
      if (this.deptSelectList.map(function (element) {
        return element.DeptCode;
      }).join('~') === this.editedVendorStaff.dept
        // this.deptSelectList.find((obj) => obj.DeptCode ===  this.editedVendorStaff.dept)
        // this.deptSelectList.find() === this.editedVendorStaff.dept &&
        && this.staffDetailsForm.get('designation').value === this.editedVendorStaff.Designation
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
    this.deptSelectList = [{ DeptCode: this.VendorStaff.dept, DeptName: this.VendorStaff.Department }];
    this.sendFormData();
  }
  sendFormData() {
    const st = this.staffDetailsForm.get('Status').value;
    this.VendorStaff = new VendorStaff();
    this.VendorStaff.VendorStaffDetailsId = (this.staffDetailsForm.get('VendorStaffDetailsId').value === null)
      ? 0 : this.staffDetailsForm.get('VendorStaffDetailsId').value;
    // this.VendorStaff.VendorStaffConfigId = this.staffDetailsForm.get('Designation').value;
    this.VendorStaff.Designation = this.staffDetailsForm.get('designation').value.trim();
    this.VendorStaff.dept = this.deptSelectList.map(function (element) {
      return element.DeptCode;
    }).join('~');
    this.VendorStaff.VendorCode = this.vendorcode;
    this.VendorStaff.ContactName = this.staffDetailsForm.get('ContactName').value.trim();
    this.VendorStaff.ContactEmail = this.staffDetailsForm.get('ContactEmail').value.trim();
    this.VendorStaff.ContactPhone = (this.staffDetailsForm.get('ContactPhone').value === null)
      ? '' : this.staffDetailsForm.get('ContactPhone').value.trim();
    // this.VendorStaff.Priority = this.staffDetailsForm.get('priority').value;
    this.VendorStaff.Priority = this.priority;
    this.VendorStaff.Status = st;
    this.VendorStaff.Remarks = this.staffDetailsForm.get('remarks').value.trim();
    this.VendorStaff.CreatedBy = 999999;

    // console.log(JSON.stringify(this.VendorStaff));

    try {
      this._vendorService.SaveStaffInfo(this.VendorStaff).subscribe((data) => {
        if (data.Msg != null) {
          if (data.Msg[0].Result === 0) {
            this.VendorStaff = new VendorStaff();
            this.vendorstaffList = data.VendorStaff;
            this.totalItems = data.VendorStaffCount[0].TotalVendors;
            this.GetVendorsStaffList();
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
    this.GetVendorDepartments();
    this.deptSelectList = [{ DeptCode: vobj.dept, DeptName: vobj.Department }];
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
  SearchStaffList() {
    this.searchText = this.searchByName + '~' + this.searchByDepartment + '~' + this.searchByDesignation + '~' +
      this.searchByEmail + '~' + this.searchByPhone;
    this.SearchStaffDetails(this.searchText);
  }
}
