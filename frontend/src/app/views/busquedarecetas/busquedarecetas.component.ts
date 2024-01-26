import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { environment } from '../../../environments/environment';
import { Receta } from 'src/app/models/entity/receta';
import { TipoDocumentoIdentificacion } from '../../models/entity/TipoDocumentoIdentificacion';
import { Camas } from '../../models/entity/Camas';
import { Piezas } from '../../models/entity/Piezas';
import { Unidades } from '../../models/entity/Unidades';
import { Servicio } from 'src/app/models/entity/Servicio';
import { TipodocumentoidentService } from '../../servicios/tipodocumentoident.service';
import { EstructuraunidadesService } from '../../servicios/estructuraunidades.service';
import { SolicitudService } from '../../servicios/Solicitudes.service';

import { AlertComponent } from 'ngx-bootstrap/alert/alert.component';
import { PacientesService } from 'src/app/servicios/pacientes.service';
import { Paciente } from 'src/app/models/entity/Paciente';
import { TipoambitoService } from 'src/app/servicios/tiposambito.service';
import { TipoAmbito } from 'src/app/models/entity/TipoAmbito';
import { TipoReceta } from 'src/app/models/entity/TipoReceta';
import { TipoRecetasService } from 'src/app/servicios/tipo-recetas.service';
import { DateMenorValidation } from 'src/app/models/validations/DateMenorValidation';
import { DateRangeValidation } from 'src/app/models/validations/DateRangeValidation';
import { DetalleRecetasModal } from 'src/app/models/entity/detalle-recetas-modal';
import { DetalleRecetas } from 'src/app/models/entity/detalle-recetas';

@Component({
  selector: 'app-busquedarecetas',
  templateUrl: './busquedarecetas.component.html',
  styleUrls: ['./busquedarecetas.component.css']
})
export class BusquedarecetasComponent implements OnInit {
  @Input() hdgcodigo: number;
  @Input() esacodigo: number;
  @Input() cmecodigo: number;
  @Input() titulo   : string;
  @Input() pagina   : string;
  @Input() ambito   : number;
  @Input() cliid    : number;
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;
  public FormBuscaRecetasAmbulatorias: FormGroup;
  public FormBuscaRecetasUrgencia: FormGroup;
  public FormBuscaRecetasHospitalizadas: FormGroup;
  public FormBuscaRecetas: FormGroup;
  public _Receta            : Receta;
  public servidor           = environment.URLServiciosRest.ambiente;
  public usuario            = environment.privilegios.usuario;
  public onClose: Subject<Receta>;
  public bsConfig       : Partial<BsDatepickerConfig>;

  public loading = false;
  public recetademonitor    : boolean = false;
  public arreglotipodocumentoidentificacion: Array<TipoDocumentoIdentificacion> =[];
  public listarecetasambulatorias: Array<Receta> = [];
  public listarecetasambulatoriasPaginacion: Array<Receta> = [];

  public listarecetas     : Array<Receta> = [];
  public listarecetasmodal: Array<DetalleRecetasModal> = [];

  public listarecetashospitalizados: Array<Receta> = [];
  public listarecetashospitalizadosPaginacion: Array<Receta> = [];

  public listarecetasurgencia: Array<Receta> = [];
  public listarecetasurgenciaPaginacion: Array<Receta> = [];
  public cantidad_recetas_hospitalizados: number;
  public cantidad_recetas_ambulatorio: number;
  public cantidad_recetas_urgencia: number;
  public estado: boolean = false;
  public camas: Array<Camas> = [];
  public piezas: Array<Piezas> = [];
  public unidades: Array<Unidades> = [];
  public servicios : Array<Servicio> = [];
  public filtrohosp = false;
  public filtroamb = false;
  public filtrourg = false;
  public activatipobusquedahospurgamb : boolean = true;
  public activatipobusquedaamb  : boolean = true;

  /** Combobox */
  public listaAmbitos: Array<TipoAmbito> = [];
  public listaRecetas: Array<TipoReceta> = [];

  public tipoModal : boolean = false;
  public page : number = 1;

