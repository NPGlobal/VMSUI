import { Component, OnInit, ElementRef, ViewChild, Output, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Vendor } from 'src/app/Models/vendor';
import { VendorService } from 'src/app/Services/vendor.service';
import { OrgUnit } from 'src/app/Models/OrgUnit';
import { MasterDataDetailsService } from 'src/app/Services/master-data-details.service';
import { MasterDataDetails } from 'src/app/Models/master-data-details';
import { VendorAddress } from 'src/app/Models/vendor-address';

@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.css']
})
export class PersonalDetailsComponent implements OnInit {

  CountryList: MasterDataDetails[];
  StateList: MasterDataDetails[];
  vendor: Vendor;
  personalDetailsForm: FormGroup;
  YearList: number[] = [];
  MasterVendorList: Vendor[] = [];
  VendorTypeList: MasterDataDetails[];
  VendorCode: string;
  vendorAddresses: VendorAddress[];

  AllPHList: OrgUnit[];
  PHList: OrgUnit[];
  StoreList: OrgUnit[];
  SelectedPHStoreList: OrgUnit[] = [];
  ReferenceVendorList: Vendor[] = [];

  Address: VendorAddress;

  @ViewChild('modalOpenButton')
  modalOpenButton: ElementRef;

  HasAllCollapsed: boolean;
  IsAddressSaved = false;

  submitted = false;
  ValidationMessages = {
    'PANNo': {
      'required': '',
      'minlength': 'Invalid PAN number',
      'maxlength': 'Invalid PAN number',
      'pattern': 'Cannot contains special characters'
    }
  };

  formErrors = {
    'PANNo': ''
  };

  constructor(private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _mDDService: MasterDataDetailsService) {
    this.Address = this.CreateNewAddress();
    this.vendor = new Vendor();
    this.vendor.RegisteredOfficeAddress = new VendorAddress();
    this.HasAllCollapsed = true;
  }

  ngOnInit() {

    this._route.parent.paramMap.subscribe((data) => {
      this.VendorCode = (data.get('code'));
      if (this.VendorCode === null) {
        this.InitializeFormControls();
        this.GetPHList();
      } else {
        this.Editvendor(this.VendorCode);
      }
    });

    this._vendorService.GetVendors(-1, -1, '').subscribe((result) => {
      this.ReferenceVendorList = result.data.Vendors;
    });

    this._vendorService.GetMasterVendorList().subscribe(result => {
      this.MasterVendorList = result.data.MasterVendors;
    });

    this.GetMasterDataDetails('VendorType');
    this.GetMasterDataDetails('COUNTRY');
    this.GetMasterDataDetails('STATE');
  }

  CreateNewAddress(): any {
    const address = Object.assign({}, {
      AddressCode: null,
      AddressTypeCode: 'F',
      CountryCode: null,
      StateCode: null,
      PIN: null
    });
    return address;
  }

  PopulateYears() {
    for (let i = (new Date()).getFullYear(); i >= ((new Date()).getFullYear() - 20); i--) {
      this.YearList.push(i);
    }
  }

  GetPHList() {
    this._vendorService.GetPHList().subscribe((result) => {
      this.AllPHList = result.data.Table;
      this.FillPHLists();
    });
  }

  GetMasterDataDetails(MDHCode: string) {
    this._mDDService.GetMasterDataDetails(MDHCode, '-1').subscribe((result) => {
      switch (MDHCode) {
        case 'VendorType': {
          this.VendorTypeList = result.data.Table;
          break;
        }
        case 'COUNTRY': {
          this.CountryList = result.data.Table.filter(x => x.MDDName === 'India');
          break;
        }
        case 'STATE': {
          this.StateList = result.data.Table;
          break;
        }
      }
    });
  }

