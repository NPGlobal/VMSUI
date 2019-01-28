import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { VendorService } from 'src/app/Services/vendor.service';
import { OrgUnit } from 'src/app/Models/OrgUnit';

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
  constructor(private _fb: FormBuilder, private _vendorService: VendorService) {
  }

  ngOnInit() {
    this._vendorService.GetPHList().subscribe(PHList => {
      this.AllPHList = PHList.Table;
      this.PHList = PHList.Table;
    });
    this.RegistrationForm = this._fb.group({
      Code: [''],
      Name: [''],
      VendorType: [''],
      GSTIN: [''],
      PANNo: [''],
      PHList: [''],
      SelectedPHList: [''],
      PHListCSV: ''
    });
  }

  SaveVendorPrimaryInfo() {
    console.log(this.RegistrationForm.value);
  }
  MoveToSelectedPHList() {
    const values = this.RegistrationForm.get('PHList').value as Array<string>;

    for (let i = 0; i < this.AllPHList.length; i++) {
      if (values.includes(this.AllPHList[i].OrgUnitCode)) {
        this.SelectedPHList.push(this.AllPHList[i]);
      }
    }

    for (let i = 0; i < this.AllPHList.length; i++) {
      if (values.includes(this.PHList[i].OrgUnitCode)) {
        this.PHList = this.PHList.map(function (element) {
          if (element !== this.PHList[i]) {
            return element;
          }
        });
      }
    }
  }
  MoveToPHList() {

  }


}