  constructor(
    public bsModalRef: BsModalRef,
    public formBuilder: FormBuilder,
    private _buscasolicitudService    : SolicitudService,
    public datePipe: DatePipe,
    public _TipodocumentoidentService : TipodocumentoidentService,
    public estructuraunidadesService: EstructuraunidadesService,
    public _Pacientes: PacientesService,
    public _TipoambitoService: TipoambitoService,
    public _TipoRecetasService: TipoRecetasService,
  ) {

    this.FormBuscaRecetasAmbulatorias = this.formBuilder.group({
      numreceta : [{ value: null, disabled: false }, Validators.required],
      tipoidentificacion: [{ value: null, disabled: false }, Validators.required],
      numeroidentificacion: [{ value: null, disabled: true }, Validators.required],
      apellidopaterno: [{ value: null, disabled: false }, Validators.required],
      apellidomaterno: [{ value: null, disabled: false }, Validators.required],
      nombrespaciente: [{ value: null, disabled: false }, Validators.required],
     }
    );

    this.FormBuscaRecetasUrgencia = this.formBuilder.group({
      numreceta : [{ value: null, disabled: false }, Validators.required],
      tipoidentificacion: [{ value: null, disabled: false }, Validators.required],
      numeroidentificacion: [{ value: null, disabled: true }, Validators.required],
      apellidopaterno: [{ value: null, disabled: false }, Validators.required],
      apellidomaterno: [{ value: null, disabled: false }, Validators.required],
      nombrespaciente: [{ value: null, disabled: false }, Validators.required],
      servicio: [{ value: null, disabled: false }, Validators.required],
      pieza: [{ value: null, disabled: true }, Validators.required],
     }
    );

    this.FormBuscaRecetasHospitalizadas = this.formBuilder.group({
      numreceta           : [{ value: null, disabled: false }, Validators.required],
      tipoidentificacion  : [{ value: null, disabled: false }, Validators.required],
      numeroidentificacion: [{ value: null, disabled: true }, Validators.required],
      apellidopaterno     : [{ value: null, disabled: false }, Validators.required],
      apellidomaterno     : [{ value: null, disabled: false }, Validators.required],
      nombrespaciente     : [{ value: null, disabled: false }, Validators.required],
      servicio            : [{ value: null, disabled: false }, Validators.required],
      pieza               : [{ value: null, disabled: true }, Validators.required],
      cama                : [{ value: null, disabled: true }, Validators.required],
    }
    );

    this.FormBuscaRecetas = this.formBuilder.group({
      numreceta           : [{ value: null, disabled: false }, Validators.required],
      apellidopaterno     : [{ value: null, disabled: false }, Validators.required],
      apellidomaterno     : [{ value: null, disabled: false }, Validators.required],
      nombrespaciente     : [{ value: null, disabled: false }, Validators.required],
      fechadesde          : [new Date(), Validators.required],
      fechahasta          : [new Date(), Validators.required],
      ambito              : [{ value: null, disabled: true }, Validators.required],
      tiporeceta          : [{ value: null, disabled: true }, Validators.required],
    },
    {
      validator: [
        DateMenorValidation('fechadesde', 'fechahasta'),
        DateRangeValidation('fechadesde', 'fechahasta', 366)
      ]
    }
    );
  }

  ngOnInit() {
    var date = new Date();
    date.setMonth(date.getMonth() - 1);
    this.FormBuscaRecetas.controls['fechadesde'].setValue(date);
    if(this.pagina === 'Despacho'){
      this.activatipobusquedahospurgamb = true;
      this.activatipobusquedaamb = true;
    }else{
      this.activatipobusquedaamb = true;
      this.activatipobusquedahospurgamb = false;
    }

    this.onClose = new Subject();
    this.ListarEstUnidades();
    this.ListarEstServicios();
    this.ListarTipoDocumento();
  }

  ngAfterViewInit(){
    this.cargarPaciente();
    if (this.cliid > 0) {
      this.cargarCombos();
      // setTimeout(this.BuscarRecetasFiltro,2000)
      this.BuscarRecetasFiltro();
    }
  }

  onCerrar(recetaamb:  any) {
    var recetaC : Receta = new Receta
    if (this.tipoModal) {
      for(const element of this.listarecetas ) {
        if (recetaamb.receta == element.receid) {
          recetaC = element;
          break;
        }
      }
    } else {
      recetaC = recetaamb;
    }
    this.estado = true;
    this.onClose.next(recetaC);
    this.bsModalRef.hide();
  };

  onCerrarSalir() {
    this.estado = false;
    this.bsModalRef.hide();
  };

  async ListarEstServicios() {
    try {
      this.loading = true;

      this.estructuraunidadesService.BuscarServicios(
        this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.usuario,
        this.servidor,
        3,
        ''
      ).subscribe( resp => {
        this.servicios = resp;
        this.quitavacioservicio();

      });

      this.loading = false;
    } catch (err) {
      alert(err.message);
      this.loading = false;
    }
  }

  async ListarEstUnidades() {
    try {
      this.loading = true;
      this.unidades = await this.estructuraunidadesService.BuscarUnidades(
        this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.usuario,
        this.servidor
      ).toPromise();

      this.loading = false;
    } catch (err) {
      alert(err.message);
      this.loading = false;
    }
  }

