import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { VendorService } from 'src/app/Services/vendor.service';
import { OrgUnit } from 'src/app/Models/OrgUnit';
import { Vendor } from 'src/app/Models/vendor';
import { Router } from '@angular/router';
import { MasterVendor } from 'src/app/Models/master-vendor';

@Component({
  selector: 'app-vendor-registration',
  templateUrl: './vendor-registration.component.html',
  styleUrls: ['./vendor-registration.component.css']
})
export class VendorRegistrationComponent implements OnInit {
  RegistrationForm: FormGroup;
  AllPHList: OrgUnit[];
  PHList: OrgUnit[];
  StoreList: OrgUnit[];
  SelectedPHStoreList: OrgUnit[] = [];
  CodeExists: boolean;
  borderStyle: string;
  MasterVendorList: MasterVendor[] = [];
  ReferenceVendorList: Vendor[] = [];
  HasPHSelected: boolean;
  submitted = false;
  AlphanumericPattern = '^[a-zA-Z0-9]*$';

  @ViewChild('modalCloseButton')
  modalCloseButton: ElementRef;

  constructor(private _fb: FormBuilder,
    private _vendorService: VendorService,
    private _router: Router) {
  }

  ValidationMessages = {
    'VendorCode': {
      'required': '',
      'maxlength': 'Code should not exceed 6 characters',
      'pattern': 'Cannot contains special characters',
      'CodeExist': 'Code Already Exists'
    },
    'VendorType': {
      'required': 'Vendor Type is Required'
    },
    'GSTIN': {
      'required': '',
      'minlength': 'Invalid GST No.',
      'maxlength': 'Invalid GST No.',
      'pattern': 'Cannot contains special characters'
    },
    'PANNo': {
      'required': '',
      'minlength': 'Invalid PAN number',
      'maxlength': 'Invalid PAN number',
      'pattern': 'Cannot contains special characters'
    },
    'MasterVendorId': {
      'required': ''
    }
  };

  formErrors = {
    'VendorCode': '',
    'VendorType': '',
    'GSTIN': '',
    'PANNo': '',
    'MasterVendorId': ''
  };

  ngOnInit() {
    this._vendorService.GetPHList().subscribe(result => {
      this.AllPHList = result.data.Table;
      this.PHList = result.data.Table.filter(x => x.OrgUnitTypeCode === 'P');
      this.StoreList = result.data.Table.filter(x => x.OrgUnitTypeCode === 'S');
      console.log(this.PHList.length);
      console.log(this.StoreList.length);
    });


    this._vendorService.GetMasterVendorList().subscribe((result) => {
      this.MasterVendorList = result.data.MasterVendors;
    });

    this._vendorService.GetVendors(-1, -1).subscribe((result) => {
      this.ReferenceVendorList = result.data.Vendors;
    });

    this.InitializeFormControls();

    this.HasPHSelected = true;
    this.CodeExists = false;
    this.RegistrationForm.valueChanges.subscribe((data) => {
      this.logValidationErrors(this.RegistrationForm);
    });
  }

  InitializeFormControls() {
    this.RegistrationForm = this._fb.group({
      VendorCode: ['', [Validators.required, Validators.maxLength(6), Validators.pattern(this.AlphanumericPattern)]],
      VendorName: [''],
      IsRCM: ['false'],
      IsProvisional: [false],
      MasterVendorId: ['', Validators.required],
      RefVendorName: [''],
      GSTIN: ['', [Validators.required, Validators.pattern(this.AlphanumericPattern), Validators.minLength(15), Validators.maxLength(15)]],
      PANNo: ['', [Validators.required, Validators.pattern(this.AlphanumericPattern), Validators.minLength(10), Validators.maxLength(10)]],
      PHList: [''],
      StoreList: [''],
      SelectedPHStoreList: null,
      PHListCSV: '',
      Ref_VendorCode: '-1',
      IsJWVendor: [false],
      IsDirectVendor: [true]
    });
  }


