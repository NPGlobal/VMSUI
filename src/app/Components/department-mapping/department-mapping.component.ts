import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { VendorService } from 'src/app/Services/vendor.service';
import { Vendor } from 'src/app/Models/vendor';
import { MasterDataDetails } from 'src/app/Models/master-data-details';
import { MasterDataDetailsService } from 'src/app/Services/master-data-details.service';

@Component({
  selector: 'app-department-mapping',
  templateUrl: './department-mapping.component.html',
  styleUrls: ['./department-mapping.component.css']
})
export class DepartmentMappingComponent implements OnInit {

  DepartmentMappingForm: FormGroup;
  VendorCode = '';
  vendor: Vendor = new Vendor();
  DivisionList: MasterDataDetails[] = [];
  DepartmentList: MasterDataDetails[] = [];
  FilteredDeptList: MasterDataDetails[] = [];
  TempList: MasterDataDetails[] = [];
  SelectedDD: MasterDataDetails[] = [];
  HasPHSelected: boolean;
  SplittedValue: string[];
  isDeptExist = false;
  deleteExisting = false;

  @ViewChild('alertModalButton')
  alertModalButton: ElementRef;
  PopUpMessage: string;
  alertButton: any;

  @ViewChild('DeleteModalButton')
  DeleteModalButton: ElementRef;
  deleteButton: any;

  constructor(private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _vendorService: VendorService,
    private _mddService: MasterDataDetailsService) { }

  ngOnInit() {
    this.alertButton = this.alertModalButton.nativeElement as HTMLElement;
    this.deleteButton = this.DeleteModalButton.nativeElement as HTMLElement;

    this._route.parent.paramMap.subscribe((data) => {
      this.VendorCode = (data.get('code'));
      this.Edit(this.VendorCode);
    });
    this.InitializeFormControls();
    this.GetDivisionsAndDepartment();
  }

  InitializeFormControls() {
    this.DepartmentMappingForm = this._fb.group({
      Division: ['-1'],
      DivList: [''],
      Department: [''],
      SelectedList: ['']
    });
  }

  Edit(Code: string) {
    this._vendorService.GetVendorByCode(Code).subscribe((result) => {
      this.vendor = result.data.Vendor[0];
      if (this.vendor.Vendor_Depts) {
        this.SplitSavedDepartments(this.vendor.Vendor_Depts);
      }
    });
  }

  GetDivisionsAndDepartment() {
    this._mddService.GetMasterDataDetails('Division', '-1').subscribe((result) => {
      this.DivisionList = result.data.Table;
    });
    this._mddService.GetMasterDataDetails('Dept', this.DepartmentMappingForm.get('Division').value)
      .subscribe((result) => {
        this.DepartmentList = result.data.Table;
        this.FilteredDeptList = Object.assign([], this.DepartmentList);
      });
  }

  GetDepartment() {
    this.FilteredDeptList = [];
    this.TempList = Object.assign([], this.DepartmentList);
    const mddCode = this.DepartmentMappingForm.get('Division').value;
    if (mddCode === '-1') {
      for (let i = 0; i < this.DivisionList.length; i++) {
        for (let j = 0; j < this.TempList.length; j++) {
          if (this.DivisionList[i].MDDCode === this.TempList[j].ParentMDDCode) {
            this.FilteredDeptList.push(this.DepartmentList[j]);
          }
        }
      }
    } else {
      this.FilteredDeptList = this.DepartmentList.filter(x => x.ParentMDDCode === mddCode);
    }
  }

  checkAddedDivisionDepartment(stringArr: string[]) {
    for (let i = 0; i < stringArr.length; ++i) {
       if (!this.isDeptExist) {
        this.isDeptExist = Boolean(this.SelectedDD.find(function (value) { return value.ParentMDDCode === stringArr[i]; }));
      }
    }
    return this.isDeptExist;
  }
  MoveToSelectedList() {
    const div = this.DepartmentMappingForm.get('DivList').value as Array<string>;
    const dept = this.DepartmentMappingForm.get('Department').value as Array<string>;
    if (div.length > 0) {
      if (this.checkAddedDivisionDepartment(div)) {
        this.PopUpMessage = 'Department(s) of selected division already exist. Do you want to replace it?';
        this.isDeptExist = false;
        this.deleteButton.click();
      } else {
        // this.DeleteFromArray(div, 'DeleteDD');
        for (let i = 0; i < this.DivisionList.length; i++) {
          if (div.includes(this.DivisionList[i].MDDCode)) {
            this.DivisionList[i].color = 'lightyellow';
            this.SelectedDD.push(this.DivisionList[i]);
          }
        }
        this.DeleteFromArray(div, 'Division');
        this.DepartmentMappingForm.get('Division').patchValue('-1');
        this.GetDepartment();
      }
    }

    if (dept.length > 0) {
      for (let i = 0; i < this.FilteredDeptList.length; i++) {
        if (dept.includes(this.FilteredDeptList[i].MDDCode)) {
          this.FilteredDeptList[i].color = 'rgb(194, 248, 194)';
          this.SelectedDD.push(this.FilteredDeptList[i]);
        }
      }
      this.DeleteFromArray(dept, 'Department');
    }

    // if (this.DivisionList.length === 0) {
    //   this.DepartmentMappingForm.get('Division').patchValue('0');
    //   this.FilteredDeptList = [];
    // }

  }

