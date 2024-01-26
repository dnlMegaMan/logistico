import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { Holding } from '../../models/entity/Holding';
import { hesService } from '../../servicios/hes.service';
import { BodegasService } from '../../servicios/bodegas.service';
import { BodegaDestino } from '../../models/entity/BodegaDestino'
import { Empresas } from '../../models/entity/Empresas';
import { Sucursal } from '../../models/entity/Sucursal';
import { TipoRegistro } from '../../models/entity/TipoRegistro';
import { TiporegistroService } from '../../servicios/tiporegistro.service';
import { InformesService } from '../../servicios/informes.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-listadopararealizarinventario',
  templateUrl: './listadopararealizarinventario.component.html',
  styleUrls: ['./listadopararealizarinventario.component.css'],
  providers: [ InformesService]
})
export class ListadopararealizarinventarioComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  public FormListadoInventario: FormGroup;
  public holdings             : Array<Holding> = [];
  public empresas             : Array<Empresas> = [];
  public sucursales           : Array<Sucursal> = [];
  public bodegasdestino       : Array<BodegaDestino> = [];
  public tiposderegistros     : Array<TipoRegistro> = [];
  public hdgcodigo                          : number;
  public esacodigo                          : number;
  public cmecodigo                          : number;

  private _BSModalRef         : BsModalRef;

  onClose   : any;
  bsModalRef: any;
  editField : any;

  constructor(
    private formBuilder               : FormBuilder,
    public _BsModalService            : BsModalService,
    private _hesService               : hesService,
    public _BodegasService            : BodegasService,
    private _listadoinventarioService : InformesService,
    private TiporegistroService       : TiporegistroService

  ) {

    this.FormListadoInventario = this.formBuilder.group({
      hdgcodigo: [null],
      esacodigo: [null],
      cmecodigo: [null],
      idtiporegistro: [null],
      boddestino: [null],
    });
   }

  ngOnInit() {

    this.TiporegistroService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, environment.privilegios.usuario,environment.URLServiciosRest.ambiente).subscribe(
      data => {
        this.tiposderegistros = data;
        console.log(data);
      }, err => {
        console.log(err.error);
      }
    );
  }

  getHdgcodigo(event: any) {
    this.hdgcodigo = event.hdgcodigo;

  }
  getEsacodigo(event: any) {
    this.esacodigo = event.esacodigo;
  }

  getCmecodigo(event: any) {
    this.cmecodigo = event.cmecodigo;

    this.BuscaBodegaDestino();
  }

  BuscaBodegaDestino() {
    var servidor = environment.URLServiciosRest.ambiente;
    var usuario = environment.privilegios.usuario;

    this._BodegasService.listaBodegaDestinoSucursal(this.hdgcodigo, this.esacodigo, this.cmecodigo, usuario, servidor).subscribe(
      response => {
        if (response != null) {
          this.bodegasdestino = response;
        }
      },
      error => {
        alert("Error al Buscar Bodegas de Destino");
      }
    );
  }

  Limpiar(){
    console.log("Limpia La Pantalla");
    this.FormListadoInventario.reset();
  }

  ConfirmaImprimirReporte(tiporeporte: string){
    const Swal = require('sweetalert2');

    Swal.fire({
      title: '¿Desea Imprimir Listado para realizar Inventario ?',
      text: "Confirmar Impresión del Listado",
      //icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {

        this.ImprimeReporte(tiporeporte);
      }
    })
  }

  ImprimeReporte(tiporeporte: string){
    console.log("Imprime el reporte de Inventario", this.FormListadoInventario.value.boddestino,
    this.FormListadoInventario.value.idtiporegistro,environment.URLServiciosRest.ambiente,tiporeporte);
    if(tiporeporte=="pdf"){
      this._listadoinventarioService.RPTListadoInventario(tiporeporte,this.FormListadoInventario.value.boddestino,
      this.FormListadoInventario.value.idtiporegistro,this.hdgcodigo,
      this.esacodigo,this.cmecodigo).subscribe(
        response => {
          if (response != null) {
            window.open(response[0].url,"","",true);
          }
        },
        error => {
          console.log(error);
          this.alertSwalError.title="Error al Imprimir Listado";
          this.alertSwalError.show();
          this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
          })
          alert("Error al Imprimir Listado para Inventario");
        }
      );
    }else{
      if(tiporeporte == "xls"){
        this._listadoinventarioService.RPTListadoInventario(tiporeporte,this.FormListadoInventario.value.boddestino,
        this.FormListadoInventario.value.idtiporegistro,this.hdgcodigo,this.esacodigo,this.cmecodigo).subscribe(
          response => {
            if (response != null) {
              window.open(response[0].url,"","",true);
            }
          },
          error => {
            console.log(error);
            this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
            })
            //alert("Error al Imprimir Listado para Inventario");
          }
        );
      }

    }
  }

  setModalMensajeError() {
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-m',
      initialState: {
        titulo: 'Generar Listado para Inventario', // Parametro para de la otra pantalla
        mensaje: 'No se pudo imprimir el Listado para Inventario',
        informacion: 'Intente nuevamente',
        estado: 'CANCELADO',
      }
    };
    return dtModal;
  }
}
