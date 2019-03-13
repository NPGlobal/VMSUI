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

  constructor() { }
}