  SavePersonalDetails() {
    this.submitted = true;
    if (this.personalDetailsForm.invalid) {
      this.logValidationErrors();
      return;
    }

    let StatusObj: any;
    const vendor = new Vendor();
    vendor.VendorCode = this.VendorCode;
    vendor.VendorName = this.personalDetailsForm.get('PersonalDetails.VendorName').value;
    vendor.PANNo = this.personalDetailsForm.get('PersonalDetails.PANNo').value;
    vendor.Ref_VendorCode = this.personalDetailsForm.get('PersonalDetails.Ref_VendorCode').value;
    vendor.AssociatedSinceYear = this.personalDetailsForm.get('OtherRegDetails.AssociatedSinceYear').value;
    vendor.VendorType_MDDCode = this.personalDetailsForm.get('OtherRegDetails.VendorType_MDDCode').value;
    vendor.PersonTopRanker1 = this.personalDetailsForm.get('OtherRegDetails.PersonTopRanker1').value;
    vendor.PersonTopRanker2 = this.personalDetailsForm.get('OtherRegDetails.PersonTopRanker2').value;
    vendor.OtherCustomer1 = this.personalDetailsForm.get('CustomerDetails.OtherCustomer1').value;
    vendor.OtherCustomer2 = this.personalDetailsForm.get('CustomerDetails.OtherCustomer2').value;
    vendor.OtherCustomer3 = this.personalDetailsForm.get('CustomerDetails.OtherCustomer3').value;
    vendor.OtherCustomer4 = this.personalDetailsForm.get('CustomerDetails.OtherCustomer4').value;
    vendor.OtherCustomer5 = this.personalDetailsForm.get('CustomerDetails.OtherCustomer5').value;
    vendor.SelectedPHListCSV = this.SelectedPHStoreList.map(function (element) {
      return element.OrgUnitCode;
    }).join();

    vendor.RegisteredOfficeAddress = new VendorAddress();
    vendor.RegisteredOfficeAddress.CompanyCode = '10';
    vendor.RegisteredOfficeAddress.PIN = this.personalDetailsForm.get('RegisteredOfficeAddress.PIN').value;
    vendor.RegisteredOfficeAddress.Address1 = this.personalDetailsForm.get('RegisteredOfficeAddress.Address1').value;
    vendor.RegisteredOfficeAddress.Address2 = this.personalDetailsForm.get('RegisteredOfficeAddress.Address2').value === null
      ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.Address2').value;
    vendor.RegisteredOfficeAddress.Address3 = this.personalDetailsForm.get('RegisteredOfficeAddress.Address3').value === null
      ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.Address3').value;
    vendor.RegisteredOfficeAddress.StateCode = this.personalDetailsForm.get('RegisteredOfficeAddress.StateCode').value;
    vendor.RegisteredOfficeAddress.CityCode = this.personalDetailsForm.get('RegisteredOfficeAddress.CityCode').value;
    vendor.RegisteredOfficeAddress.CountryCode = this.personalDetailsForm.get('RegisteredOfficeAddress.CountryCode').value;
    vendor.RegisteredOfficeAddress.AddressTypeCode = 'O';
    vendor.RegisteredOfficeAddress.AddressReference = 'V';
    vendor.RegisteredOfficeAddress.VendorCode = vendor.VendorCode;
    vendor.RegisteredOfficeAddress.AddressCode = this.Address.AddressCode === null ? '' : this.Address.AddressCode;

    vendor.RegisteredOfficeAddress.PrimaryContactName =
      this.personalDetailsForm.get('RegisteredOfficeAddress.PrimaryContactName').value == null
        ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.PrimaryContactName').value;

    vendor.RegisteredOfficeAddress.PrimaryContactPhone =
      this.personalDetailsForm.get('RegisteredOfficeAddress.PrimaryContactPhone').value === null
        ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.PrimaryContactPhone').value;

    vendor.RegisteredOfficeAddress.PrimaryContactFax =
      this.personalDetailsForm.get('RegisteredOfficeAddress.PrimaryContactFax').value === null
        ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.PrimaryContactFax').value;

    vendor.RegisteredOfficeAddress.PrimaryContactEmail =
      this.personalDetailsForm.get('RegisteredOfficeAddress.PrimaryContactEmail').value === null
        ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.PrimaryContactEmail').value;

    vendor.RegisteredOfficeAddress.PrimaryContactWebsite =
      this.personalDetailsForm.get('RegisteredOfficeAddress.PrimaryContactWebsite').value === null
        ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.PrimaryContactWebsite').value;

    vendor.RegisteredOfficeAddress.SecondaryContactName =
      this.personalDetailsForm.get('RegisteredOfficeAddress.SecondaryContactName').value === null
        ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.SecondaryContactName').value;

    vendor.RegisteredOfficeAddress.SecondaryContactPhone =
      this.personalDetailsForm.get('RegisteredOfficeAddress.SecondaryContactPhone').value === null
        ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.SecondaryContactPhone').value;

    vendor.RegisteredOfficeAddress.SecondaryContactFax =
      this.personalDetailsForm.get('RegisteredOfficeAddress.SecondaryContactFax').value === null
        ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.SecondaryContactFax').value;

    vendor.RegisteredOfficeAddress.SecondaryContactEmail =
      this.personalDetailsForm.get('RegisteredOfficeAddress.SecondaryContactEmail').value === null
        ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.SecondaryContactEmail').value;

    vendor.RegisteredOfficeAddress.SecondaryContactWebsite =
      this.personalDetailsForm.get('RegisteredOfficeAddress.SecondaryContactWebsite').value === null
        ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.SecondaryContactWebsite').value;

    vendor.RegisteredOfficeAddress.IsSameForAll = this.personalDetailsForm.get('RegisteredOfficeAddress.IsSameForAll').value;

    this._vendorService.SaveVendorPersonalDetails(vendor).subscribe((data) => {
      StatusObj = data;
      if (StatusObj.Status === 0) {
        alert('Saved Succesfully!!');
        this.IsAddressSaved = true;
        this.Editvendor(this.VendorCode);
      }
    });
  }

