import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { esLocale } from 'ngx-bootstrap/locale';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { DatePipe } from '@angular/common';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { AlertComponent } from 'ngx-bootstrap/alert/alert.component';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { DocIdentificacion } from '../../models/entity/DocIdentificacion';
import { BodegasTodas } from 'src/app/models/entity/BodegasTodas';
import { ConsultaPacientePorBodegas } from 'src/app/models/entity/ConsultaPacientePorBodegas';
import { Solicitud } from '../../models/entity/Solicitud';
import { ModalpacienteComponent } from '../modalpaciente/modalpaciente.component';
import { PacientesService } from '../../servicios/pacientes.service';
import { DocidentificacionService } from '../../servicios/docidentificacion.service';
import { BodegasService } from '../../servicios/bodegas.service';
import { InformesService } from '../../servicios/informes.service';
import { Paciente } from 'src/app/models/entity/Paciente';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-consumopacienteporbodega',
  templateUrl: './consumopacienteporbodega.component.html',
  styleUrls: ['./consumopacienteporbodega.component.css'],
  providers : [InformesService]
})
export class ConsumopacienteporbodegaComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;

  public modelopermisos           : Permisosusuario = new Permisosusuario();
  public FormConsumoPacienteBodega: FormGroup;
  public servidor                 = environment.URLServiciosRest.ambiente;
  public usuario                  = environment.privilegios.usuario;
  public hdgcodigo                : number;
  public esacodigo                : number;
  public cmecodigo                : number;
  public locale                   = 'es';
  public bsConfig                 : Partial<BsDatepickerConfig>;
  public colorTheme               = 'theme-blue';
  public detalleConsultaPacienteBodegas : Array<ConsultaPacientePorBodegas> = [];
  public detalleConsultaPacienteBodegasPaginacion : Array<ConsultaPacientePorBodegas> = [];
  public docsidentis              : Array<DocIdentificacion> = [];
  public bodegasSolicitantes      : Array<BodegasTodas> = [];
  public dataPacienteSolicitud    : Solicitud = new Solicitud();
  public activabodega             : boolean = false;
  public activabtnbuscar          : boolean = false;
  private _BSModalRef             : BsModalRef;
  public loading                  = false;
  public imprime                  : boolean = false;
  public alerts                   : Array<any> = [];
  public page                     : number = 1;
  public opt                      : string = "DESC";

  constructor(
    public datePipe                 : DatePipe,
    public localeService            : BsLocaleService,
    public DocidentificacionService : DocidentificacionService,
    public formBuilder              : FormBuilder,
    public _BsModalService          : BsModalService,
    public _BodegasService          : BodegasService,
    private _imprimesolicitudService: InformesService,
    public _PacientesService        : PacientesService,
    public translate: TranslateService
  ) {

    this.FormConsumoPacienteBodega = this.formBuilder.group({

      hdgcodigo     : [{ value: null, disabled: false }, Validators.required],
      esacodigo     : [{ value: null, disabled: false }, Validators.required],
      cmecodigo     : [{ value: null, disabled: false }, Validators.required],
      tipodocumento : [{ value: null, disabled: false }, Validators.required],
      numidentificacion: [{ value: null, disabled: false }, Validators.required],
      apematerno    : [{ value: null, disabled: false }, Validators.required],
      apepaterno    : [{ value: null, disabled: false }, Validators.required],
      nombres       : [{ value: null, disabled: false }, Validators.required],
      nombrepaciente: [{ value: null, disabled: true }, Validators.required],
      fechadesde    : [null, Validators.required],
      fechahasta    : [new Date(), Validators.required],

      bodcodigo     : [{ value: null, disabled: false }, Validators.required],
      servicio      : [{ value: 1, disabled: false }, Validators.required],

      numsolicitud  : [{ value: null, disabled: false}, Validators.required],
      cuenta  : [{ value: null, disabled: false}, Validators.required],
    });
   }

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();

    this.FormConsumoPacienteBodega.controls.bodcodigo.disable();

    this.getParametros();
    this.setDate();
    this.sortbySol('fechacrea');
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme,  isAnimated: true });
  }

  onClosed(dismissedAlert: AlertComponent): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
  }

  async getParametros() {
    try {
      this.docsidentis = await this.DocidentificacionService.list(this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo, this.usuario, this.servidor, localStorage.getItem('language'), false)
        .toPromise();
        console.log("tiposdoc:",this.docsidentis)
      // this.tipoambitos = await this._tipoambitoService.list(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor)
      //   .toPromise();
      // this.estadosolicitudes = await this._estadosolicitudesService.list(this.usuario, this.servidor)
      //   .toPromise();
    } catch (err) {
      this.alertSwalAlert.text = err.message;
      this.alertSwalAlert.show();
    }
  }

  SeleccionTipoDoc(){
    this.FormConsumoPacienteBodega.controls.numidentificacion.enable();
    this.FormConsumoPacienteBodega.controls.apepaterno.enable();
    this.FormConsumoPacienteBodega.controls.apematerno.enable();
    this.FormConsumoPacienteBodega.controls.nombres.enable();
    this.FormConsumoPacienteBodega.controls.fechadesde.enable();
    this.FormConsumoPacienteBodega.controls.fechahasta.enable();
  }

  async getPacienteTipoDoc(){
    try {
      this.loading = true;

      const pacientes = await this._PacientesService
        .BuscaPacientesAmbito(
          this.hdgcodigo,
          this.cmecodigo,
          this.esacodigo,
          this.FormConsumoPacienteBodega.controls.tipodocumento.value,
          this.FormConsumoPacienteBodega.controls.numidentificacion.value,
          this.FormConsumoPacienteBodega.controls.apepaterno.value,
          this.FormConsumoPacienteBodega.controls.apematerno.value,
          this.FormConsumoPacienteBodega.controls.nombres.value,
          null,
          null,
          null,
          this.servidor,
          null,
          0,
          false,
        )
        .toPromise();

      if (pacientes == null || pacientes.length == 0) {
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.existe.paciente');
        this.alertSwalAlert.show();
        return;
      }

      if (pacientes.length === 1) {
        await this.cargarDatosPaciente(pacientes[0]);
        return;
      }

      let hayPacientesDistintos = false;
      pacientes.forEach((x) => {
        pacientes.forEach((z) => {
          if (x.cliid != z.cliid) {
            hayPacientesDistintos = true;
          }
        });
      });

      if (hayPacientesDistintos) {
        this.BuscarPaciente(); // Abre modal de busqueda de paciente
      } else {
        await this.cargarDatosPaciente(pacientes[0]);
      }
    } catch (error) {
      alert(this.TranslateUtil('key.mensaje.error.buscar.paciente'));
    } finally {
      this.loading = false;
    }
  }

  private async cargarDatosPaciente(paciente: Paciente) {
    this.dataPacienteSolicitud = paciente;
    this.FormConsumoPacienteBodega.get('tipodocumento').setValue(this.dataPacienteSolicitud.tipodocpac);
    this.FormConsumoPacienteBodega.get('numidentificacion').setValue(this.dataPacienteSolicitud.numdocpac);
    this.FormConsumoPacienteBodega.get('apepaterno').setValue(this.dataPacienteSolicitud.apepaternopac);
    this.FormConsumoPacienteBodega.get('apematerno').setValue(this.dataPacienteSolicitud.apematernopac);
    this.FormConsumoPacienteBodega.get('nombres').setValue( this.dataPacienteSolicitud.nombrespac)
    this.FormConsumoPacienteBodega.get('bodcodigo').setValue(0)

    this.FormConsumoPacienteBodega.controls.bodcodigo.enable();

    this.FormConsumoPacienteBodega.controls.numidentificacion.disable();
    this.FormConsumoPacienteBodega.controls.apepaterno.disable();
    this.FormConsumoPacienteBodega.controls.apematerno.disable();
    this.FormConsumoPacienteBodega.controls.nombres.disable();

    await this.cargarBodegasDelPaciente()

    this.ActivaBotonBuscar();
  }

  private async cargarBodegasDelPaciente() {
    try {
      const bodegas = await this._BodegasService
        .combobodegadevpac(
          this.hdgcodigo,
          this.esacodigo,
          this.cmecodigo,
          this.usuario,
          this.servidor,
          this.dataPacienteSolicitud.cliid,
        )
        .toPromise();

      if (bodegas != null) {
        this.bodegasSolicitantes = bodegas;
      }
    } catch (error) {
      console.error('[BUSQUEDA DE BODEGAS].', error);
      alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.destino'));
    }
  }

  ActivaBotonBuscar() {
    this.activabtnbuscar = true;
  }

  BuscarPaciente() {
    this._BSModalRef = this._BsModalService.show(ModalpacienteComponent, this.setModal("Búsqueda de ".concat('Paciente')));
    this._BSModalRef.content.onClose.subscribe((Retorno: any) => {

      if (Retorno !== undefined) {
        this.loading = false;
        this.cargarDatosPaciente(Retorno)
      }
    })
  }

  setModal(titulo: string) {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: titulo,
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        tipo_busqueda: 'Todo-Medico',
        id_Bodega: 0,
        //ambito: this.FormDatosPaciente.controls.ambito.value, //this.FormDatosPaciente.value.ambito,
        nombrepaciente: this.FormConsumoPacienteBodega.controls.nombres.value,
        apepaternopac:  this.FormConsumoPacienteBodega.controls.apepaterno.value,
        apematernopac: this.FormConsumoPacienteBodega.controls.apematerno.value,
        // codservicioactual: this.dataPacienteSolicitud.codservicioactual,
        tipodocpac: this.FormConsumoPacienteBodega.controls.tipodocumento.value,
        numdocpac: this.FormConsumoPacienteBodega.controls.numidentificacion.value,
        buscasolicitud: "Solicitud_Paciente",
        // descprod: this.descprod,
        // codprod: this.codprod
      }
    };
    return dtModal;
  }

  limpiar(){
    this.activabtnbuscar = false;
    this.FormConsumoPacienteBodega.controls.bodcodigo.enable();
    this.FormConsumoPacienteBodega.controls.numidentificacion.enable();
    this.FormConsumoPacienteBodega.controls.apepaterno.enable();
    this.FormConsumoPacienteBodega.controls.apematerno.enable();
    this.FormConsumoPacienteBodega.controls.nombres.enable();
    this.FormConsumoPacienteBodega.controls.fechadesde.enable();
    this.FormConsumoPacienteBodega.controls.fechahasta.enable();
    this.FormConsumoPacienteBodega.reset();
    this.FormConsumoPacienteBodega.get('fechahasta').setValue(new Date());
    this.FormConsumoPacienteBodega.get('fechadesde').setValue(null);
    this.imprime = false;
    this.detalleConsultaPacienteBodegas = [];
    this.detalleConsultaPacienteBodegasPaginacion = [];
    this.page = 1;
  }

  async BuscarConsumo() {
    const cuentaParseada = await this.parsearCuenta()
    if (!cuentaParseada) {
      return;
    }

    try {
      this.loading = true;

      const consultas = await this._PacientesService
        .ConsumoPacientesPorBodegas(this.servidor,this.hdgcodigo,
          this.esacodigo,this.cmecodigo,
          this.datePipe.transform(this.FormConsumoPacienteBodega.controls.fechadesde.value, 'yyyy-MM-dd'),
          this.datePipe.transform( this.FormConsumoPacienteBodega.controls.fechahasta.value, 'yyyy-MM-dd'),
          this.FormConsumoPacienteBodega.controls.numidentificacion.value,
          this.FormConsumoPacienteBodega.controls.nombres.value,
          this.FormConsumoPacienteBodega.controls.apepaterno.value,
          this.FormConsumoPacienteBodega.controls.apematerno.value, null,null,null,null,null,null,
          this.FormConsumoPacienteBodega.controls.tipodocumento.value,
          this.FormConsumoPacienteBodega.controls.bodcodigo.value,
          cuentaParseada.numcuenta,
          cuentaParseada.numsubcuenta,
        )
        .toPromise()

      if (consultas == null || consultas.length === 0) {
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.informacion.datos.ingresados');
        this.alertSwalAlert.show();
        return;
      }

      this.detalleConsultaPacienteBodegas = consultas;
      this.detalleConsultaPacienteBodegasPaginacion = this.detalleConsultaPacienteBodegas;
      this.imprime = true;

      /* NOTA: Cuando uno esta en una página distinta a la primera y se vuelve a buscar el
       * consumo, si se traen menos resultados que la primera vez (por ejemplo, al agregar un
       * numero de cuenta) se queda pegada en esa página y podría no mostrar resultados si estos no
       * alcanzan a cubrir hasta la página en la que uno esta. Para evitar esto, se devuelve a la
       * primera página cada vez que se traen resultados. */
      this.page = 1;
    } catch (error) {
      console.log(error);
      this.alertSwalError.title = 'Error '.concat(error.message);
      this.alertSwalError.show();
    } finally {
      this.loading = false;
    }
  }

  /**
   * Separa la cuenta del formulario en formato `<cuenta>-<subcuenta>` en el número de cuenta y el
   * número de subcuenta.
   */
  private async parsearCuenta() {
    const cuenta = this.FormConsumoPacienteBodega.value.cuenta;
    let numcuenta: number | null = null;
    let numsubcuenta: number | null = null;

    if (!cuenta || cuenta.trim() === '') {
      return  { numcuenta, numsubcuenta };
    }

    const [numeroCuenta, numeroSubcuenta] = cuenta.split('-');

    if (!numeroCuenta || !numeroSubcuenta) {
      const title = document.createElement('h2');
      title.innerHTML = 'El campo cuenta debe tener el formato <strong>cuenta-subcuenta</strong>';

      this.alertSwalAlert.title = title;
      await this.alertSwalAlert.show();
      return null;
    }

    numcuenta = parseInt(numeroCuenta);
    numsubcuenta = parseInt(numeroSubcuenta);
    if (Number.isNaN(numcuenta) || Number.isNaN(numsubcuenta)) {
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.cuenta.subcuenta.deben.ser.numeros');
      await this.alertSwalAlert.show();
      return null;
    }

    return { numcuenta, numsubcuenta };
  }

  /* Función búsqueda con paginación */
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.detalleConsultaPacienteBodegasPaginacion = this.detalleConsultaPacienteBodegas;//.slice(startItem, endItem);
  }

  onImprimir(){
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.desea.imprimir.consulta'),
      text: this.TranslateUtil('key.mensaje.confirmar.impresion'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.ImprimirSolicitud();
      }
    })

  }

  ImprimirSolicitud() {

    // this._imprimesolicitudService.RPTImprimeConsumoPacienteXBodegas(this.servidor,this.hdgcodigo,
    // this.esacodigo, this.cmecodigo,"pdf",this._Solicitud.soliid).subscribe(
    //   response => {

    //     window.open(response[0].url, "", "", true);
    //     // this.alertSwal.title = "Reporte Impreso Correctamente";
    //     // this.alertSwal.show();
    //   },
    //   error => {
    //     console.log(error);
    //     this.alertSwalError.title = "Error al Imprimir Listado";
    //     this.alertSwalError.show();
    //     this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
    //     })
    //   }
    // );
  }

  sortbySol(opt: string){
    var rtn1 : number;
    var rtn2 : number;
    if(this.opt === "ASC"){
      rtn1 = 1;
      rtn2 = -1;
      this.opt = "DESC"
    } else {
      rtn1 = -1;
      rtn2 = 1;
      this.opt = "ASC"
    }

    switch (opt) {
      case 'fechacrea':
        this.detalleConsultaPacienteBodegasPaginacion.sort(function (a, b) {
          if (a.fechacrea > b.fechacrea) {
            return rtn1;
          }
          if (a.fechacrea < b.fechacrea) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'soliid':
        this.detalleConsultaPacienteBodegasPaginacion.sort(function (a, b) {
          if (a.soliid > b.soliid) {
            return rtn1;
          }
          if (a.soliid < b.soliid) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
        case 'estado':
          this.detalleConsultaPacienteBodegasPaginacion.sort(function (a, b) {
            if (a.estado > b.estado) {
              return rtn1;
            }
            if (a.estado < b.estado) {
              return rtn2;
            }
            // a must be equal to b
            return 0;
          });
          break;
      case 'cuenta':
        this.detalleConsultaPacienteBodegasPaginacion.sort(function (a, b) {
          if (a.cuenta > b.cuenta) {
            return rtn1;
          }
          if (a.cuenta < b.cuenta) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'cgoid':
        this.detalleConsultaPacienteBodegasPaginacion.sort(function (a, b) {
          if (a.cgoid > b.cgoid) {
            return rtn1;
          }
          if (a.cgoid < b.cgoid) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'codmei':
        this.detalleConsultaPacienteBodegasPaginacion.sort(function (a, b) {
          if (a.codmei > b.codmei) {
            return rtn1;
          }
          if (a.codmei < b.codmei) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'desmei':
        this.detalleConsultaPacienteBodegasPaginacion.sort(function (a, b) {
          if (a.desmei > b.desmei) {
            return rtn1;
          }
          if (a.desmei < b.desmei) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'cantsoli':
        this.detalleConsultaPacienteBodegasPaginacion.sort(function (a, b) {
          if (a.cantsoli > b.cantsoli) {
            return rtn1;
          }
          if (a.cantsoli < b.cantsoli) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'cantidad':
        this.detalleConsultaPacienteBodegasPaginacion.sort(function (a, b) {
          if (a.cantidad > b.cantidad) {
            return rtn1;
          }
          if (a.cantidad < b.cantidad) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'candevuelta':
        this.detalleConsultaPacienteBodegasPaginacion.sort(function (a, b) {
          if (a.candevuelta > b.candevuelta) {
            return rtn1;
          }
          if (a.candevuelta < b.candevuelta) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'descserv':
        this.detalleConsultaPacienteBodegasPaginacion.sort(function (a, b) {
          if (a.descserv > b.descserv) {
            return rtn1;
          }
          if (a.descserv < b.descserv) {
            return rtn2;
          }
          // a must be equal to b
          return 0;
        });
        break;
      case 'usuacreacion':
        this.detalleConsultaPacienteBodegasPaginacion.sort(function (a, b) {
          if (a.usuacreacion > b.usuacreacion) {
            return rtn1;
          }
          if (a.usuacreacion < b.usuacreacion) {
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
  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
