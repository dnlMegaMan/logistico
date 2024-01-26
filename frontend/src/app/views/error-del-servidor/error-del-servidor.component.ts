import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ComponenteDesactivable } from 'src/app/models/componente-desactivable';
import { InformacionGeneralService } from 'src/app/servicios/informacion-general.service';
import { MantencionService } from 'src/app/servicios/mantencion.service';
import { environment } from 'src/environments/environment';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-error-del-servidor',
  templateUrl: './error-del-servidor.component.html',
  styleUrls: ['./error-del-servidor.component.css'],
})
export class ErrorDelServidorComponent implements OnInit, OnDestroy, ComponenteDesactivable {
  @ViewChild('alertSwal', { static: false }) alertSwal: SwalComponent;
  @ViewChild('alertSwalAlert', { static: false }) alertSwalAlert: SwalComponent;
  @ViewChild('alertSwalError', { static: false }) alertSwalError: SwalComponent;

  private readonly esDestruido = new Subject<void>();
  public imagen : string = 'logoSonda.jpg';
  colorFondo = {"background-color": environment.URLServiciosRest.color}

  servidor = environment.URLServiciosRest.ambiente;
  usuario = ''
  ahora = new Date()
  ultimaPaginaNavegada = '';
  errores: HttpErrorResponse[] = [];

  reiniciandoServicios = false;
  serviciosReiniciados = false;

  constructor(
    private router: Router,
    private mantencionService: MantencionService,
    private infoGeneralService: InformacionGeneralService,
    public translate: TranslateService
  ) {
    translate.use(navigator.language);
  }

  puedeDesactivar(): boolean {
    return !this.reiniciandoServicios;
  }

  mensajeDesactivacionFallida() {
    return this.TranslateUtil('key.mensaje.no.puede.abandonar.pagina.reinicio')
  }

  ngOnDestroy(): void {
    this.esDestruido.next();
    this.esDestruido.complete();
  }

  ngOnInit() {
    this.usuario = sessionStorage.getItem('Usuario').toString();

    combineLatest([
      this.mantencionService.obtenerErrores(),
      this.infoGeneralService.ultimaPaginaNavegada(),
    ])
      .pipe(takeUntil(this.esDestruido))
      .subscribe(([errores, ultimaPagina]) => {
        console.warn('[ERRORES DE SISTEMA] ', errores);
        this.errores = errores;
        this.ultimaPaginaNavegada = ultimaPagina;
      });

    this.router.events.pipe(takeUntil(this.esDestruido)).subscribe((event) => {
      if (event instanceof NavigationStart && !event.url.includes('/error-del-servidor')) {
        this.mantencionService.resetearErrores();
      }
    });

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

  ambienteHabilitadoParaReiniciar() {
    return this.servidor === 'DESARROLLO' || this.servidor === 'TESTING';
  }

  async reiniciarServicios() {
    try {
      this.reiniciandoServicios = true;

      await this.mantencionService.reiniciarServicios();

      this.serviciosReiniciados = true;
    } catch (error) {
      this.serviciosReiniciados = false;

      console.error('[ERROR REINICIAR SERVICIOS] ', error);

      this.alertSwalError.title = this.TranslateUtil('key.mensaje.error.reiniciar.servicios');
      await this.alertSwalError.show();
    } finally {
      this.reiniciandoServicios = false;
    }
  }

  TranslateUtil(value : string){
    this.translate.get(value).subscribe((text:string) => { value= text;});
    return value;
  }
}
