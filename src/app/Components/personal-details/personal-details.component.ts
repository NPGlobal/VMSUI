import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Vendor } from 'src/app/Models/vendor';
import { VendorService } from 'src/app/Services/vendor.service';
import { OrgUnit } from 'src/app/Models/OrgUnit';
import { delay } from 'q';
import { MasterDataDetailsService } from 'src/app/Services/master-data-details.service';
import { MasterDataDetails } from 'src/app/Models/master-data-details';

declare var $: any;

@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.css']
})
export class PersonalDetailsComponent implements OnInit {

  vendor: Vendor;
  personalDetailsForm: FormGroup;
  YearList: number[] = [];
  MasterVendorList: Vendor[] = [];
  VendorTypeList: MasterDataDetails[];
  VendorCode: string;
  vendorType = 'DP';

  AllPHList: OrgUnit[];
  PHList: OrgUnit[] = [];
  SelectedPHList: OrgUnit[] = [];

  AddressCode: string;

  constructor(private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _mDDService: MasterDataDetailsService) {
    this.AddressCode = '';
  }

  ngOnInit() {
    this._route.parent.paramMap.subscribe((data) => {
      this.VendorCode = (data.get('code'));
      if (this.VendorCode === null) {
        this.vendor = new Vendor();
        this.InitializeFormControls();
      } else {
        this.Editvendor(this.VendorCode);
      }
    });

    this.PupulateYears();

    this._vendorService.GetVendors(-1, -1).subscribe(data =>
      this.MasterVendorList = data.Vendors.filter(x => x.Status === 'A')
    );

    this.GetPHList();
    this.GetMasterDataDetails('VendorType');
  }

  PupulateYears() {
    for (let i = (new Date()).getFullYear(); i >= ((new Date()).getFullYear() - 20); i--) {
      this.YearList.push(i);
    }
  }

  GetPHList() {
    this._vendorService.GetPHList().subscribe((PHList) => {
      delay(1000);
      this.AllPHList = PHList.Table;
    },
      (nextCallBack) => {
        this.FillPHLists();
      });
  }

  GetMasterDataDetails(MDHCode: string) {
    this._mDDService.GetMasterDataDetails(MDHCode).subscribe((data) => {
      this.VendorTypeList = data.Table;
    });
  }

  SavePersonalDetails() {
    let StatusObj: any;
    const vendor = new Vendor();
    vendor.VendorCode = this.VendorCode;
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
    this._vendorService.SaveVendorPersonalDetails(vendor).subscribe((data) => {
      StatusObj = data;
      if (StatusObj.Status === 0) {
        alert('h!');
      }
    });
  }

  Editvendor(Code: string) {
    this._vendorService.GetVendorByCode(Code).subscribe((data) => {
      this.vendor = data.Vendor[0];
      this.InitializeFormControls();
    });
  }

  FillPHLists() {
    if (this.vendor && this.vendor.SelectedPHListCSV) {
      const selectedOrgCodeArr = this.vendor.SelectedPHListCSV.split(',');
      for (let i = 0; i < this.AllPHList.length; ++i) {
        if (selectedOrgCodeArr.includes(this.AllPHList[i].OrgUnitCode)) {
          this.SelectedPHList.push(this.AllPHList[i]);
        } else {
          this.PHList.push(this.AllPHList[i]);
        }
      }
    }
  }

  InitializeFormControls() {

    this.personalDetailsForm = this._fb.group({
      PersonalDetails: this._fb.group({
        VendorCode: [this.vendor.VendorCode],
        VendorName: [this.vendor.VendorCode],
        MasterVendorName: [this.vendor.MasterVendorName],
        PANNo: [this.vendor.PANNo],
        GSTIN: [this.vendor.GSTIN],
        TINNo: [this.vendor.TINNo],
        PHList: new FormControl(null),
        Ref_VendorCode: '',
        IsExpanded: true,
        IsJWVendor: [false],
        IsDirectVendor: [true]
      }),
      Address: this._fb.group({
        IsExpanded: false
      }),
      Contact: this._fb.group({
        ContactPersonName: [this.vendor.ContactPersonName],
        OfficeContact: [this.vendor.OfficeContact],
        ContactPersonMobile: [this.vendor.ContactPersonMobile],
        FAXNo: [this.vendor.FAXNo],
        EmailId: [this.vendor.EmailId],
        WebSite: [this.vendor.Website],
        IsExpanded: false
      }),
      OtherRegDetails: this._fb.group({
        AssociatedSinceYear: [this.vendor.AssociatedSinceYear],
        VendorType_MDDCode: [''],
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
  }

  ToggleContainer(formGroup: FormGroup) {
    formGroup.controls.IsExpanded.patchValue(!formGroup.controls.IsExpanded.value);
  }

  MoveToSelectedPHList() {
  }
}
