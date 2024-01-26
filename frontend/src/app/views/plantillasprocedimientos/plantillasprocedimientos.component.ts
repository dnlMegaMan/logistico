import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BodegasService } from '../../servicios/bodegas.service';
import { BodegasTodas } from 'src/app/models/entity/BodegasTodas';
import { BodegasrelacionadaAccion } from 'src/app/models/entity/BodegasRelacionadas';
import { environment } from '../../../environments/environment';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { DatePipe } from '@angular/common';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Router, ActivatedRoute } from '@angular/router';

import { Articulos } from 'src/app/models/entity/mantencionarticulos';
import { Plantillas } from 'src/app/models/entity/PlantillasBodegas';
import { DetallePlantillaBodega } from 'src/app/models/entity/DetallePlantillaBodega';
import { Servicio } from 'src/app/models/entity/Servicio';

import { BusquedaproductosComponent } from '../busquedaproductos/busquedaproductos.component';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { BusquedaplantillasbodegaComponent } from '../busquedaplantillasbodega/busquedaplantillasbodega.component'

import { EstructuraunidadesService } from 'src/app/servicios/estructuraunidades.service';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { SolicitudService } from '../../servicios/Solicitudes.service';
import { InformesService } from '../../servicios/informes.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-plantillasprocedimientos',
  templateUrl: './plantillasprocedimientos.component.html',
  styleUrls: ['./plantillasprocedimientos.component.css'],
  providers: [InformesService]
})
export class PlantillasprocedimientosComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('cantidad', { static: false }) cantidad: ElementRef;
  @ViewChild('codigo', { static: false }) focusField: ElementRef;

  public modelopermisos       : Permisosusuario = new Permisosusuario();
  public FormPlantillaSolicitudBodega: FormGroup;
  public FormDatosProducto    : FormGroup;
  public bodegasSolicitantes  : Array<BodegasTodas> = [];
  public bodegassuministro    : Array<BodegasrelacionadaAccion> = [];
  public hdgcodigo            : number;
  public esacodigo            : number;
  public cmecodigo            : number;
  public usuario              = environment.privilegios.usuario;
  public servidor             = environment.URLServiciosRest.ambiente;
  private _BSModalRef         : BsModalRef;
  public detalleplantilla     : Array<DetallePlantillaBodega> = [];
  public detalleplantillapaginacion: Array<DetallePlantillaBodega> = [];
  public detalleplantillaaux  : Array<DetallePlantillaBodega> = [];
  public detalleplantilla_2   : Array<DetallePlantillaBodega> = [];
  public detalleplantillapaginacionaux: Array<DetallePlantillaBodega> = [];
  public _Plantilla           : Plantillas;
  public _Plantillaaux        : Plantillas;
  public bsConfig             : Partial<BsDatepickerConfig>
  public grabadetalleplantilla: DetallePlantillaBodega[] = [];
  public _PageChangedEvent    : PageChangedEvent;
  onClose                     : any;
  bsModalRef                  : any;
  editField                   : any;
  public productoselec        : Articulos;
  public arregloservicios     : Servicio[] = [];
  public tipoplantilla        : boolean = true;
  public activabtncreaplant   : boolean = false;
  public plantilla            : number = 0;
  public titulo               : string;
  public activabtnagregar     : boolean = false;
  public loading              = false;
  public codprod              = null;
  public desactivabtnelim     : boolean  = false;
  public btnLimpiar           : boolean = false;

  public ActivaBotonBuscaGrilla   : boolean = false;
  public ActivaBotonLimpiaBusca   : boolean = false;
  public descripcionaux           : string = null;
  public estadoaux                : string = null;
  public bodcodigoaux             : number = null;
  public bodcodigoentregaaux      : number = null;
  public numplantillaaux          : number = null;
  public serviciocodaux           : string = null;
  public BuscaBodegasSuministroaux: number = null;
  public fechacreacionaux         : string = null;
  public valor_tipo_plantilla     : number = 0;
  public lengthproductos          : number;
  public BodegaMedicamentos       : number = 0;
  public BodegaInsumos            : number = 0;
  public BodegaControlados        : number = 0;
  public BodegaConsignacion       : number = 0;
  public activabtnimprime         : boolean = false;

  /**Usado para la funcion logicavacios()//@ML */
  public verificanull         = false;
  public vacios               = true;
  public msj                  = false;
  public msjColCant           = false;
  public msjColElim           = false;
  public varColCant           = 0;
  public varColElim           = 0;
  public vacioscabecera       = true;
  public verificamodificanull = false;
  public descprod = null;

  // Arreglo para eliminar articulo de la grilla
  public listaDetalleEliminado: Array<DetallePlantillaBodega> = [];

  // Paginacion
  page : number;

  constructor(
    private formBuilder     : FormBuilder,
    public _BodegasService  : BodegasService,
    public _BsModalService  : BsModalService,
    public datePipe         : DatePipe,
    private _bodegasService : BodegasService,
    private route           : ActivatedRoute,
    private _unidadesService: EstructuraunidadesService,
    private router          : Router,
    public _BusquedaproductosService: BusquedaproductosService,
    public _solicitudService: SolicitudService,
    private _imprimesolicitudService: InformesService,
    public translate: TranslateService
  ) {

    this.FormPlantillaSolicitudBodega = this.formBuilder.group({
      numplantilla    : [{ value: null, disabled: true }, Validators.required],
      descripcion     : [{ value: null, disabled: false }, Validators.required],
      fechacreacion   : [new Date(), Validators.required],
      bodcodigo       : [{ value: null, disabled: false }, Validators.required],
      bodcodigoentrega: [{ value: null, disabled: false }, Validators.required],
      estado          : [{ value: null, disabled: false }, Validators.required],
      serviciocod     : [{ value: null, disabled: false }, Validators.required],
      numplantilla2   : [{ value: null, disabled: false }, Validators.required],
      descripcion2    : [{ value: null, disabled: false }, Validators.required],
    });

    // this.FormDatosProducto = this.formBuilder.group({
    //   codigo  : [{ value: '', disabled: false }, Validators.required],
    //   cantidad: [{ value: null, disabled: false }, Validators.required]
    // });
  }

  ngOnInit() {
    this.FormDatosProducto = this.formBuilder.group({
      codigo  : [{ value: '', disabled: false }, Validators.required],
      descproducto : [{ value: '', disabled: false }, Validators.required],
      cantidad: [{ value: null, disabled: false }, Validators.required]
    });
    this.FormPlantillaSolicitudBodega.get('estado').setValue("S");
    this.estadoaux = 'S';
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.BuscaBodegaSolicitante();
    this.SeleccionaPantallaPlantilla()
    // this.route.paramMap.subscribe(param => {
    //   if (param.has("in_tipo")) {
    //     this.SeleccionaPantallaPlantilla(parseInt(param.get("in_tipo"), 10));
    //   }
    // })

    this._unidadesService.BuscarServicios(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor, 0, '').subscribe(
      response => {
        if (response != null) {
          this.arregloservicios = response;
        }
      }
    );
  }

  SeleccionaPantallaPlantilla() {
    this.FormPlantillaSolicitudBodega.reset();
    this.detalleplantillapaginacion = [];
    this.detalleplantilla = [];
    this._Plantilla = new Plantillas();
    this.detalleplantillapaginacionaux = [];
    this.detalleplantillaaux = [];
    this._Plantillaaux = new Plantillas();
    this.FormPlantillaSolicitudBodega.get('fechacreacion').setValue(new Date());
    this.activabtncreaplant = false;
    this.FormPlantillaSolicitudBodega.get('estado').setValue("S");
    this.activabtnagregar = false;
    this.codprod = null;
    this.ActivarBotonModificar();
    this.FormDatosProducto.controls.codigo.setValue('');
    this.btnLimpiar = false;
    // if (id_tipo == 1) {
    //   this.tipoplantilla = true;
    //   this.titulo = "Bodegas"
    //   this.plantilla = 1
    //   this.activabtnagregar = false;
    // } else {
    //   if (id_tipo == 2) {
    //     this.tipoplantilla = false;
    //     this.titulo = "Procedimientos"
    //     this.plantilla = 2;
    //     this.activabtnagregar = false;
    //   }
    // }
  }

  BuscarPlantillas(tipoplantilla: boolean) {
    this.valor_tipo_plantilla = 0;

    this._BSModalRef = this._BsModalService.show(BusquedaplantillasbodegaComponent, this.setModalBusquedaPlantilla());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (!response) {
        return;
      }

      // if (tipoplantilla == false) {
      //   this.valor_tipo_plantilla = 2;
      // } else {
      //   this.valor_tipo_plantilla = 1;
      // }

      this.loading = true;
      this._BodegasService
        .BuscaPlantillas(
          this.servidor, sessionStorage.getItem('Usuario'), this.hdgcodigo, this.esacodigo, 
          this.cmecodigo, response.planid, '', '', '', 0, 0, '', '', 2, '',
        )
        .subscribe(
          (response_plantilla) => {
            if (!response_plantilla || response_plantilla.length === 0) {
              this.loading = false;

              this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.encontro.planilla')+` ${response.planid}`;
              this.alertSwalAlert.show();
              return;
            }

            this.FormDatosProducto.reset();
            console.log('plantilla selec', response_plantilla);
            this._Plantilla = response_plantilla[0];
            this.activabtnagregar = true;
            this.activabtncreaplant = false;
            this.activabtnimprime = true;
            // if (this.valor_tipo_plantilla == 2) {

            //   this.tipoplantilla = false;
            //   this.activabtnagregar = true;
            //   this.activabtncreaplant = false;
            // } else {
            //   if (this.valor_tipo_plantilla == 1) {
            //     this.tipoplantilla = true;
            //     this.activabtnagregar = true;
            //     this.activabtncreaplant = false;
            //   }

            // }
            if (this._Plantilla.planvigente == 'N') {
              this.activabtnagregar = false;
            }

            this.BuscaBodegasSuministro(this._Plantilla.bodorigen);
            this.FormPlantillaSolicitudBodega.patchValue({
              descripcion: this._Plantilla.plandescrip,
              numplantilla: this._Plantilla.planid,
              serviciocod: this._Plantilla.serviciocod,
              estado: this._Plantilla.planvigente,
              bodcodigo: this._Plantilla.bodorigen,
              bodcodigoentrega: this._Plantilla.boddestino,
              fechacreacion: this.datePipe.transform(this._Plantilla.fechacreacion, 'dd-MM-yyyy'),
            });

            // this.FormPlantillaSolicitudBodega.controls.descripcion.disable();
            // this.FormPlantillaSolicitudBodega.controls.bodcodigo.disable();
            // this.FormPlantillaSolicitudBodega.controls.bodcodigoentrega.disable();
            this.detalleplantillapaginacion = [];
            this.detalleplantilla = [];

            // this._Plantilla.plantillasdet.forEach(ele=>{
            //   this.detalleplantilla.unshift(ele)
            // })
            if (this._Plantilla.plantillasdet != null) {
              this.detalleplantilla = this._Plantilla.plantillasdet;
              this.lengthproductos = this.detalleplantilla.length;
              console.log('lengthproducto;:::', this.lengthproductos);
              this.detalleplantilla.forEach((x) => {
                x.bloqcampogrilla = true;
                x.cantsoliresp = x.cantsoli;
              });
              this.detalleplantillapaginacion = this.detalleplantilla;

              this._Plantillaaux = new Plantillas();
              this.detalleplantillapaginacionaux = [];
              this.detalleplantillaaux = [];
              // Set variables Auxiliares, para validación al limpiar y salir sin guardar.
              this.descripcionaux = this._Plantilla.plandescrip;
              this.numplantillaaux = this._Plantilla.planid;
              this.serviciocodaux = this._Plantilla.serviciocod;
              this.estadoaux = this._Plantilla.planvigente;
              this.bodcodigoaux = this._Plantilla.bodorigen;
              this.BuscaBodegasSuministroaux = this._Plantilla.bodorigen;
              this.bodcodigoentregaaux = this._Plantilla.boddestino;
              this.fechacreacionaux = this.datePipe.transform(this._Plantilla.fechacreacion, 'dd-MM-yyyy');

              this._Plantillaaux.plandescrip = this._Plantilla.plandescrip;
              this._Plantillaaux.planid = this._Plantilla.planid;
              this._Plantillaaux.serviciocod = this._Plantilla.serviciocod;
              this._Plantillaaux.planvigente = this._Plantilla.planvigente;
              this._Plantillaaux.bodorigen = this._Plantilla.bodorigen;
              this._Plantillaaux.boddestino = this._Plantilla.boddestino;
              this._Plantillaaux.fechacreacion = this._Plantilla.fechacreacion;

              this.detalleplantillapaginacionaux = this.detalleplantillapaginacion;
              this.detalleplantillaaux = this.detalleplantilla;
              this.btnLimpiar = true;
              this.ActivaBotonBuscaGrilla = true;
              // this.logicaVacios();
            } else {
              this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.plantilla.sin.detalle.vigente');
              this.alertSwalAlert.show();
            }

            this.loading = false;
          },
          (error) => {
            this.loading = false;

            console.error('[ERROR AL BUSCAR PLANTILLA]: ', error);

            this.alertSwalError.text = this.TranslateUtil('key.mensaje.error.buscar.plantilla');
            this.alertSwalError.show();
          },
        );
    });
  }

  setModalBusquedaPlantilla() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo        : this.TranslateUtil('key.title.busqueda.plantilla'), // Parametro para de la otra pantalla
        hdgcodigo     : this.hdgcodigo,
        esacodigo     : this.esacodigo,
        cmecodigo     : this.cmecodigo,
        tipoplantilla : false,
        descripcion   : this.FormPlantillaSolicitudBodega.get('descripcion').value,
        codservicio   : this.FormPlantillaSolicitudBodega.get('serviciocod').value,
        codsolicitante: this.FormPlantillaSolicitudBodega.get('bodcodigo').value,
        codsuministro : this.FormPlantillaSolicitudBodega.get('bodcodigoentrega').value,
        vigencia      : this.FormPlantillaSolicitudBodega.get('estado').value
      }
    };
    return dtModal;
  }

  SeleccionaBodegaServicio() {
    this.activabtnagregar = true;
    this.BuscaDatosBodega();
  }

  getProducto() {
    this.codprod = this.FormDatosProducto.controls.codigo.value; //=== null ? '' :
    //this.FormDatosProducto.controls.codigo.value;
    if (this.codprod != null) {
      this.codprod = this.codprod.trim();
    }
    this.loading = true;
    this.descprod = this.FormDatosProducto.controls.descproducto.value; //=== null ? '' :
    //this.FormDatosProducto.controls.descproducto.value;
    if (this.descprod != null) {
      this.descprod = this.descprod.trim();
    }
    if (this.codprod === null || this.codprod === '') {
      this.loading = false;
      this.addArticuloGrilla();
    } else {
      const tipodeproducto = 'MIM';
      const controlado = '';
      const controlminimo = '';
      const idBodega = this.BodegaMedicamentos;
      const consignacion = '';
      this._BusquedaproductosService.BuscarArticulosFiltros(this.hdgcodigo, this.esacodigo,
        this.cmecodigo, this.codprod, null, null, null, null, tipodeproducto, idBodega, controlminimo, controlado, consignacion
        , this.usuario, null, this.servidor).subscribe(
          response => {
            if (response != null) {
              if (response.length > 1) {
                  this.loading = false;
                  this.addArticuloGrilla();
              } else if (response.length === 1) {
                this.loading = false;

                const indx = this.detalleplantilla.findIndex(x => x.codmei === response[0].codigo, 1);
                if (indx >= 0) {
                  this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
                  this.alertSwalError.show();
                  this.FormDatosProducto.reset();
                  // this.codexiste = true;
                }else{
                  this.productoselec = response[0];
                  if (this._Plantilla.planid > 0) {
                    this.activabtncreaplant = false;
                  } else {
                    if (this._Plantilla.planid === 0 || this._Plantilla.planid === null) {
                      this.activabtncreaplant = true;
                    }
                  }
                  const DetallePantilla = new DetallePlantillaBodega;
                  DetallePantilla.codmei = this.productoselec.codigo;
                  DetallePantilla.meindescri = this.productoselec.descripcion;
                  DetallePantilla.meinid = this.productoselec.mein;
                  DetallePantilla.tiporegmein = this.productoselec.tiporegistro;
                  DetallePantilla.pldeid = 0;
                  DetallePantilla.acciond = "I";
                  DetallePantilla.cantsoli = 0;
                  DetallePantilla.usuariocreacion = this.usuario;
                  DetallePantilla.bloqcampogrilla = true;
                  if (this._Plantilla.planid > 0) {
                    DetallePantilla.planid = this._Plantilla.planid;
                  }
                  this.detalleplantilla.unshift(DetallePantilla);
                  this.detalleplantillapaginacion = this.detalleplantilla;
                  this.detalleplantillaaux = this.detalleplantilla;
                  this.detalleplantillapaginacionaux = this.detalleplantillapaginacion;
                  this.ActivaBotonBuscaGrilla= true;
                  this.FormDatosProducto.reset();
                  this.logicaVacios();
                  this.focusField.nativeElement.focus()
                }
              } else { return; }
            }
            this.loading = false;
          }, error => {
            this.loading = false;
          }
        );
    }
  }

  addArticuloGrilla() {
    this.alertSwalError.title = null;
    this._BSModalRef = this._BsModalService.show(BusquedaproductosComponent, this.setModalBusquedaProductos());
    this._BSModalRef.content.onClose.subscribe((response: any) => {
      if (response == undefined) { }
      else {
        const indx = this.detalleplantilla.findIndex(x => x.codmei === response.codigo, 1);
        if (indx >= 0) {
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.codigo.existe.grilla');
          this.alertSwalError.show();
          // this.codexiste = true;
        }else{

          this.productoselec = response;
          if (this._Plantilla.planid > 0) {
            this.activabtncreaplant = false;
          } else {
            if (this._Plantilla.planid == 0 || this._Plantilla.planid == null) {
              this.activabtncreaplant = true
            }
          }
          const DetallePantilla = new DetallePlantillaBodega;
          DetallePantilla.codmei = this.productoselec.codigo;
          DetallePantilla.meindescri = this.productoselec.descripcion;
          DetallePantilla.meinid = this.productoselec.mein;
          DetallePantilla.tiporegmein = this.productoselec.tiporegistro;
          DetallePantilla.pldeid = 0;
          DetallePantilla.acciond = "I";
          DetallePantilla.cantsoli = 0;
          DetallePantilla.usuariocreacion = this.usuario;
          DetallePantilla.bloqcampogrilla = true;
          if (this._Plantilla.planid > 0) {
            DetallePantilla.planid = this._Plantilla.planid;
          }
          this.detalleplantilla.unshift(DetallePantilla);
          this.detalleplantillapaginacion = this.detalleplantilla;

          this.detalleplantillaaux = this.detalleplantilla;
          this.detalleplantillapaginacionaux = this.detalleplantillapaginacion;
          this.ActivaBotonBuscaGrilla = true;
        }
        this.logicaVacios();
      }
    });
  }

  setModalBusquedaProductos() {
    this.codprod = this.FormDatosProducto.controls.codigo.value;
    this.descprod = this.FormDatosProducto.controls.descproducto.value;
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class   : 'modal-dialog-centered modal-xl',
      initialState: {
        titulo        : this.TranslateUtil('key.title.busqueda.productos'), // Parametro para de la otra pantalla
        hdgcodigo     : this.hdgcodigo,
        esacodigo     : this.esacodigo,
        cmecodigo     : this.cmecodigo,
        tipo_busqueda : 'Todo-Medico',
        id_Bodega     : this.BodegaMedicamentos,
        codprod       : this.codprod,
        descprod      : this.descprod
      }
    };
    return dtModal;
  }

  // async findArticuloGrilla() {
  //   this.loading = true;

  //   // console.log('this.FormDatosProducto.controls.codigo.value : ' , this.FormDatosProducto.controls.codigo);
  //   if ( this.FormDatosProducto.controls.codigo.touched &&
  //       this.FormDatosProducto.controls.codigo.status !== 'INVALID') {
  //       var codProdAux = this.FormDatosProducto.controls.codigo.value.toString();
  //     if(this.FormPlantillaSolicitudBodega.controls.numplantilla.value >0){

  //       this.detalleplantilla = [];
  //       this.detalleplantillapaginacion = [];

  //       // console.log(this.FormPlantillaSolicitudBodega.controls.numplantilla.value,
  //       //   this.hdgcodigo,this.esacodigo, this.cmecodigo, 0, "", "", 0, 0, 0, this.servidor, 0, 0,
  //       //   0, 0, 0, 0, "",0,codProdAux)
  //       // console.log("prod a buscar en la grilla",codProdAux,this.FormPlantillaSolicitudBodega.controls.numplantilla.value)

  //       this._BodegasService.BuscaPlantillas(this.servidor, sessionStorage.getItem('Usuario'), this.hdgcodigo, this.esacodigo,
  //       this.cmecodigo, this._Plantilla.planid, '', '', '', 0, 0, '', '', 2,codProdAux).subscribe(
  //         response_plantilla => {
  //           if (response_plantilla.length == 0) {
  //             this.loading = false;
  //           } else {

  //             this._Plantilla = response_plantilla[0];
  //             this.activabtncreaplant = false;
  //             if (this.valor_tipo_plantilla == 2) {

  //               this.tipoplantilla = false;
  //               this.activabtnagregar = true;
  //               this.activabtncreaplant = false;
  //             } else {
  //               if (this.valor_tipo_plantilla == 1) {
  //                 this.tipoplantilla = true;
  //                 this.activabtnagregar = true;
  //                 this.activabtncreaplant = false;
  //               }

  //             }
  //             if(this._Plantilla.planvigente== "N"){
  //               this.activabtnagregar = false;
  //             }
  //             this.FormPlantillaSolicitudBodega.get('descripcion').setValue(this._Plantilla.plandescrip);
  //             this.FormPlantillaSolicitudBodega.get('numplantilla').setValue(this._Plantilla.planid);
  //             this.FormPlantillaSolicitudBodega.get('serviciocod').setValue(this._Plantilla.serviciocod);
  //             this.FormPlantillaSolicitudBodega.get('estado').setValue(this._Plantilla.planvigente);
  //             this.FormPlantillaSolicitudBodega.get('bodcodigo').setValue(this._Plantilla.bodorigen);
  //             this.BuscaBodegasSuministro(this._Plantilla.bodorigen);
  //             this.FormPlantillaSolicitudBodega.get('bodcodigoentrega').setValue(this._Plantilla.boddestino);
  //             this.FormPlantillaSolicitudBodega.get('fechacreacion').setValue(this.datePipe.transform(this._Plantilla.fechacreacion, 'dd-MM-yyyy'));

  //             this.detalleplantillapaginacion = [];
  //             this.detalleplantilla = [];


  //             this.detalleplantilla = this._Plantilla.plantillasdet;
  //             this.detalleplantilla.forEach(x=>{
  //               x.bloqcampogrilla = true;
  //               x.cantsoliresp = x.cantsoli;
  //             })
  //             this.detalleplantillapaginacion = this.detalleplantilla;

  //             this._Plantillaaux = new Plantillas;
  //             // this.detalleplantillapaginacionaux = [];
  //             // this.detalleplantillaaux = [];
  //             // Set variables Auxiliares, para validación al limpiar y salir sin guardar.
  //             this.descripcionaux = this._Plantilla.plandescrip;
  //             this.numplantillaaux = this._Plantilla.planid;
  //             this.serviciocodaux = this._Plantilla.serviciocod;
  //             this.estadoaux = this._Plantilla.planvigente;
  //             this.bodcodigoaux = this._Plantilla.bodorigen;
  //             this.BuscaBodegasSuministroaux = this._Plantilla.bodorigen;
  //             this.bodcodigoentregaaux = this._Plantilla.boddestino;
  //             this.fechacreacionaux = this.datePipe.transform(this._Plantilla.fechacreacion, 'dd-MM-yyyy');

  //             this._Plantillaaux.plandescrip = this._Plantilla.plandescrip;
  //             this._Plantillaaux.planid = this._Plantilla.planid;
  //             this._Plantillaaux.serviciocod = this._Plantilla.serviciocod;
  //             this._Plantillaaux.planvigente = this._Plantilla.planvigente;
  //             this._Plantillaaux.bodorigen = this._Plantilla.bodorigen;
  //             this._Plantillaaux.boddestino = this._Plantilla.boddestino;
  //             this._Plantillaaux.fechacreacion = this._Plantilla.fechacreacion;


  //             this.btnLimpiar = true;
  //             this.ActivaBotonBuscaGrilla = true;
  //             this.loading = false;
  //             this.focusField.nativeElement.focus();

  //           }
  //         }
  //       );

  //       this.ActivaBotonBuscaGrilla = true;
  //       this.ActivaBotonLimpiaBusca = true;
  //       this.loading = false;
  //       return;
  //     }else{ //Cuando la plantilla aún no se crea
  //       this.detalleplantilla_2 = [];
  //       if(this.FormPlantillaSolicitudBodega.controls.numplantilla.value === null){


  //         this._solicitudService.BuscarProductoPorLike(this.hdgcodigo, this.esacodigo,
  //           this.cmecodigo,codProdAux,3,this.usuario,this.servidor,
  //           null,null, this.detalleplantilla,null,null).subscribe(response => {

  //             this.detalleplantilla_2=response;


  //             this.detalleplantilla = [];
  //             this.detalleplantillapaginacion = [];

  //             this.detalleplantilla = this.detalleplantilla_2;
  //             this.detalleplantillapaginacion = this.detalleplantilla;
  //             this.ActivaBotonLimpiaBusca = true;
  //             this.loading = false;

  //           }
  //         )
  //       }this.loading = false;
  //     }
  //   }else{
  //     this.limpiarCodigo();
  //     this.loading = false;
  //     return;
  //   }
  // }

  limpiarCodigo() {
    this.loading = true;

    // console.log("auxs",this.detalleplantillapaginacionaux,this.detalleplantillaaux)
    this.FormDatosProducto.controls.codigo.reset();
    var codProdAux = '';

    this.detalleplantilla = [];
    this.detalleplantillapaginacion = [];


    // Llenar Array Auxiliares
    this.detalleplantilla = this.detalleplantillaaux;
    this.detalleplantillapaginacion = this.detalleplantillapaginacionaux;
    this.ActivaBotonLimpiaBusca = false;

    this.loading = false;
  }

  async CambioCheck(registro: DetallePlantillaBodega,id:number,event:any,marcacheckgrilla: boolean){
    if(event.target.checked){
      this.listaDetalleEliminado.unshift(registro);
     }else{
      var i = this.listaDetalleEliminado.indexOf( registro );
      if ( i !== -1 ) {
        this.listaDetalleEliminado.splice( i, 1 );
      }
    }

    // // console.log("Selecciona el check",id,event,marcacheckgrilla,registro)
    // if(event.target.checked){
    //   this.varColElim = this.varColElim +1;
    //   registro.marcacheckgrilla = true;
    //   this.desactivabtnelim = true;
    //   await this.isEliminaGrilla(registro)
    //   await this.detalleplantilla.forEach(d=>{
    //     if(d.marcacheckgrilla === true){
    //       this.desactivabtnelim = true;
    //       // console.log("recorre la grilla para ver si hay check",d.marcacheckgrilla,this.desactivabtnelim)
    //     }
    //   })
    // }else{
    //   this.varColElim = this.varColElim -1;
    //   registro.marcacheckgrilla = false;
    //   this.desactivabtnelim = false;
    //   await this.isEliminaGrilla(registro);
    //   await this.detalleplantilla.forEach(d=>{
    //     if(d.marcacheckgrilla === true){
    //       this.desactivabtnelim = true;
    //       // console.log("recorre la grilla para ver si NO hay check",d.marcacheckgrilla,this.desactivabtnelim)
    //     }
    //   })
    // }
    // if(this.varColElim > 0){
    //   this.msjColElim = true;
    // } else {
    //   this.msjColElim = false;
    // }
    // // console.log("chec modificado",registro)
  }

  isEliminaGrilla(registro: DetallePlantillaBodega) {
    // console.log("entra a iseeliminagrilla",registro)
    let indice = 0;
    for (const articulo of this.detalleplantilla) {
      if (registro.codmei === articulo.codmei && registro.pldeid === articulo.pldeid) {
        articulo.marcacheckgrilla = registro.marcacheckgrilla;

        return indice;
      }
      indice++;
    }
    return -1;
  }

  ConfirmaEliminaProductoDeLaGrilla2() {

    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.confirmar.eliminacion.producto.plantilla'),
      text: this.TranslateUtil('key.mensaje.confirmar.eliminacion.producto'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.EliminaProductoDeLaGrilla2();
      }
    })
  }

  EliminaProductoDeLaGrilla2() {
    if(this.listaDetalleEliminado.length){
      for (const element of this.listaDetalleEliminado) {
        var i = this.detalleplantilla.indexOf( element );
        if ( i !== -1 ) {
          if (element.pldeid > 0) {
            this.detalleplantilla[i].acciond = 'E';
            this.ModificarPlantilla("M");
          } else {
            this.detalleplantilla.splice( i, 1 );
            this.detalleplantillapaginacion = this.detalleplantilla;
            this.alertSwal.title = this.TranslateUtil('key.mensaje.producto.eliminado.plantilla');
            this.alertSwal.show();
            this.logicaVacios();
          }
        }
      }
    }

    // this.detalleplantillapaginacion.forEach(registro=>{
    //   if (registro.acciond == "I" && registro.pldeid == 0) {
    //     if(registro.marcacheckgrilla ===true){
    //       // Eliminar registro nuevo la grilla
    //       this.desactivabtnelim = false;
    //       this.detalleplantilla.splice(this.isEliminaMed(registro), 1);
    //       this.detalleplantillapaginacion = this.detalleplantilla;

    //       this.alertSwal.title = "Producto Eliminado de la Plantilla";//.concat(response['solbodid']);
    //       this.alertSwal.show();
    //     }
    //   } else {
    //     if(registro.marcacheckgrilla == true){
    //       // elimina uno que ya existe

    //       this.detalleplantilla[this.isEliminaMed(registro)].acciond = 'E';
    //       this.ModificarPlantilla("M");
    //     }
    //   }

    // })

    // this.logicaVacios();
  }

  isEliminaMed(registro: DetallePlantillaBodega) {

    let indice = 0;
    for (const articulo of this.detalleplantilla) {
      if (registro.codmei === articulo.codmei) {
        // console.log("registro,codmei",articulo,indice)
        return indice;
      }
      indice++;
    }
    return -1;
  }

  ConfirmaGenerarPlantilla() {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.generar.plantilla'),
      text: this.TranslateUtil('key.mensaje.confirmar.creacion.plantilla'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.generarPlantilla();
      }
    })
  }

  generarPlantilla() {
    this.grabadetalleplantilla = [];
    this.alertSwalAlert.text = null;
    this.alertSwalAlert.title = null;
    // var es_validacioncantidad = this.detalleplantilla.find(element => element.cantsoli != 0)
    // console.log("validacantidad",es_validacioncantidad)
    // if(es_validacioncantidad == undefined ){

    //   this.alertSwalAlert.title = "La cantidad solicitada debe ser mayor a 0";
    //   this.alertSwalAlert.show();
    // }else{
    //   if(es_validacioncantidad != undefined){

        var fechaactual = this.datePipe.transform(this.FormPlantillaSolicitudBodega.value.fechacreacion, 'yyyy-MM-dd');
        this.detalleplantilla.forEach(element => {

          var temporal = new DetallePlantillaBodega();
          temporal.planid = 0;
          temporal.pldeid = 0;
          temporal.cantsoli = element.cantsoli;
          temporal.codmei = element.codmei;
          temporal.meindescri = element.meindescri;
          temporal.meinid = element.meinid;
          temporal.pldevigente = null;
          temporal.usuariocreacion = this.usuario;
          temporal.fechacreacion = fechaactual;
          temporal.fechamodifica = null;
          temporal.usuariomodifica = null;
          temporal.fechaelimina = null;
          temporal.usuarioelimina = null;
          temporal.acciond = 'I';

          this.grabadetalleplantilla.unshift(temporal);
        })

        this._Plantilla = new Plantillas();
        this._Plantilla.planid = 0;
        this._Plantilla.hdgcodigo = this.hdgcodigo;
        this._Plantilla.esacodigo = this.esacodigo;
        this._Plantilla.cmecodigo = this.cmecodigo;
        console.log("tipoplantillas",this.tipoplantilla)
        if (this.tipoplantilla == false) {
          this._Plantilla.serviciocod = this.FormPlantillaSolicitudBodega.value.serviciocod;
          this._Plantilla.bodorigen = 0;
          this._Plantilla.boddestino = 0;
          this._Plantilla.plantipo = 2 //Acá se ingresa 1 o 2 según sea la pantalla de bod o serv
        } else {
          if (this.tipoplantilla == true) {

            this._Plantilla.bodorigen = this.FormPlantillaSolicitudBodega.value.bodcodigo;
            this._Plantilla.boddestino = this.FormPlantillaSolicitudBodega.value.bodcodigoentrega;
            this._Plantilla.serviciocod = null;
            this._Plantilla.plantipo = 1 //Acá se ingresa 1 o 2 según sea la pantalla de bod o serv
          }

        }
        this._Plantilla.plantipo = 2
        this._Plantilla.serviciocod = this.FormPlantillaSolicitudBodega.value.serviciocod;
        this._Plantilla.plandescrip = this.FormPlantillaSolicitudBodega.value.descripcion;
        this._Plantilla.planvigente = this.FormPlantillaSolicitudBodega.value.estado;
        this._Plantilla.usuariocreacion = this.usuario;
        this._Plantilla.fechacreacion = fechaactual;
        this._Plantilla.fechamodifica = null;
        this._Plantilla.usuariomodifica = null;
        this._Plantilla.fechaelimina = null;
        this._Plantilla.usuarioelimina = null;
        this._Plantilla.servidor = this.servidor;
        this._Plantilla.accion = 'I';

        this._Plantilla.plantillasdet = this.grabadetalleplantilla;

        var numplant
        this._bodegasService.crearPlantilla(this._Plantilla).subscribe(
          response => {
            numplant = response.plantillaid;
            this.FormPlantillaSolicitudBodega.get('numplantilla').setValue(response['plantillaid']);
            this.alertSwal.title = "Plantilla creada N°:".concat(response['plantillaid']);
            this.alertSwal.show();
            this._bodegasService.BuscaPlantillas(this.servidor, this.usuario, this.hdgcodigo, this.esacodigo,
              this.cmecodigo, numplant, null, null, null, null, null, null, null, this._Plantilla.plantipo,"").subscribe(
                response => {
                  this._Plantilla = response[0];
                  if (this._Plantilla.plantipo == 2) {
                    this.tipoplantilla = false;
                    this.activabtncreaplant = false;
                  } else {
                    if (this._Plantilla.plantipo == 1) {
                      this.tipoplantilla = true;
                      this.activabtncreaplant = false;
                    }
                  }
                  this.FormPlantillaSolicitudBodega.get('numplantilla').setValue(this._Plantilla.planid);
                  this.FormPlantillaSolicitudBodega.get('estado').setValue(this._Plantilla.planvigente);
                  this.FormPlantillaSolicitudBodega.get('bodcodigo').setValue(this._Plantilla.bodorigen);
                  this.FormPlantillaSolicitudBodega.get('descripcion').setValue(this._Plantilla.plandescrip);
                  this.FormPlantillaSolicitudBodega.get('bodcodigoentrega').setValue(this._Plantilla.boddestino);
                  this.FormPlantillaSolicitudBodega.get('fechacreacion').setValue(this.datePipe.transform(this._Plantilla.fechacreacion, 'dd-MM-yyyy'));
                  this.FormPlantillaSolicitudBodega.get('serviciocod').setValue(this._Plantilla.serviciocod);
                  this.activabtnimprime = true;

                  this.detalleplantillapaginacion = [];
                  this.detalleplantilla = [];
                  this.detalleplantillapaginacionaux = [];
                  this.detalleplantillaaux = [];

                  this.detalleplantilla = this._Plantilla.plantillasdet;
                  this.lengthproductos = this.detalleplantilla.length;
                  this.detalleplantillapaginacion = this.detalleplantilla;
                  console.log("detalleplantilla : ",this.detalleplantilla);
                  this.detalleplantillapaginacionaux = this.detalleplantillapaginacion;
                  this.detalleplantillaaux = this.detalleplantilla ;
                  this.verificanull = false;
                  this.verificamodificanull = false;
                  // this.logicaVacios();
                }),
              error => {
              }
          },
          error => {
          }
        );
        // },
        // error => {
        //   this.alertSwalError.title = "Error al generar plantilla";
        //   this.alertSwalError.show();
        // }
        // );
    //   }
    // }
  }

  ConfirmaModificarPlantilla() {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.modificar.plantilla'),
      text: this.TranslateUtil('key.mensaje.confirmar.modificar.plantilla'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.ModificarPlantilla("M");
      }
    })
  }

  ModificarPlantilla(Accion: string) {
    if (this.checkNegativo()) {
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.debe.ingresar.cantidad.negativa');
      this.alertSwalAlert.show();
      return;
    } else {
      var fechaactual = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

      // if (this.tipoplantilla == true) {

      //   this._Plantilla.serviciocod = null;
      //   this._Plantilla.bodorigen = this.FormPlantillaSolicitudBodega.value.bodcodigo;
      //   this._Plantilla.boddestino = this.FormPlantillaSolicitudBodega.value.bodcodigoentrega;
      //   this._Plantilla.plantipo = 1;
      // } else {
      //   if (this.tipoplantilla == false){

          this._Plantilla.serviciocod = this.FormPlantillaSolicitudBodega.value.serviciocod;
          this._Plantilla.bodorigen = 0;
          this._Plantilla.boddestino = 0;
          this._Plantilla.plantipo = 2;
      //   }
      // }

      this._Plantilla.plandescrip = this.FormPlantillaSolicitudBodega.value.descripcion;
      this._Plantilla.planvigente = this.FormPlantillaSolicitudBodega.value.estado;
      this._Plantilla.fechamodifica = fechaactual;
      this._Plantilla.usuariomodifica = this.usuario;
      if (Accion == "E") {
        this._Plantilla.fechaelimina = fechaactual;
        this._Plantilla.usuarioelimina = this.usuario;
        this._Plantilla.fechamodifica = null;
        this._Plantilla.usuariomodifica = null;
        this._Plantilla.accion = "E";
      }
      if (Accion == "M") {
        this._Plantilla.accion = "M";
        this._Plantilla.fechamodifica = fechaactual;
        this._Plantilla.usuariomodifica = this.usuario;
        this._Plantilla.fechaelimina = null;
        this._Plantilla.usuarioelimina = null;
      }
      this._Plantilla.servidor = this.servidor;
      /* Detalle de solicitu, solo viaja la modificada y eliminada */
      this.grabadetalleplantilla = [];

      this.detalleplantilla.forEach(element => {
        var _detallePlantilla = new DetallePlantillaBodega;
        _detallePlantilla = element;

        if (element.acciond == 'M') {
          _detallePlantilla.codmei = element.codmei;
          _detallePlantilla.meinid = element.meinid;
          _detallePlantilla.cantsoli = element.cantsoli; //cantidad solicitada
          _detallePlantilla.fechamodifica = fechaactual;
          _detallePlantilla.usuariomodifica = this.usuario;
          _detallePlantilla.acciond = "M";
        }

        if (element.acciond == 'E') {
          _detallePlantilla.fechamodifica = null;
          _detallePlantilla.usuariomodifica = null;
          _detallePlantilla.fechaelimina = fechaactual;
          _detallePlantilla.usuarioelimina = this.usuario;
          _detallePlantilla.acciond = "E";
        }
        // if (Accion == 'E') {
        //   _detallePlantilla.fechamodifica = null;
        //   _detallePlantilla.usuariomodifica = null;
        //   _detallePlantilla.fechaelimina = fechaactual;
        //   _detallePlantilla.usuarioelimina = this.usuario;
        //   _detallePlantilla.acciond = "E";
        // }
        this.grabadetalleplantilla.unshift(_detallePlantilla);
      });

      this._Plantilla.plantillasdet = this.grabadetalleplantilla;

      var numplant;
      this._bodegasService.ModificaPlantilla(this._Plantilla).subscribe(
        response => {
          numplant = response.plantillaid;
          if (Accion == "M") {
            this.alertSwal.title = this.TranslateUtil('key.mensaje.plantilla.modificada');
            this.alertSwal.show();

            /* Recarga  */
            this._bodegasService.BuscaPlantillas(this.servidor, this.usuario, this.hdgcodigo, this.esacodigo,
              this.cmecodigo, numplant, null, null, null, null, null, null, null, 2,"").subscribe(
                response => {
                  this._Plantilla = response[0];

                  if (this._Plantilla.plantipo == 2) {
                    this.tipoplantilla = false;
                    this.activabtncreaplant = false;
                  } else {
                    if (this._Plantilla.plantipo == 1) {
                      this.tipoplantilla = true;
                      this.activabtncreaplant = false;
                    }
                  }
                  if(this._Plantilla.planvigente== "S"){
                    this.activabtnagregar = true;
                  }
                  this.FormPlantillaSolicitudBodega.get('numplantilla').setValue(this._Plantilla.planid);
                  this.FormPlantillaSolicitudBodega.get('bodcodigo').setValue(this._Plantilla.bodorigen);
                  this.FormPlantillaSolicitudBodega.get('descripcion').setValue(this._Plantilla.plandescrip);
                  this.FormPlantillaSolicitudBodega.get('estado').setValue(this._Plantilla.planvigente);
                  this.FormPlantillaSolicitudBodega.get('bodcodigoentrega').setValue(this._Plantilla.boddestino);
                  this.FormPlantillaSolicitudBodega.get('fechacreacion').setValue(this.datePipe.transform(this._Plantilla.fechacreacion, 'dd-MM-yyyy'));
                  this.activabtnimprime = true;

                  this.detalleplantillapaginacion = [];
                  this.detalleplantilla = [];
                  this.detalleplantillapaginacionaux = [];
                  this.detalleplantillaaux = [];

                  this.detalleplantilla = this._Plantilla.plantillasdet;
                  this.detalleplantilla.forEach(element => {
                    element.bloqcampogrilla = true;
                  });
                  this.lengthproductos = this.detalleplantilla.length;
                  this.detalleplantillapaginacion = this.detalleplantilla;
                  this.detalleplantillapaginacionaux = this.detalleplantillapaginacion;
                  this.detalleplantillaaux = this.detalleplantilla ;

                  // this.logicaVacios();
                },
                error => {
                });
            // this.FormPlantillaSolicitudBodega.get('numplantilla').setValue(this._Plantilla.planid);
            // this.FormPlantillaSolicitudBodega.get('bodcodigo').setValue(this._Plantilla.bodorigen);
            // this.FormPlantillaSolicitudBodega.get('descripcion').setValue(this._Plantilla.plandescrip);
            // this.FormPlantillaSolicitudBodega.get('estado').setValue(this._Plantilla.planvigente);
            // this.FormPlantillaSolicitudBodega.get('bodcodigoentrega').setValue(this._Plantilla.boddestino);
            // this.FormPlantillaSolicitudBodega.get('fechacreacion').setValue(this.datePipe.transform(this._Plantilla.fechacreacion, 'dd-MM-yyyy'));

            // this.detalleplantillapaginacion = [];
            // this.detalleplantilla = [];
            // this.detalleplantillapaginacionaux = [];
            // this.detalleplantillaaux = [];

            // this.detalleplantilla = this._Plantilla.plantillasdet;
            // this.detalleplantillapaginacion = this.detalleplantilla;
            // this.detalleplantillapaginacionaux = this.detalleplantillapaginacion;
            // this.detalleplantillaaux = this.detalleplantilla ;
            // },
            error => {
            }
            // );
          }
          if (Accion == "E") {
            this.alertSwal.title = this.TranslateUtil('key.mensaje.plantilla.eliminada');
            this.alertSwal.show();
            this._bodegasService.BuscaPlantillas(this.servidor, this.usuario, this.hdgcodigo, this.esacodigo,
              this.cmecodigo, numplant, null, null, null, null, null, null, null, this.plantilla,"").subscribe(
                data => {
                  this._Plantilla = data[0];
                  if (this._Plantilla.plantipo == 2) {
                    this.tipoplantilla = false;
                    this.activabtncreaplant = false;
                  } else {
                    if (this._Plantilla.plantipo == 1) {
                      this.tipoplantilla = true;
                      this.activabtncreaplant = false;
                    }
                  }
                  if(this._Plantilla.planvigente== "N"){
                    this.activabtnagregar = false;
                  }
                  this.FormPlantillaSolicitudBodega.get('numplantilla').setValue(this._Plantilla.planid);
                  this.FormPlantillaSolicitudBodega.get('bodcodigo').setValue(this._Plantilla.bodorigen);
                  this.FormPlantillaSolicitudBodega.get('descripcion').setValue(this._Plantilla.plandescrip);
                  this.FormPlantillaSolicitudBodega.get('estado').setValue(this._Plantilla.planvigente);
                  this.FormPlantillaSolicitudBodega.get('bodcodigoentrega').setValue(this._Plantilla.boddestino);
                  this.FormPlantillaSolicitudBodega.get('fechacreacion').setValue(this.datePipe.transform(this._Plantilla.fechacreacion, 'dd-MM-yyyy'));

                  this.detalleplantillapaginacion = [];
                  this.detalleplantilla = [];

                  this.detalleplantilla = this._Plantilla.plantillasdet;
                  this.detalleplantillapaginacion = this.detalleplantilla;
                  this.detalleplantillapaginacionaux = this.detalleplantillapaginacion;
                  this.detalleplantillaaux = this.detalleplantilla ;
                },
                error => {
                });
            this.FormPlantillaSolicitudBodega.get('numplantilla').setValue(this._Plantilla.planid);
            this.FormPlantillaSolicitudBodega.get('bodcodigo').setValue(this._Plantilla.bodorigen);
            this.FormPlantillaSolicitudBodega.get('descripcion').setValue(this._Plantilla.plandescrip);
            this.FormPlantillaSolicitudBodega.get('estado').setValue(this._Plantilla.planvigente);
            this.FormPlantillaSolicitudBodega.get('bodcodigoentrega').setValue(this._Plantilla.boddestino);
            this.FormPlantillaSolicitudBodega.get('fechacreacion').setValue(this.datePipe.transform(this._Plantilla.fechacreacion, 'dd-MM-yyyy'));

            this.detalleplantillapaginacion = [];
            this.detalleplantilla = [];

            this.detalleplantilla = this._Plantilla.plantillasdet;
            this.detalleplantillapaginacion = this.detalleplantilla;
            this.detalleplantillapaginacionaux = this.detalleplantillapaginacion;
            this.detalleplantillaaux = this.detalleplantilla ;

            // },
            error => {
            }

          }
          this.FormPlantillaSolicitudBodega.get('numplantilla').setValue(numplant);
        },
        error => {
          console.error('[ERROR AL MODIFICAR PLANTILLA PROCEDIMIENTOS]: ', error);
          
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.modificar.solicitud');
          this.alertSwalError.show();
        }
      );
    }
  }

  ConfirmaEliminarPlantilla() {
    // sE CONFIRMA Eliminar Solicitud
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.eliminar.plantilla'),
      text: this.TranslateUtil('key.mensaje.confirmar.eliminar.plantilla'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.ModificarPlantilla("E");
      }
    })
  }

  limpiar() {
    const Swal = require('sweetalert2');
    if(
      (this.numplantillaaux !== this.FormPlantillaSolicitudBodega.get('numplantilla').value ||
        this.serviciocodaux !== this.FormPlantillaSolicitudBodega.get('serviciocod').value ||
        this.fechacreacionaux !== this.FormPlantillaSolicitudBodega.get('fechacreacion').value ||
        this.descripcionaux !== this.FormPlantillaSolicitudBodega.get('descripcion').value ||
        this.estadoaux !== this.FormPlantillaSolicitudBodega.get('estado').value
        // this.bodcodigoaux !== this.FormPlantillaSolicitudBodega.get('bodcodigo').value ||
        // this.bodcodigoentregaaux !== this.FormPlantillaSolicitudBodega.get('bodcodigoentrega').value
        ) &&
      (this.numplantillaaux !== null ||
        this.serviciocodaux !== null ||
        this.fechacreacionaux !== null ||
        this.descripcionaux !== null ||
        this.bodcodigoaux !== null ||
        this.bodcodigoentregaaux !== null)) {
          this.msj = true;
    }

    if ((this.detalleplantillapaginacionaux !== this.detalleplantillapaginacion ||
      this.detalleplantillaaux !== this.detalleplantilla) &&
      (this.detalleplantillapaginacionaux.length !== 0 ||
        this.detalleplantillaaux.length !== 0)) {
        this.msj = true;
      console.log('2', this.detalleplantillapaginacionaux, '///', this.detalleplantillaaux);
      }
    if(this.msj || this.msjColElim || this.msjColCant){
      Swal.fire({
        title: this.TranslateUtil('key.button.limpiar.L'),
        text: this.TranslateUtil('key.mensaje.pregunta.seguro.desea.limpiar.sin.guardar'),
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.TranslateUtil('key.si')
      }).then((result) => {
        if (result.value) {
          this.FormPlantillaSolicitudBodega.reset();
          this.detalleplantillapaginacion = [];
          this.detalleplantilla = [];
          this._Plantilla = new Plantillas();
          this.detalleplantillapaginacionaux = [];
          this.detalleplantillaaux = [];
          this._Plantillaaux = new Plantillas();
          this.FormPlantillaSolicitudBodega.get('fechacreacion').setValue(new Date());
          this.activabtncreaplant = false;
          this.FormPlantillaSolicitudBodega.get('estado').setValue("S");
          this.activabtnagregar = false;
          this.codprod = null;
          this.ActivarBotonModificar();
          this.FormDatosProducto.controls.codigo.setValue('');
          this.btnLimpiar = false;
          this.ActivaBotonBuscaGrilla = false;
          this.verificanull = false;
          this.verificamodificanull = false;
          this.activabtnimprime = false;
          this.page = 1;
        }
      });
    } else {
      this.FormPlantillaSolicitudBodega.reset();
      this.detalleplantillapaginacion = [];
      this.detalleplantilla = [];
      this._Plantilla = new Plantillas();
      this.detalleplantillapaginacionaux = [];
      this.detalleplantillaaux = [];
      this._Plantillaaux = new Plantillas();
      this.FormPlantillaSolicitudBodega.get('fechacreacion').setValue(new Date());
      this.activabtncreaplant = false;
      this.FormPlantillaSolicitudBodega.get('estado').setValue("S");
      this.activabtnagregar = false;
      this.codprod = null;
      this.FormDatosProducto.controls.codigo.setValue('');
      this.btnLimpiar = false;
      this.ActivaBotonBuscaGrilla = false;
      this.verificanull = false;
      this.verificamodificanull = false;
      this.activabtnimprime = false;
      this.page = 1;
    }
  }

  salir() {
    const Swal = require('sweetalert2');
    if (
      (this.numplantillaaux !== this.FormPlantillaSolicitudBodega.get('numplantilla').value ||
        this.serviciocodaux !== this.FormPlantillaSolicitudBodega.get('serviciocod').value ||
        this.fechacreacionaux !== this.FormPlantillaSolicitudBodega.get('fechacreacion').value ||
        this.descripcionaux !== this.FormPlantillaSolicitudBodega.get('descripcion').value ||
        this.estadoaux !== this.FormPlantillaSolicitudBodega.get('estado').value ||
        this.bodcodigoaux !== this.FormPlantillaSolicitudBodega.get('bodcodigo').value ||
        this.bodcodigoentregaaux !== this.FormPlantillaSolicitudBodega.get('bodcodigoentrega').value) &&
      (this.numplantillaaux !== null ||
        this.serviciocodaux !== null ||
        this.fechacreacionaux !== null ||
        this.descripcionaux !== null ||
        this.bodcodigoaux !== null ||
        this.bodcodigoentregaaux !== null)) {
      this.msj = true;
    }
    if ((this.detalleplantillapaginacionaux !== this.detalleplantillapaginacion ||
      this.detalleplantillaaux !== this.detalleplantilla) &&
      (this.detalleplantillapaginacionaux.length !== 0 ||
        this.detalleplantillaaux.length !== 0)) {
      this.msj = true;
    }
    if (this.msj || this.msjColElim || this.msjColCant) {
      Swal.fire({
        title: this.TranslateUtil('key.title.salir'),
        text: this.TranslateUtil('key.mensaje.pregunta.confirma.salir.sin.guardar'),
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.TranslateUtil('key.si')
      }).then((result) => {
        if (result.value) {
    this.router.navigate(['home']);
        }
      });
    } else {
      this.router.navigate(['home']);
    }
  }

  async logicaVacios() {
    if(this.FormPlantillaSolicitudBodega.controls.numplantilla.value === null){
      this.vaciosProductos();
      // await this.NuevosRegistrosProductos();
      await this.CambiosCabecera();
      // console.log("this.vacios",this.vacios,"this.vacioscabecera:",this.vacioscabecera)
      if (this.vacios === true && this.vacioscabecera === true) {
        this.verificanull = false;
      }
      else {
        this.verificanull = true;
      }
    }else{
      this.vaciosProductos();
      // await this.NuevosRegistrosProductos();
      await this.CambiosCabecera();

      if (this.vacios === true && this.vacioscabecera === true) {
        this.verificamodificanull = false;
      }
      else {
        this.verificamodificanull = true;
      }
    }
  }


  NuevosRegistrosProductos(){
    if (this.detalleplantillapaginacion.length) {
      // console.log("hay registros en la grilla",this.lengthproductos,this.detalleplantilla.length)
      if(this.lengthproductos != this.detalleplantilla.length){
        this.vacios = false;

      }else{
        this.vacios = true;
      }
    }else{
      // console.log("no hay registros")
      // this.vacios =
    }
  }

  CambiosCabecera(){
    if(this.FormPlantillaSolicitudBodega.controls.numplantilla.value != null){
      if(this._Plantilla.planvigente != this.FormPlantillaSolicitudBodega.value.estado ||
        // this._Plantilla.bodorigen != this.FormPlantillaSolicitudBodega.controls.bodcodigo.value ||
        // this._Plantilla.boddestino != this.FormPlantillaSolicitudBodega.controls.bodcodigoentrega.value ||
        this._Plantilla.serviciocod != this.FormPlantillaSolicitudBodega.controls.serviciocod.value){
        this.vacioscabecera = false;
      }else{
        this.vacioscabecera = true;
      }
    }else{
      this.vacioscabecera = true;
    }

  }

  vaciosProductos() {
    if (this.detalleplantillapaginacion.length) {
      for (var data of this.detalleplantillapaginacion) {
        if (data.cantsoli < 0 || data.cantsoli === null) {
          this.vacios = true;
          return;
        } else {
          this.vacios = false;
        }
      }
    }else{
      this.vacios = true;
    }
  }



  BuscaBodegaSolicitante() {

    this._BodegasService.listaBodegaTodasSucursal(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor).subscribe(
      response => {
        this.bodegasSolicitantes = response;

      },
      error => {
        alert(this.TranslateUtil('key.mensaje.error.buscar.bodegas.cargo'));
      }
    );
  }

  BuscaBodegasSuministro(codigobodegasolicitante: number) {

    this.bodegassuministro = [];

    this._BodegasService.listaBodegaRelacionadaAccion(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor, codigobodegasolicitante, 1).subscribe(
      data => {
        this.bodegassuministro = data;

      }, err => {
      }
    );
    // this.logicaVacios();
  }


  cambio_cantidad(id: number, property: string,registro: DetallePlantillaBodega , event: any) {
    this.alertSwalAlert.title = null;
    this.alertSwalAlert.text = null;
    if(registro.cantsoli <0){
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.debe.ingresar.valores.mayor.cero');
      this.alertSwalAlert.show();
      event.target.value =0;

      if (this.detalleplantillapaginacion[id]["pldeid"] == 0) {
        this.detalleplantillapaginacion[id]["acciond"] = "I";
      }

      if (this.detalleplantillapaginacion[id]["pldeid"] > 0) {
        this.detalleplantillapaginacion[id]["acciond"] = "M";
      }
      this.detalleplantilla[id][property] = this.detalleplantillapaginacion[id][property]
    }else{
      if(registro.cantsoli == 0){
        this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.debe.ingresar.valores.mayor.cero');
        this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.puede.dejar.valores.cero');
        this.alertSwalAlert.show();
        event.target.value =0;

        if (this.detalleplantillapaginacion[id]["pldeid"] == 0) {
          this.detalleplantillapaginacion[id]["acciond"] = "I";
        }

        if (this.detalleplantillapaginacion[id]["pldeid"] > 0) {
          this.detalleplantillapaginacion[id]["acciond"] = "M";
        }
        this.detalleplantilla[id][property] = this.detalleplantillapaginacion[id][property]

      }else{
        if(registro.cantsoli >0){
          if (this.detalleplantillapaginacion[id]["pldeid"] == 0) {
            this.detalleplantillapaginacion[id]["acciond"] = "I";
          }

          if (this.detalleplantillapaginacion[id]["pldeid"] > 0) {
            this.detalleplantillapaginacion[id]["acciond"] = "M";
          }
          this.detalleplantilla[id][property] = this.detalleplantillapaginacion[id][property]
        }
      }
    }
  }

   /**
   * @mod verifica accion y vacios en reemplazo de func cambio_cantidad
   * @autor miguel.lobos@
   * @fecha 16-03-2021
   */
  async setCantidad(registro: DetallePlantillaBodega) {
    this.alertSwalAlert.title = null;
    this.alertSwalAlert.text = null;
    this.validaExcede();

    this.varColCant += registro.cantsoli !== registro.cantsoliresp ? 1 : -1;
    this.msjColCant = this.varColCant > 0;

    if (registro.cantsoli < 0) {
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.no.debe.ingresar.valores.menores.cero');
      await this.alertSwalAlert.show();

      registro.cantsoli = 0;
    }

    if (registro.pldeid > 0) {
      registro.acciond = 'M';
    } else if (registro.pldeid === 0) {
      registro.acciond = 'I';
    }

    await this.logicaVacios();
  }

  /** Verifica si existe valor negativo y devuelve bool */
  checkNegativo() {
    let exist: boolean = false;
    for (let item of this.detalleplantilla) {
      if (item.cantsoli < 0) {
        return exist = true;
      }
    }
    return exist;
  }

  ActivarBotonModificar() {
    // console.log("this._Plantilla.planvigente != this.FormPlantillaSolicitudBodega.controls.estado.value",
    // this._Plantilla.planvigente, this.FormPlantillaSolicitudBodega.controls.estado.value)

    if(this._Plantilla.planvigente != this.FormPlantillaSolicitudBodega.value.estado ||
      // this._Plantilla.bodorigen != this.FormPlantillaSolicitudBodega.controls.bodcodigo.value ||
      // this._Plantilla.boddestino != this.FormPlantillaSolicitudBodega.controls.bodcodigoentrega.value ||
      this._Plantilla.serviciocod != this.FormPlantillaSolicitudBodega.controls.serviciocod.value){
      // console.log("valor diferente del estado, bodega solciit")
      // this.vacioscabecera = false;
      return false;
    }else{
      return true;
      // this.vacioscabecera = true;
    }


    // u

  }


  ActivarBotonGuardar() {

    if (this.plantilla == 1) {
      if (this.FormPlantillaSolicitudBodega.get('numplantilla').value == null
        && this.FormPlantillaSolicitudBodega.get('descripcion').value != null
        && this.FormPlantillaSolicitudBodega.get('bodcodigo').value != null
        && this.FormPlantillaSolicitudBodega.get('bodcodigoentrega').value != null
        && this.detalleplantilla.length > 0
      ) {
        return true;

      } else {
        return false;
      }
    } else {  // Procedimientos
      if (this.FormPlantillaSolicitudBodega.get('numplantilla').value == null
        && this.FormPlantillaSolicitudBodega.get('descripcion').value != null
        && this.FormPlantillaSolicitudBodega.get('serviciocod').value != null
        && this.detalleplantilla.length>0
      ) {
        return true

      } else {
        return false
      }


    }

  }



  validaExcede() {
    if (this.detalleplantillapaginacion.length) {
      for (var data of this.detalleplantillapaginacion) {
        if(data.cantsoli > 99){
          if(!data.excedecant) {
            this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.esta.ingresando.cantidad.mas.tres.digitos');
            this.alertSwalAlert.show();
          }
          data.excedecant = true;
        } else {
          data.excedecant = false;
        }
      }
    }
  }

  BuscaDatosBodega() {
    // A partir de un servicio informa las bodegas asociadas en funcipon de las reglas definidas en la tabla Clin_far_reglas
    console.log("hay servicio cargado",this.FormPlantillaSolicitudBodega.get("serviciocod").value)
    if (this.FormPlantillaSolicitudBodega.get("serviciocod").value != null) {
      // Se busca los datos asociados al servicio.
      this._BusquedaproductosService.BuscarReglasServicio(this.hdgcodigo, this.esacodigo, this.cmecodigo,
       'INPUT-PORDUCTO-SOLICTUD-PACIENTE', null, null, this.FormPlantillaSolicitudBodega.get("serviciocod").value, 0, this.servidor).subscribe(
        response => {
          if (response != undefined ) {


            console.log("response busca bodegas", response)
            // seteamos las variables que son general a la solicitu y dispensación.
            this.BodegaMedicamentos = response[0].reglabodegamedicamento;
            this.BodegaInsumos = response[0].reglabodegainsumos;
            this.BodegaControlados = response[0].reglabedegacontrolados;
            this.BodegaConsignacion = response[0].reglabodegaconsignacion;
          }
        }
      );

    }

  }

  onImprimir(){
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.imprimir.plantilla'),
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

    console.log("imprime plantilla:", this.servidor,this.hdgcodigo,this.esacodigo, this.cmecodigo,
    "pdf",this._Plantilla.planid, 2,this.usuario)
    this._imprimesolicitudService.RPTImprimePlantillas(this.servidor,this.hdgcodigo,this.esacodigo, this.cmecodigo,
      "pdf",this._Plantilla.planid, 2,this.usuario).subscribe(
      response => {
        window.open(response[0].url, "", "");
        // this.alertSwal.title = "Reporte Impreso Correctamente";
        // this.alertSwal.show();
      },
      error => {
        console.log(error);
        this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.plantilla.procedimientos');
        this.alertSwalError.show();
        this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
        })
      }
    );
  }
  async findArticuloGrilla() {
    this.detalleplantillapaginacion = [];
    this.detalleplantillapaginacion = this.detalleplantilla;
    var valida : boolean = false;
    var codmei     : string = this.FormDatosProducto.controls.codigo.value;
    var meindescri    : string = this.FormDatosProducto.controls.descproducto.value;

    var listabodegasFiltro : Array<DetallePlantillaBodega> = this.detalleplantilla;
    var listaFiltro : Array<DetallePlantillaBodega> = [];

    if(codmei != "" && codmei != " " && codmei != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        let posicion = element.codmei.indexOf(codmei.toUpperCase());
        if (posicion !== -1){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }

    if(meindescri != "" && meindescri != " " && meindescri != null){
      listaFiltro = [];
      valida = true;
      listabodegasFiltro.forEach((element, index) => {
        let posicion = element.meindescri.indexOf(meindescri.toUpperCase());
        if (posicion !== -1){
          listaFiltro.unshift(element);
        }
      });
      listabodegasFiltro = listaFiltro;
    }
    if (valida) {
      this.detalleplantillapaginacion = listaFiltro;
      this.ActivaBotonLimpiaBusca = true;
    } else {
      this.detalleplantillapaginacion = this.detalleplantilla;
      this.ActivaBotonLimpiaBusca = false;
    }
  }
  limpiarFiltros(){
    this.FormDatosProducto.reset();

    if(this.detalleplantilla != null){
      this.findArticuloGrilla();
    }
  }
  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
