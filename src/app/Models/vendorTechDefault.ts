import { VendorTech } from './VendorTech';

export class VendorTechDefault {
    VendorTechDefaultID: number;
    VendorTechDetailsID: number;
    VendorShortCode: string;
    TechLineNo: string;
    DefaultEfficiency: number;
    Status: string;
    Remarks: string;
    VendorTechDetails: VendorTech[];
}
