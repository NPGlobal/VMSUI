import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
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
export class AddressFormComponent implements OnInit {

  VendorAddress: VendorAddress;
  AddressForm: FormGroup;
  OnlyDirectVendor = false;

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
  NumberPattern: '^[1-9][0-9]{5}$';
  submitted = false;

  ValidationMessages = {
    'OrgUnitCode': {
      'required': ''
    },
    'PIN': {
      'required': '',
      'pattern': 'Invalid PIN number',
      'minlength': 'Invalid PIN number',
      'maxlength': 'Invalid PIN number'
    },
    'CountryCode': {
      'required': ''
    },
    'StateCode': {
      'required': ''
    },
    'CityCode': {
      'required': ''
    },
    'Address1': {
      'required': ''
    },
    'PrimaryContactName': {
      'required': ''
    },
    'PrimaryContactPhone': {
      'required': ''
    }
  };

  formErrors = {
    'PrimaryContactName': '',
    'PrimaryContactPhone': '',
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
    console.log(this.Address);
    this.InitializeFormControls();

    this.GetCountryList();
    this.GetStateList();

    this.AddressForm.valueChanges.subscribe((data) => {
      this.LogValidationErrors(this.AddressForm);
    });

    this.BindOrgUnitDropDown();
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
      CountryCode: [this.Address.CountryCode, Validators.required],
      CityCode: [this.Address.CityCode, Validators.required],
      StateCode: [this.Address.StateCode, Validators.required],
      PIN: [this.Address.PIN,
      [Validators.required, Validators.pattern(this.NumberPattern), Validators.minLength(6), Validators.maxLength(6)]],
      AddressTypeCode: ['F'],
      PrimaryContactName: ['', Validators.required],
      PrimaryContactPhone: ['', Validators.required],
      PrimaryContactFax: [''],
      PrimaryContactEmail: [''],
      PrimaryContactWebsite: [''],
      SecondaryContactName: [''],
      SecondaryContactPhone: [''],
      SecondaryContactFax: [''],
      SecondaryContactEmail: [''],
      SecondaryContactWebsite: ['']
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
    this.AddressForm.reset();
    this.InitializeFormControls();
    this.LogValidationErrors();
  }

  SaveAddressDetails() {
    this.submitted = true;
    if (this.AddressForm.invalid) {


      console.log(this.AddressForm.value);
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
    // tslint:disable-next-line:no-debugger
    debugger;
    console.log(JSON.stringify(this.VendorAddress));

    console.log(this.vendor);

    this._vendorService.SaveVendorAddress(this.VendorAddress).subscribe((data) => {
      StatusObj = data;
      // tslint:disable-next-line:no-debugger
      debugger;
      if (StatusObj.Status === 0) {
        el.click();
      }
    });
  }
}
