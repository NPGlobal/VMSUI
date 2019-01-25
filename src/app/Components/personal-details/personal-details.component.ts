import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
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
  //addressForm:FormGroup;
  Code: string;
  vendorType = 'DP';
  display = 'none';
  AddressType = 'office';



  addressForm: FormArray;

  constructor(private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder) { }
  submitted = false;




  ngOnInit() {

    this._route.parent.paramMap.subscribe((data) => {
      this.Code = (data.get('code'));
    });
    this.Editvendor(this.Code);
    console.log(this.personalDetailsForm);
    // this.personalDetailsForm = this._fb.group({

    //   addressForm: this._fb.array([this.createAddress()])
    // });

    // this.addressForm = this._fb.group({
    //   nameInAddress: ['', Validators.required],
    //   AddressLine1: ['', Validators.required],
    //   City:['', [Validators.required,Validators.minLength(3)]],
    //   AddressLine2:'',
    //   State:'',
    //   PIN:'',
    //   AddressType:'factory'

    // });
  }

  createAddress(): FormGroup {
    return this._fb.group({
      nameInAddress: ['', Validators.required],
      AddressLine1: ['', Validators.required],
      City: ['', [Validators.required, Validators.minLength(3)]],
      AddressLine2: '',
      State: '',
      PIN: '',
      AddressType: 'factory'

    });
  }

  addItem(): void {
    this.addressForm = this.personalDetailsForm.get('addressForm') as FormArray;
    this.addressForm.push(this.createAddress());
  }

  get f() { return this.addressForm.controls; }

  OnSubmit() {
    this.submitted = true;
    if (this.addressForm.invalid) {

      return;
    }
    console.log(JSON.stringify(this.addressForm.value));
    alert(JSON.stringify(this.addressForm.value));
    //console.log(JSON.stringify(this.addressForm));
    alert('SUCCESS!! :-)')
  }

  openModalDialog() {
    this.display = 'block'; //Set block css
  }

  closeModalDialog() {
    this.display = 'none'; //set none css after close dialog
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
        PHList: new FormControl(null),
        IsExpanded: true
      }),
      // Address: this._fb.group({
      //   RegisOffAddr: [this.vendor.RegisOffAddr],
      //   FactoryAddr: [this.vendor.FactoryAddr],
      //   City: [this.vendor.City],
      //   State: [this.vendor.State],
      //   PIN: [this.vendor.PIN],
      //   IsExpanded: false
      // }),

      //added by Shubhi
      Address: this._fb.group({
        addressForm: this._fb.array([{
          nameInAddress: [this.vendor.nameInAddress],
          PIN: [this.vendor.PIN],
          State: [this.vendor.State],
          AddressLine1: [this.vendor.AddressLine1],
          AddressLine2: [this.vendor.AddressLine2],
          City: [this.vendor.City],
          AddressType: [this.vendor.AddressType]
        }]),
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
    console.log(this.personalDetailsForm);
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
    // console.log(this.personalDetailsForm);
    // alert(this.personalDetailsForm.value);
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