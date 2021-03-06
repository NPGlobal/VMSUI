import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VendorListComponent } from './Components/vendor-list/vendor-list.component';
import { AddVendorComponent } from './Components/add-vendor/add-vendor.component';
import { PersonalDetailsComponent } from './Components/personal-details/personal-details.component';
import { StaffDetailsComponent } from './Components/staff-details/staff-details.component';
import { TechnicalDetailsComponent } from './Components/technical-details/technical-details.component';
import { PageNotFoundComponent } from './Components/page-not-found/page-not-found.component';
import { BusinessDetailsComponent } from './Components/business-details/business-details.component';
import { ProductionDetailsComponent } from './Components/production-details/production-details.component';
import { DocumentComponent } from './Components/document/document.component';
import { BankDetailsComponent } from './Components/bank-details/bank-details.component';
import { LoginComponent } from './Components/login/login.component';
import { WelcomeComponent } from './Components/welcome/welcome.component';
import { AddressFormComponent } from './Components/address-form/address-form.component';
import { DepartmentMappingNewComponent } from './Components/department-mapping-new/department-mapping-new.component';
import { LayoutComponent } from './Components/layout/layout.component';
import { VendorAssessmentNewComponent } from './Components/vendor-assessment-new/vendor-assessment-new.component';
import { TechLineReportComponent } from './Components/tech-line-report/tech-line-report.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'welcome',
    component: WelcomeComponent
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'vendor/assessment',
        component: VendorAssessmentNewComponent
      },
      {
        path: 'vendor', component: VendorListComponent
      },
      { path: '', redirectTo: 'vendor', pathMatch: 'full' },
      {
        path: 'vendor/:code', component: AddVendorComponent,
        children: [
          { path: 'personal', component: PersonalDetailsComponent },
          { path: 'staff', component: StaffDetailsComponent },
          { path: 'technical', component: TechnicalDetailsComponent },
          { path: 'production', component: ProductionDetailsComponent },
          { path: 'business', component: BusinessDetailsComponent },
          { path: 'document', component: DocumentComponent },
          { path: 'bank', component: BankDetailsComponent },
          { path: 'department', component: DepartmentMappingNewComponent },
          { path: 'address', component: AddressFormComponent },
          { path: 'techlinereport', component: TechLineReportComponent}
        ]
      }
    ]
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
