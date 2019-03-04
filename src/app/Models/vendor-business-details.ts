export class VendorBusinessDetails {
    VendorBusinessDetailsID: number;
    FinancialYear: string;

    CompanyCode: string;
    VendorShortCode: string;
    DivisionCode: string;
    DivisionName: string;
    DeptCode: string;
    DeptName: string;

    ActualDPGrnQty: number;
    ActualDPValueQty: number;
    ActualJWGrnQty: number;
    ActualJWValueQty: number;

    ProposedDPGrnQty: number;
    ProposedDPValueQty: number;
    ProposedJWGrnQty: number;
    ProposedJWValueQty: number;

    Status: string;
    Remarks: string;
    CreatedBy: number;
    ModifiedBy: number;
}
