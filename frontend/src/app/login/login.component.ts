import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { environment } from '../../environments/environment';
import { versionesCoinciden } from '../models/informacion-general';
import { InformacionGeneralService } from '../servicios/informacion-general.service';
import { LoginService } from '../servicios/login.service';
import { stringSinEspaciosAlrededor } from '../validadores/string-sin-espacios-alrededor';

import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent; //Componente para visualizar alertas
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;
  @ViewChild('alertSwalConfirmar', { static: false }) alertSwalConfirmar: SwalComponent;
  @ViewChild('alertSwalGrilla', { static: false }) alertSwalGrilla: SwalComponent;

  readonly version = environment.URLServiciosRest.fechaVersion;
  loading = false;
  cargoInformacionGeneral = false;

  FormLogin = this.formBuilder.group({
    usuario: ['', [Validators.required, Validators.maxLength(30)]],
    password: ['', [Validators.required, Validators.maxLength(30), stringSinEspaciosAlrededor()]],
  });

  constructor(
    private loginService: LoginService,
    private formBuilder: FormBuilder,
    private router: Router,
    private infoGeneralService: InformacionGeneralService,
    public translate: TranslateService,
  ) {

    translate.use(navigator.language);
    localStorage.removeItem('language');
    
    this.FormLogin = this.formBuilder.group({

      usuario: [null, Validators.compose([Validators.required,
        Validators.minLength(1), Validators.maxLength(30)])],

        password: [null, Validators.compose([Validators.required,
        Validators.minLength(1), Validators.maxLength(30)])]

    });
   }
  ngOnInit() {
    /**
     * @deprecated
     * Estos enlaces se deberian poder eliminar si es que no se usa sessionStorage.clear() en
     * ninguna parte de la aplicación ya que se cargan en el app.component.ts al momento de cargar
     * la aplicacion.
     */
    sessionStorage.setItem('enlace', environment.URLServiciosRest.URLConexion);
    sessionStorage.setItem('enlacetoken', environment.URLServiciosRest.URLValidate);
    sessionStorage.setItem('enlaceoc', environment.URLServiciosRest.URLOrdenCompra);

    this.infoGeneralService
      .obtenerInformacionGeneral()
      .toPromise()
      .then((infoGeneral) => {
        const versionGo = environment.URLServiciosRest.fechaVersionGo;
        const versionAngular = environment.URLServiciosRest.fechaVersionAngular;

        if (!versionesCoinciden(infoGeneral, versionGo, versionAngular)) {
          this.router.navigate(['/version-incorrecta']);
          return;
        }
      })
      .finally(() => {
        this.cargoInformacionGeneral = true;
      });
  }

  async autenticacion() {
    this.loading = true;

    try {
      await this.loginService.login(this.FormLogin.value.usuario, this.FormLogin.value.password);

      this.loading = false;

      this.router.navigate(['home']);
    } catch (error) {
      this.loading = false;
      console.error('[ERROR EN EL LOGIN] ', error);

      this.alertSwalError.title = 'Usuario o contraseña incorrecta';
      this.alertSwalError.text = 'Favor intentar nuevamente';
      await this.alertSwalError.show();
    }
}
  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
