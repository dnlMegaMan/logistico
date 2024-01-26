import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { Articulos } from 'src/app/models/entity/mantencionarticulos';
import { Subject } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AlertComponent } from 'ngx-bootstrap/alert/public_api';
import { FormaFar } from '../../models/entity/FormaFar'
import { FormaFarService } from 'src/app/servicios/formafar.service';
import { Presenta } from '../../models/entity/Presenta'
import { PresentaService } from 'src/app/servicios/presenta.service';
import { PrincAct } from '../../models/entity/PrincAct'
import { PrincActService } from 'src/app/servicios/PrincAct.service';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { BodegasService } from '../../servicios/bodegas.service';
import { TipoParametro } from 'src/app/models/entity/tipo-parametro';
import { ProductosBodegas } from 'src/app/models/entity/productos-bodegas';
import { OrdenCompraService } from '../../servicios/ordencompra.service';
import { TipoDocumento } from 'src/app/models/entity/TipoDocumento';
import {TranslateService} from '@ngx-translate/core';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-busquedaproductosocmodal',
  templateUrl: './busquedaproductosocmodal.component.html',
  styleUrls: ['./busquedaproductosocmodal.component.css']
})
export class BusquedaproductosocmodalComponent implements OnInit {
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;

  @Input() hdgcodigo: number;
  @Input() esacodigo: number;
  @Input() cmecodigo: number;
  @Input() titulo   : string;
  @Input() tipo_busqueda: string; // = la pantalla que hace referencia 
  @Input() id_Bodega: number;    // Búsqueda dentro de una bodega
  @Input() ambito   : number; // Recibe el ambito enviado desde solic pac
  @Input() codprod  : string; // codigo producto
  @Input() descprod : string; // descripcion producto
  @Input() bodega_productos : ProductosBodegas[];
  @Input() proveedor: number;
  @Input() tipodoc: number;    // Búsqueda dentro de una bodega
  @Input() numdocaux   : number; // Recibe el ambito enviado desde solic pac


  public onClose  : Subject<Articulos>;
  public estado   : boolean = false;
  public FormaFar : Array<FormaFar> = [];
  public Presenta : Array<Presenta> = [];
  public PrincAct : Array<PrincAct> = [];
  public detalleconsultaproducto: Array<Articulos> = [];
  public detalleconsultaproductopag: Array<Articulos> = [];
  public lForm    : FormGroup;
  public loading  = false;
  public usuario  = environment.privilegios.usuario;
  public servidor = environment.URLServiciosRest.ambiente;
  public arreglotipoproducto: TipoParametro[] = [];
  public pantalla : string = null;
  public listatipodocumento : TipoDocumento[] = [];
  public listatipodocumentodev : TipoDocumento[] = [];
  public selected : number;
  public numdoc : number = 0;


  public codproducto  = null;
  public descproducto = null;

  /** mensaje y/o alertas */
  public alerts: any[] = [];

  constructor(
    public bsModalRef      : BsModalRef,
    public formBuilder     : FormBuilder,
    public _BusquedaproductosService: BusquedaproductosService,
    private FormaFarService: FormaFarService,
    private PresentaService: PresentaService,
    private PrincActService: PrincActService,
    private _buscabodegasService: BodegasService,
    private _ordencompra: OrdenCompraService,
    public translate: TranslateService
  ) {
    this.lForm = this.formBuilder.group({
      codigo: [{ value: null, disabled: false }, Validators.required],
      descripcion: [{ value: null, disabled: false }, Validators.required],
      tipodoc: [{ value: null, disabled: false }, Validators.required],
      numdoc: [{ value: null, disabled: false }, Validators.required],
      codffar: [{ value: null, disabled: false }, Validators.required],
      codpres: [{ value: null, disabled: false }, Validators.required],
      codpact: [{ value: null, disabled: false }, Validators.required],
      tipoproducto:[{ value: null, disabled: false }, Validators.required],
    });
  }

