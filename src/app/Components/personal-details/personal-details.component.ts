import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Vendor } from 'src/app/Models/vendor';
import { VendorService } from 'src/app/Services/vendor.service';

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

  constructor(private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder) { }

  ngOnInit() {

    this._route.parent.paramMap.subscribe((data) => {
      this.Code = (data.get('code'));
    });
    this.Editvendor(this.Code);
  }

  Editvendor(Code: string) {
    if (Code === null) {
      this.vendor = new Vendor();
      this.InitializeFormControls();

    } else {
      this._vendorService.GetVendorByCode(Code).subscribe((data) => {
        this.vendor = data.Vendor[0];
        this.InitializeFormControls();
      });
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
        IsExpanded: true
      }),
      Address: this._fb.group({
        RegisOffAddr: [this.vendor.RegisOffAddr],
        FactoryAddr: [this.vendor.FactoryAddr],
        City: [this.vendor.City],
        State: [this.vendor.State],
        PIN: [this.vendor.PIN],
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
      })
    });
  }

  ToggleContainer(formGroup: FormGroup) {
    formGroup.controls.IsExpanded.patchValue(!formGroup.controls.IsExpanded.value);
  }

  MoveLeftToRight() {
    var $btn1 = $('#btnAdd');
    var $btn2 = $('#btnRemove');
    var $fromSel = $('#list1');
    var $toSel = $('#list2');
    movePh($btn1, $btn2, $fromSel, $toSel);
  }
  MoveRightToLeft() {
    var $btn1 = $('#btnRemove');
    var $btn2 = $('#btnAdd');
    var $fromSel = $('#list2');
    var $toSel = $('#list1');
    movePh($btn1, $btn2, $fromSel, $toSel);
  }
  SavePersonalDetails() {
    //alert('Click');
  }
}

function movePh($btn1, $btn2, $fromSel, $toSel) {
  if ($fromSel.find('option').length == 0)
    alert('No item found to move.');
  else if ($fromSel.find('option:selected').length == 0)
    alert('Please select atleast one item for move.');

  $fromSel.find('option:selected').appendTo($toSel);
  if ($fromSel.find('option').length == 0)
    $btn1.attr('disabled', 'disabled');
  if ($toSel.find('option').length > 0)
    $btn2.removeAttr('disabled');
 }
