import { Component, OnInit, ViewChild } from '@angular/core';

import {TranslateService} from '@ngx-translate/core';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
@Component({
  selector: 'app-mantencionarticulos-form',
  templateUrl: './mantencionarticulos-form.component.html',
  styleUrls: ['./mantencionarticulos-form.component.css']
})
export class MantencionarticulosFormComponent implements OnInit {  

  public loading      = false;
  
  disableSwitching: boolean;
  @ViewChild('tabset' , {static: false}) tabset: TabsetComponent;
  @ViewChild('first' , {static: false}) first: TabDirective;
  @ViewChild('second' , {static: false}) second: TabDirective;

  constructor(
    public translate: TranslateService
  ) {}

  ngOnInit() {} 

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }

  confirmTabSwitch($event) {
    if (this.disableSwitching) {
      const confirm = window.confirm('Discard changes and switch tab?');
      if (confirm) {
        this.disableSwitching = false;
        this.second.active = true;
      }
    }
  }

}
