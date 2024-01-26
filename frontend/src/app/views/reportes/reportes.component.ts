import { Component, OnInit,ViewChild } from '@angular/core';
import { AlertComponent } from 'ngx-bootstrap/alert/alert.component';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BusquedaSolicitudPacienteAmbulatorioComponent } from '../busqueda-solicitud-paciente-ambulatorio/busqueda-solicitud-paciente-ambulatorio.component';
import { SolicitudService } from '../../servicios/Solicitudes.service';
import { Solicitud } from '../../models/entity/Solicitud';
import { BusquedasolicitudesComponent } from '../busquedasolicitudes/busquedasolicitudes.component';
import { BusquedasolicitudpacientesComponent } from '../busquedasolicitudpacientes/busquedasolicitudpacientes.component';
import { InformesService } from '../../servicios/informes.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css'],
  providers: [InformesService]
})
export class ReportesComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;

  public FormReportes: FormGroup;
  public usuario            = environment.privilegios.usuario;
  public servidor           = environment.URLServiciosRest.ambiente;
  public hdgcodigo          : number;
  public esacodigo          : number;
  public cmecodigo          : number;
  public solicitud          : number;
  public loading            = false;
  private _BSModalRef       : BsModalRef;
  public _Solicitud         : Solicitud;
  public activabtnbuscar    : boolean = false;
  public activasolicitud    : boolean = true;
  public activatiporeporte  : boolean = false;
  public tiporeporte        : boolean = false;
  public activabtnimprime   : boolean = false;
  public selectiposolicitud : boolean = false;
  public codtiporeporte     : number;


  constructor(
    public formBuilder                : FormBuilder,
    public _BsModalService            : BsModalService,
    public _solicitudService          : SolicitudService,
    private _imprimesolicitudService: InformesService,
    public translate: TranslateService
  ) {
    this.FormReportes = this.formBuilder.group({
      numsolicitud            : [{ value: null, disabled: false }, Validators.required],
      tiporeporte             : [{ value: null, disabled: false }, Validators.required],
      tiposolicitud           : [{ value: null, disabled: false }, Validators.required],
      estado                  : [{ value: null, disabled: true }, Validators.required],
      bodorigen               : [{ value: null, disabled: true }, Validators.required],
      boddestino              : [{ value: null, disabled: true }, Validators.required],
      nombrepaciente          : [{ value: null, disabled: true }, Validators.required],
      nombremedico            : [{ value: null, disabled: true }, Validators.required],
      identipaciente          : [{ value: null, disabled: true }, Validators.required],
      numdocprof              : [{ value: null, disabled: true }, Validators.required],

      numidentificacion       : [{ value: null, disabled: true }, Validators.required],
      numcuenta               : [{ value: null, disabled: true }, Validators.required],


      ambito                  : [{ value: 3, disabled: false }, Validators.required],

      fechahora               : [new Date(), Validators.required],

      servicio                : [{ value: null, disabled: true }, Validators.required],

    });

   }

  ngOnInit() {

    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();

    this.FormReportes.controls.numsolicitud.disable();
    this.FormReportes.controls.tiporeporte.disable();

  }

  limpiar(){
    this.FormReportes.reset();
    this.activabtnbuscar = false;
    this.FormReportes.controls.numsolicitud.disable();
    this.FormReportes.controls.tiporeporte.disable();
    this.activabtnimprime = false;
  }

  SeleccionaTipoSolicitud(tiposolicitud:number){
    if(tiposolicitud == 0){
      this.activabtnbuscar = true;
      this.FormReportes.controls.numsolicitud.enable();
      this.FormReportes.controls.tiporeporte.enable();
      this.selectiposolicitud = false;
      this.tiporeporte = true;
    }
    if(tiposolicitud == 1){
      this.activabtnbuscar = true;
      this.tiporeporte = false;
      this.activatiporeporte = false;
      this.FormReportes.controls.numsolicitud.enable();
      this.FormReportes.controls.tiporeporte.enable();
      this.selectiposolicitud = true;
    }

  }

  ActivaImprimir(){
    this.activabtnimprime= true;

  }
  getSolicitud(solicitud: any,tiposolicitud:number, solic:number) {
    this.solicitud = parseInt(solicitud);
    this.loading = true;
    console.log(this.solicitud,tiposolicitud,solicitud,solic);
    if(this.solicitud >0){
      if(tiposolicitud == 0){
        this._solicitudService.BuscaSolicitud(this.solicitud, this.hdgcodigo,this.esacodigo,
          this.cmecodigo, 0, "", "", 0, 0, 0, this.servidor, 0, 0, 0, 0, 0, 0, "",0,"","").subscribe(
            response => {
              if (response != null) {
                if(response.length==0){
                  this.alertSwalError.title = this.TranslateUtil('key.mensaje.no.existe.solicitud.buscada');
                  this.alertSwalError.show();
                  this.loading = false;
                }else{
                  this.FormReportes.get('numsolicitud').setValue(response[0].soliid);
                  this.FormReportes.get('bodorigen').setValue(response[0].bodorigendesc);
                  this.FormReportes.get('boddestino').setValue(response[0].boddestinodesc);
                  this.FormReportes.get('estado').setValue(response[0].estadosolicitudde);
                  this.codtiporeporte = 0;
                  this.activabtnimprime= true;
                  this.loading = false;
                }
              }
            }
          )
      }else{
        if(tiposolicitud == 1){
          this._solicitudService.BuscaSolicitud(this.solicitud, this.hdgcodigo,
            this.esacodigo, this.cmecodigo, 0, null, null, 0, 0, null, this.servidor,
            0, 3, 0, 0, 0, 0, null,0,"","").subscribe((Retorno: any) => {
              if(Retorno.length ==0){
                this.alertSwalError.title = this.TranslateUtil('key.mensaje.no.existe.solicitud.buscada');
                this.alertSwalError.show();
                this.loading = false;
              }else{
                if (Retorno !== undefined) {
                  // this.existsolicitud = true;
                  // this.agregarproducto = true;
                  this.loading = false;
                  this.FormReportes.get('numsolicitud').setValue(Retorno[0].soliid);
                  this.FormReportes.get('estado').setValue(Retorno[0].estadosolicitudde);
                  this.FormReportes.get('numdocprof').setValue(Retorno[0].numdocprof);
                  this.FormReportes.get('nombremedico').setValue(Retorno[0].nombremedico);
                  this.FormReportes.get('identipaciente').setValue(Retorno[0].glstipidentificacion.concat(" ").concat(Retorno.numdocpac) )
                  this.FormReportes.get('nombrepaciente').setValue(Retorno[0].nombrespac.concat(" ")
                    .concat(Retorno.apepaternopac).concat(" ").concat(Retorno[0].apematernopac));
                    this.codtiporeporte = 5;
                    this.activabtnimprime= true;
                }
              }
            })
        }
      }
    }else{
      console.log("no hay num")
      this.BuscarSolicitud(tiposolicitud);
    }


      // this.loading = true;



  }

  BuscarSolicitud(tiposolicitud: number){
    if(tiposolicitud ==0){
      this._BSModalRef = this._BsModalService.show(BusquedasolicitudesComponent, this.setModalBusquedaSolicitud());
      this._BSModalRef.content.onClose.subscribe((response_cabecera: Solicitud) => {
        if (response_cabecera == undefined || response_cabecera == null) {this.loading = false;}
          else {
            this.loading = true;
            this._solicitudService.BuscaSolicitud(response_cabecera.soliid, this.hdgcodigo,
            this.esacodigo, this.cmecodigo, 0, "", "", 0, 0, 0, this.servidor, 0, 0, 0, 0, 0, 0,
             "",0,"","").subscribe(
              response => {
                if (response != null) {
                  this.FormReportes.get('numsolicitud').setValue(response[0].soliid);
                  this.FormReportes.get('bodorigen').setValue(response[0].bodorigendesc);
                  this.FormReportes.get('boddestino').setValue(response[0].boddestinodesc);
                  this.FormReportes.get('estado').setValue(response[0].estadosolicitudde);
                  this.codtiporeporte = 0;
                  this.activabtnimprime= true;
                }
                this.loading = false;
              }
            )
          }
        }
      )

    }else{

      if(tiposolicitud == 1){
        this._BSModalRef = this._BsModalService.show(BusquedasolicitudpacientesComponent, this.setModal("Busqueda Solicitudes Paciente: "));
        this._BSModalRef.content.onClose.subscribe((Retorno: any) => {
          if (Retorno !== undefined) {
            this.FormReportes.get('numsolicitud').setValue(Retorno.soliid);
            this.FormReportes.get('estado').setValue(Retorno.estadosolicitudde);
            this.FormReportes.get('numdocprof').setValue(Retorno.numdocprof);
            this.FormReportes.get('nombremedico').setValue(Retorno.nombremedico);
            this.FormReportes.get('identipaciente').setValue(Retorno.glstipidentificacion.concat(" ").concat(Retorno.numdocpac) )
            this.FormReportes.get('nombrepaciente').setValue(Retorno.nombrespac.concat(" ")
              .concat(Retorno.apepaternopac).concat(" ").concat(Retorno.apematernopac));
              this.codtiporeporte = 5;
              this.activabtnimprime= true;
            // this.cargaSolicitud(Retorno.soliid);
          }
          this.loading = false;
        })
      }
    }
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
        tipo_busqueda: 'Medicamentos',
        id_Bodega: 0,
        cliid: 0,
        ambito: 3,
        nombrepaciente: null,
        apepaternopac: null,
        apematernopac: null,
        codservicioactual: 0,
        tipodocumento: null,
        numeroidentificacion: null,
        buscasolicitud: "Dipensar_Solicitud",
        paginaorigen: 10
        // tipodocumeto: this.dataPacienteSolicitud.tipodocpac,
        // numeroidentificacion: this.dataPacienteSolicitud.numdocpac,
        // origen: 'Solicitud_Receta'

      }
    };
    return dtModal;
  }

  setModalBusquedaSolicitud() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: 'Búsqueda de Solicitudes', // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        origen: 'Otros'
      }
    };
    return dtModal;
  }


  ConfirmarImpresion() {
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
    })

  }

  ImprimirSolicitud() {
    // switch (parseInt(this.FormReportes.value.tiporeporte)) {
    switch (this.codtiporeporte) {
      case 0: //Solicitud Bodega
        this._imprimesolicitudService.RPTImprimeSolicitudBodega(this.servidor, this.hdgcodigo, this.esacodigo,
          this.cmecodigo, "pdf", this.FormReportes.value.numsolicitud).subscribe(
            response => {
              if (response != null) {
                window.open(response[0].url, "", "", true);
              }
            },
            error => {
              console.log(error);
              this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.listado');
              this.alertSwalError.show();
              this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
              })
            }
          );
            //  console.log("Entra a caso Autopedido", idOrigen)
          break;
      case 1:  //DEspacho Bodega
        this._imprimesolicitudService.RPTImprimeSolicitudDespachoBodega(this.servidor, this.hdgcodigo, this.esacodigo,
          this.cmecodigo, "pdf", this.FormReportes.value.numsolicitud).subscribe(
            response => {
              if (response != null) {
                window.open(response[0].url, "", "", true);
              }
            },
            error => {
              console.log(error);
              this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.despacho.solicitud');
              this.alertSwalError.show();
              this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
              })
            }
          );
        break;
      case 2: // Recepcion Bodega
        this._imprimesolicitudService.RPTImprimeSolicitudRecepcionDespBodega(this.servidor,this.hdgcodigo,
          this.esacodigo, this.cmecodigo,"pdf",this.FormReportes.value.numsolicitud).subscribe(
            response => {
              if (response != null) {
                window.open(response[0].url, "", "", true);
              }
            },
            error => {
              console.log(error);
              this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.listado');
              this.alertSwalError.show();
              this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
              })
            }
          );
          break;
      case 3: // Devolucion Bodega
      this._imprimesolicitudService.RPTImprimeDevolucionSolicitudBodega(this.servidor,this.hdgcodigo,this.esacodigo,
        this.cmecodigo,"pdf",this.FormReportes.value.numsolicitud).subscribe(
          response => {
            if (response != null) {
              window.open(response[0].url, "", "", true);
            }
          },
          error => {
            console.log(error);
            this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.devolucion.solicitud');
            this.alertSwalError.show();
            this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
            })
          }
        );
        break;
      case 4: // Recepcion Devolucion Bodega
        this._imprimesolicitudService.RPTImprimeRecepDevolSolicitudBodega(this.servidor,this.hdgcodigo,this.esacodigo,
          this.cmecodigo,"pdf", this.FormReportes.value.numsolicitud,this.usuario).subscribe(
            response => {
              if (response != null) {
                window.open(response[0].url, "", "", true);
              }
            },
            error => {
              console.log(error);
              this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.recepcion.devolucion.solicitud');
              this.alertSwalError.show();
              this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
              })
            }
          );
        break;
      case 5:
        this._imprimesolicitudService.RPTImprimeSolicitud(this.servidor, this.hdgcodigo, this.esacodigo,
        this.cmecodigo, "pdf", this.FormReportes.value.numsolicitud, 3).subscribe(
          data => {
            console.log("reporte pac",data)
            window.open(data[0].url, "", "", true);
          },
          error => {
            this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.solicitud');
            this.alertSwalError.show();
            this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
            })
          }
        );
        break;
      case 6:
          this._imprimesolicitudService.RPTImprimeSolicitudDespachada(this.servidor, this.hdgcodigo,
          this.esacodigo,this.cmecodigo, "pdf", this.FormReportes.value.numsolicitud,3).subscribe(
              response => {
                if (response != null) {
                  window.open(response[0].url, "", "", true);
                }
              },
              error => {

                this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.despacho.solicitud.paciente');
                this.alertSwalError.show();
                this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
                })
              }
            );

              break;
      case 7:
          this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.recepcion.devolucion.solicitud.paciente');
          this.alertSwalError.show();
      break;
      case 8:
        this._imprimesolicitudService.RPTImprimeSolicitudDespachoReceta(this.servidor,this.usuario,
          this.hdgcodigo, this.esacodigo,this.cmecodigo, "pdf",1, this.FormReportes.value.numsolicitud,0).subscribe(
            response => {
              if (response != null) {
                window.open(response[0].url, "", "", true);
              }
            },
            error => {
              console.log(error);
              this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.imprimir.despacho.solicitud');
              this.alertSwalError.show();
              this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
              })
            }
          );

      // case "Todo-Medico":
      //         tipodeproducto = 'MIM';
      //         idBodega= this.id_Bodega;
      //         break;


      // default:
      //   idOrigen = 0;
    }

  }
  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