  Editvendor(Code: string) {
    this._vendorService.GetVendorByCode(Code).subscribe((result) => {
      if (!this.IsAddressSaved) {
        this.vendor = result.data.Vendor[0];
      }

      this.vendor.RegisteredOfficeAddress =
        ((result.data.RegisteredOfficeAddress[0] === undefined) ? new VendorAddress() : result.data.RegisteredOfficeAddress[0]);
      this.vendorAddresses = result.data.FactoryAddress;

      if (!this.IsAddressSaved) {
        this.GetPHList();

        this.InitializeFormControls();
      }

      this.IsAddressSaved = false;
    });
  }

  OpenAddressModal(vendorAddress: VendorAddress) {
    this.Address = vendorAddress;
    const el = this.modalOpenButton.nativeElement as HTMLElement;
    el.click();
  }

  FillPHLists() {
    this.PHList = [];
    this.StoreList = [];
    if (this.vendor && this.vendor.SelectedPHListCSV) {
      const selectedOrgCodeArr = this.vendor.SelectedPHListCSV.split(',');
      for (let i = 0; i < this.AllPHList.length; ++i) {
        if (selectedOrgCodeArr.includes(this.AllPHList[i].OrgUnitCode)) {
          this.SelectedPHStoreList.push(this.AllPHList[i]);
        } else {
          if (this.AllPHList[i].OrgUnitTypeCode === 'S') {
            this.StoreList.push(this.AllPHList[i]);
          } else {
            this.PHList.push(this.AllPHList[i]);
          }
        }
      }
    }
  }

