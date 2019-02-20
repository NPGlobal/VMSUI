import { VendorAddress } from './vendor-address';

export class Vendor {
    RowNumber: number;
    VendorCode: string;
    VendorName: string;
    Ref_VendorCode: string;
    MasterVendorId: number;
    PANNo: string;
    Status: string;
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
    IsGSTRegistered: boolean;
    GSTIN: string;
    IsProvisional: Boolean;
    IsRCM: Boolean;
    GSTDate: Date;
    IsJWVendor: boolean;
    IsDirectVendor: boolean;
    RegisteredOfficeAddress: VendorAddress;
    NameAsPerBankAccount: string;
    CurrencyCode: string;
    BankName: string;
    BranchName: string;
    BankAcctNo: string;
    RemittanceInfavourof: string;
    isECSenabled: boolean;
    accountType: string;
    MICRNo: string;
    IFSCCode: string;
    SwiftCode: string;
    PaymentTerms: string;
}
