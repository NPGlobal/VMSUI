import { Component, OnInit } from '@angular/core';
import { UserActivityLogService } from 'src/app/Services/user-activity-log.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-user-activity-log',
  templateUrl: './user-activity-log.component.html',
  styleUrls: ['./user-activity-log.component.css']
})
export class UserActivityLogComponent implements OnInit {

  //#region Declaration of Form variables

  activityFiltersForm: FormGroup;

  //#endregion

  constructor() { }

  ngOnInit() {
  }


}
