import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { ActivatedRoute, Router } from '@angular/router';
import { SaldosProductosBodegas } from 'src/app/models/entity/SaldosProductosBodegas';
import { BusquedaproductosComponent } from '../busquedaproductos/busquedaproductos.component';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-consultasaldosporbodegas',
  templateUrl: './consultasaldosporbodegas.component.html',
  styleUrls: ['./consultasaldosporbodegas.component.css']
})
export class ConsultasaldosporbodegasComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public FormConsultaSaldosBodega  : FormGroup;
  public hdgcodigo           : number;
  public esacodigo           : number;
  public cmecodigo           : number;
  public msj                 : boolean = false;
  public servidor            = environment.URLServiciosRest.ambiente;
  public usuario             = environment.privilegios.usuario;
  private _BSModalRef        : BsModalRef;
  public descprod            : string;
  public codprod             : string;
  public loading             = false;
  public _PageChangedEvent   : PageChangedEvent;
  public codigo_aux          : string = '';
  public descripcion_aux     : string = '';
  public tipoproducto_aux    : string = '';
  public detallessaldos      : Array<SaldosProductosBodegas>=[];
  public detallessaldosPaginacion : Array<SaldosProductosBodegas>=[];
  public detallessaldos_aux  : Array<SaldosProductosBodegas>=[];
  public detallessaldosPaginacion_aux : Array<SaldosProductosBodegas>=[];

  constructor(
    private formBuilder       : FormBuilder,
    public _BsModalService    : BsModalService,
    private router            : Router,
    private route             : ActivatedRoute,
    public _BusquedaproductosService: BusquedaproductosService,
    public translate: TranslateService
  ) {
    this.FormConsultaSaldosBodega = this.formBuilder.group({

      hdgcodigo   : [{ value: null, disabled: false }, Validators.required],
      esacodigo   : [{ value: null, disabled: false }, Validators.required],
      cmecodigo   : [{ value: null, disabled: false }, Validators.required],
      tipoproducto: [{ value: null, disabled: false }, Validators.required],
      codigo      : [{ value: '', disabled: false }, Validators.required],
      descripcion : [{ value: null, disabled: false }, Validators.required],
      boddestino  : [{ value: null, disabled: false }, Validators.required],
      saldoperant : [{ value: null, disabled: true }, Validators.required],
      marca       : [{ value: null, disabled: false }, Validators.required]
    });
   }

  ngOnInit() {

    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.FormConsultaSaldosBodega.controls.tipoproducto.disable();

  }

  getProducto() {

    this.codprod = this.FormConsultaSaldosBodega.controls.codigo.value;
    this.descprod = this.FormConsultaSaldosBodega.controls.descripcion.value;
    console.log(this.codprod,this.descprod);
    if(this.codprod === null || this.codprod === '' ){
      // return;
      this.BuscaProducto();
    } else{

      var tipodeproducto = 'MIM';
      this.loading = true;
      var controlado = '';
      var controlminimo = '';
      var idBodega = 0;// this.FormConsultaKardex.value.boddestino;
      var consignacion = '';

      this._BusquedaproductosService.BuscarArticulosFiltros(this.hdgcodigo, this.esacodigo,
      this.cmecodigo, this.codprod, this.descprod, null, null, null, tipodeproducto, idBodega, controlminimo, controlado, consignacion
      , this.usuario, null, this.servidor).subscribe(response => {
        if (response != null){
          if (response.length == 0) {
            this.loading = false;
            this.alertSwalError.text ="El producto buscado no pertenece a la bodega";
            this.alertSwalError.show();
          } else {
            if (response.length === 1) {
              this.loading = false;
              console.log("producto encontrado:",response)
              this.codigo_aux = response[0].codigo;
              this.descripcion_aux = response[0].descripcion;
              this.tipoproducto_aux = response[0].desctiporegistro;
              this.FormConsultaSaldosBodega.get('codigo').setValue(response[0].codigo);
              this.FormConsultaSaldosBodega.get('descripcion').setValue(response[0].descripcion);
              this.FormConsultaSaldosBodega.get('tipoproducto').setValue(response[0].desctiporegistro);

              this._BusquedaproductosService.BuscarSaldosPorBodegas(response[0].mein,
                this.servidor,this.hdgcodigo,this.esacodigo,this.cmecodigo, this.usuario).subscribe(
                  response => {
                    if (response != null){
                      this.detallessaldos = response;
                      this.detallessaldosPaginacion = this.detallessaldos.slice(0,20);
                      this.FormConsultaSaldosBodega.controls.codigo.disable();
                      this.FormConsultaSaldosBodega.controls.descripcion.disable();
                    }
                });
            }else{
              if(response.length >1){
                this.BuscaProducto();
                this.loading = false;
              }
            }
          }
        } else {
          this.loading = false;
        }
      }, error => {
        this.loading = false;
        console.log('error',error);
      });
    }
  }

  getProductoDescrip() {
    this.descprod = this.FormConsultaSaldosBodega.controls.descripcion.value;
    console.log(this.codprod,this.descprod);
    if( this.descprod === null || this.descprod ==='' ){
      // return;
      this.BuscaProducto();
    } else{
      var tipodeproducto = 'MIM';
      this.loading = true;
      var controlado = '';
      var controlminimo = '';
      var idBodega = 0;// this.FormConsultaKardex.value.boddestino;
      var consignacion = '';

      this._BusquedaproductosService.BuscarArticulosFiltros(this.hdgcodigo, this.esacodigo,
      this.cmecodigo, this.codprod, this.descprod, null, null, null, tipodeproducto, idBodega, controlminimo, controlado, consignacion
      , this.usuario, null, this.servidor).subscribe(response => {
        if (response != null){
          if (response.length != 0) {
            if (response.length === 1) {
              this.loading = false;
              this.FormConsultaSaldosBodega.get('codigo').setValue(response[0].codigo);
              this.FormConsultaSaldosBodega.get('descripcion').setValue(response[0].descripcion);
              this.FormConsultaSaldosBodega.get('tipoproducto').setValue(response[0].desctiporegistro);
              this._BusquedaproductosService.BuscarSaldosPorBodegas(response[0].mein,
              this.servidor,this.hdgcodigo,this.esacodigo,this.cmecodigo, this.usuario).subscribe(
                response => {
                  if (response != null){
                    this.detallessaldos = response;
                    this.detallessaldosPaginacion = this.detallessaldos.slice(0,20);
                    this.FormConsultaSaldosBodega.controls.codigo.disable();
                    this.FormConsultaSaldosBodega.controls.descripcion.disable();
                  }
                });
            }else{
              if(response.length >1){
                this.BuscaProducto();
                this.loading = false;
              }
            }
          } else {
            this.loading = false;
          }
        } else {
          this.loading = false;
        }
      }, error => {
        this.loading = false;
        console.log('error',error);
      }
      );
    }
  }


  BuscaProducto(){

    this._BSModalRef = this._BsModalService.show(BusquedaproductosComponent, this.setModalBusquedaProductos());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response != null){
        if (response != undefined) {
          this.FormConsultaSaldosBodega.get('codigo').setValue(response.codigo);
          this.FormConsultaSaldosBodega.get('descripcion').setValue(response.descripcion);
          this.FormConsultaSaldosBodega.get('tipoproducto').setValue(response.desctiporegistro);

          this._BusquedaproductosService.BuscarSaldosPorBodegas(response.mein,
            this.servidor,this.hdgcodigo,this.esacodigo,this.cmecodigo, this.usuario).subscribe(
              response => {
                if (response != null){
                  this.detallessaldos = response;
                  this.detallessaldosPaginacion = this.detallessaldos.slice(0,20);
                  this.FormConsultaSaldosBodega.controls.codigo.disable();
                  this.FormConsultaSaldosBodega.controls.descripcion.disable();
                }
            });
        }
      }
    });
  }



  setModalBusquedaProductos() {
    // console.log("cod y desc",this.codprod, this.descprod)
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: 'Búsqueda de Productos', // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        tipo_busqueda: 'Todo-Medico',
        // id_Bodega: this.FormConsultaKardex.value.boddestino,
        descprod: this.descprod,
        codprod: this.codprod,
      }
    };
    return dtModal;
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.detallessaldosPaginacion = this.detallessaldos.slice(startItem, endItem);
  }

  Limpiar(){
    this.FormConsultaSaldosBodega.reset();
    this.detallessaldos = [];
    this.detallessaldosPaginacion = [];
    this.FormConsultaSaldosBodega.controls.codigo.enable();
    this.FormConsultaSaldosBodega.controls.descripcion.enable();
    this.descprod = null;
    this.codprod = null;
  }

  salir() {
    const Swal = require('sweetalert2');

    if(
      this.codigo_aux        !== this.FormConsultaSaldosBodega.get('codigo').value ||
      this.descripcion_aux             !== this.FormConsultaSaldosBodega.get('descripcion').value ||
      this.tipoproducto_aux           !== this.FormConsultaSaldosBodega.get('tipoproducto').value
      // this.fechaaux               !== this.FormCreaSolicitud.get('fecha').value ||
      // this.bodcodigoaux           !== this.FormCreaSolicitud.get('bodcodigo').value ||
      // this.codbodegasuministroaux !== this.FormCreaSolicitud.get('codbodegasuministro').value
       ){
      this.msj = true;
    }

    if(this.detallessaldosPaginacion_aux.length !== this.detallessaldosPaginacion.length ||
    this.detallessaldos_aux.length !== this.detallessaldos.length ){
      this.msj = true;
    }

    if(this.msj){
      Swal.fire({
        title: 'Limpiar',
        text: "¿Seguro que desea Limpiar los campos?",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si'
      }).then((result) => {
        if (result.value) {
          this.route.paramMap.subscribe(param => {
            this.router.navigate(['home']);
          })
        }
      });
    }else{
      this.route.paramMap.subscribe(param => {
        this.router.navigate(['home']);
      })
    }
  }

}
