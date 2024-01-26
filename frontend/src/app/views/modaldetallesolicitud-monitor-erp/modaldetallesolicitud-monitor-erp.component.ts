import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import { Subject} from 'rxjs';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { DetalleSolicitudMovimiento } from 'src/app/models/entity/DetalleSolicitudMovimiento';
import { MovimientoInterfazBodegas } from 'src/app/models/entity/movimiento-interfaz-bodegas';

import { SolicitudService } from '../../servicios/Solicitudes.service';
import { InterfacesService } from 'src/app/servicios/interfaces.service';
import { EstructuraFin700 } from 'src/app/models/entity/estructura-fin700';
import { MovimientoInterfaz } from 'src/app/models/entity/movimiento-interfaz';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-modaldetallesolicitud-monitor-erp',
  templateUrl: './modaldetallesolicitud-monitor-erp.component.html',
  styleUrls: ['./modaldetallesolicitud-monitor-erp.component.css']
})
export class ModaldetallesolicitudMonitorERPComponent implements OnInit {
  @Input() hdgcodigo            : number;
  @Input() esacodigo            : number;
  @Input() cmecodigo            : number;
  @Input() titulo               : string;
  @Input() servidor             : string;
  @Input() movimientobod        : MovimientoInterfazBodegas;
  @Input() movimientopac        : MovimientoInterfaz;

  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  public Servidor = environment.URLServiciosRest.ambiente;
  public usuario = environment.privilegios.usuario;

  public detallesolicitudmovimiento :  Array<DetalleSolicitudMovimiento> = [];
  public detallesolicitudmovimientopaginacion :  Array<DetalleSolicitudMovimiento> = [];
  public listaDetalleMovimiento: Array<MovimientoInterfazBodegas> = [];
  public listaDetalleMovimientoPaginacion: Array<MovimientoInterfazBodegas> = [];
  public listapacientes: Array<MovimientoInterfaz> = [];
  public listapacientes_aux: Array<MovimientoInterfaz> = [];
  public listapacientesPaginacion: Array<MovimientoInterfaz> = [];
  public onClose: Subject<null>;
  public loading : boolean = false;
  public respuestaerp : number;
  public cabecera : boolean;

  public FormFiltroPac: FormGroup;
  public optPac = "DESC";

  public checkSobreGiro: boolean = false;
  public checkboxSobreGiro: boolean = false;

  constructor(
    private _interfacesService: InterfacesService,
    public bsModalRef         : BsModalRef,
    public _solicitudService  : SolicitudService,
    public formBuilder        : FormBuilder,
    public translate: TranslateService
  ) {
    this.FormFiltroPac = this.formBuilder.group({
      detid               : [{ value: null, disabled: false }, Validators.required],
      tipomovimiento      : [{ value: null, disabled: false }, Validators.required],
      mfdemeincodmei      : [{ value: null, disabled: false }, Validators.required],
      descripcionproducto : [{ value: null, disabled: false }, Validators.required],
      mfdecantidad        : [{ value: null, disabled: false }, Validators.required],
      interpestado        : [{ value: null, disabled: false }, Validators.required],
    });
   }


  ngOnInit() {
    this.onClose = new Subject();
    this.CargaDatos();
  }

  onCerrarSalir() {
    // this.estado = false;
    this.onClose.next();
    this.bsModalRef.hide();
  };

  onCerrar() {
    // this.estado = true;
    this.onClose.next();
    this.bsModalRef.hide();
  };

