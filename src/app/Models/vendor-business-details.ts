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

    // For New Changes
    CurrentYearVendorBusinessDetailsID: number;
    CurrentYearProposedDPGrnQty: number;
    CurrentYearProposedDPValueQty: number;
    CurrentYearProposedJWGrnQty: number;
    CurrentYearProposedJWValueQty: number;

    NextYearVendorBusinessDetailsID: number;
    NextYearProposedDPGrnQty: number;
    NextYearProposedDPValueQty: number;
    NextYearProposedJWGrnQty: number;
    NextYearProposedJWValueQty: number;
}
