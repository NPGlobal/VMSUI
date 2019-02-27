import { Component, OnInit, SimpleChanges, OnChanges, ViewChild, ElementRef } from '@angular/core';
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
import { VendorTechDefault } from 'src/app/Models/vendorTechDefault';
declare var $: any;

@Component({
  selector: 'app-technical-details',
  templateUrl: './technical-details.component.html',
  styleUrls: ['./technical-details.component.css']
})
export class TechnicalDetailsComponent implements OnInit, OnChanges {
  // paging variables
  totalItems: number;
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[];

  // form variables
  techDetailsForm: FormGroup;
  vendorTechDefault: VendorTechDefault;
  submitted = false;
  vendorcode: string;
  maxTechLineNo: string;

  efficiencyPattern = /^(100(\.0{1,2})?|[1-9]?\d(\.\d{1,2})?)$/;
  // vendortechList: VendorTech[];
  // VendorTech: VendorTech;
  deptList: any[];
  techSpecList: any[];
  TechDefaultLst: VendorTechDefault[];

  // isLine = 0;
  // isEfficiency = 0;
  // isDisable = false;
  // modalBody: string;
  // obj1: JSON;
  // obj2: JSON;
  // flag: boolean;
  // Action: string;
  searchText = '';
  // ExistingVendorTech: FormGroup;
  // machineItems: Array<{ MachineType: string, MachineName: string, UnitCount: string, Efficiency: string }> = [];
  ValidationMessages = {
    'Department': {
      'required': ''
    },
    'VendorTechConfigID': {
      'required': '',
    },
    'TechLineNo': {
      'required': ''
    },
    'EfficiencyDefault': {
      'required': '',
      'pattern': 'Please enter numeric value less than 100'
    },
    'UnitCount': {
      'required': ''
    }
  };

  formErrors = {
    'Department': '',
    'TechLineNo': '',
    'EfficiencyDefault': '',
    'UnitCount': '',
    'VendorTechConfigID': ''
  };

  @ViewChild('alertModalButton')
  alertModalButton: ElementRef;
  PopUpMessage: string;
  alertButton: any;

  unitCountList(n: number): any[] {
    return Array(n);
  }

  constructor(private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _pager: PagerService) { }

