import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { VendorTechnical } from 'src/app/Models/VendorTechnical';
import { VendorService } from 'src/app/Services/vendor.service';

declare var $: any;

@Component({
  selector: 'app-technical-details',
  templateUrl: './technical-details.component.html',
  styleUrls: ['./technical-details.component.css']
})
export class TechnicalDetailsComponent implements OnInit {
  technicalDetailsForm: FormGroup;
  vendor: VendorTechnical;
  Code: string;
  //vendorType = 'DP';

  constructor(private _vendorService: VendorService,
    private _route: ActivatedRoute,
    private _fb: FormBuilder) { }

  ngOnInit() {
    this._route.parent.paramMap.subscribe((data) => {
      this.Code = (data.get('code'));
    });
    this.Editvendor(this.Code);
    
  }

  Editvendor(Code: string) {
    if (Code === null) {
      this.vendor = new VendorTechnical();
      this.InitializeFormControls();

    } else {
      this._vendorService.GetVendorByCode(Code).subscribe((data) => {
        this.vendor = data.Vendor[0];
        this.InitializeFormControls();
      });
    }

  }

  InitializeFormControls() {
    this.technicalDetailsForm = this._fb.group({
      IsAllExpanded:false,
      cuttingDetails: this._fb.group({
        Code: [this.vendor.Code],
        OCutEastman: [this.vendor.OCutEastman],
        OCutStraight: [this.vendor.OCutStraight],
        OCutBandKnives: [this.vendor.OCutBandKnives],
        OCutCircularCutters: [this.vendor.OCutCircularCutters],
        ComputerisedCuttingTable: [this.vendor.ComputerisedCuttingTable],
        ConveyerFusing: [this.vendor.ConveyerFusing],
        DieCutting: [this.vendor.DieCutting],
        EndCutter: [this.vendor.EndCutter],
        ManualFusing: [this.vendor.ManualFusing],
        OthersD: [this.vendor.OthersD],
        OthersMC: [this.vendor.OthersMC],
        VerticalCutters: [this.vendor.VerticalCutters],
        IsExpanded: true
      }),
      DyingProcessingDetails: this._fb.group({
        DyProNeedleThreeOverlockMC: [this.vendor.DyProNeedleThreeOverlockMC],
        DyProNeedleFiveOverlockMC: [this.vendor.DyProNeedleFiveOverlockMC],
        DyProThreadFourOverlockMC: [this.vendor.DyProThreadFourOverlockMC],
        DyProThreadFiveOverlockMC: [this.vendor.DyProThreadFiveOverlockMC],
        DyProThreadsOverlock: [this.vendor.DyProThreadsOverlock],
        DyProButtonAttaching: [this.vendor.DyProButtonAttaching],
        DyProButtonAttachPlusButtonHole: [this.vendor.DyProButtonAttachPlusButtonHole],
        //DyProButtonAttaching: [this.vendor.DyProButtonAttaching],
        // Customer4Name: [this.vendor.Customer4Name],
        // Customer5Name: [this.vendor.Customer5Name],
        IsExpanded: false
      }),
      fabricDetails: this._fb.group({
        FabricCheckingMc: [this.vendor.FabricCheckingMc],
        fabricOthers: [this.vendor.fabricOthers],
        OthersSSM: [this.vendor.OthersSSM],
        IsExpanded: false
      }),
      finishingDetails: this._fb.group({
        DieselFiredSteamBoiler: [this.vendor.DieselFiredSteamBoiler],
        Electric: [this.vendor.Electric],
        OthersNDMS: [this.vendor.OthersNDMS],
        OthersPB: [this.vendor.OthersPB],
        OthersSB: [this.vendor.OthersSB],
        OthersSporting: [this.vendor.OthersSporting],
        OthersPowerBc: [this.vendor.OthersPowerBc],
        PressingTable: [this.vendor.PressingTable],
        Tagging: [this.vendor.Tagging],
        IsExpanded: false
      }),
      sewingDetails: this._fb.group({
        Bartack: [this.vendor.Bartack],
        BeltAttach: [this.vendor.BeltAttach],
        BlindST: [this.vendor.BlindST],
        ButtonFixing: [this.vendor.ButtonFixing],
        ButtonHoleEyelet: [this.vendor.ButtonHoleEyelet],
        ChainST: [this.vendor.ChainST],
        ChainSTDNCS: [this.vendor.ChainSTDNCS],
        DoubleNeedleChain: [this.vendor.DoubleNeedleChain],
        DoubleNeedleLockST: [this.vendor.DoubleNeedleLockST],
        EmbrioderyMC: [this.vendor.EmbrioderyMC],
        FeedOfTheArm: [this.vendor.FeedOfTheArm],
        FlatLock: [this.vendor.FlatLock],
        Kansai: [this.vendor.Kansai],
        LockStitch: [this.vendor.LockStitch],
        LoopMaking: [this.vendor.LoopMaking],
        OthersPleating: [this.vendor.OthersPleating],
        OthersAARIEmbroidery: [this.vendor.OthersAARIEmbroidery],
        OthersBartek: [this.vendor.OthersBartek],
        OthersLayyerTopper: [this.vendor.OthersLayyerTopper],
        PocketFacing: [this.vendor.PocketFacing],
        RivetAndButtonFixing: [this.vendor.RivetAndButtonFixing],
        SeddleStitch: [this.vendor.SeddleStitch],
        SnapFasterPress: [this.vendor.SnapFasterPress],
        WaistBand: [this.vendor.WaistBand],
        ZigZagMC: [this.vendor.ZigZagMC],
        IsExpanded: false
      }),
      qualityDetails: this._fb.group({
        ButtonPullTester: [this.vendor.ButtonPullTester],
        ColourMatchingCabinated: [this.vendor.ColourMatchingCabinated],
        Crocometer: [this.vendor.Crocometer],
        GsmMachine: [this.vendor.GsmMachine],
        GsmRoundCutter: [this.vendor.GsmRoundCutter],
        ShrinkageScale: [this.vendor.ShrinkageScale],
        IsExpanded: false
      }),
      washingDyingDetails: this._fb.group({
        DryingTumbler: [this.vendor.DryingTumbler],
        IndigoDyeBathtubs: [this.vendor.IndigoDyeBathtubs],
        OthersDyeUnit: [this.vendor.OthersDyeUnit],
        OthersScrepingDummy: [this.vendor.OthersScrepingDummy],
        OthersThreadSucked: [this.vendor.OthersThreadSucked],
        PrcDryClean: [this.vendor.PrcDryClean],
        SprayDummy: [this.vendor.SprayDummy],
        WashingMachine: [this.vendor.WashingMachine],
        IsExpanded: false
      }),
      washingDetails: this._fb.group({
        HydroExtractor: [this.vendor.HydroExtractor],
        SampleWashingMachine: [this.vendor.SampleWashingMachine],
        IsExpanded: false
      })
    });
  }

