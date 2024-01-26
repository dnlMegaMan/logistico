import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { BodegasService } from '../../servicios/bodegas.service';
import { BodegaCargo } from 'src/app/models/entity/BodegaCargo';
import { BodegaDestino } from 'src/app/models/entity/BodegaDestino';
import { TipoMovimiento } from '../../models/entity/TipoMovimiento';
import { TipomovimientoService } from '../../servicios/tipomovimiento.service'
import { MotivoCargo } from '../../models/entity/MotivoCargo';
import { MotivocargoService } from '../../servicios/motivocargo.service';
import { BusquedapacientesComponent } from '../busquedapacientes/busquedapacientes.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BusquedamovimientosComponent } from '../busquedamovimientos/busquedamovimientos.component';
import { TipodocumentoidentService } from '../../servicios/tipodocumentoident.service';
import { TipoDocumentoIdentificacion } from '../../models/entity/TipoDocumentoIdentificacion';
import { MovimientosFarmacia } from '../../models/entity/MovimientosFarmacia'
import { MovimientosFarmaciaDet } from '../../models/entity/MovimientosFarmaciaDet'

import { MovimientosfarmaciaService } from '../../servicios/movimientosfarmacia.service';

import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { ModalpacienteComponent } from '../modalpaciente/modalpaciente.component';
import { DatePipe } from '@angular/common';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Detallelote } from '../../models/entity/Detallelote';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { GrabaMovimientos } from '../../models/entity/GrabaMovimientos'

import { GrabaDetalleMovimientoFarmacia } from 'src/app/models/entity/GrabaDetalleMovimientoFarmacia';
import { Paciente } from 'src/app/models/entity/Paciente';
import { BodegasrelacionadaAccion } from 'src/app/models/entity/BodegasRelacionadas';
import { InformesService } from '../../servicios/informes.service';
import { ListaPacientes } from 'src/app/models/entity/ListaPacientes';
import { Permisosusuario } from '../../permisos/permisosusuario';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.css'],
  providers : [InformesService]
})