  ngOnInit() {
    this.PopUpMessage = '';
    this.alertButton = this.alertModalButton.nativeElement as HTMLElement;

    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorTech(this.currentPage);
    });

    this.EditTechDetails(null);
    this.GetVendorDepartments();
    // this.formControlValueChanged();
  }

  ngOnChanges(changes: SimpleChanges) {
    // this.openModal();
    // this.GetTechDetails(this.techDetailsForm.controls.id);
  }

  SearchTechDetails(searchText = '') {
    this.searchText = searchText;
    this.GetVendorTech(1);
  }

  GetVendorTech(index: number) {
    this.currentPage = index;
    this._vendorService.GetVendorTechByVendorCode(this.vendorcode, this.currentPage, this.pageSize, this.searchText).
      subscribe(result => {
        this.totalItems = result.TotalCount;
        this.TechDefaultLst = result.data;
        // this.maxTechLineNo = this.TechDefaultLst.reduce(function (prev, current) {
        //   return (prev.TechLineNo > current.TechLineNo) ? prev : current;
        // }).TechLineNo;
        this.maxTechLineNo = (Number(this.TechDefaultLst[this.TechDefaultLst.length - 1].TechLineNo) + 1).toString();
        this.GetVendorsTechList();
      });
  }

  GetVendorsTechList() {
    this.pager = this._pager.getPager(this.totalItems, this.currentPage, this.pageSize);
    this.pagedItems = this.TechDefaultLst;
  }

  EditTechDetails(techDefault: VendorTechDefault) {
    if (techDefault === null) {
      techDefault = new VendorTechDefault();
      techDefault.TechLineNo = this.maxTechLineNo;
    }

    if (techDefault !== null && (techDefault.TechLineNo === '' || techDefault.TechLineNo === null)) {
      techDefault = techDefault.VendorTechDetails[0].VendorTechDetailsID === null ?  new VendorTechDefault() : techDefault;
      techDefault.VendorTechDetails = techDefault.VendorTechDetails[0].VendorTechDetailsID === null ?  [] : techDefault.VendorTechDetails;
      techDefault.TechLineNo = null;
    }
    this.vendorTechDefault = techDefault;
    this.InitializeFormControls();
  }

  InitializeFormControls() {
    this.techDetailsForm = this._fb.group({
      Department: [null],
      VendorTechConfigID: [null],
      TechLineNo: [this.vendorTechDefault.TechLineNo],
      DefaultEfficiency: [this.vendorTechDefault.DefaultEfficiency],
      UnitCount: [],
      Status: [],
      Remarks: [],
      Efficiency: [null]
    });
  }

  GetVendorDepartments() {
    this._vendorService.GetVendorDeptTech('10', '-1', this.vendorcode, 'Department').subscribe((data) => {
      this.deptList = data;
    });
  }

  GetVendorTechSpec() {
    this.techDetailsForm.get('VendorTechConfigID').patchValue(null);
    if (this.techDetailsForm.get('Department').value === null) {
      this.techSpecList = [];
      // this.techDetailsForm.controls.techSpec.patchValue('');
      // this.isLine = 0;
      // this.isEfficiency = 0;
      // this.techDetailsForm.controls.techSpec.patchValue('');
      // this.techDetailsForm.controls.techLineNo.patchValue('');
      // this.techDetailsForm.controls.efficiency.patchValue('');
    } else {
      // Added by SHubhi
      this._vendorService.GetVendorTechSpec('10', this.techDetailsForm.get('Department').value, this.vendorcode, 'TechSpec')
        .subscribe((result) => {
          this.techSpecList = result;
          // if (this.techDetailsForm.get('VendorTechConfigID').value !== '') {
          //   const strArray = this.techSpecList.find((obj) =>
          //   obj.VendorConfigID === this.techDetailsForm.get('VendorTechConfigID').value);
          //   if (strArray === undefined) {
          //     // this.techDetailsForm.controls.techSpec.patchValue('');
          //     this.isLine = 0;
          //     this.isEfficiency = 0;
          //     this.techDetailsForm.controls.techSpec.patchValue('');
          //     this.techDetailsForm.controls.techLineNo.patchValue('');
          //     this.techDetailsForm.controls.efficiency.patchValue('');
          //   }
          // }
          // this.specChange(event);
          // this.checkValidation();
        });
    }
    // this.checkValidation();
  }

  SaveTechDetails() {
    // const el = this.modalOpenButton.nativeElement as HTMLElement;
    // this.submitted = true;
    // console.log(JSON.stringify(this.techDetailsForm.value));
    // if (this.techDetailsForm.invalid) {
    //   this.LogValidationErrors();
    //   return;
    // }

    // this.VendorTech = new VendorTech();
    // this.VendorTech.VendorTechDetailsID = this.techDetailsForm.get('id').value;
    // this.VendorTech.VendorTechConfigID = this.techDetailsForm.get('techSpec').value;
    // this.VendorTech.VendorCode = this.vendorcode;
    // this.VendorTech.TechLineNo = (this.techDetailsForm.get('techLineNo').value !== null)
    //   ? this.techDetailsForm.get('techLineNo').value : '0';
    // this.VendorTech.Efficiency = this.techDetailsForm.get('efficiency').value > 0
    //   ? this.techDetailsForm.get('efficiency').value : '0';
    // this.VendorTech.UnitCount = this.techDetailsForm.get('unitCount').value;
    // this.VendorTech.Status = this.techDetailsForm.get('status').value;
    // this.VendorTech.Remarks = this.techDetailsForm.get('remarks').value;
    // this.VendorTech.CreatedBy = 999999;
    // // In case of edit,if user submit without making any changes.
    // if (this.VendorTech.VendorTechDetailsID > 0) {
    //   this.obj1 = this.ExistingVendorTech.value;
    //   this.obj2 = this.techDetailsForm.value;
    //   this.flag = true;

    //   // tslint:disable-next-line:triple-equals
    //   if (Object.keys(this.obj1).length == Object.keys(this.obj2).length) {
    //     for (const key in this.obj1) {
    //       // tslint:disable-next-line:triple-equals
    //       if (this.obj1[key] == this.obj2[key]) {
    //         continue;
    //       } else {
    //         this.flag = false;
    //         break;
    //       }
    //     }
    //   } else {
    //     this.flag = false;
    //   }
    //   //  if (Object.entries(this.ExistingVendorTech.value).toString() === Object.entries(this.techDetailsForm.value).toString()) {
    //   if (this.flag === true) {
    //     this.modalBody = 'There is nothing to change';
    //     el.click();
    //     return;
    //   }
    // }
    try {
      if (this.vendorTechDefault.VendorTechDetails !== null && this.vendorTechDefault.VendorTechDetails.length > 0) {

        this.vendorTechDefault.DefaultEfficiency = this.techDetailsForm.get('DefaultEfficiency').value;
        this.vendorTechDefault.Remarks = this.techDetailsForm.get('Remarks').value;
        this.vendorTechDefault.TechLineNo = this.techDetailsForm.get('TechLineNo').value;
        this.vendorTechDefault.Status = 'A';
        this.vendorTechDefault.VendorShortCode = this.vendorcode;

        this._vendorService.SaveTechInfo(this.vendorTechDefault).subscribe((result) => {
          if (result.Msg !== '') {
            if (result.Status === 0) {
              this.PopUpMessage = result.Msg;

              this.totalItems = result.TotalCount;
              this.TechDefaultLst = result.data;
              this.maxTechLineNo = (Number(this.TechDefaultLst[this.TechDefaultLst.length - 1].TechLineNo) + 1).toString();
              this.GetVendorsTechList();
              // this.dismiss();
            } else {
              this.PopUpMessage = result.Msg;
            }
          } else {
            this.PopUpMessage = 'There are some technical error. Please contact administrator.';
          }
        });
      } else {
        return;
      }
    } catch {
      this.PopUpMessage = 'There are some technical error. Please contact administrator.';
    }
    this.alertButton.click();
  }

  // checkValidation() {
  //   // tslint:disable-next-line:triple-equals
  //   if (this.isLine == 1) {
  //     this.techDetailsForm.controls['techLineNo'].setValidators(Validators.required);
  //   } else {
  //     this.techDetailsForm.controls['techLineNo'].clearValidators();
  //   }
  //   // tslint:disable-next-line:triple-equals
  //   if (this.isEfficiency == 1) {
  //     this.techDetailsForm.controls['efficiency'].setValidators([Validators.pattern(this.efficiencyPattern), Validators.required]);
  //   } else {
  //     this.techDetailsForm.controls['efficiency'].clearValidators();
  //   }
  //   this.techDetailsForm.controls['techLineNo'].updateValueAndValidity();
  //   this.techDetailsForm.controls['efficiency'].updateValueAndValidity();
  // }

  dismiss() {
    this.InitializeFormControls();
    // this.isLine = 0;
    // this.isEfficiency = 0;
    this.submitted = false;
    this.techSpecList = [];
    // this.isDisable = false;
    // this.LogValidationErrors();
  }

  DeleteTechDetailsPopup(vendor) {
    this.techDetailsForm = this._fb.group({
      Id: [vendor.VendorTechDetailsId],
      dept: [vendor.Department, Validators.required],
      techSpec: [vendor.VendorTechConfigID, Validators.required],
      techLineNo: [vendor.TechLineNo],
      efficiency: [vendor.Efficiency],
      unitCount: [vendor.UnitCount, Validators.required],
      // VendorConfigID: [vendor.VendorTechConfigID],
      status: vendor.Status = 'A' ? true : false,
      remarks: vendor.Remarks
    });
  }

  AddMachine() {

    if (this.vendorTechDefault.VendorTechDetails === undefined) {
      this.vendorTechDefault.VendorTechDetails = [];
    }

    if (this.techDetailsForm.get('Department').value !== null && this.techDetailsForm.get('VendorTechConfigID').value !== null &&
      this.techDetailsForm.get('UnitCount').value !== null) {

      const vTech = new VendorTech();
      vTech.VendorTechDetailsID = 0;
      vTech.TechLineNo = this.techDetailsForm.get('TechLineNo').value;
      vTech.VendorShortCode = this.vendorcode;
      vTech.dept = this.techDetailsForm.get('Department').value;
      vTech.VendorTechConfigID = this.techDetailsForm.get('VendorTechConfigID').value;
      vTech.UnitCount = this.techDetailsForm.get('UnitCount').value;
      vTech.Efficiency = this.techDetailsForm.get('Efficiency').value;
      vTech.MachineName = this.techSpecList.filter(function (el) {
        return el.VendorConfigID === Number(vTech.VendorTechConfigID);
      })[0].TechSpec;

      vTech.MachineType = this.deptList.filter(function (el) {
        return el.DeptCode === vTech.dept;
      })[0].DeptName;

      vTech.Status = 'A';

      let add = 0;
      if (this.vendorTechDefault.VendorTechDetails.length > 0) {
        const strArray = this.vendorTechDefault.VendorTechDetails
          .find((obj) => obj.MachineType === vTech.MachineType && obj.MachineName === vTech.MachineName);
        if (strArray === undefined) {
          this.vendorTechDefault.VendorTechDetails.push(vTech);
          add = 1;
        }
        if (add === 0) {
          this.PopUpMessage = 'This data is already exists.';
          this.alertButton.click();
        }
      } else {
        this.vendorTechDefault.VendorTechDetails.push(vTech);
      }

    } else {
      this.PopUpMessage = 'Please select data for add.';
      this.alertButton.click();
      return;
    }
  }


  // AddRow(x, y, z, a) {
  //   let add = 0;
  //   if (this.machineItems.length > 0) {
  //     const strArray = this.machineItems.find((obj) => obj.MachineType === x && obj.MachineName === y);
  //     if (strArray === undefined) {
  //       this.machineItems.push({ MachineType: x, MachineName: y, UnitCount: z, Efficiency: a });
  //       add = 1;
  //     }
  //     if (add === 0) {
  //       this.PopUpMessage = 'This data is already exists.';
  //       this.alertButton.click();
  //     }
  //   } else {
  //     this.machineItems.push({ MachineType: x, MachineName: y, UnitCount: z, Efficiency: a });
  //   }
  // }

  // DeleteMachine(x) {
  //   const strArray = this.machineItems.find((obj) => obj.MachineType === x.MachineType && obj.MachineName === x.MachineName);
  //   if (strArray === undefined) {
  //     // this.machineItems.splice(strArray, 1);
  //   }
  //   if (this.machineItems.length > 0) {
  //     $('.table-small').removeClass('hide');
  //   } else {
  //     $('.table-small').addClass('hide');
  //   }
  // }

  DeleteTechDetails() {
    // const el = this.modalOpenButton.nativeElement as HTMLElement;
    // //  if (confirm('Are you sure ? If yes,This record will no longer be available in the system.')) {
    // this.VendorTech = new VendorTech();
    // this.VendorTech.VendorTechDetailsID = this.techDetailsForm.get('Id').value;
    // this.VendorTech.VendorTechConfigID = this.techDetailsForm.get('techSpec').value;
    // this.VendorTech.VendorCode = this.vendorcode;
    // this.VendorTech.TechLineNo = this.techDetailsForm.get('techLineNo').value !== null ?
    //   this.techDetailsForm.get('techLineNo').value : '0';
    // this.VendorTech.Efficiency = this.techDetailsForm.get('efficiency').value > 0 ?
    //   this.techDetailsForm.get('efficiency').value : '0';
    // this.VendorTech.UnitCount = this.techDetailsForm.get('unitCount').value;
    // this.VendorTech.Status = false;
    // this.VendorTech.Remarks = this.techDetailsForm.get('remarks').value;
    // this.VendorTech.CreatedBy = 999999;
    // try {
    //   this._vendorService.SaveTechInfo(this.VendorTech).subscribe((data) => {
    //     if (data.Msg != null) {
    //       if (data.Msg[0].Result === 0) {
    //         this.VendorTech = new VendorTech();
    //         this.vendortechList = data.VendorTech;
    //         this.totalItems = data.VendorTechCount[0].TotalVendors;
    //         this.InitializeFormControls();
    //         this.GetVendorsTechList();
    //         this.techSpecList = [];
    //         this.modalBody = data.Msg[0].Message;
    //         // alert(data.Msg[0].Message);
    //         $('#deleteModal').modal('toggle');
    //         this.dismiss();
    //       } else {
    //         this.modalBody = data.Msg[0].Message;
    //         //  alert(data.Msg[0].Message);
    //       }
    //     } else {
    //       this.modalBody = 'There are some technical error. Please contact administrator.';
    //       //  alert('There are some technical error. Please contact administrator.');
    //     }
    //   });
    // } catch {
    //   this.modalBody = 'There are some technical error. Please contact administrator.';
    //   // alert('There are some technical error. Please contact administrator.');
    // }
    // el.click();
  }

  LogValidationErrors(group: FormGroup = this.techDetailsForm): void {
    // Object.keys(group.controls).forEach((key: string) => {
    //   const abstractControl = group.get(key);
    //   if (abstractControl instanceof FormGroup) {
    //     this.LogValidationErrors(abstractControl);
    //   } else {
    //     this.formErrors[key] = '';
    //     if (this.submitted || (abstractControl && !abstractControl.valid &&
    //       (abstractControl.touched || abstractControl.dirty))) {
    //       const messages = this.ValidationMessages[key];
    //       for (const errorkey in abstractControl.errors) {
    //         if (errorkey) {
    //           this.formErrors[key] += messages[errorkey] + ' ';
    //         }
    //       }
    //     }
    //   }
    // });
  }

  specChange(event) {
    // this.isLine = event.target.selectedOptions[0].attributes['data-line'].value;
    // this.isEfficiency = event.target.selectedOptions[0].attributes['data-efficiency'].value;
    // this.checkValidation();
    // // tslint:disable-next-line:triple-equals
    // if (this.isLine == 0) {
    //   this.techDetailsForm.controls.techLineNo.patchValue('');
    // } else {
    //   this.techDetailsForm.controls.techLineNo.patchValue(event.target.selectedOptions[0].attributes['data-maxnumber'].value);
    // }
    // // tslint:disable-next-line:triple-equals
    // if (this.isEfficiency == 0) {
    //   this.techDetailsForm.controls.efficiency.patchValue('');
    // } else {
    //   this.isEfficiency = event.target.selectedOptions[0].attributes['data-efficiency'].value;
    // }
  }
}
