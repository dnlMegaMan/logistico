import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { delay, map, retryWhen, takeUntil } from 'rxjs/operators';
import { sistemaEnMantencion } from 'src/app/models/informacion-general';
import { InformacionGeneralService } from 'src/app/servicios/informacion-general.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-mantencion',
  templateUrl: './mantencion.component.html',
  styleUrls: ['./mantencion.component.css'],
})
export class MantencionComponent implements OnInit, OnDestroy {
  private readonly esDestruido = new Subject<void>();

  private readonly tiempoReintentarConexionMs = 30 * 1000;

  terminoMantencion = false;

  constructor(private infoGeneralService: InformacionGeneralService,public translate: TranslateService) {
    translate.use(navigator.language);
  }

  ngOnDestroy(): void {
    this.esDestruido.next();
    this.esDestruido.complete();
  }

  ngOnInit() {
    this.infoGeneralService
      .obtenerInformacionGeneral()
      .pipe(
        takeUntil(this.esDestruido),
        map((info) => {
          if (sistemaEnMantencion(info)) {
            throw new Error('sistema-sigue-en-mantencion');
          }

          return info;
        }),
        retryWhen((errors) => this.hayErrorDeConexion(errors)),
      )
      .subscribe({
        next: (x) => {
          this.terminoMantencion = true;
          this.esDestruido.next();
        },
        error: (err) => {
          alert('Error al obtener información general del sistema');
          this.esDestruido.next();
        },
      });
  }

  private hayErrorDeConexion(errors: Observable<any>) {
    return errors.pipe(
      map((error: any) => {
        if (!(error instanceof HttpErrorResponse)) {
          return false
        }

        const errorDeConexion = error.status === 0;
        const aunEnMantencion = error.status === 503 && sistemaEnMantencion(error.error);
        return errorDeConexion || aunEnMantencion;
      }),
      delay(this.tiempoReintentarConexionMs),
    );
  }
}
