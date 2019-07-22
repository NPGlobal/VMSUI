import { Component, OnInit, ViewChild, ElementRef, SimpleChanges, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { VendorService } from 'src/app/Services/vendor.service';
import { Vendor } from 'src/app/Models/vendor';
import { MasterDataDetails } from 'src/app/Models/master-data-details';
import { MasterDataDetailsService } from 'src/app/Services/master-data-details.service';
import { throwIfEmpty } from 'rxjs/operators';

enum ActionType {
  OnPageInit,
  OnDivisionMove,
  OnDepartmentMove,
  OnRemoveItemFromSelected,
  OnReplaceDepartmentsByDivision,
  None
}

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
  CheckData: any;
  Temp: MasterDataDetails[] = [];
  isDeactVendor = false;

  isMoveToRightDisabled = true;
  isMoveToLeftDisabled = true;
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
          this.CheckData = JSON.parse(JSON.stringify(this.SelectedDD));
          this.BindData(ActionType.OnPageInit);
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
  BindData(actionType: ActionType = ActionType.None) {
    // this.DivisionList = this.AllList.filter(x => x.MDHCode === 'DIVISION');
    // this.DepartmentList = this.AllList.filter(x => x.MDHCode === 'DEPT');
    /* Commented by Praveen
        let divisionCode = this.DepartmentMappingForm.get('Division').value;
        if (divisionCode === '-1') {
          // 1 is Used for Message (Select Division), and -1 is Used for Message (All Division) in division dropdown.
          divisionCode = this.SelectedDD.length > 0 ? '1' : '-1';
        }
        this.DepartmentMappingForm.get('Division').patchValue(divisionCode);
    */
    // if (this.SelectedDD.length === 0) {
    //   // If there are no record saved in database
    //   this.GetDivisionsAndDepartment();
    // } else {
    this.GetDivision();

    if (actionType !== ActionType.None) {
      this.SetDefaultDivisionSelected(actionType);
    }

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
    if (divisionCode !== '1' && divisionCode !== '0') {
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
  UnselectDept(event) {
    this.DepartmentMappingForm.get('Department').patchValue(null);
    this.buttonsEnableDisable(event);
  }
  UnselectDiv(event) {
    this.DepartmentMappingForm.get('DivList').patchValue(null);
    this.buttonsEnableDisable(event);
  }

  UnselectDivDept(event) {
    this.DepartmentMappingForm.get('DivList').patchValue(null);
    this.DepartmentMappingForm.get('Department').patchValue(null);
    this.buttonsEnableDisable(event);
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
    if ((div === null && dept === null)) {
      return; // Do nothing if no item is selected
    }
    if (div !== null && div.length > 0) {
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
        this.BindData(ActionType.OnDivisionMove);
      }
    }
    if (dept !== null && dept.length > 0) {
      for (let i = 0; i < this.DepartmentList.length; i++) {
        if (dept.includes(this.DepartmentList[i].MDDCode)) {
          this.DepartmentList[i].color = 'rgb(194, 248, 194)';
          this.DepartmentList[i].isDeletable = 'Y';
          this.DepartmentList[i].type = 'Department';
          this.SelectedDD.push(this.DepartmentList[i]);
        }
      }
      this.BindData(ActionType.OnDepartmentMove);
    }
    this.DepartmentMappingForm.get('SelectedList').patchValue(null);
  }

  RemoveFromSelectedList() {
    const stringArr = this.DepartmentMappingForm.get('SelectedList').value as Array<string>;
    let count = 0;
    if (stringArr === null || stringArr.length === 0) {
      return; // Do nothing if no item is selected
    }

    for (let i = 0; i < stringArr.length; i++) {
      for (let j = 0; j < this.SelectedDD.length; j++) {
        if (this.SelectedDD[j].isDeletable === 'Y' && this.SelectedDD[j].MDDCode === stringArr[i]) {
          this.SelectedDD = this.SelectedDD.filter(function (value) {
            if (value.MDDCode !== stringArr[i]) {
              return value;
            } else {
              // To Reset properties which are set while moving to 'Selected Div/Dept List'
              delete value.isDeletable;
              delete value.type;
              delete value.color;
            }
          });
          this.BindData(ActionType.OnRemoveItemFromSelected);
        } else if (this.SelectedDD[j].isDeletable === 'N' && this.SelectedDD[j].MDDCode === stringArr[i]) {
          count++;
        }
      }
    }
    if (count > 0) {
      count = 0;
      this.PopUpMessage = 'Cannot delete this data.';
      this.alertButton.click();
      return;
    }

  }

  DeleteExistingDepartment() {
    const stringArr = this.DepartmentMappingForm.get('DivList').value as Array<string>;
    const deptArr = new Array<MasterDataDetails>();
    for (let i = 0; i < stringArr.length; ++i) {
      this.SelectedDD = this.SelectedDD.filter(function (value) {
        if (value.ParentMDDCode !== stringArr[i]) {
          return value;
        } else {
          // To Reset properties which are set while move to 'Selected Div/Dept List'
          if (value.isDeletable === 'N') {
            delete value.color;
            delete value.isDeletable;
            delete value.type;
            deptArr.push(value);
          } else {
            delete value.color;
            delete value.isDeletable;
            delete value.type;
          }
        }
      });
    }

    if (deptArr.length > 0) {
      this.AllList = this.AllList.concat(deptArr);
    }

    for (let i = 0; i < this.DivisionList.length; i++) {
      if (stringArr.includes(this.DivisionList[i].MDDCode)) {
        this.DivisionList[i].color = 'lightyellow';
        this.DivisionList[i].isDeletable = 'Y';
        this.DivisionList[i].type = 'Division';
        this.SelectedDD.push(this.DivisionList[i]);
      }
    }
    this.BindData(ActionType.OnReplaceDepartmentsByDivision);
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

    if (JSON.stringify(this.CheckData) === JSON.stringify(this.SelectedDD)) {
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
              this.CheckData = JSON.parse(JSON.stringify(this.SelectedDD));
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

  SetDefaultDivisionSelected(type: ActionType): void {
    let isBindingNeed = true;
    switch (type) {
      case ActionType.OnPageInit:
      case ActionType.OnDepartmentMove:
        const totalDepartments = this.AllList.filter(x => x.MDHCode.toLowerCase() === 'dept').length;
        const totalSelectedDepartments = this.SelectedDD.length;
        let defaultDivisions = ['-1', '0', '1'];
        let selectedDivisionCode = this.DepartmentMappingForm.get('Division').value;
        isBindingNeed = (((totalDepartments === totalSelectedDepartments) && (defaultDivisions.indexOf(selectedDivisionCode) !== -1))
          || this.SelectedDD.length > 0 && selectedDivisionCode === '-1');
        break;
      case ActionType.OnRemoveItemFromSelected:
        defaultDivisions = ['-1', '0', '1'];
        selectedDivisionCode = this.DepartmentMappingForm.get('Division').value;
        if (defaultDivisions.indexOf(selectedDivisionCode) !== -1) {
          isBindingNeed = (this.SelectedDD.length === 0 || this.DivisionList.length !== 0);
        } else {
          isBindingNeed = (this.SelectedDD.length === 0);
        }
        break;
    }

    if (isBindingNeed) {
      const active_division_value = ((this.DivisionList.length === 0) ? '0' : (this.SelectedDD.length > 0) ? '1' : '-1');
      this.DepartmentMappingForm.get('Division').patchValue(active_division_value);
    }

    // To make items unselected
    this.DepartmentMappingForm.get('DivList').patchValue(null);
    this.DepartmentMappingForm.get('Department').patchValue(null);
    this.DepartmentMappingForm.get('SelectedList').patchValue(null);

    // To make movable buttons disabled after action(move to left) complete
    this.isMoveToLeftDisabled = this.isMoveToRightDisabled = true;
  }

  /* Note: Make movebale button enabled only if any corresponding item is selected */
  buttonsEnableDisable(event: any, isFoucusOut: boolean = false): void {
    // Default make both buttons disabled
    this.isMoveToRightDisabled = this.isMoveToLeftDisabled = true;

    // On focus or change event make button enabled or disabled
    if (event.target.attributes.formcontrolname) {
      const formControlName = event.target.attributes.formcontrolname.value;
      const selectedItems = this.DepartmentMappingForm.get(formControlName).value;
      const isEnabled = (selectedItems != null && selectedItems.length > 0);

      switch (formControlName) {
        case 'DivList':
          this.isMoveToRightDisabled = !isEnabled;
          this.DepartmentMappingForm.get('Department').patchValue(null);
          this.DepartmentMappingForm.get('SelectedList').patchValue(null);
          break;
        case 'Department':
          this.isMoveToRightDisabled = !isEnabled;
          this.DepartmentMappingForm.get('DivList').patchValue(null);
          this.DepartmentMappingForm.get('SelectedList').patchValue(null);
          break;
        case 'SelectedList':
          this.isMoveToLeftDisabled = !isEnabled;
          this.DepartmentMappingForm.get('DivList').patchValue(null);
          this.DepartmentMappingForm.get('Department').patchValue(null);
          break;
      }
    }
  }


}