  ToggleContainer(formGroup: FormGroup) {
    formGroup.controls.IsExpanded.patchValue(!formGroup.controls.IsExpanded.value);
  }
  ToggleAllContainer(){
    this.technicalDetailsForm.controls.IsAllExpanded.patchValue(!this.technicalDetailsForm.controls.IsAllExpanded.value);

    let expandAll=!this.technicalDetailsForm.controls.IsAllExpanded.value;
    let array = [
      'cuttingDetails','DyingProcessingDetails','fabricDetails','finishingDetails',
      'sewingDetails','qualityDetails','washingDyingDetails','washingDetails'
                ]
    for (let i = 0; i < array.length; i++) {
      //console.log(array[i]);
      this.technicalDetailsForm.get(array[i]+'.IsExpanded').patchValue(expandAll);
    }

    // this.technicalDetailsForm.get('cuttingDetails.IsExpanded').patchValue(expandAll);
    // this.technicalDetailsForm.get('DyingProcessingDetails.IsExpanded').patchValue(expandAll);
    // this.technicalDetailsForm.get('fabricDetails.IsExpanded').patchValue(expandAll);
    // this.technicalDetailsForm.get('finishingDetails.IsExpanded').patchValue(expandAll);
    // this.technicalDetailsForm.get('sewingDetails.IsExpanded').patchValue(expandAll);
    // this.technicalDetailsForm.get('qualityDetails.IsExpanded').patchValue(expandAll);
    // this.technicalDetailsForm.get('washingDyingDetails.IsExpanded').patchValue(expandAll);
    // this.technicalDetailsForm.get('washingDetails.IsExpanded').patchValue(expandAll);

    // this.technicalDetailsForm.controls.IsAllExpanded.patchValue(!this.technicalDetailsForm.controls.IsAllExpanded.value);
    // this.technicalDetailsForm.get('cuttingDetails.IsExpanded').patchValue(!this.technicalDetailsForm.controls.IsAllExpanded.value);
    // this.technicalDetailsForm.get('DyingProcessingDetails.IsExpanded').patchValue(!this.technicalDetailsForm.controls.IsAllExpanded.value);
    // this.technicalDetailsForm.get('fabricDetails.IsExpanded').patchValue(!this.technicalDetailsForm.controls.IsAllExpanded.value);
    // this.technicalDetailsForm.get('finishingDetails.IsExpanded').patchValue(!this.technicalDetailsForm.controls.IsAllExpanded.value);
    // this.technicalDetailsForm.get('sewingDetails.IsExpanded').patchValue(!this.technicalDetailsForm.controls.IsAllExpanded.value);
    // this.technicalDetailsForm.get('qualityDetails.IsExpanded').patchValue(!this.technicalDetailsForm.controls.IsAllExpanded.value);
    // this.technicalDetailsForm.get('washingDyingDetails.IsExpanded').patchValue(!this.technicalDetailsForm.controls.IsAllExpanded.value);
    // this.technicalDetailsForm.get('washingDetails.IsExpanded').patchValue(!this.technicalDetailsForm.controls.IsAllExpanded.value);
  }
  SaveTechnicalDetails() {
    console.log(this.technicalDetailsForm);
    //return false;
  }
}
