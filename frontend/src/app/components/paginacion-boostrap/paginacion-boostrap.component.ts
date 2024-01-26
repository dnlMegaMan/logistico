import { Component, Input, OnInit } from '@angular/core';
import { PaginationControlsDirective, PaginationInstance } from 'ngx-pagination';
import {TranslateService} from '@ngx-translate/core';


/**
 * Los controles de ngx-pagination combinados con los estilos de bootstrap. 
 * 
 * Para ocuparlos hay que pasar este componente dentro de `<pagination-template>` de la siguiente
 * forma
 * 
 * ```html
 *  <pagination-template 
 *      #p="paginationApi"
 *      [id]="configuracionPaginacion.id"
 *      (pageChange)="configuracionPaginacion.currentPage = $event"
 *      (pageBoundsCorrection)="configuracionPaginacion.currentPage = $event">
 *      
 *      <app-paginacion-boostrap 
 *          [config]="configuracionPaginacion" 
 *          [api]="p">
 *      </app-paginacion-boostrap>
 *  </pagination-template> 
 * ```
 */
@Component({
  selector: 'app-paginacion-boostrap',
  templateUrl: './paginacion-boostrap.component.html',
  styleUrls: ['./paginacion-boostrap.component.css'],
})
export class PaginacionBoostrapComponent implements OnInit {
  /** 
   * La API exportada por ngx-pagination. Se puede obtener de 
   * 
   * ```html
   * <pagination-template #p="paginationApi">
   * ...
   * </pagination-template>
   * ```
   * 
   * y habria que pasar `p` como el valor de `ngxPaginationApi`.
   */
  @Input() ngxPaginationApi: PaginationControlsDirective;

  /** 
   * La configuracion de la paginacion. Es el objeto `config` que se pasa en la parte
   * `*ngFor="... | pagination: config"`
   */
  @Input() config: PaginationInstance;

  constructor(public translate: TranslateService) {
    translate.use(navigator.language);
  }

  ngOnInit() {}
}
