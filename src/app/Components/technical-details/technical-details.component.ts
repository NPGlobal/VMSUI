import { Component, OnInit } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-technical-details',
  templateUrl: './technical-details.component.html',
  styleUrls: ['./technical-details.component.css']
})
export class TechnicalDetailsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
   // collapseAll();
    $('.glyphicon-expand').click(function(){
      toggelDiv($(this));
    });
    // setPlaceHolder();
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

// function setPlaceHolder(){
//   $('.main-div').find('input[type="text"]').each(function(){
//     var $txt=$(this);
//     if($txt.length>0){
//       var $lab=$txt.closest('span').prev('label.text');
//       if($lab.length>0){
//         $txt.attr('placeholder',$lab.text().trim());
//       }
//     }
//   });
// }
