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
  isTechDetailFormChanged: boolean;

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
    'DefaultEfficiency': {
      'required': '',
      'pattern': 'Enter valid efficiency'
    },
    'UnitCount': {
      'required': ''
    },
    'Efficiency': {
      'pattern': 'Enter valid efficiency'
    }
  };

  formErrors = {
    'Department': '',
    'TechLineNo': '',
    'DefaultEfficiency': '',
    'UnitCount': '',
    'VendorTechConfigID': '',
    'Efficiency': ''
  };

  @ViewChild('alertModalButton')
  alertModalButton: ElementRef;
  PopUpMessage: string;
  alertButton: any;

  @ViewChild('modalCloseButton')
  modalCloseButton: ElementRef;
  modalClose: HTMLElement;

  @ViewChild('deleteModalClose')
  deleteModalClose: ElementRef;
  dltModalCloseButton: HTMLElement;

  unitCountList(n: number): any[] {
    return Array(n);
  }

  constructor(private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _pager: PagerService) {
  }

  ngOnInit() {
    this.PopUpMessage = '';
    this.alertButton = this.alertModalButton.nativeElement as HTMLElement;

    this.modalClose = this.modalCloseButton.nativeElement as HTMLElement;

    this.dltModalCloseButton = this.deleteModalClose.nativeElement as HTMLElement;

    this.isTechDetailFormChanged = false;

    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorTech(this.currentPage);
    });
    this.GetVendorDepartments();
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

        this.EditTechDetails(null);
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
      techDefault = techDefault.VendorTechDetails[0].VendorTechDetailsID === null ?
        new VendorTechDefault() : techDefault;
    }
    techDefault.Status = 'A';
    this.vendorTechDefault = JSON.parse(JSON.stringify(techDefault));
    this.InitializeFormControls();
  }

  InitializeFormControls() {
    this.techDetailsForm = this._fb.group({
      Department: [null],
      VendorTechConfigID: [null],
      TechLineNo: [{ value: this.vendorTechDefault.TechLineNo, disabled: true }],
      DefaultEfficiency: [this.vendorTechDefault.DefaultEfficiency, Validators.pattern(this.efficiencyPattern)],
      UnitCount: [],
      Status: [this.vendorTechDefault.Status],
      Remarks: [this.vendorTechDefault.Remarks],
      Efficiency: [null, Validators.pattern(this.efficiencyPattern)]
    });

    this.SetEfficiencyAsDefault();
    this.techDetailsForm.valueChanges.subscribe((data) => {
      this.LogValidationErrors(this.techDetailsForm);
    });
  }

  SetEfficiencyAsDefault() {
    this.techDetailsForm.get('Efficiency').patchValue(this.techDetailsForm.get('DefaultEfficiency').value);
  }

  dismiss() {
    this.submitted = false;
    this.techDetailsForm.reset();
    this.techSpecList = [];
    // this.CreateNewVendorTech();
    this.InitializeFormControls();
    // this.isLine = 0;
    // this.isEfficiency = 0;
    // this.isDisable = false;
    // this.LogValidationErrors();
    this.modalClose.click();
    this.dltModalCloseButton.click();
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
    this.sendFormData();
  }

  DeleteTechDetails() {
    this.sendFormData();
  }

  DeleteTechDetailsPopup(vobj: VendorTechDefault, status: string) {
    vobj.Status = status;
    this.vendorTechDefault = JSON.parse(JSON.stringify(vobj));
    this.InitializeFormControls();
  }

  sendFormData() {
    const st = this.techDetailsForm.get('Status').value;

    try {
      if (this.vendorTechDefault.VendorTechDetails !== undefined && this.vendorTechDefault.VendorTechDetails !== null
        && this.vendorTechDefault.VendorTechDetails.length > 0) {

        this.vendorTechDefault.DefaultEfficiency = this.techDetailsForm.get('DefaultEfficiency').value;
        this.vendorTechDefault.Remarks = this.techDetailsForm.get('Remarks').value;
        this.vendorTechDefault.TechLineNo = this.techDetailsForm.get('TechLineNo').value;
        this.vendorTechDefault.Status = st;
        this.vendorTechDefault.VendorShortCode = this.vendorcode;

        this._vendorService.SaveTechInfo(this.vendorTechDefault).subscribe((result) => {
          if (result.Msg !== '') {
            if (result.Status === 0) {
              this.PopUpMessage = result.Msg;

              this.totalItems = result.TotalCount;
              this.TechDefaultLst = result.data;
              this.maxTechLineNo = (Number(this.TechDefaultLst[this.TechDefaultLst.length - 1].TechLineNo) + 1).toString();
              this.GetVendorsTechList();
              this.dismiss();
            } else {
              this.PopUpMessage = result.Msg;
            }
          } else {
            this.PopUpMessage = 'There are some technical error. Please contact administrator.';
          }
        });
      } else {
        this.PopUpMessage = 'At least one machine should be added.';
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



  AddMachine() {

    if (this.techDetailsForm.invalid) {
      this.LogValidationErrors();
      return;
    }

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
          this.isTechDetailFormChanged = true;
        }
        if (add === 0) {
          this.PopUpMessage = 'This data is already exists.';
          this.alertButton.click();
        }
      } else {
        this.vendorTechDefault.VendorTechDetails.push(vTech);
        this.isTechDetailFormChanged = true;
      }

    } else {
      this.PopUpMessage = 'Please select data for add.';
      this.alertButton.click();
      return;
    }
  }

  EditMachine(vTech: VendorTech) {
    this.isTechDetailFormChanged = false;
    this.techDetailsForm.get('Department').patchValue(this.deptList.filter(function (el) {
      return el.DeptName === vTech.MachineType;
    })[0].DeptCode);
    this.GetVendorTechSpec();
    this.techDetailsForm.get('VendorTechConfigID').patchValue(vTech.VendorTechConfigID);
    this.techDetailsForm.get('UnitCount').patchValue(vTech.UnitCount);
    this.techDetailsForm.get('Efficiency').patchValue(vTech.Efficiency);
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

  DeleteMachine(m) {
    // alert(m.Status);
    const strArray = this.vendorTechDefault.VendorTechDetails
      .find((obj) => obj.MachineType === m.MachineType && obj.MachineName === m.MachineName);
    if (strArray !== undefined) {
      const index = this.vendorTechDefault.VendorTechDetails.indexOf(strArray);
      this.vendorTechDefault.VendorTechDetails.splice(index, 1);
    }
    //   if (this.machineItems.length > 0) {
    //     $('.table-small').removeClass('hide');
    //   } else {
    //     $('.table-small').addClass('hide');
    //   }
  }



  LogValidationErrors(group: FormGroup = this.techDetailsForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.LogValidationErrors(abstractControl);
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

  specChange(event) {
    this.SetEfficiencyAsDefault();
  }
}
