import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VendorListComponent } from '../Components/vendor-list/vendor-list.component';
import { AddVendorComponent } from '../Components/add-vendor/add-vendor.component';
import { PersonalDetailsComponent } from '../Components/personal-details/personal-details.component';
import { StaffDetailsComponent } from '../Components/staff-details/staff-details.component';
import { TechnicalDetailsComponent } from '../Components/technical-details/technical-details.component';
import { PageNotFoundComponent } from '../Components/page-not-found/page-not-found.component';
import { ProductionDetailsComponent } from '../Components/production-details/production-details.component';
import { DocumentComponent } from '../Components/document/document.component';
import { BankDetailsComponent } from '../Components/bank-details/bank-details.component';
import { LoginComponent } from '../Components/login/login.component';
import { WelcomeComponent } from '../Components/welcome/welcome.component';
const routes = [];
// const routes: Routes = [
//     { path: '', redirectTo: 'login', pathMatch: 'full' },
//     { path: 'login', component: LoginComponent },
//     { path: 'welcome', component: WelcomeComponent },
//     { path: 'vendor', component: VendorListComponent },
//     {
//         path: 'vendor/:code',
//         component: AddVendorComponent,
//         children: [
//             { path: 'personal', component: PersonalDetailsComponent },
//             { path: 'staff', component: StaffDetailsComponent },
//             { path: 'technical', component: TechnicalDetailsComponent },
//             { path: 'production', component: ProductionDetailsComponent },
//             { path: 'document', component: DocumentComponent },
//             { path: 'bank', component: BankDetailsComponent }

//         ]
//     },
//     {
//         path: '**', component: PageNotFoundComponent
//     }
// ];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class LoginModule { }
