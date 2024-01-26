import { Component, OnInit } from '@angular/core';

import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-not-found-page',
  templateUrl: './not-found-page.component.html',
  styleUrls: ['./not-found-page.component.css']
})
export class NotFoundPAgeComponent implements OnInit {

  constructor(public translate: TranslateService) { 
    translate.use(navigator.language);
  }

  ngOnInit() {
  }

}