  logValidationErrors(group: FormGroup = this.RegistrationForm): void {
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

  dismiss() {
    this.submitted = false;
    this.RegistrationForm.reset();
    this.InitializeFormControls();
    this.logValidationErrors();
    this.PHList = this.AllPHList.filter(ph => ph.OrgUnitTypeCode === 'P');
    this.StoreList = this.AllPHList.filter(ph => ph.OrgUnitTypeCode === 'S');
    this.SelectedPHStoreList = [];
  }

  NoPHandStore() {
    if (this.PHList.length !== 0 && this.StoreList.length !== 0) {
      return false;
    } else {
      return true;
    }
  }

  NoSelectedPHOrStore() {
    if (this.SelectedPHStoreList.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  SaveVendorPrimaryInfo() {
    this.submitted = true;
    if (this.RegistrationForm.invalid) {
      this.logValidationErrors();
      return;
    }
    const el = this.modalCloseButton.nativeElement as HTMLElement;
    let statusObj: any;
    const vendor = new Vendor();
    const masterVendor = new MasterVendor();
    vendor.MasterVendorId = this.RegistrationForm.get('MasterVendorId').value;
    vendor.Ref_VendorCode = this.RegistrationForm.get('Ref_VendorCode').value;
    vendor.VendorName = this.RegistrationForm.get('VendorName').value;
    vendor.PANNo = this.RegistrationForm.get('PANNo').value;
    vendor.GSTIN = this.RegistrationForm.get('GSTIN').value;
    vendor.IsProvisional = this.RegistrationForm.get('IsProvisional').value;
    vendor.IsRCM = this.RegistrationForm.get('IsRCM').value;
    vendor.VendorCode = this.RegistrationForm.get('VendorCode').value;
    vendor.IsDirectVendor = this.RegistrationForm.get('IsDirectVendor').value;
    vendor.IsJWVendor = this.RegistrationForm.get('IsJWVendor').value;
    vendor.SelectedPHListCSV = !vendor.IsJWVendor ? '' :
      this.SelectedPHStoreList.map(function (element) {
        return element.OrgUnitCode;
      }).join();

    this._vendorService.SaveVendorPrimaryInfo(vendor).subscribe(result => {
      statusObj = result;
      if (statusObj.Status === 0) {
        el.click();
        this._router.navigate(['vendor/' + vendor.VendorCode + '/personal']);
      } else if (statusObj.Status === 2) {
        this.CodeExists = true;
      }
    });
    console.log(JSON.stringify(vendor));
  }

  MoveToSelectedPHList() {
    const phValues = this.RegistrationForm.get('PHList').value as Array<string>;
    const storeValues = this.RegistrationForm.get('StoreList').value as Array<string>;

    if (phValues.length > 0) {
      for (let i = 0; i < this.PHList.length; i++) {
        if (phValues.includes(this.PHList[i].OrgUnitCode)) {
          this.SelectedPHStoreList.push(this.PHList[i]);
        }
      }
      this.DeleteFromArray(phValues, 'PH');
    }

    if (storeValues.length > 0) {
      for (let i = 0; i < this.StoreList.length; i++) {
        if (storeValues.includes(this.StoreList[i].OrgUnitCode)) {
          this.SelectedPHStoreList.push(this.StoreList[i]);
        }
      }
      this.DeleteFromArray(storeValues, 'Store');
    }

    this.HasPHSelected = (this.SelectedPHStoreList && this.SelectedPHStoreList.length > 0) ? true : false;
  }

  MoveToPHList() {
    const values = this.RegistrationForm.get('SelectedPHStoreList').value as Array<string>;

    for (let i = 0; i < this.SelectedPHStoreList.length; i++) {
      if (values.includes(this.SelectedPHStoreList[i].OrgUnitCode)) {

        if (this.SelectedPHStoreList[i].OrgUnitTypeCode === 'P') {
          this.PHList.push(this.SelectedPHStoreList[i]);
        }

        if (this.SelectedPHStoreList[i].OrgUnitTypeCode === 'S') {
          this.StoreList.push(this.SelectedPHStoreList[i]);
        }
      }
    }

    this.DeleteFromArray(values, 'SelectedPH');

    this.HasPHSelected = (this.SelectedPHStoreList && this.SelectedPHStoreList.length > 0) ? true : false;
  }

  DeleteFromArray(stringArr: string[], type: string) {

    for (let i = 0; i < stringArr.length; ++i) {
      if (type === 'PH') {
        this.PHList = this.PHList.filter(function (value) {
          if (value.OrgUnitCode !== stringArr[i]) {
            return value;
          }
        });
      } else if (type === 'Store') {
        this.StoreList = this.StoreList.filter(function (value) {
          if (value.OrgUnitCode !== stringArr[i]) {
            return value;
          }
        });
      } else {
        this.SelectedPHStoreList = this.SelectedPHStoreList.filter(function (value) {
          if (value.OrgUnitCode !== stringArr[i]) {
            return value;
          }
        });
      }
    }
  }

  SetPHListValidation() {
    this.PHList = this.AllPHList.filter(x => x.OrgUnitTypeCode === 'P');
    this.StoreList = this.AllPHList.filter(x => x.OrgUnitTypeCode === 'S');
    this.SelectedPHStoreList = [];
    if (this.RegistrationForm.get('IsJWVendor').value) {
      this.HasPHSelected = false;
    } else if (this.RegistrationForm.get('IsDirectVendor').value) {
      this.HasPHSelected = true;
    } else {
      this.HasPHSelected = (this.SelectedPHStoreList && this.SelectedPHStoreList.length > 0) ? true : false;
    }
  }

  UnselectOptions() {
    // this.RegistrationForm.get('PHList').patchValue('');
    // this.RegistrationForm.get('StoreList').patchValue('');
    // this.RegistrationForm.get('SelectedPHStoreList').patchValue('');
  }

}
