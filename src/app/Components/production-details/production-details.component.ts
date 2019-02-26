import { Component, OnInit, SimpleChanges, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorService } from 'src/app/Services/vendor.service';
import { VendorProduction } from 'src/app/Models/VendorProduction';
import { MasterDataDetailsService} from 'src/app/Services/master-data-details.service';
import { MasterDataDetails } from 'src/app/Models/master-data-details';
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
  isDisable = false;
  Division: string;
  Department: string;
  vendorcode: string;
  PhonePattern =  '^[0-9]{10}$';
  PinPattern = '^[1-9][0-9]{5}$';
  NumericPattern = '^[0-9]*$';
  DecimalPattern = '^[0-9]*[\.\]?[0-9][0-9]*$';
  vendorProductionList: VendorProduction[]; // For added Production List
  VendorProduction: VendorProduction; // For form value save and update
  totalItems: number;
  searchText = '';
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[] = [];
  ProductionDetailsForm: FormGroup;
  divisionList: any[];
  departmentList: any[];
  status = true;
  submitted = false;
  action = 'Insert';

  StateList:  MasterDataDetails[] = [];
  ngOnInit() {
    // this.openModal();
    this.openModal();
    this.GetStateList();
    this.GetDivisions();
    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
       this.GetVendorProduction(this.currentPage);
    });
  }
  SearchProductionDetails(searchText = '') {
    this.searchText = searchText;
    this.GetVendorProduction(1);
  }
   GetVendorProduction(index: number) {
    this.currentPage = index;
    this._vendorService.GetVendorProductionByVendorCode(this.vendorcode, this.currentPage, this.pageSize, this.searchText)
    .subscribe(result => {
      if (result.data.Table.length > 0) {
        this.vendorProductionList = result.data.Table;
        this.totalItems = result.data.Table1.TotalVendors;
        this.GetVendorsProductionList();
      } else {
        this.totalItems = 0 ;
      }
      });
  }

  GetStateList() {
    this._mddService.GetMasterDataDetails('STATE', '-1').subscribe(result => {
      this.StateList = result.data.Table;
    });
  }
  GetVendorsProductionList() {
    this.pager = this._pager.getPager(this.totalItems, this.currentPage, this.pageSize);
    this.pagedItems = this.vendorProductionList;
  }
  InitializeFormControls() {
    this.ProductionDetailsForm = this._fb.group({
      // id: ['0'],
      DivisionCode: [''],
      DeptCode: [''],
      approvedProductionUnits: [this.VendorProduction.ApprovedProductionCount],
      subContractingUnitName: [this.VendorProduction.SubContractingName],
      // subContractingUnitAddress: [this.VendorProduction.subContractingUnitAddress],
      natureOfSubContractingUnit: [this.VendorProduction.NatureOfSubContracting],
      monthlyCapacity: [this.VendorProduction.MonthlyCapacity],
      minimalCapacity: [this.VendorProduction.MinimalCapacity],
      leanMonths: [this.VendorProduction.LeanMonths],
      leanCapacity: [this.VendorProduction.LeanCapacity],
      address1: [this.VendorProduction.Address1],
      address2: [this.VendorProduction.Address2],
      address3: [this.VendorProduction.Address3],
      Phone: [this.VendorProduction.Phone],
      StateCode: [''],
      city: [this.VendorProduction.CityCode],
      pincode: [this.VendorProduction.Pin],
      remarks: [this.VendorProduction.Remarks]
    });
  }
  openModal() {
    this.isDisable = false;
    this.action = 'Insert';
     this.ProductionDetailsForm = this._fb.group({
      // id: ['0'],

      Division: ['', Validators.required],
      Department: ['', Validators.required],
      approvedProductionUnits: ['', [Validators.required, Validators.pattern(this.NumericPattern)]],
      subContractingUnitName: ['', Validators.required],
      // subContractingUnitAddress: ['', Validators.required],
      natureOfSubContractingUnit: ['', Validators.required],
      monthlyCapacity: ['', [Validators.required, Validators.pattern(this.DecimalPattern)]],
      minimalCapacity: ['', [Validators.required, Validators.pattern(this.DecimalPattern)]],
      leanMonths: ['', [Validators.required, Validators.pattern(this.NumericPattern)]],
      leanCapacity: ['', [Validators.required, Validators.pattern(this.DecimalPattern)]],
      address1: ['', Validators.required],
      address2: [''],
      address3: [''],
      Phone: ['', [Validators.required, Validators.pattern(this.PhonePattern)]],
      StateCode: ['', Validators.required],
      city: ['', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern(this.PinPattern)]],
      remarks: ['']
     });
  }
  dismiss() {
    this.ProductionDetailsForm = this._fb.group({
      // id: ['0'],
      Division: [''],
      Department: [''],
      approvedProductionUnits: [''],
      subContractingUnitName: [''],
      // subContractingUnitAddress: [''],
      natureOfSubContractingUnit: [''],
      monthlyCapacity: [''],
      minimalCapacity: [''],
      leanMonths: [''],
      leanCapacity: [''],
      address1: [''],
      address2: [''],
      address3: [''],
      Phone: [''],
      StateCode: [''],
      city: [''],
      pincode: [''],
      remarks: ['']
    });
    this.submitted = false;
    this.departmentList = [];
    // this.isDisabled = false;
  }

  GetDivisions() {
    this._mddService.GetMasterDataDetails('Division', '-1').subscribe((result) => {
      this.divisionList = result.data.Table;
    });
  }
  GetDepartment() {
    if (this.ProductionDetailsForm.get('Division').value === '') {
      this.departmentList = [];
      this.ProductionDetailsForm.controls.department.patchValue('');
    } else {
    this._mddService.GetMasterDataDetails('Dept', this.ProductionDetailsForm.get('Division').value)
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
    // this.VendorProduction.id = this.ProductionDetailsForm.get('id').value;
    this.VendorProduction.DivisionCode = this.ProductionDetailsForm.get('Division').value;
    this.VendorProduction.DeptCode = this.ProductionDetailsForm.get('Department').value;
    this.VendorProduction.VendorCode = this.vendorcode;
    this.VendorProduction.ApprovedProductionCount = this.ProductionDetailsForm.get('approvedProductionUnits').value;
    this.VendorProduction.SubContractingName = this.ProductionDetailsForm.get('subContractingUnitName').value;
    // this.VendorProduction.subContractingUnitAddress = this.ProductionDetailsForm.get('subContractingUnitAddress').value;
    this.VendorProduction.NatureOfSubContracting = this.ProductionDetailsForm.get('natureOfSubContractingUnit').value;
    this.VendorProduction.MonthlyCapacity = this.ProductionDetailsForm.get('monthlyCapacity').value;
    this.VendorProduction.MinimalCapacity = this.ProductionDetailsForm.get('minimalCapacity').value;
    this.VendorProduction.LeanMonths = this.ProductionDetailsForm.get('leanMonths').value;
    this.VendorProduction.LeanCapacity = this.ProductionDetailsForm.get('leanCapacity').value;
    this.VendorProduction.Address1 = this.ProductionDetailsForm.get('address1').value;
    this.VendorProduction.Address2 = this.ProductionDetailsForm.get('address2').value;
    this.VendorProduction.Address3 = this.ProductionDetailsForm.get('address3').value;
    this.VendorProduction.Phone = this.ProductionDetailsForm.get('Phone').value;
    this.VendorProduction.StateCode = this.ProductionDetailsForm.get('StateCode').value;
    this.VendorProduction.CityCode = this.ProductionDetailsForm.get('city').value;
    this.VendorProduction.Pin = this.ProductionDetailsForm.get('pincode').value;
    this.VendorProduction.Remarks = this.ProductionDetailsForm.get('remarks').value;
    this.VendorProduction.CreatedBy = 999999;
    this.VendorProduction.Action = this.action;

    this._vendorService.SaveProductionInfo(this.VendorProduction).subscribe((result) => {
       if (result.data.Table[0].Result === 0) {
       this.VendorProduction = new VendorProduction();
        this.ProductionDetailsForm.reset();
        this.InitializeFormControls();

        this.vendorProductionList = result.data.Table1;
        this.totalItems = result.data.Table2.TotalVendors;
        this.GetVendorsProductionList();
        this.departmentList = [];
        alert(result.data.Table[0].Message);
        $('#myModal').modal('toggle');
        this.dismiss();
       } else {
       alert(result.data.Table[0].Message);
       }
    });
  }

  GetProductionDetails(vendor: VendorProduction) {
this.action = 'Update';
this.isDisable = true;
    this._vendorService.GetProductionDetails(this.vendorcode, vendor.DivisionCode, vendor.DeptCode).subscribe((result) => {
      this.ProductionDetailsForm = this._fb.group({
        // id: [data.Table[0].id],
        Division: [result.data.Table[0].DivisionCode, Validators.required],
        Department: [result.data.Table[0].DeptCode, Validators.required],
        approvedProductionUnits: [result.data.Table[0].ApprovedProductionCount,
        [Validators.required, Validators.pattern(this.NumericPattern)]],
        subContractingUnitName: [result.data.Table[0].SubContractingName, Validators.required],
        natureOfSubContractingUnit: [result.data.Table[0].NatureOfSubContracting, Validators.required],
        monthlyCapacity: [result.data.Table[0].MonthlyCapacity, [Validators.required, Validators.pattern(this.DecimalPattern)]],
        minimalCapacity: [result.data.Table[0].MinimalCapacity, [Validators.required, Validators.pattern(this.DecimalPattern)]],
        leanMonths: [result.data.Table[0].LeanMonths, [Validators.required, Validators.pattern(this.NumericPattern)]],
        leanCapacity: [result.data.Table[0].LeanCapacity, [Validators.required, Validators.pattern(this.DecimalPattern)]],
        address1: [result.data.Table[0].Address1, Validators.required],
        address2: [result.data.Table[0].Address2],
        address3: [result.data.Table[0].Address3],
        Phone: [result.data.Table[0].Phone, [Validators.required, Validators.pattern(this.PhonePattern)]],
        StateCode: [result.data.Table[0].StateCode, Validators.required],
        city: [result.data.Table[0].CityCode, Validators.required],
        pincode: [result.data.Table[0].Pin, [Validators.required, Validators.pattern(this.PinPattern)]],
        remarks: [result.data.Table[0].Remarks]
      });
      this.GetDepartment();
    });
  }
}
