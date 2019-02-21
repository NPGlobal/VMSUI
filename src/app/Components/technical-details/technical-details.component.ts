import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { VendorTech } from 'src/app/Models/VendorTech';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorService } from 'src/app/Services/vendor.service';
// import { PagerService } from 'src/app/Services/pager.service';
import { HttpClient } from '@angular/common/http';
import { Vendor } from 'src/app/Models/vendor';
import { load } from '@angular/core/src/render3';
import { Action } from 'rxjs/internal/scheduler/Action';
import { and } from '@angular/router/src/utils/collection';
declare var $: any;

@Component({
  selector: 'app-technical-details',
  templateUrl: './technical-details.component.html',
  styleUrls: ['./technical-details.component.css']
})
export class TechnicalDetailsComponent implements OnInit {
  efficiencyPattern = /^(100(\.0{1,2})?|[1-9]?\d(\.\d{1,2})?)$/;
  vendortechList: VendorTech[];
  vendorcode: string;
  VendorTech: VendorTech;
  techDetailsForm: FormGroup;
  deptList: any[];
  techSpecList: any[];
  status = true;
  submitted = false;
  totalItems: number;
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[];
  isLine = 0;
  isEfficiency = 0;
  isDisable = false;
  Action: string;
  ExistingVendorTech: FormGroup;
  unitCountList(n: number): any[] {
    return Array(n);
  }
  constructor(private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _pager: PagerService) { }

