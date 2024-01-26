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
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-librocontrolado',
  templateUrl: './librocontrolado.component.html',
  styleUrls: ['./librocontrolado.component.css'],
  providers : [InformesService,LibrocontroladoService]
})
export class LibrocontroladoComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;


  public modelopermisos              : Permisosusuario = new Permisosusuario();
  public FormLibroControlado         : FormGroup;
  public bodegascontroladas          : BodegasControladas[] = [];
  public prodsbodegascontroladas     : LibroControlado[] = [];
  public prodsbodegascontroladaspaginacion : LibroControlado[] = [];
  public hdgcodigo                   : number;
  public esacodigo                   : number;
  public cmecodigo                   : number;
  public usuario                     = environment.privilegios.usuario;
  public servidor                    = environment.URLServiciosRest.ambiente;
  private _BSModalRef                : BsModalRef;
  public imprimelibro                : boolean = false;
  public cierralibro                 : boolean = false;
  public locale                      = 'es';
  public bsConfig                    : Partial<BsDatepickerConfig>;
  public colorTheme                  = 'theme-blue';
  public loading                     : boolean = false;
  bsModalRef                         : any;
  editField                          : any;

  public msj : boolean = false;

  constructor(
    private formBuilder           : FormBuilder,
    private _bodegasService       : BodegasService,
    public localeService          : BsLocaleService,
    public _libroService          : LibrocontroladoService,
    private route                 : ActivatedRoute,
    private router                : Router,
    public datePipe               : DatePipe,
    private _imprimelibroService  : InformesService,
    public translate: TranslateService
  ) {

    this.FormLibroControlado = this.formBuilder.group({
      codigo      : [{ value: null, disabled: false }, Validators.required],
      fecha       : [{ value: new Date(), disabled: false }, Validators.required],
      bodcodigo   : [{ value: null, disabled: false }, Validators.required],
      cantidad    : [{ value: null, disabled: false }, Validators.required],
    });
   }

  ngOnInit() {
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
    this.FormLibroControlado.get('fecha').setValue(new Date);
    // this.FormLibroControlado.controls.fecha.disable();
    this.BuscaBodegaDespachadora();
  }

  limpiar(){
    const Swal = require('sweetalert2');
    if (this.prodsbodegascontroladas.length > 0 ||
      this.prodsbodegascontroladaspaginacion.length > 0 ){
        this.msj = true;
    }

    if( this.msj ){
      Swal.fire({
        title:  this.TranslateUtil('key.button.limpiar.L'),
        text: this.TranslateUtil('key.mensaje.pregunta.seguro.desea.limpiar.sin.guardar'),
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.TranslateUtil('key.si')
      }).then((result) => {
        if (result.value) {
          this.FormLibroControlado.reset();
          this.prodsbodegascontroladaspaginacion = [];
          this.prodsbodegascontroladas= [];
          this.cierralibro = false;
          this.imprimelibro = false;
          this.FormLibroControlado.get('bodcodigo').setValue(null);
          this.setDate();
        }
      });
    } else {
      this.FormLibroControlado.reset();
      this.prodsbodegascontroladaspaginacion = [];
      this.prodsbodegascontroladas= [];
      this.cierralibro = false;
      this.imprimelibro = false;
      this.FormLibroControlado.get('bodcodigo').setValue(null);
      this.setDate();
    }
  }

  BuscaBodegaDespachadora(){
    this._bodegasService.BuscaBodegasControlados(this.hdgcodigo, this.esacodigo, this.cmecodigo,
      this.usuario, this.servidor).subscribe(
      response => {
        if (response != null) {
          this.bodegascontroladas = response;
        }
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.cargo'));
      }
    );
  }

  ActivaBotonBusqueda(){
    if (this.FormLibroControlado.value.bodcodigo > 0){
      this.BuscarProductos();
    }
  }



  BuscarProductos(){
    // console.log("Busca productos de la bodega",this.servidor, this.hdgcodigo,this.esacodigo,
    // this.cmecodigo,this.FormLibroControlado.value.bodcodigo);
    this._libroService.BuscaProductoBodegaControl(this.servidor,this.hdgcodigo, this.esacodigo,
    this.cmecodigo,this.FormLibroControlado.value.bodcodigo ).subscribe(
      response => {
        if (response != null) {
          this.prodsbodegascontroladas = response;
          this.prodsbodegascontroladaspaginacion = this.prodsbodegascontroladas.slice(0,20);
          this.cierralibro = true;
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
    this.prodsbodegascontroladaspaginacion = this.prodsbodegascontroladas.slice(startItem, endItem);
  }

  ConfirmaGenerarLibroFraccionado(){

    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.generar.nuevo.cierre'),
      text: this.TranslateUtil('key.mensaje.confirmar.grabacion'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.GrabaCierreLibro();
      }
    })
  }

  GrabaCierreLibro(){
    this.loading = true;
    let fecha = this.datePipe.transform(this.FormLibroControlado.controls.fecha.value, 'dd/MM/yyyy HH:mm:ss');
    this._libroService.GrabaCierreLibroControlado(this.hdgcodigo, this.esacodigo,
      this.cmecodigo,this.servidor,this.usuario,this.FormLibroControlado.value.bodcodigo,
      fecha ).subscribe(
        response => {
          if (response != null) {
            if (response.estado) {
              this.alertSwal.title = this.TranslateUtil('key.mensaje.libro.generado.exitosamente');
              this.alertSwal.show();
              this.imprimelibro = true;
              this.cierralibro = false;
              this.loading = false;
            } else {
              console.log(response.mensaje.substr(1,1));
              if (response.mensaje.substr(0,1) == '0') {
                this.alertSwalAlert.title = "YA EXISTE UN CIERRE CON FECHA " + fecha;
                this.alertSwalAlert.show();
                this.loading = false;
              } else {
                this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.grabar.cierre.libro.controlado');
                this.alertSwalError.text = response.mensaje;
                this.alertSwalError.show();
                this.loading = false;
              }
            }
          }
        },
        error => {
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.grabar.cierre.libro.controlado');
          this.alertSwalError.text = error;
          this.alertSwalError.show();
          this.loading = false;
        }
      );


  }

  onImprimir(){
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.desea.imprimir.cierre.libro.controlado'),
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

    // console.log("Imprime el reporte de Libro controlado",this.servidor,this.usuario,
    // this.hdgcodigo,this.esacodigo, this.cmecodigo,"pdf", this.FormLibroControlado.value.bodcodigo);

    this._imprimelibroService.RPTImprimeCierreLibroControlado(this.servidor,this.usuario,
    this.hdgcodigo,this.esacodigo, this.cmecodigo,"pdf",this.FormLibroControlado.value.bodcodigo).subscribe(
      response => {
        if (response != null) {
          window.open(response[0].url, "", "");
          // window.open(response[0].url, "", "", true);
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
    if (this.prodsbodegascontroladas.length > 0 ||
      this.prodsbodegascontroladaspaginacion.length > 0 ){
        this.msj = true;
    }

    if (this.msj ) {
      Swal.fire({
        title: this.TranslateUtil('key.title.salir'),
        text: this.TranslateUtil('key.mensaje.pregunta.confirma.salir.sin.guardar'),
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.TranslateUtil('key.si')
      }).then((result) => {
        if (result.value) {
    this.router.navigate(['home']);
        }
      });
    } else {
      this.router.navigate(['home']);
    }
  }
  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
