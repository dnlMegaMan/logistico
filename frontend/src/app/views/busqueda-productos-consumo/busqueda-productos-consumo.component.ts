import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { SolicitudConsumoService } from 'src/app/servicios/solicitud-consumo.service';
import { ProductoConsumo } from 'src/app/models/entity/producto-consumo';
import { ClinFarGrupoConsumo } from 'src/app/models/entity/clin-far-grupo-consumo';
import { ClinFarSubGrupoConsumo } from 'src/app/models/entity/clin-far-sub-grupo-consumo';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-busqueda-productos-consumo',
  templateUrl: './busqueda-productos-consumo.component.html',
  styleUrls: ['./busqueda-productos-consumo.component.css']
})
export class BusquedaProductosConsumoComponent implements OnInit {
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;

  @Input() hdgcodigo: number;
  @Input() esacodigo: number;
  @Input() cmecodigo: number;
  @Input() titulo   : string;
  @Input() codprod  : string; // codigo producto
  @Input() descprod : string; // descripcion producto

  public onClose: Subject<ProductoConsumo>;
  public estado : boolean = false;

  public detalleconsultaproducto    : Array<ProductoConsumo> = [];
  public detalleconsultaproductopag : Array<ProductoConsumo> = [];
  public listaGurpoConsumo          :  Array<ClinFarGrupoConsumo> = [];
  public listaSubGurpoConsumo       :  Array<ClinFarSubGrupoConsumo> = [];

  public lForm        : FormGroup;
  public loading      = false;
  public usuario      = environment.privilegios.usuario;
  public servidor     = environment.URLServiciosRest.ambiente;
  public codproducto  = null;
  public descproducto = null;

  constructor(
    public bsModalRef : BsModalRef,
    public formBuilder: FormBuilder,
    public _SolicitudConsumoService: SolicitudConsumoService,
    public translate: TranslateService
    ) {

      this.lForm = this.formBuilder.group({
        codigo: [{ value: null, disabled: false }, Validators.required],
        descripcion: [{ value: null, disabled: false }, Validators.required],
        codffar: [{ value: null, disabled: false }, Validators.required],
        codpres: [{ value: null, disabled: false }, Validators.required],
        codpact: [{ value: null, disabled: false }, Validators.required],
        grupoid:[{ value: null, disabled: false }, Validators.required],
        subgrupoid:[{ value: null, disabled: false }, Validators.required],
      });
  }

  ngOnInit() {

    this.onClose = new Subject();
    if(this.codprod !== null) {
      this.codproducto = (this.codprod===undefined || this.codprod.trim()==='')?null:this.codprod;
    }

    if(this.descprod !== null) {
      this.descproducto = (this.descprod===undefined || this.descprod.trim()==='')?null:this.descprod;
    }

    this._SolicitudConsumoService.buscargrupoconsumo('',0,this.hdgcodigo,0,0,'','',this.usuario,this.servidor).subscribe(
      Response => {
        if (Response != null){
          if (Response.length == 0 ){
            this.loading = false;
            this.alertSwalAlert.title = this.TranslateUtil('key.advertencia');
            this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.existe.grupos.definidos.criterio');
            this.alertSwalAlert.show();
            Response = [];
          } else {
            this.listaGurpoConsumo = Response;
          }
        } else {
          this.loading = false;
        }
      }
    );
  }

  async ngAfterViewInit() {
    /** Si var cod y desc vienen sin datos no realiza busqueda //@ML */
    if (this.codproducto === null && this.descproducto === null){
      return;
    } else {
      this.setBusqueda();
    }
  }

  async setBusqueda() {
    /** setea campos codigo o descripcion de producto y genera busqueda */
    this.lForm.get('codigo').setValue(this.codproducto);
    this.lForm.get('descripcion').setValue(this.descproducto);
    this.Buscarproducto(this.codproducto, this.descproducto,0,0);
  }

  listarsubgrupos(id_grupo:number){
    this._SolicitudConsumoService.buscarsubgrupoconsumo('',0,id_grupo  ,this.hdgcodigo,0,0,'','',this.usuario,this.servidor).subscribe(
      response => {
        if (response.length == 0 ){
          this.loading = false;
          this.alertSwalAlert.title = this.TranslateUtil('key.advertencia');
          this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.existe.subgrupos.definidos.criterio');
          this.alertSwalAlert.show();
          response = [];
        } else {
          this.listaSubGurpoConsumo = response;
        }
      }
    )
  }

  Buscarproducto(codigo: string, descripcion: string, idgrupo:number, idsubgrupo:number) {
    this.loading = true;
    this._SolicitudConsumoService.buscarproductosconsumo(0,  this.hdgcodigo, this.esacodigo,this.cmecodigo,codigo,
      descripcion,idgrupo,idsubgrupo, this.usuario, this.servidor).subscribe(
        response => {
          if(response != null){
            if (response.length == 0) {
              this.loading = false;
              this.alertSwalAlert.title = this.TranslateUtil('key.advertencia');
              this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.existe.coincidencia.criterio.buscado');
              this.alertSwalAlert.show();
              response = [];
            }
            else {
              if (response.length > 0) {
                this.detalleconsultaproducto = response;
                this.detalleconsultaproductopag = this.detalleconsultaproducto.slice(0, 8);
                this.loading = false;
              }
            }
          } else {
            this.loading = false;
            this.alertSwalAlert.title = this.TranslateUtil('key.advertencia');
            this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.existe.coincidencia.criterio.buscado');
            this.alertSwalAlert.show();
          }
        },
        error => {
          this.loading = false;
          this.alertSwalError.title = this.TranslateUtil('key.title.error');
          this.alertSwalError.text = error.message;
          this.alertSwalError.show();
        }
      );
    this.loading = false;
  }

  onCerrar(Articulos: ProductoConsumo) {
    this.estado = true;
    this.onClose.next(Articulos);
    this.bsModalRef.hide();
  };

  onCerrarSalir() {
    this.estado = true;
    this.onClose.next();
    this.bsModalRef.hide();
  };

  /* Función búsqueda con paginación */
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.detalleconsultaproductopag = this.detalleconsultaproducto.slice(startItem, endItem);
  }

  Limpiar() {
    this.lForm.reset();
    this.detalleconsultaproducto = [];
    this.detalleconsultaproductopag = [];
  }

  getProducto(codigo:string){
    this.loading = true;
    this._SolicitudConsumoService.buscarproductosconsumo(0,  this.hdgcodigo, this.esacodigo,this.cmecodigo,
      codigo,null,0,0, this.usuario, this.servidor
      ).subscribe(
        response => {
          if(response !=null){
            if (response.length == 0) {
              this.loading = false;
              this.alertSwalAlert.title = this.TranslateUtil('key.advertencia');
              this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.existe.coincidencia.criterio.buscado');
              this.alertSwalAlert.show();
              response = [];
            }
            else {
              if (response.length > 0) {
                this.detalleconsultaproducto = response;
                this.detalleconsultaproductopag = this.detalleconsultaproducto.slice(0, 8);
                this.loading = false;
              }
            }
          }else{
            this.loading = false;
            this.alertSwalAlert.title = this.TranslateUtil('key.advertencia');
            this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.existe.coincidencia.criterio.buscado');
            this.alertSwalAlert.show();
          }
        },
        error => {
          this.loading = false;
          this.alertSwalError.title = this.TranslateUtil('key.title.error');
          this.alertSwalError.text = error.message;
          this.alertSwalError.show();
        }
      );
    this.loading = false;
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
