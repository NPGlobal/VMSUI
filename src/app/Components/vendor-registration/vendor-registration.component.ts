import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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

  HasPHSelected: boolean;
  AlphanumericPattern = '^[a-zA-Z0-9]*$';

  @ViewChild('modalCloseButton')
  modalCloseButton: ElementRef;

  constructor(private _fb: FormBuilder,
    private _vendorService: VendorService,
    private _router: Router) {
  }

  ngOnInit() {
    this._vendorService.GetPHList().subscribe(PHList => {
      this.AllPHList = PHList.Table;
      this.PHList = PHList.Table;
    });
    this.RegistrationForm = this._fb.group({
      Code: ['', [Validators.required, Validators.maxLength(6)]],
      Name: [''],
      VendorType: ['DP'],
      IsRCM: [false],
      IsProvisional: [false],
      MasterVendorName: [''],
      GSTIN: ['', [Validators.required, Validators.pattern(this.AlphanumericPattern), Validators.minLength(15), Validators.maxLength(15)]],
      PANNo: ['', [Validators.required, Validators.pattern(this.AlphanumericPattern), Validators.minLength(10), Validators.maxLength(10)]],
      PHList: [''],
      SelectedPHList: null,
      PHListCSV: ''
    });

    this.HasPHSelected = true;
  }

  SaveVendorPrimaryInfo() {
    const el = this.modalCloseButton.nativeElement as HTMLElement;
    let statusObj: any;
    const vendor = new Vendor();
    vendor.Name = this.RegistrationForm.get('Name').value;
    vendor.PANNo = this.RegistrationForm.get('PANNo').value;
    vendor.GSTIN = this.RegistrationForm.get('GSTIN').value;
    vendor.IsProvisional = this.RegistrationForm.get('IsProvisional').value;
    vendor.IsRCM = this.RegistrationForm.get('IsRCM').value;
    vendor.Code = this.RegistrationForm.get('Code').value;
    vendor.VendorType = this.RegistrationForm.get('VendorType').value;
    vendor.SelectedPHListCSV = (this.RegistrationForm.get('VendorType').value === 'DP') ? '10' :
      this.RegistrationForm.get('SelectedPHList').value.join();
    this._vendorService.SaveVendorPrimaryInfo(vendor).subscribe(data => {
      statusObj = data;
      if (statusObj.Status === 0) {
        el.click();
        this._router.navigate(['vendor/' + vendor.Code + '/personal']);
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
    if (this.RegistrationForm.get('VendorType').value === 'DP') {
      this.HasPHSelected = true;
    } else {
      this.HasPHSelected = (this.SelectedPHList && this.SelectedPHList.length > 0) ? true : false;
    }
  }
}