  ngOnInit() {
    this.openModal();
    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorTech(this.currentPage);
    });
    this.GetVendorDepartments();
    // this.formControlValueChanged();
  }

  GetVendorTech(index: number) {
    this.currentPage = index;
    this._vendorService.GetVendorTechByVendorCode(this.vendorcode, this.currentPage, this.pageSize).subscribe(data => {
      this.vendortechList = data.VendorTech;
      this.totalItems = data.VendorTechCount[0].TotalVendors;
      this.GetVendorsTechList();
    });
  }
  GetVendorsTechList() {
    this.pager = this._pager.getPager(this.totalItems, this.currentPage, this.pageSize);
    this.pagedItems = this.vendortechList;
  }
  GetVendorDepartments() {
    this._vendorService.GetVendorDeptTech('10', '-1', this.vendorcode, 'Department').subscribe((data) => {
      this.deptList = data;
    });
  }
  GetVendorTechSpec() {
    if (this.techDetailsForm.get('dept').value === '') {
      this.techSpecList = [];
      this.techDetailsForm.controls.techSpec.patchValue('');
    } else {
      // Added by SHubhi
      this._vendorService.GetVendorTechSpec('10', this.techDetailsForm.get('dept').value, this.vendorcode, 'TechSpec').subscribe((data) => {
        this.techSpecList = data;
        if (this.techDetailsForm.get('techSpec').value !== '') {
          const strArray = this.techSpecList.find((obj) => obj.VendorConfigID === this.techDetailsForm.get('techSpec').value);
          if (strArray === undefined) {
            // this.techDetailsForm.controls.techSpec.patchValue('');
            this.isLine = 0;
            this.isEfficiency = 0;
            this.techDetailsForm.controls.techSpec.patchValue('');
            this.techDetailsForm.controls.techLineNo.patchValue('');
            this.techDetailsForm.controls.efficiency.patchValue('');
          }
        }
        // this.specChange(event);
        this.checkValidation();
      });
    }
    // this.checkValidation();
  }

  InitializeFormControls() {
    this.techDetailsForm = this._fb.group({
      id: ['0'],
      dept: [''],
      techSpec: [''],
      techLineNo: [this.VendorTech.TechLineNo],
      efficiency: [this.VendorTech.Efficiency],
      unitCount: [this.VendorTech.UnitCount],
      status: [this.VendorTech.Status],
      remarks: [this.VendorTech.Remarks],
    });
  }

  SaveTechDetails() {
    // this.techDetailsForm.valueChanges.subscribe(() => {
    //   console.log('username');
    //   console.log('Password');
    // });
    this.submitted = true;
    console.log(JSON.stringify(this.techDetailsForm.value));
    if (this.techDetailsForm.invalid) {
      return;
    }
    this.VendorTech = new VendorTech();
    this.VendorTech.VendorTechDetailsID = this.techDetailsForm.get('id').value;
    this.VendorTech.VendorTechConfigID = this.techDetailsForm.get('techSpec').value;
    this.VendorTech.VendorCode = this.vendorcode;
    this.VendorTech.TechLineNo = (this.techDetailsForm.get('techLineNo').value !== null)
      ? this.techDetailsForm.get('techLineNo').value : '0';
    this.VendorTech.Efficiency = (this.techDetailsForm.get('efficiency').value > 0)
      ? this.techDetailsForm.get('efficiency').value : '0';
    this.VendorTech.UnitCount = this.techDetailsForm.get('unitCount').value;
    this.VendorTech.Status = this.techDetailsForm.get('status').value;
    this.VendorTech.Remarks = this.techDetailsForm.get('remarks').value;
    this.VendorTech.CreatedBy = 999999;
    // In case of edit,if user submit without making any changes.
    if (this.VendorTech.VendorTechDetailsID > 0) {
    if (Object.entries(this.ExistingVendorTech.value).toString() === Object.entries(this.techDetailsForm.value).toString()) {
      alert('There is nothing to change');
      return;
    }}
    try {
      this._vendorService.SaveTechInfo(this.VendorTech).subscribe((data) => {
        if (data.Msg != null) {
          if (data.Msg[0].Result === 0) {
            this.VendorTech = new VendorTech();
            this.vendortechList = data.VendorTech;
            this.totalItems = data.VendorTechCount[0].TotalVendors;
            this.InitializeFormControls();
            this.GetVendorsTechList();
            this.techSpecList = [];
            alert(data.Msg[0].Message);
            $('#myModal').modal('toggle');
            this.dismiss();
          } else {
            alert(data.Msg[0].Message);
          }
        } else {
          alert('There are some technical error. Please contact administrator.');
        }
      });
    } catch {
      alert('There are some technical error. Please contact administrator.');
    }
  }
  checkValidation() {
    // tslint:disable-next-line:triple-equals
    if (this.isLine == 1) {
      this.techDetailsForm.controls['techLineNo'].setValidators(Validators.required);
    } else {
      this.techDetailsForm.controls['techLineNo'].clearValidators();
    }
    // tslint:disable-next-line:triple-equals
    if (this.isEfficiency == 1) {
      this.techDetailsForm.controls['efficiency'].setValidators([Validators.pattern(this.efficiencyPattern), Validators.required]);
    } else {
      this.techDetailsForm.controls['efficiency'].clearValidators();
    }
    this.techDetailsForm.controls['techLineNo'].updateValueAndValidity();
    this.techDetailsForm.controls['efficiency'].updateValueAndValidity();
  }
  openModal() {
    // tslint:disable-next-line:triple-equals
    this.techDetailsForm = this._fb.group({
      id: ['0'],
      dept: ['', Validators.required],
      techSpec: ['', Validators.required],
      techLineNo: [''],
      // efficiency: ['', [Validators.pattern(this.efficiencyPattern)]],
      efficiency: [''],
      unitCount: ['', Validators.required],
      status: true,
      remarks: '',
    });
    this.isDisable = false;
  }
  dismiss() {
    this.techDetailsForm = this._fb.group({
      id: ['0'],
      dept: [''],
      techSpec: [''],
      techLineNo: [''],
      efficiency: [''],
      unitCount: [''],
      status: true,
      remarks: ''
    });
    this.isLine = 0;
    this.isEfficiency = 0;
    this.submitted = false;
    this.techSpecList = [];
    this.isDisable = false;
  }
  GetTechDetails(x) {
    this.isDisable = true;
    this._vendorService.GetTechDetails(x).subscribe((data) => {
      this.techDetailsForm.reset();
      this.techDetailsForm = this._fb.group({
        id: [data.Table[0].VendorTechDetailsID],
        dept: [data.Table[0].VendorDept_MDDCode, Validators.required],
        techSpec: [data.Table[0].VendorTechConfigID, Validators.required],
        techLineNo: [data.Table[0].TechLineNo],
        efficiency: [data.Table[0].Efficiency],
        unitCount: [data.Table[0].UnitCount, Validators.required],
        status: data.Table[0].Status = 'A' ? true : false,
        remarks: data.Table[0].Remarks
      });
      this.isEfficiency = this.techDetailsForm.get('efficiency').value > 0 ? 1 : 0;
      this.isLine = this.techDetailsForm.get('techLineNo').value > 0 ? 1 : 0;
      this.GetVendorTechSpec();
      this.ExistingVendorTech = Object.assign({}, this.techDetailsForm);
    });
  }

  DeleteTechDetails(vendor) {
    if (confirm('Are you sure ? If yes,This record will no longer be available in the system.')) {
      this.VendorTech = new VendorTech();
      this.VendorTech.VendorTechDetailsID = vendor.VendorTechDetailsId;
      this.VendorTech.VendorTechConfigID = vendor.VendorTechConfigID;
      this.VendorTech.VendorCode = this.vendorcode;
      this.VendorTech.TechLineNo = vendor.TechLineNo !== null ? vendor.TechLineNo : '0';
      this.VendorTech.Efficiency = vendor.Efficiency > 0 ? vendor.Efficiency : '0';
      this.VendorTech.UnitCount = vendor.UnitCount;
      this.VendorTech.Status = false;
      this.VendorTech.Remarks = vendor.Remarks;
      this.VendorTech.CreatedBy = vendor.CreatedBy;
      try {
        this._vendorService.SaveTechInfo(this.VendorTech).subscribe((data) => {
          if (data.Msg != null) {
            if (data.Msg[0].Result === 0) {
              this.VendorTech = new VendorTech();
              this.vendortechList = data.VendorTech;
              this.totalItems = data.VendorTechCount[0].TotalVendors;
              this.InitializeFormControls();
              this.GetVendorsTechList();
              this.techSpecList = [];
              alert(data.Msg[0].Message);
              this.dismiss();
            } else {
              alert(data.Msg[0].Message);
            }
          } else {
            alert('There are some technical error. Please contact administrator.');
          }
        });
      } catch {
        alert('There are some technical error. Please contact administrator.');
      }
    }
  }

  specChange(event) {
    this.isLine = event.target.selectedOptions[0].attributes['data-line'].value;
    this.isEfficiency = event.target.selectedOptions[0].attributes['data-efficiency'].value;
    this.checkValidation();
    // tslint:disable-next-line:triple-equals
    if (this.isLine == 0) {
      this.techDetailsForm.controls.techLineNo.patchValue('');
    } else {
      this.techDetailsForm.controls.techLineNo.patchValue(event.target.selectedOptions[0].attributes['data-maxnumber'].value);
    }
    // tslint:disable-next-line:triple-equals
    if (this.isEfficiency == 0) {
      this.techDetailsForm.controls.efficiency.patchValue('');
    } else {
      this.isEfficiency = event.target.selectedOptions[0].attributes['data-efficiency'].value;
    }
  }
}
