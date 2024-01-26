import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { EstadoSolicitudBodega } from '../../models/entity/EstadoSolicitudBodega';
import { EstadosolicitudbodegaService } from '../../servicios/estadosolicitudbodega.service';
import { Prioridades } from '../../models/entity/Prioridades';
import { PrioridadesService } from '../../servicios/prioridades.service';
import { BodegasService } from '../../servicios/bodegas.service';
import { Solicitud } from 'src/app/models/entity/Solicitud';

//Manejo de fechas
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DatePipe } from '@angular/common';
import { SolicitudService } from 'src/app/servicios/Solicitudes.service';
import { OrigenSolicitud } from 'src/app/models/entity/OrigenSolicitud';
import { BodegasTodas } from 'src/app/models/entity/BodegasTodas';
import { BodegasrelacionadaAccion } from 'src/app/models/entity/BodegasRelacionadas';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ConfiguracionLogisticoService } from 'src/app/servicios/configuracion-logistico.service';
import { validarQueFechasNoSeCrucen } from 'src/app/validadores/validar-que-fechas-no-se-crucen';
import { validarRangoFechas } from 'src/app/validadores/validar-rango-fechas';
import { element } from 'protractor';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-busquedasolicitudes',
  templateUrl: './busquedasolicitudes.component.html',
  styleUrls: ['./busquedasolicitudes.component.css']
})
export class BusquedasolicitudesComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  @Input() hdgcodigo: number;
  @Input() esacodigo: number;
  @Input() cmecodigo: number;
  @Input() titulo   : string;
  @Input() filtrodenegocio   : string;
  @Input() origen : string;
  @Input() numerosolic : number;
  @Input() paginaorigen: number; //pagina desde donde llega, ejemplo: pantalla despacho solicitudes

  public onClose                      : Subject<Solicitud>;
  public estado                       : boolean = false;
  public lForm                        : FormGroup;
  public prioridades                  : Array<Prioridades> = [];
  public ListaOrigenSolicitud         : Array<OrigenSolicitud> = [];
  public estadossolbods               : Array<EstadoSolicitudBodega> = [];
  public listasolicitudes             : Array<Solicitud> = [];
  public listasolicitudespaginacion   : Array<Solicitud> = [];
  public solicitud                    : Array<Solicitud> = [];
  public bodegasSolicitantes          : Array<BodegasTodas> = [];
  public bodegassuministro            : Array<BodegasrelacionadaAccion> = [];
  public loading                      = false;
  public servidor                     = environment.URLServiciosRest.ambiente;
  public usuario                      = environment.privilegios.usuario;
  //fechas
  public locale     = 'es';
  public bsConfig   : Partial<BsDatepickerConfig>;
  public colorTheme = 'theme-blue';

  constructor(
    public bsModalRef: BsModalRef,
    public formBuilder: FormBuilder,
    private _buscasolicitudService: SolicitudService,
    private EstadoSolicitudBodegaService: EstadosolicitudbodegaService,
    private PrioridadesService: PrioridadesService,
    public _BodegasService: BodegasService,
    public datePipe: DatePipe,
    public localeService: BsLocaleService,
    private configLogisticoService: ConfiguracionLogisticoService,
    public translate: TranslateService
  ) {

    this.lForm = this.formBuilder.group({
      numerosolicitud     : [{ value: null, disabled: false }, Validators.required],
      codorigensolicitud  : [{ value: null, disabled: false }, Validators.required],
      prioridad           : [{ value: null, disabled: false }, Validators.required],
      bodsercodigo        : [{ value: null, disabled: false }, Validators.required],
      estado              : [{ value: null, disabled: false }, Validators.required],
      fechadesde          : [new Date(),Validators.required ],
      fechahasta          : [new Date(),Validators.required ],
      tiposolicitud       : [{ value: null, disabled: false }, Validators.required],
      bodcodigo           : [{ value: null, disabled: false }, Validators.required],
      codbodegasuministro : [{ value: null, disabled: false }, Validators.required],
      codigo              : [{ value: null, disabled: false }, Validators.required],
      descripcion         : [{ value: null, disabled: false }, Validators.required]
    });

  }

  ngOnInit() {
    this.configLogisticoService
    .obtenerConfiguracion()
    .then(config => {
      this.lForm.setValidators([
        validarQueFechasNoSeCrucen('fechadesde',  'fechahasta'),
        validarRangoFechas('fechadesde',  'fechahasta', config.rangoFechasSolicitudes),
      ]);
      this.lForm.updateValueAndValidity();
    })
    .catch((error) => {
      console.error("[BUSCAR RANGO MAXIMO DE FECHAS] ", error);
      
      this.alertSwalError.title = 'Error al buscar rango máximo de fechas';
      this.alertSwalError.show();
    });

    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.setDate();
    this.onClose = new Subject();
    if(this.origen == "Autopedido" || this.origen =="DevolucionAutopedido"){
      this._buscasolicitudService.ListaOrigenSolicitud(this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo, this.usuario,this.servidor,60).subscribe(
        response => {
          if (response != null){
            this.ListaOrigenSolicitud = response;
          }
        },
        err => {
          console.log(err.error);
        }
      );
    }
    if(this.origen == "Otros"){
      this._buscasolicitudService.ListaOrigenSolicitud(this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo, this.usuario,this.servidor,30).subscribe(
        response => {
          if (response != null){
            this.ListaOrigenSolicitud = response;
          }
        },
        err => {
          console.log(err.error);
        }
      );
    }

    if(this.origen == "DevolucionAutopedido"){
      this.lForm.get('numerosolicitud').setValue(this.numerosolic);
    }

    this.PrioridadesService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo,this.usuario,this.servidor).subscribe(
      data => {
        this.prioridades = data;
      }, err => {
        console.log(err.error);
      }
    );

    this.EstadoSolicitudBodegaService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario,this.servidor).subscribe(
      data => {
        this.estadossolbods = data;
      }, err => {
        console.log(err.error);
      }
    );



    this._BodegasService.listaBodegaTodasSucursal(this.hdgcodigo, this.esacodigo, this.cmecodigo,this.usuario,this.servidor).subscribe(
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




  ngAfterViewInit() {
    this.BuscarSolicitudesFiltro();
  }

  onCerrar(SolicitudSeleccionada: Solicitud) {
    this.estado = true;
    this.onClose.next(SolicitudSeleccionada);
    this.bsModalRef.hide();
  };

  onCerrarSalir() {
    this.estado = true;
    this.onClose.next();
    this.bsModalRef.hide();
  };

  BuscarSolicitudesFiltro()
  {
    this.solicitud= [];
    this.listasolicitudes = [];
    this.listasolicitudespaginacion = []
    var servidor = environment.URLServiciosRest.ambiente;
    var idOrigen = 0;

    switch (this.origen) {
      case "Autopedido":
              idOrigen = 60;
              break;
      case "Otros":
              idOrigen = 0;
              break;
      case "DevolucionAutopedido":
              idOrigen = 60;
              this.lForm.controls.estado.disable();
              this.lForm.controls.bodcodigo.disable();
              this.lForm.controls.codbodegasuministro.disable();
              break;
    }

    if(this.lForm.value.codorigensolicitud >0){
      idOrigen = this.lForm.value.codorigensolicitud;
    }


    this.loading = true;
    this._buscasolicitudService.BuscaSolicitudCabecera(this.lForm.value.numerosolicitud, this.hdgcodigo,
    this.esacodigo, this.cmecodigo, this.lForm.value.tiposolicitud,
    this.datePipe.transform(this.lForm.value.fechadesde, 'yyyy-MM-dd'),
    this.datePipe.transform(this.lForm.value.fechahasta, 'yyyy-MM-dd'),
    this.lForm.value.bodcodigo,this.lForm.value.codbodegasuministro,
    this.lForm.value.estado,servidor, this.lForm.value.prioridad,0,0,0,0,0,"",this.filtrodenegocio,
    idOrigen,this.usuario,this.lForm.controls.codigo.value,this.lForm.controls.descripcion.value,
    this.paginaorigen, "",0, 0, "", "", "", "").subscribe(
    response => {
      if (response != null){
        if(response.length==0){
          this.loading = false;
          return;
        }else{
          if(response.length>0){
            this.solicitud =[];
            response.forEach(element =>{
              if( element.origensolicitud !=60 && this.origen == "Otros"){
                this.solicitud.push(element);
                this.listasolicitudes = this.solicitud;
                this.listasolicitudespaginacion = this.listasolicitudes.slice(0, 8);
              }else{
                if(element.origensolicitud ==60 && this.origen == "Autopedido" || this.origen == "DevolucionAutopedido"){

                  this.listasolicitudes = [];
                  this.listasolicitudespaginacion = []
                  this.listasolicitudes = response;
                  this.listasolicitudespaginacion = this.listasolicitudes.slice(0, 8);
                }
              }
            });
            this.loading= false;
          }
        }
      } else {
        this.loading= false;
      }
    },error => {
      console.log(error);
      this.alertSwalError.title=this.TranslateUtil('key.mensaje.error.buscar.solicitudes');
      this.alertSwalError.text =this.TranslateUtil('key.mensaje.no.encuentra.solicitudes');
      this.alertSwalError.show();
      this.loading=false;
    });
  }

  /* Función búsqueda con paginación */
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.listasolicitudespaginacion = this.listasolicitudes.slice(startItem, endItem);
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  BuscaBodegasSuministro(codbodega_solicitante: number) {
    this._BodegasService.listaBodegaRelacionadaAccion(this.hdgcodigo, this.esacodigo, this.cmecodigo,
    this.usuario,this.servidor, codbodega_solicitante,1).subscribe(
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

  Limpiar(){
    this.lForm.reset();
    this.lForm.get('fechadesde').setValue(new Date());
    this.lForm.get('fechahasta').setValue(new Date());
    this.listasolicitudespaginacion=[];
    this.listasolicitudes = [];
    this.solicitud = [];
  }

  getSolicitud(solicitud:any){
    solicitud= parseInt(solicitud)
    var servidor = environment.URLServiciosRest.ambiente;
    var idOrigen = 0;
    switch (this.origen) {
      case "Autopedido":
              idOrigen = 60;
              break;
      case "Otros":
              idOrigen = 0;
              break;
      case "DevolucionAutopedido":
              idOrigen = 60;
              this.lForm.controls.estado.disable();
              this.lForm.controls.bodcodigo.disable();
              this.lForm.controls.codbodegasuministro.disable();

              break;
    }

    if(this.lForm.value.codorigensolicitud >0){
      idOrigen = this.lForm.value.codorigensolicitud;
    }
    this.listasolicitudes = [];
    this.listasolicitudespaginacion = []
    this.loading = true;
    this._buscasolicitudService.BuscaSolicitudCabecera(solicitud, this.hdgcodigo,
      this.esacodigo, this.cmecodigo, this.lForm.value.tiposolicitud,
      null,null, 0,0,0,servidor, this.lForm.value.prioridad,0,0,0,0,0,"",this.filtrodenegocio,
      idOrigen,this.usuario,"","",this.paginaorigen, "",0, 0, "", "", "", "").subscribe(
      response => {
        if (response != null){
          if(response.length==0){
            this.loading = false;
            return;
          }else{
            if(response.length>0){
              this.solicitud =[];
              response.forEach(element =>{
                if( element.origensolicitud !=60 && this.origen == "Otros"){
                  this.listasolicitudes = [];
                  this.listasolicitudespaginacion = [];
                  this.solicitud.push(element);
                  this.listasolicitudes = this.solicitud;
                  this.listasolicitudespaginacion = this.listasolicitudes.slice(0, 8);
                }else{
                  if(element.origensolicitud ==60 && this.origen == "Autopedido" || this.origen == "DevolucionAutopedido"){
                    this.listasolicitudes = [];
                    this.listasolicitudespaginacion = [];

                    this.listasolicitudes = response;
                    this.listasolicitudespaginacion = this.listasolicitudes.slice(0, 8);
                  }
                }
              })

              this.loading= false;
            }
          }
        } else {
          this.loading = false;
        }
      },
      error => {
        console.log(error);
        this.alertSwalError.title=this.TranslateUtil('key.mensaje.error.buscar.solicitudes');
        this.alertSwalError.text =this.TranslateUtil('key.mensaje.no.encuentra.solicitudes');
        this.alertSwalError.show();
        this.loading=false;
      }
    );
  }
  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