  DeleteFromArray(stringArr: string[], type: string) {
    for (let i = 0; i < stringArr.length; ++i) {
      if (type === 'Division') {
        this.DivisionList = this.DivisionList.filter(function (value) {
          if (value.MDDCode !== stringArr[i]) {
            return value;
          }
        });
      } else if (type === 'Department') {
        this.FilteredDeptList = this.FilteredDeptList.filter(function (value) {
          if (value.MDDCode !== stringArr[i]) {
            return value;
          }
        });
      } else if (type === 'SelectedDD') {
        this.SelectedDD = this.SelectedDD.filter(function (value) {
          if (value.MDDCode !== stringArr[i]) {
            return value;
          }
        });
      }
      // if (type === 'Division') {
      //   this.DivisionList = this.DivisionList.filter(function (value) {
      //     if (value.MDDCode !== stringArr[i]) {
      //       return value;
      //     }
      //   });
      // } else if (type === 'Department') {
      //   this.FilteredDeptList = this.FilteredDeptList.filter(function (value) {
      //     if (value.MDDCode !== stringArr[i]) {
      //       return value;
      //     }
      //   });
      // } else if (type === 'SelectedDD') {
      //   this.SelectedDD = this.SelectedDD.filter(function (value) {
      //     if (value.MDDCode !== stringArr[i]) {
      //       return value;
      //     }
      //   });
      // } else {
      //   this.isDeptExist = Boolean(this.SelectedDD.find(function (value) { return value.ParentMDDCode === stringArr[i]; }));
      //   if (this.isDeptExist) {
      //     this.PopUpMessage = 'Department of selected Division already exist. Do You want to replace?';
      //     this.deleteButton.click();
      //     if (!this.deleteExisting) {
      //       this.SelectedDD = this.SelectedDD.filter(function (value) {
      //         if (value.ParentMDDCode !== stringArr[i]) {
      //           return value;
      //         }
      //       });
      //     }
      //   }
      // }
    }
  }


  DeleteExistingDepartment() {
    const stringArr = this.DepartmentMappingForm.get('DivList').value as Array<string>;
    // this.deleteExisting = true;
    for (let i = 0; i < stringArr.length; ++i) {
      this.SelectedDD = this.SelectedDD.filter(function (value) {
        if (value.ParentMDDCode !== stringArr[i]) {
          return value;
        }
      });
    }
    this.MoveToSelectedList();
  }


  RemoveFromSelectedList() {
    const values = this.DepartmentMappingForm.get('SelectedList').value as Array<string>;

    for (let i = 0; i < this.SelectedDD.length; i++) {
      if (values.includes(this.SelectedDD[i].MDDCode)) {

        if (this.SelectedDD[i].MDHCode === 'DIVISION') {
          this.DivisionList.push(this.SelectedDD[i]);
        }

        // if (this.SelectedDD[i].MDHCode === 'DEPT') {
        //   this.FilteredDeptList.push(this.SelectedDD[i]);
        // }
      }
    }

    this.DeleteFromArray(values, 'SelectedDD');
    this.DepartmentMappingForm.get('Division').patchValue('-1');
    this.GetDepartment();
  }


  makeVendorDeptString(): string {
    let ex = '';
    ex = this.SelectedDD.map(function (val) {
      return (val.ParentMDDCode === '' ? val.MDDCode : val.ParentMDDCode) + '~' +
        (val.ParentMDDCode === '' ? '-1' : val.MDDCode);
    }).join();

    return ex;
  }

  SplitSavedDepartments(vendorDepts: string) {
    const DD = vendorDepts.split(',');
    for (let i = 0; i < DD.length; i++) {
      this.SplittedValue = DD[i].split('~');
      for (let j = 0; j < this.DivisionList.length; j++) {
        if (this.SplittedValue[1] === '-1') {
          if (this.SplittedValue[0] === this.DivisionList[j].MDDCode) {
            this.SelectedDD.push(this.DivisionList[j]);
            this.DivisionList[j].color = 'lightyellow';
            this.DivisionList = this.DivisionList.filter(x => x.MDDCode !== this.SplittedValue[0]);
          }
        }
      }
      for (let j = 0; j < this.FilteredDeptList.length; j++) {
        if (this.SplittedValue[1] === this.FilteredDeptList[j].MDDCode) {
          this.SelectedDD.push(this.FilteredDeptList[j]);
          this.FilteredDeptList[j].color = 'rgb(194, 248, 194)';
          this.FilteredDeptList = this.FilteredDeptList.filter(x => x.MDDCode !== this.SplittedValue[1]);
        }
      }
    }
  }

  SaveVendorDepartment() {
    const vendor = new Vendor();
    vendor.VendorCode = this.VendorCode;
    vendor.Vendor_Depts = this.makeVendorDeptString();
    try {
      this._vendorService.SaveVendorDepartments(vendor).subscribe((result => {
        if (result.data.Table[0].ResultCode === 0) {
          this.SplitSavedDepartments(result.data.Table1[0].Vendor_Depts);
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

  UnselectOptions(control: FormControl) {
    control.patchValue([]);
  }

  EnableOnAdd() {
    if ((this.DepartmentMappingForm.get('DivList').value === '' || this.DepartmentMappingForm.get('DivList').value.length === 0) &&
      (this.DepartmentMappingForm.get('Department').value === '' || this.DepartmentMappingForm.get('Department').value.length === 0)) {
      return true;
    } else {
      return false;
    }
  }

  EnableOnRemove() {
    if (this.DepartmentMappingForm.get('SelectedList').value === '' ||
      this.DepartmentMappingForm.get('SelectedList').value.length === 0) {
      return true;
    } else {
      return false;
    }
  }
}
