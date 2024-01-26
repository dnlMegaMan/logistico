import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Familia } from 'src/app/models/entity/Familia';
import { FormaFar } from 'src/app/models/entity/FormaFar';
import { Presenta } from 'src/app/models/entity/Presenta';
import { PrincAct } from 'src/app/models/entity/PrincAct';
import { SubFamilia } from 'src/app/models/entity/SubFamilia';
import { TipoRegistro } from 'src/app/models/entity/TipoRegistro';
import { UnidadCompra } from 'src/app/models/entity/UnidadCompra';
import { UnidadDespacho } from 'src/app/models/entity/UnidadDespacho';
import { Articulos } from 'src/app/models/entity/mantencionarticulos';
import { ProductosBodegas } from 'src/app/models/entity/productos-bodegas';
import { TipoParametro } from 'src/app/models/entity/tipo-parametro';
import { Permisosusuario } from 'src/app/permisos/permisosusuario';
import { PrincActService } from 'src/app/servicios/PrincAct.service';
import { BodegasService } from 'src/app/servicios/bodegas.service';
import { FamiliaService } from 'src/app/servicios/familia.service';
import { FormaFarService } from 'src/app/servicios/formafar.service';
import { MantencionarticulosService } from 'src/app/servicios/mantencionarticulos.service';
import { PresentaService } from 'src/app/servicios/presenta.service';
import { SubfamiliaService } from 'src/app/servicios/subfamilia.service';
import { UnidadcompraService } from 'src/app/servicios/unidadcompra.service';
import { UnidaddespachoService } from 'src/app/servicios/unidaddespacho.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-agregar-articulos-chile',
  templateUrl: './agregar-articulos-chile.component.html',
  styleUrls: ['./agregar-articulos-chile.component.css']
})
export class AgregarArticulosChileComponent implements OnInit {

  public modelopermisos: Permisosusuario = new Permisosusuario();

  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;// success
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  descprod: any;
  public productoselec : Articulos;

  public lForm: FormGroup;
  public loading  = false;
  public usuario  = environment.privilegios.usuario;
  public servidor = environment.URLServiciosRest.ambiente;
  public detalleconsultaproducto: Array<Articulos> = [];
  public detalleconsultaproductopag: Array<Articulos> = [];
  
  @Input() codprod  : string; // codigo producto
  @Input() tipo_busqueda: string; // = "Todo","Todo-Medico","Medicamentos", "Insumos-Medicos", "Insumos_No_Medicos","Productos_Bodega","Productos_Bodega_Control_Minimo"
  @Input() id_Bodega: number;
  @Input() bodega_productos : ProductosBodegas[];

  public esacodigo: number = 2;
  public cmecodigo: number = 1;
  public hdgcodigo : number = 1;

  public arreglotipoproducto: TipoParametro[] = [];
  public tiposderegistros: Array<TipoRegistro> = [];
  public familias: Array<Familia> = [];
  public subfamilias: Array<SubFamilia> = [];
  public unidadescompra: Array<UnidadCompra> = [];
  public unidadesdespacho: Array<UnidadDespacho> = [];
  public FormaFar: Array<FormaFar> = [];
  public Presenta: Array<Presenta> = [];
  public PrincAct: Array<PrincAct> = [];
  public var_Articulo: Articulos;

  public bloqueabtnbuscar : boolean = false;
  private _BSModalRef: BsModalRef;

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

  constructor(public translate: TranslateService,
              public formBuilder     : FormBuilder,
              private _mantencionarticulosService: MantencionarticulosService,
              private _buscabodegasService: BodegasService,
              private FamiliaService: FamiliaService,
              private SubfamiliasService: SubfamiliaService,
              private UnidadcompraService: UnidadcompraService,
              private FormaFarService: FormaFarService,
              private PresentaService: PresentaService,
              private router: Router,
              private route: ActivatedRoute,
              private UnidaddespachoService: UnidaddespachoService,
              private PrincActService: PrincActService,
    ) {
    this.lForm = this.formBuilder.group({
      mein: [null],
      codigo: [{ value: null, disabled: false }, Validators.required],
      descripcion: [{ value: null, disabled: false }, Validators.required],
      codffar: [{ value: null, disabled: false }, Validators.required],
      codpres: [{ value: null, disabled: false }, Validators.required],
      codpact: [{ value: null, disabled: false }, Validators.required],
      tipoproducto:[{ value: null, disabled: false }, Validators.required],
      controlado: [' ', [Validators.required]], // Es un espacio para que no muestre el campo invalido al iniciar
      estado: [{value:null, disabled:false}],
      tiporegistro: [{value:null, disabled:false}],
      solocompra: [' ', [Validators.required]], // Es un espacio para que no muestre el campo invalido al iniciar
      recetaretenida: [{value:null, disabled:false}],
      familia: [{value:null, disabled:false}],
      subfamilia: [{value:null, disabled:false}],
      unidadcompra: [{value:null, disabled:false}],
      unidaddespacho: [{value:null, disabled:false}],
      fechainivigencia : [{ value: null, disabled : false}],
      fechafinvigencia : [{ value: null, disabled : false}]
    });
   }

  ngOnInit() {

    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
   
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
     
      this.FormaFarService.list(this.usuario, environment.URLServiciosRest.ambiente).subscribe(
        data => {
          this.FormaFar = data;
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

      this.UnidaddespachoService.list(this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo, this.usuario, environment.URLServiciosRest.ambiente).subscribe(
        data => {
          this.unidadesdespacho = data;
  
        }, err => {
          console.log(err.error);
        }
      );

      this.PrincActService.list(this.hdgcodigo,
        this.esacodigo,
        this.cmecodigo, this.usuario, environment.URLServiciosRest.ambiente).subscribe(
        data => {
          this.PrincAct = data;
        }, err => {
          console.log(err.error);
        }
      );
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

  ConfirmarGuradadoArticulo(datos: any, tipo: String) {
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

    this.var_Articulo.fechainiciovigencia = value.fechainivigencia;
    this.var_Articulo.fechafinvigencia = value.fechafinvigencia;

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

    try {
      await this._mantencionarticulosService.AddArticulos(this.var_Articulo).toPromise();
      
          console.log(this.TranslateUtil('key.mensaje.articulo.creado.exitosamente')); 
          this.alertSwal.title = this.TranslateUtil('key.mensaje.articulo.creado.exitosamente'); //mensaje a mostrar
          await this.alertSwal.show();// para que aparezca
    } catch (error) {
          console.log('[ERROR AGREGAR ARTICULO] ', error);          
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
}
