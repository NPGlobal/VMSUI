import { Component, OnInit, SimpleChanges, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
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
import { ValidationMessagesService } from 'src/app/Services/validation-messages.service';
declare var $: any;

@Component({
  selector: 'app-technical-details',
  templateUrl: './technical-details.component.html',
  styleUrls: ['./technical-details.component.css']
})
export class TechnicalDetailsComponent implements OnInit {

  //#region Paging Variables
  totalItems: number;
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[];
  //#endregion

  //#region Form Variables
  techDetailsForm: FormGroup;
  vendorTechDefault: VendorTechDefault;
  vendorTech: VendorTech;
  deptList: any[];
  techSpecList: any[];
  TechDefaultLst: VendorTechDefault[];
  isDeactVendor = false;
  submitted = false;
  vendorcode: string;
  maxTechLineNo: string;
  inputXml = '';
  AddressAndRemarksPattern = /^[+,?-@()\.\-#'&%\/\w\s]*$/;
  efficiencyPattern = /^\d+(\.\d{1,2})?$/;
  DefaultEfficiency: any;
  isTechDetailEditing: any;
  isTechDetailFormChanged: boolean;
  IsFirstTime: boolean;
  IsUserAdmin: boolean;
  //#endregion

  //#region for searching
  searchText = '';
  searchByTechLine = '';
  searchByMachineType = '';
  searchByMachineName = '';
  searchByEfficiency = '';
  searchByUnitCount = '';
  searchByProposedEfficiency = '';
  searchByProposedUnitCount = '';
  //#endregion

  //#region Error Message
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
      'pattern': this._validationMess.EfficiencyPattern
    },
    'UnitCount': {
      'required': ''
    },
    'Efficiency': {
      'pattern': this._validationMess.EfficiencyPattern
    },
    'Remarks': {
      'pattern': this._validationMess.RemarksPattern
    }
  };

  formErrors = {
    'Department': '',
    'TechLineNo': '',
    'DefaultEfficiency': '',
    'UnitCount': '',
    'VendorTechConfigID': '',
    'Efficiency': '',
    'Remarks': ''
  };
  //#endregion

  //#region Modal Popup and Alert
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

  @ViewChild('discardModalOpen')
  discardModalOpen: ElementRef;
  discardModalOpenButton: HTMLElement;

  DeleteModalHeader: string;
  DeleteModalBody: string;
  IsGoingToApprove = false;
  IsGoingToUndo = false;
  //#endregion

  unitCountList(n: number): any[] {
    return Array(n);
  }

  constructor(private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _pager: PagerService,
    private _validationMess: ValidationMessagesService) {
  }

  ngOnInit() {
    this.IsFirstTime = true;
    this.PopUpMessage = '';
    this.alertButton = this.alertModalButton.nativeElement as HTMLElement;
    this.modalClose = this.modalCloseButton.nativeElement as HTMLElement;
    this.discardModalOpenButton = this.discardModalOpen.nativeElement as HTMLElement;
    this.dltModalCloseButton = this.deleteModalClose.nativeElement as HTMLElement;

    this.isTechDetailFormChanged = true;
    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorTech(this.currentPage);
    });
    this.GetVendorDepartments();
    this.isTechDetailEditing = 0;

    this.IsUserAdmin = sessionStorage.getItem('isuseradmin') === 'Y' ? true : false;
  }

  //#region  Initialization
  InitializeFormControls() {
    // const isDefaultEfficiencyDisabled = (this.vendorTechDefault.TechLineNo === null || this.vendorTechDefault.TechLineNo === '');
    this.techDetailsForm = this._fb.group({
      Department: [null, [Validators.required]],
      VendorTechConfigID: [null, [Validators.required]],
      TechLineNo: [{ value: this.vendorTechDefault.TechLineNo, disabled: true }],
      DefaultEfficiency: [this.vendorTechDefault.DefaultEfficiency],
      UnitCount: [null, [Validators.required]],
      Status: [this.vendorTechDefault.Status],
      Remarks: [this.vendorTechDefault.Remarks, Validators.pattern(this.AddressAndRemarksPattern)],
      Efficiency: [null]
    });

    this.SetEfficiencyAsDefault();
    // this.techDetailsForm.valueChanges.subscribe((data) => {
    //   this.LogValidationErrors(this.techDetailsForm);
    // });
    if (localStorage.getItem('VendorStatus') === 'D') {
      this.isDeactVendor = true;
    }
  }

  SetEfficiencyAndMaxLine(techDefault: VendorTechDefault) {
    this._vendorService.GetTechEfficiency(this.vendorcode).subscribe((result) => {
      if (result.Error === '') {
        this.DefaultEfficiency = result.data.Table[0].DefaultEfficiency;
        this.maxTechLineNo = result.data.Table[0].MaxTechLineNo;
        this.BindAndInitializeForm(techDefault);
      } else {
        this.PopUpMessage = 'There is some technical error. Please contact administrator.';
        this.alertButton.click();
      }
    });
  }

  EditTechDetails(techDefault: VendorTechDefault) {
    this.SetEfficiencyAndMaxLine(techDefault);
  }

  BindAndInitializeForm(techDefault: VendorTechDefault) {
    const defaultEff = this.DefaultEfficiency;
    // for add case
    if (techDefault === null) {
      techDefault = new VendorTechDefault();
      techDefault.VendorTechDefaultID = 0;
      techDefault.TechLineNo = this.maxTechLineNo;
      techDefault.DefaultEfficiency = defaultEff;
    } else if (techDefault !== null && (techDefault.TechLineNo.trim() === '-')) { // for line no '-' case
      const techDefaultID = techDefault.VendorTechDefaultID;
      if (techDefault.VendorTechDetails[0].VendorTechDetailsID === null && techDefault.VendorTechDetails[0].VendorTechConfigID === null) {
        techDefault = new VendorTechDefault();
        techDefault.VendorTechDefaultID = techDefaultID;
        techDefault.TechLineNo = '-';
        techDefault.DefaultEfficiency = defaultEff;
      }
    }

    // techDefault.Status = 'P';
    techDefault.Status = 'A';
    this.vendorTechDefault = JSON.parse(JSON.stringify(techDefault));

    if (this.vendorTechDefault.VendorTechDetails) {
      this.vendorTechDefault.VendorTechDetails.filter(x => {
        if (x.Status === 'P' && x.ActionPerformed !== 'Deleted') {
          x.UnitCount = x.ProposedUnitCount;
          x.Efficiency = x.ProposedEfficiency;
        }
      });
    } else {
      this.vendorTechDefault.VendorTechDetails = [];
    }
    this.DisableSaveFormButton();
    this.InitializeFormControls();
  }
  //#endregion

  //#region Searching and Data Binding
  SearchTechDetails(searchText = '') {
    this.searchText = searchText;
    this.GetVendorTech(1);
  }

  SearchTechDetailsList() {
    this.searchText = this.searchByTechLine + '~' + this.searchByMachineType + '~' + this.searchByMachineName + '~' +
      this.searchByEfficiency + '~' + this.searchByUnitCount + '~' + this.searchByProposedEfficiency + '~' + this.searchByProposedUnitCount;
    this.SearchTechDetails(this.searchText);
  }

  GetVendorTech(index: number) {
    this.currentPage = index;
    this._vendorService.GetVendorTechByVendorCode(this.vendorcode, this.currentPage, this.pageSize, this.searchText).
      subscribe(result => {
        if (result.data.length > 0) {
          this.totalItems = result.TotalCount;
          this.TechDefaultLst = result.data;
          this.EditTechDetails(null);
          this.GetVendorsTechList();
        } else {
          this.pagedItems = undefined;
        }
      });

    this.EditTechDetails(null);
    this.GetVendorsTechList();
  }

  GetVendorsTechList() {
    this.pager = this._pager.getPager(this.totalItems, this.currentPage, this.pageSize);
    this.pagedItems = this.TechDefaultLst;
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

  SetEfficiencyAsDefault() {
    this.DefaultEfficiency = this.techDetailsForm.get('DefaultEfficiency').value;
    this.vendorTechDefault.DefaultEfficiency = this.DefaultEfficiency;
    this.techDetailsForm.get('Efficiency').patchValue(this.techDetailsForm.get('DefaultEfficiency').value);
  }
  //#endregion

  //#region Save Form Data
  SaveTechDetails() {
    this.sendFormData();
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

        const defaultEff = this.techDetailsForm.get('DefaultEfficiency').value;
        if ((defaultEff === '' || defaultEff === null) || !this.CheckEfficiencyFormat(defaultEff)) {
          this.LogEfficiencyValidation('DefaultEfficiency');
          return;
        }

        this._vendorService.SaveTechInfo(this.vendorTechDefault).subscribe((result) => {
          if (result.Msg !== '') {
            if (result.Status === 0) {
              this.submitted = false;
              this.PopUpMessage = result.Msg;

              this.totalItems = result.TotalCount;
              this.TechDefaultLst = result.data;

              this.EditTechDetails(null);

              this.GetVendorsTechList();
              this.dismiss();
              this.GetVendorTech(this.currentPage);
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
  //#endregion


  dismiss() {
    this.isTechDetailEditing = 0;
    this.techSpecList = [];

    this.submitted = false;
    this.techDetailsForm.reset();
    this.LogValidationErrors();
    this.InitializeFormControls();

    this.EnableDisableMachine(0);

    this.formErrors.Efficiency = '';
    this.formErrors.DefaultEfficiency = '';

    this.modalClose.click();
    this.dltModalCloseButton.click();
  }

  DisableSaveFormButton() {
    if (this.vendorTechDefault.VendorTechDetails !== undefined) {
      this.isTechDetailFormChanged = this.vendorTechDefault.VendorTechDetails.filter(x => x.Status !== 'D').length === 0;
    } else {
      this.isTechDetailFormChanged = true;
    }
  }

  DeleteTechDetails() {
    if (this.IsGoingToUndo) {
      this.UndoTechRequest();
    } else if (!this.IsGoingToApprove) {
      this.sendFormData();
    } else if (this.IsGoingToApprove) {
      this.ApproveRejectTechLine();
    }
  }

  DeleteTechDetailsPopup(vobj: VendorTechDefault, status: string) {
    this.vendorTechDefault = JSON.parse(JSON.stringify(vobj));
    this.vendorTechDefault.Status = status;

    status = this.IsUserAdmin ? 'A' : 'P';

    this.vendorTechDefault.VendorTechDetails.filter(x => x.Status = status);

    // Added by Shubhi on 17-05-2019 for undo
    //#region Undo Changes
    this.DeleteModalHeader = 'Ready to ' + (this.vendorTechDefault !== undefined &&
      (this.vendorTechDefault.Status === 'D' ? 'Delete' :
        (this.vendorTechDefault.Status === 'B' ? 'Deactivate' :
          (this.vendorTechDefault.Status === 'O' ? 'Activate' : ''))
      )) + '?';

    this.DeleteModalBody = (this.vendorTechDefault !== undefined &&
      (this.vendorTechDefault.Status === 'D' ? 'This record no longer will be available' :
        (this.vendorTechDefault.Status === 'B' ? 'This record no longer will be available for allocation' :
          (this.vendorTechDefault.Status === 'O' ? 'This record will be available for allocation' :
            '')))) + ' in the system.<br>Are you sure ?';

    this.InitializeFormControls();
  }

  //#region Approve/Reject Machines
  ApproveRejectLine(vendortech: VendorTech, status: string) {
    const currentStatus = status.substring(0, 1);
    this.IsGoingToApprove = true;
    this.SetApproveRejectInputString(vendortech, status);
    this.DeleteModalHeader = 'Ready to' + (currentStatus === 'R' ? ' reject?' : ' approve?');
    this.DeleteModalBody = 'Are you sure you want to' + (currentStatus === 'R' ? ' reject?' : ' approve?');
  }
  ApproveRejectMachine(vendortech: VendorTech, status: string) {
    status = status.substring(0, 1);
    this.IsGoingToApprove = true;
    this.SetApproveRejectInputString(vendortech, status);
    this.DeleteModalHeader = 'Ready to' + (status === 'R' ? ' reject?' : ' approve?');
    this.DeleteModalBody = 'Are you sure you want to' + (status === 'R' ? ' reject?' : ' approve?');
  }
  SetApproveRejectInputString(vendortech: VendorTech, status: string) {
    if (status === 'ApproveLine' || status === 'RejectLine') {
      this.inputXml = '<Data>' +
        '<ApproveMachine ' +
        'UserId="' + sessionStorage.getItem('userid') + '" ' +
        'VendorShortCode="' + this.vendorcode + '" ' +
        'LineNumber="' + vendortech.TechLineNo + '" ' +
        'MachineId ="" ' +
        'IsApprove ="' + (status === 'ApproveLine' ? 1 : 0) + '">' +
        '</ApproveMachine>' +
        '</Data>';
    } else {
      this.inputXml = '<Data>' +
        '<ApproveMachine ' +
        'UserId="' + sessionStorage.getItem('userid') + '" ' +
        'VendorShortCode="' + this.vendorcode + '" ' +
        'LineNumber="' + vendortech.TechLineNo + '" ' +
        'MachineId ="' + vendortech.VendorTechConfigID + '" ' +
        'IsApprove ="' + (status === 'A' ? 1 : 0) + '">' +
        '</ApproveMachine>' +
        '</Data>';
    }
  }
  ApproveRejectTechLine() {
    const xmldata = this.inputXml;
    this.DismissDeleteModal();
    this._vendorService.ApproveRejectTechLine({ content: xmldata }).subscribe((result) => {
      if (result.Error === '') {
        if (result.data.Table[0].Result === 0) {
          this.PopUpMessage = result.data.Table[0].Message;
          this.GetVendorTech(1);
        } else {
          this.PopUpMessage = result.data.Table[0].Message;
        }
      } else {
        this.PopUpMessage = 'There is some technical error. Please contact administrator.';
      }
      this.alertButton.click();
    });
  }
  DismissDeleteModal() {
    this.inputXml = '';
    this.IsGoingToApprove = false;
    this.IsGoingToUndo = false;
    this.vendorTechDefault = new VendorTechDefault();
    this.dltModalCloseButton.click();
  }
  //#endregion

  DiscardChanges() {
    let vendorTechDefault = this.TechDefaultLst.find(x => x.VendorTechDefaultID === this.vendorTechDefault.VendorTechDefaultID);
    if (vendorTechDefault === undefined) {
      vendorTechDefault = new VendorTechDefault();
    }
    if (JSON.stringify(vendorTechDefault.VendorTechDetails) === JSON.stringify(this.vendorTechDefault.VendorTechDetails)) {
      this.dismiss();
    } else {
      this.discardModalOpenButton.click();
    }
  }

  //#region Machine Functionality
  AddMachine() {
    const efficiency = this.techDetailsForm.get('Efficiency').value;

    // efficiency validation
    if ((efficiency === null && efficiency === '') || !this.CheckEfficiencyFormat(efficiency)) {
      this.LogEfficiencyValidation('Efficiency');
      return;
    }

    // check data selected or not
    if (this.techDetailsForm.get('Department').value !== null && this.techDetailsForm.get('VendorTechConfigID').value !== null &&
      this.techDetailsForm.get('UnitCount').value !== null) {

      if (this.vendorTech !== undefined) {
        this.vendorTech.Remarks = this.techDetailsForm.get('Remarks').value;
      } else {
        this.vendorTech = new VendorTech();
        this.vendorTech.VendorTechDetailsID = 0;
        this.vendorTech.TechLineNo = this.techDetailsForm.get('TechLineNo').value;
        this.vendorTech.DeptCode = this.techDetailsForm.get('Department').value;
        this.vendorTech.VendorTechConfigID = Number(this.techDetailsForm.get('VendorTechConfigID').value);
        this.vendorTech.MachineType = this.deptList.filter((el) =>
          el.DeptCode === this.vendorTech.DeptCode)[0].DeptName;
        this.vendorTech.MachineName = this.techSpecList.filter((el) =>
          el.VendorConfigID === Number(this.vendorTech.VendorTechConfigID))[0].TechSpec;
        this.vendorTech.Status = this.IsUserAdmin ? 'A' : 'P';
        this.vendorTech.Remarks = this.techDetailsForm.get('Remarks').value;
      }

      if (this.vendorTech.VendorTechDetailsID) {
        this.vendorTech.ActionPerformed = 'Edited';
      } else {
        this.vendorTech.ActionPerformed = 'New';
      }

      this.vendorTech.VendorShortCode = this.vendorcode;
      this.vendorTech.UnitCount = this.techDetailsForm.get('UnitCount').value;
      this.vendorTech.Efficiency = this.techDetailsForm.get('Efficiency').value;

      if (this.vendorTech.Status === 'P') {
        this.vendorTech.ProposedUnitCount = this.techDetailsForm.get('UnitCount').value;
        this.vendorTech.ProposedEfficiency = this.techDetailsForm.get('Efficiency').value;
      }

      // check if data already exists
      let add = 0;

      const defaultTech = this.TechDefaultLst.find(x => x.TechLineNo === this.vendorTech.TechLineNo);

      if (!this.IsUserAdmin) {

        if (this.vendorTechDefault.VendorTechDetails.length > 0) {

          const machineIndex = this.vendorTechDefault.VendorTechDetails.findIndex(x =>
            Number(x.VendorTechConfigID) === Number(this.vendorTech.VendorTechConfigID));

          if (machineIndex > -1) {

            if (this.isTechDetailEditing > 0) {
              this.vendorTech.Status = 'P';

            } else {

              if (defaultTech) {
                const machineDetailIndex = defaultTech.VendorTechDetails.findIndex(x =>
                  x.VendorTechConfigID === this.vendorTech.VendorTechConfigID);

                add = machineDetailIndex > -1 ? 1 : add;
              }

              if (this.vendorTechDefault.VendorTechDetails.findIndex(x =>
                x.VendorTechConfigID === this.vendorTech.VendorTechConfigID &&
                x.Status !== 'D') > -1) {
                add = 0;
              }

              if (add === 0) {
                this.PopUpMessage = 'This data already exist.';
                this.alertButton.click();
                this.submitted = false;
                this.vendorTech = undefined;
                return;
              }
            }

            Object.assign(this.vendorTechDefault.VendorTechDetails[machineIndex], this.vendorTech);

          } else {
            this.vendorTechDefault.VendorTechDetails.push(this.vendorTech);
          }
        } else {
          this.vendorTechDefault.VendorTechDetails.push(this.vendorTech);
        }


      } else if (this.IsUserAdmin) {
        if (this.vendorTechDefault.VendorTechDetails.length > 0) {

          const machineIndex = this.vendorTechDefault.VendorTechDetails.findIndex(x =>
            Number(x.VendorTechConfigID) === Number(this.vendorTech.VendorTechConfigID));

          if (machineIndex > -1) {

            if (this.isTechDetailEditing > 0) {
              this.vendorTech.Status = 'A';

            } else {

              if (defaultTech) {
                const machineDetailIndex = defaultTech.VendorTechDetails.findIndex(x =>
                  x.VendorTechConfigID === this.vendorTech.VendorTechConfigID);

                add = machineDetailIndex > -1 ? 1 : add;
              }

              if (this.vendorTechDefault.VendorTechDetails.findIndex(x =>
                x.VendorTechConfigID === this.vendorTech.VendorTechConfigID &&
                x.Status !== 'D') > -1) {
                add = 0;
              }

              if (add === 0) {
                this.PopUpMessage = 'This data already exist.';
                this.alertButton.click();
                this.submitted = false;
                this.vendorTech = undefined;
                return;
              }
            }

            Object.assign(this.vendorTechDefault.VendorTechDetails[machineIndex], this.vendorTech);

          } else {
            this.vendorTechDefault.VendorTechDetails.push(this.vendorTech);
          }

        } else {
          this.vendorTechDefault.VendorTechDetails.push(this.vendorTech);
        }

      }
    } else {
      this.submitted = true;
      this.LogValidationErrors(this.techDetailsForm);
      this.PopUpMessage = 'Please select data for add.';
      this.alertButton.click();
      this.submitted = false;
      this.vendorTech = undefined;
      return;
    }

    this.DisableSaveFormButton();

    this.ResetMachine();
  }

  EditMachine(vTech1: VendorTech) {
    this.isTechDetailEditing = 1;
    this.techDetailsForm.get('Department').patchValue(vTech1.DeptCode);
    this.techDetailsForm.get('VendorTechConfigID').patchValue(vTech1.VendorTechConfigID);
    this.techDetailsForm.get('Remarks').patchValue(vTech1.Remarks);
    if (vTech1.Status === 'P') {
      this.techDetailsForm.get('UnitCount').patchValue(vTech1.ProposedUnitCount);
      this.techDetailsForm.get('Efficiency').patchValue(vTech1.ProposedEfficiency);
    } else {
      this.techDetailsForm.get('UnitCount').patchValue(vTech1.UnitCount);
      this.techDetailsForm.get('Efficiency').patchValue(vTech1.Efficiency);
    }
    this.LogValidationErrors();
    this.GetVendorTechSpec();
    this.vendorTech = JSON.parse(JSON.stringify(vTech1));
    this.EnableDisableMachine(1);
  }

  ResetMachine() {
    this.isTechDetailEditing = 0;
    this.submitted = false;
    this.vendorTech = undefined;
    this.techDetailsForm.get('Department').patchValue(null);
    this.techDetailsForm.get('UnitCount').patchValue(null);
    this.techDetailsForm.get('Remarks').patchValue(null);

    this.vendorTechDefault.Remarks = this.techDetailsForm.get('Remarks').value;

    this.InitializeFormControls();
    this.LogValidationErrors();
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

      const existingDefaultTech = this.TechDefaultLst.find(x => x.TechLineNo === this.vendorTechDefault.TechLineNo);

      let existingIndex = -1;

      if (existingDefaultTech) {
        existingIndex = existingDefaultTech.VendorTechDetails.findIndex(x =>
          Number(x.VendorTechConfigID) === Number(this.vendorTechDefault.VendorTechDetails[index].VendorTechConfigID));
      }

      if (existingIndex > -1) {

        if (this.vendorTechDefault.VendorTechDetails[index].VendorTechDetailsID) {
          this.vendorTechDefault.VendorTechDetails[index].VendorTechDetailsProposedID = null;
        }
        this.vendorTechDefault.VendorTechDetails[index].ActionPerformed = 'Deleted';
        this.vendorTechDefault.VendorTechDetails[index].Status = this.IsUserAdmin ? 'D' : 'P';
      } else {
        this.vendorTechDefault.VendorTechDetails.splice(index, 1);
      }
    }

    this.DisableSaveFormButton();
  }
  //#endregion

  //#region Validator
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
  LogEfficiencyValidation(type: string) {
    switch (type) {
      case 'Efficiency': {
        const efficiecny = this.techDetailsForm.get('Efficiency').value;
        if (efficiecny === '' || efficiecny === null) {
          this.formErrors.Efficiency = ' ';
        } else if (efficiecny !== null && efficiecny !== ''
          && !this.CheckEfficiencyFormat(this.techDetailsForm.get('Efficiency').value)) {
          this.formErrors.Efficiency = this.ValidationMessages.Efficiency.pattern;
        } else {
          this.formErrors.Efficiency = '';
        }
        break;
      }
      case 'DefaultEfficiency': {
        const defaultEff = this.techDetailsForm.get('DefaultEfficiency').value;
        if (defaultEff === '' || defaultEff === null) {
          this.formErrors.DefaultEfficiency = ' ';
        } else if (!this.CheckEfficiencyFormat(this.techDetailsForm.get('DefaultEfficiency').value)) {
          this.formErrors.DefaultEfficiency = this.ValidationMessages.DefaultEfficiency.pattern;
        } else {
          this.formErrors.DefaultEfficiency = '';
        }
        break;
      }
    }
  }
  CheckEfficiencyFormat(value: string) {
    let success = false;
    const regex = new RegExp(this.efficiencyPattern);

    if (value !== null && value !== '' && regex.test(value) && Number(value) >= 1 && Number(value) <= 100) {
      success = true;
    }
    return success;
  }
  CheckIfLineCanAdd(): boolean {
    let success = true;

    success = this.TechDefaultLst.filter(function (element) {
      return element.VendorTechDetails.findIndex(x => x.Status === 'P') > -1;
    }).length === 0;

    return success;
  }
  CheckIfLineCanEdit(): boolean {
    let success = true;

    const currentLine = this.vendorTechDefault.TechLineNo;
    // if machines with less line no are not approved or rejected.
    if (currentLine !== '-') {
      const lstWithLessLineNumber = this.TechDefaultLst.filter(function (element) {
        return element.TechLineNo !== '-' && (Number(element.TechLineNo) < Number(currentLine));
      });

      success = lstWithLessLineNumber.filter(function (element) {
        return element.VendorTechDetails.findIndex(x => x.Status === 'P') > -1;
      }).length === 0;

      if (!success) {
        this.PopUpMessage = 'Please approve/reject lower line no machines first.';
        this.alertButton.click();
      }
    }

    // sewing machine not approved/rejected
    success = this.vendorTechDefault.VendorTechDetails.find(x => x.VendorTechConfigID === 88).Status !== 'P';
    if (!success) {
      this.PopUpMessage = 'Please approve sewing machine first.';
      this.alertButton.click();
    }

    return success;
  }
  specChange(event) {
    this.SetEfficiencyAsDefault();
  }
  //#endregion

  //#region UndoFunctionality
  UndoLineRequest(vendorTechDefault: VendorTechDefault) {
    this.IsGoingToUndo = true;
    this.SetUndoInputString('Line', null, vendorTechDefault);
    this.DeleteModalHeader = 'Ready to Undo?';
    this.DeleteModalBody = 'Are you sure you want to undo?';
  }

  UndoMachineRequest(vendorTech: VendorTech) {
    this.IsGoingToUndo = true;
    this.SetUndoInputString('Machine', vendorTech);
    this.DeleteModalHeader = 'Ready to Undo?';
    this.DeleteModalBody = 'Are you sure you want to undo?';
  }

  SetUndoInputString(type: string, vendortech?: VendorTech, vendorTechDefault?: VendorTechDefault) {
    this.inputXml = '';
    if (type === 'Line') {
      this.inputXml = '<Data>' +
        '<UndoRequest ' +
        'UserId="' + sessionStorage.getItem('userid') + '" ' +
        'VendorShortCode="' + this.vendorcode + '" ' +
        'LineNumber="' + vendorTechDefault.TechLineNo + '" ' +
        'MachineId =""' +
        '></UndoRequest>' +
        '</Data>';
    } else {
      this.inputXml = '<Data>' +
        '<UndoRequest ' +
        'UserId="' + sessionStorage.getItem('userid') + '" ' +
        'VendorShortCode="' + this.vendorcode + '" ' +
        'LineNumber="' + vendortech.TechLineNo + '" ' +
        'MachineId ="' + vendortech.VendorTechConfigID + '"' +
        '></UndoRequest>' +
        '</Data>';
    }
  }

  UndoTechRequest() {
    const xmldata = this.inputXml;
    this._vendorService.UndoTechRequest({ content: xmldata }).subscribe((result) => {
      if (result.Error === '') {
        if (result.data.Table[0].Result === 0) {
          this.PopUpMessage = result.data.Table[0].Message;
          this.GetVendorTech(1);
        } else {
          this.PopUpMessage = result.data.Table[0].Message;
        }
      } else {
        this.PopUpMessage = 'There is some technical error. Please contact administrator.';
      }
      this.alertButton.click();
    });

    this.DismissDeleteModal();
  }
  //#endregion
}
