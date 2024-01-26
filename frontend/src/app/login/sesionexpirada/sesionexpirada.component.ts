import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/servicios/login.service';
import { environment } from 'src/environments/environment';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-sesionexpirada',
  templateUrl: './sesionexpirada.component.html',
  styleUrls: ['./sesionexpirada.component.css']
})
export class SesionexpiradaComponent implements OnInit {

  constructor(private loginService: LoginService,
    public translate: TranslateService) {
      translate.use(navigator.language);
    }
  public imagen : string;

  // Carga el color de fondo del aplicativo
  colorFondo = {"background-color": environment.URLServiciosRest.color}

  ngOnInit() {
    this.loginService.logout();
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
      default:
        this.imagen = "barra_supOS_MULTI-LENGUAJEes-CL.jpg";
        break;
      case 'DESARROLLO_CLOUD':
        this.imagen = "barra_supOS_PRODUCTO" + navigator.language + ".jpg";
        break;
      case 'TESTING_CLOUD':
        this.imagen = "barra_supOS_TESTING_CLOUD" + navigator.language + ".jpg";
        break;
    }
  }
}
