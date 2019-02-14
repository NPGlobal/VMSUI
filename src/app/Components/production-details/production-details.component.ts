import { Component, OnInit } from '@angular/core';
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
  action = 'Insert';
  CountryList:  MasterDataDetails[] = [];
  StateList:  MasterDataDetails[] = [];

  ngOnInit() {
    // this.openModal();
    this.openModal();
    this.GetCountryList();
    this.GetStateList();
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
  GetCountryList() {
    this._mddService.GetMasterDataDetails('COUNTRY', '-1').subscribe((result) => {
      this.CountryList = result.data.Table.filter(x => x.MDDName === 'India');
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
  //  alert(this.pagedItems.length);
  }
  InitializeFormControls() {
    this.ProductionDetailsForm = this._fb.group({
      // id: ['0'],
      Division: [''],
      Department: ['-1'],
      approvedProductionUnits: [this.VendorProduction.ApprovedProductionUnits],
      subContractingUnitName: [this.VendorProduction.SubContractingUnitName],
      // subContractingUnitAddress: [this.VendorProduction.subContractingUnitAddress],
      natureOfSubContractingUnit: [this.VendorProduction.NatureOfSubContractingUnit],
      monthlyCapacity: [this.VendorProduction.MonthlyCapacity],
      minimalCapacity: [this.VendorProduction.MinimalCapacity],
      leanMonths: [this.VendorProduction.LeanMonths],
      leanCapacity: [this.VendorProduction.LeanCapacity],
      address1: [this.VendorProduction.Address1],
      address2: [this.VendorProduction.Address2],
      address3: [this.VendorProduction.Address3],
      CountryCode: [this.VendorProduction.CountryCode],
      StateCode: [this.VendorProduction.StateCode],
      city: [this.VendorProduction.City],
      pincode: [this.VendorProduction.Pincode],
      remarks: [this.VendorProduction.Remarks]
    });
  }
  openModal() {
    this.action = 'Insert';
     this.ProductionDetailsForm = this._fb.group({
      // id: ['0'],

      Division: ['', Validators.required],
      Department: ['-1', Validators.required],
      approvedProductionUnits: ['', Validators.required],
      subContractingUnitName: ['', Validators.required],
      // subContractingUnitAddress: ['', Validators.required],
      natureOfSubContractingUnit: ['', Validators.required],
      monthlyCapacity: ['', Validators.required],
      minimalCapacity: ['', Validators.required],
      leanMonths: ['', Validators.required],
      leanCapacity: ['', Validators.required],
      address1: ['', Validators.required],
      address2: [''],
      address3: [''],
      CountryCode: ['', Validators.required],
      StateCode: ['', Validators.required],
      city: ['', Validators.required],
      pincode: ['', Validators.required],
      remarks: ['']
     });
  }
  dismiss() {
    this.ProductionDetailsForm = this._fb.group({
      // id: ['0'],
      Division: [''],
      Department: ['-1'],
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
      CountryCode: [''],
      StateCode: [''],
      city: [''],
      pincode: [''],
      remarks: ['']
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
    this.VendorProduction.Division = this.ProductionDetailsForm.get('Division').value;
    this.VendorProduction.Department = this.ProductionDetailsForm.get('Department').value;
    this.VendorProduction.VendorCode = this.vendorcode;
    this.VendorProduction.ApprovedProductionUnits = this.ProductionDetailsForm.get('approvedProductionUnits').value;
    this.VendorProduction.SubContractingUnitName = this.ProductionDetailsForm.get('subContractingUnitName').value;
    // this.VendorProduction.subContractingUnitAddress = this.ProductionDetailsForm.get('subContractingUnitAddress').value;
    this.VendorProduction.NatureOfSubContractingUnit = this.ProductionDetailsForm.get('natureOfSubContractingUnit').value;
    this.VendorProduction.MonthlyCapacity = this.ProductionDetailsForm.get('monthlyCapacity').value;
    this.VendorProduction.MinimalCapacity = this.ProductionDetailsForm.get('minimalCapacity').value;
    this.VendorProduction.LeanMonths = this.ProductionDetailsForm.get('leanMonths').value;
    this.VendorProduction.LeanCapacity = this.ProductionDetailsForm.get('leanCapacity').value;
    this.VendorProduction.Address1 = this.ProductionDetailsForm.get('address1').value;
    this.VendorProduction.Address2 = this.ProductionDetailsForm.get('address2').value;
    this.VendorProduction.Address3 = this.ProductionDetailsForm.get('address3').value;
    this.VendorProduction.CountryCode = this.ProductionDetailsForm.get('CountryCode').value;
    this.VendorProduction.StateCode = this.ProductionDetailsForm.get('StateCode').value;
    this.VendorProduction.City = this.ProductionDetailsForm.get('city').value;
    this.VendorProduction.Pincode = this.ProductionDetailsForm.get('pincode').value;
    this.VendorProduction.Remarks = this.ProductionDetailsForm.get('remarks').value;
    this.VendorProduction.CreatedBy = 999999;
    this.VendorProduction.Action = this.action;

    console.log(JSON.stringify(this.VendorProduction));
    // this._vendorService.SaveProductionInfo(this.VendorProduction).subscribe((data) => {
    //    if (data.Msg[0].Result === 0) {
    //    this.VendorProduction = new VendorProduction();
    //     this.ProductionDetailsForm.reset();
    //     this.InitializeFormControls();

    //     this.vendorProductionList = data.VendorProduction;
    //     this.totalItems = data.VendorProductionCount[0].TotalVendors;
    //     this.GetVendorsProductionList();
    //     this.departmentList = [];
    //     alert(data.Msg[0].Message);
    //     $('#myModal').modal('toggle');
    //     this.dismiss();
    //    } else {
    //    alert(data.Msg[0].Message);
    //    }
    // });
  }

  GetProductionDetails(x) {
this.action = 'Update';
    this._vendorService.GetProductionDetails(x).subscribe((data) => {
      this.ProductionDetailsForm = this._fb.group({
        // id: [data.Table[0].id],
        Division: [data.Table[0].Division, Validators.required],
        Department: [data.Table[0].Department, Validators.required],
        approvedProductionUnits: [data.Table[0].approvedProductionUnits, Validators.required],
        subContractingUnitName: [data.Table[0].subContractingUnitName, Validators.required],
         // subContractingUnitAddress: [data.Table[0].subContractingUnitAddress, Validators.required],
        natureOfSubContractingUnit: [data.Table[0].natureOfSubContractingUnit, Validators.required],
        monthlyCapacity: [data.Table[0].monthlyCapacity, Validators.required],
        minimalCapacity: [data.Table[0].minimalCapacity, Validators.required],
        leanMonths: [data.Table[0].leanMonths, Validators.required],
        leanCapacity: [data.Table[0].leanCapacity, Validators.required],
        address1: [data.Table[0].address1, Validators.required],
        address2: [data.Table[0].address1],
        address3: [data.Table[0].address1],
        CountryCode: [data.Table[0].CountryCode, Validators.required],
        StateCode: [data.Table[0].StateCode, Validators.required],
        city: [data.Table[0].city, Validators.required],
        pincode: [data.Table[0].pincode, Validators.required],
        remarks: [data.Table[0].remarks]
      });
     // this.GetVendorDesignationForEdit();
    });
  }
}
