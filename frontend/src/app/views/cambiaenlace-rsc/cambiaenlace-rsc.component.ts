import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cambiaenlace-rsc',
  templateUrl: './cambiaenlace-rsc.component.html',
  styleUrls: ['./cambiaenlace-rsc.component.css']
})
export class CambiaenlaceRscComponent implements OnInit {

  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;//Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  public FormCambiaEnlace   : FormGroup;
  public direccion          : string;
  public checked            : boolean = false;
  public loading            : boolean = false;
  public btnCambio          : boolean = false;

  // enlacePublico = environment.URLServiciosRest.URLValidate;
  enlacePrivado = environment.URLServiciosRest.URLValidate;

  constructor(
    private formBuilder       : FormBuilder,
    private router            : Router,
    private route             : ActivatedRoute,
  ) {

    this.FormCambiaEnlace = this.formBuilder.group({

      direccionuno  : [{ value: null, disabled: false }, Validators.required],

    });
  }



  ngOnInit() {
    // switch(sessionStorage.getItem('enlace').toString()){
    //   case 'http://198.41.33.200:8091' : // Publica
    //     this.checked = true;
    //     break;
    //   case 'http://10.188.182.77:8091': // Privada
    //     this.checked = false;
    //     break;
    //   default:
    //     this.checked = true;
    //     break;
    // }
  }

  Seleccionachec(event: any, seleccion: any){
    this.direccion = event.target.value;
    if (this.direccion != sessionStorage.getItem('enlace').toString()){
      this.btnCambio = true;
    } else {
      this.btnCambio = false;
    }
  }

  limpiar(){
    // switch(sessionStorage.getItem('enlace').toString()){
    //   case environment.URLServiciosRest.URLValidate: // Publica
    //     this.FormCambiaEnlace.get('direccionuno').setValue('publica');
    //     this.checked = true;
    //     break;
    //   case environment.URLServiciosRest.URLConexion: // Privada
    //   this.FormCambiaEnlace.get('direccionuno').setValue('privada');
    //     this.checked = false;
    //     break;
    //   default:
    //     this.checked = true;
    //     break;
    // }
  }

  cambiarEnlace(){
    this.loading = true;
    const Swal = require('sweetalert2');
    Swal.fire({
      title: '¿Seguro desea cambiar de enlace?',
      text: "La pantalla se refrescará.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        this.switchConexion();
      }
    });
    this.loading = false;
  }

  salir(){
    this.route.paramMap.subscribe(param => {
      this.router.navigate(['home']);
    });
  }

  sleep(milliseconds){
    const date = Date.now();
    let currentDate = null;
    do{
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

  switchConexion(){
  //   var text : string = "";
  //   this.loading = true;
  //   switch(this.FormCambiaEnlace.controls.direccionuno.value){
  //     case 'publica' :
  //       text = environment.URLServiciosRest.URLConexion;
  //       sessionStorage.setItem('enlace',environment.URLServiciosRest.URLConexion);
  //       sessionStorage.setItem('enlacetoken',environment.URLServiciosRest.URLValidate);
  //       break;
  //     case 'privada':
  //       text = environment.URLServiciosRest.URLConexion;
  //       sessionStorage.setItem('enlace',environment.URLServiciosRest.URLConexio);
  //       sessionStorage.setItem('enlacetoken',environment.URLServiciosRest.URLValidate);
  //       break;
  //     default:
  //       text = environment.URLServiciosRest.URLConexion;
  //       sessionStorage.setItem('enlace',environment.URLServiciosRest.URLConexion);
  //       sessionStorage.setItem('enlacetoken',environment.URLServiciosRest.URLValidate);
  //       break;

  //   }
  //   location.reload();
  //   this.loading = false;
  }
}
