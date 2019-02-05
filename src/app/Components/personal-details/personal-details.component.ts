import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Vendor } from 'src/app/Models/vendor';
import { VendorService } from 'src/app/Services/vendor.service';
import { OrgUnit } from 'src/app/Models/OrgUnit';

declare var $: any;

@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.css']
})
export class PersonalDetailsComponent implements OnInit {

  vendor: Vendor;
  personalDetailsForm: FormGroup;

  Code: string;
  vendorType = 'DP';

  AllPHList: OrgUnit[];
  PHList: OrgUnit[] = [];
  SelectedPHList: OrgUnit[] = [];

  constructor(private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder) { }

  ngOnInit() {

    this._route.parent.paramMap.subscribe((data) => {
      this.Code = (data.get('code'));
    });

    if (this.Code === null) {
      this.vendor = new Vendor();
      this.InitializeFormControls();
    } else {
      this.Editvendor(this.Code);
    }
  }

  Editvendor(Code: string) {
    this._vendorService.GetVendorByCode(Code).subscribe((data) => {
      this.vendor = data.Vendor[0];
      this.InitializeFormControls();
    });
  }

  FillPHLists() {
    if (this.vendor.SelectedPHListCSV) {
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
        Code: [this.vendor.Code],
        Name: [this.vendor.Name],
        MasterVendorName: [this.vendor.MasterVendorName],
        PANNo: [this.vendor.PANNo],
        GSTIN: [this.vendor.GSTIN],
        TINNo: [this.vendor.TINNo],
        VendorType: [this.vendor.VendorType],
        PHList: new FormControl(null),
        IsExpanded: true
      }),
      Address: this._fb.group({
        nameInAddress: [this.vendor.nameInAddress],
        PIN: [this.vendor.PIN],
        State: [this.vendor.State],
        AddressLine1: [this.vendor.AddressLine1],
        AddressLine2: [this.vendor.AddressLine2],
        City: [this.vendor.City],
        AddressType: [this.vendor.AddressType],
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
        EnterpriseNature: [this.vendor.EnterpriseNature],
        Partner1Name: [this.vendor.Partner1Name],
        Partner2Name: [this.vendor.Partner2Name],
        IsExpanded: false
      }),
      CustomerDetails: this._fb.group({
        Customer1Name: [this.vendor.Customer1Name],
        Customer2Name: [this.vendor.Customer2Name],
        Customer3Name: [this.vendor.Customer3Name],
        Customer4Name: [this.vendor.Customer4Name],
        Customer5Name: [this.vendor.Customer5Name],
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
