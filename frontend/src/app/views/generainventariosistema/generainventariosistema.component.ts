import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { Holding } from '../../models/entity/Holding';
import { Empresas } from '../../models/entity/Empresas';
import { Sucursal } from '../../models/entity/Sucursal';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { environment } from '../../../environments/environment';
import { hesService } from '../../servicios/hes.service';
import { TipoRegistro } from '../../models/entity/TipoRegistro';
import { TiporegistroService } from '../../servicios/tiporegistro.service';
import { BodegaDestino } from '../../models/entity/BodegaDestino';
import { BodegasService } from '../../servicios/bodegas.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { InventariosService } from 'src/app/servicios/inventarios.service';

@Component({
  selector: 'app-generainventariosistema',
  templateUrl: './generainventariosistema.component.html',
  styleUrls: ['./generainventariosistema.component.css'],
  providers: [ InventariosService]
})
export class GenerainventariosistemaComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  public FormGeneraInventario  : FormGroup;
  public tiposderegistros      : Array<TipoRegistro> = [];
  public bodegasdestino        : Array<BodegaDestino> = [];

  public locale                = 'es';
  public colorTheme            = 'theme-blue';
  public bsConfig              : Partial<BsDatepickerConfig>;
  public holdings              : Array<Holding> = [];
  public empresas              : Array<Empresas> = [];
  public sucursales            : Array<Sucursal> = [];
  public hdgcodigo             : number;
  public esacodigo             : number;
  public cmecodigo             : number;
  private _BSModalRef          : BsModalRef;
  public servidor              = environment.URLServiciosRest.ambiente;
  public usuario               = environment.privilegios.usuario;

  onClose                      : any;
  bsModalRef                   : any;
  editField                    : any;

  constructor(
    private formBuilder        : FormBuilder,
    private _hesService        : hesService,
    public _BodegasService     : BodegasService,
    private _inventarioService : InventariosService,
    public localeService       : BsLocaleService,
    private TiporegistroService: TiporegistroService,
    public _BsModalService              : BsModalService,
    public datePipe            : DatePipe
  ) {

    this.FormGeneraInventario = this.formBuilder.group({

      hdgcodigo     : [null],
      esacodigo     : [null],
      cmecodigo     : [null],
      fechamostrar  : [new Date(), Validators.required],
      boddestino    : [null],
      tiporegistro  : [null]

    });

  }

  ngOnInit() {

    this.setDate();

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

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
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
    this.FormGeneraInventario.reset();
  }

  ConfirmaGeneraInventario(){
    const Swal = require('sweetalert2');

    Swal.fire({
      title: '¿Desea Generar Inventario ?',
      text: "Confirmar Generar Inventario",
      //icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {

        this.GeneraInventario();
      }
    })
  }

  GeneraInventario(){

    var fecha = this.datePipe.transform(this.FormGeneraInventario.value.fechamostrar, 'yyyy-MM-dd');
    console.log("Genera el inventario",fecha,this.FormGeneraInventario.value.boddestino,
    this.FormGeneraInventario.value.tiporegistro,this.servidor);

   // this.ModalGeneraInventario.modal('hide');
   // this.modalinventarioexitoso.modal('show');

    console.log(fecha);
    this._inventarioService.GeneraInventario(
      this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo,
      fecha,
      this.FormGeneraInventario.value.boddestino,
      this.FormGeneraInventario.value.tiporegistro,
      0,
      this.usuario,
      this.servidor).subscribe(
      response => {
        if (response != null) {
          this.alertSwal.title = "Inventario de Sistema Generado Correctamente";
          this.alertSwal.show();
        }
      },
      error => {
        console.log(error);
        this.alertSwalError.title="Error al Generar Inventario";
        this.alertSwalError.text="Favor intente nuevamente";
        this.alertSwalError.show();

       // alert("Error al Generar Inventario");
      }
    );
  }
}
