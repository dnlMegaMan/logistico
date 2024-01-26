import { Component, OnInit , Input, ViewChild} from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { TipoAmbito } from '../../models/entity/TipoAmbito'
import { TipoambitoService } from '../../servicios/tiposambito.service';
import { DocIdentificacion } from '../../models/entity/DocIdentificacion';
import { DocidentificacionService } from '../../servicios/docidentificacion.service';
import { EstadoSolicitud } from '../../models/entity/EstadoSolicitud';
import { TipoRegistro } from '../../models/entity/TipoRegistro';
import { TiporegistroService } from '../../servicios/tiporegistro.service';
import { ListaPacientes } from 'src/app/models/entity/ListaPacientes';
import { BuscasolicitudespacientesService } from '../../servicios/buscasolicitudespacientes.service'
import { DispensaSolicitud } from 'src/app/models/entity/DispensaSolicitud';
import { DetalleSolicitud } from 'src/app/models/entity/DetalleSolicitud';
import { SolicitudService } from 'src/app/servicios/Solicitudes.service';
import { Prioridades } from '../../models/entity/Prioridades';
import { PrioridadesService } from '../../servicios/prioridades.service';
import { Unidades } from '../../models/entity/Unidades';
import { Piezas } from '../../models/entity/Piezas';
import { Camas } from '../../models/entity/Camas';
import { EstructuraunidadesService } from '../../servicios/estructuraunidades.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { validateRUT, getCheckDigit, generateRandomRUT, clearRUT } from 'validar-rut'
import { InformesService } from 'src/app/servicios/informes.service';
import { ConfiguracionLogisticoService } from 'src/app/servicios/configuracion-logistico.service';
import { validarRangoFechas } from 'src/app/validadores/validar-rango-fechas';
import { validarQueFechasNoSeCrucen } from 'src/app/validadores/validar-que-fechas-no-se-crucen';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-busquedasolicitudpacientes',
  templateUrl: './busquedasolicitudpacientes.component.html',
  styleUrls: ['./busquedasolicitudpacientes.component.css'],
  providers : [BuscasolicitudespacientesService,InformesService]
})
export class BusquedasolicitudpacientesComponent implements OnInit {
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

  public FormBusquedaSolPac          : FormGroup;
  public locale                      = 'es';
  public bsConfig                    : Partial<BsDatepickerConfig>;
  public colorTheme                  = 'theme-blue';
  public tiposambitos                : Array<TipoAmbito> = [];
  public docsidentis                 : Array<DocIdentificacion> = [];
  public estadossolicitudes          : Array<EstadoSolicitud> = [];
  public tiposderegistros            : Array<TipoRegistro> = [];
  public prioridades                 : Array<Prioridades> = [];
  public unidades                    : Array<Unidades> = [];
  public piezas                      : Array<Piezas> = [];
  public camas                       : Array<Camas> = [];
  listasolicitudespacientes          : Array<DispensaSolicitud> =[];
  listasolicitudespacientespaginacion: Array<DetalleSolicitud>=[];