export class MovimientosComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public modelopermisos                     : Permisosusuario = new Permisosusuario();
  public hdgcodigo                          : number;
  public esacodigo                          : number;
  public cmecodigo                          : number;
  public cliid                              : number = 0;
  public ctaid                              : number = 0;
  public estid                              : number = 0;
  public lote                               : string;
  public codigo                             : string;
  public fechaveto                          : string;
  public Arreglotiposmovimientos            : Array<TipoMovimiento> = [];
  public bodegascargo                       : Array<BodegaCargo> = [];
  public bodegasdestino                     : Array<BodegaDestino> = [];
  public bodegassuministro                    : Array<BodegasrelacionadaAccion> = [];
  public Arreglomotivoscargos               : Array<MotivoCargo> = [];
  public arreglotipodocumentoidentificacion : Array<TipoDocumentoIdentificacion> = [];
  public arregloMovimientosFarmaciaDet      : Array<MovimientosFarmaciaDet> = [];
  public arregloMovimientosFarmaciaDetPaginacion: Array<MovimientosFarmaciaDet> = [];
  public respuesta                          : Array<MovimientosFarmacia> = [];
  public detallemovimiento                  : Array<GrabaDetalleMovimientoFarmacia> =[];
  public pacientes                          : Array<Paciente> = [];
  public pacienteamb                        : ListaPacientes = new ListaPacientes(); //paciente ambulatorio
  public pacientehosp                       : Paciente = new Paciente(); //Paciente hospitalizado
  public servidor                           = environment.URLServiciosRest.ambiente;
  public usuario                            = environment.privilegios.usuario;
  public locale                             = 'es';
  public bsConfig                           : Partial<BsDatepickerConfig>;
  public colorTheme                         = 'theme-blue';
  public detalleslotes                      : Detallelote[]=[];
  public validatipomovim                    : boolean = false;
  public validanombrerut                    : boolean = false;
  public validabodega                       : boolean = false;
  public validamotivo                       : boolean = false;
  public validabtneliminar                  : boolean = false;
  public validagrabar                       : boolean = false;
  public validarecepcion                    : boolean = false;
  public validacantarececpcionar            : boolean = false;
  public validacantadevolver                : boolean = false;
  public validacantidad                     : number;
  public validacant                         : number;
  public rutpaciente                        : string;
  public nombrepac                          : string;
  public apepaternopac                      : string;
  public apematernopac                      : string;
  public movfaridedspachodevart             : number;
  public activabtnimprimovim                : boolean = false;

  onClose: any;
  bsModalRef: any;
  editField: any;
  _MovimientosFarmacia: MovimientosFarmacia;

  public get formBuilder(): FormBuilder {
    return this._formBuilder;
  }

  public set formBuilder(value: FormBuilder) {
    this._formBuilder = value;
  }


  public FormMovimiento: FormGroup;

  private _BSModalRef: BsModalRef;

  constructor(

    private _formBuilder              : FormBuilder,
    public _BodegasService            : BodegasService,
    public _TipomovimientoService     : TipomovimientoService,
    public _MotivocargoService        : MotivocargoService,
    public _BsModalService            : BsModalService,
    public _TipodocumentoidentService : TipodocumentoidentService,
    public _MovimientosfarmaciaService: MovimientosfarmaciaService,
    public datePipe                   : DatePipe,
    public localeService              : BsLocaleService,
    public _BusquedaproductosService  : BusquedaproductosService,
    private _imprimesolicitudService  : InformesService,

  ) {
    this.FormMovimiento = this.formBuilder.group({
      tipomov                 : [{ value: null, disabled: false }, Validators.required],
      movimfarid              : [{ value: null, disabled: false }, Validators.required],
      tipoidentificacion      : [{ value: null, disabled: true }, Validators.required],
      numidentificacion       : [{ value: null, disabled: true }, Validators.required],
      nombrepaciente          : [{ value: null, disabled: true }, Validators.required],
      unidadhospitalizacion   : [{ value: null, disabled: true }, Validators.required],
      pieza                   : [{ value: null, disabled: true }, Validators.required],
      cama                    : [{ value: null, disabled: true }, Validators.required],
      fechahospitalizacion    : [{ value: null, disabled: true }, Validators.required],
      numeroboletacaja        : [{ value: null, disabled: true }, Validators.required],
      numeroreceta            : [{ value: null, disabled: true }, Validators.required],
      bodorigen               : [{ value: null, disabled: false }, Validators.required],
      boddestino              : [{ value: null, disabled: false }, Validators.required],
      Arreglomotivoscargos    : [{ value: null, disabled: false }, Validators.required],
      Arreglotiposmovimientos : [{ value: null, disabled: false }, Validators.required],
      // motivocargo             : [{ value: null, disabled: false }, Validators.required],
      idtipomotivo            : [{ value: null, disabled: false }, Validators.required],
      fechanacimiento         : [{ value: null, disabled: true }, Validators.required],
      arreglotipodocumentoidentificacion: [{ value: null, disabled: false }, Validators.required],
      paterno                 : [{ value: null, disabled: false }, Validators.required],
      materno                 : [{ value: null, disabled: false }, Validators.required],
      nombres                 : [{ value: null, disabled: false }, Validators.required],
      cliid                   : [{ value: null, disabled: false }, Validators.required],
      movimfecha              : [new Date(),Validators.required ],
      nombrerutpaciente       : [{value: null, disabled: true}, Validators.required],
      cantidadadevolver       : [{value: null, disabled: false}, Validators.required],
      cantidadarecepcionar    : [{value: null, disabled: false}, Validators.required],
      codigo                  : [{value: null, disabled: false}, Validators.required],
      lote                    : [{value: null,disabled: false}, Validators.required],
      fechavto                : [{value: null, disabled: true}, Validators.required]
    });

  }

  ngOnInit() {

    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();

    this.setDate();

    this.BuscaBodegaCargo();

    this._TipomovimientoService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario,this.servidor).subscribe(
      data => {
        this.Arreglotiposmovimientos = data;

      }, err => {
        console.log(err.error);
      }
    );

    this._MotivocargoService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario, this.servidor).subscribe(
      data => {

        this.Arreglomotivoscargos = data;
      }, err => {
        console.log(err.error);
      }
    );

    this._TipodocumentoidentService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario, this.servidor, localStorage.getItem('language'), false).subscribe(
      data => {
        this.arreglotipodocumentoidentificacion = data;
      }, err => {
        console.log(err.error);
      }
    );
  }

  limpiar(){
    this.FormMovimiento.reset();

    this.arregloMovimientosFarmaciaDet= [];
    this.arregloMovimientosFarmaciaDetPaginacion = [];
    this.validatipomovim = false;
    this.validanombrerut = false;
    this.validabtneliminar = false;
    this.validagrabar = false;
    this.validamotivo = false;
    this.validarecepcion = false;
    this.cliid = 0;
    this.ctaid = 0;
    this.estid = 0;
    this.rutpaciente = null;
    this.nombrepac = null;
    this.apepaternopac = null;
    this.apematernopac = null;
    this.activabtnimprimovim = false;
    this.validaCantidad();
  }

  validaCantidad() {
    /** desactiva btn Guardar si cantidades son <= 0 //@MLobos */
    let codigo: any;
    for( const arr of this.arregloMovimientosFarmaciaDetPaginacion ) {
      switch(this.FormMovimiento.value.tipomov) {
        case 180:
          codigo = arr.cantidadadevolver;
          break;
        case 70:
        case 90:
          codigo = arr.cantidadarecepcionar;
      }
      if (codigo <= 0 || codigo === null || codigo === undefined) {
        this.validagrabar = false;
        break;
      } else {
        this.validagrabar = true;
      }
    }
  }


  SeleccionaTipoMovim(tipomov){
    // tipo movim = Despacho por devolución artículo
    if(tipomov==180){
      this.validatipomovim = true;
      this.validanombrerut = false;
      this.validabodega = false;
      this.validarecepcion = false;
      this.validagrabar = true;
      this.validacantadevolver= false;
      this.validacantarececpcionar = true;

    }else{
      // Recepción por devolucion paciente
      if(tipomov ==70){
        this.validanombrerut = true;
        this.validatipomovim = false;
        this.validabodega = true;
        this.validarecepcion = false;
        this.validagrabar = true;
        this.validacantarececpcionar = false;
        this.validacantadevolver= true;
      }else{
        // tipo movim 90 Recepción por Devolución de articulo
        if(tipomov ==90){
          this.validatipomovim = true;
          this.validanombrerut = false;
          this.validabodega = false;
          this.validarecepcion = true;
          this.validagrabar = false;
          this.validacantadevolver= true;
          this.validacantarececpcionar = false;

        }else{
          this.validatipomovim = false;
          this.validanombrerut = false;
        }

      }

    }
  }

  BuscaBodegaCargo() {
    this._BodegasService.listaBodegaCargoSucursal(this.hdgcodigo, this.esacodigo, this.cmecodigo,this.usuario,this.servidor).subscribe(
      response => {
        if (response != null) {
          this.bodegascargo = response;
        }
      },
      error => {
        alert("Error al Buscar Bodegas de cargo")
      }
    );
  }


  BuscaBodegasSuministro(valor: any) {
    this.bodegassuministro = [];
    this._BodegasService.listaBodegaRelacionadaAccion(this.hdgcodigo,this.esacodigo,this.cmecodigo,
      this.usuario, this.servidor, this.FormMovimiento.value.bodorigen, 1).subscribe(
      data => {
        this.bodegassuministro = data;

      }, err => {
        console.log(err.error);
      }
    );
  }

  setModalPacientes() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: 'Búsqueda de Paciente', // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
      }
    };
    return dtModal;
  }

  BusquedaPacientes() {

    this._BSModalRef = this._BsModalService.show(ModalpacienteComponent, this.setModalPacientes());
    this._BSModalRef.content.onClose.subscribe((RetornoPaciente: any) => {

      if (RetornoPaciente == undefined) { }
      else {
        this.pacientes = RetornoPaciente;
        this.cliid = RetornoPaciente.cliid;
        this.ctaid = RetornoPaciente.ctaid;
        this.estid = RetornoPaciente.estid;
        this.rutpaciente = RetornoPaciente.numdocpac;
        this.nombrepac   = RetornoPaciente.nombrespac;
        this.apematernopac = RetornoPaciente.apematernopac;
        this.apepaternopac = RetornoPaciente.apepaternopac;
        this.FormMovimiento.get('tipoidentificacion').setValue(RetornoPaciente.tipodocpac);
        this.FormMovimiento.get('numidentificacion').setValue(RetornoPaciente.numdocpac);
        this.FormMovimiento.get('nombrepaciente').setValue(RetornoPaciente.nombrespac+" "+RetornoPaciente.apepaternopac+" "+RetornoPaciente.apematernopac);
        this.FormMovimiento.get('unidadhospitalizacion').setValue(RetornoPaciente.undglosa);
        this.FormMovimiento.get('pieza').setValue(RetornoPaciente.pzagloza);
        this.FormMovimiento.get('cama').setValue(RetornoPaciente.camglosa);
        this.FormMovimiento.get('fechahospitalizacion').setValue(new Date(RetornoPaciente.fechahospitaliza));
        this.FormMovimiento.get('nombres').setValue(RetornoPaciente.nombres);
        this.FormMovimiento.get('paterno').setValue(RetornoPaciente.paterno);
        this.FormMovimiento.get('materno').setValue(RetornoPaciente.materno);
        this.FormMovimiento.get('cliid').setValue(RetornoPaciente.cliid);
        this.FormMovimiento.get('fechanacimiento').setValue(new Date(RetornoPaciente.fechanacimiento));
        this.FormMovimiento.get('nombrerutpaciente').setValue(RetornoPaciente.numdocpac+" "+RetornoPaciente.nombrespac+" "+RetornoPaciente.apepaternopac+" "+RetornoPaciente.apematernopac);

      }
    }
    );
  }

  BusquedaPacientesAmbulatorio() {

    this._BSModalRef = this._BsModalService.show(BusquedapacientesComponent, this.setModalPacientes());
    this._BSModalRef.content.onClose.subscribe((RetornoPaciente: any) => {


      if(RetornoPaciente.codambito ==1 ){


        this.pacienteamb = RetornoPaciente;

        this.cliid = this.pacienteamb.cliid;
        // this.ctaid = this.pacienteamb.ctaid;
        // this.estid = this.pacienteamb.estid;
        this.rutpaciente = this.pacienteamb.docuidentificacion;
        this.nombrepac = this.pacienteamb.nombres;
        this.apepaternopac = this.pacienteamb.paterno;
        this.apematernopac = this.pacienteamb.materno;
        this.FormMovimiento.get('tipoidentificacion').setValue(this.pacienteamb.tipoidentificacion);
        this.FormMovimiento.get('numidentificacion').setValue(this.pacienteamb.docuidentificacion);
        this.FormMovimiento.get('nombrepaciente').setValue(this.pacienteamb.nombres+" "+this.pacienteamb.paterno+" "+this.pacienteamb.materno);
        this.FormMovimiento.get('unidadhospitalizacion').setValue(this.pacienteamb.undglosa);
        // this.FormMovimiento.get('pieza').setValue(this.pacienteamb.pzagloza);
        this.FormMovimiento.get('cama').setValue(this.pacienteamb.camaactual);
        this.FormMovimiento.get('fechahospitalizacion').setValue(new Date(this.pacienteamb.fechahospitaliza));
        this.FormMovimiento.get('fechanacimiento').setValue(new Date(this.pacienteamb.fechanacimiento));
        this.FormMovimiento.get('nombrerutpaciente').setValue(this.pacienteamb.docuidentificacion+" "+ this.pacienteamb.paterno+" "+this.pacienteamb.materno+ " "+ this.pacienteamb.nombres);
      }else{
        if(RetornoPaciente.codambito == 3){
          this.pacientehosp = RetornoPaciente;

          this.cliid = this.pacientehosp.cliid;
          this.ctaid = this.pacientehosp.ctaid;
          this.estid = this.pacientehosp.estid;
          this.rutpaciente = this.pacientehosp.numdocpac;
          this.nombrepac = this.pacientehosp.nombrespac;
          this.apepaternopac = this.pacientehosp.apepaternopac;
          this.apematernopac = this.pacientehosp.apematernopac;
          this.FormMovimiento.get('tipoidentificacion').setValue(this.pacientehosp.tipodocpac);
          this.FormMovimiento.get('numidentificacion').setValue(this.pacientehosp.numdocpac);
          this.FormMovimiento.get('nombrepaciente').setValue(this.pacientehosp.nombrespac+" "+this.pacientehosp.apepaternopac+" "+this.pacientehosp.apematernopac);
          this.FormMovimiento.get('unidadhospitalizacion').setValue(this.pacientehosp.undglosa);
          this.FormMovimiento.get('pieza').setValue(this.pacientehosp.pzagloza);
          this.FormMovimiento.get('fechahospitalizacion').setValue(new Date(this.pacientehosp.fechahospitaliza));
          // this.FormMovimiento.get('nombres').setValue(this.pacientehosp.nombres);
          // this.FormMovimiento.get('paterno').setValue(this.pacientehosp.paterno);
          // this.FormMovimiento.get('materno').setValue(this.pacientehosp.materno);
          // this.FormMovimiento.get('cliid').setValue(this.pacientehosp.cliid);
          this.FormMovimiento.get('fechanacimiento').setValue(new Date(this.pacientehosp.fechanacimiento));
          this.FormMovimiento.get('nombrerutpaciente').setValue(this.pacientehosp.numdocpac+" "+this.pacientehosp.apepaternopac+" "+this.pacientehosp.apematernopac +" "+ this.pacientehosp.nombrespac);
        } else {

              this.pacientehosp = RetornoPaciente;

              this.cliid = this.pacientehosp.cliid;
              this.ctaid = this.pacientehosp.ctaid;
              this.estid = this.pacientehosp.estid;
              this.rutpaciente = this.pacientehosp.numdocpac;
              this.nombrepac = this.pacientehosp.nombrespac;
              this.apepaternopac = this.pacientehosp.apepaternopac;
              this.apematernopac = this.pacientehosp.apematernopac;
              this.FormMovimiento.get('tipoidentificacion').setValue(this.pacientehosp.tipodocpac);
              this.FormMovimiento.get('numidentificacion').setValue(this.pacientehosp.numdocpac);
              this.FormMovimiento.get('nombrepaciente').setValue(this.pacientehosp.nombrespac+" "+this.pacientehosp.apepaternopac+" "+this.pacientehosp.apematernopac);
              this.FormMovimiento.get('unidadhospitalizacion').setValue(this.pacientehosp.undglosa);
              this.FormMovimiento.get('pieza').setValue(this.pacientehosp.pzagloza);
              this.FormMovimiento.get('fechahospitalizacion').setValue(new Date(this.pacientehosp.fechahospitaliza));
              // this.FormMovimiento.get('nombres').setValue(this.pacientehosp.nombres);
              // this.FormMovimiento.get('paterno').setValue(this.pacientehosp.paterno);
              // this.FormMovimiento.get('materno').setValue(this.pacientehosp.materno);
              // this.FormMovimiento.get('cliid').setValue(this.pacientehosp.cliid);
              this.FormMovimiento.get('fechanacimiento').setValue(new Date(this.pacientehosp.fechanacimiento));
              this.FormMovimiento.get('nombrerutpaciente').setValue(this.pacientehosp.numdocpac+" "+this.pacientehosp.apepaternopac+" "+this.pacientehosp.apematernopac +" "+ this.pacientehosp.nombrespac);
        }

      }


    })
  }

  setModalMovimientos() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: 'Búsqueda de Movimientos', // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
      }
    };
    return dtModal;
  }

  BusquedaMovimientos() {

    this._BSModalRef = this._BsModalService.show(BusquedamovimientosComponent, this.setModalMovimientos());
    this._BSModalRef.content.onClose.subscribe((RetornoMovimiento: any) => {
      // estado es el dato de respuesta, también puede ser un objeto JSON
      if (RetornoMovimiento == undefined) { }
      else {
        this.movfaridedspachodevart = RetornoMovimiento.movimfarid;
        this.FormMovimiento.get('movimfarid').setValue(RetornoMovimiento.movimfarid);

         /* Llamada a busqueda de movimiento teniendo el ID único */

         this.depliegaMovimiento(RetornoMovimiento.movimfarid,this.usuario,this.servidor);
      }
    }
    );
  }


  depliegaMovimiento(IdMovimiento:number, usuario:string, servidor:string){

    this._MovimientosfarmaciaService.RecuperaMovimiento(this.hdgcodigo, this.esacodigo, this.cmecodigo, IdMovimiento,usuario,servidor).subscribe(
      response => {
        if (response != null) {
          this._MovimientosFarmacia = response[0] ;
          this.SeleccionaTipoMovim(this._MovimientosFarmacia.tipomov);
          this.validamotivo = true;
          this.validabtneliminar = true;
          this.validagrabar = true;
          this.FormMovimiento.get('movimfarid').setValue(this._MovimientosFarmacia.movimfarid);
          this.FormMovimiento.get('tipomov').setValue(this._MovimientosFarmacia.tipomov);
          this.FormMovimiento.get('movimfecha').setValue(new Date(this._MovimientosFarmacia.movimfecha));
          this.FormMovimiento.get('bodorigen').setValue(this._MovimientosFarmacia.bodegaorigen);
          this.FormMovimiento.get('boddestino').setValue(this._MovimientosFarmacia.bodegadestino);
          this.FormMovimiento.get('numeroreceta').setValue(this._MovimientosFarmacia.numeroreceta);
          this.FormMovimiento.get('numeroboletacaja').setValue(this._MovimientosFarmacia.numeroboletacaja);
          this.FormMovimiento.get('numidentificacion').setValue(this._MovimientosFarmacia.clienterut);
          this.FormMovimiento.get('nombrerutpaciente').setValue(this._MovimientosFarmacia.clientenombres+" "+this._MovimientosFarmacia.clientepaterno+" "+this._MovimientosFarmacia.clientematerno)
          // this.FormMovimiento.get('motivocargo').setValue(this._MovimientosFarmacia.motivocargoid );
          this.FormMovimiento.get('paterno').setValue(this._MovimientosFarmacia.clientepaterno);
          this.FormMovimiento.get('materno').setValue(this._MovimientosFarmacia.clientematerno);
          this.FormMovimiento.get('nombres').setValue(this._MovimientosFarmacia.clientenombres);
          this.FormMovimiento.get('nombrepaciente').setValue(this._MovimientosFarmacia.clientenombres+" "+this._MovimientosFarmacia.clientepaterno+" "+this._MovimientosFarmacia.clientematerno);

          this.arregloMovimientosFarmaciaDet = [];
          this.arregloMovimientosFarmaciaDetPaginacion = [];

          this.arregloMovimientosFarmaciaDet = this._MovimientosFarmacia.movimientosfarmaciadet;
          this.arregloMovimientosFarmaciaDetPaginacion = this.arregloMovimientosFarmaciaDet.slice(0, 20);
          this.validaCantidad();
        }
      },
      error => {
        console.log("Error :", error)
      }
    );
  }

  setModalDevoluciones(in_descripcionmeinmovimiento:string,registro: MovimientosFarmaciaDet)
  { let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: 'Devolución de Movimientos', // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        descripciontipomov: in_descripcionmeinmovimiento,
        DetalleMovimiento:registro,
      }
    };
    return dtModal;
  }

  setModalMensajeAceptar( ) {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-m',
      initialState: {
        titulo: 'CONFIRMAR', // Parametro para de la otra pantalla
        mensaje: 'USTED DEBE CONFIRMAR O CANCELAR LA GRABACIÓN DE LA INFORMACIÓN',
        informacion: '',
      }
    };
    return dtModal;
  }

  GuardaMotivo(id:number,event: any,registro:any){
  }

  ConfirmarEliminaRegistro(registro: any, id: number){

    const Swal = require('sweetalert2');
    Swal.fire({
      title: '¿ Confirme eliminación de producto ?',
      text: "Confirmar la eliminación del producto",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        this.EliminaRegistro(registro, id);
      }
    })
  }

  EliminaRegistro(registro: any,id:number){

    this.arregloMovimientosFarmaciaDet.splice(id, 1);
    this.arregloMovimientosFarmaciaDetPaginacion =  this.arregloMovimientosFarmaciaDet.slice(0,20);
    this.validaCantidad();

  }

  /* Confiormar guardado de movimiento previamente */
  ConfirmarGuardadoMovimiento() {
      // sE CONFIRMA GURADADO DE REGISTRO
    const Swal = require('sweetalert2');
    Swal.fire({
      title: '¿ Desea Grabar Movimiento?',
      text: "Confirmar la grabación",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        this.GuardaMovimiento();
      }
    })
  }

  /* Guardar movimimientos */
  async GuardaMovimiento(){

    this.detallemovimiento = [];
    var movimientos = new GrabaMovimientos;

     this.respuesta = []

    if(this.FormMovimiento.value.tipomov == 180 && this.FormMovimiento.value.tipomov == 70){
      movimientos.movfaridedspachodevart =0;
    }else{
      if( this.FormMovimiento.value.tipomov ==90){
        movimientos.movfaridedspachodevart = this.movfaridedspachodevart;
      }

    }
    movimientos.movimfarid   = 0;
    movimientos.hdgcodigo    = this.hdgcodigo;
    movimientos.esacodigo    = this.esacodigo;
    movimientos.cmecodigo    = this.cmecodigo;
    movimientos.tipomov      = this.FormMovimiento.value.tipomov;
    movimientos.movimfecha   = this.datePipe.transform(this.FormMovimiento.value.movimfecha, 'yyyy-MM-dd');
    movimientos.usuario      = this.usuario;
    movimientos.bodegaorigen = this.FormMovimiento.value.bodorigen;
    movimientos.bodegadestino= this.FormMovimiento.value.boddestino;
    movimientos.proveedorid  = 0;
    movimientos.orconumdoc   = 0;
    movimientos.numeroguia   = 0;
    movimientos.estid        = this.estid;
    movimientos.numeroreceta = 0
    movimientos.fechadocumento= null;
    movimientos.cantidadmov  = 0
    movimientos.valortotal   =0;
    movimientos.cliid        = this.cliid
    movimientos.fechagrabacion= this.datePipe.transform(this.FormMovimiento.value.movimfecha, 'yyyy-MM-dd');
    movimientos.serviciocargoid= null;
    movimientos.guiatipodcto  = 0;
    movimientos.foliourgencia =0;
    movimientos.motivocargoid = 0;
    movimientos.pacambulatorio=null;
    movimientos.tipoformuhcfar= 0;
    movimientos.cuentaid      = this.ctaid;
    movimientos.clienterut    = this.rutpaciente;
    movimientos.clientepaterno= this.apepaternopac;
    movimientos.clientematerno= this.apematernopac;
    movimientos.clientenombres= this.nombrepac;
    movimientos.proveedorrut  = null;
    movimientos.proveedordesc = null;
    movimientos.movimudescr   = null;
    movimientos.bodegadescr   = null;
    movimientos.bodegadestinodes= null;
    movimientos.comprobantecaja= null;
    movimientos.estadocomprobantecaja= 0;
    movimientos.glosaestadocaja= null
    movimientos.servidor      = this.servidor;

    movimientos.movimientosfarmaciadet =[];

    this.arregloMovimientosFarmaciaDet.forEach(element=>{
      var detmovim = new GrabaDetalleMovimientoFarmacia;
      detmovim.movimfardetid        = 0;
      detmovim.movimfarid           = 0;
      detmovim.fechamovimdet        = this.datePipe.transform(this.FormMovimiento.value.movimfecha, 'yyyy-MM-dd');
      detmovim.tipomov              = this.FormMovimiento.value.tipomov;
      detmovim.codigomein           = element.codigomein;
      detmovim.meinid               = element.meinid;
      detmovim.cantidadmov          = 0;
      detmovim.valorcostouni        = 0;
      detmovim.valorventaUni        = 0;
      detmovim.unidaddecompra       = 0;
      detmovim.contenidounidecom    = 0;
      detmovim.unidaddedespacho     = 0;
      detmovim.cantidaddevol        = element.cantidaddevol;
      detmovim.cantidadadevolver    = element.cantidadadevolver;
      detmovim.cantidadarecepcionar = element.cantidadarecepcionar;
      detmovim.cuentacargoid        = this.ctaid;
      detmovim.numeroreposicion     = 0;
      detmovim.incobrablefonasa     = null
      detmovim.descripcionmein      = element.descripcionmein;
      detmovim.lote                 = element.lote;
      detmovim.fechavto             = element.fechavto;
      detmovim.tiporeg              = element.tiporegistro;
      detmovim.idtipomotivo         = element.idtipomotivo;
      detmovim.idtipomotivo         = element.idtipomotivo;
      detmovim.movimientosfarmaciadetdevol = [];

      this.detallemovimiento.unshift(detmovim);

    })

    movimientos.movimientosfarmaciadet = this.detallemovimiento;


     await this._MovimientosfarmaciaService.GrabaMovimiento(movimientos).subscribe(
      response => {
        if (response != null) {
          this.alertSwal.title = "Movimiento Generado Exitosamente. N°:".concat(response['movimientofarmaciaid']);
          this.alertSwal.show();
          /* Llamada a busqueda de movimiento teniendo el ID único */
          this.activabtnimprimovim = true;
          this.depliegaMovimiento(response['movimientofarmaciaid'],this.usuario,this.servidor);
        }
      },
      error => {
        console.log(error);
        this.alertSwalError.title="Error al Realizar Movimiento";
        this.alertSwalError.show();
      }
    );
    this.arregloMovimientosFarmaciaDet= [];
    this.arregloMovimientosFarmaciaDetPaginacion = [];
  }

  /* Funciones de tabla editable */

  remove(id: any) {
    this.arregloMovimientosFarmaciaDetPaginacion.unshift(this.arregloMovimientosFarmaciaDetPaginacion[id]);
    this.arregloMovimientosFarmaciaDetPaginacion.splice(id, 1);
    this.arregloMovimientosFarmaciaDet.unshift(this.arregloMovimientosFarmaciaDet[id]);
    this.arregloMovimientosFarmaciaDet.splice(id, 1);

  }

  setModalProductos() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-lg',
      initialState: {
        titulo: 'Búsqueda de Productos', // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
      }
    };
    return dtModal;
  }

  addArticuloGrilla(dato: any) {

    this.validaCantidad();
    if (dato.codigo != null) {


      if (this.detalleslotes.length > 0) {
        if (this.detalleslotes.length > 1 && dato.lote == null) {
          this.alertSwalAlert.title = "Debe seleccionar lote";
          this.alertSwalAlert.show();
        }
        else {
          this.detalleslotes.forEach(element => {
            if (element.lote == dato.lote) {

              const DetalleMovimiento = new (MovimientosFarmaciaDet);
              this.lote = this.FormMovimiento.value.lote;
              this.codigo = this.FormMovimiento.value.codigo;
              DetalleMovimiento.codigomein = element.codmei;
              DetalleMovimiento.descripcionmein = element.descripcion;

              DetalleMovimiento.lote = element.lote;
              DetalleMovimiento.fechavto = element.fechavto;
              DetalleMovimiento.cantidadmov = 0;
              DetalleMovimiento.cantidaddevol = element.cantidaddev;
              DetalleMovimiento.meinid = element.meinid;
              DetalleMovimiento.tiporegistro = element.meintiporeg;
              this.arregloMovimientosFarmaciaDet.unshift(DetalleMovimiento);
              this.arregloMovimientosFarmaciaDetPaginacion = this.arregloMovimientosFarmaciaDet.slice(0, 20);
              this.validaCantidad();
              this.FormMovimiento.get('codigo').setValue(null);
              this.FormMovimiento.get('lote').setValue(null);
              this.FormMovimiento.get('fechavto').setValue(null);

            }
          })
        }

      }
      else {
        const DetalleMovimiento = new (MovimientosFarmaciaDet);
        this.lote = this.FormMovimiento.value.lote;
        this.codigo = this.FormMovimiento.value.codigo;

        this._BusquedaproductosService.BuscarArticulosFiltros(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.codigo, '', 0, 0, 0, '',
        0, '', '', '', this.usuario, null, this.servidor).subscribe(response => {
          if (response != null) {
            DetalleMovimiento.codigomein = response[0].codigo;
            DetalleMovimiento.descripcionmein = response[0].descripcion;
            DetalleMovimiento.cantidadmov = 0;
            DetalleMovimiento.cantidaddevol = 0;
            DetalleMovimiento.meinid = response[0].mein;
            DetalleMovimiento.tiporegistro = response[0].tiporegistro;
            this.arregloMovimientosFarmaciaDet.unshift(DetalleMovimiento);
            this.arregloMovimientosFarmaciaDetPaginacion = this.arregloMovimientosFarmaciaDet.slice(0, 20);
            this.validaCantidad();
            this.FormMovimiento.get('codigo').setValue(null);
            this.FormMovimiento.get('lote').setValue(null);
            this.FormMovimiento.get('fechavto').setValue(null);
          }
        });
      }
    }
  }
  async updateList(id: number, property: string, registro: MovimientosFarmaciaDet) {
    this.validaCantidad();
    const editField = registro.cantidadadevolver;
    await this.ValidaCantidadADevolver(editField,id,property)

  }

  changeValue(id: number, property: string, event: any) {
    this.editField = event.target.textContent;
  }
  changeValue1(id: number, property: string, event: any) {
    this.editField = event.target.textContent;
  }

  async updateList1(id: number, property: string, event: any) {

    const editField = event.target.textContent;
    this.arregloMovimientosFarmaciaDetPaginacion[id][property] = parseInt(editField);
    this.arregloMovimientosFarmaciaDet[id][property] = this.arregloMovimientosFarmaciaDetPaginacion[id][property]

  }

  ValidaCantidadADevolver(canadevolver:number,id:number,property:string){

  /*  if(this.FormMovimiento.value.tipomov == 70){
      this._MovimientosfarmaciaService.ValidaCantDevolver(this.servidor,this.hdgcodigo,this.esacodigo,
        this.cmecodigo,this.cliid,this.codigo,this.lote, canadevolver).subscribe(
        response => {

          this.validacant = response[0].validacant;

          if(response[0].validacant == 0){

            this.alertSwalError.title = "Valor es mayor que el dispensado";
            this.alertSwalError.text = "Ingrese el valor nuevamente";
            this.alertSwalError.show();
          }else{
            if(response[0].validacant == 1){

              this.arregloMovimientosFarmaciaDetPaginacion[id][property] = canadevolver;
              this.arregloMovimientosFarmaciaDet[id][property] = this.arregloMovimientosFarmaciaDetPaginacion[id][property]

            }
          }
        }
      )
    }else{
      if(this.FormMovimiento.value.tipomov == 180){
        this._MovimientosfarmaciaService.ValidaCantDevolverBod(this.servidor,this.hdgcodigo,this.esacodigo,
          this.FormMovimiento.value.bodorigen,this.FormMovimiento.value.boddestino,this.cmecodigo,
          this.codigo,this.lote, canadevolver).subscribe(
          response => {
            this.validacant = response[0].validacant;
            if(response[0].validacant == 0){
              this.alertSwalError.title = "Valor es mayor que el dispensado";
              this.alertSwalError.text = "Ingrese el valor nuevamente";
              this.alertSwalError.show();
            }else{
              if(response[0].validacant == 1){
                this.arregloMovimientosFarmaciaDetPaginacion[id][property] = canadevolver;
                this.arregloMovimientosFarmaciaDet[id][property] = this.arregloMovimientosFarmaciaDetPaginacion[id][property]
              }
            }
          }
        )
      }
    }*/
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }



  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.arregloMovimientosFarmaciaDetPaginacion = this.arregloMovimientosFarmaciaDet.slice(startItem, endItem);
    this.validaCantidad();
  }

  codigo_ingresado(datoingresado: any){
    this.detalleslotes=[];

    if(this.FormMovimiento.value.tipomov == 70){ //Recep x DEvol Pacient
      this._MovimientosfarmaciaService.BuscaLotesProductos(this.servidor,this.hdgcodigo,this.esacodigo,
        this.cmecodigo,datoingresado.codigo,this.FormMovimiento.value.bodorigen,this.FormMovimiento.value.boddestino ,this.cliid).subscribe(
        response => {
          if (response != null) {
            this.detalleslotes= response;

            if(this.detalleslotes.length==1){
              this.FormMovimiento.get('fechavto').setValue(this.datePipe.transform(this.detalleslotes[0].fechavto, 'dd-MM-yyyy'));
              this.FormMovimiento.get('lote').setValue(this.detalleslotes[0].lote);
              this.lote= this.detalleslotes[0].lote;
              this.fechaveto = this.detalleslotes[0].fechavto;
            }
          }
        });
    }else{
      if(this.FormMovimiento.value.tipomov == 180 || this.FormMovimiento.value.tipomov == 90){
        this._MovimientosfarmaciaService.BuscaLotesProductosBodega(this.servidor,this.hdgcodigo,this.esacodigo,
          this.cmecodigo,datoingresado.codigo,this.FormMovimiento.value.bodorigen,
          this.FormMovimiento.value.boddestino).subscribe(
          response => {
            if (response != null) {
              this.detalleslotes= response;
              if(this.detalleslotes.length==1){
                this.FormMovimiento.get('fechavto').setValue(this.datePipe.transform(this.detalleslotes[0].fechavto, 'dd-MM-yyyy'));
                this.FormMovimiento.get('lote').setValue(this.detalleslotes[0].lote);
                this.lote= this.detalleslotes[0].lote;
                this.fechaveto = this.detalleslotes[0].fechavto;
              }
            }
          }
        )
      }
    }
  }

  LlamaFecha(event: any){
    this.detalleslotes.forEach(element=>{
      if(event == element.lote){
          this.FormMovimiento.get('fechavto').setValue(this.datePipe.transform(element.fechavto, 'dd-MM-yyyy'));
          this.fechaveto = element.fechavto;
      }
    })
  }

  ConfirmarRecepcionMovimiento(){
    const Swal = require('sweetalert2');
    Swal.fire({
      title: '¿ Desea Rececpcionar Movimiento?',
      text: "Confirmar la recepción",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        this.GuardaMovimiento();
      }
    })
  }

  onImprimir() {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: '¿Desea Imprimir Movimiento ?',
      text: "Confirmar Impresión",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        this.ImprimirMovimiento();
      }
    })

  }

  ImprimirMovimiento(){

    this._imprimesolicitudService.RPTImprimeMovimiento(this.servidor,this.usuario,this.hdgcodigo,
    this.esacodigo,this.cmecodigo, "pdf",this._MovimientosFarmacia.movimfarid).subscribe(
      response => {
        if (response != null) {
          window.open(response[0].url, "", "", true);
        }
      },
      error => {
        console.log(error);
        this.alertSwalError.title = "Error al Imprimir Movimiento";
        this.alertSwalError.show();
        this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
        })
      }
    );

  }

}
