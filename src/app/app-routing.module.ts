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
import { UserActivityLogComponent } from './Components/user-activity-log/user-activity-log.component';
import { UserActivityLogTabsComponent } from './Components/user-activity-log-tabs/user-activity-log-tabs.component';
import { ProductionDetailsLogsComponent } from './Components/production-details-logs/production-details-logs.component';
import { AddressLogsComponent } from './Components/address-logs/address-logs.component';

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
          { path: 'techlinereport', component: TechLineReportComponent }
        ]
      },
      {
        path: 'vendor/:code/Logs', component: UserActivityLogComponent,
        children: [
          { path: 'personal', component: UserActivityLogTabsComponent },
          { path: 'staff', component: UserActivityLogTabsComponent },
          { path: 'technical', component: TechLineReportComponent },
          { path: 'production', component: ProductionDetailsLogsComponent },
          { path: 'business', component: UserActivityLogTabsComponent },
          { path: 'document', component: UserActivityLogTabsComponent },
          { path: 'bank', component: UserActivityLogTabsComponent },
          { path: 'department', component: UserActivityLogTabsComponent },
          { path: 'address', component: AddressLogsComponent }
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