  async ListarTipoDocumento() {
    try {
      this.loading = true;
      this.arreglotipodocumentoidentificacion = await this._TipodocumentoidentService.list(this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo, this.usuario,this.servidor,  localStorage.getItem('language'), false).toPromise();

      this.loading = false;
    } catch (err) {
      alert(err.message);
      this.loading = false;
    }
  }

  onSelectServicio(codservicio: string) {

      this.filtrohosp = true;
      this.piezas = [];
      this.camas = [];
      this.FormBuscaRecetasHospitalizadas.controls['pieza'].setValue(null);
      this.FormBuscaRecetasHospitalizadas.controls['cama'].setValue(null);
      this.FormBuscaRecetasHospitalizadas.controls['cama'].disable();

      this.FormBuscaRecetasHospitalizadas.controls['pieza'].enable();
      this.ListarPiezas(codservicio);

  }

  async ListarPiezas(serviciocod: string) {
    this.piezas = await this.estructuraunidadesService.BuscarPiezas(
      this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo,
      0,
      this.usuario,
      this.servidor,
      serviciocod
    ).toPromise();
  }

  onSelectPieza(event: any) {
    this.loading = true;
    this.camas = [];
    this.FormBuscaRecetasHospitalizadas.controls['cama'].setValue(null);
    const idpieza = parseInt(event);
    this.FormBuscaRecetasHospitalizadas.controls['cama'].enable();
    this.ListarCamas(idpieza);
  }

  async ListarCamas(idpieza: number) {
    this.camas = await this.estructuraunidadesService.BuscarCamas(
      this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo,
      idpieza,
      this.usuario,
      this.servidor
    ).toPromise();
    this.loading = false;
  }

  onValidafiltro(event: any, lugar: number) {

    let numid = event;
    switch (lugar) {
      case 1:
        if (numid.length > 0) {
          this.filtroamb = true;
        } else {
          this.filtroamb = false;
        }
        break;
      case 2:
        if (numid.length > 0) {
          this.filtrohosp = true;
        } else {
          this.filtrohosp = false;
        }
        break;
      case 3:
        if (numid.length > 0) {
          this.filtrourg = true;
        } else {
          this.filtrourg = false;
        }
        break;
    }
  }

  async BuscarRecetasFiltroAmbulatorio() {
    var fecha_desde = new Date();
    var fecha_hasta = new Date();

    fecha_hasta.setDate(fecha_desde.getDate() + 5);
    fecha_desde.setDate(fecha_desde.getDate() - 10);

    this.listarecetasambulatorias = [];
    this.listarecetasambulatoriasPaginacion = [];
    this.listarecetashospitalizados = [];
    this.listarecetashospitalizadosPaginacion = [];
    this.listarecetasurgencia = [];
    this.listarecetasurgenciaPaginacion = [];
    // Cargando recetas apcientes
    this._Receta = new (Receta);

    this._Receta.servidor = this.servidor;

    this._Receta.fechainicio = null;
    this._Receta.fechahasta = null;

    this._Receta.receid = 0;
    this._Receta.hdgcodigo = this.hdgcodigo;
    this._Receta.esacodigo = this.esacodigo;
    this._Receta.cmecodigo = this.cmecodigo;
    this._Receta.receambito = 0;

    this._Receta.recenumero =  parseInt(this.FormBuscaRecetasAmbulatorias.controls.numreceta.value);
    this._Receta.recetipdocpac = this.FormBuscaRecetasAmbulatorias.controls.tipoidentificacion.value;
    this._Receta.recedocumpac = this.FormBuscaRecetasAmbulatorias.controls.numeroidentificacion.value;
    this._Receta.clinombres = this.FormBuscaRecetasAmbulatorias.controls.nombrespaciente.value;
    this._Receta.cliapepaterno = this.FormBuscaRecetasAmbulatorias.controls.apellidopaterno.value;
    this._Receta.cliapematerno = this.FormBuscaRecetasAmbulatorias.controls.apellidomaterno.value;


    this._Receta.recesubreceta = 0;
    //this._Receta.recefecha   ?: string,
    //this._Receta.recefechaentrega   ?: string,
    this._Receta.fichapaci = 0;
    this._Receta.recectaid = 0;
    this._Receta.receurgid = 0;
    this._Receta.recedau = 0;
    this._Receta.rececliid = 0;

    this._Receta.recetipdocprof = 0;
    this._Receta.recedocumprof = '';
    this._Receta.receespecialidad = '';
    this._Receta.recerolprof = '';
    this._Receta.recesolid = 0
    this._Receta.receestadodespacho = 0;
    this._Receta.recenombrepaciente = '';
    this._Receta.recenombremedico = '';
    this._Receta.rececodunidad = ''
    this._Receta.rececodservicio = '';
    this._Receta.receglosaunidad = ''
    this._Receta.receglosaservicio = '';

    this.loading = true;
    this._buscasolicitudService.buscarEncabezadoRecetas(this._Receta).subscribe(
      response => {
        if (response != null){
          this.listarecetasambulatorias = [];
          this.listarecetasambulatoriasPaginacion = [];
          this.cantidad_recetas_ambulatorio = 0;
          if( response===null||response===undefined ) {
            this.loading = false;
            return;

          }
          else {
            if (response.length > 0) {
              response.forEach(element => {
                switch (element.receambito) {
                  case 1: {
                    this.listarecetasambulatorias.push(element);
                    break;
                  }
                  default: {
                    break;
                  }
                }
              });

              this.listarecetasambulatoriasPaginacion = this.listarecetasambulatorias.slice(0, 8);
              this.cantidad_recetas_ambulatorio = this.listarecetasambulatorias.length;
            }
          }
          this.cantidad_recetas_hospitalizados = this.listarecetashospitalizadosPaginacion.length;
          this.cantidad_recetas_urgencia = this.listarecetasurgenciaPaginacion.length;
          this.loading = false;
          return;
        } else {
          this.loading = false;
        }
      },

      error => {
        this.alertSwalError.title = "Error al Buscar Recetas";
        this.alertSwalError.text = "Se ha producido un error al buscar las recetas";
        this.alertSwalError.show();
        this.loading = false;
      }
    );
  }

