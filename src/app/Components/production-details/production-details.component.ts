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
  NumericPattern = '^[0-9]*$';
  vendorProductionList: VendorProduction[]; // For added Production List
  VendorProduction: VendorProduction; // For form value save and update
  totalItems: number;
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[];

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
       this.GetVendorProduction(this.currentPage);
    });

    this.GetDivisions();
  }
  GetVendorProduction(index: number) {
    this.currentPage = index;
    this._vendorService.GetVendorProductionByVendorCode(this.vendorcode, this.currentPage, this.pageSize).subscribe(data => {
      if (data.VendorProduction.length > 0) {
        this.vendorProductionList = data.VendorProduction;
        this.totalItems = data.VendorProductionCount[0].TotalVendors;
        this.GetVendorsProductionList();
      } else {
        this.totalItems = 0 ;
      }
      });
  }
  GetVendorsProductionList() {
    this.pager = this._pager.getPager(this.totalItems, this.currentPage, this.pageSize);
    this.pagedItems = this.vendorProductionList;
  //  alert(this.pagedItems.length);
  }
  InitializeFormControls() {
    this.ProductionDetailsForm = this._fb.group({
      id: ['0'],
      division: [''],
      department: ['-1'],
      approvedProductionUnits: [this.VendorProduction.approvedProductionUnits],
      subContractingUnitName: [this.VendorProduction.subContractingUnitName],
      // subContractingUnitAddress: [this.VendorProduction.subContractingUnitAddress],
      natureOfSubContractingUnit: [this.VendorProduction.natureOfSubContractingUnit],
      monthlyCapacity: [this.VendorProduction.monthlyCapacity],
      minimalCapacity: [this.VendorProduction.minimalCapacity],
      leanMonths: [this.VendorProduction.leanMonths],
      leanCapacity: [this.VendorProduction.leanCapacity]
    });
  }
  openModal() {
     this.ProductionDetailsForm = this._fb.group({
      id: ['0'],

      division: ['', Validators.required],
      department: ['-1', Validators.required],
      approvedProductionUnits: ['', Validators.required],
      subContractingUnitName: ['', Validators.required],
      // subContractingUnitAddress: ['', Validators.required],
      natureOfSubContractingUnit: ['', Validators.required],
      monthlyCapacity: ['', Validators.required],
      minimalCapacity: ['', Validators.required],
      leanMonths: ['', Validators.required],
      leanCapacity: ['', Validators.required]
     });
  }
  dismiss() {
    this.ProductionDetailsForm = this._fb.group({
      id: ['0'],
      division: [''],
      department: ['-1'],
      approvedProductionUnits: [''],
      subContractingUnitName: [''],
      // subContractingUnitAddress: [''],
      natureOfSubContractingUnit: [''],
      monthlyCapacity: [''],
      minimalCapacity: [''],
      leanMonths: [''],
      leanCapacity: ['']
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
      this.ProductionDetailsForm.controls.department.patchValue('');
    } else {
    this._mddService.GetMasterDataDetails('Dept', this.ProductionDetailsForm.get('division').value)
    .subscribe((result) => {
        this.departmentList = result.data.Table;
      });
    }
  }
  SaveProductionDetails() {
    this.submitted = true;
    if (this.ProductionDetailsForm.invalid) {
      return;
    }
    this.VendorProduction = new VendorProduction();
    this.VendorProduction.id = this.ProductionDetailsForm.get('id').value;
    this.VendorProduction.division = this.ProductionDetailsForm.get('division').value;
    this.VendorProduction.department = this.ProductionDetailsForm.get('department').value;
    this.VendorProduction.VendorCode = this.vendorcode;
    this.VendorProduction.approvedProductionUnits = this.ProductionDetailsForm.get('approvedProductionUnits').value;
    this.VendorProduction.subContractingUnitName = this.ProductionDetailsForm.get('subContractingUnitName').value;
    // this.VendorProduction.subContractingUnitAddress = this.ProductionDetailsForm.get('subContractingUnitAddress').value;
    this.VendorProduction.natureOfSubContractingUnit = this.ProductionDetailsForm.get('natureOfSubContractingUnit').value;
    this.VendorProduction.monthlyCapacity = this.ProductionDetailsForm.get('monthlyCapacity').value;
    this.VendorProduction.minimalCapacity = this.ProductionDetailsForm.get('minimalCapacity').value;
    this.VendorProduction.leanMonths = this.ProductionDetailsForm.get('leanMonths').value;
    this.VendorProduction.leanCapacity = this.ProductionDetailsForm.get('leanCapacity').value;
    this.VendorProduction.CreatedBy = 999999;

    console.log(JSON.stringify(this.VendorProduction));
    this._vendorService.SaveProductionInfo(this.VendorProduction).subscribe((data) => {
    //  if (data.Msg[0].Result === 0) {
       this.VendorProduction = new VendorProduction();
        this.ProductionDetailsForm.reset();
        this.InitializeFormControls();

        this.vendorProductionList = data.VendorProduction;
       // this.totalItems = data.VendorProductionCount[0].TotalVendors;
        this.GetVendorsProductionList();
        this.departmentList = [];
      //  alert(data.Msg[0].Message);
        $('#myModal').modal('toggle');
        this.dismiss();
      // } else {
      //  alert(data.Msg[0].Message);
      // }
    });
  }

  GetProductionDetails(x) {
    this._vendorService.GetProductionDetails(x).subscribe((data) => {
      this.ProductionDetailsForm = this._fb.group({
        id: [data.Table[0].id],
        division: [data.Table[0].division, Validators.required],
        department: [data.Table[0].department, Validators.required],
        approvedProductionUnits: [data.Table[0].approvedProductionUnits, Validators.required],
        subContractingUnitName: [data.Table[0].subContractingUnitName, Validators.required],
         // subContractingUnitAddress: [data.Table[0].subContractingUnitAddress, Validators.required],
        natureOfSubContractingUnit: [data.Table[0].natureOfSubContractingUnit, Validators.required],
        monthlyCapacity: [data.Table[0].monthlyCapacity, Validators.required],
        minimalCapacity: [data.Table[0].minimalCapacity, Validators.required],
        leanMonths: [data.Table[0].leanMonths, Validators.required],
        leanCapacity: [data.Table[0].leanCapacity, Validators.required],
      });
     // this.GetVendorDesignationForEdit();
    });
  }
}
