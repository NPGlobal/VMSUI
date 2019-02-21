import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { VendorService } from 'src/app/Services/vendor.service';
import { Vendor } from 'src/app/Models/vendor';
import { VendorAddress } from 'src/app/Models/vendor-address';

@Component({
  selector: 'app-bank-details',
  templateUrl: './bank-details.component.html',
  styleUrls: ['./bank-details.component.css']
})
export class BankDetailsComponent implements OnInit {

  BankDetailsForm: FormGroup;
  vendor: Vendor;
  submitted = false;
  VendorCode: string;
  SaveOnlyBankDetails = true;
  AccountNumberValidation = '^[0-9]*$';
  AlphanumericPattern = '^[a-zA-Z0-9]*$';

  ValidationMessages = {
    'CurrencyCode': {
      'required': ''
    },
    'PaymentTerms': {
      'required': '',
      'pattern': ''
    },
    'AccountNo': {
      'pattern': ''
    }
  };

  formErrors = {
    'CurrencyCode': '',
    'PaymentTerms': '',
    'AccountNo': ''
  };


  constructor(private _route: ActivatedRoute, private _fb: FormBuilder, private _vendorService: VendorService) { }

  ngOnInit() {
    this._route.parent.paramMap.subscribe((data) => {
      this.VendorCode = (data.get('code'));
      if (this.VendorCode === null) {
        this.InitializeFormControls();
      } else {
        this.Editvendor(this.VendorCode);
      }
      this.vendor = new Vendor();
      this.InitializeFormControls();
    });
  }

  InitializeFormControls() {
    this.BankDetailsForm = this._fb.group({
      NameAsPerBankAccount: [this.vendor.NameAsPerBankAccount],
      BankName: [this.vendor.BankName],
      BranchName: [this.vendor.BranchName],
      isECSenabled: [this.vendor.isECSenabled],
      AccountNo: [this.vendor.BankAcctNo, Validators.pattern(this.AccountNumberValidation)],
      AccountType: [this.vendor.accountType === null ? '-1' : this.vendor.accountType],
      CurrencyCode: [this.vendor.CurrencyCode === null ? 'INR' : this.vendor.CurrencyCode, Validators.required],
      PaymentTerms: [this.vendor.PaymentTerms, [Validators.required, Validators.pattern(this.AlphanumericPattern)]],
      IFSCCode: [this.vendor.IFSCCode],
      MICRNo: [this.vendor.MICRNo],
      SWIFTCode: [this.vendor.SwiftCode],
      RemittanceInfavourof: [this.vendor.RemittanceInfavourof]
    });
    this.BankDetailsForm.valueChanges.subscribe((data) => {
      this.logValidationErrors(this.BankDetailsForm);
    });
  }

  Editvendor(Code: string) {
    this._vendorService.GetVendorByCode(Code).subscribe((result) => {
      this.vendor = result.data.Vendor[0];
      this.InitializeFormControls();
    });
  }

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
              this.formErrors[key] += messages[errorkey] + ' ';
            }
          }
        }
      }
    });
  }

  SaveVendorBankDetails() {

    this.submitted = true;
    if (this.BankDetailsForm.invalid) {
      this.logValidationErrors();
      return;
    }

    const vendor = this.vendor;
    vendor.RegisteredOfficeAddress = new VendorAddress();
    vendor.VendorCode = this.VendorCode;
    vendor.SaveOnlyBankDetails = this.SaveOnlyBankDetails;
    vendor.NameAsPerBankAccount = this.BankDetailsForm.get('NameAsPerBankAccount').value;
    vendor.BankAcctNo = this.BankDetailsForm.get('AccountNo').value;
    vendor.BankName = this.BankDetailsForm.get('BankName').value;
    vendor.BranchName = this.BankDetailsForm.get('BranchName').value;
    vendor.CurrencyCode = this.BankDetailsForm.get('CurrencyCode').value;
    vendor.IFSCCode = this.BankDetailsForm.get('IFSCCode').value;
    vendor.MICRNo = this.BankDetailsForm.get('MICRNo').value;
    vendor.PaymentTerms = this.BankDetailsForm.get('PaymentTerms').value;
    vendor.RemittanceInfavourof = this.BankDetailsForm.get('RemittanceInfavourof').value;
    vendor.SwiftCode = this.BankDetailsForm.get('SWIFTCode').value;
    vendor.accountType = this.BankDetailsForm.get('AccountType').value;
    vendor.isECSenabled = this.BankDetailsForm.get('isECSenabled').value;
    this._vendorService.SaveVendorPersonalDetails(vendor).subscribe((data) => {
      const StatusObj = data;
      if (StatusObj.Status === 0) {
        alert('Saved Succesfully!!');
        this.Editvendor(this.VendorCode);
      }
    });
    console.log(JSON.stringify(vendor));
  }
}
