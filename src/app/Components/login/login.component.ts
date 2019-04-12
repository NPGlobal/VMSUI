import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Login } from 'src/app/Models/login';
import { LoginService } from 'src/app/Services/login.service';
import { Router } from '@angular/router';
import { ValidationMessagesService } from 'src/app/Services/validation-messages.service';
import { window } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  //#region Variable Declaration
  image: HTMLImageElement;
  isUserLoggedIn: boolean;
  PopUpMessage = '';
  LoginForm: FormGroup;
  submitted = false;
  data: any;
  errormsg = '';
  isValidCaptcha = true;
  //#endregion

  //#region Validation Messages
  ValidationMessages = {
    'UserName': {
      'required': this._validationMess.UserName
    },
    'Password': {
      'required': this._validationMess.Password
    },
    'PeriodicKey': {
      'required': this._validationMess.PeriodicKey
    },
    'Captcha': {
      'required': this._validationMess.Captcha
    }
  };

  formErrors = {
    'UserName': '',
    'Password': '',
    'PeriodicKey': '',
    'Captcha': ''
  };
  //#endregion

  constructor(private _fb: FormBuilder,
    private _loginService: LoginService,
    private _router: Router,
    private _validationMess: ValidationMessagesService) {
    this.isUserLoggedIn = false;
  }

  ngOnInit() {
    this.InitializeFormControls();
    this.LoginForm.valueChanges.subscribe((data) => {
      this.errormsg = '';
      this.logValidationErrors(this.LoginForm);
    });
    this.GenerateCaptcha();
    // this.DrawCaptcha();
  }

  //#region Form Initialization
  InitializeFormControls() {
    this.LoginForm = this._fb.group({
      UserName: ['', Validators.required],
      Password: ['', Validators.required],
      PeriodicKey: ['', Validators.required],
    });
  }
  //#endregion

  //#region Authenticate valid user
  UserAuthentication() {
    this.submitted = true;

    if (this.LoginForm.invalid || !this.isValidCaptcha) {
      this.logValidationErrors();
      return;
    }
    const userCredential = new Login();
    userCredential.UserName = this.LoginForm.get('UserName').value;
    userCredential.Password = this.LoginForm.get('Password').value;
    userCredential.PeriodicKey = this.LoginForm.get('PeriodicKey').value;
    this._loginService.UserAuthentication(userCredential.UserName, userCredential.Password, userCredential.PeriodicKey)
      .subscribe(result => {
        //  this._loginService.UserAuthentication(userCredential.UserName, userCredential.Password, 'BlackTiger').subscribe(result => {
        this.data = result;
        if (this.data.Table !== undefined) {
          this.isUserLoggedIn = true;
          sessionStorage.setItem('userid', result.Table[0].LoginId);
          this._router.navigate(['/welcome']);
        } else {
          this.errormsg = 'User is not authenticated.';
          // this.LoginForm.get('Password').patchValue('');
        }
      });

  }
  //#endregion

  //#region Form Validator
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
  //#endregion

  // added by shubhi for capcha
  GenerateCaptcha() {
    // const canvas = document.getElementById('txtCaptcha') as HTMLCanvasElement;
    const code = Math.floor(Math.random() * 1000001).toString();
    const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d');
    const imageObj = new Image();
    imageObj.onload = function () {
      context.drawImage(imageObj, 200, 200);
      context.font = 'bold 60px Ink Free';
      context.fillStyle = 'red';
      localStorage.setItem('Captcha', code);
      context.fillText(code, 50, 90);
    };
    imageObj.src = 'assets/images/1.JPG';
  }
  ValidCaptcha() {
    const str1 = localStorage.getItem('Captcha').toString();
    const str2 = (<HTMLInputElement>document.getElementById('txtInput')).value;
    if (str1 === str2) {
      // alert(1);
      this.isValidCaptcha = true;
    } else {
      // alert(2);
      this.isValidCaptcha = false;
    }
  }
  // DrawCaptcha() {
  //         const a = Math.ceil(Math.random() * 10) + '';
  //         const b = Math.ceil(Math.random() * 10) + '';
  //         const c = Math.ceil(Math.random() * 10) + '';
  //         const d = Math.ceil(Math.random() * 10) + '';
  //         const e = Math.ceil(Math.random() * 10) + '';
  //         const f = Math.ceil(Math.random() * 10) + '';
  //        // const g = Math.ceil(Math.random() * 10) + '';
  //        // const code = a + ' ' + b + ' ' + ' ' + c + ' ' + d + ' ' + e + ' ' + f + ' ' + g;
  //         const code = a + ' ' + b + ' ' + ' ' + c + ' ' + d + ' ' + e + ' ' + f ;
  //         (<HTMLInputElement>document.getElementById('txtCaptcha')).value = code;
  //     }

  //     // Validate the Entered input aganist the generated security code function
  //      ValidCaptcha() {
  //       const str1 = this.removeSpaces( (<HTMLInputElement>document.getElementById('txtCaptcha')).value);
  //       const str2 = this.removeSpaces( (<HTMLInputElement>document.getElementById('txtInput')).value);
  //         if (str1 === str2) {
  //           // alert(1);
  //           this.isValidCaptcha = true;
  //         } else {
  //           // alert(2);
  //           this.isValidCaptcha = false; }
  //     }

  //     // Remove the spaces from the entered and generated code
  //      removeSpaces(string) {
  //         return string.split(' ').join('');
  //     }
}
