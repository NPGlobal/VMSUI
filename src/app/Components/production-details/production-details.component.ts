import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorService } from 'src/app/Services/vendor.service';
import { VendorProduction } from 'src/app/Models/VendorProduction';
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
    private _pager: PagerService
  ) {

  }
  
  vendorcode: string;
  NumericPattern = '^[0-9]*$';
  vendorProductionList: VendorProduction[]; // For added Staff List
  VendorProduction: VendorProduction; // For form value save and update
  totalItems: number;
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[];

  ProductionDetailsForm: FormGroup;
  divisionList: any[];
  deptList: any[];
  status = true;
  submitted = false;

  ngOnInit() {
    this.openModal();
    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      //this.GetVendorStaffs(this.currentPage);
    });
    this.GetDivision();
  }
  openModal() {
    this.ProductionDetailsForm = this._fb.group({
      id: ['0'],

      division: ['', Validators.required],
      department: ['-1'],

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
  }

  GetDivision(){

    
  }

}