  async BuscarRecetasFiltrohospitalizado() {
    var fecha_desde = new Date();
    var fecha_hasta = new Date();

    fecha_hasta.setDate(fecha_desde.getDate() + 5);
    fecha_desde.setDate(fecha_desde.getDate() - 10);

    this.listarecetasambulatorias = [];
    this.listarecetasambulatoriasPaginacion = [];
    this.listarecetashospitalizados = [];
    this.listarecetashospitalizadosPaginacion = [];
    this.listarecetasurgencia = [];
    this.listarecetasurgenciaPaginacion = [];

    // Cargando recetas apcientes
    this._Receta = new (Receta);

    this._Receta.servidor = this.servidor;

    this._Receta.fechainicio = null;
    this._Receta.fechahasta = null;

    this._Receta.receid = 0;
    this._Receta.hdgcodigo = this.hdgcodigo;
    this._Receta.esacodigo = this.esacodigo;
    this._Receta.cmecodigo = this.cmecodigo;
    this._Receta.receambito = 0;

    this._Receta.recenumero = this.FormBuscaRecetasHospitalizadas.controls.numreceta.value==null?0:parseInt(this.FormBuscaRecetasHospitalizadas.controls.numreceta.value);
    this._Receta.recetipdocpac = this.FormBuscaRecetasHospitalizadas.controls.tipoidentificacion.value;
    this._Receta.recedocumpac = this.FormBuscaRecetasHospitalizadas.controls.numeroidentificacion.value;
    this._Receta.clinombres = this.FormBuscaRecetasHospitalizadas.controls.nombrespaciente.value;
    this._Receta.cliapepaterno = this.FormBuscaRecetasHospitalizadas.controls.apellidopaterno.value;
    this._Receta.cliapematerno = this.FormBuscaRecetasHospitalizadas.controls.apellidomaterno.value;

    this._Receta.recesubreceta = 0;
    this._Receta.fichapaci = 0;
    this._Receta.recectaid = 0;
    this._Receta.receurgid = 0;
    this._Receta.recedau = 0;
    this._Receta.rececliid = 0;

    this._Receta.recetipdocprof = 0;
    this._Receta.recedocumprof = '';
    this._Receta.receespecialidad = '';
    this._Receta.recerolprof = '';
    this._Receta.recesolid = 0
    this._Receta.receestadodespacho = 0;
    this._Receta.recenombrepaciente = '';
    this._Receta.recenombremedico = '';
    this._Receta.rececodunidad = ''
    this._Receta.rececodservicio = '';
    this._Receta.receglosaunidad = ''
    this._Receta.receglosaservicio = '';

    this._buscasolicitudService.buscarEncabezadoRecetas(this._Receta).subscribe(
      response => {
        if( response===null||response===undefined ) { return; }
        else {
          if (response.length > 0) {
            response.forEach(element => {

              switch (element.receambito) {
                case 3: {
                  this.listarecetashospitalizados.push(element);
                  break;
                }
                default: {
                  break;
                }
              }
            });

            this.listarecetashospitalizadosPaginacion = this.listarecetashospitalizados.slice(0, 8);
            this.cantidad_recetas_hospitalizados = this.listarecetashospitalizados.length;
          }


        }
        this.cantidad_recetas_hospitalizados = this.listarecetashospitalizadosPaginacion.length;
        this.cantidad_recetas_urgencia = this.listarecetasurgenciaPaginacion.length;

        return;
      },

      error => {
        this.alertSwalError.title = "Error al Buscar Recetas";
        this.alertSwalError.text = "Se ha producido un error al buscar las recetas";
        this.alertSwalError.show();
        this.loading = false;
      }
    );
  }

