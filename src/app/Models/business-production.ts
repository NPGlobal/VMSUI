import { VendorProduction } from './VendorProduction';
import { VendorBusinessDetails } from './vendor-business-details';

export class BusinessProduction {
    ProductionDetails: VendorProduction[];
    BusinessDetails: VendorBusinessDetails[];

    CreatedBy: number;
    ModifiedBy: number;
}