  async CargaDatos(){
    try {
      this.loading = true;
      if(this.movimientopac !== null){
        this.cabecera = false;
      } else {
        this.cabecera = true;
      }
      if(this.movimientobod != null){
        this.movimientobod.servidor = this.Servidor;
        this.movimientobod.usuario = this.usuario;
        const response = await this._interfacesService.listarmovimientointerfazbodegas(this.movimientobod).toPromise();
        if (response != null) {
          if (response.length != 0) {
            this.listaDetalleMovimiento = response;
            this.listaDetalleMovimientoPaginacion = this.listaDetalleMovimiento//.slice(0, 20);
          }
        }
      }
      if (this.movimientopac != null) {
        this.movimientopac.servidor = this.Servidor;
        this.movimientopac.usuario = this.usuario;
        //BUSCA MOVIMIENTOS  DE PACIENTES
        const response = await this._interfacesService.listamovimientointerfaz(this.movimientopac).toPromise();
        if(response != null){
          if (response.length != 0) {
            this.listapacientes = response;
            this.listapacientes_aux = this.listapacientes;
            this.listapacientesPaginacion = this.listapacientes;//.slice(0, 20);
          }
        }
      }

      this.loading = false;
    } catch (error) {
      this.loading = false;
      this.alertSwalError.title = "Error";
      this.alertSwalError.text = error.message
      this.alertSwalError.show();
    }
  }

