import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BodegasService } from '../../servicios/bodegas.service';
import { BodegasTodas } from 'src/app/models/entity/BodegasTodas';
import { BodegasrelacionadaAccion } from 'src/app/models/entity/BodegasRelacionadas';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { DatePipe } from '@angular/common';
import { Plantillas } from 'src/app/models/entity/PlantillasBodegas';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { EstructuraunidadesService } from 'src/app/servicios/estructuraunidades.service';
import { Servicio } from 'src/app/models/entity/Servicio';
import {TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'app-busquedaplantillasbodega',
  templateUrl: './busquedaplantillasbodega.component.html',
  styleUrls: ['./busquedaplantillasbodega.component.css']
})
export class BusquedaplantillasbodegaComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  @Input() hdgcodigo: number;
  @Input() esacodigo: number;
  @Input() cmecodigo: number;
  @Input() titulo: string;
  @Input() tipoplantilla: boolean;
  @Input() descripcion: string;
  @Input() codservicio: string;
  @Input() codsolicitante: number;
  @Input() codsuministro: number;
  @Input() vigencia: number;
  @Input() codbodsolic : number;
  @Input() tipopedido: number;


  public FormBusquedaPlantillas : FormGroup;
  public bodegasSolicitantes    : Array<BodegasTodas> = [];
  public onClose                : Subject<Plantillas>;
  public estado                 : boolean = false;
  public loading                = false;
  public servidor               = environment.URLServiciosRest.ambiente;
  public usuario                = environment.privilegios.usuario;
  public bodegassuministro      : Array<BodegasrelacionadaAccion> = [];
  public bsConfig               : Partial<BsDatepickerConfig>;
  public listaplantillaspaginacion: Array<Plantillas> = [];
  public listaplantillas        : Array<Plantillas> = [];
  public locale                 = 'es';
  public colorTheme             = 'theme-blue';
  public _PageChangedEvent      : PageChangedEvent;
  public arregloservicios       : Servicio[] = [];
  public pplantipo              : number = 0;
  public codplantilla           = null;

  constructor(
    public formBuilder    : FormBuilder,
    public bsModalRef     : BsModalRef,
    public _BodegasService: BodegasService,
    public localeService  : BsLocaleService,
    public datePipe       : DatePipe,
    private _unidadesService: EstructuraunidadesService,
    public translate: TranslateService
  ) {

    this.FormBusquedaPlantillas = this.formBuilder.group({
      numplantilla: [{ value: null, disabled: false }, Validators.required],
      descripcion : [{ value: null, disabled: false }, Validators.required],
      estado      : [{ value: null, disabled: false }, Validators.required],
      fechadesde  : [new Date(), Validators.required],
      fechahasta  : [new Date(), Validators.required],
      bodcodigo   : [{ value: null, disabled: false }, Validators.required],
      bodsuministro: [{ value: null, disabled: false }, Validators.required],
      serviciocod : [{ value: null, disabled: false }, Validators.required],
    });
  }

  ngOnInit() {
    this.onClose = new Subject();
    this.setDate();
    this._BodegasService.listaBodegaTodasSucursal(this.hdgcodigo, this.esacodigo, this.cmecodigo, sessionStorage.getItem('Usuario'), this.servidor).subscribe(
      response => {
        if (response != null){
          this.bodegasSolicitantes = response;
        }
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.cargo'));
      }
    );

    this._unidadesService.BuscarServicios(this.hdgcodigo, this.esacodigo, this.cmecodigo, sessionStorage.getItem('Usuario'), this.servidor, 0, '').subscribe(
      response => {
        if (response != null){
          this.arregloservicios = response;
        }
      }
    );

    if (this.tipoplantilla == true) {
      this.FormBusquedaPlantillas.get('descripcion').setValue(this.descripcion);
      this.FormBusquedaPlantillas.get('bodcodigo').setValue(this.codsolicitante);
      this.BuscaBodegasSuministro(this.codsolicitante);
      this.FormBusquedaPlantillas.get('bodsuministro').setValue(this.codsuministro);
      this.FormBusquedaPlantillas.get('estado').setValue(this.vigencia);
    }
    else  {
      this.FormBusquedaPlantillas.get('descripcion').setValue(this.descripcion);
      this.FormBusquedaPlantillas.get('serviciocod').setValue(this.codservicio);
      this.FormBusquedaPlantillas.get('estado').setValue(this.vigencia);
    }

    this.BuscarPlantillasFiltro();

  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  ngAfterViewInit() {
    this.BuscarPlantillasFiltro();
  }

  Limpiar() {
    this.FormBusquedaPlantillas.reset();
    this.FormBusquedaPlantillas.get('fechadesde').setValue(new Date());
    this.FormBusquedaPlantillas.get('fechahasta').setValue(new Date());
    this.listaplantillaspaginacion = [];
    this.listaplantillas = [];
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.listaplantillaspaginacion = this.listaplantillas.slice(startItem, endItem);
  }

  onCerrarSalir() {
    this.estado = true;
    this.onClose.next();
    this.bsModalRef.hide();
  };

  onCerrar(PlantillaSeleccionada: Plantillas) {
    this.estado = true;
    this.onClose.next(PlantillaSeleccionada);
    this.bsModalRef.hide();
  };

  BuscaBodegasSuministro(codbodega_solicitante: number) {
    var servidor = environment.URLServiciosRest.ambiente;
    var usuario = environment.privilegios.usuario;


    this._BodegasService.listaBodegaRelacionadaAccion(this.hdgcodigo, this.esacodigo, this.cmecodigo, sessionStorage.getItem('Usuario'), servidor, codbodega_solicitante, 1).subscribe(
      response => {
        if (response != null){
          this.bodegassuministro = response;
        }
      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.destino'));
      }
    );
  }

  BuscarPlantillasFiltro() {
    var fechadesde = this.FormBusquedaPlantillas.value.fechadesde;
    var fechahasta = this.FormBusquedaPlantillas.value.fechahasta;
    var bodegasolic = null;
    // PPLANTIPO NUMERICO 1= BODEGA Y 2 servicio
    if (this.tipoplantilla == true) {
      this.pplantipo = 1;
    } else {
      if (this.tipoplantilla == false) {
        this.pplantipo = 2;
      }
    }
    this.loading = true;

    if(this.codbodsolic >0){
      bodegasolic = this.codbodsolic
    }else{
      // if(this.codbodsolic == null){
        bodegasolic = this.FormBusquedaPlantillas.value.bodcodigo;
      // }
    }
    if(bodegasolic === null && this.FormBusquedaPlantillas.value.bodsuministro === null){
      bodegasolic = 0;
      this.FormBusquedaPlantillas.value.bodsuministro = 0;
      console.log("bodegas en null",bodegasolic, this.FormBusquedaPlantillas.value.bodsuministro)
    }
    this._BodegasService.BuscaPlantillasCabecera(this.servidor, sessionStorage.getItem('Usuario'), this.hdgcodigo, this.esacodigo,
      this.cmecodigo, this.FormBusquedaPlantillas.value.numplantilla,
      this.FormBusquedaPlantillas.value.descripcion,
      this.datePipe.transform(this.FormBusquedaPlantillas.value.fechadesde, 'yyyy-MM-dd'),
      this.datePipe.transform(this.FormBusquedaPlantillas.value.fechahasta, 'yyyy-MM-dd'),
      bodegasolic, this.FormBusquedaPlantillas.value.bodsuministro,
      this.FormBusquedaPlantillas.value.estado, this.FormBusquedaPlantillas.value.serviciocod,
      this.pplantipo,this.tipopedido).subscribe(
        response => {
          if(response === null){
            console.log("response:",response)
            this.alertSwalError.title = this.TranslateUtil('key.mensaje.no.encuentra.plantilla.buscada');
            this.alertSwalError.text = this.TranslateUtil('key.mensaje.no.existe.plantilla');
            this.alertSwalError.show();
            this.loading = false;
          }else{
            if (response.length == 0) {
              this.alertSwalError.title = this.TranslateUtil('key.mensaje.no.encuentra.plantilla.buscada');
              this.alertSwalError.text = this.TranslateUtil('key.mensaje.no.existe.plantilla');
              this.alertSwalError.show();
              this.loading = false;
            } else {
              if (response.length > 0) {
                this.listaplantillas = response;
                this.listaplantillaspaginacion = this.listaplantillas.slice(0, 8);
                this.loading = false;
              }
            }
          }
        },
        error => {
          console.log(error);
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.buscar.plantilla');
          this.alertSwalError.text = this.TranslateUtil('key.mensaje.no.existe.plantilla');
          this.alertSwalError.show();
          this.loading = false;
        }
      )
  }

  getPlantilla(){
    this.codplantilla = this.FormBusquedaPlantillas.controls.numplantilla.value;
    if (this.codplantilla === null || this.codplantilla === '' ) {
      return;
    } else {
      if (this.tipoplantilla == true) {
        this.pplantipo = 1;
      } else {
        if (this.tipoplantilla == false) {
          this.pplantipo = 2;
        }
      }
      this.loading = true;
      var bodegasolic = null;
      if(this.codbodsolic >0){
        bodegasolic = this.codbodsolic
      }else{
        // if(this.codbodsolic == null){
          bodegasolic = this.FormBusquedaPlantillas.value.bodcodigo;
        // }
      }
      this._BodegasService.BuscaPlantillasCabecera(this.servidor, sessionStorage.getItem('Usuario'), this.hdgcodigo, this.esacodigo,
        this.cmecodigo, this.FormBusquedaPlantillas.value.numplantilla,
        this.FormBusquedaPlantillas.value.descripcion,
        this.datePipe.transform(this.FormBusquedaPlantillas.value.fechadesde, 'yyyy-MM-dd'),
        this.datePipe.transform(this.FormBusquedaPlantillas.value.fechahasta, 'yyyy-MM-dd'),
        bodegasolic, this.FormBusquedaPlantillas.value.bodsuministro,
        this.FormBusquedaPlantillas.value.estado, this.FormBusquedaPlantillas.value.serviciocod,
        this.pplantipo,this.tipopedido).subscribe(
          response => {
            if(response === null){
              console.log("response:",response)
              this.alertSwalError.title = this.TranslateUtil('key.mensaje.no.encuentra.plantilla.buscada');
              this.alertSwalError.text = this.TranslateUtil('key.mensaje.no.existe.plantilla');
              this.alertSwalError.show();
              this.loading = false;
            }else{
              if (response.length == 0 ) {
                this.alertSwalError.title = this.TranslateUtil('key.mensaje.no.encuentra.plantilla.buscada');
                this.alertSwalError.text = this.TranslateUtil('key.mensaje.no.existe.plantilla');
                this.alertSwalError.show();
                this.loading = false;
              } else {
                if (response.length > 0) {
                  this.listaplantillas = response;
                  this.listaplantillaspaginacion = this.listaplantillas.slice(0, 8);
                  this.loading = false;
                }
              }
            }
          },
          error => {
            console.log(error);
            this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.buscar.plantilla');
            this.alertSwalError.text = this.TranslateUtil('key.mensaje.no.existe.plantilla');;
            this.alertSwalError.show();
            this.loading = false;
          });
    }
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
