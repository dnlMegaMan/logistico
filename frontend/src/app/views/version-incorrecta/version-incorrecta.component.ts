import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InformacionGeneral } from 'src/app/models/informacion-general';
import { InformacionGeneralService } from 'src/app/servicios/informacion-general.service';
import { environment } from 'src/environments/environment';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-version-incorrecta',
  templateUrl: './version-incorrecta.component.html',
  styleUrls: ['./version-incorrecta.component.css'],
})
export class VersionIncorrectaComponent implements OnInit, OnDestroy {
  private readonly esDestruido = new Subject<void>();

  mostrarAyuda = false

  versionEnUsoAngular = environment.URLServiciosRest.fechaVersionAngular.split(' ').pop();
  versionEnUsoGo = environment.URLServiciosRest.fechaVersionGo.split(' ').pop();

  informacionGeneral?: InformacionGeneral;
  ultimaVersionAngular = '';
  ultimaVersionGo = '';

  constructor(private informacionGeneralService: InformacionGeneralService, public translate: TranslateService) {
    translate.use(navigator.language);
  }

  ngOnDestroy(): void {
    this.esDestruido.next();
    this.esDestruido.complete();
  }

  ngOnInit() {
    this.informacionGeneralService
      .obtenerInformacionGeneral()
      .pipe(takeUntil(this.esDestruido))
      .subscribe((info) => {
        this.informacionGeneral = info;
        this.ultimaVersionAngular = this.informacionGeneral.versionAngular.split(' ').pop();
        this.ultimaVersionGo = this.informacionGeneral.versionGo.split(' ').pop();
      });
  }

  toggleAyuda() {
    this.mostrarAyuda = !this.mostrarAyuda
  }
}
