import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { VendorTech } from 'src/app/Models/VendorTech';
import { PagerService } from 'src/app/Services/pager.service';
import { VendorService } from 'src/app/Services/vendor.service';
// import { PagerService } from 'src/app/Services/pager.service';
import { HttpClient } from '@angular/common/http';
import { Vendor } from 'src/app/Models/vendor';
declare var $: any;

@Component({
  selector: 'app-technical-details',
  templateUrl: './technical-details.component.html',
  styleUrls: ['./technical-details.component.css']
})
export class TechnicalDetailsComponent implements OnInit {
  // NumericPattern = '^[.]+[0-9]*$';
  // NumericPattern = '^[0-9]*[\.\]?[0-9]*$';
   efficiencyPattern = /^(100(\.0{1,2})?|[1-9]?\d(\.\d{1,2})?)$/ ;
  // NumericPattern = '^[a-zA-Z0-9]*$';
  // unitCountList = [1, 2 , 3 , 4, 5 , 6 , , 198, 200];
  vendortechList: VendorTech[];
  vendorcode: string;
  VendorTech: VendorTech;
  techDetailsForm: FormGroup;
  deptList: any[];
  techSpecList: any[];
  status = true;
  submitted = false;
  totalItems: number;
  currentPage = 1;
  pageSize = 20;
  pager: any = {};
  pagedItems: any[];
  isLine = false;
  isEfficiency = false;
  unitCountList(n: number): any[] {
    return Array(n);
  }
  constructor(private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _pager: PagerService) { }

  ngOnInit() {
    // this.techDetailsForm = this._fb.group({
    //   id: ['0'],
    //   dept: ['', Validators.required],
    //   techSpec: ['', Validators.required],
    //   techLineNo: ['', Validators.required],
    //   efficiency: ['', Validators.pattern(this.efficiencyPattern)],
    //   unitCount: ['', Validators.required],
    //   status: true,
    //   remarks: '',
    //  });
    this.openModal();
    this._route.parent.paramMap.subscribe((data) => {
      this.vendorcode = (data.get('code'));
      this.GetVendorTech(this.currentPage);
    });
    this.GetVendorDepartments();
  }

  GetVendorTech(index: number) {
    this.currentPage = index;
    this._vendorService.GetVendorTechByVendorCode(this.vendorcode, this.currentPage, this.pageSize).subscribe(data => {
      this.vendortechList = data.VendorTech;
      this.totalItems = data.VendorTechCount[0].TotalVendors;
      this.GetVendorsTechList();
    });
  }
  GetVendorsTechList() {
    this.pager = this._pager.getPager(this.totalItems, this.currentPage, this.pageSize);
    this.pagedItems = this.vendortechList;
  }
  GetVendorDepartments() {
    this._vendorService.GetVendorDeptTech('10', '-1', this.vendorcode, 'Department').subscribe((data) => {
      this.deptList = data;
    });
  }
  GetVendorTechSpec() {
   // this.techDetailsForm.get('techSpec').value = '';
    if (this.techDetailsForm.get('dept').value === '') {
      this.techSpecList = [];
    } else {
    // console.log(this.techDetailsForm.get('dept').value);
    this._vendorService.GetVendorTechSpec('10', this.techDetailsForm.get('dept').value, this.vendorcode, 'TechSpec').subscribe((data) => {
      this.techSpecList = data;
      });
  }
}

  InitializeFormControls() {

    this.techDetailsForm = this._fb.group({
      id: ['0'],
      dept: [''],
      techSpec: [''],
      techLineNo: [this.VendorTech.TechLineNo],
      efficiency: [this.VendorTech.Efficiency],
      unitCount: [this.VendorTech.UnitCount],
      status: [this.VendorTech.Status],
      remarks: [this.VendorTech.Remarks],
     });
  }

  SaveTechDetails() {
    this.submitted = true;
     console.log(JSON.stringify(this.techDetailsForm.value));
    if (this.techDetailsForm.invalid) {
      return;
    }
    // console.log(JSON.stringify(this.addressForm));
    this.VendorTech = new VendorTech();
    this.VendorTech.VendorTechDetailsID =  this.techDetailsForm.get('id').value;
    this.VendorTech.VendorTechConfigID = this.techDetailsForm.get('techSpec').value;
    // this.VendorTech.VendorCode = this.personalDetailsForm.get('code').value;
    this.VendorTech.VendorCode = this.vendorcode;
    if (this.isLine === true ) {
    this.VendorTech.TechLineNo = this.techDetailsForm.get('techLineNo').value; }
    if (this.isEfficiency === true ) {
    this.VendorTech.Efficiency = this.techDetailsForm.get('efficiency').value; }
    this.VendorTech.UnitCount = this.techDetailsForm.get('unitCount').value;
    this.VendorTech.Status = this.techDetailsForm.get('status').value;
    this.VendorTech.Remarks = this.techDetailsForm.get('remarks').value;
    this.VendorTech.CreatedBy = 999999;
    this._vendorService.SaveTechInfo(this.VendorTech).subscribe((data) => {
      if (data.Msg[0].Result === 0) {
        this.VendorTech = new VendorTech();
        this.techDetailsForm.reset();
        this.InitializeFormControls();

        this.vendortechList = data.VendorTech;
        this.totalItems = data.VendorTechCount[0].TotalVendors;
        this.GetVendorsTechList();
        this.techSpecList = [];
        alert(data.Msg[0].Message);
        $('#myModal').modal('toggle');
        this.dismiss();
      } else {
        alert(data.Msg[0].Message);
        // added by shubhi
        this.dismiss();
      }
    });
  }
  openModal() {
    this.techDetailsForm = this._fb.group({
      id: ['0'],
      dept: ['', Validators.required],
      techSpec: ['', Validators.required],
      techLineNo: '',
      efficiency: ['', [Validators.pattern(this.efficiencyPattern), Validators.required]],
      unitCount: ['', Validators.required],
      status: true,
      remarks: '',
    });
  }
   dismiss() {
     this.techDetailsForm = this._fb.group({
       id: ['0'],
      dept: [''],
      techSpec: [''],
      techLineNo: [''],
      efficiency: [''],
      unitCount: [''],
      status: true,
      remarks: ''
     });
     this.isLine = false;
     this.isEfficiency = false;
    }

  GetTechDetails(x) {
    this._vendorService.GetTechDetails(x).subscribe((data) => {
      this.techDetailsForm = this._fb.group({
        id: [data.Table[0].VendorTechDetailsID],
        dept: [data.Table[0].VendorDept_MDDCode, Validators.required],
        techSpec: [data.Table[0].VendorTechConfigID, Validators.required],
        techLineNo: data.Table[0].TechLineNo,
        efficiency: [data.Table[0].Efficiency, [ Validators.pattern(this.efficiencyPattern), Validators.required]],
        unitCount: [data.Table[0].UnitCount, Validators.required],
        status: data.Table[0].Status = 'A' ? true : false,
        remarks: data.Table[0].Remarks
      });

      this.GetVendorTechSpec();
    });
  }

  specChange(event) {
    // alert(event.target.selectedOptions[0].attributes['data-line'].value);
    // alert(event.target.selectedOptions[0].attributes['data-efficiency'].value);
    this.techDetailsForm.controls.techLineNo.patchValue(event.target.selectedOptions[0].attributes['data-maxnumber'].value);
    this.isLine = (event.target.selectedOptions[0].attributes['data-line'].value === '1') ? true : false;
    this.isEfficiency = (event.target.selectedOptions[0].attributes['data-efficiency'].value === '1') ? true : false;
  }
}


