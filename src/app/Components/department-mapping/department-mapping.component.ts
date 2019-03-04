import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
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
  vendor: Vendor;
  DivisionList: MasterDataDetails[] = [];
  DepartmentList: MasterDataDetails[] = [];
  FilteredDeptList: MasterDataDetails[] = [];
  SelectedDD: MasterDataDetails[] = [];
  HasPHSelected: boolean;

  constructor(private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _vendorService: VendorService,
    private _mddService: MasterDataDetailsService) { }

  ngOnInit() {
    // this._route.parent.paramMap.subscribe((data) => {
    //   this.VendorCode = (data.get('code'));
    //   if (this.VendorCode === null) {
    //     this.vendor = new Vendor();
    //     this.InitializeFormControls();
    //   } else {
    //     this.Edit(this.VendorCode);
    //   }
    // });
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

  // Edit(Code: string) {
  //   this._vendorService.GetVendorByCode(Code).subscribe((result) => {
  //     this.vendor = result.data.Vendor[0];
  //     this.InitializeFormControls();
  //   });
  // }

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
    const mddCode = this.DepartmentMappingForm.get('Division').value;
    if (mddCode === '-1') {
      for (let i = 0; i < this.DivisionList.length; i++) {
        for (let j = 0; j < this.DepartmentList.length; j++) {
          if (this.DivisionList[i].MDDCode === this.DepartmentList[j].ParentMDDCode) {
            this.FilteredDeptList.push(this.DepartmentList[j]);
          }
        }
      }
    } else {
      this.FilteredDeptList = this.DepartmentList.filter(x => x.ParentMDDCode === mddCode);
    }
  }

  MoveToSelectedList() {

    this.DepartmentMappingForm.get('Division').patchValue('-1');
    const div = this.DepartmentMappingForm.get('DivList').value as Array<string>;
    const dept = this.DepartmentMappingForm.get('Department').value as Array<string>;

    if (div.length > 0) {
      for (let i = 0; i < this.DivisionList.length; i++) {
        if (div.includes(this.DivisionList[i].MDDCode)) {
          this.SelectedDD.push(this.DivisionList[i]);
        }
      }
      this.DeleteFromArray(div, 'Division');
    }

    if (dept.length > 0) {
      for (let i = 0; i < this.FilteredDeptList.length; i++) {
        if (dept.includes(this.FilteredDeptList[i].MDDCode)) {
          this.SelectedDD.push(this.FilteredDeptList[i]);
        }
      }
      this.DeleteFromArray(dept, 'Department');
    }

    if (this.DivisionList.length === 0) {
      this.DepartmentMappingForm.get('Division').patchValue('0');
      this.FilteredDeptList = [];
    }

    this.GetDepartment();
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
      } else {
        this.SelectedDD = this.SelectedDD.filter(function (value) {
          if (value.MDDCode !== stringArr[i]) {
            return value;
          }
        });
      }
    }
  }

  RemoveFromSelectedList() {
    const values = this.DepartmentMappingForm.get('SelectedList').value as Array<string>;

    for (let i = 0; i < this.SelectedDD.length; i++) {
      if (values.includes(this.SelectedDD[i].MDDCode)) {

        if (this.SelectedDD[i].MDHCode === 'DIVISION') {
          this.DivisionList.push(this.SelectedDD[i]);
        }

        if (this.SelectedDD[i].MDHCode === 'DEPT') {
          this.FilteredDeptList.push(this.SelectedDD[i]);
        }
      }
    }

    this.DeleteFromArray(values, 'SelectedDD');
    this.DepartmentMappingForm.get('Division').patchValue('-1');
    this.GetDepartment();

  }

}