  async BuscarRecetasFiltroUrgencia() {
    var fecha_desde = new Date();
    var fecha_hasta = new Date();

    fecha_hasta.setDate(fecha_desde.getDate() + 5);
    fecha_desde.setDate(fecha_desde.getDate() - 10);

    this.listarecetasambulatorias = [];
    this.listarecetasambulatoriasPaginacion = [];
    this.listarecetashospitalizados = [];
    this.listarecetashospitalizadosPaginacion = [];
    this.listarecetasurgencia = [];
    this.listarecetasurgenciaPaginacion = [];

    // Cargando recetas apcientes
    this._Receta = new (Receta);

    this._Receta.servidor = this.servidor;

    this._Receta.fechainicio = null;
    this._Receta.fechahasta = null;

    this._Receta.receid = 0;
    this._Receta.hdgcodigo = this.hdgcodigo;
    this._Receta.esacodigo = this.esacodigo;
    this._Receta.cmecodigo = this.cmecodigo;
    this._Receta.receambito = 0;

    this._Receta.recenumero = this.FormBuscaRecetasUrgencia.controls.numreceta.value==null?0:parseInt(this.FormBuscaRecetasUrgencia.controls.numreceta.value);
    this._Receta.recetipdocpac = this.FormBuscaRecetasUrgencia.controls.tipoidentificacion.value;
    this._Receta.recedocumpac = this.FormBuscaRecetasUrgencia.controls.numeroidentificacion.value;
    this._Receta.clinombres = this.FormBuscaRecetasUrgencia.controls.nombrespaciente.value;
    this._Receta.cliapepaterno = this.FormBuscaRecetasUrgencia.controls.apellidopaterno.value;
    this._Receta.cliapematerno = this.FormBuscaRecetasUrgencia.controls.apellidomaterno.value;


    this._Receta.recesubreceta = 0;
    this._Receta.fichapaci = 0;
    this._Receta.recectaid = 0;
    this._Receta.receurgid = 0;
    this._Receta.recedau = 0;
    this._Receta.rececliid = 0;

    this._Receta.recetipdocprof = 0;
    this._Receta.recedocumprof = '';
    this._Receta.receespecialidad = '';
    this._Receta.recerolprof = '';
    this._Receta.recesolid = 0
    this._Receta.receestadodespacho = 0;
    this._Receta.recenombrepaciente = '';
    this._Receta.recenombremedico = '';
    this._Receta.rececodunidad = ''
    this._Receta.rececodservicio = '';
    this._Receta.receglosaunidad = ''
    this._Receta.receglosaservicio = '';

    this._buscasolicitudService.buscarEncabezadoRecetas(this._Receta).subscribe(
      response => {
        if( response===null||response===undefined ) { return; }
        else {
          if (response.length > 0) {
            response.forEach(element => {
              switch (element.receambito) {
                case 2: {
                  this.listarecetasurgencia.push(element);
                  break;
                }
                default: {
                  break;
                }
              }
            });
            this.listarecetasurgenciaPaginacion = this.listarecetasurgencia.slice(0, 8);
            this.cantidad_recetas_urgencia = this.listarecetasurgencia.length;
          }
        }
        this.cantidad_recetas_hospitalizados = this.listarecetashospitalizadosPaginacion.length;
        this.cantidad_recetas_urgencia = this.listarecetasurgenciaPaginacion.length;
        return;
      },
      error => {
        this.alertSwalError.title = "Error al Buscar Recetas";
        this.alertSwalError.text = "Se ha producido un error al buscar las recetas";
        this.alertSwalError.show();
        this.loading = false;

      }
    );
  }

  LimpiarAmb(){
    this.FormBuscaRecetasAmbulatorias.reset();
    this.listarecetasambulatoriasPaginacion = [];
    this.listarecetasambulatorias = [];
    this.filtroamb = false;
    this.FormBuscaRecetasAmbulatorias.controls.numeroidentificacion.disable();

  }

