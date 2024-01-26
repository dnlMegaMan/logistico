import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BodegasDespachadoras } from 'src/app/models/entity/BodegasDespachadoras';
import { BodegasService } from '../../servicios/bodegas.service';
import { InformesService } from '../../servicios/informes.service';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { BodegasControladas } from '../../models/entity/BodegasControladas';
import { LibrocontroladoService } from 'src/app/servicios/librocontrolado.service';
import { LibroControlado } from 'src/app/models/entity/LibroControlado';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { BodegasTodas } from 'src/app/models/entity/BodegasTodas';
import { InventariosService } from 'src/app/servicios/inventarios.service';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { Articulos } from 'src/app/models/entity/mantencionarticulos';
import { ActivatedRoute, Router } from '@angular/router';
import {TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'app-cierrekardex',
  templateUrl: './cierrekardex.component.html',
  styleUrls: ['./cierrekardex.component.css'],
  providers: [LibrocontroladoService,InformesService]

})
export class CierrekardexComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public modelopermisos              : Permisosusuario = new Permisosusuario();
  public FormCierreKardex            : FormGroup;
  public bodegascontroladas          : BodegasControladas[] = [];
  public hdgcodigo                   : number;
  public esacodigo                   : number;
  public cmecodigo                   : number;
  public usuario                     = environment.privilegios.usuario;
  public servidor                    = environment.URLServiciosRest.ambiente;
  private _BSModalRef                : BsModalRef;
  public activbusqueda               : boolean = false;
  public imprimecierrekardex         : boolean = false;
  public cierrakardex                : boolean = false;
  public loading                     : boolean = false;
  public locale                      = 'es';
  public bsConfig                    : Partial<BsDatepickerConfig>;
  public colorTheme                  = 'theme-blue';
  bsModalRef                         : any;
  editField                          : any;
  public bodegasSolicitantes         : Array<BodegasTodas> = [];
  public prodsbodegaskardex          : LibroControlado[] = [];
  public prodsbodegaskardexpaginacion: LibroControlado[] = [];

  public msj : boolean = false;

  constructor(
    public formBuilder            : FormBuilder,
    public _BodegasService        : BodegasService,
    public localeService          : BsLocaleService,
    private _inventarioService: InventariosService,
    private _imprimelibroService  : InformesService,
    public _BusquedaproductosService: BusquedaproductosService,
    private router                  : Router,
    private route                   : ActivatedRoute,
    public translate: TranslateService
  )
  {
    this.FormCierreKardex = this.formBuilder.group({
      codigo      : [{ value: null, disabled: false }, Validators.required],
      fecha       : [{ value: new Date(), disabled: false }, Validators.required],
      bodcodigo   : [{ value: null, disabled: false }, Validators.required],
      cantidad    : [{ value: null, disabled: false }, Validators.required],
    });
  }

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.setDate();
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.BuscaBodegaDespachadora();
  }

  limpiar(){
    const Swal = require('sweetalert2');
    if (this.prodsbodegaskardexpaginacion.length > 0 ||
      this.prodsbodegaskardex.length > 0 ) {
        this.msj = true;
    }
    if (this.msj) {
      Swal.fire({
        title: this.TranslateUtil('key.button.limpiar.L'),
        text: this.TranslateUtil('key.mensaje.pregunta.seguro.desea.limpiar.campos'),
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.TranslateUtil('key.si')
      }).then((result) => {
        if (result.value) {
    this.FormCierreKardex.reset();
    this.activbusqueda= false;
    this.prodsbodegaskardexpaginacion = [];
    this.prodsbodegaskardex= [];
    this.cierrakardex = false;
    this.imprimecierrekardex = false;
    this.FormCierreKardex.get('fecha').setValue(new Date());
        }
      });
    }else{
      this.FormCierreKardex.reset();
      this.activbusqueda= false;
      this.prodsbodegaskardexpaginacion = [];
      this.prodsbodegaskardex= [];
      this.cierrakardex = false;
      this.imprimecierrekardex = false;
      this.FormCierreKardex.get('fecha').setValue(new Date());
    }
  }

  BuscaBodegaDespachadora(){
    this._BodegasService.listaBodegaTodasSucursal(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor).subscribe(
      response => {
        if (response != null){
          this.bodegasSolicitantes = response;
        }
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.cargo'));
      }
    );

  }

  ActivaBotonBusqueda(){
    this.activbusqueda= true;
  }

  BuscarProductos(){
    // console.log("Busca productos de la bodega",this.servidor, this.hdgcodigo,this.esacodigo,
    // this.cmecodigo,this.FormLibroControlado.value.bodcodigo);
    this.loading = true;

    this._BodegasService.BuscaProductoBodegaControl(this.servidor,this.hdgcodigo, this.esacodigo,
    this.cmecodigo,this.FormCierreKardex.value.bodcodigo ).subscribe(
      response => {
        if (response != null){
          this.prodsbodegaskardex = response;
          this.prodsbodegaskardexpaginacion = this.prodsbodegaskardex.slice(0,20);
          this.cierrakardex = true;
        }
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.productos.bodegas'));
      }
    );
  }

  /* Función búsqueda con paginación */
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.prodsbodegaskardexpaginacion = this.prodsbodegaskardex.slice(startItem, endItem);
  }

  ConfirmaGenerarCierreKardex(){

    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.confirmar.grabar.cierre.kardex'),
      text: this.TranslateUtil('key.mensaje.confirmar.grabacion'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.GrabaCierreKardex();
      }
    })
  }

  GrabaCierreKardex(){
    console.log("Dato a grabar en el cierre",this.hdgcodigo, this.esacodigo,
    this.cmecodigo,this.servidor,this.usuario,this.FormCierreKardex.value.bodcodigo);

    this._inventarioService.GrabaCierreKardex(this.hdgcodigo, this.esacodigo,
      this.cmecodigo,this.servidor,this.usuario,this.FormCierreKardex.value.bodcodigo ).subscribe(
        response => {
          if (response != null){
            this.alertSwal.title = this.TranslateUtil('key.mensaje.kardex.cerrado.exitosamente');
            this.alertSwal.show();
            this.imprimecierrekardex = true;
            this.cierrakardex= false;
            // this.prodsbodegascontroladas = response;
            // this.prodsbodegascontroladaspaginacion = this.prodsbodegascontroladas.slice(0,11);
          }
        },
        error => {
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.grabar.cierre.kardex');
          this.alertSwalError.text = error;
          this.alertSwalError.show();
        }
      );


  }

  onImprimir(){
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.imprimir.cierre.kardex'),
      text: this.TranslateUtil('key.mensaje.confirmar.impresion'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.ImprimirLibro();
      }
    })

  }

  ImprimirLibro() {

    console.log("Imprime el reporte de Cierre kardex",this.servidor,this.usuario,
    this.hdgcodigo,this.esacodigo, this.cmecodigo,"pdf", this.FormCierreKardex.value.bodcodigo);

    this._imprimelibroService.RPTImprimeCierreKardex(this.servidor,this.usuario,
    this.hdgcodigo,this.esacodigo, this.cmecodigo,"pdf",this.FormCierreKardex.value.bodcodigo).subscribe(
      response => {
        if (response != null){
          window.open(response[0].url, "", "", true);
          // this.alertSwal.title = "Reporte Impreso Correctamente";
          // this.alertSwal.show();
        }
      },
      error => {
        console.log(error);
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.cierre');
        this.alertSwalError.show();
        // this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
        // })
      }
    );
  }

  salir(){
    const Swal = require('sweetalert2');
    if (this.prodsbodegaskardexpaginacion.length > 0 ||
      this.prodsbodegaskardex.length > 0 ) {
        this.msj = true;
    }

    if(this.msj){
      Swal.fire({
        title: this.TranslateUtil('key.title.salir'),
        text: this.TranslateUtil('key.mensaje.pregunta.confirma.salir.sin.guardar'),
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.TranslateUtil('key.si')
      }).then((result) => {
        if (result.value) {
          this.route.paramMap.subscribe(param => {
            this.router.navigate(['home']);
        })
        }
      });
    } else {
      this.route.paramMap.subscribe(param => {
        this.router.navigate(['home']);
      })
    }
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
