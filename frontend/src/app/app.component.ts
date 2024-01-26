import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { NavService } from './nav.service';
import { ExpiracionAutomaticaService } from './servicios/expiracion-automatica.service';
import { GlobalAlertService } from './servicios/global-alert.service';
import { InformacionGeneralService } from './servicios/informacion-general.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('alertaGlobal', { static: false }) alertaGlobal: SwalComponent;
  @ViewChild('appDrawer', { static: false }) appDrawer: ElementRef;

  private esDestruido = new Subject<void>();

  constructor(
    private navService: NavService,
    private router: Router,
    private infoGeneralService: InformacionGeneralService,
    private globalAlertService: GlobalAlertService,
    private expiracionAutomaticaService: ExpiracionAutomaticaService,
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.infoGeneralService.notificarUltimaPagina(event.url);
      });
  }

  ngOnDestroy(): void {
    this.esDestruido.next();
    this.esDestruido.complete();
  }

  ngOnInit() {
    sessionStorage.setItem('enlace', environment.URLServiciosRest.URLConexion);
    sessionStorage.setItem('enlacetoken', environment.URLServiciosRest.URLValidate);
    sessionStorage.setItem('enlaceoc', environment.URLServiciosRest.URLOrdenCompra);

    this.globalAlertService
      .mensajeAlerta()
      .pipe(
        takeUntil(this.esDestruido),
        filter((msg) => !!msg),
      )
      .subscribe((msg) => {
        this.alertaGlobal.title = msg.titulo;
        this.alertaGlobal.text = msg.mensaje;
        this.alertaGlobal.type = msg.nivel;
        this.alertaGlobal.show();
      });

    this.expiracionAutomaticaService
      .expiracionAutomatica()
      .pipe(takeUntil(this.esDestruido))
      .subscribe(() => {
        this.router.navigate(['expirada']);
      });
  }

  ngAfterViewInit() {
    this.navService.appDrawer = this.appDrawer;
  }

  @HostListener('window:keydown')
  @HostListener('window:scroll')
  @HostListener('window:click')
  @HostListener('window:mousemove')
  resetearExpiracionDeSesion() {
    this.expiracionAutomaticaService.resetearExpiracionAutomatica();
  }
}
