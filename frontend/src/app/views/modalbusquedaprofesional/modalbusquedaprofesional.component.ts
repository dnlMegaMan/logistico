import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Subject} from 'rxjs';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

import { SolicitudService } from '../../servicios/Solicitudes.service';
import { TipoambitoService } from '../../servicios/tiposambito.service';
import { DocidentificacionService } from '../../servicios/docidentificacion.service';

import { DatosProfesional } from 'src/app/models/entity/DatosProfesional';
import { DocIdentificacion } from '../../models/entity/DocIdentificacion';
import { DevuelveDatosUsuario } from '../../models/entity/DevuelveDatosUsuario';

@Component({
  selector: 'app-modalbusquedaprofesional',
  templateUrl: './modalbusquedaprofesional.component.html',
  styleUrls: ['./modalbusquedaprofesional.component.css']
})
export class ModalbusquedaprofesionalComponent implements OnInit {

  @Input() titulo        : string;
  @Input() tipodocumento : number;
  @Input() numidentificacion: string;
  @Input() nombres       : string;
  @Input() apepaterno    : string;
  @Input() apematerno    : string;

  public FormBuscaProfesional: FormGroup;
  public alerts             : Array<any> = [];
  public loading            = false;
  public docsidentis        : Array<DocIdentificacion> = [];
  public datosprofesionales : Array<DatosProfesional> = [];
  public datosprofesionalesPaginacion: Array<DatosProfesional> = [];
  public onClose            : Subject<DatosProfesional>;
  public servidor           = environment.URLServiciosRest.ambiente;
  public usuario            = environment.privilegios.usuario;
  public hdgcodigo          : number;
  public esacodigo          : number;
  public cmecodigo          : number;
  public activabtnbuscar    = false;

  constructor(
    public formBuilder              : FormBuilder,
    public _tipoambitoService       : TipoambitoService,
    public solicitudesService       : SolicitudService,
    public DocidentificacionService : DocidentificacionService,
    public bsModalRef               : BsModalRef,

  ) {

    this.FormBuscaProfesional = this.formBuilder.group({
      apellidopaterno : [{ value: null, disabled: false }, Validators.required],
      apellidomaterno : [{ value: null, disabled: false }, Validators.required],
      nombresmedico   : [{ value: null, disabled: false }, Validators.required],
      tipoidentificacion  : [{ value: null, disabled: false }, Validators.required],
      numeroidentificacion: [{ value: null, disabled: false }, Validators.required],
    })
   }

  ngOnInit() {

    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();

    this.onClose = new Subject();

    if(this.tipodocumento != null || this.numidentificacion != null || this.nombres != null
      || this.apepaterno || this.apematerno!= null){

      this.FormBuscaProfesional.controls['tipoidentificacion'].setValue(this.tipodocumento);
      this.FormBuscaProfesional.controls['numeroidentificacion'].setValue(this.numidentificacion);
      this.FormBuscaProfesional.controls['nombresmedico'].setValue(this.nombres);
      this.FormBuscaProfesional.controls['apellidopaterno'].setValue(this.apepaterno);
      this.FormBuscaProfesional.controls['apellidomaterno'].setValue(this.apematerno);
      this.activabtnbuscar = true;
      this.BuscarProfesional();

    }

    this.getParametros();
    this.datosUsuario();
  }

  async getParametros() {
    try {
      this.loading = true;
      this.docsidentis = await this.DocidentificacionService.list(this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo, this.usuario, this.servidor, localStorage.getItem('language'), true)
        .toPromise();

    } catch (err) {
      this.loading = false;
      this.uimensaje('danger', err.message, 7000);
    }
    this.loading = false;
  }

  uimensaje(status: string, texto: string, time: number = 0) {
    this.alerts = [];
    if (time !== 0) {
      this.alerts.push({
        type: status,
        msg: texto,
        timeout: time
      });
    } else {
      this.alerts.push({
        type: status,
        msg: texto
      });
    }
  }

  datosUsuario() {
    var datosusuario = new DevuelveDatosUsuario();
    datosusuario = JSON.parse(sessionStorage.getItem('Login'));
    this.hdgcodigo = datosusuario[0].hdgcodigo;
    this.esacodigo = datosusuario[0].esacodigo;
    this.cmecodigo = datosusuario[0].cmecodigo;
  }

  ActivaBotonBuscar(){
    this.activabtnbuscar = true;
  }

  BuscarProfesional(){

    this.solicitudesService.BuscaProfesional(this.servidor,this.tipodocumento,
      this.numidentificacion,this.apepaterno,this.apematerno,this.nombres).subscribe(
      response => {
        if (response != null) {
          this.datosprofesionales = response;
          this.datosprofesionalesPaginacion = this.datosprofesionales.slice (0,20);
        }
      }
    )
  }

  BuscarProfesionalDesdeModal(){

    this.solicitudesService.BuscaProfesional(this.servidor,
      this.FormBuscaProfesional.controls.tipoidentificacion.value,
      this.FormBuscaProfesional.controls.numeroidentificacion.value,
      this.FormBuscaProfesional.controls.apellidopaterno.value,
      this.FormBuscaProfesional.controls.apellidomaterno.value,
      this.FormBuscaProfesional.controls.nombresmedico.value).subscribe(
      response => {
        if (response != null) {
          this.datosprofesionales = response;
          this.datosprofesionalesPaginacion = this.datosprofesionales.slice (0,20);
        }
      }
    )
  }

  onCerrar(profesional: DatosProfesional){
    this.onClose.next(profesional);
    this.bsModalRef.hide();
  }

  onCerrarSalir(){
    this.bsModalRef.hide();
  };

   /* Función búsqueda con paginación */
   pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.datosprofesionalesPaginacion = this.datosprofesionales.slice(startItem, endItem);
  }

  Limpiar(){
    this.FormBuscaProfesional.reset();
    this.datosprofesionales = [];
    this.datosprofesionalesPaginacion = [];
  }

}
