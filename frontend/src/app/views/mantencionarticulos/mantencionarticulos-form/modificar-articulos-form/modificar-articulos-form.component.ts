import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Clasificacion } from 'src/app/models/entity/Clasificacion';
import { Familia } from 'src/app/models/entity/Familia';
import { FormaFar } from 'src/app/models/entity/FormaFar';
import { Presenta } from 'src/app/models/entity/Presenta';
import { ProductosCheck } from 'src/app/models/entity/ProductosCheck';
import { SubFamilia } from 'src/app/models/entity/SubFamilia';
import { TipoRegistro } from 'src/app/models/entity/TipoRegistro';
import { UnidadCompra } from 'src/app/models/entity/UnidadCompra';
import { ClinFarGrupoConsumo } from 'src/app/models/entity/clin-far-grupo-consumo';
import { ClinFarSubGrupoConsumo } from 'src/app/models/entity/clin-far-sub-grupo-consumo';
import { Articulos } from 'src/app/models/entity/mantencionarticulos';
import { TipoParametro } from 'src/app/models/entity/tipo-parametro';
import { Permisosusuario } from 'src/app/permisos/permisosusuario';
import { BodegasService } from 'src/app/servicios/bodegas.service';
import { BusquedaproductosService } from 'src/app/servicios/busquedaproductos.service';
import { FamiliaService } from 'src/app/servicios/familia.service';
import { FormaFarService } from 'src/app/servicios/formafar.service';
import { MantencionarticulosService } from 'src/app/servicios/mantencionarticulos.service';
import { PresentaService } from 'src/app/servicios/presenta.service';
import { SolicitudConsumoService } from 'src/app/servicios/solicitud-consumo.service';
import { SubfamiliaService } from 'src/app/servicios/subfamilia.service';
import { TiporegistroService } from 'src/app/servicios/tiporegistro.service';
import { UnidadcompraService } from 'src/app/servicios/unidadcompra.service';
import { BusquedaproductosComponent } from 'src/app/views/busquedaproductos/busquedaproductos.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-modificar-articulos-form',
  templateUrl: './modificar-articulos-form.component.html',
  styleUrls: ['./modificar-articulos-form.component.css']
})
export class ModificarArticulosFormComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;// success
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;//error

  public modelopermisos: Permisosusuario = new Permisosusuario();

  public loading = false;

  descprod: any;
  codprod: any;
  public productoselec : Articulos;
  public bloqueabtnbuscar : boolean = false;  
  public hdgcodigo: number;
  public esacodigo: number;
  public cmecodigo: number;
  public usuario: string;
  public servidor = environment.URLServiciosRest.ambiente;

  public lForm: FormGroup;

  private _BSModalRef: BsModalRef;

  public meinaux : number;
  public codigoaux : string;
  public descripcionaux : string;
  public tiporegistroaux : string;
  public tipomedicamentoaux : number;

  public unidadcompraaux : number;
  public familiaaux : number;
  public subfamiliaaux : number;
  public grupoaux : number;
  public subgrupoaux : number;
  public codpresaux : number;
  public codffaraux : number;
  public clasificacionaux : number;


  public listaGurpoConsumo          :  Array<ClinFarGrupoConsumo> = [];
  public listaSubGurpoConsumo       :  Array<ClinFarSubGrupoConsumo> = [];
  public arreglotipoproducto: TipoParametro[] = [];

  public unidadescompra: Array<UnidadCompra> = [];
  public Presenta: Array<Presenta> = [];
  public FormaFar: Array<FormaFar> = [];

  public Clasificacion: Array<Clasificacion> = [];

  public familias: Array<Familia> = [];
  public subfamilias: Array<SubFamilia> = [];

  public tiposderegistros: Array<TipoRegistro> = [];

  public var_Articulo: Articulos;

  public var_ProdCheck: ProductosCheck;

  public detalleconsultaproducto: Array<Articulos> = [];
  public detalleconsultaproductopag: Array<Articulos> = [];

  constructor(public translate: TranslateService,
              private formBuilder: FormBuilder,
              public _BusquedaproductosService: BusquedaproductosService,
              public _BsModalService: BsModalService,
              private _mantencionarticulosService: MantencionarticulosService,
              public datePipe                 : DatePipe,
              public _SolicitudConsumoService: SolicitudConsumoService,
              private FamiliaService: FamiliaService,
              private SubfamiliasService: SubfamiliaService,
              private _buscabodegasService: BodegasService,
              private UnidadcompraService: UnidadcompraService,
              private FormaFarService: FormaFarService,
              private PresentaService: PresentaService,
              private TiporegistroService: TiporegistroService,
              private router: Router,
              private route: ActivatedRoute,
    ) { 
    this.lForm = this.formBuilder.group({
      mein: [null],
      codigo: [null],
      descripcion: [null],
      tiporegistro: [{value:null, disabled:false}],
      tipomedicamento: [null],
      unidadcompra: [{value:null, disabled:false}],  
      //idpresentacion  
      //idforma 
      familia: [{value:null, disabled:false}],
      subfamilia: [{value:null, disabled:false}],
      grupoid:[{ value: null, disabled: false }, Validators.required],
      subgrupoid:[{ value: null, disabled: false }, Validators.required],   
      codffar: [{ value: null, disabled: false }, Validators.required],
      codpres: [{ value: null, disabled: false }, Validators.required],
      clasificacion: [{ value: null, disabled: false }, Validators.required],
      chkProductoStock: [null],
      chkVigente: [null],
      chkConsumoRes: [null],
      chkRepoAuto: [null],
      chkFechaVence: [null],
      chkMagistral: [null],
      chkValorVariable: [null],
      chkPos: [null],
      chkPoss: [null],
      chkConsumoGen: [null],
      chkPrecioReg: [null],
      chkAcondi: [null],
      chkAdecuado: [null],
      chkArticuloInspEsp: [null],
    }
    );    
  }

  ngOnInit() {

    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    
    this._SolicitudConsumoService.buscargrupoconsumo('',0,this.hdgcodigo,0,0,'','',this.usuario,this.servidor).subscribe(
      Response => {
        if (Response != null){
          if (Response.length == 0 ){
            this.loading = false;
            this.alertSwalAlert.title = this.TranslateUtil('key.advertencia');
            this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.existe.grupos.definidos.criterio');
            this.alertSwalAlert.show();
            Response = [];
          } else {
            this.listaGurpoConsumo = Response;
          }
        } else {
          this.loading = false;
        }
      }
    );

    this._buscabodegasService.listatipoproducto(this.hdgcodigo, this.cmecodigo, this.esacodigo, this.usuario, this.servidor).subscribe(
      response => {
        if (response != null){
          this.arreglotipoproducto = response;
        }
      });

    this.FamiliaService.list(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, environment.URLServiciosRest.ambiente).subscribe(
      data => {
        this.familias = data;
      }, err => {
        console.log(err.error);
      }
    );

    this.SubfamiliasService.list(this.usuario, environment.URLServiciosRest.ambiente).subscribe(
      data => {
        this.subfamilias = data;
      }, err => {
        console.log(err.error);
      }
    );

    this.UnidadcompraService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario, environment.URLServiciosRest.ambiente).subscribe(
      data => {
        this.unidadescompra = data;

      }, err => {
        console.log(err.error);
      }
    );

    this.PresentaService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario, environment.URLServiciosRest.ambiente).subscribe(
      data => {
        this.Presenta = data;
      }, err => {
        console.log(err.error);
      }
    );

    this.FormaFarService.list(this.usuario, environment.URLServiciosRest.ambiente).subscribe(
      data => {
        this.FormaFar = data;
      }, err => {
        console.log(err.error);
      }
    );

    this.TiporegistroService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario, environment.URLServiciosRest.ambiente).subscribe(
      data => {
        this.tiposderegistros = data;

      }, err => {
        console.log(err.error);
      }
    );

    this._mantencionarticulosService.ClasificacionProducto(this.usuario, environment.URLServiciosRest.ambiente).subscribe(
      data => {
        this.Clasificacion = data;
      }, err => {
        console.log(err.error);
      }
    );
  }

  listarsubgrupos(id_grupo:number){
    this._SolicitudConsumoService.buscarsubgrupoconsumo('',0,id_grupo  ,this.hdgcodigo,0,0,'','',this.usuario,this.servidor).subscribe(
      response => {
        if (response.length == 0 ){
          this.loading = false;
          this.alertSwalAlert.title = this.TranslateUtil('key.advertencia');
          this.alertSwalAlert.text = this.TranslateUtil('key.mensaje.no.existe.subgrupos.definidos.criterio');
          this.alertSwalAlert.show();
          response = [];
        } else {
          this.listaSubGurpoConsumo = response;
        }
      }
    )
  }

  getProducto(codigo: any) {
    // var codproducto = this.lForm.controls.codigo.value;
    this.codprod = codigo;
    this.bloqueabtnbuscar= true;
    if(this.codprod === null || this.codprod === ''){
      this.bloqueabtnbuscar =false;
      return;
    } else{
      var tipodeproducto = 'MIM';
      this.loading = true;
      var controlado = '';
      var controlminimo = '';
      var idBodega = 0;
      var consignacion = '';

      this._BusquedaproductosService.BuscarArticulosFiltros(this.hdgcodigo, this.esacodigo,
        this.cmecodigo, codigo, this.descprod, null, null, null, tipodeproducto, idBodega, controlminimo, controlado, consignacion
        , this.usuario, null, this.servidor).subscribe(
          response => {
            if (response != null) {
              if (response.length == 0) {
                this.loading = false;
                this.BuscarProducto();
              }
              else {
                if (response.length > 0) {
                  if(response.length > 1){
                    // console.log("Tiene varios productos levanta modal busqueda productos")
                    this.BuscarProducto();
                    this.loading = false;
                  }else{
                    if(response.length == 1){

                      this.productoselec = response[0];
                      this.loading = false;
                      this.setProducto(response[0]);
                    }
                  }
                }
              }
            } else {
              this.loading = false;
              this.BuscarProducto();
            }
          }, error => {
            this.loading = false;
            console.log('error');
          }
        );
    }
  }

  setProducto(producto: any) {
    console.log("producto", producto)
    this.lForm.get('mein').setValue(producto.mein);
    this.lForm.get('codigo').setValue(producto.codigo);
    this.lForm.get('descripcion').setValue(producto.descripcion);
    this.lForm.get('tiporegistro').setValue(producto.tiporegistro);
    this.lForm.get('unidadcompra').setValue(producto.unidadcompra);
    this.lForm.get('codpres').setValue(producto.codpres);
    this.lForm.get('codffar').setValue(producto.codffar);
    this.BuscaFamilia(producto.tiporegistro);
    this.lForm.get('familia').setValue(producto.familia);
    this.lForm.get('subfamilia').setValue(producto.subfamilia);
    this.lForm.get('grupoid').setValue(producto.grupo);
    this.lForm.get('subgrupoid').setValue(producto.subgrupo);  
    this.lForm.get('clasificacion').setValue(producto.clasificacion);      

    this.codprod = null;
    this.descprod = null;

    this.meinaux = this.lForm.get('mein').value;
    this.codigoaux = this.lForm.get('codigo').value;
    this.descripcionaux = this.lForm.get('descripcion').value;
    this.tiporegistroaux = this.lForm.get('tiporegistro').value;
    this.unidadcompraaux = this.lForm.get('unidadcompra').value;
    this.codpresaux = this.lForm.get('codpres').value;
    this.codffaraux = this.lForm.get('codffar').value;
    this.familiaaux = this.lForm.get('familia').value;
    this.subfamiliaaux = this.lForm.get('subfamilia').value;
    this.grupoaux = this.lForm.get('grupoid').value;
    this.subgrupoaux = this.lForm.get('subgrupoid').value

    this.clasificacionaux = this.lForm.get('clasificacion').value
   

    /**Desactiva campo codigo y descripcion //@ML */
    this.desactivaCampos(true);
  }

  setDatabusqueda(value: any, swtch: number) {
    if (swtch === 1) {
        this.codprod = value;
    } else if (swtch === 2) {
        this.descprod = value;
    }
  }

  setModalProductos() {
    // console.log('desde setModalProductos()');
    // console.log(this.codprod);
    // console.log(this.descprod);
    let dtModal: any = {};
    dtModal = {
      keyboard: true,
      backdrop: 'static',
      class: 'modal-dialog-centered modal-xl',
      initialState: {
        titulo: this.TranslateUtil('key.title.busqueda.productos'), // Parametro para de la otra pantalla
        hdgcodigo: this.hdgcodigo,
        esacodigo: this.esacodigo,
        cmecodigo: this.cmecodigo,
        tipo_busqueda: 'Todo-Medico',
        id_Bodega: 0,
        descprod: this.descprod,//
        codprod: this.codprod
      }
    };
    return dtModal;
  }

  BuscarProducto() {

    this._BSModalRef = this._BsModalService.show(BusquedaproductosComponent, this.setModalProductos());
    this._BSModalRef.content.onClose.subscribe((producto: any) => {
      if (producto == undefined) { }
      else {
        this.productoselec = producto;
        console.log("prod buscado con fecha",this.productoselec);
        this.bloqueabtnbuscar = true;
        this.setProducto(producto);
      }
    });

    this.bloqueabtnbuscar = false;
  }

  BuscaFamilia(tiporegistro: string) {
    var servidor = environment.URLServiciosRest.ambiente;
    var usuario = environment.privilegios.usuario;
    this._mantencionarticulosService.BuscaFamilias(tiporegistro, usuario, servidor).subscribe(
      response => {
        if (response != null) {
          this.familias = response;
        }
      },
      error => {
        alert("Error al Buscar Familias")
      }
    );
  }

  desactivaCampos(bool) {
    if (bool){
      this.lForm.controls.codigo.disable();
      this.lForm.controls.descripcion.disable();
    } else {
      this.lForm.controls.codigo.enable();
      this.lForm.controls.descripcion.enable();
    }
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }

  ConfirmarModificarArticulo(datos: any, tipo: String) {

    const Swal = require('sweetalert2');

    if (tipo == "MODIFICAR") {

      Swal.fire({
        title: this.TranslateUtil('key.mensaje.pregunta.actualiza.articulo'),
        text: this.TranslateUtil('key.mensaje.confirmar.actualizacion.articulo'),
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
      }).then((result) => {
        if (result.value) {

          this.ActualizaArticulos(datos);

          this.ActualizarProductosCheck(datos);
        }
      })
    } 
  }

  async ActualizaArticulos(value: any) {
    var servidor = environment.URLServiciosRest.ambiente;
    var usuario = environment.privilegios.usuario;
    this.var_Articulo = new Articulos(null);
    this.var_Articulo.hdgcodigo = this.hdgcodigo;
    this.var_Articulo.esacodigo = this.esacodigo;
    this.var_Articulo.cmecodigo = this.cmecodigo;
    this.var_Articulo.mein = this.productoselec.mein;
    this.var_Articulo.codigo = this.productoselec.codigo;
    this.var_Articulo.descripcion = this.productoselec.descripcion;
    this.var_Articulo.tiporegistro = this.productoselec.tiporegistro;
    this.var_Articulo.tipomedicamento = this.productoselec.tipomedicamento;
   
    this.var_Articulo.unidadcompra = this.productoselec.unidadcompra;
    this.var_Articulo.incobfonasa = this.productoselec.incobfonasa;
    this.var_Articulo.familia = value.familia;
    this.var_Articulo.subfamilia = value.subfamilia;

    this.var_Articulo.grupo = value.grupoid;
    this.var_Articulo.subgrupo = value.subgrupoid;
    this.var_Articulo.clasificacion = value.clasificacion;

    this.var_Articulo.usuario = usuario;
    this.var_Articulo.servidor = servidor;
    this.var_Articulo.codffar = value.codffar;
    this.var_Articulo.codpres = value.codpres;
    this.var_Articulo.fechainiciovigencia = value.fechainivigencia;
    this.var_Articulo.fechafinvigencia = value.fechafinvigencia;

    try {
      await this._mantencionarticulosService.UpdateArticulos(this.var_Articulo).toPromise();

      this.alertSwal.title = this.TranslateUtil('key.mensaje.articulo.modificado.exitosamente');
      await this.alertSwal.show();
      
      this.meinaux = this.lForm.get('mein').value;
      this.codigoaux = this.lForm.get('codigo').value;
      this.descripcionaux = this.lForm.get('descripcion').value;
      this.tiporegistroaux = this.lForm.get('tiporegistro').value;
      this.unidadcompraaux = this.lForm.get('unidadcompra').value;
      this.codpresaux = this.lForm.get('codpres').value;
      this.codffaraux = this.lForm.get('codffar').value;
      this.familiaaux = this.lForm.get('familia').value;
      this.subfamiliaaux = this.lForm.get('subfamilia').value;
      this.grupoaux = this.lForm.get('grupoid').value;
      this.subgrupoaux = this.lForm.get('subgrupoid').value;
      this.clasificacionaux = this.lForm.get('clasificacion').value;
      
    } catch (error) {
      console.log('[ERROR ACTUALIZAR ARTICULO] ', error);
      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.modificar.articulo');
      await this.alertSwalError.show();
    }
  }

  async ActualizarProductosCheck(value: any) {

    /* vienen seteadas en el ambiente */
    var servidor = environment.URLServiciosRest.ambiente;
    var usuario = environment.privilegios.usuario;


   this.var_ProdCheck = new ProductosCheck();

   this.var_ProdCheck.productoStock = this.lForm.get('chkProductoStock').value == true ? 1 : 0;
   this.var_ProdCheck.vigente = this.lForm.get('chkVigente').value == true ? 1 : 0;
   this.var_ProdCheck.consumoRestringido = this.lForm.get('chkConsumoRes').value == true ? 1 : 0;
   this.var_ProdCheck.repoAuto = this.lForm.get('chkRepoAuto').value == true ? 1 : 0;
   this.var_ProdCheck.fechaVenc = this.lForm.get('chkFechaVence').value == true ? 1 : 0;
   this.var_ProdCheck.magistral = this.lForm.get('chkMagistral').value == true ? 1 : 0;
   this.var_ProdCheck.valorVar = this.lForm.get('chkValorVariable').value == true ? 1 : 0;
   this.var_ProdCheck.pos = this.lForm.get('chkPos').value == true ? 1 : 0;
   this.var_ProdCheck.poss = this.lForm.get('chkPoss').value == true ? 1 : 0;
   this.var_ProdCheck.consumoGeneral = this.lForm.get('chkConsumoGen').value == true ? 1 : 0;
   this.var_ProdCheck.precioRegulado = this.lForm.get('chkPrecioReg').value == true ? 1 : 0;
   this.var_ProdCheck.acondicionamiento = this.lForm.get('chkAcondi').value == true ? 1 : 0;
   this.var_ProdCheck.adecuado = this.lForm.get('chkAdecuado').value == true ? 1 : 0;
   this.var_ProdCheck.artInsEspecial = this.lForm.get('chkArticuloInspEsp').value == true ? 1 : 0;

   this.var_ProdCheck.codMein = value.codigo;
   this.var_ProdCheck.usuario = usuario;
   this.var_ProdCheck.servidor = servidor;
   this.var_ProdCheck.accion = "M"

   try {
     await this._mantencionarticulosService.AddOrUpdateProductosCheck(this.var_ProdCheck).toPromise();    
         
   } catch (error) {
         //console.log('[ERROR AGREGAR CHECK PRODUCTO] ', error);          
   }
 } 

  Limpiar(value: any) {
    const Swal = require('sweetalert2');
    if( this.meinaux != this.lForm.get('mein').value ||
        this.codigoaux != this.lForm.get('codigo').value ||
        this.descripcionaux != this.lForm.get('descripcion').value ||
        this.tiporegistroaux != this.lForm.get('tiporegistro').value ||
        this.unidadcompraaux != this.lForm.get('unidadcompra').value ||
        this.codpresaux != this.lForm.get('codpres').value ||
        this.codffaraux != this.lForm.get('codffar').value ||
        this.familiaaux != this.lForm.get('familia').value ||
        this.subfamiliaaux != this.lForm.get('subfamilia').value ||
        this.grupoaux != this.lForm.get('grupoid').value ||
        this.subgrupoaux != this.lForm.get('subgrupoid').value ||
        this.clasificacionaux != this.lForm.get('clasificacion').value){
       
          Swal.fire({
            title: this.TranslateUtil('key.button.limpiar.L'),
            text: this.TranslateUtil('key.mensaje.pregunta.seguro.desea.limpiar.campos'),
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: this.TranslateUtil('key.si')
          }).then((result) => {
            if (result.dismiss != "cancel") {
              this.limpiar_Grilla();
            }
          });

    }else{
      this.limpiar_Grilla();
    }
  }

  limpiar_Grilla() {
    // Son espacios para que no muestre el campo invalido
    this.lForm.reset({
    });
    
    this.detalleconsultaproducto= [];
    this.detalleconsultaproductopag = [];
    this.descprod = null
    this.codprod = null;
    this.desactivaCampos(false);
    this.lForm.controls.codpres.enable();
    this.lForm.controls.codffar.enable();
    this.bloqueabtnbuscar = false;
    this.familias = [];
  }

  Salir(){
    const Swal = require('sweetalert2');
    if( this.meinaux != this.lForm.get('mein').value ||
        this.codigoaux != this.lForm.get('codigo').value ||
        this.descripcionaux != this.lForm.get('descripcion').value ||
        this.tiporegistroaux != this.lForm.get('tiporegistro').value ||
        this.unidadcompraaux != this.lForm.get('unidadcompra').value ||
        this.codpresaux != this.lForm.get('codpres').value ||
        this.codffaraux != this.lForm.get('codffar').value ||
        this.familiaaux != this.lForm.get('familia').value ||
        this.subfamiliaaux != this.lForm.get('subfamilia').value ||
        this.grupoaux != this.lForm.get('grupoid').value ||
        this.subgrupoaux != this.lForm.get('subgrupoid').value ||
        this.clasificacionaux != this.lForm.get('clasificacion').value ) {

          Swal.fire({
            title: this.TranslateUtil('key.title.salir'),
            text: this.TranslateUtil('key.mensaje.pregunta.confirma.salir.sin.guardar'),
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: this.TranslateUtil('key.si')
          }).then((result) => {
            if (result.dismiss != "cancel") {
              this.route.paramMap.subscribe(param => {
                this.router.navigate(['home']);
            })
            }
          });
    }else{
      this.route.paramMap.subscribe(param => {
        this.router.navigate(['home']);
    })
    }
  }

}
