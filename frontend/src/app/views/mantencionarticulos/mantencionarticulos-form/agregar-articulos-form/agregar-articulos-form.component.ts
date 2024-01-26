import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Clasificacion } from 'src/app/models/entity/Clasificacion';
import { Familia } from 'src/app/models/entity/Familia';
import { FormaFar } from 'src/app/models/entity/FormaFar';
import { Presenta } from 'src/app/models/entity/Presenta';
import { ProductosCheck } from 'src/app/models/entity/ProductosCheck';
import { SubFamilia } from 'src/app/models/entity/SubFamilia';
import { UnidadCompra } from 'src/app/models/entity/UnidadCompra';
import { ClinFarGrupoConsumo } from 'src/app/models/entity/clin-far-grupo-consumo';
import { ClinFarSubGrupoConsumo } from 'src/app/models/entity/clin-far-sub-grupo-consumo';
import { Articulos } from 'src/app/models/entity/mantencionarticulos';
import { ProductosBodegas } from 'src/app/models/entity/productos-bodegas';
import { TipoParametro } from 'src/app/models/entity/tipo-parametro';
import { Permisosusuario } from 'src/app/permisos/permisosusuario';
import { BodegasService } from 'src/app/servicios/bodegas.service';
import { FamiliaService } from 'src/app/servicios/familia.service';
import { FormaFarService } from 'src/app/servicios/formafar.service';
import { MantencionarticulosService } from 'src/app/servicios/mantencionarticulos.service';
import { PresentaService } from 'src/app/servicios/presenta.service';
import { SolicitudConsumoService } from 'src/app/servicios/solicitud-consumo.service';
import { SubfamiliaService } from 'src/app/servicios/subfamilia.service';
import { UnidadcompraService } from 'src/app/servicios/unidadcompra.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-agregar-articulos-form',
  templateUrl: './agregar-articulos-form.component.html',
  styleUrls: ['./agregar-articulos-form.component.css']
})
export class AgregarArticulosFormComponent implements OnInit {

  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;// success
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  descprod: any;

  public modelopermisos: Permisosusuario = new Permisosusuario();
  
  public lForm: FormGroup;
  public loading      = false;

  @Input() codprod  : string; // codigo producto
  @Input() tipo_busqueda: string; // = "Todo","Todo-Medico","Medicamentos", "Insumos-Medicos", "Insumos_No_Medicos","Productos_Bodega","Productos_Bodega_Control_Minimo"
  @Input() id_Bodega: number;
   
  @Input() bodega_productos : ProductosBodegas[];

  public usuario      = environment.privilegios.usuario;
  public servidor     = environment.URLServiciosRest.ambiente;
  public detalleconsultaproducto: Array<Articulos> = [];
  public detalleconsultaproductopag: Array<Articulos> = [];

  public esacodigo: number = 2;
  public cmecodigo: number = 1;
  public hdgcodigo : number = 1;

  public listaGurpoConsumo          :  Array<ClinFarGrupoConsumo> = [];
  public listaSubGurpoConsumo       :  Array<ClinFarSubGrupoConsumo> = [];
  public arreglotipoproducto: TipoParametro[] = [];

  public unidadescompra: Array<UnidadCompra> = [];
  public Presenta: Array<Presenta> = [];
  public FormaFar: Array<FormaFar> = [];
  public var_Articulo: Articulos;

  public Clasificacion: Array<Clasificacion> = [];

  public var_ProdCheck: ProductosCheck;

  public bloqueabtnbuscar : boolean = false;

  public familias: Array<Familia> = [];
  public subfamilias: Array<SubFamilia> = [];

  public meinaux : number;
  public codigoaux : string;
  public descripcionaux : string;
  public tiporegistroaux : string;
  public tipomedicamentoaux : number;
  public recetaretenidaaux : string;
  public controladoaux : string;
  public solocompraaux : string;
  public valorcostoaux : number;
  public margenmedicamentoaux : number;
  public unidaddespachoaux : number;
  public unidadcompraaux : number;
  public familiaaux : number;
  public subfamiliaaux : number;
  public grupoaux : number;
  public subgrupoaux : number;
  public incobfonasaaux : string;
  public tipoincobaux : string;
  public clasificacionaux : number;
  public estadoaux : number;
  public preparadosaux : string;
  public codpactaux : number;
  public codpresaux : number;
  public codffaraux : number;
  public campoaux : string;
  public fechainivigenciaaux : string;
  public fechafinvigenciaaux : string;

  public codigoCompuesto : string;
  
  public grupoID : number;
  public subGrupoID : number;

  public familiaID : number;
  public subFamiliaID : number;