  InitializeFormControls() {

    this.PopulateYears();

    this.personalDetailsForm = this._fb.group({
      PersonalDetails: this._fb.group({
        VendorCode: [{ value: this.vendor.VendorCode, disabled: true }],
        VendorName: [this.vendor.VendorName],
        MasterVendorId: [{ value: this.vendor.MasterVendorId, disabled: true }],
        PANNo: [this.vendor.PANNo, [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
        GSTIN: [{ value: this.vendor.GSTIN, disabled: true }],
        PHList: new FormControl(''),
        StoreList: [''],
        SelectedPHStoreList: [''],
        Ref_VendorCode: [{ value: this.vendor.Ref_VendorCode, disabled: true }],
        IsExpanded: true,
        IsJWVendor: [this.vendor.IsJWVendor],
        IsDirectVendor: [this.vendor.IsDirectVendor]
      }),
      RegisteredOfficeAddress: this._fb.group({
        Address1: [this.vendor.RegisteredOfficeAddress.Address1],
        Address2: [this.vendor.RegisteredOfficeAddress.Address2],
        Address3: [this.vendor.RegisteredOfficeAddress.Address3],
        CountryCode: [this.vendor.RegisteredOfficeAddress.CountryCode],
        CityCode: [this.vendor.RegisteredOfficeAddress.CityCode],
        StateCode: [this.vendor.RegisteredOfficeAddress.StateCode],
        PIN: [this.vendor.RegisteredOfficeAddress.PIN],
        AddressTypeCode: [this.vendor.RegisteredOfficeAddress.AddressTypeCode],
        PrimaryContactName: [this.vendor.RegisteredOfficeAddress.PrimaryContactName],
        PrimaryContactPhone: [this.vendor.RegisteredOfficeAddress.PrimaryContactPhone],
        PrimaryContactFax: [this.vendor.RegisteredOfficeAddress.PrimaryContactFax],
        PrimaryContactEmail: [this.vendor.RegisteredOfficeAddress.PrimaryContactEmail],
        PrimaryContactWebsite: [this.vendor.RegisteredOfficeAddress.PrimaryContactWebsite],
        SecondaryContactName: [this.vendor.RegisteredOfficeAddress.SecondaryContactName],
        SecondaryContactPhone: [this.vendor.RegisteredOfficeAddress.SecondaryContactPhone],
        SecondaryContactFax: [this.vendor.RegisteredOfficeAddress.SecondaryContactFax],
        SecondaryContactEmail: [this.vendor.RegisteredOfficeAddress.SecondaryContactEmail],
        SecondaryContactWebsite: [this.vendor.RegisteredOfficeAddress.SecondaryContactWebsite],
        IsSameForAll: [false],
        IsExpanded: false
      }),
      Address: this._fb.group({
        IsExpanded: false
      }),
      OtherRegDetails: this._fb.group({
        AssociatedSinceYear: [this.vendor.AssociatedSinceYear],
        VendorType_MDDCode: [this.vendor.VendorType_MDDCode],
        PersonTopRanker1: [this.vendor.PersonTopRanker1],
        PersonTopRanker2: [this.vendor.PersonTopRanker2],
        IsExpanded: false
      }),
      CustomerDetails: this._fb.group({
        OtherCustomer1: [this.vendor.OtherCustomer1],
        OtherCustomer2: [this.vendor.OtherCustomer2],
        OtherCustomer3: [this.vendor.OtherCustomer3],
        OtherCustomer4: [this.vendor.OtherCustomer4],
        OtherCustomer5: [this.vendor.OtherCustomer5],
        IsExpanded: false
      })
    });


    this.personalDetailsForm.valueChanges.subscribe((data) => {
      this.logValidationErrors(this.personalDetailsForm);
    });
  }

  ToggleContainer(formGroup: FormGroup) {
    formGroup.controls.IsExpanded.patchValue(!formGroup.controls.IsExpanded.value);
  }

  MoveToSelectedPHList(event: any) {

    const phValues = this.personalDetailsForm.get('PersonalDetails.PHList').value as Array<string>;
    const storeValues = this.personalDetailsForm.get('PersonalDetails.StoreList').value as Array<string>;

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

  }

  MoveToPHList(event: any) {
    const values = this.personalDetailsForm.get('PersonalDetails.SelectedPHStoreList').value as Array<string>;

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

    this.DeleteFromArray(values, 'SelectedPHStoreList');

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

  ToggleAllContainers() {
    this.HasAllCollapsed = !this.HasAllCollapsed;
    this.personalDetailsForm.get('PersonalDetails.IsExpanded').patchValue(!this.HasAllCollapsed);
    this.personalDetailsForm.get('Address.IsExpanded').patchValue(!this.HasAllCollapsed);
    this.personalDetailsForm.get('OtherRegDetails.IsExpanded').patchValue(!this.HasAllCollapsed);
    this.personalDetailsForm.get('CustomerDetails.IsExpanded').patchValue(!this.HasAllCollapsed);
    this.personalDetailsForm.get('RegisteredOfficeAddress.IsExpanded').patchValue(!this.HasAllCollapsed);
  }

  OnAddressSaved(IsSaved: boolean) {
    this.IsAddressSaved = IsSaved;
    if (this.IsAddressSaved) {
      this.Editvendor(this.VendorCode);
    }
  }

  logValidationErrors(group: FormGroup = this.personalDetailsForm): void {
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
}
