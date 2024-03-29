import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {NavItem} from '../../nav-item';
import {Router} from '@angular/router';
import {NavService} from '../../nav.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-menu-list-item',
  templateUrl: './menu-list-item.component.html',
  styleUrls: ['./menu-list-item.component.css'],
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({transform: 'rotate(0deg)'})),
      state('expanded', style({transform: 'rotate(180deg)'})),
      transition('expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)')
      ),
    ])
  ]
})
export class MenuListItemComponent implements OnInit {
  expanded: boolean = false;
  @HostBinding('attr.aria-expanded') ariaExpanded = this.expanded;
  @Input() item: NavItem;
  @Input() depth: number;

  constructor(public navService: NavService,
              public router: Router,
              public translate: TranslateService) {
    if (this.depth === undefined) {
      this.depth = 0;
    }

    if(localStorage.getItem('language')){
      translate.setDefaultLang(localStorage.getItem('language'));
      translate.use(localStorage.getItem('language'));     
    }else{
        translate.setDefaultLang(navigator.language);
        translate.use(navigator.language);
        localStorage.setItem('language', navigator.language);        
    }
  }

  ngOnInit() {
    this.navService.currentUrl.subscribe((url: string) => {
      if (this.item.route && url) {
        this.expanded = url.indexOf(`/${this.item.route}`) === 0;
        this.ariaExpanded = this.expanded;
      }
    });

    this.translate.get(this.item.displayName).subscribe((text:string) => { this.item.displayName = text;});
  }

  onItemSelected(item: NavItem) {
    if (!item.children || !item.children.length) {
      this.router.navigate([item.route]);
    }
    if (item.children && item.children.length) {
      this.expanded = !this.expanded;
    }
  }
}

