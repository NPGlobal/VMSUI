import { Component, OnInit, SimpleChanges, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorService } from 'src/app/Services/vendor.service';
import { VendorProduction } from 'src/app/Models/VendorProduction';
import { MasterDataDetailsService } from 'src/app/Services/master-data-details.service';
import { MasterDataDetails } from 'src/app/Models/master-data-details';
import { BusinessProduction } from 'src/app/Models/business-production';
import { Vendor } from 'src/app/Models/vendor';
import { VendorBusinessDetails } from 'src/app/Models/vendor-business-details';
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
  ) { }

  FinancialYearList: string[];

  //#region Pattern
  PhonePattern = '^[0-9]{10}$';
  PinPattern = '^[1-9][0-9]{5}$';
  CityPattern = '^[A-Za-z]+$';
  NumericPattern = '^[0-9]*$';
  DecimalPattern = '^[0-9]*[\.\]?[0-9][0-9]*$';
  //#endregion

  //#region Paging
  totalItems = 0;
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[] = [];
  //#endregion

  //#region Validation Message
  ValidationMessages = {
    'Division': {
      'required': ''
    },
    'Department': {
      'required': '',
    },
    'ApprovedProductionCount': {
      'required': '',
      'pattern': 'Only numbers allowed'
    },
    'SubContractingName': {
      'required': '',
      'pattern': 'Only numbers allowed'
    },
    'NatureOfSubContracting': {
      'required': ''
    },
    'MonthlyCapacity': {
      'required': '',
      'pattern': 'Only numbers/Decimals allowed'
    },
    'MinimalCapacity': {
      'required': '',
      'pattern': 'Only numbers/Decimals allowed'
    },
    'LeanMonths': {
      'required': '',
      'pattern': 'Only numbers allowed'
    },
    'LeanCapacity': {
      'required': '',
      'pattern': 'Only numbers/Decimals allowed'
    },
    'Address1': {
      'required': ''
    },
    'Phone': {
      'required': '',
      'pattern': 'Please enter a valid phone number'
    },
    'StateCode': {
      'required': ''
    },
    'CityCode': {
      'required': '',
      'pattern': 'Please enter a valid city'
    },
    'Pin': {
      'required': '',
      'pattern': 'Please enter a valid pincode'
    }
  };

  formErrors = {
    'Division': '',
    'Department': '',
    'ApprovedProductionCount': '',
    'SubContractingName': '',
    'NatureOfSubContracting': '',
    'MonthlyCapacity': '',
    'MinimalCapacity': '',
    'LeanMonths': '',
    'LeanCapacity': '',
    'Address1': '',
    'Phone': '',
    'StateCode': '',
    'CityCode': '',
    'Pin': '',
  };
  //#endregion

  //#region Modal Popup and Alert
  @ViewChild('alertModalButton')
  alertModalButton: ElementRef;
  PopUpMessage: string;
  alertButton: any;

  @ViewChild('modalOpenButton')
  modalOpenButton: ElementRef;

  @ViewChild('modalCloseButton')
  modalCloseBtn: ElementRef;
  modalCloseButton: HTMLElement;
  //#endregion

  //#region Form Variables
  vendorcode: string;
  submitted = false;
  searchText = '';
  divisionList: MasterDataDetails[]; // For Division List
  departmentList: MasterDataDetails[]; // For Department List
  StateList: MasterDataDetails[] = []; // For State List in Address Section of Production
  DropdownSettings = {}; // Used for multi drop down (Departmets) setting like how much selected record will be display etc.
  vendorProductionList: VendorProduction[]; // For added Production List which is display on landing page.
  SelectedDepartmentList: any[];
  //#endregion
  // // status = true;
  // action = 'Insert';
  // modalBody: string;
  BusinessProdData: BusinessProduction;
  BusinessProd: BusinessProduction; // It holds array for Business Form Data and Production Form Data.
  ProductionDetailsForm: FormGroup;
  VendorProduction: VendorProduction; // For form value save and update

  //#endregion

  ngOnInit() {
    this.BusinessProdData = new BusinessProduction();
    this.BusinessProdData.BusinessDetails = [];
    this.BusinessProdData.ProductionDetails = [];
    this.BindFinancialYearDropDown();
    this.VendorProduction = new VendorProduction();
    this.PopUpMessage = '';
    this.alertButton = this.alertModalButton.nativeElement as HTMLElement;
    this.openModal();

    this.modalCloseButton = this.modalCloseBtn.nativeElement as HTMLElement;

    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorProduction(this.currentPage);
    });

    this.DropDownSettings();
    this.GetDivisions();
    this.GetStateList();
  }

  //#region Form Initialization and Validation
  InitializeFormControls() {
    this.ProductionDetailsForm = this._fb.group({
      Division: ['', Validators.required],
      ApprovedProductionCount: [this.VendorProduction.ApprovedProductionCount,
      [Validators.required, Validators.pattern(this.NumericPattern)]],
      SubContractingName: [this.VendorProduction.SubContractingName, Validators.required],
      NatureOfSubContracting: [this.VendorProduction.NatureOfSubContracting, Validators.required],
      Address1: [this.VendorProduction.Address1, Validators.required],
      Address2: [this.VendorProduction.Address2],
      Address3: [this.VendorProduction.Address3],
      Phone: [this.VendorProduction.Phone, [Validators.required, Validators.pattern(this.PhonePattern)]],
      StateCode: [this.VendorProduction.StateCode, Validators.required],
      CityCode: [this.VendorProduction.CityCode, [Validators.required, Validators.pattern(this.CityPattern)]],
      Pin: [this.VendorProduction.Pin, [Validators.required, Validators.pattern(this.PinPattern)]],
      MonthlyCapacity: [this.VendorProduction.MonthlyCapacity, [Validators.required, Validators.pattern(this.DecimalPattern)]],
      MinimalCapacity: [this.VendorProduction.MinimalCapacity, [Validators.required, Validators.pattern(this.DecimalPattern)]],
      LeanMonths: [this.VendorProduction.LeanMonths, [Validators.required, Validators.pattern(this.NumericPattern)]],
      LeanCapacity: [this.VendorProduction.LeanCapacity, [Validators.required, Validators.pattern(this.DecimalPattern)]],
      Remarks: [this.VendorProduction.Remarks]
    });
    this.ProductionDetailsForm.valueChanges.subscribe((data) => {
      this.LogValidationErrors(this.ProductionDetailsForm);
    });
  }
  LogValidationErrors(group: FormGroup = this.ProductionDetailsForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.LogValidationErrors(abstractControl);
      } else {
        this.formErrors[key] = '';
        if (this.submitted || (abstractControl && !abstractControl.valid &&
          (abstractControl.touched || abstractControl.dirty))) {
          const messages = this.ValidationMessages[key];
          for (const errorkey in abstractControl.errors) {
            if (errorkey) {
              this.formErrors[key] += messages[errorkey] + ' ';
            }
          }
        }
      }
    });
  }
  //#endregion

  //#region Open and Dismiss Modal
  openModal() {
    // this.isDisable = false;
    // this.action = 'Insert';
    // this.ProductionDetailsForm = this._fb.group({
    //   Division: ['', Validators.required],
    //   Department: ['', Validators.required],
    //   approvedProductionUnits: ['', [Validators.required, Validators.pattern(this.NumericPattern)]],
    //   subContractingUnitName: ['', Validators.required],
    //   natureOfSubContractingUnit: ['', Validators.required],
    //   monthlyCapacity: ['', [Validators.required, Validators.pattern(this.DecimalPattern)]],
    //   minimalCapacity: ['', [Validators.required, Validators.pattern(this.DecimalPattern)]],
    //   leanMonths: ['', [Validators.required, Validators.pattern(this.NumericPattern)]],
    //   leanCapacity: ['', [Validators.required, Validators.pattern(this.DecimalPattern)]],
    //   address1: ['', Validators.required],
    //   address2: [''],
    //   address3: [''],
    //   Phone: ['', [Validators.required, Validators.pattern(this.PhonePattern)]],
    //   StateCode: ['', Validators.required],
    //   city: ['', [Validators.required, Validators.pattern(this.CityPattern)]],
    //   pincode: ['', [Validators.required, Validators.pattern(this.PinPattern)]],
    //   remarks: [''],
    //   status: true
    // });
    // this.ProductionDetailsForm.valueChanges.subscribe((data) => {
    //   this.LogValidationErrors(this.ProductionDetailsForm);
    // });
    this.InitializeFormControls();
  }

  dismiss() {
    this.departmentList = [];
    this.SelectedDepartmentList = [];
    this.BusinessProdData.BusinessDetails = [];
    this.modalCloseButton.click();
    this.submitted = false;
    this.VendorProduction = new VendorProduction();
    this.ProductionDetailsForm.reset();
    this.InitializeFormControls();
  }
  //#endregion

  //#region Data Binding
  GetVendorProduction(index: number) {
    this.currentPage = index;
    this._vendorService.GetVendorProductionByVendorCode(this.vendorcode, this.currentPage, this.pageSize, this.searchText)
      .subscribe(result => {
        this.BusinessProd = new BusinessProduction();
        this.BusinessProd.ProductionDetails = result.data.Table;
        this.BusinessProd.BusinessDetails = [];
        this.totalItems = result.data.Table1[0].TotalVendors;
        this.GetVendorsProductionList();

      });
  }
  GetVendorsProductionList() {
    this.pager = this._pager.getPager(this.totalItems, this.currentPage, this.pageSize);
    this.pagedItems = this.BusinessProd.ProductionDetails;
  }
  SearchProductionDetails(searchText = '') {
    this.searchText = searchText;
    this.GetVendorProduction(1);
  }
  DropDownSettings() {
    this.DropdownSettings = {
      singleSelection: false,
      idField: 'MDDCode',
      textField: 'MDDName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      limitSelection: 100,
      noDataAvailablePlaceholderText: '',
      allowSearchFilter: true
    };
  }
  GetDivisions() {
    this._mddService.GetMasterDataDetails('Division', '-1').subscribe((result) => {
      this.divisionList = result.data.Table;
    });
  }
  GetDepartment() {
    if (this.ProductionDetailsForm.get('Division').value === '') {
      this.departmentList = [];
      this.ProductionDetailsForm.controls.Department.patchValue('');
    } else {
      this._mddService.GetMasterDataDetails('Dept', this.ProductionDetailsForm.get('Division').value)
        .subscribe((result) => {
          this.departmentList = result.data.Table;
        });
    }
  }
  GetStateList() {
    this._mddService.GetMasterDataDetails('STATE', '-1').subscribe(result => {
      this.StateList = result.data.Table;
    });
  }
  //#endregion

  //#region Create Business Form on Select/DeSelect of Department

  BindFinancialYearDropDown() {
    const date = new Date();
    const month = date.getMonth() + 1;
    let currentYear = date.getFullYear();
    this.FinancialYearList = [];
    if (month <= 3) {
      currentYear -= 1;
      this.FinancialYearList.push(currentYear + '-' + (currentYear + 1).toString().substr(2, 2));
      currentYear += 1;
      this.FinancialYearList.push(currentYear + '-' + (currentYear + 1).toString().substr(2, 2));
    } else {
      currentYear += 1;
      this.FinancialYearList.push(currentYear + '-' + (currentYear + 1).toString().substr(2, 2));
      currentYear += 1;
      this.FinancialYearList.push(currentYear + '-' + (currentYear + 1).toString().substr(2, 2));
    }
  }

  CreateBusinessForm(event: any) {
    // Business Details
    const business = new VendorBusinessDetails();
    business.CompanyCode = '10';
    business.VendorShortCode = this.vendorcode;
    business.VendorBusinessDetailsID = 0;
    business.DeptCode = event.MDDCode;
    business.DivisionCode = this.ProductionDetailsForm.get('Division').value;
    business.DeptName = event.MDDName;
    business.Status = 'A';
    if (this.BusinessProd.BusinessDetails === undefined) {
      this.BusinessProd.BusinessDetails = [];
    }
    this.BusinessProdData.BusinessDetails.push(business);

    // Production Details
    const prod = new VendorProduction();
    prod.VendorShortCode = this.vendorcode;
    prod.CompanyCode = '10';
    prod.DivisionCode = this.ProductionDetailsForm.get('Division').value;
    prod.DeptCode = event.MDDCode;
    prod.Status = 'A';
    this.BusinessProdData.ProductionDetails.push(prod);
  }

  RemoveBussinessDetails(event: any) {
    // Remove Business Detail
    const busIndex = this.BusinessProdData.BusinessDetails.findIndex((obj) =>
      obj.DeptCode === event.MDDCode);
    if (busIndex >= 0) {
      this.BusinessProdData.BusinessDetails.splice(busIndex, 1);
    }

    // Remove Production Detail
    const prodIndex = this.BusinessProdData.ProductionDetails.findIndex((obj) =>
      obj.DeptCode === event.MDDCode);
    if (prodIndex >= 0) {
      this.BusinessProdData.BusinessDetails.splice(prodIndex, 1);
    }
  }
  //#endregion

  SaveProductionDetails() {
    this.submitted = true;

    if (this.ProductionDetailsForm.invalid) {
      this.LogValidationErrors();
      return;
    }

    const prodObj = new VendorProduction();
    prodObj.ApprovedProductionCount = this.ProductionDetailsForm.get('ApprovedProductionCount').value;
    prodObj.SubContractingName = this.ProductionDetailsForm.get('SubContractingName').value;
    prodObj.NatureOfSubContracting = this.ProductionDetailsForm.get('NatureOfSubContracting').value;
    prodObj.Address1 = this.ProductionDetailsForm.get('Address1').value;
    prodObj.Address2 = this.ProductionDetailsForm.get('Address2').value;
    prodObj.Address3 = this.ProductionDetailsForm.get('Address3').value;
    prodObj.Phone = this.ProductionDetailsForm.get('Phone').value;
    prodObj.StateCode = this.ProductionDetailsForm.get('StateCode').value;
    prodObj.CityCode = this.ProductionDetailsForm.get('CityCode').value;
    prodObj.Pin = this.ProductionDetailsForm.get('Pin').value;
    prodObj.MonthlyCapacity = Number(this.ProductionDetailsForm.get('MonthlyCapacity').value);
    prodObj.MinimalCapacity = Number(this.ProductionDetailsForm.get('MinimalCapacity').value);
    prodObj.LeanMonths = Number(this.ProductionDetailsForm.get('LeanMonths').value);
    prodObj.LeanCapacity = Number(this.ProductionDetailsForm.get('LeanCapacity').value);
    prodObj.Remarks = this.ProductionDetailsForm.get('Remarks').value;


    this.BusinessProdData.ProductionDetails.filter(data => {
      data.ApprovedProductionCount = prodObj.ApprovedProductionCount;
      data.SubContractingName = prodObj.SubContractingName;
      data.NatureOfSubContracting = prodObj.NatureOfSubContracting;
      data.Address1 = prodObj.Address1;
      data.Address2 = prodObj.Address2;
      data.Address3 = prodObj.Address3;
      data.Phone = prodObj.Phone;
      data.StateCode = prodObj.StateCode;
      data.CityCode = prodObj.CityCode;
      data.Pin = prodObj.Pin;
      data.MonthlyCapacity = prodObj.MonthlyCapacity;
      data.MinimalCapacity = prodObj.MonthlyCapacity;
      data.LeanMonths = prodObj.LeanMonths;
      data.LeanCapacity = prodObj.LeanCapacity;
      prodObj.Remarks = prodObj.Remarks;
    });

    this.BusinessProdData.BusinessDetails.filter(data => {
      data.ProposedDPGrnQty = Number(data.ProposedDPGrnQty);
      data.ProposedDPValueQty = Number(data.ProposedDPValueQty);
      data.ProposedJWGrnQty = Number(data.ProposedJWGrnQty);
      data.ProposedJWValueQty = Number(data.ProposedJWValueQty);
    });

    console.log(this.BusinessProdData);
    try {
      this._vendorService.SaveBusinessProductionInfo(this.BusinessProdData).subscribe((result) => {
        if (result.data.Table[0].Result === 0) {

          this.vendorProductionList = result.data.Table1;
          this.totalItems = result.data.Table2[0].TotalVendors;
          this.GetVendorsProductionList();
          this.PopUpMessage = result.data.Table[0].Message;
        } else {
          // alert(result.data.Table[0].Message);
          this.PopUpMessage = result.data.Table[0].Message;
        }
      });
    } catch {
      this.PopUpMessage = 'There are some technical error. Please contact administrator.';
    }
    this.alertButton.click();
  }

  GetProductionDetails(vendor: VendorProduction) {

    this.VendorProduction = new VendorProduction();
    this.VendorProduction = JSON.parse(JSON.stringify(vendor));
    this.InitializeFormControls();
  }
  // DeleteProductionDetailsPopup(vendor) {
  //   this.ProductionDetailsForm = this._fb.group({
  //     Division: [vendor.DivisionCode, Validators.required],
  //     Department: [vendor.DeptCode, Validators.required],
  //     approvedProductionUnits: [vendor.ApprovedProductionCount, [Validators.required, Validators.pattern(this.NumericPattern)]],
  //     subContractingUnitName: [vendor.SubContractingName, Validators.required],
  //     natureOfSubContractingUnit: [vendor.NatureOfSubContracting, Validators.required],
  //     monthlyCapacity: [vendor.MonthlyCapacity, [Validators.required, Validators.pattern(this.DecimalPattern)]],
  //     minimalCapacity: [vendor.MinimalCapacity, [Validators.required, Validators.pattern(this.DecimalPattern)]],
  //     leanMonths: [vendor.LeanMonths, [Validators.required, Validators.pattern(this.NumericPattern)]],
  //     leanCapacity: [vendor.LeanCapacity, [Validators.required, Validators.pattern(this.DecimalPattern)]],
  //     address1: [vendor.Address1, Validators.required],
  //     address2: [vendor.Address2],
  //     address3: [vendor.Address3],
  //     Phone: [vendor.Phone, [Validators.required, Validators.pattern(this.PhonePattern)]],
  //     StateCode: [vendor.StateCode, Validators.required],
  //     city: [vendor.CityCode, [Validators.required, Validators.pattern(this.CityPattern)]],
  //     pincode: [vendor.Pin, [Validators.required, Validators.pattern(this.PinPattern)]],
  //     remarks: [vendor.Remarks],
  //     status: vendor.Status = 'A' ? true : false
  //   });
  // }
  // DeleteProductionDetails() {
  //   this.action = 'update';
  //   const el = this.modalOpenButton.nativeElement as HTMLElement;
  //   //  if (confirm('Are you sure ? If yes,This record will no longer be available in the system.')) {
  //   this.VendorProduction = new VendorProduction();
  //   this.VendorProduction.DivisionCode = this.ProductionDetailsForm.get('Division').value;
  //   this.VendorProduction.DeptCode = this.ProductionDetailsForm.get('Department').value;
  //   this.VendorProduction.VendorShortCode = this.vendorcode;
  //   this.VendorProduction.ApprovedProductionCount = this.ProductionDetailsForm.get('approvedProductionUnits').value;
  //   this.VendorProduction.SubContractingName = this.ProductionDetailsForm.get('subContractingUnitName').value;
  //   this.VendorProduction.NatureOfSubContracting = this.ProductionDetailsForm.get('natureOfSubContractingUnit').value;
  //   this.VendorProduction.MonthlyCapacity = this.ProductionDetailsForm.get('monthlyCapacity').value;
  //   this.VendorProduction.MinimalCapacity = this.ProductionDetailsForm.get('minimalCapacity').value;
  //   this.VendorProduction.LeanMonths = this.ProductionDetailsForm.get('leanMonths').value;
  //   this.VendorProduction.LeanCapacity = this.ProductionDetailsForm.get('leanCapacity').value;
  //   this.VendorProduction.Address1 = this.ProductionDetailsForm.get('address1').value;
  //   this.VendorProduction.Address2 = this.ProductionDetailsForm.get('address2').value;
  //   this.VendorProduction.Address3 = this.ProductionDetailsForm.get('address3').value;
  //   this.VendorProduction.Phone = this.ProductionDetailsForm.get('Phone').value;
  //   this.VendorProduction.StateCode = this.ProductionDetailsForm.get('StateCode').value;
  //   this.VendorProduction.CityCode = this.ProductionDetailsForm.get('city').value;
  //   this.VendorProduction.Pin = this.ProductionDetailsForm.get('pincode').value;
  //   this.VendorProduction.Remarks = this.ProductionDetailsForm.get('remarks').value;
  //   this.VendorProduction.CreatedBy = 999999;
  //   this.VendorProduction.Action = this.action;
  //   this.VendorProduction.Status = false;
  //   try {
  //     this._vendorService.SaveProductionInfo(this.VendorProduction).subscribe((result) => {
  //       if (result.data.Table[0].Message != null) {
  //         if (result.data.Table[0].Result === 0) {
  //           this.VendorProduction = new VendorProduction();
  //           this.vendorProductionList = result.data.Table1;
  //           this.totalItems = result.data.Table2[0].TotalVendors;
  //           this.InitializeFormControls();
  //           this.GetVendorsProductionList();
  //           this.departmentList = [];
  //           this.modalBody = result.data.Table[0].Message;
  //           // alert(data.Msg[0].Message);
  //           $('#deleteModal').modal('toggle');
  //           this.dismiss();
  //         } else {
  //           this.modalBody = result.data.Table[0].Message;
  //           //  alert(data.Msg[0].Message);
  //         }
  //       } else {
  //         this.modalBody = 'There are some technical error. Please contact administrator.';
  //         //  alert('There are some technical error. Please contact administrator.');
  //       }
  //     });
  //   } catch {
  //     this.modalBody = 'There are some technical error. Please contact administrator.';
  //     // alert('There are some technical error. Please contact administrator.');
  //   }
  //   el.click();
  // }
}
