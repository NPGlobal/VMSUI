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
    CurrentYearVendorBusinessDetailsID: number | null;
    CurrentYearProposedDPGrnValue: number | null;
    CurrentYearProposedDPGrnQty: number | null;
    CurrentYearProposedJWGrnValue: number | null;
    CurrentYearProposedJWGrnQty: number | null;

    NextYearVendorBusinessDetailsID: number | null;
    NextYearProposedDPGrnValue: number | null;
    NextYearProposedDPGrnQty: number | null;
    NextYearProposedJWGrnValue: number | null;
    NextYearProposedJWGrnQty: number | null;

    ErrorList: string[];
    ValueErrorList: string[];
    QtyErrorList: string[];
}
