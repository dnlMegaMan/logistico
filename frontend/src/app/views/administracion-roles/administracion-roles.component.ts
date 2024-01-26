import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { environment } from '../../../environments/environment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Articulos } from 'src/app/models/entity/mantencionarticulos';
import { DetalleSolicitudConsumo } from 'src/app/models/entity/detalle-solicitud-consumo';
import { UnidadesOrganizacionalesService } from 'src/app/servicios/unidades-organizacionales.service';
import { UnidadesOrganizacionales } from 'src/app/models/entity/unidades-organizacionales';
import { EstructuraListaUsuarios } from 'src/app/models/entity/estructura-lista-usuarios';
import { BusquedaUsuariosComponent } from '../busqueda-usuarios/busqueda-usuarios.component';
import { BusquedaRolesComponent } from '../busqueda-roles/busqueda-roles.component';
import { Roles } from 'src/app/models/entity/Roles';
import { RolesUsuarios } from 'src/app/models/entity/roles-usuario';
import { EstructuraRolesUsuarios } from 'src/app/models/entity/estructura-roles-usuarios';
import { UsuariosService } from 'src/app/servicios/usuarios.service';
import { CentroCostoUsuario } from 'src/app/models/entity/centro-costo-usuario';
import { BusquedaCentrosCostosComponent } from '../busqueda-centros-costos/busqueda-centros-costos.component';
import { EstructuraCentroCostoUsuario } from 'src/app/models/entity/estructura-centro-costo-usuario';
import { ActivatedRoute, Router } from '@angular/router';
import { Permisos } from 'src/app/models/entity/permisos';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import {TranslateService} from '@ngx-translate/core';


