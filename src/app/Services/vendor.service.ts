import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vendor } from '../Models/vendor';

@Injectable({
  providedIn: 'root'
})
export class VendorService {

  origin = 'http://172.16.7.60/VMSApi/';
  // origin = 'http://172.16.7.68/';
  // origin = 'http://172.16.7.69/';
  // origin = 'https://localhost:44372/';
  constructor(private _http: HttpClient) { }

  GetVendors(pageIndex: number, Limit: number, searchText = ''): Observable<any> {
     const apiUrl = this.origin + 'api/Vendor/GetVendors/' + pageIndex + '/' + Limit + '/' + searchText;
     return this._http.get<any>(apiUrl);
  }

  GetVendorByCode(code: string): Observable<any> {
    const apiUrl = this.origin + 'api/Vendor/GetVendorByCode/' + code;
    return this._http.get<any>(apiUrl);
  }

  GetPHList(): Observable<any> {
    const apiUrl = this.origin + 'api/OrgUnit/GetPHList';
    return this._http.get<any>(apiUrl);
  }

  SaveVendorPrimaryInfo(vendor: Vendor): Observable<any> {
    const apiUrl = this.origin + 'api/Vendor/SaveVendorPrimaryData';
    return this._http.post<any>(apiUrl, vendor);
  }

  // Added by Shubhi

  // Used for save and update Vendor Staff Info
  SaveStaffInfo(VendorStaff: any): Observable<any> {
    const apiUrl = this.origin + 'api/VendorStaff/SaveVendorStaffInfo';
    return this._http.post<any>(apiUrl, VendorStaff);
  }
  // Used for save and update Vendor Technical Info
  SaveTechInfo(VendorTech: any): Observable<any> {
    const apiUrl = this.origin + 'api/VendorTech/SaveVendorTechInfo';
    return this._http.post<any>(apiUrl, VendorTech);
  }
  // For Vendor Staff Department
  GetVendorsDeptStaff(companycode: string, deptcode: string, vcode: string, type: string): Observable<any> {
    const apiUrl = this.origin + 'api/VendorStaff/GetVendorsDeptStaff/' + companycode + '/' + deptcode + '/' + vcode + '/' + type;
    return this._http.get<any>(apiUrl);
  }
  // For Vendor Staff Designation by Department
  GetVendorDesignation(companycode: string, deptcode: string, vcode: string, type: string): Observable<any> {
    const apiUrl = this.origin + 'api/VendorStaff/GetVendorsDeptStaff/' + companycode + '/' + deptcode + '/' + vcode + '/' + type;
    return this._http.get<any>(apiUrl);
  }
  // For Vendor Technical Department
  GetVendorDeptTech(companycode: string, deptcode: string, vcode: string, type: string): Observable<any> {
    const apiUrl = this.origin + 'api/VendorTech/GetVendorsDeptTech/' + companycode + '/' + deptcode + '/' + vcode + '/' + type;
    return this._http.get<any>(apiUrl);
  }
  // For Vendor Technical Specification by Department
  GetVendorTechSpec(companycode: string, deptcode: string, vcode: string, type: string): Observable<any> {
    const apiUrl = this.origin + 'api/VendorTech/GetVendorsDeptTech/' + companycode + '/' + deptcode + '/' + vcode + '/' + type;
    return this._http.get<any>(apiUrl);
  }
  // Get all Staff of a Vendor
  GetVendorStaffByVendorCode(vcode: string, pageIndex: number, Limit: number): Observable<any> {
    const apiUrl = this.origin + 'api/VendorStaff/GetVendorStaffByVendorCode/10/' + vcode + '/' + pageIndex + '/' + Limit;
    return this._http.get<any>(apiUrl);
  }
  // Get all Technical information of a Vendor
  GetVendorTechByVendorCode(vcode: string, pageIndex: number, Limit: number, searchText?: string): Observable<any> {
    const apiUrl = this.origin + 'api/VendorTech/GetVendorTechByVendorCode/10/'
    + vcode + '/' + pageIndex + '/' + Limit + '/' + searchText;
    return this._http.get<any>(apiUrl);
  }

  // Get Staff Information for Edit
  GetStaffDetails(id: number): Observable<any> {
    const apiUrl = this.origin + 'api/VendorStaff/GetStaffDetails/' + id;
    return this._http.get<any>(apiUrl);
  }
  // Get Technical Information for Edit
  GetTechDetails(id: number): Observable<any> {
    const apiUrl = this.origin + 'api/VendorTech/GetTechDetails/' + id;
    return this._http.get<any>(apiUrl);
  }

  SaveVendorPersonalDetails(PersonalDetails: Vendor): Observable<any> {
    const apiUrl = this.origin + 'api/Vendor/SaveVendorPersonalDetails';
    return this._http.post<any>(apiUrl, PersonalDetails);
  }

  SaveVendorAddress(VendorAddress: any): Observable<any> {
    const apiUrl = this.origin + 'api/Vendor/SaveVendorAddress';
    return this._http.post<any>(apiUrl, VendorAddress);
  }

  GetMasterVendorList(): Observable<any> {
    const apiUrl = this.origin + 'api/MasterVendor/GetMasterVendorList';
    return this._http.get<any>(apiUrl);
  }

  // Used for save and update Vendor Business Info
  SaveVendorBusinessInfo(VendorBusiness: any): Observable<any> {
    const apiUrl = this.origin + 'api/VendorBusiness/SaveVendorBusinessInfo';
    return this._http.post<any>(apiUrl, VendorBusiness);
  }
  // Get Vendor Business Information for Edit
  GetBusinessDetails(id: number): Observable<any> {
    const apiUrl = this.origin + 'api/VendorBusiness/GetBusinessDetails/' + id;
    return this._http.get<any>(apiUrl);
  }
  // Get all Staff of a Vendor
  GetVendorBusinessByVendorCode(vcode: string, pageIndex: number, Limit: number): Observable<any> {
    const apiUrl = this.origin + 'api/VendorBusiness/GetVendorBusinessByVendorCode/10/' + vcode + '/' + pageIndex + '/' + Limit;
    return this._http.get<any>(apiUrl);
  }
  // Used for save and update Vendor Production Info
  SaveProductionInfo(VendorProduction: any): Observable<any> {
    const apiUrl = this.origin + 'api/VendorProduction/SaveVendorProductionInfo';
    return this._http.post<any>(apiUrl, VendorProduction);
  }
  // Get all Production details of a vendor
  GetVendorProductionByVendorCode(vcode: string, pageIndex: number, Limit: number, searchText?: string): Observable<any> {
    const apiUrl = this.origin + 'api/VendorProduction/GetVendorProductionByVendorCode/10/'
      + vcode + '/' + pageIndex + '/' + Limit + '/' + searchText;
    return this._http.get<any>(apiUrl);
  }
  // Get Vendor Production Information for Edit
  GetProductionDetails(vcode: string, div: string, dept: string): Observable<any> {
    const apiUrl = this.origin + 'api/VendorProduction/GetProductionDetails/10/' + vcode + '/' + div + '/' + dept;
    return this._http.get<any>(apiUrl);
  }

  GetCurrencyList() {
    const apiUrl = this.origin + 'api/Vendor/GetCurrencyList';
    return this._http.get<any>(apiUrl);
  }

  GetAccountType() {
    const apiUrl = this.origin + 'api/Vendor/GetAccountType';
    return this._http.get<any>(apiUrl);
  }

}
