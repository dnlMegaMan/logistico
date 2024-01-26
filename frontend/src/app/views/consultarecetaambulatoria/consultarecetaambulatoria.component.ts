import { Component, OnInit,ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { AlertComponent } from 'ngx-bootstrap/alert/alert.component';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { ListaPacientes } from 'src/app/models/entity/ListaPacientes';
import { Solicitud } from '../../models/entity/Solicitud';
import { BusquedapacientesComponent } from '../busquedapacientes/busquedapacientes.component';
import { SolicitudService } from '../../servicios/Solicitudes.service';
import { ConsultaRecetaProgramada } from 'src/app/models/entity/ConsultaRecetaProgramada';
import { InformesService } from '../../servicios/informes.service';
import { DetalleRecetaProg } from 'src/app/models/entity/DetalleRecetaProg';
import { Router } from '@angular/router';
import { Paciente } from 'src/app/models/entity/Paciente';
import { Permisosusuario } from '../../permisos/permisosusuario';

@Component({
  selector: 'app-consultarecetaambulatoria',
  templateUrl: './consultarecetaambulatoria.component.html',
  styleUrls: ['./consultarecetaambulatoria.component.css'],
  providers: [InformesService]
})
export class ConsultarecetaambulatoriaComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;
  @ViewChild('alertSwalGrilla', { static: false }) alertSwalGrilla: SwalComponent;

  public loading = false;
  public modelopermisos : Permisosusuario = new Permisosusuario();
  public servidor = environment.URLServiciosRest.ambiente;
  public usuario = environment.privilegios.usuario;
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public imprimeconsulta : boolean = false;
  public buscapac : boolean = false;
  public FormConsultaReceta: FormGroup;
  private _BSModalRef: BsModalRef;
  public _paciente: ListaPacientes = new ListaPacientes();
  public pacientehosp : Paciente = new Paciente();
  public dataPacienteSolicitud: Solicitud = new Solicitud();
  public consultasrecetasprogs : ConsultaRecetaProgramada[] = [];
  public consultasrecetasprogspaginacion : ConsultaRecetaProgramada[] = [];
  public detallesrecetas : Array<DetalleRecetaProg> = [];
  public detallesrecetaspaginacion : Array<DetalleRecetaProg> =[];

  constructor(
    public formBuilder      : FormBuilder,
    public _solicitudService: SolicitudService,
    public _BsModalService  : BsModalService,
    private router          : Router,
    private _imprimelibroService  : InformesService

  ) {

    this.FormConsultaReceta = this.formBuilder.group({
      tipodocumento         : [{ value: null, disabled: true }, Validators.required],
      numidentificacion     : [{ value: null, disabled: true }, Validators.required],
      numcuenta             : [{ value: null, disabled: true }, Validators.required],
      nombrepaciente        : [{ value: null, disabled: true }, Validators.required],
      numidentificacionmedico:[{ value: null, disabled: true }, Validators.required],
      nombremedico          : [{ value: null, disabled: true }, Validators.required],
      edad                  : [{ value: null, disabled: true }, Validators.required],
      // unidad                : [{ value: null, disabled: true }, Validators.required],
      // sexo                  : [{ value: null, disabled: true }, Validators.required],
      // ambito                : [{ value: 3, disabled: false }, Validators.required],
      // estado                : [{ value: 1, disabled: false }, Validators.required],
      numsolicitud          : [{ value: null, disabled: true }, Validators.required],
      // pieza                 : [{ value: null, disabled: true }, Validators.required],
      // cama                  : [{ value: null, disabled: true }, Validators.required],
      fechahora             : [new Date(), Validators.required],
      // ubicacion             : [{ value: null, disabled: true }, Validators.required],
      medico                : [{ value: null, disabled: true }, Validators.required],
      numeroboleta          : [{ value: null, disabled: false }, Validators.required],
      numeroreceta          : [{ value: null, disabled: false }, Validators.required],
      // comprobantecaja       : [{ value: null, disabled: false }, Validators.required],
      // estadocomprobantecaja : [{ value: null, disabled: false }, Validators.required],
      // entrega               : [{ value: null, disabled: false }, Validators.required],
      marcacheck            : [{ value: null, disabled: false }, Validators.required],
      codigodiasentrega     : [{ value: null, disabled: false}, Validators.required]
    });
  }

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
  }


  limpiar(){
    this.consultasrecetasprogspaginacion = [];
    this.consultasrecetasprogs = [];
    this.FormConsultaReceta.reset();
    this.imprimeconsulta = false;
    this.buscapac = false;
  }

  BuscarPaciente() {

    this._BSModalRef = this._BsModalService.show(BusquedapacientesComponent, this.setModal("Busqueda de Paciente"));
    this._BSModalRef.content.onClose.subscribe((Retorno: any) => {
      if (Retorno !== undefined) {

        // console.log("Paciente buscado",Retorno);
        if(Retorno.codambito ==1){
          this._paciente = Retorno
          this.dataPacienteSolicitud = new Solicitud();
          this.dataPacienteSolicitud.cliid = this._paciente.cliid;
          this.dataPacienteSolicitud.tipodocpac = this._paciente.tipoidentificacion;
          this.dataPacienteSolicitud.numdocpac = this._paciente.docuidentificacion;
          this.dataPacienteSolicitud.descidentificacion = this._paciente.descidentificacion;
          this.dataPacienteSolicitud.apepaternopac = this._paciente.paterno;
          this.dataPacienteSolicitud.apematernopac = this._paciente.materno;
          this.dataPacienteSolicitud.nombrespac = this._paciente.nombres;
          this.dataPacienteSolicitud.codambito = 1;
          this.dataPacienteSolicitud.edad = this._paciente.edad;
          this.dataPacienteSolicitud.codsexo = 1; //this._paciente.codsexo;
          this.dataPacienteSolicitud.ppnpaciente = this._paciente.cliid;
          this.dataPacienteSolicitud.glsexo = this._paciente.glsexo;
          this.dataPacienteSolicitud.glstipidentificacion = this._paciente.descidentificacion;
          this.FormConsultaReceta.get('tipodocumento').setValue(this.dataPacienteSolicitud.descidentificacion);
          this.FormConsultaReceta.get('numidentificacion').setValue(this.dataPacienteSolicitud.numdocpac);
          this.FormConsultaReceta.get('nombrepaciente').setValue(this.dataPacienteSolicitud.nombrespac.concat(" ")
            .concat(this.dataPacienteSolicitud.apepaternopac).concat(" ")
            .concat(this.dataPacienteSolicitud.apematernopac));

        }else{
          if(Retorno.codambito == 3){
            this.pacientehosp = Retorno
            this.dataPacienteSolicitud = new Solicitud();
            this.dataPacienteSolicitud.cliid = this.pacientehosp.cliid;
            this.dataPacienteSolicitud.tipodocpac = this.pacientehosp.tipoidentificacion;
            this.dataPacienteSolicitud.numdocpac = this.pacientehosp.numdocpac;
            this.dataPacienteSolicitud.descidentificacion = this.pacientehosp.descidentificacion;
            this.dataPacienteSolicitud.apepaternopac = this.pacientehosp.apepaternopac;
            this.dataPacienteSolicitud.apematernopac = this.pacientehosp.apematernopac;
            this.dataPacienteSolicitud.nombrespac = this.pacientehosp.nombrespac;
            this.dataPacienteSolicitud.codambito = 3;
            this.dataPacienteSolicitud.edad = this.pacientehosp.edad;
            this.dataPacienteSolicitud.codsexo = 1; //this._paciente.codsexo;
            this.dataPacienteSolicitud.ppnpaciente = this.pacientehosp.cliid;
            this.dataPacienteSolicitud.glsexo = this.pacientehosp.sexo;
            this.dataPacienteSolicitud.glstipidentificacion = this.pacientehosp.glstipidentificacion;
            this.FormConsultaReceta.get('tipodocumento').setValue(this.dataPacienteSolicitud.glstipidentificacion);
            this.FormConsultaReceta.get('numidentificacion').setValue(this.dataPacienteSolicitud.numdocpac);
            this.FormConsultaReceta.get('nombrepaciente').setValue(this.dataPacienteSolicitud.nombrespac.concat(" ")
              .concat(this.dataPacienteSolicitud.apepaternopac).concat(" ")
              .concat(this.dataPacienteSolicitud.apematernopac));
          }
        }

        this._solicitudService.ConsultaRecetaProgramada(this.hdgcodigo,this.esacodigo,this.cmecodigo,
        this.servidor,this.usuario,this.dataPacienteSolicitud.cliid).subscribe(
          response => {
            if (response != null){
              this.consultasrecetasprogs = response;
              this.consultasrecetasprogspaginacion = this.consultasrecetasprogs.slice(0,20);
              this.imprimeconsulta = true;
            }
          });
      }
    }
    )
  }

  setModal(titulo: string) {
    // console.log("Datos a buscar paciente,", this.hdgcodigo,this.esacodigo,this.cmecodigo,this.dataPacienteSolicitud.cliid,
    // this.dataPacienteSolicitud.tipodocpac,this.dataPacienteSolicitud.numdocpac)
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
        cliid: 0,//this.dataPacienteSolicitud.cliid,
        ambito: 1,
        // tipodocumeto: null,//this.dataPacienteSolicitud.tipodocpac,
        numeroidentificacion: 0// this.dataPacienteSolicitud.numdocpac,

      }
    };
    return dtModal;
  }

  /* Función búsqueda con paginación */
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.consultasrecetasprogspaginacion = this.consultasrecetasprogs.slice(startItem, endItem);
  }

  cambio_check(texto: string, event: any,marca: string){

    if(event.target.checked){
      this.loading = true;
      this._solicitudService.ConsultaRecetaProgramada(this.hdgcodigo,this.esacodigo,this.cmecodigo,
        this.servidor,this.usuario,0).subscribe(
          response => {
            if (response != null){
              this.consultasrecetasprogs = response;
              this.consultasrecetasprogspaginacion = this.consultasrecetasprogs.slice(0,20);
              this.FormConsultaReceta.reset();
              event.target.checked = true;
              this.imprimeconsulta = true;
              this.buscapac = true;
              this.dataPacienteSolicitud.cliid=0;
              this.loading = false;
            } else {
              this.loading = false;
            }
          }
        )
    }else{
        this.consultasrecetasprogs = [];
        this.consultasrecetasprogspaginacion = [];
        //this.dataPacienteSolicitud = null;<-Genera Error
        this.buscapac = false;
        this.imprimeconsulta = false;

    }

  }

  ConfirmaVerSolicitud(detalle: ConsultaRecetaProgramada,id: number){

    this.detallesrecetas = detalle.detallerecetaprog;
    this.detallesrecetaspaginacion = this.detallesrecetas.slice(0,20);

    this.alertSwalGrilla.reverseButtons = true;
    this.alertSwalGrilla.title = 'Detalle Consulta Receta';
    this.alertSwalGrilla.show();

  }

  onCancel() {
    // this.solicitudseleccion = [];
  }

  OnConfirm(){

  }

  DespacharRecetaAmbulatoria(detalle:ConsultaRecetaProgramada ,id: number){

    this.router.navigate(['despachorecetasambulatoria',detalle.soliid,detalle.solicodambito,detalle.solicodambito, 'consultarecetasambulatoria']);
  }

  ConfirmaImprimir(tiporeporte: string){
    const Swal = require('sweetalert2');
    Swal.fire({
      title: '¿Desea Imprimir Consulta?',
      text: "Confirmar Impresión",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        this.ImprimirLibro(tiporeporte);
      }
    })

  }

  ImprimirLibro(tiporeporte: string) {


    if(tiporeporte=="pdf"){
      // console.log("Entra al pdf",this.imprimeconsulta)
      if( this.dataPacienteSolicitud.cliid >0){

        this._imprimelibroService.RPTImprimeConsultaRecetaAmbulatoria(this.servidor,this.usuario,
          this.hdgcodigo,this.esacodigo, this.cmecodigo,"pdf",
          this.dataPacienteSolicitud.cliid).subscribe(
            response => {
              if (response != null){
                window.open(response[0].url, "", "", true);
                // this.alertSwal.title = "Reporte Impreso Correctamente";
                // this.alertSwal.show();
              }
            },
            error => {
              console.log(error);
              this.alertSwalError.title = "Error al Imprimir";
              this.alertSwalError.show();
              this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
              })
            }
          );
      }

      else{
        if( this.imprimeconsulta == true || this.dataPacienteSolicitud.cliid ==0){

          this._imprimelibroService.RPTImprimeConsultaRecetaAmbulatoria(this.servidor,this.usuario,
            this.hdgcodigo,this.esacodigo, this.cmecodigo,"pdf",0).subscribe(
              response => {
                if (response != null){
                  window.open(response[0].url, "", "", true);
                  // this.alertSwal.title = "Reporte Impreso Correctamente";
                  // this.alertSwal.show();
                }
              },
              error => {
                console.log(error);
                this.alertSwalError.title = "Error al Imprimir";
                this.alertSwalError.show();
                this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
                })
              }
            );
      }
      // this.imprimeconsulta = false
    }
    }
      // else{
    //   if(tiporeporte == "xls"){
    //     console.log("Imprime reporte en excel",tiporeporte)
    //     this._imprimelibroService.RPTImprimeLibroControlado(this.servidor,this.usuario,
    //     this.hdgcodigo,this.esacodigo, this.cmecodigo,"xls",this.periodo,
    //     this.FormConsultaLibroControlado.value.bodcodigo,this.meinid).subscribe(
    //       response => {
    //         console.log("Imprime Solicitud", response);
    //         window.open(response[0].url, "", "", true);
    //         // this.alertSwal.title = "Reporte Impreso Correctamente";
    //         // this.alertSwal.show();
    //       },
    //       error => {
    //         console.log(error);
    //         this.alertSwalError.title = "Error al Imprimir Devolución Solicitud";
    //         this.alertSwalError.show();
    //         this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
    //         })
    //       }
    //     );
    //   }
    // }

  }

}
