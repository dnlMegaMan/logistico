import { Component, OnInit, Input } from '@angular/core';
import { Solicitud } from 'src/app/models/entity/Solicitud';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { EstadosolicitudbodegaService } from 'src/app/servicios/estadosolicitudbodega.service';
import { BodegasService } from 'src/app/servicios/bodegas.service';
import { SolicitudService } from 'src/app/servicios/Solicitudes.service';
import { PrioridadesService} from '../../servicios/prioridades.service';
import { Prioridades } from 'src/app/models/entity/Prioridades';
import { EstadoSolicitudBodega } from 'src/app/models/entity/EstadoSolicitudBodega';
import { DetalleSolicitud } from 'src/app/models/entity/DetalleSolicitud';
import { OrigenSolicitud } from 'src/app/models/entity/OrigenSolicitud';
import { EventoDetalleSolicitud } from 'src/app/models/entity/EventoDetalleSolicitud';
import { BodegasrelacionadaAccion } from 'src/app/models/entity/BodegasRelacionadas';
import { BodegasTodas } from 'src/app/models/entity/BodegasTodas';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { defineLocale, esLocale } from 'ngx-bootstrap/chronos';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';


@Component({
  selector: 'app-eventos-detallesolicitud',
  templateUrl: './eventos-detallesolicitud.component.html',
  styleUrls: ['./eventos-detallesolicitud.component.css']
})
export class EventosDetallesolicitudComponent implements OnInit {

  @Input() hdgcodigo: number;
  @Input() esacodigo: number;
  @Input() cmecodigo: number;
  @Input() titulo   : string;
  @Input() _Solicitud: Solicitud;
  @Input() _DetalleSolicitud: DetalleSolicitud;

  public onClose: Subject<any>;

  public lForm                              : FormGroup;
  public locale                             = 'es';
  public bsConfig                           : Partial<BsDatepickerConfig>;
  public colorTheme                         = 'theme-blue';
  public prioridades                        : Array<Prioridades> = [];
  public ListaOrigenSolicitud               : Array<OrigenSolicitud> = [];
  public estadossolbods                     : Array<EstadoSolicitudBodega> = [];
  public listaEventosSolicitud              : Array<EventoDetalleSolicitud> = [];
  public listaEventosSolicitudPaginacion    : Array<EventoDetalleSolicitud> = [];
  public usuario                            : string;
  public servidor                           : string;
  public bodegassuministro                  : Array<BodegasrelacionadaAccion> = [];
  public bodegasSolicitantes                : Array<BodegasTodas> = [];

  constructor(
    public bsModalRef       : BsModalRef,
    public formBuilder      : FormBuilder,
    public _SolicitudService:SolicitudService,
    public datePipe         : DatePipe,
    public localeService    : BsLocaleService,
    public _BodegasService  : BodegasService,
    public _solicitudService: SolicitudService,
    ) {

      this.lForm = this.formBuilder.group({
        estadosolicitudde   : [{ value: null, disabled: false }, Validators.required],
        tiposolicitud       : [{ value: null, disabled: false }, Validators.required],
        numerosolicitud     : [{ value: null, disabled: false }, Validators.required],
        esticod             : [{ value: null, disabled: false }, Validators.required],
        hdgcodigo           : [{ value: null, disabled: false }, Validators.required],
        esacodigo           : [{ value: null, disabled: false }, Validators.required],
        cmecodigo           : [{ value: null, disabled: false }, Validators.required],
        desprioridadsoli    : [{ value: null, disabled: false }, Validators.required],
        fecha               : [new Date(), Validators.required],
        bodcodigo           : [{ value: null, disabled: false }, Validators.required],
        codbodegasuministro : [{ value: null, disabled: false }, Validators.required],
        codorigensolicitud  : [{ value: null, disabled: false }, Validators.required],
        desorigensolicitud  :  [{ value: null, disabled: false }, Validators.required],
        bodorigendesc       :  [{ value: null, disabled: false }, Validators.required],
        boddestinodesc      :  [{ value: null, disabled: false }, Validators.required],

        meindescri          : [{ value: null, disabled: false }, Validators.required],
        codmei              : [{ value: null, disabled: false }, Validators.required],
        cantdespachada      : [{ value: null, disabled: false }, Validators.required],
        cantpendiente       : [{ value: null, disabled: false }, Validators.required],
        cantdevolucion      : [{ value: null, disabled: false }, Validators.required],
        cantsoli            : [{ value: null, disabled: false }, Validators.required],


      });
    }

  ngOnInit() {

    this.onClose = new Subject();
    this.setDate();

    this.usuario = environment.privilegios.usuario;
    this.servidor = environment.URLServiciosRest.ambiente;
    this.lForm.get('desorigensolicitud').setValue(this._Solicitud.desorigensolicitud);

    this.lForm.get('tiposolicitud').setValue(this._Solicitud.tiposolicitud);
    this.lForm.get('numerosolicitud').setValue(this._Solicitud.soliid);
    this.lForm.get('desprioridadsoli').setValue(this._Solicitud.desprioridadsoli);
    this.lForm.get('bodorigendesc').setValue(this._Solicitud.bodorigendesc);
    this.lForm.get('boddestinodesc').setValue(this._Solicitud.boddestinodesc);
    this.lForm.get('estadosolicitudde').setValue(this._Solicitud.estadosolicitudde);
    this.lForm.get('fecha').setValue(new Date(this._Solicitud.fechacreacion));

    this.BuscaEventosDetalleSolictudes ();

    this.lForm.get('codmei').setValue(this._DetalleSolicitud.codmei);
    this.lForm.get('meindescri').setValue(this._DetalleSolicitud.meindescri);
    this.lForm.get('cantsoli').setValue(this._DetalleSolicitud.cantsoli);
    this.lForm.get('cantdespachada').setValue(this._DetalleSolicitud.cantdespachada);
    this.lForm.get('cantpendiente').setValue(this._DetalleSolicitud.cantsoli-this._DetalleSolicitud.cantdespachada);
    this.lForm.get('cantdevolucion').setValue(this._DetalleSolicitud.cantdevolucion);
  }

  BuscaEventosDetalleSolictudes () {
    this._solicitudService.BuscaEventoDetalleSolicitud(this.hdgcodigo, this.esacodigo,
      this.cmecodigo, this._Solicitud.soliid, this._DetalleSolicitud.sodeid, this.servidor).subscribe(
      response => {
        if (response != null) {
          this.listaEventosSolicitud = response;
          this.listaEventosSolicitudPaginacion = this.listaEventosSolicitud.slice(0,8);
        }
      }, error => {
        alert("Error al Buscar Familias")
      }
    );
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  onCerrarSalir() {

    this.onClose.next();
    this.bsModalRef.hide();
  };

  getHdgcodigo(event: any) {
    this.hdgcodigo = event.hdgcodigo;

  }
  getEsacodigo(event: any) {
    this.esacodigo = event.esacodigo;
  }

  getCmecodigo(event: any) {
    this.cmecodigo = event.cmecodigo;
  }

   /* Función búsqueda con paginación */

   pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.listaEventosSolicitudPaginacion = this.listaEventosSolicitud.slice(startItem, endItem);
  }

}
