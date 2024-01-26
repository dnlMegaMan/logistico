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
import { SolicitudService } from 'src/app/servicios/Solicitudes.service';
import { Prioridades } from '../../models/entity/Prioridades';
import { PrioridadesService } from '../../servicios/prioridades.service';
import { Unidades } from '../../models/entity/Unidades';
import { Piezas } from '../../models/entity/Piezas';
import { Camas } from '../../models/entity/Camas';
import { EstructuraunidadesService } from '../../servicios/estructuraunidades.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Solicitud } from 'src/app/models/entity/Solicitud';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-busqueda-solicitud-paciente-ambulatorio',
  templateUrl: './busqueda-solicitud-paciente-ambulatorio.component.html',
  styleUrls: ['./busqueda-solicitud-paciente-ambulatorio.component.css']
})
export class BusquedaSolicitudPacienteAmbulatorioComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @Input() hdgcodigo: number;
  @Input() esacodigo: number;
  @Input() cmecodigo: number;
  @Input() titulo: string;
  @Input() cliid: string;
  @Input() ambito: number;
  @Input() tipodocumeto: number;
  @Input() numeroidentificacion: string;
  @Input() origen : string;

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
  listasolicitudespacientes          : Array<Solicitud> =[];
  listasolicitudespacientespaginacion: Array<Solicitud>=[];

  public estado                      : boolean = false;
  public servidor = environment.URLServiciosRest.ambiente;
  public usuario = environment.privilegios.usuario;

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
    public translate: TranslateService

  ) {
    this.FormBusquedaSolPac = this.formBuilder.group({
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

    this.onClose = new Subject();
    this.setDate();
    this.ListarEstUnidades();
    this.FormBusquedaSolPac.value.ambito = 2;

    this.TipoambitoService.list(this.hdgcodigo,this.esacodigo,this.cmecodigo,this.usuario,this.servidor).subscribe(
      data => {
        this.tiposambitos = data;

      }

    );

    this.TiporegistroService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario,this.servidor).subscribe(
      data => {
        this.tiposderegistros = data;

      }
    );
    this.PrioridadesService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario,this.servidor).subscribe(
      data => {
        this.prioridades = data;
      }
    );
    this.EstadosolicitudService.list(this.usuario,this.servidor).subscribe(
      data => {
        this.estadossolicitudes = data;

      }
    );

    this.DocidentificacionService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario, this.servidor, localStorage.getItem('language'), false).subscribe(
      data => {
        this.docsidentis = data;

      }
    );

    this.FormBusquedaSolPac.get('ambito').setValue(this.ambito);
    this.FormBusquedaSolPac.get('tipoidentificacion').setValue(this.tipodocumeto);
    this.FormBusquedaSolPac.get('numeroidentificacion').setValue(this.numeroidentificacion);
  }

  ngAfterViewInit() {
    this.BuscarSolicitudesPacientes();
  }

  async ListarEstUnidades() {
    const esacodigo = 1;
    try {
      this.unidades = await this.estructuraunidadesService.BuscarUnidades(
        this.hdgcodigo,
        //this.esacodigo,
        esacodigo,
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
    this.FormBusquedaSolPac.controls['cama'].disable();
    const idunidad = parseInt(event);
    this.FormBusquedaSolPac.controls['pieza'].enable();
    this.ListarPiezas(idunidad);
  }

  onSelectPieza(event: any) {
    this.camas = [];
    const idpieza = parseInt(event);
    this.FormBusquedaSolPac.controls['cama'].enable();
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

  BuscarSolicitudesPacientes(){

    var fechadesde=this.datePipe.transform(this.FormBusquedaSolPac.value.fechadesde, 'yyyy-MM-dd');
    var fechahasta=this.datePipe.transform(this.FormBusquedaSolPac.value.fechahasta, 'yyyy-MM-dd');
    this.loading = true;
    var idOrigen = 0;
    switch (this.origen) {
      case "Solicitud_Receta":
              // tipodeproducto = 'M';
              idOrigen= 70;
              break;
      // case "Insumos-Medicos":
      //         tipodeproducto = 'I';
      //         idBodega = this.id_Bodega;
      //         break;
      // case "Insumos_No_Medicos":
      //         tipodeproducto = 'O';
      //         break;




      default:
        // idOrigen = this.FormBusquedaSolPac.value.codorigen;
    }

    this._buscasolicitudService.BuscaSolicitud(0,this.hdgcodigo,
      this.esacodigo,this.cmecodigo,0,fechadesde,fechahasta,0,0,this.FormBusquedaSolPac.value.estado,
      this.servidor,this.FormBusquedaSolPac.value.prioridad,this.ambito, 0,0,0,this.FormBusquedaSolPac.value.tipoidentificacion,
      this.FormBusquedaSolPac.value.numeroidentificacion,idOrigen, "","").subscribe(
      response => {
        if (response != null){
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
    this.listasolicitudespacientes = [];
    this.listasolicitudespacientespaginacion = [];
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
