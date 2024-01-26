import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from '../../../environments/environment';
import { TipoRegistro } from '../../models/entity/TipoRegistro';
import { TiporegistroService } from '../../servicios/tiporegistro.service';
import { DatePipe } from '@angular/common';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';

@Component({
  selector: 'app-informeajustesdeprecios',
  templateUrl: './informeajustesdeprecios.component.html',
  styleUrls: ['./informeajustesdeprecios.component.css']
})
export class InformeajustesdepreciosComponent implements OnInit {
  public FormInfAjustePrecios: FormGroup;
  public hdgcodigo      : number;
  public esacodigo      : number;
  public cmecodigo      : number;
  public servidor       = environment.URLServiciosRest.ambiente;
  public usuario        = environment.privilegios.usuario;
  public tiposderegistros: Array<TipoRegistro> = [];
  private _BSModalRef                             : BsModalRef;
  onClose                                         : any;
  bsModalRef                                      : any;
  editField                                       : any;
  public locale                                   = 'es';
  public bsConfig                                 : Partial<BsDatepickerConfig>;
  public colorTheme                               = 'theme-blue';
  

  constructor(
    private formBuilder   : FormBuilder,
    public _BsModalService: BsModalService, 
    public localeService                : BsLocaleService,
    public datePipe                     : DatePipe,
    private TiporegistroService: TiporegistroService

    
  ) {

    this.FormInfAjustePrecios = this.formBuilder.group({
      tipoprod  : [{ value: null, disabled: false }, Validators.required],
      fechadesde: [new Date(), Validators.required],
      fechahasta: [new Date(), Validators.required]
      
    });
   }

  ngOnInit() {
    this.setDate();
    this.TiporegistroService.list(this.hdgcodigo,
      this.esacodigo,
      this.cmecodigo, this.usuario,this.servidor).subscribe(
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
     
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  Limpiar(){
    this.FormInfAjustePrecios.reset();
  }

  ConfirmarImprimirPDF(){
    const Swal = require('sweetalert2');
    Swal.fire({
      title: '¿Desea Imprimir Informe ?',
      text: "Confirmar Impresión",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        this.ImpresionPDF();
      }
    })    

  }

  ImpresionPDF(){
    console.log("Imprime PDF");
  }

  ConfirmarImprimirExcel(){
    const Swal = require('sweetalert2');
    Swal.fire({
      title: '¿Desea Imprimir Informe ?',
      text: "Confirmar Impresión",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        this.ImpresionExcel();
      }
    })    

  }

  ImpresionExcel(){
    console.log("Imprime Excel");
  }

}
