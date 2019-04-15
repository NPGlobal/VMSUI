import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { VendorService } from 'src/app/Services/vendor.service';
import { VendorAddress } from 'src/app/Models/vendor-address';
import { MasterDataDetails } from 'src/app/Models/master-data-details';
import { MasterDataDetailsService } from 'src/app/Services/master-data-details.service';
import { ActivatedRoute } from '@angular/router';
import {ValidationMessagesService} from 'src/app/Services/validation-messages.service';

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.css']
})
export class AddressFormComponent implements OnInit {

  //#region Form Variables Declaration
  AddressForm: FormGroup;
  VendorCode: string;
  VendorAddress: VendorAddress; // to save/edit vendor address
  VendorAddresses: VendorAddress[] = []; // for binding vendor addresses
  CountryList: MasterDataDetails[] = [];
  StateList: MasterDataDetails[] = [];
  submitted = false;
  //#endregion

  //#region Patterns
  AddressAndRemarksPattern = /^[+,?-@()\.\-#'&%\/\w\s]*$/;
  PinPattern = '^[1-9][0-9]{5}$';
  NumberPattern: '^[1-9][0-9]*$';
  PhonePattern = '^[0-9]{10}$';
  EmailPattern = '[a-zA-Z0-9!#$%&\'*+\/=?^_`{|}~.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*';
  WebsitePattern = '^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+\/?)*$';
  // AlphabetPattern = '^[a-zA-Z ]*$';
  AlphabetPattern = '^[a-zA-Z ]*[\.\]?[a-zA-Z ]*$';
  isDeactVendor = false;
  //#endregion

  //#region Modal Popup and Alert
  @ViewChild('modalCloseButton')
  modalCloseButton: ElementRef;

  @ViewChild('addModalOpenButton')
  addModalOpenButton: ElementRef;

  @ViewChild('alertModalButton')
  alertModalButton: ElementRef;
  PopUpMessage: string;
  alertButton: HTMLElement;

  //#endregion

  //#region Validation messages
  ValidationMessages = {
    'OrgUnitCode': {
      'required': ''
    },
    'PIN': {
      'required': '',
      'pattern': this._validationMess.PinPattern,
      'minlength': '',
      'maxlength': ''
    },
    'CountryCode': {
      'required': ''
    },
    'StateCode': {
      'required': ''
    },
    'CityCode': {
      'required': '',
      'pattern': this._validationMess.CityPattern
    },
    'Address1': {
      'required': '',
      'pattern' : this._validationMess.AddressPattern
    },
    'Address2': {
      'pattern' : this._validationMess.AddressPattern
    },
    'Address3': {
      'pattern' : this._validationMess.AddressPattern
    },
    'PrimaryContactName': {
      'required': '',
      'pattern': this._validationMess.ContactNamePattern
    },
    'PrimaryContactPhone': {
      'required': '',
      'pattern': this._validationMess.PhonePattern
    },
    'PrimaryContactFax': {
      'pattern': this._validationMess.FaxPattern
    },
    'PrimaryContactEmail': {
      'pattern': this._validationMess.EmailPattern
    },
    'PrimaryContactWebsite': {
      'pattern': this._validationMess.WebsitePattern
    },
    'SecondaryContactName': {
      'pattern': this._validationMess.ContactNamePattern
    },
    'SecondaryContactPhone': {
      'pattern': this._validationMess.PhonePattern
    },
    'SecondaryContactFax': {
      'pattern': this._validationMess.FaxPattern
    },
    'SecondaryContactEmail': {
      'pattern': this._validationMess.EmailPattern
    },
    'SecondaryContactWebsite': {
      'pattern': this._validationMess.WebsitePattern
    },
  };

  formErrors = {
    'PrimaryContactName': '',
    'PrimaryContactPhone': '',
    'PrimaryContactFax': '',
    'PrimaryContactEmail': '',
    'SecondaryContactPhone': '',
    'SecondaryContactFax': '',
    'SecondaryContactEmail': '',
    'NameofInsuranceCompany': '',
    'PrimaryContactWebsite': '',
    'SecondaryContactWebsite': '',
    'OrgUnitCode': '',
    'PIN': '',
    'CountryCode': '',
    'StateCode': '',
    'CityCode': '',
    'Address1': '',
    'Address2': '',
    'Address3': ''
  };
  //#endregion

  constructor(private _fb: FormBuilder,
    private _vendorService: VendorService,
    private _mddService: MasterDataDetailsService,
    private _route: ActivatedRoute,
    private _validationMess: ValidationMessagesService ) {
    this.VendorAddress = this.CreateNewAddress();
  }

  ngOnInit() {
    this.PopUpMessage = '';
    this.alertButton = this.alertModalButton.nativeElement as HTMLElement;

    this._route.parent.paramMap.subscribe((data) => {
      this.VendorCode = (data.get('code'));
    });

    this.GetCountryList();
    this.GetStateList();
    this.Editvendor(this.VendorCode);
    if (localStorage.getItem('VendorStatus') === 'D') {
      this.isDeactVendor = true;
    }
  }

  //#region Form Initialization
  Editvendor(Code: string) {
    this._vendorService.GetVendorAddress(Code).subscribe((result) => {
      this.VendorAddresses = result.data.FactoryAddress;
    });
  }

  InitializeFormControls() {

    this.AddressForm = this._fb.group({
      OrgUnitCode: [this.VendorAddress.OrgUnitCode],
      Address1: [this.VendorAddress.Address1, [Validators.required, Validators.pattern(this.AddressAndRemarksPattern)]],
      Address2: [this.VendorAddress.Address2, Validators.pattern(this.AddressAndRemarksPattern)],
      Address3: [this.VendorAddress.Address3, Validators.pattern(this.AddressAndRemarksPattern)],
      CountryCode: [this.CountryList.length === 1 ? this.CountryList[0].MDDCode : null, Validators.required],
      CityCode: [this.VendorAddress.CityCode, [Validators.required, Validators.pattern(this.AlphabetPattern)]],
      StateCode: [this.VendorAddress.StateCode, Validators.required],
      PIN: [this.VendorAddress.PIN,
      [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(this.PinPattern)]],
      AddressTypeCode: [this.VendorAddress.AddressTypeCode],
      PrimaryContactName: [this.VendorAddress.PrimaryContactName, [Validators.required, Validators.pattern(this.AlphabetPattern)]],
      PrimaryContactPhone: [this.VendorAddress.PrimaryContactPhone, [Validators.required, Validators.pattern(this.PhonePattern)]],
      PrimaryContactFax: [this.VendorAddress.PrimaryContactFax, Validators.pattern(this.PhonePattern)],
      PrimaryContactEmail: [this.VendorAddress.PrimaryContactEmail, Validators.pattern(this.EmailPattern)],
      PrimaryContactWebsite: [this.VendorAddress.PrimaryContactWebsite, Validators.pattern(this.WebsitePattern)],
      SecondaryContactName: [this.VendorAddress.SecondaryContactName, [Validators.pattern(this.AlphabetPattern)]],
      SecondaryContactPhone: [this.VendorAddress.SecondaryContactPhone, Validators.pattern(this.PhonePattern)],
      SecondaryContactFax: [this.VendorAddress.SecondaryContactFax, Validators.pattern(this.PhonePattern)],
      SecondaryContactEmail: [this.VendorAddress.SecondaryContactEmail, Validators.pattern(this.EmailPattern)],
      SecondaryContactWebsite: [this.VendorAddress.SecondaryContactWebsite, Validators.pattern(this.WebsitePattern)]
    });
    // this.AddressForm.valueChanges.subscribe((data) => {
    //   this.LogValidationErrors(this.AddressForm);
    // });
   }
  //#endregion

  //#region Data Binding
  GetCountryList() {
    this._mddService.GetMasterDataDetails('COUNTRY', '-1').subscribe((result) => {
      this.CountryList = result.data.Table.filter(x => x.MDDName === 'India');
    });
  }

  GetStateList() {
    this._mddService.GetMasterDataDetails('STATE', '-1').subscribe(result => {
      this.StateList = result.data.Table;
    });
  }
  //#endregion

  //#region Open/Close Modal
  CreateNewAddress(): any {
    const address = Object.assign({}, {
      AddressCode: null,
      AddressTypeCode: 'F',
      CountryCode: 'null',
      StateCode: null,
      PIN: null
    });
    return address;
  }

  OpenAddressModal(vendorAddress: VendorAddress) {
    this.VendorAddress = vendorAddress;
    this.InitializeFormControls();
    const el = this.addModalOpenButton.nativeElement as HTMLElement;
    el.click();
  }

  ResetForm() {
    this.submitted = false;
    this.VendorAddress = this.CreateNewAddress();
    this.InitializeFormControls();
    this.VendorAddresses = [];
    this.Editvendor(this.VendorCode);
    this.LogValidationErrors();
  }
  //#endregion

  //#region Form Validator
  LogValidationErrors(group: FormGroup = this.AddressForm): void {
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
  //#endregion

  //#region Save Form Data
  SaveAddressDetails() {
    this.submitted = true;

    if (this.AddressForm.invalid) {
      this.LogValidationErrors();
      return;
    }

    const el = this.modalCloseButton.nativeElement as HTMLElement;

    if (this.VendorAddress.AddressCode === null || this.VendorAddress.AddressCode === undefined) {
      this.VendorAddress = new VendorAddress();
    }

    this.VendorAddress.CompanyCode = '10';
    this.VendorAddress.OrgUnitCode = this.AddressForm.get('OrgUnitCode').value === null ? '' : this.AddressForm.get('OrgUnitCode').value;
    this.VendorAddress.PIN = this.AddressForm.get('PIN').value;
    this.VendorAddress.Address1 = this.AddressForm.get('Address1').value;
    this.VendorAddress.Address2 = this.AddressForm.get('Address2').value === null ? '' : this.AddressForm.get('Address2').value;
    this.VendorAddress.Address3 = this.AddressForm.get('Address3').value === null ? '' : this.AddressForm.get('Address3').value;
    this.VendorAddress.StateCode = this.AddressForm.get('StateCode').value;
    this.VendorAddress.CityCode = this.AddressForm.get('CityCode').value;
    this.VendorAddress.CountryCode = this.AddressForm.get('CountryCode').value;
    this.VendorAddress.AddressTypeCode = this.AddressForm.get('AddressTypeCode').value;
    this.VendorAddress.AddressReference = 'V';
    this.VendorAddress.VendorCode = this.VendorCode;
    this.VendorAddress.AddressCode = this.VendorAddress.AddressCode === null || this.VendorAddress.AddressCode === undefined ?
    '' : this.VendorAddress.AddressCode;
    this.VendorAddress.PrimaryContactName = this.AddressForm.get('PrimaryContactName').value;
    this.VendorAddress.PrimaryContactPhone = this.AddressForm.get('PrimaryContactPhone').value;
    this.VendorAddress.PrimaryContactFax = this.AddressForm.get('PrimaryContactFax').value === null
      ? '' : this.AddressForm.get('PrimaryContactFax').value;
    this.VendorAddress.PrimaryContactEmail = this.AddressForm.get('PrimaryContactEmail').value === null
      ? '' : this.AddressForm.get('PrimaryContactEmail').value;
    this.VendorAddress.PrimaryContactWebsite = this.AddressForm.get('PrimaryContactWebsite').value === null
      ? '' : this.AddressForm.get('PrimaryContactWebsite').value;
    this.VendorAddress.SecondaryContactName = this.AddressForm.get('SecondaryContactName').value === null
      ? '' : this.AddressForm.get('SecondaryContactName').value;
    this.VendorAddress.SecondaryContactPhone = this.AddressForm.get('SecondaryContactPhone').value === null
      ? '' : this.AddressForm.get('SecondaryContactPhone').value;
    this.VendorAddress.SecondaryContactFax = this.AddressForm.get('SecondaryContactFax').value === null
      ? '' : this.AddressForm.get('SecondaryContactFax').value;
    this.VendorAddress.SecondaryContactEmail = this.AddressForm.get('SecondaryContactEmail').value === null
      ? '' : this.AddressForm.get('SecondaryContactEmail').value;
    this.VendorAddress.SecondaryContactWebsite = this.AddressForm.get('SecondaryContactWebsite').value === null
      ? '' : this.AddressForm.get('SecondaryContactWebsite').value;

    try {
      this._vendorService.SaveVendorFactoryAddress(this.VendorAddress).subscribe((result) => {
        if (result.data.Table[0].ResultCode === 0) {
          this.PopUpMessage = result.data.Table[0].ResultMessage;
          el.click();
          this.alertButton.click();
        }
      });
    } catch {
      this.PopUpMessage = 'There are some technical error. Please contact administrator.';
      this.alertButton.click();
    }

  }
  //#endregion
}
