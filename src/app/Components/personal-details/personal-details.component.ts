import { Component, OnInit, ElementRef, ViewChild, Output, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray, AbstractControl, ValidatorFn } from '@angular/forms';
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
  ExpertiseList: MasterDataDetails[];
  expertiseArray: any[] = [];
  VendorCode: string;
  vendorAddresses: VendorAddress[];

  AllPHList: OrgUnit[];
  PHList: OrgUnit[];
  StoreList: OrgUnit[];
  SelectedPHStoreList: OrgUnit[] = [];
  SavedPHStoreList: OrgUnit[] = [];
  ReferenceVendorList: Vendor[] = [];
  vendorExpe_MDDCode: string[] = [];
  AlphanumericPattern = '^[a-zA-Z0-9]*$';
  PhonePattern = '^[0-9]{10}$';
  EmailPattern = '[a-zA-Z0-9!#$%&\'*+\/=?^_`{|}~.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*';
  GSTPattern: string;

  Address: VendorAddress;

  @ViewChild('alertModalButton')
  alertModalButton: ElementRef;
  PopUpMessage: string;
  alertButton: any;

  @ViewChild('addModalOpenButton')
  addModalOpenButton: ElementRef;

  HasAllCollapsed: boolean;
  IsAddressSaved = false;
  HasPHSelected: boolean;

  submitted = false;
  StateCodeLabel: string;

  ValidationMessages = {
    'PANNo': {
      'minlength': '',
      'maxlength': '',
      'pattern': 'Invalid Format'
    },
    'GSTIN': {
      'required': '',
      'minlength': '',
      'maxlength': '',
      'pattern': 'Invalid GST number'
    },
    'GSTDate': {
      'required': ''
    },
    'Address1': {
      'required': ''
    },
    'CountryCode': {
      'required': ''
    },
    'StateCode': {
      'required': ''
    },
    'PIN': {
      'required': '',
      'minlength': '',
      'maxlength': '',
      'pattern': 'Invalid PIN number'
    },
    'PrimaryContactName': {
      'required': ''
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
    'SecondaryContactPhone': {
      'pattern': ''
    },
    'SecondaryContactFax': {
      'pattern': ''
    },
    'SecondaryContactEmail': {
      'pattern': ''
    },
    'NameofInsuranceCompany': {
      'required': ''
    }
  };

  formErrors = {
    'PANNo': '',
    'GSTIN': '',
    'GSTDate': '',
    'Address1': '',
    'CountryCode': '',
    'StateCode': '',
    'PIN': '',
    'PrimaryContactName': '',
    'PrimaryContactPhone': '',
    'PrimaryContactFax': '',
    'PrimaryContactEmail': '',
    'SecondaryContactPhone': '',
    'SecondaryContactFax': '',
    'SecondaryContactEmail': '',
    'NameofInsuranceCompany': ''
  };

  constructor(private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _mDDService: MasterDataDetailsService) {
    this.Address = this.CreateNewAddress();
    this.vendor = new Vendor();
    this.vendor.RegisteredOfficeAddress = new VendorAddress();
    this.HasAllCollapsed = true;
    this.PopUpMessage = '';
  }

  ngOnInit() {
    this.alertButton = this.alertModalButton.nativeElement as HTMLElement;

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
    this.GetMasterDataDetails('VendorExpe');

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
      let lst: MasterDataDetails[];
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
          lst = result.data.Table;
          this.StateList = lst.filter(x => x.IsDeleted === 'N');
          break;
        }
        case 'VendorExpe': {
          this.ExpertiseList = result.data.Table;
          break;
        }
      }
    });
  }

  SetStateCodeLabel() {
    const state = this.StateList === undefined ? new MasterDataDetails() :
      this.StateList.filter(x => x.MDDCode === this.personalDetailsForm.get('RegisteredOfficeAddress.StateCode').value)[0];

    this.StateCodeLabel = (state === undefined ||
      state.MDDShortName === undefined || state.MDDShortName === null) ? '' : state.MDDShortName + '.' + state.MDDName;
  }

  SavePersonalDetails() {
    this.submitted = true;

    if (this.personalDetailsForm.get('PersonalDetails.IsJWVendor').value &&
      (this.SavedPHStoreList.length === 0 &&
        this.SelectedPHStoreList.length === 0)) {
      this.HasPHSelected = false;
      return;
    }

    if (this.personalDetailsForm.invalid) {
      this.LogValidationErrors();
      this.PopUpMessage = 'Please fill required fields.';
      this.alertButton.click();
      return;
    }
    let StatusObj: any;
    const vendor = new Vendor();
    vendor.VendorExpertise = this.makeVendorExpertiseString();
    vendor.VendorCode = this.VendorCode;
    vendor.VendorName = this.personalDetailsForm.get('PersonalDetails.VendorName').value;
    vendor.PANNo = this.personalDetailsForm.get('PersonalDetails.PANNo').value;
    vendor.Ref_VendorCode = this.personalDetailsForm.get('PersonalDetails.Ref_VendorCode').value;
    vendor.isInsured = this.personalDetailsForm.get('PersonalDetails.IsInsured').value;
    vendor.NameofInsuranceCompany = this.personalDetailsForm.get('PersonalDetails.NameofInsuranceCompany').value;
    vendor.IsDirectVendor = this.personalDetailsForm.get('PersonalDetails.IsDirectVendor').value;
    vendor.AssociatedSinceYear = this.personalDetailsForm.get('OtherRegDetails.AssociatedSinceYear').value;
    vendor.VendorType_MDDCode = this.personalDetailsForm.get('OtherRegDetails.VendorType_MDDCode').value;
    vendor.PersonTopRanker1 = this.personalDetailsForm.get('OtherRegDetails.PersonTopRanker1').value;
    vendor.PersonTopRanker2 = this.personalDetailsForm.get('OtherRegDetails.PersonTopRanker2').value;
    vendor.OtherCustomer1 = this.personalDetailsForm.get('CustomerDetails.OtherCustomer1').value;
    vendor.OtherCustomer2 = this.personalDetailsForm.get('CustomerDetails.OtherCustomer2').value;
    vendor.OtherCustomer3 = this.personalDetailsForm.get('CustomerDetails.OtherCustomer3').value;
    vendor.OtherCustomer4 = this.personalDetailsForm.get('CustomerDetails.OtherCustomer4').value;
    vendor.OtherCustomer5 = this.personalDetailsForm.get('CustomerDetails.OtherCustomer5').value;
    vendor.SelectedPHListCSV = this.personalDetailsForm.get('PersonalDetails.IsJWVendor').value ?
      this.SelectedPHStoreList.map(function (element) {
        return element.OrgUnitCode;
      }).join() : '';

    vendor.isGSTRegistered = this.personalDetailsForm.get('RegisteredOfficeAddress.IsGSTRegistered').value;
    vendor.GSTIN = this.personalDetailsForm.get('RegisteredOfficeAddress.GSTIN').value;
    vendor.isRCM = this.personalDetailsForm.get('RegisteredOfficeAddress.IsRCM').value;
    vendor.isProvisional = this.personalDetailsForm.get('RegisteredOfficeAddress.IsProvisional').value;
    vendor.GSTDate = this.personalDetailsForm.get('RegisteredOfficeAddress.GSTDate').value;
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
      if (StatusObj.data.Table[0].ResultCode === 0) {
        this.PopUpMessage = StatusObj.data.Table[0].ResultMessage;
        this.alertButton.click();
        this.IsAddressSaved = true;
        this.Editvendor(this.VendorCode);
      } else {
        this.PopUpMessage = StatusObj.data.Table[0].ResultMessage;
        this.alertButton.click();
      }
    });
  }
  dismissMsg() {
    // if (this.PopUpMessage === 'Saved Succesfully!!') {
    //   const absUrl = window.location.href;
    //   window.location.href = absUrl;
    // }
  }
  Editvendor(Code: string) {
    this._vendorService.GetVendorByCode(Code).subscribe((result) => {
      this.vendor = result.data.Vendor[0];
      this.vendor.RegisteredOfficeAddress =
        ((result.data.RegisteredOfficeAddress[0] === undefined) ? new VendorAddress() : result.data.RegisteredOfficeAddress[0]);
      this.vendorAddresses = result.data.FactoryAddress;

      this.vendorExpe_MDDCode = this.vendor.VendorExpe_MDDCode === null ? null : this.vendor.VendorExpe_MDDCode.split(',');

      this.GetPHList();

      this.InitializeFormControls();

      this.SetStateCodeLabel();

      this.IsAddressSaved = false;
    });
  }

  OpenAddressModal(vendorAddress: VendorAddress) {
    this.Address = vendorAddress;
    const el = this.addModalOpenButton.nativeElement as HTMLElement;
    el.click();
  }

  FillPHLists() {
    this.PHList = [];
    this.StoreList = [];
    this.SavedPHStoreList = [];
    this.SelectedPHStoreList = [];
    if (this.vendor && this.vendor.SelectedPHListCSV) {
      const selectedOrgCodeArr = this.vendor.SelectedPHListCSV.split(',');
      for (let i = 0; i < this.AllPHList.length; ++i) {
        if (selectedOrgCodeArr.includes(this.AllPHList[i].OrgUnitCode)) {
          this.SavedPHStoreList.push(this.AllPHList[i]);
        } else {
          if (this.AllPHList[i].OrgUnitTypeCode === 'S') {
            this.StoreList.push(this.AllPHList[i]);
          } else {
            this.PHList.push(this.AllPHList[i]);
          }
        }
      }
    }

    this.HasPHSelected = (this.SavedPHStoreList.length > 0) ||
      (this.SelectedPHStoreList.length > 0);
  }

  InitializeFormControls() {
    this.PopulateYears();
    const disablePan = this.vendor.PANNo === '' ? false : true;
    const disableRef = this.vendor.Ref_VendorCode === '-1' ? false : true;
    const isGSTControlsDisabled = this.vendor.isGSTRegistered ? true : false;
    const isDPDisabled = this.vendor.IsDirectVendor ? true : false;
    const isJWDisabled = this.vendor.IsJWVendor ? true : false;

    this.personalDetailsForm = this._fb.group({
      PersonalDetails: this._fb.group({
        VendorCode: [{ value: this.vendor.VendorCode, disabled: true }],
        VendorName: [this.vendor.VendorName],
        MasterVendorId: [{ value: this.vendor.MasterVendorId, disabled: true }],
        PANNo: [this.vendor.PANNo, [
          Validators.pattern('[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}'), Validators.maxLength(10), Validators.minLength(10)]],
        PHList: [[]],
        StoreList: [[]],
        SelectedPHStoreList: [[]],
        Ref_VendorCode: [this.vendor.Ref_VendorCode],
        IsExpanded: true,
        IsJWVendor: [this.vendor.IsJWVendor],
        IsDirectVendor: [this.vendor.IsDirectVendor],
        NameofInsuranceCompany: [this.vendor.NameofInsuranceCompany],
        IsInsured: [this.vendor.isInsured]
      }),
      RegisteredOfficeAddress: this._fb.group({
        IsGSTRegistered: [this.vendor.isGSTRegistered, [Validators.required]],
        IsRCM: [{ value: this.vendor.isRCM, disabled: true }],
        GSTIN: [this.vendor.GSTIN],
        GSTDate: [this.FormatDate(this.vendor.GSTDate)],
        IsProvisional: [this.vendor.isProvisional],
        Address1: [this.vendor.RegisteredOfficeAddress.Address1, [Validators.required]],
        Address2: [this.vendor.RegisteredOfficeAddress.Address2],
        Address3: [this.vendor.RegisteredOfficeAddress.Address3],
        CountryCode: [this.vendor.RegisteredOfficeAddress.CountryCode, [Validators.required]],
        CityCode: [this.vendor.RegisteredOfficeAddress.CityCode],
        StateCode: [this.vendor.RegisteredOfficeAddress.StateCode, [Validators.required]],
        PIN: [this.vendor.RegisteredOfficeAddress.PIN,
        [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(6), Validators.maxLength(6)]],
        AddressTypeCode: [this.vendor.RegisteredOfficeAddress.AddressTypeCode],
        PrimaryContactName: [this.vendor.RegisteredOfficeAddress.PrimaryContactName, [Validators.required]],
        PrimaryContactPhone: [this.vendor.RegisteredOfficeAddress.PrimaryContactPhone,
        [Validators.required, Validators.pattern(this.PhonePattern)]],
        PrimaryContactFax: [this.vendor.RegisteredOfficeAddress.PrimaryContactFax, [Validators.pattern(this.PhonePattern)]],
        PrimaryContactEmail: [this.vendor.RegisteredOfficeAddress.PrimaryContactEmail, [Validators.pattern(this.EmailPattern)]],
        PrimaryContactWebsite: [this.vendor.RegisteredOfficeAddress.PrimaryContactWebsite],
        SecondaryContactName: [this.vendor.RegisteredOfficeAddress.SecondaryContactName],
        SecondaryContactPhone: [this.vendor.RegisteredOfficeAddress.SecondaryContactPhone, [Validators.pattern(this.PhonePattern)]],
        SecondaryContactFax: [this.vendor.RegisteredOfficeAddress.SecondaryContactFax, [Validators.pattern(this.PhonePattern)]],
        SecondaryContactEmail: [this.vendor.RegisteredOfficeAddress.SecondaryContactEmail, [Validators.pattern(this.EmailPattern)]],
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
      }),
      ExpertiseDetails: this._fb.group({
        IsExpanded: false,
        ExpertiseList: new FormArray([]),
        VendorWeaknesses: [this.vendor.Vendor_Weakness]
      })
    });

    this.updateExpertise();


    this.personalDetailsForm.updateValueAndValidity();

    this.DisableControls(disablePan, isGSTControlsDisabled, disableRef, isDPDisabled, isJWDisabled);

    if (!isGSTControlsDisabled) {
      this.SetValidationForGSTControls();
    }

    this.personalDetailsForm.valueChanges.subscribe((data) => {
      this.LogValidationErrors(this.personalDetailsForm);
    });
  }

  DisableControls(disablePan: boolean,
    isGSTControlsDisabled: boolean,
    disableRef: boolean,
    isDPDisabled: boolean,
    isJWDisabled: boolean) {
    if (disablePan) {
      this.personalDetailsForm.get('PersonalDetails.PANNo').disable();
    } else {
      this.personalDetailsForm.get('PersonalDetails.PANNo').enable();
    }

    if (disableRef) {
      this.personalDetailsForm.get('PersonalDetails.Ref_VendorCode').disable();
    } else {
      this.personalDetailsForm.get('PersonalDetails.Ref_VendorCode').enable();
    }

    if (isDPDisabled) {
      this.personalDetailsForm.get('PersonalDetails.IsDirectVendor').disable();
    } else {
      this.personalDetailsForm.get('PersonalDetails.IsDirectVendor').enable();
    }

    if (isJWDisabled) {
      this.personalDetailsForm.get('PersonalDetails.IsJWVendor').disable();
    } else {
      this.personalDetailsForm.get('PersonalDetails.IsJWVendor').enable();
    }

    if (isGSTControlsDisabled) {
      this.personalDetailsForm.get('RegisteredOfficeAddress.IsGSTRegistered').disable();
      this.personalDetailsForm.get('RegisteredOfficeAddress.GSTIN').disable();
      this.personalDetailsForm.get('RegisteredOfficeAddress.GSTDate').disable();
    } else {
      this.personalDetailsForm.get('RegisteredOfficeAddress.IsGSTRegistered').enable();
      this.personalDetailsForm.get('RegisteredOfficeAddress.GSTIN').enable();
      this.personalDetailsForm.get('RegisteredOfficeAddress.GSTDate').enable();
    }
  }

  FormatDate(date: Date) {
    const d = new Date(date),
      year = d.getFullYear();
    let month = '' + (d.getMonth() + 1),
      day = '' + d.getDate();

    if (month.length < 2) {
      month = '0' + month;

    }
    if (day.length < 2) {
      day = '0' + day;
    }

    return [year, month, day].join('-');
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

    this.HasPHSelected = (this.SavedPHStoreList.length > 0) ||
      (this.SelectedPHStoreList.length > 0);

    this.personalDetailsForm.get('PersonalDetails.PHList').patchValue([]);
    this.personalDetailsForm.get('PersonalDetails.StoreList').patchValue([]);
    this.personalDetailsForm.get('PersonalDetails.SelectedPHStoreList').patchValue([]);
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

    this.HasPHSelected = (this.SavedPHStoreList.length > 0) ||
      (this.SelectedPHStoreList.length > 0);

    this.personalDetailsForm.get('PersonalDetails.PHList').patchValue([]);
    this.personalDetailsForm.get('PersonalDetails.StoreList').patchValue([]);
    this.personalDetailsForm.get('PersonalDetails.SelectedPHStoreList').patchValue([]);
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
    if ((this.personalDetailsForm.get('PersonalDetails.PHList').value === '' ||
      this.personalDetailsForm.get('PersonalDetails.PHList').value.length === 0) &&
      (this.personalDetailsForm.get('PersonalDetails.StoreList').value === '' ||
        this.personalDetailsForm.get('PersonalDetails.StoreList').value.length === 0)) {
      return true;
    } else {
      return false;
    }
  }

  NoSelectedPHOrStore() {
    if (this.personalDetailsForm.get('PersonalDetails.SelectedPHStoreList').value === '' ||
      this.personalDetailsForm.get('PersonalDetails.SelectedPHStoreList').value.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  ToggleAllContainers() {
    this.HasAllCollapsed = !this.HasAllCollapsed;
    this.personalDetailsForm.get('PersonalDetails.IsExpanded').patchValue(!this.HasAllCollapsed);
    this.personalDetailsForm.get('Address.IsExpanded').patchValue(!this.HasAllCollapsed);
    this.personalDetailsForm.get('OtherRegDetails.IsExpanded').patchValue(!this.HasAllCollapsed);
    this.personalDetailsForm.get('CustomerDetails.IsExpanded').patchValue(!this.HasAllCollapsed);
    this.personalDetailsForm.get('RegisteredOfficeAddress.IsExpanded').patchValue(!this.HasAllCollapsed);
    this.personalDetailsForm.get('ExpertiseDetails.IsExpanded').patchValue(!this.HasAllCollapsed);
  }

  OnAddressSaved(IsSaved: boolean) {
    this.IsAddressSaved = IsSaved;
    if (this.IsAddressSaved) {
      this.Editvendor(this.VendorCode);
    }
  }

  LogValidationErrors(group: FormGroup = this.personalDetailsForm): void {
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

  SetPHListValidation($event) {
    this.personalDetailsForm.get('PersonalDetails.StoreList').patchValue('');
    this.personalDetailsForm.get('PersonalDetails.PHList').patchValue('');
    this.personalDetailsForm.get('PersonalDetails.SelectedPHStoreList').patchValue('');
  }

  SetValidationForGSTControls() {
    if (!this.vendor.isGSTRegistered) {
      if (this.personalDetailsForm.get('RegisteredOfficeAddress.IsGSTRegistered').value) {
        this.personalDetailsForm.get('RegisteredOfficeAddress.GSTIN').setValidators(
          [Validators.required, this.GSTINValidator(),
          Validators.maxLength(15), Validators.minLength(15)]);
        this.personalDetailsForm.get('RegisteredOfficeAddress.GSTIN').enable();

        this.personalDetailsForm.get('RegisteredOfficeAddress.GSTDate').setValidators([Validators.required]);
        this.personalDetailsForm.get('RegisteredOfficeAddress.GSTDate').enable();

        this.personalDetailsForm.get('RegisteredOfficeAddress.IsRCM').patchValue(false);
      } else {
        this.personalDetailsForm.get('RegisteredOfficeAddress.GSTIN').setValidators([]);
        this.personalDetailsForm.get('RegisteredOfficeAddress.GSTIN').disable();
        this.personalDetailsForm.get('RegisteredOfficeAddress.GSTIN').patchValue(null);

        this.personalDetailsForm.get('RegisteredOfficeAddress.GSTDate').setValidators([]);
        this.personalDetailsForm.get('RegisteredOfficeAddress.GSTDate').disable();
        this.personalDetailsForm.get('RegisteredOfficeAddress.GSTDate').patchValue(null);

        this.personalDetailsForm.get('RegisteredOfficeAddress.IsRCM').patchValue(true);
      }
    }
  }

  UnselectOptions(control: FormControl) {
    control.patchValue([]);
  }


  GSTINValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const status = this.CheckGSTFormat(control.value);
      if (!status) {
        return { 'pattern': status };
      }
      return null;
    };
  }

  CheckGSTFormat(g: string): boolean {
    let status = false;
    const reg = new RegExp('^([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$');
    if (g !== null && g.length >= 2) {
      const firstTwo = g.substr(0, 2);
      status = this.StateList.find(x => x.MDDShortName === firstTwo) !== undefined;
    }

    if (status && g !== null && g.length > 2) {
      const lastcharacters = g.substr(2, g.length);
      status = reg.test(lastcharacters);
    } else {
      status = false;
    }

    return status;
  }

  onChange(expertise: string, isChecked: boolean) {
    if (isChecked) {
      this.expertiseArray.push(expertise);
    } else {
      const index = this.expertiseArray.indexOf(expertise);

      if (index > -1) {

        this.expertiseArray.splice(index, 1);
      }
    }
  }

  makeVendorExpertiseString(): string {
    let ex = '';
    if (this.expertiseArray !== null) {
      for (let i = 0; i < this.expertiseArray.length; i++) {
        ex += this.expertiseArray[i] + ',';
      }
      return ex + '~' + this.personalDetailsForm.get('ExpertiseDetails.VendorWeaknesses').value;
    } else {
      return null;
    }
  }

  updateExpertise() {
    if (this.expertiseArray !== null && this.vendorExpe_MDDCode !== null) {
      for (let i = 0; i < this.vendorExpe_MDDCode.length; i++) {
        for (let j = 0; j < this.ExpertiseList.length; j++) {
          if (this.vendorExpe_MDDCode[i] === this.ExpertiseList[j].MDDCode) {
            this.ExpertiseList[j].Checked = true;
          }
        }
      }
    }
  }

  IfInsured(isInsured: boolean) {
    if (isInsured) {
      this.personalDetailsForm.get('PersonalDetails.NameofInsuranceCompany').setValidators(Validators.required);
      this.personalDetailsForm.get('PersonalDetails.NameofInsuranceCompany').enable();
    } else {
      this.personalDetailsForm.get('PersonalDetails.NameofInsuranceCompany').setValidators([]);
      this.personalDetailsForm.get('PersonalDetails.NameofInsuranceCompany').enable();
    }
  }
}