@Component({
  selector: 'app-administracion-roles',
  templateUrl: './administracion-roles.component.html',
  styleUrls: ['./administracion-roles.component.css']
})
export class AdministracionRolesComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public FormUsuarioRoles: FormGroup;
  public ccostosolicitante: Array<UnidadesOrganizacionales> = [];

  public _RolUsuario: RolesUsuarios;   /* Solictud de creación y modificaicíón */
  public grabadetallesolicitud: Array<DetalleSolicitudConsumo> = [];
  public arregloRolesUsuario: Array<RolesUsuarios> = [];
  public arregloRolesUsuarioPaginacion: Array<RolesUsuarios> = [];
  public arregloCentroCosto: Array<CentroCostoUsuario> = [];
  public arregloCentroCostoPaginacion: Array<CentroCostoUsuario> = [];
  public locale = 'es';
  public bsConfig: Partial<BsDatepickerConfig>;
  public colorTheme = 'theme-blue';
  public usuario = environment.privilegios.usuario;
  public servidor = environment.URLServiciosRest.ambiente;
  public id_usuario: number = 0;

  public activaagregar: boolean = false;
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;

  public productoselec: Articulos;
  private _BSModalRef: BsModalRef;
  public BtnSolConsumoGenerSolictud_activado: boolean;
  public _CentroCostoUsuario: CentroCostoUsuario;
  public desactivabtnelimrol : boolean = false;
  public desactivabtnelimccosto: boolean = false;
  public lengthroles: number;
  public lengthcentrocosto: number;
  public verificanull = false;
  public vacioscentro            = true;
  public vaciosroles  = true;
  public permisos = [];

  public valInit : boolean;
  public arregloRolesUsuarioInit: Array<RolesUsuarios> = [];

  onClose: any;
  bsModalRef: any;
  editField: any;

  constructor(
    private formBuilder: FormBuilder,
    public _BsModalService: BsModalService,
    public localeService: BsLocaleService,
    public datePipe: DatePipe,
    private _ServiciosUsuarios: UsuariosService,
    public _unidadesorganizacionaes: UnidadesOrganizacionalesService,
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService
  ) {
    this.FormUsuarioRoles = this.formBuilder.group({
      id_usuario: [{ value: null, disabled: true }, Validators.required],
      rut: [{ value: null, disabled: true }, Validators.required],
      login: [{ value: null, disabled: true }, Validators.required],
      nombre: [{ value: null, disabled: true }, Validators.required],
      numsolicitud: [{ value: null, disabled: true }, Validators.required],
      esticod: [{ value: 10, disabled: false }, Validators.required],
      hdgcodigo: [{ value: null, disabled: false }, Validators.required],
      esacodigo: [{ value: null, disabled: false }, Validators.required],
      cmecodigo: [{ value: null, disabled: false }, Validators.required],
      prioridad: [{ value: null, disabled: false }, Validators.required],
      fecha: [{ value: new Date(), disabled: true }, Validators.required],
      centrocosto: [{ value: null, disabled: false }, Validators.required],
      referenciaerp: [{ value: null, disabled: true }, Validators.required],
      estadoerp: [{ value: null, disabled: true }, Validators.required],
      glosa: [{ value: null, disabled: false }, Validators.required],
    });
  }

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());

    const _ListaRolUsuario = new (EstructuraRolesUsuarios);
    _ListaRolUsuario.servidor = this.servidor;
    _ListaRolUsuario.hdgcodigo = this.hdgcodigo;
    _ListaRolUsuario.cmecodigo = this.cmecodigo;
    _ListaRolUsuario.esacodigo = this.esacodigo;
    _ListaRolUsuario.idusuario = Number(sessionStorage.getItem('id_usuario').toString());

    this._ServiciosUsuarios.buscarRolesUsuarios(_ListaRolUsuario).subscribe(
      response => {
        if(response != null){
          this.arregloRolesUsuarioInit = [];
          this.arregloRolesUsuarioInit = response;
          this.valInit = true;

          this.arregloRolesUsuarioInit.forEach(element => {
            if (element.rolid === 0) {
              this.valInit = false;
            }
          });
          if (this.valInit) {
            this.route.paramMap.subscribe(param => {
              this.router.navigate(['home']);
            })
          }
        }
      },error => {
        console.log("Error :", error);
      })
  }

  async addCentroCosto() {

    this._CentroCostoUsuario = new (CentroCostoUsuario);

    this._BSModalRef = this._BsModalService.show(BusquedaCentrosCostosComponent, this.setModalCentroCosto());
    this._BSModalRef.content.onClose.subscribe((response: UnidadesOrganizacionales) => {
      if (response == undefined) { }
      else {

            //Validaomos que el Rol no esté repetido
            const resultado = this.arregloCentroCosto.find( registro => registro.idcentrocosto === response.unorcorrelativo );
            if  ( resultado != undefined )
            {
              this.alertSwalError.title = this.TranslateUtil('key.mensaje.rol.no.repetir');
              this.alertSwalError.show();
              return
            }

        this._CentroCostoUsuario.servidor = this.servidor;
        this._CentroCostoUsuario.idcentrocosto = response.unorcorrelativo;
        this._CentroCostoUsuario.idusuario = this.id_usuario;
        this._CentroCostoUsuario.hdgcodigo = this.hdgcodigo;
        this._CentroCostoUsuario.esacodigo = this.esacodigo;
        this._CentroCostoUsuario.cmecodigo = this.cmecodigo;
        this._CentroCostoUsuario.glounidadesorganizacionales = response.descripcion;
        this._CentroCostoUsuario.accion = 'I';
        this._CentroCostoUsuario.bloqcampogrilla = true;

        this.arregloCentroCosto.unshift(this._CentroCostoUsuario);
        this.arregloCentroCostoPaginacion = this.arregloCentroCosto.slice(0, 8);
        this.logicalength();
      }
    });
  }

  setModalCentroCosto() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.busqueda.centro.costo'), // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        CentrosCosto: this.arregloCentroCosto
      }
    };
    return dtModal;
  }




  async addRol() {

    let existe = 0

    this._BSModalRef = this._BsModalService.show(BusquedaRolesComponent, this.setModalRoles());
    this._BSModalRef.content.onClose.subscribe((response: Roles) => {
      if (response == undefined) { }
      else {

        //Validaomos que el Rol no esté repetido
        const resultado = this.arregloRolesUsuario.find( registro => registro.rolid === response.rolid );
        if  ( resultado != undefined )
        {
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.rol.no.repetir');
          this.alertSwalError.show();
          return
        }
        this._RolUsuario = new (RolesUsuarios);
        this._RolUsuario.servidor = this.servidor;
        this._RolUsuario.rolid = response.rolid;
        this._RolUsuario.hdgcodigo = response.hdgcodigo;
        this._RolUsuario.esacodigo = response.esacodigo;
        this._RolUsuario.cmecodigo = response.cmecodigo;
        this._RolUsuario.codigorol = response.codigorol;
        this._RolUsuario.nombrerol = response.nombrerol;
        this._RolUsuario.descripcionrol = response.descripcionrol;
        this._RolUsuario.idusuario = this.id_usuario;
        this._RolUsuario.accion = 'I';
        this._RolUsuario.bloqcampogrilla = true;

        this.arregloRolesUsuario.unshift(this._RolUsuario);
        this.arregloRolesUsuarioPaginacion = this.arregloRolesUsuario.slice(0, 8);
        this.logicalength();
      }
    });


  }


  setModalRoles() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.busqueda.roles'), // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        RolesUsuario : this.arregloRolesUsuario
      }
    };
    return dtModal;
  }



  ConfirmaEliminarCentroCostoGrilla(registro: CentroCostoUsuario, id: number) {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.confirmar.eliminacion.centro.costo'),
      text: this.TranslateUtil('key.mensaje.confirmar.eliminacion'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.EliminCentroCostolDeLaGrilla(registro, id);
      }
    })
  }

  EliminCentroCostolDeLaGrilla(registro: CentroCostoUsuario, id: number) {

    const _ECentroCostoUsuario = new (EstructuraCentroCostoUsuario);

    if (registro.accion == "I" && id >= 0) {
      // Eliminar registro nuevo la grilla
      this.arregloCentroCosto.splice(id, 1);
      this.arregloCentroCostoPaginacion = this.arregloCentroCosto.slice(0, 8);
      this.alertSwal.title = this.TranslateUtil('key.mensaje.centro.costo.eliminado.usuario');
      this.alertSwal.show();
    } else {

      _ECentroCostoUsuario.servidor = this.servidor;
      _ECentroCostoUsuario.hdgcodigo = this.hdgcodigo;
      _ECentroCostoUsuario.esacodigo = this.esacodigo;
      _ECentroCostoUsuario.cmecodigo = this.cmecodigo;
      _ECentroCostoUsuario.idusuario = this.id_usuario;
      _ECentroCostoUsuario.detalle = [];
      registro.accion = "E";
      registro.idusuario = this.id_usuario;
      _ECentroCostoUsuario.detalle.push(registro);

      this._ServiciosUsuarios.guardarCentroCostoUsuarios(_ECentroCostoUsuario).subscribe(response => {
        this.alertSwal.title = this.TranslateUtil('key.mensaje.centro.costo.eliminado');
        this.alertSwal.show();
        this._ServiciosUsuarios.buscarCentroCostoUsuarios(_ECentroCostoUsuario).subscribe(
          response => {
            if (response != null){
              this.arregloCentroCosto = [];
              this.arregloCentroCostoPaginacion = [];
              this.arregloCentroCosto = response;
              this.arregloCentroCostoPaginacion = this.arregloCentroCosto.slice(0, 8);
            }
          },
          error => {
            console.log("Error :", error)
          }
        )
      },
        error => {
          console.log("Error :", error)
        }
      )
    }

  }



  ConfirmaEliminarRolGrilla(registro: RolesUsuarios, id: number) {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.confirmar.eliminacion.rol'),
      text: this.TranslateUtil('key.mensaje.confirmar.eliminacion'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.EliminRolDeLaGrilla(registro, id);
      }
    })
  }


  EliminRolDeLaGrilla(registro: RolesUsuarios, id: number) {

    const _ListaRolUsuario = new (EstructuraRolesUsuarios);

    if (registro.accion == "I" && id >= 0) {
      // Eliminar registro nuevo la grilla
      this.arregloRolesUsuario.splice(id, 1);
      this.arregloRolesUsuarioPaginacion = this.arregloRolesUsuario.slice(0, 8);
      this.alertSwal.title = this.TranslateUtil('key.mensaje.rol.eliminado');
      this.alertSwal.show();
    } else {


      _ListaRolUsuario.servidor = this.servidor;
      _ListaRolUsuario.hdgcodigo = this.hdgcodigo;
      _ListaRolUsuario.cmecodigo = this.cmecodigo;
      _ListaRolUsuario.idusuario = this.id_usuario;
      registro.accion = "E";
      registro.idusuario = this.id_usuario;
      _ListaRolUsuario.detalle = [];
      _ListaRolUsuario.detalle.push(registro);

      this._ServiciosUsuarios.guardarRolesUsuarios(_ListaRolUsuario).subscribe(
        response => {
          if (response != null){
            this.alertSwal.title = this.TranslateUtil('key.mensaje.rol.eliminado');
            this.alertSwal.show();
            this._ServiciosUsuarios.buscarRolesUsuarios(_ListaRolUsuario).subscribe(
              response => {
                if (response != null){
                  this.arregloRolesUsuario = [];
                  this.arregloRolesUsuarioPaginacion = [];
                  this.arregloRolesUsuario = response;
                  this.arregloRolesUsuarioPaginacion = this.arregloRolesUsuario.slice(0, 8);
                }
              },
              error => {
                console.log("Error :", error)
              }
            );
          }
        },
        error => {
          console.log("Error :", error)
        }

      )


    }



  }



  setModalMensajeExitoEliminar(numerotransaccion: number, titulo: string, mensaje: string) {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-m',
      initialState: {
        titulo: 'titulo', // Parametro para de la otra pantalla
        mensaje: 'mensaje',
        informacion: this.TranslateUtil('key.mensaje.solicitud.eliminada.es'),
        mostrarnumero: numerotransaccion,
        estado: 'CANCELADO',
      }
    };
    return dtModal;
  }






  ConfirmaModificar() {
    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.modifica.usuario'),
      text: this.TranslateUtil('key.mensaje.confirmar.modificacion.usuario'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.Modificar();
      }
    })
  }




  Modificar() {

    const _ListaRolUsuario = new (EstructuraRolesUsuarios);
    const _ECentroCostoUsuario = new (EstructuraCentroCostoUsuario);
    var modificado: boolean = false;

    _ListaRolUsuario.servidor = this.servidor;
    _ListaRolUsuario.hdgcodigo = this.hdgcodigo;
    _ListaRolUsuario.cmecodigo = this.cmecodigo;
    _ListaRolUsuario.idusuario = this.id_usuario;
    _ListaRolUsuario.detalle = [];

    this.arregloRolesUsuario.forEach(element => {
      if (element.accion == 'I') {

        _ListaRolUsuario.detalle.push(element);
      }
    });

    if (_ListaRolUsuario.detalle.length > 0) {

      this._ServiciosUsuarios.guardarRolesUsuarios(_ListaRolUsuario).subscribe(
        response => {
          if(response != null){
            modificado = true;
            this.despelgar_informacion_usuario(this.id_usuario);
          }
        },
        error => {
          console.log("Error :", error)
          modificado = false;
        }
      );
    }

    _ECentroCostoUsuario.servidor = this.servidor;
    _ECentroCostoUsuario.hdgcodigo = this.hdgcodigo;
    _ECentroCostoUsuario.cmecodigo = this.cmecodigo;
    _ECentroCostoUsuario.idusuario = this.id_usuario;
    _ECentroCostoUsuario.detalle = [];
    this.arregloCentroCosto.forEach(element => {
      if (element.accion == "I") {
        _ECentroCostoUsuario.detalle.push(element);
      }
    });

    if (_ECentroCostoUsuario.detalle.length > 0) {
      this._ServiciosUsuarios.guardarCentroCostoUsuarios(_ECentroCostoUsuario).subscribe(response => {
        modificado = true;
        this.despelgar_informacion_usuario(this.id_usuario);
      },
        error => {
          console.log("Error :", error)
        }
      )
    }




    if (modificado = true) {

      this.alertSwal.title = this.TranslateUtil('key.mensaje.usuario.modificado');
      this.alertSwal.show();
    }


  }


  pageChangedCCosto(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.arregloCentroCostoPaginacion = this.arregloCentroCosto.slice(startItem, endItem);
  }

  /* Función búsqueda con paginación */
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.arregloRolesUsuarioPaginacion = this.arregloRolesUsuario.slice(startItem, endItem);
  }

  BuscarUsuarios() {

    const _ListaRolUsuario = new (EstructuraRolesUsuarios);

    const _ECentroCostoUsuario = new (EstructuraCentroCostoUsuario);

    this._BSModalRef = this._BsModalService.show(BusquedaUsuariosComponent, this.setModalBusquedaUsuarios());

    this._BSModalRef.content.onClose.subscribe((response: EstructuraListaUsuarios) => {
      if (response == undefined) { }
      else {
        this.FormUsuarioRoles.get('id_usuario').setValue(response.userid);
        this.FormUsuarioRoles.get('rut').setValue(response.userrut);
        this.FormUsuarioRoles.get('login').setValue(response.usercode);
        this.FormUsuarioRoles.get('nombre').setValue(response.username);
        this.activaagregar = true;
        this.id_usuario = response.userid;

        this.despelgar_informacion_usuario(response.userid)



      }
    });


  }


  despelgar_informacion_usuario(id_usaurio: number) {
    const _ListaRolUsuario = new (EstructuraRolesUsuarios);

    const _ECentroCostoUsuario = new (EstructuraCentroCostoUsuario);

    _ListaRolUsuario.servidor = this.servidor;
    _ListaRolUsuario.hdgcodigo = this.hdgcodigo;
    _ListaRolUsuario.cmecodigo = this.cmecodigo;
    _ListaRolUsuario.esacodigo = this.esacodigo;
    _ListaRolUsuario.idusuario = id_usaurio;


    this._ServiciosUsuarios.buscarRolesUsuarios(_ListaRolUsuario).subscribe(
      response => {

        this.arregloRolesUsuario = [];
        this.arregloRolesUsuarioPaginacion = [];
        this.arregloRolesUsuario = response;

        this.arregloRolesUsuario.forEach(x=>{
          x.bloqcampogrilla = true;
        })
        this.arregloRolesUsuarioPaginacion = this.arregloRolesUsuario.slice(0, 8);
        this.lengthroles = this.arregloRolesUsuario.length;
      },
      error => {
        console.log("Error :", error)
      }
    )

    _ECentroCostoUsuario.servidor = this.servidor;
    _ECentroCostoUsuario.hdgcodigo = this.hdgcodigo;
    _ECentroCostoUsuario.esacodigo = this.esacodigo;
    _ECentroCostoUsuario.cmecodigo = this.cmecodigo;
    _ECentroCostoUsuario.idusuario = id_usaurio;
    _ECentroCostoUsuario.detalle = [];

    this._ServiciosUsuarios.buscarCentroCostoUsuarios(_ECentroCostoUsuario).subscribe(
      response => {
        this.arregloCentroCosto = [];
        this.arregloCentroCostoPaginacion = [];
        this.arregloCentroCosto = response;
        this.arregloCentroCosto.forEach(x=>{
          x.bloqcampogrilla = true;
        })
        this.arregloCentroCostoPaginacion = this.arregloCentroCosto.slice(0, 8);

        this.lengthcentrocosto = this.arregloCentroCosto.length;
        this.logicalength();
      },
      error => {
        console.log("Error :", error)
      }
    )

  }



  setModalBusquedaUsuarios() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.busqueda.usuarios'),
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
      }
    };
    return dtModal;
  }

  limpiar() {
    this.FormUsuarioRoles.reset();
    this.arregloRolesUsuario = [];
    this.arregloRolesUsuarioPaginacion = [];
    this.arregloCentroCosto = [];
    this.arregloCentroCostoPaginacion = [];
    this.id_usuario = 0;
    this.desactivabtnelimrol = false;
    this.desactivabtnelimccosto = false;
  }

  ActivaBotonModificar()
  {


      if (this.FormUsuarioRoles.get('id_usuario').value != null) {
      return true

    } else {
      return false
    }
  }

  async CambioCheckRol(registro: RolesUsuarios,id:number,event:any,marcacheckgrilla: boolean){
    if(event.target.checked){
      registro.marcacheckgrilla = true;
      this.desactivabtnelimrol = true;
      await this.isEliminaGrillaRol(registro)
      await this.arregloRolesUsuario.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelimrol = true;
        }
      })

    }else{
      registro.marcacheckgrilla = false;
      this.desactivabtnelimrol = false;
      await this.isEliminaGrillaRol(registro);
      await this.arregloRolesUsuario.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelimrol = true;
        }
      })

    }
  }

  isEliminaGrillaRol(registro: RolesUsuarios) {
    let indice = 0;
    for (const articulo of this.arregloRolesUsuario) {
      if (registro.codigorol === articulo.codigorol && registro.rolid === articulo.rolid) {
        articulo.marcacheckgrilla = registro.marcacheckgrilla;

        return indice;
      }
      indice++;
    }
    return -1;
  }

  ConfirmaEliminaRolDeLaGrilla() {

    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.confirmar.eliminacion.rol'),
      text: this.TranslateUtil('key.mensaje.confirmar.eliminacion'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.EliminaRolDeLaGrilla();
      }
    })
  }

  EliminaRolDeLaGrilla() {
    const _ListaRolUsuario = new (EstructuraRolesUsuarios);
    this.arregloRolesUsuarioPaginacion.forEach(registro=>{
      if (registro.accion == "I" && this.isEliminaIdRol(registro) >= 0) {
        // Eliminar registro nuevo la grilla
        if(registro.marcacheckgrilla == true){
          this.arregloRolesUsuario.splice(this.isEliminaIdRol(registro), 1);
          this.arregloRolesUsuarioPaginacion = this.arregloRolesUsuario.slice(0, 8);
          this.alertSwal.title = this.TranslateUtil('key.mensaje.rol.eliminado');
          this.alertSwal.show();
          this.logicalength();
        }
      } else {
        if(registro.marcacheckgrilla == true){

          _ListaRolUsuario.servidor = this.servidor;
          _ListaRolUsuario.hdgcodigo = this.hdgcodigo;
          _ListaRolUsuario.cmecodigo = this.cmecodigo;
          _ListaRolUsuario.idusuario = this.id_usuario;
          registro.accion = "E";
          registro.idusuario = this.id_usuario;
          _ListaRolUsuario.detalle = [];
          _ListaRolUsuario.detalle.push(registro);

          this._ServiciosUsuarios.guardarRolesUsuarios(_ListaRolUsuario).subscribe(
            response => {
              this.alertSwal.title = this.TranslateUtil('key.mensaje.rol.eliminado');
              this.alertSwal.show();
              this._ServiciosUsuarios.buscarRolesUsuarios(_ListaRolUsuario).subscribe(
                response => {
                  this.arregloRolesUsuario = [];
                  this.arregloRolesUsuarioPaginacion = [];
                  this.arregloRolesUsuario = response;
                  this.arregloRolesUsuario.forEach(x=>{
                    x.bloqcampogrilla = true;
                  })
                  this.arregloRolesUsuarioPaginacion = this.arregloRolesUsuario.slice(0, 8);
                  this.logicalength();
                },
                error => {
                  console.log("Error :", error)
                }
              )
            },
            error => {
              console.log("Error :", error)
            }

          )
        }
      }
    })
  }

  isEliminaIdRol(registro: RolesUsuarios) {

    let indice = 0;
    for (const articulo of this.arregloRolesUsuario) {
      if (registro.codigorol === articulo.codigorol) {
        return indice;
      }
      indice++;
    }
    return -1;
  }

  async CambioCheckCentroCosto(registro: CentroCostoUsuario,id:number,event:any,marcacheckgrilla: boolean){
    if(event.target.checked){
      registro.marcacheckgrilla = true;
      this.desactivabtnelimccosto = true;
      await this.isEliminaGrillaCentroCosto(registro)
      await this.arregloCentroCosto.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelimccosto = true;
        }
      })

    }else{
      registro.marcacheckgrilla = false;
      this.desactivabtnelimccosto = false;
      await this.isEliminaGrillaCentroCosto(registro);
      await this.arregloCentroCosto.forEach(d=>{
        if(d.marcacheckgrilla === true){
          this.desactivabtnelimccosto = true;
        }
      })

    }
  }

  isEliminaGrillaCentroCosto(registro: CentroCostoUsuario) {
    let indice = 0;
    for (const articulo of this.arregloCentroCosto) {
      if (registro.idcentrocosto === articulo.idcentrocosto ) {
        articulo.marcacheckgrilla = registro.marcacheckgrilla;
        return indice;
      }
      indice++;
    }
    return -1;
  }

  ConfirmaEliminaCentroCostoDeLaGrilla() {

    const Swal = require('sweetalert2');
    Swal.fire({
      title: this.TranslateUtil('key.mensaje.pregunta.confirmar.eliminacion.centro.costo'),
      text: this.TranslateUtil('key.mensaje.confirmar.eliminacion'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.EliminaCentroCostoDeLaGrilla();
      }
    })
  }

  EliminaCentroCostoDeLaGrilla() {
    const _ECentroCostoUsuario = new (EstructuraCentroCostoUsuario);
    this.arregloCentroCostoPaginacion.forEach(registro=>{
      if (registro.accion == "I" && this.isEliminaIdCentroCosto(registro) >= 0) {
        // Eliminar registro nuevo la grilla
        if(registro.marcacheckgrilla ===true){
          this.desactivabtnelimccosto = false;
          this.arregloCentroCosto.splice(this.isEliminaIdCentroCosto(registro), 1);
          this.arregloCentroCostoPaginacion = this.arregloCentroCosto.slice(0, 8);
          this.alertSwal.title = this.TranslateUtil('key.mensaje.centro.costo.eliminado.usuario');
          this.alertSwal.show();
          this.logicalength();
        }
      } else {
        if(registro.marcacheckgrilla ===true){
          this.desactivabtnelimccosto = false;
          _ECentroCostoUsuario.servidor = this.servidor;
          _ECentroCostoUsuario.hdgcodigo = this.hdgcodigo;
          _ECentroCostoUsuario.esacodigo = this.esacodigo;
          _ECentroCostoUsuario.cmecodigo = this.cmecodigo;
          _ECentroCostoUsuario.idusuario = this.id_usuario;
          _ECentroCostoUsuario.detalle = [];
          registro.accion = "E";
          registro.idusuario = this.id_usuario;
          _ECentroCostoUsuario.detalle.push(registro);

          this._ServiciosUsuarios.guardarCentroCostoUsuarios(_ECentroCostoUsuario).subscribe(response => {
            this.alertSwal.title = this.TranslateUtil('key.mensaje.centro.costo.eliminado');
            this.alertSwal.show();
            this._ServiciosUsuarios.buscarCentroCostoUsuarios(_ECentroCostoUsuario).subscribe(
              response => {
                this.arregloCentroCosto = [];
                this.arregloCentroCostoPaginacion = [];
                this.arregloCentroCosto = response;
                this.arregloCentroCosto.forEach(x=>{
                  x.bloqcampogrilla = true;
                })
                this.arregloCentroCostoPaginacion = this.arregloCentroCosto.slice(0, 8);
                this.logicalength();
              },
              error => {
                console.log("Error :", error)
              }
            )
          },
            error => {
              console.log("Error :", error)
            }
          )
        }
      }
    })

  }

  isEliminaIdCentroCosto(registro: CentroCostoUsuario) {

    let indice = 0;
    for (const articulo of this.arregloCentroCosto) {
      if (registro.idcentrocosto === articulo.idcentrocosto) {
        return indice;
      }
      indice++;
    }
    return -1;
  }

  async logicalength(){
    await this.NuevosRegistrosRoles();
    await this.NuevosRegistrosCentros();

    if(this.vaciosroles === true && this.vacioscentro === true){
      this.verificanull = false;

    }else{
      if (this.vaciosroles === true && this.vacioscentro === false){
        this.verificanull = true;

      }else {
        if(this.vaciosroles === false && this.vacioscentro === true){
          this.verificanull = true;

        }else{
          if(this.vaciosroles)
          this.verificanull = true;
        }
      }
    }
  }

  NuevosRegistrosRoles(){
    if(this.arregloCentroCosto.length ===this.lengthcentrocosto ){
      this.vacioscentro = true;

      return
    }else{
      this.vacioscentro = false;

    }

  }

  NuevosRegistrosCentros(){
    if(this.arregloRolesUsuario.length === this.lengthroles){
      this.vaciosroles = true;

      return;
    }else{
      this.vaciosroles = false;

    }
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
