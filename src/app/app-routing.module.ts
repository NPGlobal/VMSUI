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

const routes: Routes = [
  {
    path: 'vendor',
    component: VendorListComponent
  },
  {
    path: 'vendor/add',
    component: AddVendorComponent,
    children: [
      { path: 'personal', component: PersonalDetailsComponent },
      { path: 'staff', component: StaffDetailsComponent },
      { path: 'technical', component: TechnicalDetailsComponent },
      { path: 'production', component: ProductionDetailsComponent },
      { path: 'business', component: BusinessDetailsComponent }
    ]
  },
  {
    path: 'vendor/:code',
    component: AddVendorComponent,
    children: [
      { path: 'personal', component: PersonalDetailsComponent },
      { path: 'staff', component: StaffDetailsComponent },
      { path: 'technical', component: TechnicalDetailsComponent },
      { path: 'production', component: ProductionDetailsComponent },
      { path: 'business', component: BusinessDetailsComponent }
    ]
  },
  {
    path: '',
    redirectTo: 'vendor',
    pathMatch: 'full'
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