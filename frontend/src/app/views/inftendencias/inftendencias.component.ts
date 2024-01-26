import { Component, OnInit,ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Permisosusuario } from '../../permisos/permisosusuario';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { DatePipe } from '@angular/common';
import { BodegasTodas } from 'src/app/models/entity/BodegasTodas';
import { BodegasService } from '../../servicios/bodegas.service';
import { InformesService } from '../../servicios/informes.service';

@Component({
  selector: 'app-inftendencias',
  templateUrl: './inftendencias.component.html',
  styleUrls: ['./inftendencias.component.css'],
  providers: [InformesService]
})
export class InftendenciasComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public modelopermisos         : Permisosusuario = new Permisosusuario();
  public FormInfTendencias      : FormGroup;
  public hdgcodigo              : number;
  public esacodigo              : number;
  public cmecodigo              : number;
  public usuario                = environment.privilegios.usuario;
  public servidor               = environment.URLServiciosRest.ambiente;
  public bodegasSolicitantes    : Array<BodegasTodas> = [];
  private _BSModalRef           : BsModalRef;
  public bsConfig               : Partial<BsDatepickerConfig>;
  public locale                 = 'es';
  public colorTheme             = 'theme-blue';
  public btnimprime             : boolean = false;

  constructor(
    private formBuilder             : FormBuilder,
    public _BodegasService          : BodegasService,
    public localeService            : BsLocaleService,
    public datePipe                 : DatePipe,
    private _imprimesolicitudService: InformesService,
  ) {

    this.FormInfTendencias = this.formBuilder.group({
      bodcodigo : [{ value: null, disabled: false }, Validators.required],
      tiporeg   : [{ value: null, disabled: false }, Validators.required],
      fechaini  : [new Date(), Validators.required],
      fechafin  : [new Date(), Validators.required],
      hdgcodigo : [{ value: null, disabled: false }, Validators.required],
      esacodigo : [{ value: null, disabled: false }, Validators.required],
      cmecodigo : [{ value: null, disabled: false }, Validators.required],

    });
   }

  ngOnInit() {
    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());
    this.usuario = sessionStorage.getItem('Usuario').toString();
    this.BuscaBodegaSolicitante();
    this.FormInfTendencias.controls.tiporeg.disable();
    this.FormInfTendencias.controls.fechaini.disable();
    this.FormInfTendencias.controls.fechafin.disable();

    this.setDate();
  }

  setDate() {
    defineLocale(this.locale, esLocale);
    this.localeService.use(this.locale);
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
  }

  BuscaBodegaSolicitante() {
    this._BodegasService.listaBodegaTodasSucursal(this.hdgcodigo, this.esacodigo, this.cmecodigo, this.usuario, this.servidor).subscribe(
      response => {
        if (response != null) {
          this.bodegasSolicitantes = response;
        }
      },
      error => {
        alert("Error al Buscar Bodegas de cargo");
      }
    );
  }

  ActivaTipoRegistro(){
    this.FormInfTendencias.controls.tiporeg.enable();
  }

  ActivaFechasYBtnImprimir(){
    this.FormInfTendencias.controls.fechaini.enable();
    this.FormInfTendencias.controls.fechafin.enable();
    this.btnimprime = true;
  }

  Imprimir(tiporeporte: string) {
    let fecha1
    let fecha2
    let fecha3
    let fecha4
    console.log("Imprime datos",this.servidor,this.usuario,tiporeporte,
    this.FormInfTendencias.value.bodcodigo,
    this.FormInfTendencias.value.tiporeg,
    this.datePipe.transform(this.FormInfTendencias.value.fechaini, 'yyyy-MM-dd'),
    this.datePipe.transform(this.FormInfTendencias.value.fechafin, 'dd-MM-yyyy'),
    this.hdgcodigo,this.esacodigo,this.cmecodigo)


    fecha3 = this.FormInfTendencias.value.fechaini
    fecha4 = this.FormInfTendencias.value.fechafin

    console.log("fecha3:",fecha3,"fecha4:", fecha4)

    let same = fecha3.getTime() === fecha4.getTime() || fecha3.getTime() < fecha4.getTime();

    console.log("same", same)


    if(fecha3 > fecha4){
      console.log("fecha inicial mayor a fecha final")
      this.alertSwalAlert.title = "La fecha de inicio es mayor a la fecha final";
      this.alertSwalAlert.text = "Ingrese otra fecha de inicio";
      this.alertSwalAlert.show();
    }else{
      if(fecha3 <= fecha4){
        console.log("fecha inical menor o igual a fecha final, entra")
        if(tiporeporte === 'pdf'){
          this._imprimesolicitudService.RPTImprimeTendenciasConsumoBodegas(this.servidor,this.usuario,
            "pdf",this.FormInfTendencias.value.tiporeg,0,
            this.datePipe.transform(this.FormInfTendencias.value.fechaini, 'yyyy-MM-dd'),
            this.datePipe.transform(this.FormInfTendencias.value.fechafin, 'yyyy-MM-dd'),
            this.FormInfTendencias.value.bodcodigo,
            this.hdgcodigo,this.esacodigo,this.cmecodigo).subscribe(
              response => {
                if (response != null) {
                  window.open(response[0].url, "", "", true);
                }
              },
              error => {
                console.log(error);
                this.alertSwalError.title = "Error al Imprimir Listado";
                this.alertSwalError.show();
                this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
                })
              }
            );
        }else{
          if(tiporeporte === 'xls'){
            console.log("Imprime datos",this.servidor,this.usuario,tiporeporte,
            this.FormInfTendencias.value.bodcodigo,
            this.FormInfTendencias.value.tiporeg,this.hdgcodigo,this.esacodigo,this.cmecodigo)

            this._imprimesolicitudService.RPTImprimeTendenciasConsumoBodegas(this.servidor,this.usuario,
              "xls",this.FormInfTendencias.value.tiporeg,0,
              this.datePipe.transform(this.FormInfTendencias.value.fechaini, 'yyyy-MM-dd'),
              this.datePipe.transform(this.FormInfTendencias.value.fechafin, 'yyyy-MM-dd'),
              this.FormInfTendencias.value.bodcodigo,
              this.hdgcodigo,this.esacodigo,this.cmecodigo).subscribe(
                response => {
                  if (response != null) {
                    window.open(response[0].url, "", "", true);
                  }
                },
                error => {
                  console.log(error);
                  this.alertSwalError.title = "Error al Imprimir Listado";
                  this.alertSwalError.show();
                  this._BSModalRef.content.onClose.subscribe((RetornoExito: any) => {
                  })
                }
              );
          }
        }

      }
    }



  }

  limpiar() {
    this.FormInfTendencias.reset();
    this.FormInfTendencias.get('fechaini').setValue(new Date());
    this.FormInfTendencias.get('fechafin').setValue(new Date());
    this.FormInfTendencias.controls.tiporeg.disable();
    this.FormInfTendencias.controls.fechaini.disable();
    this.FormInfTendencias.controls.fechafin.disable();
    this.btnimprime = false;
  }

}
