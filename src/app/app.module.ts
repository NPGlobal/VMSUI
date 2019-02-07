import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

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
import { HttpClientModule } from '@angular/common/http';
import { Vendor } from './Models/vendor';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { BusinessDetailsComponent } from './Components/business-details/business-details.component';
import { ProductionDetailsComponent } from './Components/production-details/production-details.component';
import { DocumentComponent } from './Components/document/document.component';
import { VendorRegistrationComponent } from './Components/vendor-registration/vendor-registration.component';
import { AddressFormComponent } from './Components/address-form/address-form.component';


@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    VendorListComponent,
    PersonalDetailsComponent,
    StaffDetailsComponent,
    TechnicalDetailsComponent,
    AddVendorComponent,
    PageNotFoundComponent,
    BusinessDetailsComponent,
    ProductionDetailsComponent,
    DocumentComponent,
    VendorRegistrationComponent,
    AddressFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularFontAwesomeModule
  ],
  providers: [Vendor],
  bootstrap: [AppComponent]
})
export class AppModule { }