  LimpiarHosp(){
    this.FormBuscaRecetasHospitalizadas.reset();
    this.listarecetashospitalizados = [];
    this.listarecetashospitalizadosPaginacion = [];
    this.filtrohosp = false;
    this.FormBuscaRecetasHospitalizadas.controls.numeroidentificacion.disable();
    this.FormBuscaRecetasHospitalizadas.controls.pieza.disable();
    this.FormBuscaRecetasHospitalizadas.controls.cama.disable();

  }
  LimpiarUrg(){
    this.FormBuscaRecetasUrgencia.reset();
    this.listarecetasurgencia = [];
    this.listarecetasurgenciaPaginacion = [];
    this.filtrourg = false;
    this.FormBuscaRecetasUrgencia.controls.numeroidentificacion.disable();
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.listarecetasambulatoriasPaginacion = this.listarecetasambulatorias.slice(startItem, endItem);
  }

  pageChangedhosp(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.listarecetashospitalizadosPaginacion = this.listarecetashospitalizados.slice(startItem, endItem);
  }

  pageChangedUrgencia(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.listarecetasurgenciaPaginacion = this.listarecetasurgencia.slice(startItem, endItem);
  }

  getReceta(){
    this._Receta = new (Receta);
    this._Receta.servidor = this.servidor;
    this._Receta.fechainicio = null;
    this._Receta.fechahasta = null;
    this._Receta.receid = 0;
    this._Receta.hdgcodigo = this.hdgcodigo;
    this._Receta.esacodigo = this.esacodigo;
    this._Receta.cmecodigo = this.cmecodigo;
    this._Receta.receambito = 0;

    this._Receta.recenumero =  this.FormBuscaRecetasAmbulatorias.controls.numreceta.value==null?0:parseInt(this.FormBuscaRecetasAmbulatorias.controls.numreceta.value);

    this._Receta.recetipdocpac = this.FormBuscaRecetasAmbulatorias.value.tipoidentificacion;
    this._Receta.recedocumpac = this.FormBuscaRecetasAmbulatorias.value.numeroidentificacion;
    this._Receta.clinombres = this.FormBuscaRecetasAmbulatorias.value.nombrespaciente;
    this._Receta.cliapepaterno = this.FormBuscaRecetasAmbulatorias.value.apellidopaterno;
    this._Receta.cliapematerno = this.FormBuscaRecetasAmbulatorias.value.apellidomaterno;


    this._Receta.recesubreceta = 0;
    this._Receta.fichapaci = 0;
    this._Receta.recectaid = 0;
    this._Receta.receurgid = 0;
    this._Receta.recedau = 0;
    this._Receta.rececliid = 0;

    this._Receta.recetipdocprof = 0;
    this._Receta.recedocumprof = '';
    this._Receta.receespecialidad = '';
    this._Receta.recerolprof = '';
    this._Receta.recesolid = 0
    this._Receta.receestadodespacho = 0;
    this._Receta.recenombrepaciente = '';
    this._Receta.recenombremedico = '';
    this._Receta.rececodunidad = ''
    this._Receta.rececodservicio = '';
    this._Receta.receglosaunidad = ''
    this._Receta.receglosaservicio = '';

    this._buscasolicitudService.buscarEncabezadoRecetas(this._Receta).subscribe(
      response => {
        this.listarecetasambulatorias = [];
        this.listarecetasambulatoriasPaginacion = [];
        this.listarecetasurgencia = [];
        this.listarecetasurgenciaPaginacion = [];
        this.listarecetashospitalizados = [];
        this.listarecetashospitalizadosPaginacion = [];
        if( response===null||response===undefined ) { return; }
        else {
          if (response.length > 0) {
            response.forEach(element => {
              switch (element.receambito) {
                case 1: {
                  this.listarecetasambulatorias.push(element);
                  this.listarecetasambulatoriasPaginacion = this.listarecetasambulatorias.slice(0,8)
                  break;
                }
                case 2: {
                  this.listarecetasurgencia.push(element);
                  this.listarecetasurgenciaPaginacion = this.listarecetasurgencia.slice(0,8);
                  break;
                }
                case 3: {
                  this.listarecetashospitalizados.push(element);
                  this.listarecetashospitalizadosPaginacion = this.listarecetashospitalizados.slice(0,8);
                  break;
                }
                default: {
                  break;
                }
              }
            });
            this.listarecetasurgenciaPaginacion = this.listarecetasurgencia.slice(0, 8);
            this.cantidad_recetas_urgencia = this.listarecetasurgencia.length;
          }
        }
        this.cantidad_recetas_hospitalizados = this.listarecetashospitalizadosPaginacion.length;
        this.cantidad_recetas_urgencia = this.listarecetasurgenciaPaginacion.length;

        return;
      },

      error => {
        this.alertSwalError.title = "Error al Buscar Recetas";
        this.alertSwalError.text = "Se ha producido un error al buscar las recetas";
        this.alertSwalError.show();
        this.loading = false;
      }
    );
  }

