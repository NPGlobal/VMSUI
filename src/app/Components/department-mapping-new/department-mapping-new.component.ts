import { Component, OnInit, ViewChild, ElementRef, SimpleChanges, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { VendorService } from 'src/app/Services/vendor.service';
import { Vendor } from 'src/app/Models/vendor';
import { MasterDataDetails } from 'src/app/Models/master-data-details';
import { MasterDataDetailsService } from 'src/app/Services/master-data-details.service';

@Component({
  selector: 'app-department-mapping-new',
  templateUrl: './department-mapping-new.component.html',
  styleUrls: ['./department-mapping-new.component.css']
})
export class DepartmentMappingNewComponent implements OnInit {

  //#region Variable Declaration
  VendorCode = '';
  AllList: MasterDataDetails[] = [];
  DivisionList: MasterDataDetails[] = [];
  DepartmentList: MasterDataDetails[] = [];
  SelectedDD: MasterDataDetails[] = [];

  DepartmentMappingForm: FormGroup;
  vendor: Vendor = new Vendor();
  isDataExist = false;
  CheckData = 0;
  Temp: MasterDataDetails[] = [];
  isDeactVendor = false;
  //#endregion

  //#region Modal Popup and Alert
  @ViewChild('alertModalButton')
  alertModalButton: ElementRef;
  PopUpMessage: string;
  alertButton: any;

  @ViewChild('DeleteModalButton')
  DeleteModalButton: ElementRef;
  deleteButton: any;
  //#endregion

  constructor(private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _vendorService: VendorService,
    private _mddService: MasterDataDetailsService) { }

  ngOnInit() {
    this.alertButton = this.alertModalButton.nativeElement as HTMLElement;
    this.deleteButton = this.DeleteModalButton.nativeElement as HTMLElement;

    this._route.parent.paramMap.subscribe((data) => {
      this.VendorCode = (data.get('code'));
      this._mddService.GetDepartmentMappingDetails(this.VendorCode)
        .subscribe((result) => {
          this.AllList = result.data.Table;
          this.SelectedDD = result.data.Table1;
          this.CheckData = this.SelectedDD.length;
          this.BindData();
        });
    });
    this.InitializeFormControls();
  }

  //#region Form Initilization
  InitializeFormControls() {
    this.DepartmentMappingForm = this._fb.group({
      Division: ['-1'],
      DivList: [''],
      Department: [''],
      SelectedList: ['']
    });
    if (localStorage.getItem('VendorStatus') === 'D') {
      this.DepartmentMappingForm.disable();
      this.isDeactVendor = true;
    }
  }
  //#endregion

  //#region Data Binding
  BindData() {
    // this.DivisionList = this.AllList.filter(x => x.MDHCode === 'DIVISION');
    // this.DepartmentList = this.AllList.filter(x => x.MDHCode === 'DEPT');

    let divisionCode = this.DepartmentMappingForm.get('Division').value;
    if (divisionCode === '-1') {
      // 1 is Used for Message (Select Division), and -1 is Used for Message (All Division) in division dropdown.
      divisionCode = this.SelectedDD.length > 0 ? '1' : '-1';
    }
    this.DepartmentMappingForm.get('Division').patchValue(divisionCode);

    // if (this.SelectedDD.length === 0) {
    //   // If there are no record saved in database
    //   this.GetDivisionsAndDepartment();
    // } else {
    this.GetDivision();
    this.GetDepartment();
    // }

    this.SelectedDD.sort((a, b) => a.type.localeCompare(b.type));
    this.SelectedDD.reverse();
  }

  // GetDivisionsAndDepartment() {
  //   this.DivisionList = this.AllList.filter(x => x.MDHCode === 'DIVISION');
  //   this.DepartmentList = this.AllList.filter(x => x.MDHCode === 'DEPT');
  // }

  GetDivision() {
    // Here we filtered division from selected list.
    const selectedDivisionList = this.SelectedDD.filter(x => x.MDHCode === 'DIVISION');

    // Here we filtered division from all division and department list.
    const filterdDivisionList = this.AllList.filter(x => x.MDHCode === 'DIVISION');

    // Here we remove those division which already exist in selectd division list.
    this.DivisionList = filterdDivisionList.filter(function (el) {
      return selectedDivisionList.findIndex(x => x.MDDCode === el.MDDCode) >= 0 ? null : el;
    });

    // this.DivisionList = [];
    // this.Temp = this.AllList.filter(x => x.MDHCode === 'DIVISION');
    // for (let i = 0; i < this.Temp.length; i++) {
    //   this.isDataExist = Boolean(this.SelectedDD.find(x => x.MDDCode === this.Temp[i].MDDCode &&
    //     x.ParentMDDCode === this.Temp[i].ParentMDDCode));
    //   if (!this.isDataExist) {
    //     this.DivisionList.push(this.Temp[i]);
    //   }
    // }
    // this.isDataExist = false;
    // this.Temp = [];
  }

  GetDepartment() {
   // this.DepartmentMappingForm.get('DivList').patchValue(0);
   const divisionCode = this.DepartmentMappingForm.get('Division').value;
    if (divisionCode !== '1') {
      // Here we filtered those department which belongs to selected division from selected list.
      const selectedDepartmentList = this.SelectedDD.filter(x => x.MDHCode === 'DEPT' &&
        x.ParentMDDCode === (divisionCode === '-1' ? x.ParentMDDCode : divisionCode));

      // Here we filtered those department which belongs to selected division.
      const filterdDepartmentList = this.AllList.filter(x => x.MDHCode === 'DEPT' &&
        x.ParentMDDCode === (divisionCode === '-1' ? x.ParentMDDCode : divisionCode));

      // Here we remove those department which already exist in selectd department list.
      this.DepartmentList = filterdDepartmentList.filter(function (el) {
        return selectedDepartmentList.findIndex(x => x.MDDCode === el.MDDCode) >= 0 ? null : el;
      });
    } else {
      this.DepartmentList = [];
    }
  }
  //#endregion

  // added by shubhi
  UnselectDept() {
  this.DepartmentMappingForm.get('Department').patchValue(0);
  }
  UnselectDiv() {
  this.DepartmentMappingForm.get('DivList').patchValue(0);
  }


  //#region Division/Department Add/Remove
  checkAddedDivisionDepartment(stringArr: string[]) {
    for (let i = 0; i < stringArr.length; ++i) {
      if (!this.isDataExist) {
        this.isDataExist = Boolean(this.SelectedDD.find(function (value) { return value.ParentMDDCode === stringArr[i]; }));
      }
    }
    return this.isDataExist;
  }
  MoveToSelectedList() {
    const div = this.DepartmentMappingForm.get('DivList').value as Array<string>;
    const dept = this.DepartmentMappingForm.get('Department').value as Array<string>;
    if (div.length > 0) {
    //  this.DepartmentMappingForm.get('Department').value = '';
      if (this.checkAddedDivisionDepartment(div)) {
        this.PopUpMessage = 'Department(s) of selected division already exist. Do you want to replace it?';
        this.isDataExist = false;
        this.deleteButton.click();
      } else {
        for (let i = 0; i < this.DivisionList.length; i++) {
          if (div.includes(this.DivisionList[i].MDDCode)) {
            this.DivisionList[i].color = 'lightyellow';
            this.DivisionList[i].isDeletable = 'Y';
            this.DivisionList[i].type = 'Division';
            this.SelectedDD.push(this.DivisionList[i]);
          }
        }
      this.BindData();
      }
    }
    if (dept.length > 0) {
    for (let i = 0; i < this.DepartmentList.length; i++) {
        if (dept.includes(this.DepartmentList[i].MDDCode)) {
          this.DepartmentList[i].color = 'rgb(194, 248, 194)';
          this.DepartmentList[i].isDeletable = 'Y';
          this.DepartmentList[i].type = 'Department';
          this.SelectedDD.push(this.DepartmentList[i]);
        }
      }
      this.BindData();
    }
  }
  RemoveFromSelectedList() {
    const stringArr = this.DepartmentMappingForm.get('SelectedList').value as Array<string>;
    for (let i = 0; i < stringArr.length; ++i) {
      if (this.SelectedDD[i].isDeletable === 'Y') {
        this.SelectedDD = this.SelectedDD.filter(function (value) {
          if (value.MDDCode !== stringArr[i]) {
            return value;
          }
        });
        this.BindData();
      } else {
        this.PopUpMessage = 'Cannot delete this data.';
        this.alertButton.click();
        return;
      }
    }
  }

  DeleteExistingDepartment() {
    const stringArr = this.DepartmentMappingForm.get('DivList').value as Array<string>;
    for (let i = 0; i < stringArr.length; ++i) {
      this.SelectedDD = this.SelectedDD.filter(function (value) {
        if (value.ParentMDDCode !== stringArr[i]) {
          return value;
        }
      });
    }
    for (let i = 0; i < this.DivisionList.length; i++) {
      if (stringArr.includes(this.DivisionList[i].MDDCode)) {
        this.DivisionList[i].color = 'lightyellow';
        this.DivisionList[i].isDeletable = 'Y';
        this.DivisionList[i].type = 'Division';
        this.SelectedDD.push(this.DivisionList[i]);
      }
    }
    this.BindData();
  }

  // DeleteExistingDepartment() {
  //   const stringArr = this.DepartmentMappingForm.get('DivList').value as Array<string>;
  //   for (let i = 0; i < stringArr.length; ++i) {
  //     this.SelectedDD = this.SelectedDD.filter(function (value) {
  //       if (value.ParentMDDCode !== stringArr[i]) {
  //         return value;
  //       }
  //     });
  //   }
  //   for (let i = 0; i < this.DivisionList.length; i++) {
  //     if (stringArr.includes(this.DivisionList[i].MDDCode)) {
  //       this.DivisionList[i].color = 'lightyellow';
  //       this.DivisionList[i].isDeletable = 'Y';
  //       this.DivisionList[i].type = 'Division';
  //       this.SelectedDD.push(this.DivisionList[i]);
  //     }
  //   }
  //   this.GetDivision();
  //   this.DepartmentList = [];
  //   this.DepartmentMappingForm.get('Division').patchValue('1');
  // }
  //#endregion

  //#region Save Form Data
  makeVendorDeptString(): string {
    let ex = '';
    ex = this.SelectedDD.map(function (val) {
      return (val.ParentMDDCode === '' ? val.MDDCode : val.ParentMDDCode) + '~' +
        (val.ParentMDDCode === '' ? '-1' : val.MDDCode);
    }).join();

    return ex;
  }


  SaveVendorDepartment() {

    const vendor = new Vendor();
    vendor.VendorCode = this.VendorCode;
    vendor.Vendor_Depts = this.makeVendorDeptString();

    if (this.CheckData === this.SelectedDD.length) {
      this.PopUpMessage = 'There is no new data to update.';
      this.alertButton.click();
      return;
    }

    try {
      this._vendorService.SaveVendorDepartments(vendor).subscribe((result => {
        if (result.data.Table[0].ResultCode === 0) {
          this._mddService.GetDepartmentMappingDetails(this.VendorCode)
            .subscribe((NewResult) => {
              this.AllList = NewResult.data.Table;
              this.SelectedDD = NewResult.data.Table1;
              this.CheckData = this.SelectedDD.length;
              this.BindData();
            });
          this.PopUpMessage = result.data.Table[0].Message;
          this.alertButton.click();
        } else {
          this.PopUpMessage = result.data.Table[0].Message;
          this.alertButton.click();
        }
      }));
    } catch {
      this.PopUpMessage = 'There are some technical error. Please contact administrator.';
      this.alertButton.click();
    }
  }
  //#endregion
}
