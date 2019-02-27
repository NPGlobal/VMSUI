import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Login } from 'src/app/Models/login';
import { LoginService } from 'src/app/Services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  isUserLoggedIn: boolean;
  PopUpMessage = '';
  LoginForm: FormGroup;
  submitted = false;
  data: any;
  errormsg = '';
  ValidationMessages = {
    'UserName': {
      'required': 'Employee Id is required.'
    },
    'Password': {
      'required': 'Password is required.'
    }
  };

  formErrors = {
    'UserName': '',
    'Password': ''
  };


  constructor(private _fb: FormBuilder,
    private _loginService: LoginService,
    private _router: Router) {
    this.isUserLoggedIn = false;
  }

  ngOnInit() {
    this.InitializeFormControls();
    this.LoginForm.valueChanges.subscribe((data) => {
      this.errormsg = '';
      this.logValidationErrors(this.LoginForm);
    });
  }

  InitializeFormControls() {
    this.LoginForm = this._fb.group({
      UserName: ['', Validators.required],
      Password: ['', Validators.required]
    });
  }

  UserAuthentication() {
    this.submitted = true;

    if (this.LoginForm.invalid) {
      return;
    }
    const userCredential = new Login();
    userCredential.UserName = this.LoginForm.get('UserName').value;
    userCredential.Password = this.LoginForm.get('Password').value;

    this._loginService.UserAuthentication(userCredential.UserName, userCredential.Password, 'BlackTiger').subscribe(result => {
      this.data = result;
      if (this.data.Table !== undefined) {
        this.isUserLoggedIn = true;
        this._router.navigate(['/welcome']);
      } else {
        this.errormsg = 'User is not authenticated.';
        // this.LoginForm.get('Password').patchValue('');
      }
    });

  }

  logValidationErrors(group: FormGroup = this.LoginForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof FormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        this.formErrors[key] = '';
        if (this.submitted || (abstractControl && !abstractControl.valid &&
          (abstractControl.touched || abstractControl.dirty))) {
          const messages = this.ValidationMessages[key];
          for (const errorkey in abstractControl.errors) {
            if (errorkey) {
              this.formErrors[key] += messages[errorkey] + ' ';
              break;
            }
          }
        }
      }
    });
  }

}
