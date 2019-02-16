import { VendorAddress } from './vendor-address';

export class Vendor {
    RowNumber: number;
    VendorCode: string;
    VendorName: string;
    Ref_VendorCode: string;
    MasterVendorId: number;
    PANNo: string;
    GSTIN: string;
    AssociatedSinceYear: number;
    VendorType_MDDCode: string;
    PersonTopRanker1: string;
    PersonTopRanker2: string;
    OtherCustomer1: string;
    OtherCustomer2: string;
    OtherCustomer3: string;
    OtherCustomer4: string;
    OtherCustomer5: string;
    SelectedPHListCSV: string;
    IsProvisional: Boolean;
    IsRCM: Boolean;
    IsJWVendor: boolean;
    IsDirectVendor: boolean;
    RegisteredOfficeAddress: VendorAddress;
}
