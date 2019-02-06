import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { VendorService } from 'src/app/Services/vendor.service';
import { OrgUnit } from 'src/app/Models/OrgUnit';
import { Vendor } from 'src/app/Models/vendor';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vendor-registration',
  templateUrl: './vendor-registration.component.html',
  styleUrls: ['./vendor-registration.component.css']
})
export class VendorRegistrationComponent implements OnInit {
  RegistrationForm: FormGroup;
  AllPHList: OrgUnit[];
  PHList: OrgUnit[];
  SelectedPHList: OrgUnit[] = [];
  CodeExists: boolean;
  borderStyle: string;
  MasterVendorList: Vendor[] = [];

  HasPHSelected: boolean;
  AlphanumericPattern = '^[a-zA-Z0-9]*$';

  @ViewChild('modalCloseButton')
  modalCloseButton: ElementRef;

  constructor(private _fb: FormBuilder,
    private _vendorService: VendorService,
    private _router: Router) {
  }

  ValidationMessages = {
    'VendorCode': {
      'required': 'Vendor Code is Required',
      'maxlength': 'Code should not exceed 6 characters',
      'pattern': 'Cannot contains special characters',
      'CodeExist': 'Code Already Exists'
    },
    'VendorType': {
      'required': 'Vendor Type is Required'
    },
    'GSTIN': {
      'required': 'GST No. is Required',
      'minlength': 'Invalid GST No.',
      'maxlength': 'Invalid GST No.',
      'pattern': 'Cannot contains special characters'
    },
    'PANNo': {
      'required': 'PAN No. is Required',
      'minlength': 'Invalid PAN number',
      'maxlength': 'Invalid PAN number',
      'pattern': 'Cannot contains special characters'
    }
  };

  formErrors = {
    'VendorCode': '',
    'VendorType': '',
    'GSTIN': '',
    'PANNo': ''
  };

  ngOnInit() {
    this._vendorService.GetPHList().subscribe(PHList => {
      this.AllPHList = PHList.Table;
      this.PHList = PHList.Table;
    });

    this._vendorService.GetVendors(-1, -1).subscribe((Data) => {
      this.MasterVendorList = Data.Vendors.filter(x => x.Status === 'A');
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
      MasterVendorName: [''],
      GSTIN: ['', [Validators.required, Validators.pattern(this.AlphanumericPattern), Validators.minLength(15), Validators.maxLength(15)]],
      PANNo: ['', [Validators.required, Validators.pattern(this.AlphanumericPattern), Validators.minLength(10), Validators.maxLength(10)]],
      PHList: [''],
      SelectedPHList: null,
      PHListCSV: '',
      Ref_VendorCode: '-1',
      IsJWVendor: [false],
      IsDirectVendor: [false]
    });
  }


  logValidationErrors(group: FormGroup = this.RegistrationForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        this.formErrors[key] = '';
        if (abstractControl && !abstractControl.valid &&
          (abstractControl.touched || abstractControl.dirty)) {
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

  // CodeExistValidation(): { [key: string]: boolean } | null {
  //   if (this.CodeExists === true) {
  //     return { 'CodeExist': true };
  //   }
  //   return null;
  // }

  dismiss() {
    this.InitializeFormControls();
    this.PHList = this.AllPHList;
    this.SelectedPHList = [];
  }

  NoPHLeft() {
    if (this.PHList.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  NoSelectedPH() {
    if (this.SelectedPHList.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  SaveVendorPrimaryInfo() {
    const el = this.modalCloseButton.nativeElement as HTMLElement;
    let statusObj: any;
    const vendor = new Vendor();
    vendor.VendorName = this.RegistrationForm.get('VendorName').value;
    vendor.PANNo = this.RegistrationForm.get('PANNo').value;
    vendor.GSTIN = this.RegistrationForm.get('GSTIN').value;
    vendor.IsProvisional = this.RegistrationForm.get('IsProvisional').value;
    vendor.IsRCM = this.RegistrationForm.get('IsRCM').value;
    vendor.VendorCode = this.RegistrationForm.get('VendorCode').value;
    vendor.VendorType = this.RegistrationForm.get('VendorType').value;
    vendor.SelectedPHListCSV = (this.RegistrationForm.get('VendorType').value === 'DP') ? '10' :
      this.SelectedPHList.map(function (element) {
        return element.OrgUnitCode;
      }).join();

    this._vendorService.SaveVendorPrimaryInfo(vendor).subscribe(data => {
      statusObj = data;
      if (statusObj.Status === 0) {
        el.click();
        this._router.navigate(['vendor/' + vendor.VendorCode + '/personal']);
      } else if (statusObj.Status === 2) {
        this.CodeExists = true;
      }
    });
  }

  MoveToSelectedPHList() {
    const values = this.RegistrationForm.get('PHList').value as Array<string>;

    for (let i = 0; i < this.PHList.length; i++) {
      if (values.includes(this.PHList[i].OrgUnitCode)) {
        this.SelectedPHList.push(this.PHList[i]);
      }
    }

    this.DeleteFromArray(values, 'PH');
    this.HasPHSelected = (this.SelectedPHList && this.SelectedPHList.length > 0) ? true : false;
  }

  MoveToPHList() {
    const values = this.RegistrationForm.get('SelectedPHList').value as Array<string>;

    for (let i = 0; i < this.SelectedPHList.length; i++) {
      if (values.includes(this.SelectedPHList[i].OrgUnitCode)) {
        this.PHList.push(this.SelectedPHList[i]);
      }
    }

    this.DeleteFromArray(values, 'SelectedPH');
    this.HasPHSelected = (this.SelectedPHList && this.SelectedPHList.length > 0) ? true : false;
  }

  DeleteFromArray(stringArr: string[], type: string) {

    for (let i = 0; i < stringArr.length; ++i) {
      if (type === 'PH') {
        this.PHList = this.PHList.filter(function (value) {
          if (value.OrgUnitCode !== stringArr[i]) {
            return value;
          }
        });
      } else {
        this.SelectedPHList = this.SelectedPHList.filter(function (value) {
          if (value.OrgUnitCode !== stringArr[i]) {
            return value;
          }
        });
      }
    }
  }

  SetPHListValidation() {
    if (this.RegistrationForm.get('IsJWVendor').value) {
      this.HasPHSelected = true;
    } else {
      this.HasPHSelected = (this.SelectedPHList && this.SelectedPHList.length > 0) ? true : false;
    }
  }

}
