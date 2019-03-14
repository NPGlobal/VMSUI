import { Component, OnInit, ElementRef, ViewChild, Output, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray, AbstractControl, ValidatorFn } from '@angular/forms';
import { Vendor } from 'src/app/Models/vendor';
import { VendorService } from 'src/app/Services/vendor.service';
import { OrgUnit } from 'src/app/Models/OrgUnit';
import { MasterDataDetailsService } from 'src/app/Services/master-data-details.service';
import { MasterDataDetails } from 'src/app/Models/master-data-details';
import { VendorAddress } from 'src/app/Models/vendor-address';
import { DatePipe } from '@angular/common';
import {ValidationMessagesService } from 'src/app/Services/validation-messages.service';

@Component({
  providers: [DatePipe],
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.css']
})
export class PersonalDetailsComponent implements OnInit {

  //#region Form Variables
  Today = new Date();
  Address: VendorAddress;
  // vendorAddresses: VendorAddress[];

  maxDate = this.datepipe.transform(this.Today, 'yyyy-MM-dd');
  minDate = '2017-04-01';
  AssociatedWithDate = '1980-01-01';
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
  StateCodeLabel: string;

  AllPHList: OrgUnit[];
  PHList: OrgUnit[];
  StoreList: OrgUnit[];
  SelectedPHStoreList: OrgUnit[] = [];
  SavedPHStoreList: OrgUnit[] = [];
  ReferenceVendorList: Vendor[] = [];
  vendorExpe_MDDCode: string[] = [];
  //#endregion

