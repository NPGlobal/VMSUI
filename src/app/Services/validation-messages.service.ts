import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationMessagesService {

  MaxLength = 'Can not exceed 6 characters';
  VCodePattern = 'Can not contain special characters';
  CodeExist = 'Producer already exists';
  VNameRequired = 'Please give a Producer Name';
  VTypeRequired = 'Please select Producer Type';
  PanPattern = 'Please enter a valid pan no.';
  AddressPattern = 'Only +,?-_@.#&%/\' are allowed.';
  RemarksPattern = 'Only +,?-_@.#&%/\' are allowed.';
  CityPattern = 'Please enter a valid city';
  GSTPattern = 'Please enter a valid GSTIN no.';
  PinPattern = 'Please enter a valid pin no.';
  ContactNamePattern = 'Please enter a valid name';
  PhonePattern = 'Please enter a valid phone no.';
  FaxPattern = 'Please enter a valid fax';
  EmailPattern = 'Please enter a valid email id';
  WebsitePattern = 'Please enter a valid website';
  EfficiencyPattern = 'Please enter a valid efficiency';
  AccountNoPattern = 'Please enter a valid account no.';
  UserName = 'Employee Id is required';
  Password = 'Password is Required';
  MaxLeanMonth = 'Month cannot exceed 500';
  NumericPattern = 'Numeric value allowed';
  PeriodicKey = 'Periodic Key is required';
  Captcha = 'Captcha is required';
  NamePattern = 'Only ,@\.\-\'&()_/\' are allowed.';
  IFSCCode = 'Please enter a valid IFSC Code';
  MICRNo = 'Please enter a valid MICR No.';
  SwiftCode = 'Please enter a valid SWIFT Code';
  RemittanceInfavourof = 'Only @\.\-\'&()_/\' are allowed.';
  PaymentTerms = 'Only @\.\-\'&()_/\' are allowed.';
  BankName = 'Only @\.\-\'&()_/\' are allowed.';
  BranchName = 'Please enter a valid Branch Name';
  constructor() { }
}