  comboTipoidAmb() {
    this.FormBuscaRecetasAmbulatorias.controls.numeroidentificacion.enable();

  }

  comboTipoidHosp() {
    this.FormBuscaRecetasHospitalizadas.controls.numeroidentificacion.enable();

  }

  comboTipoidUrg() {
    this.FormBuscaRecetasUrgencia.controls.numeroidentificacion.enable();

  }

  quitavacioservicio() {
    const codserv = this.servicios.findIndex( x => x.serviciodesc.trim() === '' );
    this.servicios.splice( codserv, 1);
  }

  cargarPaciente(){
    if (this.cliid > 0) {
      this.tipoModal = true;
      this._Pacientes.BuscaPacientes(this.hdgcodigo, this.cmecodigo, 0, '', '',
        '', '', this.cliid, this.usuario, this.servidor).subscribe(
        response => {
          console.log("response : ", response)
          var paciente :Paciente = new Paciente;
          paciente = response[0];
          if (paciente != null){
            switch (this.ambito) {
              case 1:
                if (this.cliid === 0){
                  // this.FormBuscaRecetasAmbulatorias.get('numreceta').setValue(paciente.recetipdocpacglosa);
                  this.FormBuscaRecetasAmbulatorias.get('tipoidentificacion').setValue(paciente.tipoidentificacion);
                  this.FormBuscaRecetasAmbulatorias.get('numeroidentificacion').setValue(paciente.docuidentificacion);
                  this.FormBuscaRecetasAmbulatorias.get('apellidopaterno').setValue(paciente.apepaternopac);
                  this.FormBuscaRecetasAmbulatorias.get('apellidomaterno').setValue(paciente.apematernopac);
                  this.FormBuscaRecetasAmbulatorias.get('nombrespaciente').setValue(paciente.nombrespac);
                }else{
                  this.FormBuscaRecetas.get('apellidopaterno').setValue(paciente.apepaternopac);
                  this.FormBuscaRecetas.get('apellidomaterno').setValue(paciente.apematernopac);
                  this.FormBuscaRecetas.get('nombrespaciente').setValue(paciente.nombrespac);
                  this.FormBuscaRecetas.controls.apellidopaterno.disable();
                  this.FormBuscaRecetas.controls.apellidomaterno.disable();
                  this.FormBuscaRecetas.controls.nombrespaciente.disable();
                  this.FormBuscaRecetas.controls.ambito.enable();
                  this.FormBuscaRecetas.controls.tiporeceta.enable();

                }
                break;
              case 2:
                // this.FormBuscaRecetasUrgencia.get('numreceta').setValue(paciente.recetipdocpacglosa);
                this.FormBuscaRecetasUrgencia.get('tipoidentificacion').setValue(paciente.tipoidentificacion);
                this.FormBuscaRecetasUrgencia.get('numeroidentificacion').setValue(paciente.docuidentificacion);
                this.FormBuscaRecetasUrgencia.get('apellidopaterno').setValue(paciente.apepaternopac);
                this.FormBuscaRecetasUrgencia.get('apellidomaterno').setValue(paciente.apematernopac);
                this.FormBuscaRecetasUrgencia.get('nombrespaciente').setValue(paciente.nombrespac);
                this.FormBuscaRecetasUrgencia.get('servicio').setValue(paciente.unidadactual);
                this.FormBuscaRecetasUrgencia.get('pieza').setValue(paciente.camaapieza);
                break;
              case 3:
                // this.FormBuscaRecetasHospitalizadas.get('numreceta').setValue(paciente.recetipdocpacglosa);
                this.FormBuscaRecetasHospitalizadas.get('tipoidentificacion').setValue(paciente.tipoidentificacion);
                this.FormBuscaRecetasHospitalizadas.get('numeroidentificacion').setValue(paciente.docuidentificacion);
                this.FormBuscaRecetasHospitalizadas.get('apellidopaterno').setValue(paciente.apepaternopac);
                this.FormBuscaRecetasHospitalizadas.get('apellidomaterno').setValue(paciente.apematernopac);
                this.FormBuscaRecetasHospitalizadas.get('nombrespaciente').setValue(paciente.nombrespac);
                if (paciente.unidadactual != null)
                  this.FormBuscaRecetasHospitalizadas.get('Servicio').setValue(paciente.unidadactual);
                this.FormBuscaRecetasHospitalizadas.get('pieza').setValue(paciente.camaapieza);
                this.FormBuscaRecetasHospitalizadas.get('cama').setValue(paciente.camaactual);
                break;
              default:
                break;
            }
          } else {
            this.alertSwalError.title = "Paciente no encontrado";
            this.alertSwalError.text = "Se ha producido un error al buscar las paciente";
            this.alertSwalError.show();
          }

        },

        error => {
          this.alertSwalError.title = "Error al Buscar Paciente";
          this.alertSwalError.text = "Se ha producido un error al buscar las paciente";
          this.alertSwalError.show();
          this.loading = false;
        }
      );
    }
  }