  Enviar_bodegas(registro: MovimientoInterfazBodegas) {

    this.alertSwalError.text = null;
    this.alertSwalError.title = null;
    this.alertSwalError.titleText = null;
    this.alertSwal.title = null;
    this.loading = true;
    registro.usuario = sessionStorage.getItem('Usuario').toString();
    registro.servidor = this.servidor;

    var _EstructuraFin700 = new (EstructuraFin700)

    _EstructuraFin700.hdgcodigo = registro.hdgcodigo;
    _EstructuraFin700.esacodigo = registro.esacodigo;
    _EstructuraFin700.cmecodigo = registro.cmecodigo;
    
    _EstructuraFin700.idagrupador = 0;
    _EstructuraFin700.numeromovimiento = 0;
    _EstructuraFin700.soliid = registro.soliid;
    _EstructuraFin700.servidor = this.servidor;
    _EstructuraFin700.tipomovimiento = registro.codtipmov;
    _EstructuraFin700.sobregiro = this.checkboxSobreGiro;

    this._interfacesService.enviarErp(_EstructuraFin700).subscribe(
      response => {
        if (response == undefined || response === null) {
          this.alertSwalError.title = "No hay respuesta del servidor";
          this.alertSwalError.show();
          this.loading = false;
          this.CargaDatos();
          return;
        }else{
          this.respuestaerp = Number(response)
          if(this.respuestaerp > 0 ){
            this.alertSwal.title = "Envío al ERP realizado";
            this.alertSwal.show();
            this.loading = false;
            this.CargaDatos();
          }else{
            this.alertSwalAlert.title = "Se realiza con observaciones";
            this.alertSwalAlert.show();
            this.loading = false;
            this.CargaDatos();
          }
          return;
        }
      });
  }

/* Función búsqueda con paginación */
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    // this.listadopacientespaginacion = this.listadopacientes.slice(startItem, endItem);
    this.detallesolicitudmovimientopaginacion = this.detallesolicitudmovimiento.slice(startItem, endItem);
  }

  limpiarFiltros(){
    this.FormFiltroPac.reset();
    if(this.listapacientes != null){
      this.filtroPaciente();
    }
  }

  filtroPaciente(){
    this.listapacientesPaginacion = [];
    this.listapacientesPaginacion = this.listapacientes_aux.slice(0,20);
    var valida     : boolean = false;
    var detid               : string = this.FormFiltroPac.controls.detid.value;
    var tipomovimiento      : string = this.FormFiltroPac.controls.tipomovimiento.value;
    var mfdemeincodmei      : string = this.FormFiltroPac.controls.mfdemeincodmei.value;
    var descripcionproducto : string = this.FormFiltroPac.controls.descripcionproducto.value;
    var mfdecantidad        : string = this.FormFiltroPac.controls.mfdecantidad.value;
    var interpestado        : string = this.FormFiltroPac.controls.interpestado.value;

    var listaPacienteFiltro : Array<MovimientoInterfaz> = this.listapacientes;
    var listaFiltro : Array<MovimientoInterfaz> = [];

    if(detid != null){
      listaFiltro = [];
      valida = true;
      for (const element of listaPacienteFiltro) {
        let posicion = element.detid.toString().indexOf(detid);
        if (posicion !== -1){
          listaFiltro.unshift(element);
        }
      }
      listaPacienteFiltro = listaFiltro;
    }

    if(tipomovimiento != null){
      listaFiltro = [];
      valida = true;
      for (const element of listaPacienteFiltro) {
        let posicion = element.tipomovimiento.toString().indexOf(tipomovimiento);
        if (posicion !== -1){
          listaFiltro.unshift(element);
        }
      }
      listaPacienteFiltro = listaFiltro;
    }

    if(mfdemeincodmei != null){
      listaFiltro = [];
      valida = true;
      for (const element of listaPacienteFiltro) {
        let posicion = element.mfdemeincodmei.toString().indexOf(mfdemeincodmei);
        if (posicion !== -1){
          listaFiltro.unshift(element);
        }
      }
      listaPacienteFiltro = listaFiltro;
    }

    if(descripcionproducto != null){
      listaFiltro = [];
      valida = true;
      for (const element of listaPacienteFiltro) {
        let posicion = element.descripcionproducto.toString().indexOf(descripcionproducto);
        if (posicion !== -1){
          listaFiltro.unshift(element);
        }
      }
      listaPacienteFiltro = listaFiltro;
    }

    if(mfdecantidad != null){
      listaFiltro = [];
      valida = true;
      for (const element of listaPacienteFiltro) {
        let posicion = element.mfdecantidad.toString().indexOf(mfdecantidad);
        if (posicion !== -1){
          listaFiltro.unshift(element);
        }
      }
      listaPacienteFiltro = listaFiltro;
    }

    if(interpestado != null){
      listaFiltro = [];
      valida = true;
      for (const element of listaPacienteFiltro) {
        let posicion = element.interpestado.toString().indexOf(interpestado);
        if (posicion !== -1){
          listaFiltro.unshift(element);
        }
      }
      listaPacienteFiltro = listaFiltro;
    }

    if (valida) {
      this.listapacientesPaginacion = listaFiltro.slice(0,20);
    } else {
      this.listapacientesPaginacion = this.listapacientes.slice(0,20);
    }
  }

  sortbyPac(opt: string){
    var rtn1 : number;
    var rtn2 : number;
    if(this.optPac === "ASC"){
      rtn1 = 1;
      rtn2 = -1;
      this.optPac = "DESC"
    } else {
      rtn1 = -1;
      rtn2 = 1;
      this.optPac = "ASC"
    }

    switch (opt) {
      case 'detid':
        this.listapacientesPaginacion.sort(function (a, b) {
          if (a.detid > b.detid) {
            return rtn1;
          }
          if (a.detid < b.detid) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'tipomovimiento':
        this.listapacientesPaginacion.sort(function (a, b) {
          if (a.tipomovimiento > b.tipomovimiento) {
            return rtn1;
          }
          if (a.tipomovimiento < b.tipomovimiento) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'mfdemeincodmei':
        this.listapacientesPaginacion.sort(function (a, b) {
          if (a.mfdemeincodmei > b.mfdemeincodmei) {
            return rtn1;
          }
          if (a.mfdemeincodmei < b.mfdemeincodmei) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'descripcionproducto':
        this.listapacientesPaginacion.sort(function (a, b) {
          if (a.descripcionproducto > b.descripcionproducto) {
            return rtn1;
          }
          if (a.descripcionproducto < b.descripcionproducto) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'mfdecantidad':
        this.listapacientesPaginacion.sort(function (a, b) {
          if (a.mfdecantidad > b.mfdecantidad) {
            return rtn1;
          }
          if (a.mfdecantidad < b.mfdecantidad) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'interpestado':
        this.listapacientesPaginacion.sort(function (a, b) {
          if (a.interpestado > b.interpestado) {
            return rtn1;
          }
          if (a.interpestado < b.interpestado) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      default:
        break;
    }
  }
  CambioSobregiro(event:any) {
    this.checkboxSobreGiro = event.target.checked;
  }
}