  public estado                      : boolean = false;
  public servidor                    = environment.URLServiciosRest.ambiente;
  public usuario                     = environment.privilegios.usuario;
  /* para datepicker */
  public vfechainicio: string;
  public vfechatermino: string;
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
    private configLogisticoService: ConfiguracionLogisticoService,
    private _imprimesolicitudService  : InformesService,
    public translate: TranslateService

  ) {
    this.FormBusquedaSolPac = this.formBuilder.group({
      soliid              : [{ value: null, disabled: false }, Validators.required],
      fechadesde          : [new Date(), Validators.required],
      fechahasta          : [new Date(), Validators.required],
      ambito              : [{ value: null, disabled: false }, Validators.required],
      tiporegistro        : [{ value: null, disabled: false }, Validators.required],
      estado              : [{ value: null, disabled: false }, Validators.required],
      servicio            : [{ value: null, disabled: false }, Validators.required],
      pieza               : [{ value: null, disabled: false }, Validators.required],
      cama                : [{ value: null, disabled: false }, Validators.required],
      tipoidentificacion  : [{ value: null, disabled: false }, Validators.required],
      numeroidentificacion: [{ value: null, disabled: false }, Validators.required],
      prioridad           : [{ value: null, disabled: false }, Validators.required]
     }
    );
   }

  ngOnInit() {
    this.configLogisticoService
      .obtenerConfiguracion()
      .then(config => {
        this.FormBusquedaSolPac.setValidators([
          validarQueFechasNoSeCrucen('fechadesde',  'fechahasta'),
          validarRangoFechas('fechadesde',  'fechahasta', config.rangoFechasSolicitudes),
        ]);
        this.FormBusquedaSolPac.updateValueAndValidity();
      })
      .catch((error) => {
        console.error("[BUSCAR RANGO MAXIMO DE FECHAS] ", error);
        
        this.alertSwalError.title = 'Error al buscar rango maximo de fechas';
        this.alertSwalError.show();
      });

    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.onClose = new Subject();
    this.setDate();
    this.ListarEstUnidades();
    this.FormBusquedaSolPac.value.ambito = 2;

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
    this.PrioridadesService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario,this.servidor).subscribe(
      data => {
        this.prioridades = data;
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

    if(this.buscasolicitud == "Solicitud_Paciente"){

      this.FormBusquedaSolPac.get('ambito').setValue(this.ambito)
      this.FormBusquedaSolPac.get('tipoidentificacion').setValue(this.tipodocumento);
      this.FormBusquedaSolPac.get('numeroidentificacion').setValue(this.numeroidentificacion);
    }else{
      if(this.buscasolicitud == "Dipensar_Solicitud"){
        this.FormBusquedaSolPac.get('ambito').setValue(this.ambito)
        this.tipodocumento = null;
        this.numeroidentificacion = null;
      }
    }
    if(this.paginaorigen == 12){
      this.FormBusquedaSolPac.controls.estado.disable();
      this.FormBusquedaSolPac.get('ambito').setValue(0);
      this.FormBusquedaSolPac.get('estado').setValue(80);
    }
    this.BuscarSolicitudesPacientes();
    // this.FormBusquedaSolPac.get('servicio').setValue(this.codservicioactual);
  }

  async ListarEstUnidades() {
    const esacodigo = 1;
    try {
      this.unidades = await this.estructuraunidadesService.BuscarUnidades(
        this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.usuario,
        this.servidor
      ).toPromise();

    } catch (err) {
      alert(err.message);
    }
  }

  async ListarPiezas(idunidad: number) {

    const esacodigo = 1;
    this.piezas = await this.estructuraunidadesService.BuscarPiezas(
      this.hdgcodigo,
      // this.esacodigo,
      esacodigo,
      this.cmecodigo,
      idunidad,
      this.usuario,
      this.servidor,
      ''
    ).toPromise();

    this.piezas = this.piezas===null?[]:this.piezas;
    if( this.piezas.length === 0 ){ return; }

  }

  async ListarCamas(idpieza: number) {
    const esacodigo = 1;
    this.camas = await this.estructuraunidadesService.BuscarCamas(
      this.hdgcodigo,
      // this.esacodigo,
      esacodigo,
      this.cmecodigo,
      idpieza,
      this.usuario,
      this.servidor
    ).toPromise();
  }

  onSelectServicio(event: any) {
    this.piezas = [];
    this.camas = [];
    const idunidad = parseInt(event);
    this.ListarPiezas(idunidad);

  }

  onSelectPieza(event: any) {
    this.camas = [];
    const idpieza = parseInt(event);
    this.ListarCamas(idpieza);

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
    var fechadesde=this.datePipe.transform(this.FormBusquedaSolPac.value.fechadesde, 'yyyy-MM-dd');
    var fechahasta=this.datePipe.transform(this.FormBusquedaSolPac.value.fechahasta, 'yyyy-MM-dd');

    const servicio = this.FormBusquedaSolPac.value.servicio;

    this.loading = true;

    this._buscasolicitudService.BuscaSolicitudCabecera(
      Number(this.FormBusquedaSolPac.controls.soliid.value),this.hdgcodigo,
      this.esacodigo,this.cmecodigo,0,fechadesde,fechahasta,0,0,
      parseInt(this.FormBusquedaSolPac.value.estado),
      this.servidor, parseInt(this.FormBusquedaSolPac.value.prioridad),
      parseInt(this.FormBusquedaSolPac.controls.ambito.value),
      parseInt(this.FormBusquedaSolPac.value.servicio),
      parseInt(this.FormBusquedaSolPac.value.pieza),
      parseInt(this.FormBusquedaSolPac.value.cama),
      parseInt(this.FormBusquedaSolPac.value.tipoidentificacion),
      this.FormBusquedaSolPac.value.numeroidentificacion,
      this.filtrodenegocio,
      this.solicitudorigen
      ,this.usuario,"","",
      this.paginaorigen, servicio,0, 0, "", "", "", "").subscribe(
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
      }
    );
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.listasolicitudespacientespaginacion = this.listasolicitudespacientes.slice(startItem, endItem);
  }

  Limpiar(){
    const ambito = this.FormBusquedaSolPac.getRawValue().ambito;

    this.FormBusquedaSolPac.reset({
      ambito: ambito,
      fechadesde: new Date(),
      fechahasta: new Date(),
    });

    this.listasolicitudespacientes = [];
    this.listasolicitudespacientespaginacion = [];
    
    this.FormBusquedaSolPac.controls.pieza.disable();
    this.FormBusquedaSolPac.controls.cama.disable();
  }

  onCerrarSalir() {
    this.estado = true;
    this.onClose.next();
    this.bsModalRef.hide();
  };

  validaRut(){
    if (this.FormBusquedaSolPac.controls.numeroidentificacion.value != undefined &&
        this.FormBusquedaSolPac.controls.numeroidentificacion.value != null){
      const newRut = this.FormBusquedaSolPac.controls.numeroidentificacion.value.replace(/\./g,'').replace(/\-/g, '').trim().toLowerCase();
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
      this.FormBusquedaSolPac.get('numeroidentificacion').setValue(format.concat('-').concat(lastDigit));
    }
  }
  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
