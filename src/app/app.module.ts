import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './Components/layout/layout.component';
import { VendorListComponent } from './Components/vendor-list/vendor-list.component';
import { StaffDetailsComponent } from './Components/staff-details/staff-details.component';
import { TechnicalDetailsComponent } from './Components/technical-details/technical-details.component';
import { AddVendorComponent } from './Components/add-vendor/add-vendor.component';
import { PersonalDetailsComponent } from './Components/personal-details/personal-details.component';
import { PageNotFoundComponent } from './Components/page-not-found/page-not-found.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Vendor } from './Models/vendor';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { ProductionDetailsComponent } from './Components/production-details/production-details.component';
import { DocumentComponent } from './Components/document/document.component';
import { VendorRegistrationComponent } from './Components/vendor-registration/vendor-registration.component';
import { AddressFormComponent } from './Components/address-form/address-form.component';
import { HttpErrorInterceptor } from './Interceptors/http-error-interceptor';
import { CustomErrorHandlerService } from './Services/custom-error-handler.service';
import { BankDetailsComponent } from './Components/bank-details/bank-details.component';
import { LoginComponent } from './Components/login/login.component';
import { WelcomeComponent } from './Components/welcome/welcome.component';
import { LoginModule } from './LoginModule/login.module';
import { CommonModule } from '@angular/common';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { BusinessDetailsComponent } from './Components/business-details/business-details.component';
import { DepartmentMappingComponent } from './Components/department-mapping/department-mapping.component';
import { DepartmentMappingNewComponent } from './Components/department-mapping-new/department-mapping-new.component';
import { VendorAssessmentComponent } from './Components/vendor-assessment/vendor-assessment.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { VendorAssessmentNewComponent } from './Components/vendor-assessment-new/vendor-assessment-new.component';
import { TechLineReportComponent } from './Components/tech-line-report/tech-line-report.component';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';

@NgModule({
  declarations: [
    AppComponent,
    BusinessDetailsComponent,
    LayoutComponent,
    VendorListComponent,
    PersonalDetailsComponent,
    StaffDetailsComponent,
    TechnicalDetailsComponent,
    AddVendorComponent,
    PageNotFoundComponent,
    ProductionDetailsComponent,
    DocumentComponent,
    VendorRegistrationComponent,
    AddressFormComponent,
    BankDetailsComponent,
    LoginComponent,
    WelcomeComponent,
    DepartmentMappingComponent,
    DepartmentMappingNewComponent,
    VendorAssessmentComponent,
    VendorAssessmentNewComponent,
    TechLineReportComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularFontAwesomeModule,
    LoginModule,
    NgMultiSelectDropDownModule.forRoot(),
    CommonModule,
    NgxSpinnerModule,
    SelectDropDownModule,
    AngularMultiSelectModule
  ],
  providers: [
    {
      provide: ErrorHandler,
      useClass: CustomErrorHandlerService
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    Vendor
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
