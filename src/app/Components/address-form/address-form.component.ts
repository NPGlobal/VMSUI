import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OrgUnit } from 'src/app/Models/OrgUnit';
import { VendorService } from 'src/app/Services/vendor.service';
import { VendorAddress } from 'src/app/Models/vendor-address';
import { MasterDataDetails } from 'src/app/Models/master-data-details';
import { MasterDataDetailsService } from 'src/app/Services/master-data-details.service';
import { Router } from '@angular/router';
import { Vendor } from 'src/app/Models/vendor';

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.css']
})
export class AddressFormComponent implements OnInit, OnChanges {

  VendorAddress: VendorAddress;
  AddressForm: FormGroup;
  OnlyDirectVendor = false;
  NumberPattern: '^[1-9][0-9]*$';

  @Output() IsAddressSaved = new EventEmitter<boolean>();

  @Input()
  vendor: Vendor;

  @Input()
  Address: VendorAddress;

  @ViewChild('modalCloseButton')
  modalCloseButton: ElementRef;

  AllPHList: OrgUnit[] = [];
  SelectedPHList: OrgUnit[] = [];
  CountryList: MasterDataDetails[] = [];
  StateList: MasterDataDetails[] = [];
  submitted = false;

  PhonePattern = '^[0-9]{10}$';
  EmailPattern = '[a-zA-Z0-9!#$%&\'*+\/=?^_`{|}~.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*';
  WebsitePattern = '^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+\/?)*$';
  AlphabetPattern = '^[a-zA-Z ]*$';

  ValidationMessages = {
    'OrgUnitCode': {
      'required': ''
    },
    'PIN': {
      'required': '',
      'pattern': 'Invalid PIN number',
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
      'pattern': ''
    },
    'Address1': {
      'required': ''
    },
    'PrimaryContactName': {
      'required': '',
      'pattern': ''
    },
    'PrimaryContactPhone': {
      'required': '',
      'pattern': ''
    },
    'PrimaryContactFax': {
      'pattern': ''
    },
    'PrimaryContactEmail': {
      'pattern': ''
    },
    'PrimaryContactWebsite': {
      'pattern': ''
    },
    'SecondaryContactName': {
      'pattern': ''
    },
    'SecondaryContactPhone': {
      'pattern': ''
    },
    'SecondaryContactFax': {
      'pattern': ''
    },
    'SecondaryContactEmail': {
      'pattern': ''
    },
    'SecondaryContactWebsite': {
      'pattern': ''
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
    'Address1': ''
  };

  constructor(private _fb: FormBuilder,
    private _vendorService: VendorService,
    private _mddService: MasterDataDetailsService,
    private _router: Router) { }

  ngOnInit() {
    this.GetCountryList();
    this.GetStateList();

    this.BindOrgUnitDropDown();

    this.InitializeFormControls();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.InitializeFormControls();
  }

  FillPHLists() {
    if (this.vendor && this.vendor.SelectedPHListCSV) {
      const selectedOrgCodeArr = this.vendor.SelectedPHListCSV.split(',');
      for (let i = 0; i < this.AllPHList.length; ++i) {
        if (selectedOrgCodeArr.includes(this.AllPHList[i].OrgUnitCode)) {
          this.SelectedPHList.push(this.AllPHList[i]);
        }
      }
    }
  }

  InitializeFormControls() {

    this.AddressForm = this._fb.group({
      OrgUnitCode: [this.Address.OrgUnitCode],
      Address1: [this.Address.Address1, Validators.required],
      Address2: [this.Address.Address2],
      Address3: [this.Address.Address3],
      CountryCode: ['IN', Validators.required],
      CityCode: [this.Address.CityCode, [Validators.required, Validators.pattern(this.AlphabetPattern)]],
      StateCode: [this.Address.StateCode, Validators.required],
      PIN: [this.Address.PIN,
      [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(this.NumberPattern)]],
      AddressTypeCode: [this.Address.AddressTypeCode],
      PrimaryContactName: [this.Address.PrimaryContactName, [Validators.required, Validators.pattern(this.AlphabetPattern)]],
      PrimaryContactPhone: [this.Address.PrimaryContactPhone, [Validators.required, Validators.pattern(this.PhonePattern)]],
      PrimaryContactFax: [this.Address.PrimaryContactFax, Validators.pattern(this.PhonePattern)],
      PrimaryContactEmail: [this.Address.PrimaryContactEmail, Validators.pattern(this.EmailPattern)],
      PrimaryContactWebsite: [this.Address.PrimaryContactWebsite, Validators.pattern(this.WebsitePattern)],
      SecondaryContactName: [this.Address.SecondaryContactName, [Validators.pattern(this.AlphabetPattern)]],
      SecondaryContactPhone: [this.Address.SecondaryContactPhone, Validators.pattern(this.PhonePattern)],
      SecondaryContactFax: [this.Address.SecondaryContactFax, Validators.pattern(this.PhonePattern)],
      SecondaryContactEmail: [this.Address.SecondaryContactEmail, Validators.pattern(this.EmailPattern)],
      SecondaryContactWebsite: [this.Address.SecondaryContactWebsite, Validators.pattern(this.WebsitePattern)]
    });
    this.AddressForm.valueChanges.subscribe((data) => {
      this.LogValidationErrors(this.AddressForm);
    });
  }

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

  BindOrgUnitDropDown() {
    this._vendorService.GetPHList().subscribe(result => {
      this.AllPHList = result.data.Table;
      this.FillPHLists();
    });
  }

  ResetForm() {
    this.submitted = false;
    this.InitializeFormControls();
    this.LogValidationErrors();
  }

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

  SaveAddressDetails() {
    this.submitted = true;

    if (this.AddressForm.invalid) {
      this.LogValidationErrors();
      return;
    }

    const el = this.modalCloseButton.nativeElement as HTMLElement;
    let StatusObj: any;

    this.VendorAddress = new VendorAddress();
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
    this.VendorAddress.VendorCode = this.vendor.VendorCode;
    this.VendorAddress.AddressCode = this.Address.AddressCode === null ? '' : this.Address.AddressCode;
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

    this._vendorService.SaveVendorAddress(this.VendorAddress).subscribe((data) => {
      StatusObj = data;

      if (StatusObj.Status === 0) {
        this.IsAddressSaved.emit(true);
        el.click();
      }
    });
  }
}