  cargarCombos(){
    this._TipoambitoService.list(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor).subscribe(
      response => {
        if (response != null){
          const tipoambito :TipoAmbito = new TipoAmbito(0," ");
          this.listaAmbitos.push(tipoambito);
          response.forEach(element => {
                this.listaAmbitos.push(element);
          });
        }
      },
      error => {
        alert("Error al Buscar Tipo Ambito");
      }
    );

    this._TipoRecetasService.list(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor).subscribe(
      response => {
        if (response != null){
          const tiporeceta :TipoReceta = new TipoReceta(0," ");
          this.listaRecetas.push(tiporeceta);
          response.forEach(element => {
                this.listaRecetas.push(element);
          });
        }
      },
      error => {
        alert("Error al Buscar Tipo Receta");
      }
    );
  }

  async BuscarRecetasFiltro() {
    this.listarecetasmodal = [];
    this.loading = true;
    // Cargando recetas pacientes
    await this.BuscarRecetas();
  }

  setBusqueda(){
    this._Receta = new (Receta);

    this._Receta.servidor = this.servidor;

    this._Receta.fechainicio = this.datePipe.transform(this.FormBuscaRecetas.controls.fechadesde.value, 'yyyy-MM-dd');
    this._Receta.fechahasta = this.datePipe.transform(this.FormBuscaRecetas.controls.fechahasta.value, 'yyyy-MM-dd');
    this._Receta.receid = 0;
    this._Receta.hdgcodigo = this.hdgcodigo;
    this._Receta.esacodigo = this.esacodigo;
    this._Receta.cmecodigo = this.cmecodigo;
    this._Receta.receambito = 0;
    this._Receta.rececliid = this.cliid;
    this._Receta.receambito = this.FormBuscaRecetas.controls.ambito.value;
    this._Receta.recetipo = this.FormBuscaRecetas.controls.tiporeceta.value;

    this._Receta.recesubreceta = 0;
    this._Receta.fichapaci = 0;
    this._Receta.recectaid = 0;
    this._Receta.receurgid = 0;
    this._Receta.recedau = 0;

    this._Receta.recetipdocprof = 0;
    this._Receta.recedocumprof = '';
    this._Receta.receespecialidad = '';
    this._Receta.recerolprof = '';
    this._Receta.recesolid = 0
    this._Receta.receestadodespacho = 0;
    this._Receta.recenombrepaciente = '';
    this._Receta.recenombremedico = '';
    this._Receta.rececodunidad = ''
    this._Receta.rececodservicio = '';
    this._Receta.receglosaunidad = ''
    this._Receta.receglosaservicio = '';
  }

  async BuscarRecetas(){
    const Swal = require('sweetalert2');
    this.loading = true;
    try {
      await this.setBusqueda();
      const response = await this._buscasolicitudService.buscarestructurarecetasmodal(this._Receta).toPromise();
      if( response !== null ) {
        this.listarecetas = [];
        if (response.length == 0) {
          this.alertSwalAlert.title = "El número de receta buscada no existe";
          this.alertSwalAlert.show();
        } else {
          if (response.length > 0) {
            this.listarecetas = response;
            this.listarecetasmodal = response[0].recetadetallemodal;
            this.loading = false;
          }
        }
      } else {
        this.loading = false;
        return;
    }
    } catch (error) {
      this.loading = false;
      this.alertSwalError.title = "Error al buscar Receta";
      this.alertSwalError.show();
    }
  }

  Limpiar(){
    this.FormBuscaRecetasAmbulatorias.reset();
    var date = new Date();
    this.tipoModal = false;
    date.setMonth(date.getMonth() - 12);
    this.FormBuscaRecetas.controls['fechadesde'].setValue(date);
    this.FormBuscaRecetas.controls['fechahasta'].setValue(new Date());
    this.FormBuscaRecetas.controls['ambito'].reset();
    this.FormBuscaRecetas.controls['tiporeceta'].reset();
    this.listarecetasmodal = [];
    this.filtroamb = false;
    this.FormBuscaRecetasAmbulatorias.controls.numeroidentificacion.disable();
    this.page = 1;
  }
}
