import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorService } from 'src/app/Services/vendor.service';
import { VendorProduction } from 'src/app/Models/VendorProduction';
import { MasterDataDetailsService} from 'src/app/Services/master-data-details.service';
declare var $: any;

@Component({
  selector: 'app-production-details',
  templateUrl: './production-details.component.html',
  styleUrls: ['./production-details.component.css']
})
export class ProductionDetailsComponent implements OnInit {
 constructor(
    private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _pager: PagerService,
    private _mddService: MasterDataDetailsService
  ) {

  }
   vendorcode: string;
  // NumericPattern = '^[0-9]*$';
  // vendorProductionList: VendorProduction[]; // For added Staff List
  // VendorProduction: VendorProduction; // For form value save and update
  // totalItems: number;
  // currentPage = 1;
  // pageSize = 20;
  // pager: any = {};
  // pagedItems: any[];

  ProductionDetailsForm: FormGroup;
  divisionList: any[];
  departmentList: any[];
  status = true;
  submitted = false;

  ngOnInit() {
    // this.openModal();
    this.openModal();
    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      // this.GetVendorStaffs(this.currentPage);
    });

    this.GetDivisions();
  }
  // InitializeFormControls() {
  //   this.ProductionDetailsForm = this._fb.group({
  //     id: ['0'],
  //     division: [''],
  //     department: ['']
  //   });
  // }
  openModal() {
     this.ProductionDetailsForm = this._fb.group({
      id: ['0'],

      division: ['', Validators.required],
      department: ['-1', Validators.required],
      approvedProductionUnits: ['', Validators.required],
      subContractingUnitName: ['', Validators.required],
      subContractingUnitAddress: ['', Validators.required],
      natureOfSubContractingUnit: ['', Validators.required],
      monthlyCapacity: ['', Validators.required],
      minimalCapacity: ['', Validators.required],
      leanMonths: ['', Validators.required],
      leanCapicity: ['', Validators.required]
     });
  }
  dismiss() {
    this.ProductionDetailsForm = this._fb.group({
      id: ['0'],
      division: [''],
      department: ['-1'],
      approvedProductionUnits: [''],
      subContractingUnitName: [''],
      subContractingUnitAddress: [''],
      natureOfSubContractingUnit: [''],
      monthlyCapacity: [''],
      minimalCapacity: [''],
      leanMonths: [''],
      leanCapicity: ['']
    });
    this.submitted = false;
    this.departmentList = [];
  }

  GetDivisions() {
    // debugger;
    this._mddService.GetMasterDataDetails('Division', '-1').subscribe((result) => {
      this.divisionList = result.data.Table;
    });
  }
  GetDepartment() {
    if (this.ProductionDetailsForm.get('division').value === '') {
      this.departmentList = [];
      this.ProductionDetailsForm.controls.deptCode.patchValue('');
    } else {
    this._mddService.GetMasterDataDetails('Dept', this.ProductionDetailsForm.get('division').value)
    .subscribe((result) => {
        this.departmentList = result.data.Table;
      });
    }
  }

}