  constructor(public translate: TranslateService,
              private formBuilder: FormBuilder,
              public _SolicitudConsumoService: SolicitudConsumoService,
              private FamiliaService: FamiliaService,
              private SubfamiliasService: SubfamiliaService,
              private _buscabodegasService: BodegasService,
              private UnidadcompraService: UnidadcompraService,
              private FormaFarService: FormaFarService,             
              private PresentaService: PresentaService,
              private _mantencionarticulosService: MantencionarticulosService,
              private router: Router,
              private route: ActivatedRoute,
    ) { 
    this.lForm = this.formBuilder.group({
      mein: [null],
      codigo: [null],
      descripcion: [null],
      tipoproducto:[{ value: null, disabled: false }, Validators.required],
      tiporegistro: [{value:null, disabled:false}],
      tipomedicamento: [null],      
      unidadcompra: [{value:null, disabled:false}],     
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

    this._mantencionarticulosService.ClasificacionProducto(this.usuario, environment.URLServiciosRest.ambiente).subscribe(
      data => {
        this.Clasificacion = data;
      }, err => {
        console.log(err.error);
      }
    );
      
  }

  listarsubgrupos(id_grupo:number){

    this.construyeCodigo();

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
  construyeCodigo(){

    this.grupoID = this.lForm.get('grupoid').value != null? this.lForm.get('grupoid').value : 0;
    this.subGrupoID = this.lForm.get('subgrupoid').value != null? this.lForm.get('subgrupoid').value : 0;
    this.familiaID = this.lForm.get('familia').value != null? this.lForm.get('familia').value : 0;
    this.subFamiliaID = this.lForm.get('subfamilia').value != null? this.lForm.get('subfamilia').value : 0;

    this.codigoCompuesto = this.grupoID +''+ this.subGrupoID +''+ this.familiaID +''+ this.subFamiliaID+''+Math.round(Math.random() * 500);
    this.lForm.get('codigo').setValue(this.codigoCompuesto);  
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

  ConfirmarGuardadoArticulo(datos: any, tipo: String) {
    const Swal = require('sweetalert2');

    if (tipo == "CREAR") {

      Swal.fire({
        title: this.TranslateUtil('key.mensaje.pregunta.crear.articulo'),
        text: this.TranslateUtil('key.mensaje.confirmar.creacion.articulo'),
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: this.TranslateUtil('key.mensaje.aceptar')
      }).then((result) => {
        if (result.value) {         

          this.GuardarArticulos(datos);

          this.GuardarProductosCheck(datos);

          this.alertSwal.title = this.TranslateUtil('key.mensaje.articulo.creado.exitosamente'); //mensaje a mostrar
          this.alertSwal.show();// para que aparezca
        }
      })
    } 
  }

  async GuardarArticulos(value: any) {

    /* vienen seteadas en el ambiente */
    var servidor = environment.URLServiciosRest.ambiente;
    var usuario = environment.privilegios.usuario;

    var estado = 0;

    this.var_Articulo = new Articulos(null);

    this.var_Articulo.hdgcodigo = this.hdgcodigo;
    this.var_Articulo.esacodigo = this.esacodigo;
    this.var_Articulo.cmecodigo = this.cmecodigo;
    this.var_Articulo.codigo = value.codigo;
    this.var_Articulo.descripcion = value.descripcion;
    this.var_Articulo.tiporegistro = value.tiporegistro;
    this.var_Articulo.tipomedicamento = value.tipomedicamento;
    this.var_Articulo.valorcosto = parseFloat(value.valorcosto);
    this.var_Articulo.margenmedicamento = parseFloat(value.margenmedicamento);
    this.var_Articulo.valorventa = parseFloat(value.valorventa);
    this.var_Articulo.unidadcompra = value.unidadcompra;
    this.var_Articulo.unidaddespacho = value.unidaddespacho;
    this.var_Articulo.incobfonasa = value.incobfonasa;
    this.var_Articulo.tipoincob = value.tipoincob;
    this.var_Articulo.usuario = usuario;
    this.var_Articulo.servidor = servidor;
    this.var_Articulo.codffar = value.codffar;
    this.var_Articulo.codpres = value.codpres;
    this.var_Articulo.codpact = value.codpact;

    if (value.estado == 0) {
      estado = 0;
      this.var_Articulo.estado = 0;
    } else {
      if (value.estado == 1) {
        estado = 1;
        this.var_Articulo.estado = 1;
      }
    }

    this.var_Articulo.clasificacion = value.clasificacion;
    this.var_Articulo.recetaretenida = value.recetaretenida;
    this.var_Articulo.controlado = value.controlado;
    this.var_Articulo.solocompra = value.solocompra;
    this.var_Articulo.familia = value.familia;
    this.var_Articulo.subfamilia = value.subfamilia;

    this.var_Articulo.grupo = value.grupoid;
    this.var_Articulo.subgrupo = value.subgrupoid;

   

    try {
      await this._mantencionarticulosService.AddArticulos(this.var_Articulo).toPromise();    
          
    } catch (error) {
          //console.log('[ERROR AGREGAR ARTICULO] ', error);          
    }     
        
  }

  async GuardarProductosCheck(value: any) {

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
    this.var_ProdCheck.accion = "I"

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
        this.tipomedicamentoaux != this.lForm.get('tipomedicamento').value ||
        this.recetaretenidaaux != this.lForm.get('recetaretenida').value ||
        this.controladoaux != this.lForm.get('controlado').value ||
        this.solocompraaux != this.lForm.get('solocompra').value ||
        this.valorcostoaux != this.lForm.get('valorcosto').value ||
        this.margenmedicamentoaux != this.lForm.get('margenmedicamento').value ||
        this.unidaddespachoaux != this.lForm.get('unidaddespacho').value ||
        this.unidadcompraaux != this.lForm.get('unidadcompra').value ||
        this.familiaaux != this.lForm.get('familia').value ||
        this.subfamiliaaux != this.lForm.get('subfamilia').value ||
        this.grupoaux != this.lForm.get('grupoid').value ||
        this.subgrupoaux != this.lForm.get('subgrupoid').value ||
        this.incobfonasaaux != this.lForm.get('incobfonasa').value ||
        this.tipoincobaux != this.lForm.get('tipoincob').value ||
        this.clasificacionaux != this.lForm.get('clasificacion').value ||
        this.estadoaux != this.lForm.get('estado').value ||
        this.preparadosaux != this.lForm.get('preparados').value ||
        this.codpactaux != this.lForm.get('codpact').value ||
        this.codpresaux != this.lForm.get('codpres').value ||
        this.codffaraux != this.lForm.get('codffar').value ||
        this.campoaux != this.lForm.get('campo').value ||
        this.fechainivigenciaaux != this.lForm.get('fechainivigencia').value ||
        this.fechafinvigenciaaux != this.lForm.get('fechafinvigencia').value ) {
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
      solocompra: ' ', 
      controlado: ' ', 
    });
    
    this.detalleconsultaproducto= [];
    this.detalleconsultaproductopag = [];
    this.descprod = null
    this.codprod = null;
    this.desactivaCampos(false);
    this.lForm.controls.codpact.enable();
    this.lForm.controls.codpres.enable();
    this.lForm.controls.codffar.enable();
    this.lForm.controls.controlado.enable();
    this.bloqueabtnbuscar = false;
    this.familias = [];
  }

  Salir(){
    const Swal = require('sweetalert2');
    if( this.meinaux != this.lForm.get('mein').value ||
        this.codigoaux != this.lForm.get('codigo').value ||
        this.descripcionaux != this.lForm.get('descripcion').value ||
        this.tiporegistroaux != this.lForm.get('tiporegistro').value ||
        this.tipomedicamentoaux != this.lForm.get('tipomedicamento').value ||
        this.recetaretenidaaux != this.lForm.get('recetaretenida').value ||
        this.controladoaux != this.lForm.get('controlado').value ||
        this.solocompraaux != this.lForm.get('solocompra').value ||
        this.valorcostoaux != this.lForm.get('valorcosto').value ||
        this.margenmedicamentoaux != this.lForm.get('margenmedicamento').value ||
        this.unidaddespachoaux != this.lForm.get('unidaddespacho').value ||
        this.unidadcompraaux != this.lForm.get('unidadcompra').value ||
        this.familiaaux != this.lForm.get('familia').value ||
        this.subfamiliaaux != this.lForm.get('subfamilia').value ||
        this.grupoaux != this.lForm.get('grupoid').value ||
        this.subgrupoaux != this.lForm.get('subgrupoid').value ||
        this.incobfonasaaux != this.lForm.get('incobfonasa').value ||
        this.tipoincobaux != this.lForm.get('tipoincob').value ||
        this.clasificacionaux != this.lForm.get('clasificacion').value ||
        this.estadoaux != this.lForm.get('estado').value ||
        this.preparadosaux != this.lForm.get('preparados').value ||
        this.codpactaux != this.lForm.get('codpact').value ||
        this.codpresaux != this.lForm.get('codpres').value ||
        this.codffaraux != this.lForm.get('codffar').value ||
        this.campoaux != this.lForm.get('campo').value ||
        this.fechainivigenciaaux != this.lForm.get('fechainivigencia').value ||
        this.fechafinvigenciaaux != this.lForm.get('fechafinvigencia').value ) {

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
