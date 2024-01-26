import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BrowserStack } from 'protractor/built/driverProviders';
import { environment } from 'src/environments/environment';
import { Permisosusuario } from '../../permisos/permisosusuario';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public hdgcodigo:number;
  public esacodigo:number;
  public cmecodigo:number;
  public imagen : string;
  public modelopermisos: Permisosusuario = new Permisosusuario();

  mostrarAlerta = false

  noMostrarAlertaNavegadorControl = new FormControl(false)

  constructor(public translate: TranslateService) {}

  ngOnInit() {
    this.verSiMostrarAlertaDelNavegador()

    this.hdgcodigo = Number(sessionStorage.getItem('hdgcodigo').toString());
    this.esacodigo = Number(sessionStorage.getItem('esacodigo').toString());
    this.cmecodigo = Number(sessionStorage.getItem('cmecodigo').toString());

    switch (environment.URLServiciosRest.ambiente) {
      case 'DESARROLLO':
        this.imagen = "barra_supOS_PRODUCTO" + navigator.language + ".jpg";
        break;
      case 'TESTING':
        this.imagen = "barra_supOS_QA" + navigator.language + ".jpg";
        break;
      case 'PRODUCCION':
        this.imagen = "barra_supOS_PROD" + navigator.language + ".jpg";
        break;
      case 'TESTING_PROD':
        this.imagen = "barra_supOS_MULTI-LENGUAJE" + navigator.language + ".jpg";
        break;
      case 'DESARROLLO_CLOUD':
        this.imagen = "barra_supOS_PRODUCTO" + navigator.language + ".jpg";
        break;
      case 'TESTING_CLOUD':
        this.imagen = "barra_supOS_TESTING_CLOUD" + navigator.language + ".jpg";
        break;
      default:
        this.imagen = "barra_supOS_MULTI-LENGUAJEes-CL.jpg";
        break;
    }

  }

  verSiMostrarAlertaDelNavegador() {
    const mostrarAlertaNavegador = localStorage.getItem('alertaNavegador');

    if (!mostrarAlertaNavegador || mostrarAlertaNavegador !== 'N') {
      this.mostrarAlerta = true;
    }
  }

  onCerrarAlerta() {
    if (this.noMostrarAlertaNavegadorControl.value) {
      localStorage.setItem('alertaNavegador', 'N');
    }
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
}
