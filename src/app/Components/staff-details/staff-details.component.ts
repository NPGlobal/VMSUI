import { Component, OnInit } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-staff-details',
  templateUrl: './staff-details.component.html',
  styleUrls: ['./staff-details.component.css']
})
export class StaffDetailsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    $('.glyphicon-expand').click(function(){
      toggelDiv($(this));
    });
  }
}

function toggelDiv(obj) {
  var $span=$(obj).find('span');
  var $objD=$(obj).closest('div.content-heading').next('div.mycontainer');
  var t=$span.text();

  if(t=='+')
    $span.text('-');
  else
    $span.text('+');
  $objD.slideToggle()
}