  ngOnInit() {
    /**Operador ternario asigna null si var codprod/descprod desde pantalla padre vienen sin datos o Undefined */
    /* se usaron nuevas var globales ya que no es posible modificar los valores @Input() //@ML */
    this.numdoc == Number(this.numdocaux)
    
    if(this.numdoc == undefined)
    {
      this.numdoc = 0;
    }


    this.pantalla = this.tipo_busqueda;

    if(this.codprod !== null) {
      this.codproducto = (this.codprod===undefined || this.codprod.toString().trim()==='')?null:this.codprod.toString();
    }
    if(this.descprod !== null) {
      this.descproducto = (this.descprod===undefined || this.descprod.trim()==='')?null:this.descprod;
    }
    /** */
    this.onClose = new Subject();
    this.FormaFarService.list(this.usuario, this.servidor).subscribe(
      data => {
        this.FormaFar = data;
      }, err => {
        console.log(err.error);
      }
    );

    this.PrincActService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario, this.servidor).subscribe(
      data => {
        this.PrincAct = data;
      }, err => {
        console.log(err.error);
      }
    );

    this.PresentaService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario, this.servidor).subscribe(
      data => {
        this.Presenta = data;
      }, err => {
        console.log(err.error);
      }
    );

    this._buscabodegasService.listatipoproducto(this.hdgcodigo, this.cmecodigo, this.esacodigo, this.usuario, this.servidor).subscribe(
      response => {
        if (response != null){
          this.arreglotipoproducto = response;
        }
    });
    this.cargarCombos();
    this.cargarCombosDev();  
    if(this.numdoc != 0 || this.numdoc != undefined || this.numdoc != null)
    {
      this.lForm.controls.numdoc.setValue(this.numdoc.toString())
    }

    if(this.numdoc == 0)
    {
      this.lForm.controls.numdoc.setValue("")
    }

    if(this.tipodoc != 0)
    {
      this.lForm.patchValue({tipodoc: this.tipodoc })
    }

    

    if(this.codprod != undefined || this.descprod != undefined || this.proveedor != 0 || this.tipodoc != 0 || this.numdoc != 0)
    {
      this.Buscarproducto(this.codprod, this.descprod, this.proveedor,null, null, null);
    }

  }

  async ngAfterViewInit() {
    /** Si var cod y desc vienen sin datos no realiza busqueda //@ML */
    if (this.codproducto === null && this.descproducto === null){
      return;
    } else {
      this.setBusqueda();
    }
  }

  async setBusqueda() {
    /** setea campos codigo o descripcion de producto y genera busqueda */
    this.lForm.get('codigo').setValue(this.codproducto);
    this.lForm.get('descripcion').setValue(this.descproducto);
    this.Buscarproducto(this.codproducto, this.descproducto, this.proveedor,null, null, null);
  }

  async cargarCombos(){
    try {
      this.loading = true;
      this.listatipodocumento = await this._ordencompra.listaTipoDocumento(this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.servidor,'reg'
      ).toPromise();
      this.selected = Number(this.listatipodocumento[0]['codtipodocumento'])
      this.loading = false;
    } catch (err) {
      alert(err.message);
      this.loading = false;
    }
  }

  async cargarCombosDev(){
    try {
      this.loading = true;
      this.listatipodocumentodev = await this._ordencompra.listaTipoDocumento(this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo,
        this.servidor,'dev'
      ).toPromise();
      this.selected = Number(this.listatipodocumentodev[0]['codtipodocumento'])
      this.loading = false;
    } catch (err) {
      alert(err.message);
      this.loading = false;
    }
  }

  Buscarproducto(codigo: string, descripcion: string, proveedor: number,codpact: number, codpres: number, codffar: number) {
    var tipodeproducto = '';
    var tipo_pantalla = this.tipo_busqueda.toString();
    this.loading = true;
    var controlado = '';
    var controlminimo = '';
    var idBodega = 0;
    var consignacion = '';
    //var tipodoc = 0;
    //var numdoc = 0;
    tipodeproducto = 'MIM';
    idBodega= this.id_Bodega;
    if(proveedor == null || proveedor == undefined || proveedor == 0)
    {
      proveedor = this.proveedor;
    }
    let tipodoc : number = Number(this.lForm.value.tipodoc);
    var numdoc  : number =  Number(this.lForm.get('numdoc').value);
    //tipodoc = this.tipodoc;
    //numdoc = this.numdoc;
    if(this.lForm.value.tipoproducto == 'M'){
      tipodeproducto = 'M';
    }else{
      if(this.lForm.value.tipoproducto == 'I'){
        tipodeproducto = 'I';
      }else{
        if(this.lForm.value.tipoproducto == 'T'){
          tipodeproducto = 'MIM';
        }
      }
    }

    this.codprod = codigo;


    if(this.codprod == undefined && this.descprod == undefined && this.proveedor == 0 && this.tipodoc == 0 && this.numdoc == 0 
      && codffar == undefined && codpact == null && codpres == null && tipodeproducto == 'MIM' && tipodoc == 0 && numdoc == 0 )
    {
      console.log(this.codprod)
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.debe.ingresar.parametros.busqueda');
      this.alertSwalError.show();
      this.loading = false;
      return;
    }


    this._BusquedaproductosService.BuscarArticulosFiltrosOc(this.hdgcodigo, this.esacodigo,
    this.cmecodigo, codigo, descripcion, codpact, codpres, codffar, tipodeproducto, idBodega, controlminimo, controlado, consignacion, 
    this.usuario, this.bodega_productos,this.servidor,tipo_pantalla, proveedor, tipodoc, numdoc).subscribe(
      response => {
        if (response.length == 0) {
          this.loading = false;
          response = [];
          //revisa si el articulo existe
          this._BusquedaproductosService.BuscarArticulosFiltrosOc(this.hdgcodigo, this.esacodigo,
          this.cmecodigo, codigo, descripcion, codpact, codpres, codffar, tipodeproducto, idBodega, controlminimo, controlado, consignacion, 
          this.usuario, this.bodega_productos,this.servidor,tipo_pantalla, 0, tipodoc, numdoc).subscribe(
            response => {
              if (response.length == 1) {
                this.ConfirmaAgregarItem(response[0]['descripcion'],proveedor,response[0]['codigo'])
              }
            },
            error => {
              this.loading = false;
              this.alertSwalError.title = this.TranslateUtil('key.title.error');
              this.alertSwalError.text = error.message;
              this.alertSwalError.show();
            }
          );
          if(this.tipo_busqueda == 'devolucion' || this.tipo_busqueda == 'nota')
          {
            this.mensaje('danger', this.TranslateUtil('key.mensaje.no.existen.articulos'), 10000);
          }
          else
          {
            this.mensaje('danger', this.TranslateUtil('key.mensaje.codigo.no.existe.no.asociado.proveedor'), 10000);
          }
        } else {
          this.mensaje('', '', 0);
          this.detalleconsultaproducto = response;
          this.detalleconsultaproductopag = this.detalleconsultaproducto.slice(0, 8);
          this.loading = false;
        }
      },
      error => {
        this.loading = false;
        this.alertSwalError.title = this.TranslateUtil('key.title.error');
        this.alertSwalError.text = error.message;
        this.alertSwalError.show();
      }
    );

    console.log(this.detalleconsultaproducto)

  }


  ConfirmaAgregarItem(nombre: string, proveedor: number, codigo: string) {
    this.loading = true;
    const Swal = require('sweetalert2');
    Swal.fire({
      title: 'Item '+ nombre +' no asociado al proveedor',
      text:   " ¿ Desea asociarlo?",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText:  this.TranslateUtil('key.mensaje.aceptar')
    }).then((result) => {
      if (result.value) {
        this.ingresarItem(codigo, proveedor);
      } else {
        this.loading = false;
        return;
      }
    })
  }

  async ingresarItem(codigo: string, proveedor: number)
  {
    const variable = await this._ordencompra.AsociarMeinProv(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, codigo,proveedor,this.servidor).toPromise();
    this.Buscarproducto(this.codprod, this.descprod, this.proveedor,null, null, null);
  }

  onCerrar(Articulos: Articulos) {
    this.estado = true;
    this.onClose.next(Articulos);
    this.bsModalRef.hide();
  };

  onCerrarSalir() {
    this.estado = true;
    this.onClose.next();
    this.bsModalRef.hide();
  };

  /* Función búsqueda con paginación */
  pageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.detalleconsultaproductopag = this.detalleconsultaproducto.slice(startItem, endItem);
  }

  Limpiar() {
    this.lForm.reset();
    this.detalleconsultaproducto = [];
    this.detalleconsultaproductopag = [];
  }

  mensaje(status: string, texto: string, timeoutl: number = 0) {
    this.alerts = [];
    if (timeoutl !== 0) {
      this.alerts.push({
        type: status,
        msg: texto,
        timeout: timeoutl
      });
    } else {
      this.alerts.push({
        type: status,
        msg: texto
      });
    }
  }

  onClosed(dismissedAlert: AlertComponent): void {
    this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
