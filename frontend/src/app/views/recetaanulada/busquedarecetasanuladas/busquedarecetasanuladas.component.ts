import { Component, OnInit , Input, ViewChild} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { environment } from '../../../../environments/environment';
import { Subject } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { TipoAmbito } from '../../../models/entity/TipoAmbito'
import { TipoambitoService } from '../../../servicios/tiposambito.service';
import { DocIdentificacion } from '../../../models/entity/DocIdentificacion';
import { DocidentificacionService } from '../../../servicios/docidentificacion.service';
import { EstadoSolicitud } from '../../../models/entity/EstadoSolicitud';
import { TipoRegistro } from '../../../models/entity/TipoRegistro';
import { TiporegistroService } from '../../../servicios/tiporegistro.service';
import { ListaPacientes } from 'src/app/models/entity/ListaPacientes';
import { BuscasolicitudespacientesService } from '../../../servicios/buscasolicitudespacientes.service'
import { DispensaSolicitud } from 'src/app/models/entity/DispensaSolicitud';
import { DetalleSolicitud } from 'src/app/models/entity/DetalleSolicitud';
import { SolicitudService } from 'src/app/servicios/Solicitudes.service';
import { Prioridades } from '../../../models/entity/Prioridades';
import { PrioridadesService } from '../../../servicios/prioridades.service';
import { Unidades } from '../../../models/entity/Unidades';
import { Piezas } from '../../../models/entity/Piezas';
import { Camas } from '../../../models/entity/Camas';
import { EstructuraunidadesService } from '../../../servicios/estructuraunidades.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { validateRUT, getCheckDigit, generateRandomRUT, clearRUT } from 'validar-rut'
import { InformesService } from 'src/app/servicios/informes.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-busquedarecetasanuladas',
  templateUrl: './busquedarecetasanuladas.component.html',
  styleUrls: ['./busquedarecetasanuladas.component.css'],
  providers : [BuscasolicitudespacientesService,InformesService]
})
export class BusquedarecetasanuladasComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @Input() hdgcodigo: number;
  @Input() esacodigo: number;
  @Input() cmecodigo: number;
  @Input() titulo: string;
  @Input() cliid: string;
  @Input() ambito: number;
  @Input() tipodocumento: number;
  @Input() numeroidentificacion: string;
  @Input() apepaternopac: string;
  @Input() apematernopac: string;
  @Input() nombrepaciente: string;
  @Input() codservicioactual: string;
  @Input() buscasolicitud : string;
  @Input() filtrodenegocio : string;
  @Input() paginaorigen: number;
  @Input() solicitudorigen: number;

  public onClose                     : Subject<ListaPacientes>;
  public loading = false;

  public FormBusquedaRecAnu          : FormGroup;
  private _BSModalRef                 : BsModalRef;
  public locale                      = 'es';
  public bsConfig                    : Partial<BsDatepickerConfig>;
  public colorTheme                  = 'theme-blue';
  public tiposambitos                : Array<TipoAmbito> = [];
  public docsidentis                 : Array<DocIdentificacion> = [];
  public estadossolicitudes          : Array<EstadoSolicitud> = [];
  public tiposderegistros            : Array<TipoRegistro> = [];
  listasolicitudespacientes          : Array<DispensaSolicitud> =[];
  listasolicitudespacientespaginacion: Array<DetalleSolicitud>=[];

  public estado                      : boolean = false;
  public servidor                    = environment.URLServiciosRest.ambiente;
  public usuario                     = environment.privilegios.usuario;
  /* para datepicker */
  public vfechainicio: string;
  public vfechatermino: string;

  public page :number;
  constructor(
    public bsModalRef                 : BsModalRef,
    public formBuilder                : FormBuilder,
    public datePipe                   : DatePipe,
    public localeService              : BsLocaleService,
    private TipoambitoService         : TipoambitoService,
    private DocidentificacionService  : DocidentificacionService,
    private EstadosolicitudService    : SolicitudService,
    private TiporegistroService       : TiporegistroService,
    private _buscasolicitudService    : SolicitudService,
    private PrioridadesService        : PrioridadesService,
    public estructuraunidadesService  : EstructuraunidadesService,
    private _imprimesolicitudService  : InformesService,
    public translate: TranslateService
  ) {
    this.FormBusquedaRecAnu = this.formBuilder.group({
      receid              : [{ value: null, disabled: false }, Validators.required],
      fechadesde          : [new Date(), Validators.required],
      fechahasta          : [new Date(), Validators.required],
      ambito              : [{ value: null, disabled: false }, Validators.required],
      tipoidentificacion  : [{ value: null, disabled: false }, Validators.required],
      numeroidentificacion: [{ value: null, disabled: false }, Validators.required],
      nombrepaciente      : [{ value: null, disabled: false }, Validators.required],
      apellidopaterno     : [{ value: null, disabled: false }, Validators.required],
      apellidomaterno     : [{ value: null, disabled: false }, Validators.required],
    });
   }

  ngOnInit() {
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.onClose = new Subject();
    this.setDate();

    this.TipoambitoService.list(this.hdgcodigo,this.esacodigo,this.cmecodigo,this.usuario,this.servidor).subscribe(
      data => {
        this.tiposambitos = data;

      }, err => {
      }
    );

    this.TiporegistroService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario,this.servidor).subscribe(
      data => {
        this.tiposderegistros = data;

      }, err => {
      }
    );
    this.EstadosolicitudService.list(this.usuario,this.servidor).subscribe(
      data => {
        this.estadossolicitudes = data;

      }, err => {
      }
    );

    this.DocidentificacionService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario, this.servidor, localStorage.getItem('language'), false).subscribe(
      data => {
        this.docsidentis = data;
      }, err => {
      }
    );
  }

  onCerrar(pacienteseleccionado:  ListaPacientes) {
    this.estado = true;
    this.onClose.next(pacienteseleccionado);
    this.bsModalRef.hide();
  };

  onSalir()
  {
    this.onClose.next();
    this.bsModalRef.hide();
  };

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  async BuscarSolicitudesPacientes(){
    this.listasolicitudespacientespaginacion = [];
    this.listasolicitudespacientes = [];
    var fechadesde=this.datePipe.transform(this.FormBusquedaRecAnu.value.fechadesde, 'yyyy-MM-dd');
    var fechahasta=this.datePipe.transform(this.FormBusquedaRecAnu.value.fechahasta, 'yyyy-MM-dd');
    var receid : number = this.FormBusquedaRecAnu.controls.receid.value;
    var tipoidentificacion : number = this.FormBusquedaRecAnu.controls.tipoidentificacion.value;
    var numeroidentificacion : string = this.FormBusquedaRecAnu.controls.numeroidentificacion.value;
    var nombrepaciente : string = this.FormBusquedaRecAnu.controls.nombrepaciente.value;
    var apellidopaterno : string = this.FormBusquedaRecAnu.controls.apellidopaterno.value;
    var apellidomaterno : string = this.FormBusquedaRecAnu.controls.apellidomaterno.value;
    const servicio = this.FormBusquedaRecAnu.value.servicio;

    this.loading = true;

    this._buscasolicitudService.BuscaSolicitudCabecera(
      Number(this.FormBusquedaRecAnu.controls.receid.value),this.hdgcodigo,
      this.esacodigo,this.cmecodigo,0,fechadesde,fechahasta,0,0,
      parseInt(this.FormBusquedaRecAnu.value.estado),
      this.servidor, parseInt(this.FormBusquedaRecAnu.value.prioridad),
      parseInt(this.FormBusquedaRecAnu.controls.ambito.value),
      parseInt(this.FormBusquedaRecAnu.value.servicio),
      parseInt(this.FormBusquedaRecAnu.value.pieza),
      parseInt(this.FormBusquedaRecAnu.value.cama),
      parseInt(this.FormBusquedaRecAnu.value.tipoidentificacion),
      this.FormBusquedaRecAnu.value.numeroidentificacion,
      this.filtrodenegocio,
      this.solicitudorigen
      ,this.usuario,"","",
      this.paginaorigen, servicio,
      receid, tipoidentificacion,
      numeroidentificacion, nombrepaciente,
      apellidopaterno, apellidomaterno).subscribe(
      response => {
        if (response != null) {
          this.listasolicitudespacientes= response;
          this.listasolicitudespacientespaginacion = this.listasolicitudespacientes.slice(0,8);
          this.loading = false;
        } else {
          this.loading = false;
        }
      },
      error => {
        this.loading = false;
        this.alertSwalError.title=this.TranslateUtil('key.mensaje.error.buscar.solicitudes');
        this.alertSwalError.text=this.TranslateUtil('key.mensaje.no.encuentra.solicitudes');
        this.alertSwalError.show();
      });
  }

  Limpiar(){
    this.listasolicitudespacientes = [];
    this.listasolicitudespacientespaginacion = [];
    this.listasolicitudespacientespaginacion = [];
    this.FormBusquedaRecAnu.reset();
  }

  onCerrarSalir() {
    this.estado = true;
    this.onClose.next();
    this.bsModalRef.hide();
  };

  validaRut(){
    if (this.FormBusquedaRecAnu.controls.numeroidentificacion.value != undefined &&
        this.FormBusquedaRecAnu.controls.numeroidentificacion.value != null){
      const newRut = this.FormBusquedaRecAnu.controls.numeroidentificacion.value.replace(/\./g,'').replace(/\-/g, '').trim().toLowerCase();
      const lastDigit = newRut.substr(-1, 1);
      const rutDigit = newRut.substr(0, newRut.length-1)
      let format = '';
      for (let i = rutDigit.length; i > 0; i--) {
        const e = rutDigit.charAt(i-1);
        format = e.concat(format);
        if (i % 3 === 0){
          format = ''.concat(format);
        }
      }
      this.FormBusquedaRecAnu.get('numeroidentificacion').setValue(format.concat('-').concat(lastDigit));
    }
  }

  onImprimirLista() {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.imprimir'),
      text: this.TranslateUtil('key.mensaje.confirmar.impresion'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.ImprimirRecetas();
      }
    });
  }

  ImprimirRecetas() {
    var ambito : number;
    var fechadesde : string = this.datePipe.transform(this.FormBusquedaRecAnu.controls.fechadesde.value, 'yyyy-MM-dd');
    var fechahasta : string = this.datePipe.transform(this.FormBusquedaRecAnu.controls.fechahasta.value, 'yyyy-MM-dd');
    var receid : number;
    var tipoidentificacion : number;
    var numeroidentificacion : string = this.FormBusquedaRecAnu.controls.numeroidentificacion.value;
    var nombrepaciente : string = this.FormBusquedaRecAnu.controls.nombrepaciente.value;
    var apellidopaterno : string = this.FormBusquedaRecAnu.controls.apellidopaterno.value;
    var apellidomaterno : string = this.FormBusquedaRecAnu.controls.apellidomaterno.value;

    if (this.FormBusquedaRecAnu.controls.ambito.value > 0){
      ambito = this.FormBusquedaRecAnu.controls.ambito.value;
    } else {
      ambito = 0;
    }
    if (this.FormBusquedaRecAnu.controls.receid.value > 0){
      receid = this.FormBusquedaRecAnu.controls.receid.value;
    } else {
      receid = 0;
    }
    if (this.FormBusquedaRecAnu.controls.tipoidentificacion.value > 0){
      tipoidentificacion = this.FormBusquedaRecAnu.controls.tipoidentificacion.value;
    } else {
      tipoidentificacion = 0;
    }
    this._imprimesolicitudService.RPTImprimeRecetaAnuladaLista(this.servidor, this.hdgcodigo, this.esacodigo,this.cmecodigo, "pdf",
      ambito, receid, fechadesde, fechahasta, tipoidentificacion, numeroidentificacion, nombrepaciente, apellidopaterno, apellidomaterno).subscribe(
      response => {
        if (response != null) {
          window.open(response[0].url, "", "");
        }
      },
      error => {
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.recetas');
        this.alertSwalError.show();
        console.log(error);
        this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
        })
      }
    );
  }
  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
