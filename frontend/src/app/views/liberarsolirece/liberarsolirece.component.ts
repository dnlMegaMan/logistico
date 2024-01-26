import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { SolicitudService } from 'src/app/servicios/Solicitudes.service';
import { environment } from 'src/environments/environment';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-liberarsolirece',
  templateUrl: './liberarsolirece.component.html',
  styleUrls: ['./liberarsolirece.component.css']
})
export class LiberarsolireceComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  public locale         = 'es';
  public colorTheme     = 'theme-blue';
  public hdgcodigo      : number;
  public esacodigo      : number;
  public cmecodigo      : number;
  public servidor       = environment.URLServiciosRest.ambiente;
  public usuario        = environment.privilegios.usuario;
  // public enlacePublico  = environment.URLServiciosRest.URLValidate;
  public enlacePribado  = environment.URLServiciosRest.URLValidate;

  public FormCambiaEstado   : FormGroup;
  public direccion          : string;
  public checked            : boolean = false;
  public loading            : boolean = false;
  public btnCambio          : boolean = false;


  constructor(
    private formBuilder       : FormBuilder,
    public _solicitudService: SolicitudService,
    private router            : Router,
    private route             : ActivatedRoute,
    public translate: TranslateService
  ) {

    this.FormCambiaEstado = this.formBuilder.group({
      soliid  : [{ value: null, disabled: false }, Validators.required],
      recetaid  : [{ value: null, disabled: false }, Validators.required],
    });
  }

  ngOnInit() { }

  cambiarEstado(){
    if (this.FormCambiaEstado.controls.soliid.value != null ||
        this.FormCambiaEstado.controls.recetaid.value != null) {
      this._solicitudService.ValidaEstadoSolicitudCargada(this.FormCambiaEstado.controls.soliid.value,0,this.servidor,
        ' ',this.FormCambiaEstado.controls.recetaid.value,1).subscribe(
        response => {
          if (response === 'OK') {
            this.alertSwal.title = this.TranslateUtil('key.mensaje.modificacion.exitosa');
            this.alertSwal.show();
          }
        });
    } else {
      this.alertSwalAlert.title = this.TranslateUtil('key.mensaje.debe.ingresar.solicitud.o.receta');
      this.alertSwal.show();
    }

  }

  cambiarEstadoTodo(){
    this._solicitudService.ValidaEstadoSolicitudCargada(0,0,this.servidor,
      ' ',0,1).subscribe(
      response => {
        console.log("response : ", response)
        if (response === "OK") {
          this.alertSwal.title = this.TranslateUtil('key.mensaje.modificacion.exitosa');
          this.alertSwal.show();
        }
       });
  }

  limpiar(){
    this.FormCambiaEstado.reset;
  }

  salir(){
    this.route.paramMap.subscribe(param => {
    this.router.navigate(['home']);
    });
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
