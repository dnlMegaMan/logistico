import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { TipoRegistro } from '../../models/entity/TipoRegistro';
import { TiporegistroService } from '../../servicios/tiporegistro.service';
import { BodegasService } from '../../servicios/bodegas.service';
import { ReposicionArticulos } from '../../models/entity/ReposicionArticulos';
import { ReposicionArticulosService } from '../../servicios/reposicionarticulos.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Solicitud } from '../../models/entity/Solicitud';
import { DetalleSolicitud } from 'src/app/models/entity/DetalleSolicitud';
import { DatePipe } from '@angular/common';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BodegasTodas } from 'src/app/models/entity/BodegasTodas';
import { BodegasrelacionadaAccion } from 'src/app/models/entity/BodegasRelacionadas';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { TipoReposicion } from '../../models/entity/TipoReposicion';
import { BusquedaplantillasbodegaComponent } from '../busquedaplantillasbodega/busquedaplantillasbodega.component'
import { Plantillas } from 'src/app/models/entity/PlantillasBodegas';
import { StockCritico } from 'src/app/models/entity/StockCritico';
import { InformesService } from '../../servicios/informes.service';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-reposicion-articulos',
  templateUrl: './reposicion-articulos.component.html',
  styleUrls: ['./reposicion-articulos.component.css'],
  providers: [ReposicionArticulosService, InformesService]
})
export class ReposicionArticulosComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('codigo', { static: false }) focusField: ElementRef;

  public modelopermisos: Permisosusuario = new Permisosusuario();
  public FormReposicion: FormGroup;
  public FormDatosProducto: FormGroup;
  public tiposderegistros: Array<TipoRegistro> = [];
  public bodegasSolicitantes: Array<BodegasTodas> = [];
  public bodegassuministro: Array<BodegasrelacionadaAccion> = [];
  public varSolicitud: Solicitud;
  public detallearticulosreposicion: Array<ReposicionArticulos> = [];
  public detallearticulosreposicionpaginacion: Array<ReposicionArticulos> = [];
  public detallearticulosreposicion_aux: Array<ReposicionArticulos> = [];
  public detallearticulosreposicionpaginacion_aux: Array<ReposicionArticulos> = [];
  public detallearticulosreposicion_2: Array<ReposicionArticulos> = [];
  public detalleplant: Array<ReposicionArticulos> = [];
  public tiposdereposicion: Array<TipoReposicion> = [];
  public Plantilla: Plantillas;
  public detallestockcritico: Array<StockCritico> = [];
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public numsolicitud: number = 0;
  public servidor = environment.URLServiciosRest.ambiente;
  public usuario = environment.privilegios.usuario;
  private _BSModalRef: BsModalRef;
  public _PageChangedEvent: PageChangedEvent;

  public locale = 'es';
  public bsConfig: Partial<BsDatepickerConfig>;
  public colorTheme = 'theme-blue';

  public loading = false;
  public buscaplantilla = false;
  public existesolicitud: boolean = false;
  public ActivaBotonBuscaGrilla: boolean = false;
  public ActivaBotonLimpiaBusca: boolean = false;
  public verificanull = false;

  editField: string;

  constructor(
    private TiporegistroService: TiporegistroService,
    private _BodegasService: BodegasService,
    private _reposicionService: ReposicionArticulosService,
    private formBuilder: FormBuilder,
    public datePipe: DatePipe,
    public localeService: BsLocaleService,
    public _BsModalService: BsModalService,
    private _imprimesolicitudService: InformesService,
    public translate: TranslateService
  ) {
    this.FormReposicion = this.formBuilder.group({
      mein: [{ value: null, disabled: false }],
      codigo: [{ value: null, disabled: false }],
      hdgcodigo: [{ value: null, disabled: false }],
      esacodigo: [{ value: null, disabled: false }],
      cmecodigo: [{ value: null, disabled: false }],
      tiporegistro: [{ value: null, disabled: false }, Validators.required],
      bodcodigo: [{ value: null, disabled: false }, Validators.required],
      codbodegasuministro: [{ value: null, disabled: false }, Validators.required],
      fechadesde: [new Date(), Validators.required],
      fechahasta: [new Date(), Validators.required],
      chequeatodo: [{ value: null, disabled: false }],
      tiporeposicion: [{ value: null, disabled: false }, Validators.required]
    }
    );
    // this.FormDatosProducto = this.formBuilder.group({
    //   codigo: [{ value: null, disabled: false }, Validators.required]
    // });
    this.detallearticulosreposicion = [];
  }

  ngOnInit() {
    this.FormDatosProducto = this.formBuilder.group({
      codigo: [{ value: null, disabled: false }, Validators.required]
    });
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.BuscaBodegasSolicitantes();
    this.setDate();

    this.TiporegistroService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario, this.servidor).subscribe(
      data => {
        this.tiposderegistros = data;
      }, err => {
        console.log(err.error);
      }
    );

    this.TiporegistroService.tiporeposicion(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor).subscribe(
      data => {
        this.tiposdereposicion = data;
      }, err => {
        console.log(err.error);
      }
    );
  }

  esCantidadReponerValida(articulo: ReposicionArticulos): boolean {
    return (
      (articulo &&
        articulo.cantidadareponer != null &&
        articulo.cantidadareponer > 0 &&
        articulo.cantidadareponer <= articulo.stocksuministro) ||
      articulo.marca === 'N'
    );
  }

  mensajeErrorCantidadReponer(articulo: ReposicionArticulos): string {
    if (articulo.cantidadareponer <= 0) {
      return this.TranslateUtil('key.mensaje.debe.ser.mayor.cero');
    }

    if (!this.esCantidadReponerValida(articulo)) {
      return this.TranslateUtil('key.mensaje.debe.ser.menor.stock.bodega.suministro');
    }

    return ''
  }

  updateList(id: number, property: string, registro: ReposicionArticulos) {
    this.detallearticulosreposicion[id][property] = this.detallearticulosreposicionpaginacion[id][property]
    this.logicaVacios();
  }

  changeValue(id: number, property: string, event: any) {
    this.editField = event.target.textContent;
  }

  SeleccionaTipoRep(tipo: any) {
    // console.log(tipo)
    switch (tipo) {
      case 1:
        this.buscaplantilla = false;
        break;

      case 2:
        this.buscaplantilla = true;
        this.detallearticulosreposicionpaginacion = [];
        this.detallearticulosreposicion = [];
        break;

      case 3:
        this.buscaplantilla = false;
        break;

      case 4:
        // this.buscaplantilla = false; faltadefinicion???
        break;

      default:
        break;
    }
  }

  async BuscarPlantillas() {
    const plantillaSeleccionada = await this.buscarPlantillaEnModal();

    if (!plantillaSeleccionada) {
      return;
    }

    try {
      this.loading = true;

      const plantillaCompleta = await this._BodegasService
        .BuscaPlantillas(
          this.servidor,
          sessionStorage.getItem('Usuario'),
          this.hdgcodigo,
          this.esacodigo,
          this.cmecodigo,
          plantillaSeleccionada.planid,
          '',
          '',
          '',
          0,
          0,
          '',
          '',
          1,
          '',
        )
        .toPromise();

      if (!plantillaCompleta || plantillaCompleta.length === 0) {
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.encontro.planilla');
        await this.alertSwalAlert.show();
        return;
      }

      this.Plantilla = plantillaCompleta[0];

      await this.BuscaBodegasSuministro(this.Plantilla.bodorigen);

      this.FormReposicion.patchValue({
        bodcodigo: this.Plantilla.bodorigen,
        codbodegasuministro: this.Plantilla.boddestino,
      });

      this.detalleplant = this.Plantilla.plantillasdet;
      this.Plantilla.plantillasdet.forEach((element) => {
        // this.setPlantilla(element);
        var temporal = new ReposicionArticulos();
        const indx = this.detallearticulosreposicion.findIndex(
          (x) => x.codigomein === element.codmei,
          1,
        );

        // console.log("recorre detalle planilla;",indx)
        if (indx >= 0) {
          // console.log("tiene producto repetido")
          // this.alertSwalError.title = "Código ya existe en la grilla";
          // this.alertSwalError.show();
        } else {
          console.log('No hay producto repetido y se guarda en la grilla');
          temporal.codigomein = element.codmei;
          temporal.meinid = element.meinid;
          temporal.descripcionmein = element.meindescri;
          temporal.fechamov = element.fechacreacion;
          temporal.cantidadareponer = element.cantsoli;
          temporal.cantidadareponerresp = temporal.cantidadareponer;
          temporal.marca = 'S';
          temporal.stocksuministro = element.stockdestino;

          this.detallearticulosreposicion.unshift(temporal);
        }
      });

      this.detallearticulosreposicionpaginacion = this.detallearticulosreposicion.slice(0, 20);
      this.detallearticulosreposicion_aux = this.detallearticulosreposicion;
      this.detallearticulosreposicionpaginacion_aux = this.detallearticulosreposicionpaginacion;
      this.ActivaBotonBuscaGrilla = true;
      this.logicaVacios();
    } catch (error) {
      console.error('[ERROR BUSCAR PLANTILLA] ', error);
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.buscar.plantilla');
      await this.alertSwalError.show();
    } finally {
      this.loading = false;
    }
  }

  async buscarPlantillaEnModal() {
    const modalRef = this._BsModalService.show(BusquedaplantillasbodegaComponent, {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.busqueda.plantilla'), // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        tipoplantilla: true,
        tipopedido: 1,
      },
    });

    return (modalRef.content.onClose as Subject<Plantillas>).pipe(take(1)).toPromise();
  }

  setPlantilla(art: ReposicionArticulos) {
    console.log("art:", art)

    const indx = this.detallearticulosreposicion.findIndex(x => x.codigomein === art.codmei, 1);
    console.log("recorre detalle grilla;", indx)


    this.detallearticulosreposicion.forEach(x=>{
      console.log("X:",x)
      if(x.codmei === art.codmei){
        this.alertSwalError.title = "Código: "+ art.codmei+"  ya existe en la grilla";
          this.alertSwalError.show();
      }
    })

    if (indx >= 0) {
      console.log("tiene producto repetido")
      // this.alertSwalError.title = "Código ya existe en la grilla";
      // this.alertSwalError.show();
    }else{
      console.log("No hay producto repetido y se guarda en la grilla")
      var temporal = new ReposicionArticulos;
      temporal.codigomein = art.codmei;
      temporal.meinid = art.meinid;
      temporal.descripcionmein = art.meindescri;
      temporal.fechamov = art.fechacreacion;
      temporal.cantidadareponer = art.cantsoli;
      temporal.cantidadareponerresp = temporal.cantidadareponer;
      temporal.marca = "S";

      this.detallearticulosreposicion.unshift(temporal);
      this.detallearticulosreposicionpaginacion = this.detallearticulosreposicion.slice(0, 20);
      this.detallearticulosreposicion_aux = this.detallearticulosreposicion;
      this.detallearticulosreposicionpaginacion_aux = this.detallearticulosreposicionpaginacion;
      this.ActivaBotonBuscaGrilla = true;
      this.logicaVacios();
    }



  }

  async logicaVacios() {
    if (this.detallearticulosreposicion.length === 0) {
      this.verificanull = false;
      return;
    }

    for (const articulo of this.detallearticulosreposicion) {
      if (!this.esCantidadReponerValida(articulo)) {
        this.verificanull = false;
        return;
      }
    }

    this.verificanull = true;
  }

  BuscarRegistros() {
    var indice: number = 0;
    this.loading = true;

    const bodegaSuministro = this.bodegassuministro.find(b => b.bodcodigo === this.FormReposicion.value.codbodegasuministro);

    this._reposicionService
      .BuscaRegistros(
        this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.FormReposicion.value.bodcodigo,
        this.FormReposicion.value.tiporegistro,
        this.datePipe.transform(this.FormReposicion.value.fechadesde, 'yyyy-MM-dd'),
        this.datePipe.transform(this.FormReposicion.value.fechahasta, 'yyyy-MM-dd'),
        this.usuario,
        this.servidor,
        this.FormReposicion.value.tiporeposicion,
        "",
        bodegaSuministro.bodcodigo,
        bodegaSuministro.bodtipobodega,
      ).subscribe(
        response => {
          if (response != null) {
            this.detallearticulosreposicion = response;
            if (this.detallearticulosreposicion.length > 0) {
              this.FormReposicion.get('chequeatodo').setValue(true);

              this.detallearticulosreposicion.forEach(element => {
                element.cantidadareponerresp = element.cantidadareponer;
                this.detallearticulosreposicion[indice].marca = "S";
                this.detallearticulosreposicion[indice].meinid = element.codmeinid;
                indice++;
              }
              );
              this.detallearticulosreposicionpaginacion = this.detallearticulosreposicion.slice(0, 20);
              this.detallearticulosreposicion_aux = this.detallearticulosreposicion;
              this.detallearticulosreposicionpaginacion_aux = this.detallearticulosreposicionpaginacion;
              this.ActivaBotonBuscaGrilla = true;
              this.logicaVacios();
            } else {
              this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.encuentra.registro.para.procesar'); //mensaje a mostrar
              this.alertSwalAlert.show();// para que aparezca
              this.logicaVacios();
            }
          }
          this.loading = false;
        },
        error => {
          this.loading = false;
          alert(this.TranslateUtil('key.mensaje.error.buscar.registros'));
          console.log(error);
        }
      );
  }

  ConfirmarGenerarSolicitud(datos: any) {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.generar.solicitud'),
      text: this.TranslateUtil('key.mensaje.confirmar.creacion.solicitud'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.generarSolicitud(datos);
      }
    })
  }

  async generarSolicitud(values: any) {
    this.setSolicitud(values);

    if (this.varSolicitud.solicitudesdet.length === 0) {
      await this.mostrarAlertaSinProductosSeleccionados();
      return;
    }

    if (this.varSolicitud.solicitudesdet.some((d) => d.cantsoli <= 0)) {
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.articulos.con.cantidad.reponer.menor.igual.cero');
      this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.si.no.desea.reponer.articulo.desmarcar.casilla.derecha');
      await this.alertSwalAlert.show();
      return;
    }

    try {
      this.loading = true;

      const response = await this._reposicionService.crearSolicitud(this.varSolicitud).toPromise();

      this.loading = false;

      if (response == null) {
        return;
      }

      if (response.idpedidofin700 > 0) {
        this.alertSwal.title = `Solicitud creada N°: ${response.solbodid}\n N° Pedido Fin700: ${response.idpedidofin700}`;
      } else {
        this.alertSwal.title = `Solicitud creada N°: ${response.solbodid}`;
      }

      await this.alertSwal.show();
      this.numsolicitud = response.solbodid;
      this.existesolicitud = true;
      this.verificanull = false;
    } catch (error) {
      this.loading = false;

      console.log('[ERROR GENERAR SOLICITUD] ', error);

      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.generar.solicitud');
      await this.alertSwalError.show();
    }
  }

  setSolicitud(values: any){
    this.varSolicitud = new Solicitud(null);

    this.varSolicitud.soliid = 0;
    this.varSolicitud.hdgcodigo = this.hdgcodigo;
    this.varSolicitud.esacodigo = this.esacodigo;
    this.varSolicitud.cmecodigo = this.cmecodigo;
    this.varSolicitud.bodorigen = values.bodcodigo;
    this.varSolicitud.boddestino = values.codbodegasuministro;
    this.varSolicitud.estadosolicitud = 10;
    this.varSolicitud.usuariocreacion = this.usuario;
    this.varSolicitud.fechacreacion = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.varSolicitud.usuariomodifica = null;
    this.varSolicitud.fechamodifica = null;
    this.varSolicitud.usuarioelimina = null;
    this.varSolicitud.fechaelimina = null;
    this.varSolicitud.servidor = this.servidor;
    this.varSolicitud.cama = null;
    this.varSolicitud.cliid = 0;
    this.varSolicitud.tipodocpac = 0;
    this.varSolicitud.numdocpac  = null;
    this.varSolicitud.descidentificacion = null;
    this.varSolicitud.apepaternopac  = null;
    this.varSolicitud.apematernopac  = null;
    this.varSolicitud.nombrespac     = null;
    this.varSolicitud.codambito = 0;
    this.varSolicitud.estid = 0;
    this.varSolicitud.ctaid = 0;
    this.varSolicitud.edadpac  = 0;
    this.varSolicitud.tipoedad  = null;
    this.varSolicitud.codsexo  = 0
    this.varSolicitud.codservicioori = 0;
    this.varSolicitud.codserviciodes = 0;
    // this.varSolicitud.tipoproducto         ?: number,
    this.varSolicitud.tiporeceta  = null;
    this.varSolicitud.numeroreceta = 0;
    this.varSolicitud.tipomovim =  'C';
    // this.varSolicitud.prioridadsoli        ?: number,
    this.varSolicitud.tipodocprof = 0;
    this.varSolicitud.numdocprof = null;
    this.varSolicitud.alergias = null;
    this.varSolicitud.fechacierre = null;
    this.varSolicitud.usuariocierre = null;
    this.varSolicitud.observaciones = null;
    this.varSolicitud.ppnpaciente = 0;
    this.varSolicitud.convenio = null;
    this.varSolicitud.diagnostico = null;
    this.varSolicitud.nombremedico  = null;
    this.varSolicitud.cuentanumcuenta = '0';
    this.varSolicitud.bodorigendesc = null;
    this.varSolicitud.boddestinodesc = null;

    if (this.FormReposicion.value.tiporeposicion == 4) {  //Estas son urgentes
      this.varSolicitud.prioridadsoli = 2;
    } else {
      this.varSolicitud.prioridadsoli = 1;
    }
    this.varSolicitud.accion = "I";
    this.varSolicitud.tiposolicitud = 10; // Solicitud de reposición
    this.varSolicitud.origensolicitud = 10; // Reposición de Bodegas
    this.varSolicitud.estadocomprobantecaja = 0;

    this.varSolicitud.solicitudesdet = [];

    for(const element of this.detallearticulosreposicion){
      if (element.marca == "S") {
        const detalleSolicitud = new DetalleSolicitud();

        detalleSolicitud.codmei = element.codigomein;
        detalleSolicitud.estado = 10; // Solicitado
        detalleSolicitud.meinid = element.meinid;
        detalleSolicitud.sodeid = 0;
        detalleSolicitud.soliid = 0;
        detalleSolicitud.cantsoli = Number(element.cantidadareponer);
        detalleSolicitud.cantdespachada = 0;
        detalleSolicitud.usuariomodifica = null;
        detalleSolicitud.fechamodifica = null;
        detalleSolicitud.usuarioelimina = null;
        detalleSolicitud.fechaelimina = null;
        detalleSolicitud.acciond = "I";
        this.varSolicitud.solicitudesdet.unshift(detalleSolicitud);
      }
    }
  }

  /* llena combobox de bodegas perioféricas */
  async BuscaBodegasSolicitantes() {
    try {
      this.bodegasSolicitantes = await this._BodegasService
        .listaBodegaTodasSucursal(
          this.hdgcodigo,
          this.esacodigo,
          this.cmecodigo,
          this.usuario,
          this.servidor,
        )
        .toPromise();
    } catch (error) {
      console.error('[BUSCAR BODEGA SOLICITANTE] ', error);
    }
  }

  async BuscaBodegasSuministro(idBodega: number) {
    this.bodegassuministro = [];

    try {
      this.bodegassuministro = await this._BodegasService
        .listaBodegaRelacionadaAccion(
          this.hdgcodigo,
          this.esacodigo,
          this.cmecodigo,
          this.usuario,
          this.servidor,
          idBodega,
          1,
        )
        .toPromise();
    } catch (error) {
      console.error('[BUSCAR BODEGA SUMINISTRO] ', error);
    }
  }

  cambio_checktodo(event: any) {
    for (const articulo of this.detallearticulosreposicion) {
      articulo.marca = event.target.checked ? 'S' : 'N';
    }

    this.detallearticulosreposicionpaginacion = this.detallearticulosreposicion.slice(0, 20);
    this.verificanull = event.target.checked;

    if (event.target.checked) {
      this.logicaVacios();
    } else {
      this.mostrarAlertaSinProductosSeleccionados();
    }
  }

  cambio_check(id: number, property: string, event: any) {
    this.detallearticulosreposicionpaginacion[id][property] = event.target.checked ? 'S' : 'N';
    this.detallearticulosreposicion[id][property] = this.detallearticulosreposicionpaginacion[id][property];

    if (this.detallearticulosreposicion.some((a) => a.marca === 'S') === false) {
      this.mostrarAlertaSinProductosSeleccionados();
      this.verificanull = false;
    } else {
      this.logicaVacios();
    }
  }

  private async mostrarAlertaSinProductosSeleccionados() {
    this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.para.poder.generar.solicitud.seleccionar.un.articulo');
    await this.alertSwalAlert.show();
  }

  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.detallearticulosreposicionpaginacion = this.detallearticulosreposicion.slice(startItem, endItem);
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  limpiar() {
    this.FormReposicion.reset();
    this.detallearticulosreposicionpaginacion = [];
    this.detallearticulosreposicion = [];
    this.FormReposicion.get('fechadesde').setValue(new Date());
    this.FormReposicion.get('fechahasta').setValue(new Date());
    this.buscaplantilla = false;
    this.ActivaBotonBuscaGrilla = false;
    this.verificanull = false;
  }

  onImprimir() {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.imprimir.solicitud'),
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
    });
  }

  ImprimirSolicitud() {
    this._imprimesolicitudService.RPTImprimeSolicitudBodega(this.servidor, this.hdgcodigo, this.esacodigo,
      this.cmecodigo, "pdf", this.numsolicitud).subscribe(
        response => {
          if (response != null) {
            // window.open(response[0].url, "", "", true);
            window.open(response[0].url, "", "");
          }
        },
        error => {
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.listado');
          this.alertSwalError.show();
          this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {});
          alert(this.TranslateUtil('key.mensaje.error.imprimir.listado.inventario'));
        }
      );
  }

  async findArticuloGrilla() {
    this.loading = true;
    var indice: number = 0;

    // console.log('this.FormDatosProducto.controls.codigo.value : ' , this.FormDatosProducto.controls.codigo);
    if (this.FormDatosProducto.controls.codigo.touched &&
      this.FormDatosProducto.controls.codigo.status !== 'INVALID') {
      var codProdAux = this.FormDatosProducto.controls.codigo.value.toString();
      // if(this.FormReposicion.controls.numsolicitud.value >0){

      this.detallearticulosreposicion = [];
      this.detallearticulosreposicionpaginacion = [];
      if (this.FormReposicion.value.tiporeposicion === 1 || this.FormReposicion.value.tiporeposicion === 3) {
        const bodegaSuministro = this.bodegassuministro.find(b => b.bodcodigo === this.FormReposicion.value.codbodegasuministro);

        this._reposicionService
          .BuscaRegistros(
            this.hdgcodigo,
            this.esacodigo,
            this.cmecodigo,
            this.FormReposicion.value.bodcodigo,
            this.FormReposicion.value.tiporegistro,
            this.datePipe.transform(this.FormReposicion.value.fechadesde, 'yyyy-MM-dd'),
            this.datePipe.transform(this.FormReposicion.value.fechahasta, 'yyyy-MM-dd'),
            this.usuario,
            this.servidor,
            this.FormReposicion.value.tiporeposicion,
            codProdAux,
            bodegaSuministro.bodcodigo,
            bodegaSuministro.bodtipobodega,
          ).subscribe(
            response => {
              if (response != null) {
                this.detallearticulosreposicion = response;
                if (this.detallearticulosreposicion.length > 0) {
                  this.FormReposicion.get('chequeatodo').setValue(true);
                  this.detallearticulosreposicion.forEach(element => {
                    this.detallearticulosreposicion[indice].marca = "S";
                    this.detallearticulosreposicion[indice].meinid = element.codmeinid;
                    indice++;
                  });
                  this.detallearticulosreposicionpaginacion = this.detallearticulosreposicion.slice(0, 20);
                  this.ActivaBotonBuscaGrilla = true;
                  this.ActivaBotonLimpiaBusca = true;
                } else {
                  this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.encuentra.registro.para.procesar'); //mensaje a mostrar
                  this.alertSwalAlert.show();// para que aparezca
                }
              }
              this.loading = false;
              this.focusField.nativeElement.focus();
            },
            error => {
              this.loading = false;
              alert(this.TranslateUtil('key.mensaje.error.buscar.registros'));
              console.log(error);
            }
          );
      } else {
        if (this.FormReposicion.value.tiporeposicion === 2) {
          let bodega : number = this.FormReposicion.controls.bodcodigo.value;
          this._BodegasService.BuscaPlantillas(this.servidor, sessionStorage.getItem('Usuario'),
            this.hdgcodigo, this.esacodigo, this.cmecodigo, this.Plantilla.planid, '', '', '', bodega, bodega, '',
            '', 1, codProdAux).subscribe(response_plantilla => {
              if (response_plantilla.length == 0) {

              } else {
                this.loading = true;
                if (response_plantilla.length > 0) {
                  this.Plantilla = response_plantilla[0];
                  this.FormReposicion.get('bodcodigo').setValue(this.Plantilla.bodorigen);

                  this.BuscaBodegasSuministro(this.Plantilla.bodorigen);

                  this.detallearticulosreposicionpaginacion = this.detallearticulosreposicion.slice(0, 20);
                  this.FormReposicion.get('codbodegasuministro').setValue(this.Plantilla.boddestino);
                  this.detalleplant = this.Plantilla.plantillasdet;

                  this.detalleplant.forEach(element => {
                    var temporal = new ReposicionArticulos;
                    temporal.codigomein = element.codmei;
                    temporal.meinid = element.meinid;
                    temporal.descripcionmein = element.meindescri;
                    temporal.fechamov = element.fechacreacion;
                    temporal.cantidadareponer = element.cantsoli;
                    temporal.marca = "S";

                    this.detallearticulosreposicion.unshift(temporal);
                    this.loading = false;
                  });

                  this.detallearticulosreposicionpaginacion = this.detallearticulosreposicion.slice(0, 20);

                  this.ActivaBotonBuscaGrilla = true;
                  this.ActivaBotonLimpiaBusca = true;
                }

              }
              this.loading = false;
            });
        }
      }
      this.ActivaBotonBuscaGrilla = true;
      this.ActivaBotonLimpiaBusca = true;
      this.loading = false;
      return;

    } else {
      this.limpiarCodigo();
      this.loading = false;
      return;
    }
  }

  limpiarCodigo() {
    this.loading = true;

    // console.log("auxs",this.detallearticulosreposicionpaginacion_aux,this.detallearticulosreposicion_aux)
    this.FormDatosProducto.controls.codigo.reset();
    var codProdAux = '';

    this.detallearticulosreposicion = [];
    this.detallearticulosreposicionpaginacion = [];


    // Llenar Array Auxiliares
    this.detallearticulosreposicion = this.detallearticulosreposicion_aux;
    this.detallearticulosreposicionpaginacion = this.detallearticulosreposicionpaginacion_aux;
    this.ActivaBotonLimpiaBusca = false;

    this.loading = false;
  }
  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
