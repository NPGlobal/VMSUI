import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorStaffService } from 'src/app/Services/vendor-staff.service';
import { VendorStaff } from 'src/app/Models/VendorStaff';
import { StaffDetails } from 'src/app/Models/staff-details';
import { ValidationMessagesService } from 'src/app/Services/validation-messages.service';

@Component({
  selector: 'app-staff-details',
  templateUrl: './staff-details.component.html',
  styleUrls: ['./staff-details.component.css']
})
export class StaffDetailsComponent implements OnInit {

  //#region Form Variables and Patterns
  invalid = false;
  priority = 1;
  vendorcode: string;
  AlphabetPattern = '^[a-zA-Z ]*[\.\]?[a-zA-Z ]*$';
  AddressAndRemarksPattern = /^[+,?-@()\.\-#'&%\/\w\s]*$/;
  PhonePattern = '^[0-9]{10}$';
  NumericPattern = '^[0-9]*$';
  deptList: any[];
  deptSelectList = [];
  designationList: any[];
  vendorDesignationList: any[];
  _originalValue: string;
  //  priorityListTemp: any[];
  submitted = false;
  vendorstaffList: VendorStaff[]; // For added Staff List
  VendorStaff: VendorStaff; // For form value save and update
  editedVendorStaff: any; // For Check of Vendor Staff Edited Value
  staffDetailsForm: FormGroup;
  ActionMessage: string;
  //  MaxPriority = 0;
  staffDetailsList: StaffDetails[];
  vendorStaffDetail: StaffDetails;
  inEditedMode: boolean;
  inDeletedMode: boolean;
  isDeactVendor = false;

  //#endregion

  //#region Modal Popup and Alert
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
  //#endregion

  //#region paging variables
  totalItems = 0;
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[];
  //#endregion

  //#region Search Variables
  searchText = '';
  searchByName: string;
  searchByDepartment: string;
  searchByDesignation: string;
  searchByEmail: string;
  searchByPhone: string;
  //#endregion

  constructor(
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _pager: PagerService,
    private _vendorService: VendorStaffService,
    private _validationMess: ValidationMessagesService) {
  }

  //#region Validation Message
  ValidationMessages = {
    'Designation': {
      'required': ''
    },
    'ContactName': {
      'required': '',
      'pattern': this._validationMess.ContactNamePattern
    },
    'ContactEmail': {
      'email': this._validationMess.EmailPattern
    },
    'ContactPhone': {
      'required': '',
      'maxlength': this._validationMess.PhonePattern,
      'pattern': this._validationMess.PhonePattern
    },
    'Remarks': {
      'pattern': this._validationMess.RemarksPattern
    }
  };

  formErrors = {
    'Designation': '',
    'ContactName': '',
    'ContactEmail': '',
    'ContactPhone': '',
    'Remarks': ''
  };
  //#endregion

  //#region MultiSelect Dropdown Settings
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
  //#endregion

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

  //#region Form Initialization
  InitializeFormControls() {
    this.staffDetailsForm = this._fb.group({
      Designation: [this.vendorStaffDetail.Designation, Validators.required],
      ContactName: [this.vendorStaffDetail.ContactName, [Validators.required, Validators.pattern(this.AlphabetPattern)]],
      ContactEmail: [this.vendorStaffDetail.ContactEmail, Validators.email],
      ContactPhone: [this.vendorStaffDetail.ContactPhone, [
        Validators.required, Validators.maxLength(10), Validators.pattern(this.PhonePattern)
      ]],
      Remarks: [this.vendorStaffDetail.Remarks, Validators.pattern(this.AddressAndRemarksPattern)]
    });
    if (localStorage.getItem('VendorStatus') === 'D') {
      this.isDeactVendor = true;
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
  //#endregion

  //#region Data Binding and Search
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

  GetVendorDepartments() {
    if (this.staffDetailsForm.get('Designation').value === null) {
      this.deptList = [];
      this.deptSelectList = [];
    } else {
      this._vendorService.GetVendorsDeptStaff('10', this.staffDetailsForm.get('Designation').value, this.vendorcode, 'Department')
        .subscribe((data) => {
          this.deptList = data;
          if (this.staffDetailsForm.get('Designation').value !== null && this.deptSelectList[0] !== undefined) {

            const deptArry = [];
            for (let counterVar = 0; counterVar < this.deptSelectList.length; ++counterVar) {
              const index = this.deptList.findIndex((obj) => obj.DeptCode === this.deptSelectList[counterVar].DeptCode);
              if (index > -1) {
                deptArry.push(this.deptList[index]);
              }
            }

            this.deptSelectList = deptArry;

            if (!this.inEditedMode) {
              this.vendorstaffList = [];
              this.onDeptSelectAll(this.deptSelectList);
            }
            // const strArray = this.deptList.find((obj) => obj.DeptCode === this.deptSelectList[0].DeptCode
            //   && this.staffDetailsForm.get('Designation').value === obj.Designation);
            // if (strArray === undefined) {
            //   this.deptSelectList = [];
            // }
          }
        });
    }
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
  //#endregion

  //#region Dropdown Change Events
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
    } else if (existingIndex === -1) {
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

  onDeptDeSelectAll(items: any) {
    this.invalid = false;
    items = this.deptSelectList;
    for (let i = 0; i < items.length; ++i) {
      this.onDeptDeselect(items[i]);
    }
  }
  //#endregion

  //#region Validations
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

  ValidateDepartment() {
    if (this.deptSelectList.length === 0) {
      this.invalid = true;
    } else { this.invalid = false; }
  }

  //#endregion

  //#region Save Form Data
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

      const exitingObjIndex = existingDesignationStaffs.findIndex(x => x.Designation === this.vendorStaffDetail.Designation &&
        x.DepartmentList === this.vendorStaffDetail.DepartmentList &&
        x.ContactName === this.vendorStaffDetail.ContactName &&
        x.ContactPhone === this.vendorStaffDetail.ContactPhone);
      if (exitingObjIndex > -1) {
        existingDesignationStaffs.splice(exitingObjIndex, 1);
      }
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

  sendFormData() {
    if (!this.inDeletedMode) {
      const vendorStaff = new VendorStaff();

      vendorStaff.Designation = this.staffDetailsForm.get('Designation').value;
      vendorStaff.VendorShortCode = this.vendorcode;
      vendorStaff.CompanyCode = '10';
      vendorStaff.ContactName = this.staffDetailsForm.get('ContactName').value.trim();
      vendorStaff.ContactEmail = (this.staffDetailsForm.get('ContactEmail').value !== null &&
        this.staffDetailsForm.get('ContactEmail').value !== undefined) ? this.staffDetailsForm.get('ContactEmail').value.trim() : '';
      vendorStaff.ContactPhone = this.staffDetailsForm.get('ContactPhone').value;
      vendorStaff.Remarks = (this.staffDetailsForm.get('Remarks').value !== null &&
        this.staffDetailsForm.get('Remarks').value !== undefined) ? this.staffDetailsForm.get('Remarks').value.trim() : '';
      vendorStaff.VendorStaffConfigID = 0;

      this.vendorstaffList.filter(data => {
        data.Designation = vendorStaff.Designation;
        data.CompanyCode = vendorStaff.CompanyCode;
        data.VendorShortCode = vendorStaff.VendorShortCode;
        data.ContactName = vendorStaff.ContactName;
        data.ContactPhone = vendorStaff.ContactPhone;
        data.ContactEmail = vendorStaff.ContactEmail;
        data.Remarks = vendorStaff.Remarks;
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
          this.GetVendorStaffs(this.currentPage);
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
  //#endregion

  //#region Delete or Reset Form Data
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

  DeleteStaffDetailPopup(vobj: VendorStaff) {
    vobj.Status = 'D';
    this.VendorStaff = vobj;
    this.InitializeFormControls();
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
    this.vendorstaffList = [];
    this.vendorStaffDetail = new StaffDetails();
    this.InitializeFormControls();
    this.logValidationErrors();
    this.editedVendorStaff = undefined;
  }
  //#endregion

}
