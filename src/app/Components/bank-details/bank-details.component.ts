import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { VendorService } from 'src/app/Services/vendor.service';
import { Vendor } from 'src/app/Models/vendor';
import { VendorAddress } from 'src/app/Models/vendor-address';
import { ValidationMessagesService } from 'src/app/Services/validation-messages.service';

@Component({
  selector: 'app-bank-details',
  templateUrl: './bank-details.component.html',
  styleUrls: ['./bank-details.component.css']
})
export class BankDetailsComponent implements OnInit {

  //#region Variable Declaration and Pattern
  BankDetailsForm: FormGroup;
  vendor: Vendor;
  submitted = false;
  VendorCode: string;
  SaveOnlyBankDetails = true;
  AccountType: any[];
  CurrencyList: any[];
  AccountNumberValidation = '^[0-9]*$';
  AlphanumericPattern = '^[a-zA-Z0-9]*$';
  MICRPattern = '^[0-9]{9}$';
  AlphaNumSpecialCharPattern = /^[-@\.\-'&()\/\w\s]*$/;
  AlphabetPattern = '^[a-zA-Z ]*$';
  AlphaNumericWithSpace = '^[a-zA-Z0-9 ]*$';


  // NumberPattern: '^[1-9][0-9]*$';
  // PhonePattern = '^[0-9]{10}$';
  // AlphabetPattern = '^[a-zA-Z ]*$';
  // AlphabetPattern = '^[a-zA-Z ]*[\.\]?[a-zA-Z ]*$';



  isDeactVendor = false;
  //#endregion

  //#region Alert Modal
  @ViewChild('alertModalButton')
  alertModalButton: ElementRef;
  PopUpMessage: string;
  alertButton: any;
  //#endregion

  //#region Validation Message
  ValidationMessages = {
    'CurrencyCode': {
      'required': ''
    },
    'PaymentTerms': {
      'required': '',
      'pattern': this._validationMess.PaymentTerms
    },
    'AccountNo': {
      'required': '',
      'pattern': this._validationMess.AccountNoPattern
    },
    'NameAsPerBankAccount': {
      'required': '',
      'pattern': this._validationMess.NamePattern
    },
    'BankName': {
      'required': '',
      'pattern': this._validationMess.BankName
    },
    'BranchName': {
      'pattern': this._validationMess.BranchName
    },
    'IFSCCode': {
      'required': '',
      'pattern': this._validationMess.IFSCCode,
      // 'maxlength': this._validationMess.IFSCCode,
      // 'minlength': this._validationMess.IFSCCode
    },
    'MICRNo': {
      'pattern': this._validationMess.MICRNo,
      // 'maxlength': this._validationMess.MICRNo,
      // 'minlength': this._validationMess.MICRNo
    },
    'SWIFTCode': {
      'pattern': this._validationMess.SwiftCode,
      // 'maxlength': this._validationMess.SwiftCode,
      // 'minlength': this._validationMess.MICRNo
    },
    'RemittanceInfavourof': {
      'pattern': this._validationMess.RemittanceInfavourof
    }
  };

  formErrors = {
    'CurrencyCode': '',
    'PaymentTerms': '',
    'AccountNo': '',
    'NameAsPerBankAccount': '',
    'BankName': '',
    'BranchName': '',
    'IFSCCode': '',
    'MICRNo': '',
    'SWIFTCode': '',
    'RemittanceInfavourof': ''
  };
  //#endregion


  constructor(private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _vendorService: VendorService,
    private _validationMess: ValidationMessagesService) { }

  ngOnInit() {
    this.alertButton = this.alertModalButton.nativeElement as HTMLElement;
    this._route.parent.paramMap.subscribe((data) => {
      this.VendorCode = (data.get('code'));
      if (this.VendorCode === null) {
        this.vendor = new Vendor();
        this.InitializeFormControls();
      } else {
        this.Editvendor(this.VendorCode);
      }
    });
    this.GetCurrencyList();
    this.GetAccountType();
  }

  //#region Form Initialization
  InitializeFormControls() {
    this.BankDetailsForm = this._fb.group({
      NameAsPerBankAccount: [this.vendor.NameAsPerBankAccount, [Validators.required, Validators.pattern(this.AlphaNumSpecialCharPattern)]],
      BankName: [this.vendor.BankName, [Validators.required, Validators.pattern(this.AlphaNumSpecialCharPattern)]],
      BranchName: [this.vendor.BranchName, [Validators.pattern(this.AlphaNumericWithSpace)]],
      isECSenabled: [this.vendor.isECSenabled],
      AccountNo: [this.vendor.BankAcctNo, [Validators.required, Validators.pattern(this.AccountNumberValidation)]],
      AccountType: [this.vendor.accountType === null ? '-1' : this.vendor.accountType],
      CurrencyCode: [this.vendor.CurrencyCode === null ? 'INR' : this.vendor.CurrencyCode],
      PaymentTerms: [this.vendor.PaymentTerms, [Validators.required, Validators.pattern(this.AlphaNumSpecialCharPattern)]],
      // IFSCCode: [this.vendor.IFSCCode, [Validators.required, Validators.pattern(this.AlphanumericPattern),
      // Validators.maxLength(11), Validators.minLength(11)]],
      // MICRNo: [this.vendor.MICRNo, [Validators.pattern(this.MICRPattern), Validators.maxLength(9), Validators.minLength(9)]],
      // SWIFTCode: [this.vendor.SwiftCode, [Validators.pattern(this.AlphanumericPattern),
      // Validators.maxLength(11), Validators.minLength(8)]],
      IFSCCode: [this.vendor.IFSCCode, [Validators.required, Validators.pattern(this.AlphanumericPattern)]],
      MICRNo: [this.vendor.MICRNo, [Validators.pattern(this.MICRPattern)]],
      SWIFTCode: [this.vendor.SwiftCode, [Validators.pattern(this.AlphanumericPattern)]],
      RemittanceInfavourof: [this.vendor.RemittanceInfavourof, [Validators.pattern(this.AlphaNumSpecialCharPattern)]]
    });
    // this.BankDetailsForm.valueChanges.subscribe((data) => {
    //   this.logValidationErrors(this.BankDetailsForm);
    // });
    if (localStorage.getItem('VendorStatus') === 'D') {
      this.BankDetailsForm.disable();
      this.isDeactVendor = true;
    }
  }

  Editvendor(Code: string) {
    this._vendorService.GetVendorByCode(Code).subscribe((result) => {
      this.vendor = result.data.Vendor[0];
      this.InitializeFormControls();
    });
  }
  //#endregion

  //#region Data Binging
  GetCurrencyList() {
    this._vendorService.GetCurrencyList().subscribe((result) => {
      this.CurrencyList = result.data.Table;
    });
  }

  GetAccountType() {
    this._vendorService.GetAccountType().subscribe((result) => {
      this.AccountType = result.data.Table;
    });
  }
  //#endregion

  //#region Form Validator
  logValidationErrors(group: FormGroup = this.BankDetailsForm): void {
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
              this.formErrors[key] = messages[errorkey] + ' ';
            }
          }
        }
      }
    });
  }
  //#endregion

  //#region Save Form Data
  SaveVendorBankDetails() {

    this.submitted = true;
    if (this.BankDetailsForm.invalid) {
      this.logValidationErrors();
      this.PopUpMessage = 'Please fill the required fields.';
      this.alertButton.click();
      return;
    }

    let StatusObj: any;
    const vendor = this.vendor;
    vendor.RegisteredOfficeAddress = new VendorAddress();
    vendor.VendorCode = this.VendorCode;
    vendor.SaveOnlyBankDetails = this.SaveOnlyBankDetails;
    vendor.NameAsPerBankAccount = this.BankDetailsForm.get('NameAsPerBankAccount').value === null ?
      null : this.BankDetailsForm.get('NameAsPerBankAccount').value.trim();
    vendor.BankAcctNo = this.BankDetailsForm.get('AccountNo').value === null ?
      null : this.BankDetailsForm.get('AccountNo').value.trim();
    vendor.BankName = this.BankDetailsForm.get('BankName').value === null ?
      null : this.BankDetailsForm.get('BankName').value.trim();
    vendor.BranchName = this.BankDetailsForm.get('BranchName').value === null ?
      null : this.BankDetailsForm.get('BranchName').value.trim();
    vendor.CurrencyCode = this.BankDetailsForm.get('CurrencyCode').value;
    vendor.IFSCCode = this.BankDetailsForm.get('IFSCCode').value === null ?
      null : this.BankDetailsForm.get('IFSCCode').value.trim();
    vendor.MICRNo = this.BankDetailsForm.get('MICRNo').value === null ?
      null : this.BankDetailsForm.get('MICRNo').value.trim();
    vendor.PaymentTerms = this.BankDetailsForm.get('PaymentTerms').value === null ?
      null : this.BankDetailsForm.get('PaymentTerms').value.trim();
    vendor.RemittanceInfavourof = this.BankDetailsForm.get('RemittanceInfavourof').value === null ?
      null : this.BankDetailsForm.get('RemittanceInfavourof').value.trim();
    vendor.SwiftCode = this.BankDetailsForm.get('SWIFTCode').value === null ?
      null : this.BankDetailsForm.get('SWIFTCode').value.trim();
    vendor.accountType = this.BankDetailsForm.get('AccountType').value.trim();
    vendor.isECSenabled = this.BankDetailsForm.get('isECSenabled').value;
    try {
      this._vendorService.SaveVendorPersonalDetails(vendor).subscribe((result) => {
        StatusObj = result;
        if (StatusObj.data.Table[0].ResultCode === 0) {
          this.PopUpMessage = StatusObj.data.Table[0].ResultMessage;
          this.alertButton.click();
          this.Editvendor(this.VendorCode);
        } else {
          this.PopUpMessage = StatusObj.data.Table[0].ResultMessage;
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