  //#region Patterns
  AddressAndRemarksPattern = /^[+,?-@\.\-#'&%\/\w\s]*$/;
  AlphanumericPattern = '^[a-zA-Z0-9]*$';
  PhonePattern = '^[0-9]{10}$';
  EmailPattern = '[a-zA-Z0-9!#$%&\'*+\/=?^_`{|}~.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*';
  WebsitePattern = '^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+\/?)*$';
  // AlphabetPattern = '^[a-zA-Z ]*$';
  AlphabetPattern = '^[a-zA-Z ]*[\.\]?[a-zA-Z ]*$';
  GSTPattern: string;
  //#endregion

  //#region Modal Popup and Alert
  @ViewChild('alertModalButton')
  alertModalButton: ElementRef;
  PopUpMessage: string;
  alertButton: any;

  @ViewChild('addModalOpenButton')
  addModalOpenButton: ElementRef;
  //#endregion

  //#region Form Validationg Variables
  HasAllCollapsed: boolean;
  // IsAddressSaved = false;
  HasPHSelected: boolean;
  submitted = false;
  //#endregion

  //#region  Validation Messages
  ValidationMessages = {
    'VendorName': {
      'required': ''
    },
    'PANNo': {
      'minlength': '',
      'maxlength': '',
      'pattern': this._validationMess.PanPattern
    },
    'GSTIN': {
      'required': '',
      'minlength': '',
      'maxlength': '',
      'pattern': this._validationMess.GSTPattern
    },
    'GSTDate': {
      'required': ''
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
    'PIN': {
      'required': '',
      'minlength': '',
      'maxlength': '',
      'pattern': this._validationMess.PinPattern
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
    'NameofInsuranceCompany': {
      'required': ''
    }
  };

  formErrors = {
    'VendorName': '',
    'PANNo': '',
    'GSTIN': '',
    'GSTDate': '',
    'Address1': '',
    'Address2': '',
    'Address3': '',
    'CountryCode': '',
    'StateCode': '',
    'CityCode': '',
    'PIN': '',
    'PrimaryContactName': '',
    'PrimaryContactPhone': '',
    'PrimaryContactFax': '',
    'PrimaryContactEmail': '',
    'SecondaryContactPhone': '',
    'SecondaryContactFax': '',
    'SecondaryContactEmail': '',
    'NameofInsuranceCompany': '',
    'PrimaryContactWebsite': '',
    'SecondaryContactWebsite': ''
  };
  //#endregion

  constructor(private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    public datepipe: DatePipe,
    private _mDDService: MasterDataDetailsService,
    private _validationMess: ValidationMessagesService) {
    this.Address = this.CreateNewAddress();
    this.vendor = new Vendor();
    this.vendor.RegisteredOfficeAddress = new VendorAddress();
    this.HasAllCollapsed = true;
    this.PopUpMessage = '';
  }

  ngOnInit() {
    this.alertButton = this.alertModalButton.nativeElement as HTMLElement;
    this.GetMasterDataDetails('VendorType');
    this.GetMasterDataDetails('COUNTRY');
    this.GetMasterDataDetails('STATE');
    // this.GetMasterDataDetails('VendorExpe');

    this._route.parent.paramMap.subscribe((data) => {
      this.VendorCode = (data.get('code'));
      if (this.VendorCode === null) {
        this.InitializeFormControls();
        this.GetPHList();
      } else {
        this.Editvendor(this.VendorCode);
      }
    });

    this._vendorService.GetMasterVendorList().subscribe(mvResult => {
      this.MasterVendorList = mvResult.data.MasterVendors;
    });
  }

  //#region Form Initialization
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
        VendorName: [this.vendor.VendorName, [Validators.required]],
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
        NameofInsuranceCompany: [{ value: this.vendor.NameofInsuranceCompany, disabled: true }],
        IsInsured: [this.vendor.isInsured]
      }),
      RegisteredOfficeAddress: this._fb.group({
        IsGSTRegistered: [this.vendor.isGSTRegistered, [Validators.required]],
        IsRCM: [{ value: this.vendor.isRCM, disabled: true }],
        GSTIN: [this.vendor.GSTIN],
        GSTDate: [this.FormatDate(this.vendor.GSTDate)],
        IsProvisional: [this.vendor.isProvisional],
        Address1: [this.vendor.RegisteredOfficeAddress.Address1, [Validators.required, Validators.pattern(this.AddressAndRemarksPattern)]],
        Address2: [this.vendor.RegisteredOfficeAddress.Address2, [Validators.pattern(this.AddressAndRemarksPattern)]],
        Address3: [this.vendor.RegisteredOfficeAddress.Address3, [Validators.pattern(this.AddressAndRemarksPattern)]],
        CountryCode: [this.vendor.RegisteredOfficeAddress.CountryCode, [Validators.required]],
        CityCode: [this.vendor.RegisteredOfficeAddress.CityCode, [Validators.required, Validators.pattern(this.AlphabetPattern)]],
        StateCode: [this.vendor.RegisteredOfficeAddress.StateCode, [Validators.required]],
        PIN: [this.vendor.RegisteredOfficeAddress.PIN,
        [Validators.required, Validators.pattern('^[1-9][0-9]{5}$'), Validators.minLength(6), Validators.maxLength(6)]],
        AddressTypeCode: [this.vendor.RegisteredOfficeAddress.AddressTypeCode],
        PrimaryContactName: [this.vendor.RegisteredOfficeAddress.PrimaryContactName,
        [Validators.required, Validators.pattern(this.AlphabetPattern)]],
        PrimaryContactPhone: [this.vendor.RegisteredOfficeAddress.PrimaryContactPhone,
        [Validators.required, Validators.pattern(this.PhonePattern)]],
        PrimaryContactFax: [this.vendor.RegisteredOfficeAddress.PrimaryContactFax, [Validators.pattern(this.PhonePattern)]],
        PrimaryContactEmail: [this.vendor.RegisteredOfficeAddress.PrimaryContactEmail, [Validators.pattern(this.EmailPattern)]],
        PrimaryContactWebsite: [this.vendor.RegisteredOfficeAddress.PrimaryContactWebsite, Validators.pattern(this.WebsitePattern)],
        SecondaryContactName: [this.vendor.RegisteredOfficeAddress.SecondaryContactName, Validators.pattern(this.AlphabetPattern)],
        SecondaryContactPhone: [this.vendor.RegisteredOfficeAddress.SecondaryContactPhone, [Validators.pattern(this.PhonePattern)]],
        SecondaryContactFax: [this.vendor.RegisteredOfficeAddress.SecondaryContactFax, [Validators.pattern(this.PhonePattern)]],
        SecondaryContactEmail: [this.vendor.RegisteredOfficeAddress.SecondaryContactEmail, [Validators.pattern(this.EmailPattern)]],
        SecondaryContactWebsite: [this.vendor.RegisteredOfficeAddress.SecondaryContactWebsite, Validators.pattern(this.WebsitePattern)],
        IsSameForAll: [false],
        IsExpanded: false
      }),
      Address: this._fb.group({
        IsExpanded: false
      }),
      OtherRegDetails: this._fb.group({
        AssociatedSinceYear: [this.FormatDate(this.vendor.AssociatedSinceYear)],
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
        VendorWeaknesses: [this.vendor.Vendor_Weakness === null ? '' : this.vendor.Vendor_Weakness]
      })
    });

    this.personalDetailsForm.updateValueAndValidity();

    this.DisableControls(disablePan, isGSTControlsDisabled, disableRef, isDPDisabled, isJWDisabled);

    if (!isGSTControlsDisabled) {
      this.SetValidationForGSTControls();
    }

    // this.personalDetailsForm.valueChanges.subscribe((data) => {
    //   this.LogValidationErrors(this.personalDetailsForm);
    // });
  }

  Editvendor(Code: string) {
    this._vendorService.GetVendorByCode(Code).subscribe((result) => {
      this.vendor = result.data.Vendor[0];
      this.vendor.RegisteredOfficeAddress =
        ((result.data.RegisteredOfficeAddress[0] === undefined) ? new VendorAddress() : result.data.RegisteredOfficeAddress[0]);
      // this.vendorAddresses = result.data.FactoryAddress;
      this.vendor.RegisteredOfficeAddress.CountryCode = 'IN';

      this.vendorExpe_MDDCode = this.vendor.VendorExpe_MDDCode === null ? null : this.vendor.VendorExpe_MDDCode.split(',');

      if (this.vendor.Ref_VendorCode === '-1') {
        this._vendorService.GetVendors(-1, -1, '').subscribe((mvResult) => {
          this.ReferenceVendorList = mvResult.data.Vendors;
        });
      } else {
        this.ReferenceVendorList = [];
        const tempVendor = new Vendor();
        tempVendor.VendorCode = this.vendor.Ref_VendorCode;
        tempVendor.VendorName = this.vendor.RefVendor_Name;
        this.ReferenceVendorList.push(tempVendor);
      }

      this.GetMasterDataDetails('VendorExpe');
      this.GetPHList();

      this.InitializeFormControls();

      this.SetStateCodeLabel();

      // this.IsAddressSaved = false;
    });
  }
  //#endregion

  //#region Data Binding
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
          this.updateExpertise();
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
  //#endregion

  //#region Form Validators
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

        // added by shubhi for pan validation
        // this.personalDetailsForm.get('PersonalDetails.PANNo').setValidators(this.PanNoValidator());
      } else {
        this.personalDetailsForm.get('RegisteredOfficeAddress.GSTIN').setValidators([]);
        this.personalDetailsForm.get('RegisteredOfficeAddress.GSTIN').disable();
        this.personalDetailsForm.get('RegisteredOfficeAddress.GSTIN').patchValue(null);

        this.personalDetailsForm.get('RegisteredOfficeAddress.GSTDate').setValidators([]);
        this.personalDetailsForm.get('RegisteredOfficeAddress.GSTDate').disable();
        this.personalDetailsForm.get('RegisteredOfficeAddress.GSTDate').patchValue(null);

        this.personalDetailsForm.get('RegisteredOfficeAddress.IsRCM').patchValue(true);

        this.personalDetailsForm.get('RegisteredOfficeAddress.IsGSTRegistered').patchValue(false);
      }
      // this.LogValidationErrors();
      // this.personalDetailsForm.valid;
      // this.clearValidator();
      this.formErrors.GSTIN = '';
      this.formErrors.GSTDate = '';
    }
  }

  checkGSTDateValidation() {
    let isValidDate = true;
    const gstDate = this.personalDetailsForm.get('RegisteredOfficeAddress.GSTDate').value;
    if (this.minDate > gstDate || this.maxDate < gstDate) {
      isValidDate = false;
    }
    return isValidDate;
  }

  checkAssociationDateValidation() {
    let isValidDate = true;
    const date = this.personalDetailsForm.get('OtherRegDetails.AssociatedSinceYear').value;
    if (this.AssociatedWithDate > date || this.maxDate < date) {
      isValidDate = false;
    }
    return isValidDate;
  }

  GSTINValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const status = this.CheckGSTFormat(control.value, this.personalDetailsForm.get('PersonalDetails.PANNo').value === null ? '' :
        this.personalDetailsForm.get('PersonalDetails.PANNo').value.trim().toUpperCase());
      if (!status) {
        return { 'pattern': status };
      }
      return null;
    };
  }

  CheckGSTFormat(gst: string, pan: string): boolean {
    let status = false;

    const reg = new RegExp('^([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$');
    const regWithPan = new RegExp('^([0-9]{1}[zZ]{1}[0-9a-zA-Z]{1})+$');

    const state = this.StateList.find(x =>
      x.MDDCode === this.personalDetailsForm.get('RegisteredOfficeAddress.StateCode').value);
    if (gst !== null && gst.length >= 2 && state !== undefined) {
      const firstTwo = gst.substr(0, 2);
      status = state.MDDShortName.substr(0, 2) === firstTwo;
      // status = this.StateCodeLabel.substr(0, 2) === firstTwo !== undefined;
    }
    if (pan !== null && pan.length === 10) {
      if (status && gst !== null && gst.length >= 10) {
        const panChars = gst.substr(2, 10);
        // status = pan === panChars !== undefined;
        status = pan === panChars;
      }
      if (status && gst !== null && gst.length >= gst.length) {
        const lastThreeChars = gst.substr(12, gst.length);
        status = regWithPan.test(lastThreeChars);
      } else {
        status = false;
      }
    } else {
      if (status && gst !== null && gst.length > 2) {
        const lastcharacters = gst.substr(2, gst.length);
        status = reg.test(lastcharacters);
      } else {
        status = false;
      }
    }
    return status;
  }

  IfInsured(isInsured: boolean) {
    if (isInsured) {
      this.personalDetailsForm.get('PersonalDetails.NameofInsuranceCompany').setValidators(Validators.required);
      this.personalDetailsForm.get('PersonalDetails.NameofInsuranceCompany').enable();
    } else {
      this.personalDetailsForm.get('PersonalDetails.NameofInsuranceCompany').disable();
      this.personalDetailsForm.get('PersonalDetails.NameofInsuranceCompany').patchValue('');
      this.personalDetailsForm.get('PersonalDetails.NameofInsuranceCompany').setValidators([]);
      // this.clearValidator();
      this.formErrors.NameofInsuranceCompany = '';
    }
  }

  clearValidator() {
    this.formErrors.VendorName = '';
    this.formErrors.PANNo = '';
    this.formErrors.GSTIN = '';

    this.formErrors.GSTDate = '';
    this.formErrors.Address1 = '';
    this.formErrors.CountryCode = '';

    this.formErrors.StateCode = '';
    this.formErrors.CityCode = '';
    this.formErrors.PIN = '';

    this.formErrors.PrimaryContactName = '';
    this.formErrors.PrimaryContactPhone = '';
    this.formErrors.PrimaryContactFax = '';
    this.formErrors.PrimaryContactEmail = '';
    this.formErrors.SecondaryContactPhone = '';
    this.formErrors.SecondaryContactFax = '';

    this.formErrors.SecondaryContactEmail = '';
    this.formErrors.NameofInsuranceCompany = '';
    this.formErrors.PrimaryContactWebsite = '';
    this.formErrors.SecondaryContactWebsite = '';

  }
  //#endregion

  //#region Disable Controls and Dismiss message
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
      this.personalDetailsForm.get('RegisteredOfficeAddress.CountryCode').disable();
      this.personalDetailsForm.get('RegisteredOfficeAddress.StateCode').disable();
    } else {
      this.personalDetailsForm.get('RegisteredOfficeAddress.IsGSTRegistered').enable();
      this.personalDetailsForm.get('RegisteredOfficeAddress.GSTIN').enable();
      this.personalDetailsForm.get('RegisteredOfficeAddress.GSTDate').enable();
      this.personalDetailsForm.get('RegisteredOfficeAddress.CountryCode').enable();
      this.personalDetailsForm.get('RegisteredOfficeAddress.StateCode').enable();
    }
  }

  dismissMsg() {
    // if (this.PopUpMessage === 'Saved Succesfully!!') {
    //   const absUrl = window.location.href;
    //   window.location.href = absUrl;
    // }
  }
  //#endregion

  //#region Form Change Events

  //#region PH and Store Selection
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

  UnselectOptions(control: FormControl) {
    control.patchValue([]);
  }
  //#endregion

  // Expertise Select/Unselect
  onChange(expertise: string, isChecked: boolean) {
    this.ExpertiseList.find(x => x.MDDCode === expertise).Checked = isChecked;
  }
  //#endregion

  //#region Save Form Data
  makeVendorExpertiseString(): string {
    let ex = '';
    ex = this.ExpertiseList.filter(function (el) {
      return el.Checked;
    }).map(function (val) {
      return val.MDDCode;
    }).join();

    ex += '~' + this.personalDetailsForm.get('ExpertiseDetails.VendorWeaknesses').value;
    return ex;
  }

  SavePersonalDetails() {
    this.submitted = true;

    if (this.personalDetailsForm.get('PersonalDetails.IsJWVendor').value &&
      (this.SavedPHStoreList.length === 0 &&
        this.SelectedPHStoreList.length === 0)) {
      this.PopUpMessage = 'Please fill required fields.';
      this.alertButton.click();
      this.personalDetailsForm.get('PersonalDetails.IsExpanded').patchValue(true);
      this.personalDetailsForm.get('Address.IsExpanded').patchValue(true);
      this.personalDetailsForm.get('OtherRegDetails.IsExpanded').patchValue(true);
      this.personalDetailsForm.get('CustomerDetails.IsExpanded').patchValue(true);
      this.personalDetailsForm.get('RegisteredOfficeAddress.IsExpanded').patchValue(true);
      this.personalDetailsForm.get('ExpertiseDetails.IsExpanded').patchValue(true);
      this.HasPHSelected = false;
      return;
    }

    if (this.personalDetailsForm.invalid) {
      this.LogValidationErrors();
      this.PopUpMessage = 'Please fill required fields.';
      this.alertButton.click();
      this.personalDetailsForm.get('PersonalDetails.IsExpanded').patchValue(true);
      this.personalDetailsForm.get('Address.IsExpanded').patchValue(true);
      this.personalDetailsForm.get('OtherRegDetails.IsExpanded').patchValue(true);
      this.personalDetailsForm.get('CustomerDetails.IsExpanded').patchValue(true);
      this.personalDetailsForm.get('RegisteredOfficeAddress.IsExpanded').patchValue(true);
      this.personalDetailsForm.get('ExpertiseDetails.IsExpanded').patchValue(true);
      return;
    }

    // added by shubhi
    const pan = this.personalDetailsForm.get('PersonalDetails.PANNo').value === null ? '' :
      this.personalDetailsForm.get('PersonalDetails.PANNo').value.toUpperCase();
    const gst = this.personalDetailsForm.get('RegisteredOfficeAddress.GSTIN').value === null
      ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.GSTIN').value.toUpperCase();


    if (this.personalDetailsForm.get('RegisteredOfficeAddress.IsGSTRegistered').value) {
      if (gst !== '' || pan !== '') {
        if (!this.CheckGSTFormat(gst, pan)) {
          this.PopUpMessage = 'GSTIN or PANNo is not correct.';
          this.alertButton.click();
          return;
        }
      }

      if (!this.checkGSTDateValidation()) {
        this.PopUpMessage = 'Please enter a valid GST Date.';
        this.alertButton.click();
        return;
      }
    }

    if (this.personalDetailsForm.get('OtherRegDetails.AssociatedSinceYear').value) {
      if (!this.checkAssociationDateValidation()) {
        this.PopUpMessage = 'Please enter a valid association date.';
        this.alertButton.click();
        return;
      }
    }


    let StatusObj: any;
    const vendor = new Vendor();
    vendor.VendorExpertise = this.makeVendorExpertiseString();
    vendor.VendorCode = this.VendorCode;
    vendor.VendorName = this.personalDetailsForm.get('PersonalDetails.VendorName').value;
    vendor.PANNo = this.personalDetailsForm.get('PersonalDetails.PANNo').value === null ? '' :
      this.personalDetailsForm.get('PersonalDetails.PANNo').value.toUpperCase();
    vendor.Ref_VendorCode = this.personalDetailsForm.get('PersonalDetails.Ref_VendorCode').value;
    vendor.isInsured = this.personalDetailsForm.get('PersonalDetails.IsInsured').value;
    vendor.NameofInsuranceCompany = this.personalDetailsForm.get('PersonalDetails.NameofInsuranceCompany').value === null ? '' :
      this.personalDetailsForm.get('PersonalDetails.NameofInsuranceCompany').value.trim();
    vendor.IsDirectVendor = this.personalDetailsForm.get('PersonalDetails.IsDirectVendor').value;
    vendor.AssociatedSinceYear = this.personalDetailsForm.get('OtherRegDetails.AssociatedSinceYear').value;
    vendor.VendorType_MDDCode = this.personalDetailsForm.get('OtherRegDetails.VendorType_MDDCode').value;
    vendor.PersonTopRanker1 = this.personalDetailsForm.get('OtherRegDetails.PersonTopRanker1').value === null ? '' :
      this.personalDetailsForm.get('OtherRegDetails.PersonTopRanker1').value.trim();
    vendor.PersonTopRanker2 = this.personalDetailsForm.get('OtherRegDetails.PersonTopRanker2').value === null ? '' :
      this.personalDetailsForm.get('OtherRegDetails.PersonTopRanker2').value.trim();
    vendor.OtherCustomer1 = this.personalDetailsForm.get('CustomerDetails.OtherCustomer1').value === null ? '' :
      this.personalDetailsForm.get('CustomerDetails.OtherCustomer1').value.trim();
    vendor.OtherCustomer2 = this.personalDetailsForm.get('CustomerDetails.OtherCustomer2').value === null ? '' :
      this.personalDetailsForm.get('CustomerDetails.OtherCustomer2').value.trim();
    vendor.OtherCustomer3 = this.personalDetailsForm.get('CustomerDetails.OtherCustomer3').value === null ? '' :
      this.personalDetailsForm.get('CustomerDetails.OtherCustomer3').value.trim();
    vendor.OtherCustomer4 = this.personalDetailsForm.get('CustomerDetails.OtherCustomer4').value === null ? '' :
      this.personalDetailsForm.get('CustomerDetails.OtherCustomer4').value.trim();
    vendor.OtherCustomer5 = this.personalDetailsForm.get('CustomerDetails.OtherCustomer5').value === null ? '' :
      this.personalDetailsForm.get('CustomerDetails.OtherCustomer5').value.trim();
    vendor.SelectedPHListCSV = this.personalDetailsForm.get('PersonalDetails.IsJWVendor').value ?
      this.SelectedPHStoreList.map(function (element) {
        return element.OrgUnitCode;
      }).join() : '';

    vendor.isGSTRegistered = this.personalDetailsForm.get('RegisteredOfficeAddress.IsGSTRegistered').value;
    vendor.GSTIN = this.personalDetailsForm.get('RegisteredOfficeAddress.GSTIN').value === null
      ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.GSTIN').value.toUpperCase();
    vendor.isRCM = this.personalDetailsForm.get('RegisteredOfficeAddress.IsRCM').value;
    vendor.isProvisional = this.personalDetailsForm.get('RegisteredOfficeAddress.IsProvisional').value;
    vendor.GSTDate = this.personalDetailsForm.get('RegisteredOfficeAddress.GSTDate').value;

    vendor.RegisteredOfficeAddress = new VendorAddress();
    vendor.RegisteredOfficeAddress.CompanyCode = '10';
    vendor.RegisteredOfficeAddress.PIN = this.personalDetailsForm.get('RegisteredOfficeAddress.PIN').value;
    vendor.RegisteredOfficeAddress.Address1 = this.personalDetailsForm.get('RegisteredOfficeAddress.Address1').value.trim();
    vendor.RegisteredOfficeAddress.Address2 = this.personalDetailsForm.get('RegisteredOfficeAddress.Address2').value === null
      ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.Address2').value.trim();
    vendor.RegisteredOfficeAddress.Address3 = this.personalDetailsForm.get('RegisteredOfficeAddress.Address3').value === null
      ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.Address3').value.trim();
    vendor.RegisteredOfficeAddress.StateCode = this.personalDetailsForm.get('RegisteredOfficeAddress.StateCode').value;
    vendor.RegisteredOfficeAddress.CityCode = this.personalDetailsForm.get('RegisteredOfficeAddress.CityCode').value;
    vendor.RegisteredOfficeAddress.CountryCode = this.personalDetailsForm.get('RegisteredOfficeAddress.CountryCode').value;
    vendor.RegisteredOfficeAddress.AddressTypeCode = 'O';
    vendor.RegisteredOfficeAddress.AddressReference = 'V';
    vendor.RegisteredOfficeAddress.VendorCode = vendor.VendorCode;
    vendor.RegisteredOfficeAddress.AddressCode = this.Address.AddressCode === null ? '' : this.Address.AddressCode;

    vendor.RegisteredOfficeAddress.PrimaryContactName =
      this.personalDetailsForm.get('RegisteredOfficeAddress.PrimaryContactName').value == null
        ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.PrimaryContactName').value.trim();

    vendor.RegisteredOfficeAddress.PrimaryContactPhone =
      this.personalDetailsForm.get('RegisteredOfficeAddress.PrimaryContactPhone').value === null
        ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.PrimaryContactPhone').value.trim();

    vendor.RegisteredOfficeAddress.PrimaryContactFax =
      this.personalDetailsForm.get('RegisteredOfficeAddress.PrimaryContactFax').value === null
        ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.PrimaryContactFax').value;

    vendor.RegisteredOfficeAddress.PrimaryContactEmail =
      this.personalDetailsForm.get('RegisteredOfficeAddress.PrimaryContactEmail').value === null
        ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.PrimaryContactEmail').value.trim();

    vendor.RegisteredOfficeAddress.PrimaryContactWebsite =
      this.personalDetailsForm.get('RegisteredOfficeAddress.PrimaryContactWebsite').value === null
        ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.PrimaryContactWebsite').value.trim();

    vendor.RegisteredOfficeAddress.SecondaryContactName =
      this.personalDetailsForm.get('RegisteredOfficeAddress.SecondaryContactName').value === null
        ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.SecondaryContactName').value.trim();

    vendor.RegisteredOfficeAddress.SecondaryContactPhone =
      this.personalDetailsForm.get('RegisteredOfficeAddress.SecondaryContactPhone').value === null
        ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.SecondaryContactPhone').value;

    vendor.RegisteredOfficeAddress.SecondaryContactFax =
      this.personalDetailsForm.get('RegisteredOfficeAddress.SecondaryContactFax').value === null
        ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.SecondaryContactFax').value;

    vendor.RegisteredOfficeAddress.SecondaryContactEmail =
      this.personalDetailsForm.get('RegisteredOfficeAddress.SecondaryContactEmail').value === null
        ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.SecondaryContactEmail').value.trim();

    vendor.RegisteredOfficeAddress.SecondaryContactWebsite =
      this.personalDetailsForm.get('RegisteredOfficeAddress.SecondaryContactWebsite').value === null
        ? '' : this.personalDetailsForm.get('RegisteredOfficeAddress.SecondaryContactWebsite').value.trim();

    vendor.RegisteredOfficeAddress.IsSameForAll = this.personalDetailsForm.get('RegisteredOfficeAddress.IsSameForAll').value;

    this._vendorService.SaveVendorPersonalDetails(vendor).subscribe((data) => {
      StatusObj = data;
      if (StatusObj.data.Table[0].ResultCode === 0) {
        this.PopUpMessage = StatusObj.data.Table[0].ResultMessage;
        this.alertButton.click();
        // this.IsAddressSaved = true;
        this.submitted = false;
        this.clearValidator();
        this.Editvendor(this.VendorCode);
      } else {
        this.PopUpMessage = StatusObj.data.Table[0].ResultMessage;
        this.alertButton.click();
      }
    });
  }
  //#endregion

  //#region Expand/Collapse Sections
  ToggleContainer(formGroup: FormGroup) {
    formGroup.controls.IsExpanded.patchValue(!formGroup.controls.IsExpanded.value);
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
  //#endregion

  //#region Adding vendor Address
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
  //#endregion

  //#region Commented Code


  // OpenAddressModal(vendorAddress: VendorAddress) {
  //   this.Address = vendorAddress;
  //   const el = this.addModalOpenButton.nativeElement as HTMLElement;
  //   el.click();
  // }

  // OnAddressSaved(IsSaved: boolean) {
  //   this.IsAddressSaved = IsSaved;
  //   if (this.IsAddressSaved) {
  //     this.Editvendor(this.VendorCode);
  //   }
  // }

  // added by shubhi for pan no.
  // PanNoValidator(): ValidatorFn {
  //   return (control: AbstractControl): { [key: string]: boolean } | null => {
  //     const status = this.CheckPANFormat(control.value, this.personalDetailsForm.get
  // ('RegisteredOfficeAddress.GSTIN').value === null ? '' :
  //     this.personalDetailsForm.get('RegisteredOfficeAddress.GSTIN').value.trim().toUpperCase());
  //     if (!status) {
  //       return { 'pattern': status };
  //     }
  //     return null;
  //   };
  // }

  // CheckPANFormat(pan: string, gst: string): boolean {
  //   let status = false;
  //   if (gst !== null && gst.length >= 2) {
  //     const panChars = gst.substr(2, 10);
  //     status = pan === panChars ;
  //     // status = this.StateCodeLabel.substr(0, 2) === firstTwo !== undefined;
  //   } else {
  //           status = false;
  //         }
  //   return status;
  // }

  // CheckGSTFormat(g: string): boolean {
  //   let status = false;
  //   const reg = new RegExp('^([a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1})+$');
  //   if (g !== null && g.length >= 2) {
  //     const firstTwo = g.substr(0, 2);
  //     status = this.StateList.find(x => x.MDDShortName === firstTwo) !== undefined;
  //   }

  //   if (status && g !== null && g.length > 2) {
  //     const lastcharacters = g.substr(2, g.length);
  //     status = reg.test(lastcharacters);
  //   } else {
  //     status = false;
  //   }

  //   return status;
  // }

  //#endregion
}
