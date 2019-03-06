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
export class TechnicalDetailsComponent implements OnInit {
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
  vendorTech: VendorTech;
  isTechDetailEditing: any;

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
    this.isTechDetailFormChanged = true;
    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorTech(this.currentPage);
    });
    this.GetVendorDepartments();
    this.isTechDetailEditing = 0;
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
        this.maxTechLineNo = (Number(this.TechDefaultLst[this.TechDefaultLst.length - 1].TechLineNo) + 1).toString();

        this.EditTechDetails(null);
        this.GetVendorsTechList();
      });
  }

  GetVendorsTechList() {
    this.pager = this._pager.getPager(this.totalItems, this.currentPage, this.pageSize);
    this.pagedItems = this.TechDefaultLst;
  }

  InitializeFormControls() {
    const isDefaultEfficiencyDisabled = (this.vendorTechDefault.TechLineNo === null || this.vendorTechDefault.TechLineNo === '');
    this.techDetailsForm = this._fb.group({
      Department: [null],
      VendorTechConfigID: [null],
      TechLineNo: [{ value: this.vendorTechDefault.TechLineNo, disabled: true }],
      DefaultEfficiency: [{ value: this.vendorTechDefault.DefaultEfficiency, disabled: isDefaultEfficiencyDisabled },
      Validators.pattern(this.efficiencyPattern)],
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
    this.isTechDetailEditing = 0;
    this.submitted = false;
    this.techDetailsForm.reset();
    this.techSpecList = [];
    // this.CreateNewVendorTech();
    this.InitializeFormControls();
    this.EnableDisableMachine(0);
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
    if (this.techDetailsForm.get('Department').value === null) {
      this.techSpecList = [];
      this.techDetailsForm.controls.VendorTechConfigID.patchValue(null);
    } else {
      this._vendorService.GetVendorTechSpec('10', this.techDetailsForm.get('Department').value, this.vendorcode, 'TechSpec')
        .subscribe((result) => {
          this.techSpecList = result;
          if (this.techDetailsForm.get('VendorTechConfigID').value !== null) {
            const strArray = this.techSpecList.find((obj) => obj.VendorConfigID ===
              Number(this.techDetailsForm.get('VendorTechConfigID').value));
            if (strArray === undefined) {
              this.techDetailsForm.controls.VendorTechConfigID.patchValue(null);
            }
          }
        });
    }
  }

  SaveTechDetails() {
    this.sendFormData();
  }

  DisableSaveFormButton() {
    if (this.vendorTechDefault.VendorTechDetails !== undefined) {
      this.isTechDetailFormChanged = this.vendorTechDefault.VendorTechDetails.filter(x => x.Status !== 'D').length === 0;
    }
    // this.isTechDetailFormChanged = (this.vendorTechDefault !== null && this.vendorTechDefault !== undefined &&
    //   this.vendorTechDefault.VendorTechDetails !== null && this.vendorTechDefault.VendorTechDetails !== undefined &&
    //   this.vendorTechDefault.VendorTechDetails.filter(x => x.Status !== 'D').length === 0);
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
    this.DisableSaveFormButton();
    this.InitializeFormControls();
  }

  DeleteTechDetails() {
    this.sendFormData();
  }

  DeleteTechDetailsPopup(vobj: VendorTechDefault, status: string) {
    this.vendorTechDefault = JSON.parse(JSON.stringify(vobj));
    this.vendorTechDefault.Status = status;
    this.vendorTechDefault.VendorTechDetails.filter(x => x.Status = status);
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
      // #region
      if (this.vendorTech !== undefined) {
      } else {
        this.vendorTech = new VendorTech();
        this.vendorTech.VendorTechDetailsID = 0;
        this.vendorTech.TechLineNo = this.techDetailsForm.get('TechLineNo').value;
        this.vendorTech.DeptCode = this.techDetailsForm.get('Department').value;
        this.vendorTech.VendorTechConfigID = this.techDetailsForm.get('VendorTechConfigID').value;
        this.vendorTech.MachineType = this.deptList.filter((el) =>
          el.DeptCode === this.vendorTech.DeptCode)[0].DeptName;
        this.vendorTech.MachineName = this.techSpecList.filter((el) =>
          el.VendorConfigID === Number(this.vendorTech.VendorTechConfigID))[0].TechSpec;
        this.vendorTech.Status = 'A';
      }
      this.vendorTech.VendorShortCode = this.vendorcode;
      this.vendorTech.UnitCount = this.techDetailsForm.get('UnitCount').value;
      this.vendorTech.Efficiency = this.techDetailsForm.get('Efficiency').value;

      let add = 0;
      if (this.vendorTechDefault.VendorTechDetails.length > 0) {

        const existingIndex = this.vendorTechDefault.VendorTechDetails.findIndex((x) =>
          x.VendorTechDetailsID === this.vendorTech.VendorTechDetailsID &&
          x.VendorTechConfigID === this.vendorTech.VendorTechConfigID &&
          x.DeptCode === this.vendorTech.DeptCode);
        if (existingIndex >= 0 && this.isTechDetailEditing > 0) {
          this.vendorTechDefault.VendorTechDetails[existingIndex] = this.vendorTech;
          this.isTechDetailEditing  = 0;
          // this.vendorTech = undefined;
        } else {

          const strArray = this.vendorTechDefault.VendorTechDetails.find((obj) =>
            obj.MachineType === this.vendorTech.MachineType && obj.MachineName === this.vendorTech.MachineName &&
            obj.Status === 'A');
          if (strArray === undefined) {
            this.vendorTechDefault.VendorTechDetails.push(this.vendorTech);
            add = 1;
          }
          if (add === 0) {
            this.PopUpMessage = 'This data already exist.';
            this.alertButton.click();
          }
        }
      } else {
        this.vendorTechDefault.VendorTechDetails.push(this.vendorTech);
      }
    } else {
      this.PopUpMessage = 'Please select data for add.';
      this.alertButton.click();
    }

    this.vendorTech = undefined;
    this.EnableDisableMachine(0);
    this.DisableSaveFormButton();
  }

  EditMachine(vTech1: VendorTech) {
    this.isTechDetailEditing = 1;
    this.techDetailsForm.get('Department').patchValue(vTech1.DeptCode);
    this.techDetailsForm.get('VendorTechConfigID').patchValue(vTech1.VendorTechConfigID);
    this.techDetailsForm.get('UnitCount').patchValue(vTech1.UnitCount);
    this.techDetailsForm.get('Efficiency').patchValue(vTech1.Efficiency);
    this.GetVendorTechSpec();
    this.vendorTech = JSON.parse(JSON.stringify(vTech1));
    this.EnableDisableMachine(1);
  }

  ResetMachine() {
    this.isTechDetailEditing = 0;
    this.techDetailsForm.get('Department').patchValue(null);
    this.techDetailsForm.get('UnitCount').patchValue(null);
    this.GetVendorTechSpec();
    this.SetEfficiencyAsDefault();
    this.EnableDisableMachine(0);
  }

  EnableDisableMachine(isEnable) {
    if (isEnable > 0) {
      this.techDetailsForm.get('Department').disable();
      this.techDetailsForm.get('VendorTechConfigID').disable();
    } else {
      this.techDetailsForm.get('Department').enable();
      this.techDetailsForm.get('VendorTechConfigID').enable();
    }
  }

  DeleteMachine(m) {
    const strArray = this.vendorTechDefault.VendorTechDetails
      .find((obj) => obj.MachineType === m.MachineType && obj.MachineName === m.MachineName);

    if (strArray !== undefined) {
      const index = this.vendorTechDefault.VendorTechDetails.indexOf(strArray);

      if (this.vendorTechDefault.VendorTechDetails[index].VendorTechDetailsID > 0) {
        this.vendorTechDefault.VendorTechDetails[index].Status = 'D';
      } else {
        this.vendorTechDefault.VendorTechDetails.splice(index, 1);
      }
    }

    this.DisableSaveFormButton();
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
