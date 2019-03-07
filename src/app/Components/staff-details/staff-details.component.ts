import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorStaffService } from 'src/app/Services/vendor-staff.service';
import { VendorStaff } from 'src/app/Models/VendorStaff';
import { CommonModule, NgStyle } from '@angular/common';
import { MasterDataDetails } from 'src/app/Models/master-data-details';
import { StaffDetails } from 'src/app/Models/staff-details';
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
  vendorDesignationList: any[];
  //  priorityListTemp: any[];
  submitted = false;
  vendorstaffList: VendorStaff[]; // For added Staff List
  VendorStaff: VendorStaff; // For form value save and update
  editedVendorStaff: any; // For Check of Vendor Staff Edited Value
  staffDetailsForm: FormGroup;
  ActionMessage: string;
  //  MaxPriority = 0;
  @ViewChild('alertModalOpen')
  alertModalOpen: ElementRef;
  alertModalOpenBtn: HTMLElement;
  PopUpMessage: string;

  @ViewChild('modalClose')
  modalClose: ElementRef;
  modalCloseBtn: HTMLElement;

  @ViewChild('deleteModalOpen')
  deleteModalOpen: ElementRef;
  deleteModalOpenBtn: HTMLElement;

  @ViewChild('deleteModalClose')
  deleteModalClose: ElementRef;
  deleteModalCloseBtn: HTMLElement;
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

  staffDetailsList: StaffDetails[];
  vendorStaffDetail: StaffDetails;
  inEditedMode: boolean;
  inDeletedMode: boolean;

  constructor(
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _pager: PagerService,
    private _vendorService: VendorStaffService) {
  }

  ValidationMessages = {
    'Designation': {
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
    }
  };

  formErrors = {
    'Designation': '',
    'ContactName': '',
    'ContactEmail': '',
    'ContactPhone': ''
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

  ngOnInit() {
    this.searchByName = '';
    this.searchByDepartment = '';
    this.searchByDesignation = '';
    this.searchByEmail = '';
    this.searchByPhone = '';

    this.alertModalOpenBtn = this.alertModalOpen.nativeElement as HTMLElement;
    this.modalCloseBtn = this.modalClose.nativeElement as HTMLElement;
    this.deleteModalOpenBtn = this.deleteModalOpen.nativeElement as HTMLElement;
    this.deleteModalCloseBtn = this.deleteModalClose.nativeElement as HTMLElement;

    this.inEditedMode = false;
    this.inDeletedMode = false;

    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorStaffs(this.currentPage);
    });
    this.EditStaffDetails(null);
    // this.staffDetailsForm.get('Designation').patchValue(null);
    this.GetVendorDesignation();

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

  InitializeFormControls() {
    this.staffDetailsForm = this._fb.group({
      Designation: [this.vendorStaffDetail.Designation, Validators.required],
      ContactName: [this.vendorStaffDetail.ContactName, Validators.required],
      ContactEmail: [this.vendorStaffDetail.ContactEmail, Validators.email],
      ContactPhone: [this.vendorStaffDetail.ContactPhone, [
        Validators.required, Validators.maxLength(10), Validators.pattern(this.PhonePattern)
      ]],
      Remarks: [this.vendorStaffDetail.Remarks]
    });
  }

  dismiss() {
    this.inEditedMode = false;
    this.inDeletedMode = false;
    this.invalid = false;
    this.submitted = false;
    this.deleteModalCloseBtn.click();
    this.modalCloseBtn.click();
    this.deptList = [];
    this.deptSelectList = null;
    this.vendorStaffDetail = new StaffDetails();
    this.InitializeFormControls();
    this.logValidationErrors();
    this.editedVendorStaff = undefined;
  }

  GetVendorStaffs(index: number) {
    this.currentPage = index;
    this._vendorService.GetVendorStaffByVendorCode(this.vendorcode, this.currentPage, this.pageSize, this.searchText)
      .subscribe(data => {
        if (data.VendorStaff.length > 0) {
          this.staffDetailsList = data.VendorStaff;
          this.totalItems = data.VendorStaffCount[0].TotalVendors;
          this.GetVendorsStaffList();
        } else {
          this.pagedItems = undefined;
        }
      });
  }

  GetVendorsStaffList() {
    this.pager = this._pager.getPager(this.totalItems, this.currentPage, this.pageSize);
    this.pagedItems = this.staffDetailsList;
  }

  GetVendorDesignation() {
    this._vendorService.GetVendorDesignation('10', '-1', this.vendorcode, 'Designation').subscribe((data) => {
      this.designationList = data;
    });
  }

  onDeptSelect(items: any) {
    this.invalid = false;

    const vStaff = new VendorStaff();
    vStaff.VendorStaffDetailsID = 0;
    vStaff.VendorStaffConfigID = 0;
    vStaff.DeptCode = items.DeptCode;
    vStaff.Designation = this.staffDetailsForm.get('Designation').value;
    vStaff.Status = 'A';

    this.vendorStaffDetail.Designation = vStaff.Designation;

    const existingIndex = this.vendorstaffList.findIndex(x => x.Designation === vStaff.Designation && x.DeptCode === vStaff.DeptCode);

    if (this.inEditedMode && existingIndex > -1) {
      this.vendorstaffList[existingIndex].Status = 'A';
    } else {
      this.vendorstaffList.push(vStaff);
    }
  }

  onDeptDeselect(items: any) {
    const vStaff = new VendorStaff();
    vStaff.DeptCode = items.DeptCode;
    vStaff.Designation = this.staffDetailsForm.get('Designation').value;

    const existingIndex = this.vendorstaffList.findIndex(x => x.Designation === vStaff.Designation && x.DeptCode === vStaff.DeptCode);

    if (this.inEditedMode && existingIndex > -1) {
      this.vendorstaffList[existingIndex].Status = 'D';
    } else {
      this.vendorstaffList.splice(existingIndex, 1);
    }
  }

  onDeptSelectAll(items: any) {
    this.invalid = false;

    for (let i = 0; i < items.length; ++i) {
      this.onDeptSelect(items[i]);
    }
  }

  GetVendorDepartments() {
    if (this.staffDetailsForm.get('Designation').value === null) {
      this.deptList = [];
      this.deptSelectList = [];
    } else {
      this._vendorService.GetVendorsDeptStaff('10', this.staffDetailsForm.get('Designation').value, this.vendorcode, 'Department')
        .subscribe((data) => {
          this.deptList = data;
          if (this.staffDetailsForm.get('Designation').value !== null && this.deptSelectList[0] !== undefined) {
            const strArray = this.deptList.find((obj) => obj.DeptCode === this.deptSelectList[0].DeptCode);
            if (strArray === undefined) {
              this.deptSelectList = [];
            }
          }
        });
    }
  }

  ValidateDepartment() {
    if (this.deptSelectList.length === 0) {
      this.invalid = true;
    } else { this.invalid = false; }
  }

  SaveStaffDetails() {
    this.submitted = true;
    if (this.staffDetailsForm.invalid || this.deptSelectList.length === 0) {
      this.logValidationErrors();
      this.ValidateDepartment();
      return;
    }

    if (!this.inDeletedMode && this.staffDetailsList !== undefined) {
      const vendorStaff = new VendorStaff();

      vendorStaff.Designation = this.staffDetailsForm.get('Designation').value;
      vendorStaff.ContactName = this.staffDetailsForm.get('ContactName').value.trim();
      vendorStaff.ContactEmail = this.staffDetailsForm.get('ContactEmail').value;
      vendorStaff.ContactPhone = this.staffDetailsForm.get('ContactPhone').value;

      const selectedDeptList = this.deptSelectList;
      const existingDesignationStaffs = this.staffDetailsList.filter(x => x.Designation === vendorStaff.Designation &&
        x.ContactPhone === vendorStaff.ContactPhone);
      let isExist = false;
      existingDesignationStaffs.filter(function (element) {
        const isFind = element.DeptList.split(',').filter(y => selectedDeptList.find(a => a.DeptCode.toLowerCase() === y.toLowerCase()));
        if (isFind.length > 0) {
          isExist = true;
        }
      });
      if (isExist) {
        this.PopUpMessage = 'This data already exists.';
        this.alertModalOpenBtn.click();
        return;
      }
    }
    this.sendFormData();
  }

  DeleteStaffDetails(vobj: StaffDetails) {
    this.inDeletedMode = true;
    this.vendorstaffList = [];
    let vStaff: VendorStaff;
    for (let i = 0; i < vobj.DeptList.split(',').length; ++i) {
      vStaff = new VendorStaff();
      vStaff.CompanyCode = '10';
      vStaff.VendorShortCode = this.vendorcode;
      vStaff.ContactName = vobj.ContactName;
      vStaff.ContactPhone = vobj.ContactPhone;
      vStaff.ContactEmail = vobj.ContactEmail;
      vStaff.DeptCode = vobj.DeptList.split(',')[i];
      vStaff.VendorStaffConfigID = Number(vobj.ConfigIdsList.split(',')[i]);
      vStaff.VendorStaffDetailsID = Number(vobj.StaffIdsList.split(',')[i]);
      vStaff.Department = vobj.DepartmentList.split(',')[i];
      vStaff.Status = 'D';
      vStaff.DeptCode = vobj.DeptList.split(',')[i];
      vStaff.ContactName = vobj.ContactName;
      vStaff.ContactEmail = vobj.ContactEmail;
      vStaff.ContactPhone = vobj.ContactPhone;
      vStaff.Remarks = vobj.Remarks;
      vStaff.Designation = vobj.Designation;
      this.vendorstaffList.push(vStaff);
    }
    this.vendorStaffDetail = JSON.parse(JSON.stringify(vobj));
  }

  sendFormData() {
    if (!this.inDeletedMode) {
      const vendorStaff = new VendorStaff();

      vendorStaff.Designation = this.staffDetailsForm.get('Designation').value;
      vendorStaff.VendorShortCode = this.vendorcode;
      vendorStaff.CompanyCode = '10';
      vendorStaff.ContactName = this.staffDetailsForm.get('ContactName').value.trim();
      vendorStaff.ContactEmail = this.staffDetailsForm.get('ContactEmail').value;
      vendorStaff.ContactPhone = this.staffDetailsForm.get('ContactPhone').value;
      vendorStaff.Remarks = (this.staffDetailsForm.get('Remarks').value !== null ||
        this.staffDetailsForm.get('Remarks').value !== undefined) ? '' : this.staffDetailsForm.get('Remarks').value.trim();
      vendorStaff.VendorStaffConfigID = 0;

      this.vendorstaffList.filter(data => {
        data.Designation = vendorStaff.Designation;
        data.CompanyCode = vendorStaff.CompanyCode;
        data.VendorShortCode = vendorStaff.VendorShortCode;
        data.ContactName = vendorStaff.ContactName;
        data.ContactPhone = vendorStaff.ContactPhone;
        data.ContactEmail = vendorStaff.ContactEmail;
      });
    }

    this.vendorStaffDetail.VendorStaffDetails = this.vendorstaffList;
    try {
      this._vendorService.SaveStaffInfo(this.vendorStaffDetail).subscribe((result) => {
        if (result.Error === '' && result.data.Msg[0].Result === 0) {
          this.staffDetailsList = result.data.VendorStaff;
          this.totalItems = result.data.VendorStaffCount[0].TotalVendors;
          this.GetVendorsStaffList();
          this.PopUpMessage = result.data.Msg[0].Message;
          this.alertModalOpenBtn.click();
          this.dismiss();
        } else {
          this.PopUpMessage = result.data.Msg[0].Message;
          this.alertModalOpenBtn.click();
        }
      });
    } catch {
      this.PopUpMessage = 'There are some technical error. Please contact administrator.';
      this.alertModalOpenBtn.click();
    }
  }

  EditStaffDetails(vobj: StaffDetails) {
    this.vendorstaffList = [];
    let vStaff: VendorStaff;
    if (vobj === null) {
      vobj = new StaffDetails();
    } else {
      this.inEditedMode = true;
      for (let i = 0; i < vobj.DeptList.split(',').length; ++i) {
        vStaff = new VendorStaff();
        vStaff.DeptCode = vobj.DeptList.split(',')[i];
        vStaff.VendorStaffConfigID = Number(vobj.ConfigIdsList.split(',')[i]);
        vStaff.VendorStaffDetailsID = Number(vobj.StaffIdsList.split(',')[i]);
        vStaff.Department = vobj.DepartmentList.split(',')[i];
        vStaff.Status = 'A';
        vStaff.DeptCode = vobj.DeptList.split(',')[i];
        vStaff.ContactName = vobj.ContactName;
        vStaff.ContactEmail = vobj.ContactEmail;
        vStaff.ContactPhone = vobj.ContactPhone;
        vStaff.Remarks = vobj.Remarks;
        vStaff.Designation = vobj.Designation;
        this.vendorstaffList.push(vStaff);
      }
    }
    this.vendorStaffDetail = JSON.parse(JSON.stringify(vobj));

    this.InitializeFormControls();
    if (this.inEditedMode) {
      this.vendorDesignationList = this.designationList.filter(x => x.Designation === vobj.Designation);
      this.staffDetailsForm.get('Designation').disable();
    } else {
      this.vendorDesignationList = this.designationList;
      this.staffDetailsForm.get('Designation').enable();
    }

    this.GetVendorDepartments();
    this.deptSelectList = this.vendorstaffList.map(function (element) {
      return {
        DeptCode: element.DeptCode, DeptName: element.Department
      };
    });
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
