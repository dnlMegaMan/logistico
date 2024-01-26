import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { sistemaEnMantencion } from '../models/informacion-general';
import { InformacionGeneralService } from '../servicios/informacion-general.service';
import { MantencionService } from '../servicios/mantencion.service';
import { NetworkService } from '../servicios/network.service';

@Injectable({
  providedIn: 'root',
})
export class MantencionInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private networkService: NetworkService,
    private modalService: BsModalService,
    private infoGeneralService: InformacionGeneralService,
    private mantencionService: MantencionService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(catchError((event) => this.manejarErrorHttp(event)));
  }

  private manejarErrorHttp(event: any) {
    if (!(event instanceof HttpErrorResponse)) {
      return of(event);
    }

    return this.networkService.estadoRed().pipe(
      take(1),
      map((estadoRed) => {
        const activatedRoute = this.router.routerState.snapshot.url;

        // Ignorar pagina de mantencion, que consulta para ver si la aplicacion esta de vuelta.
        if (activatedRoute.endsWith('/mantencion')) {
          throw event;
        }

        if (event.status === 503 && sistemaEnMantencion(event.error)) {
          this.cerrarDialogos();
          this.router.navigate(['/mantencion']);
          throw event;
        }

        // Error normal desde el servidor => flujo normal
        if (event.status !== 0) {
          throw event;
        }

        // No hay respuesta del servidor y el usuario NO esta conectado => flujo normal
        if (event.status === 0 && estadoRed === 'offline') {
          throw event;
        }

        // SE CAYO EL SERVIDOR
        this.cerrarDialogos();

        if (this.infoGeneralService.redirigirEnCaidaGo()) {
          this.mantencionService.publicarError(event);
          this.router.navigate(['/error-del-servidor']);
          throw event;
        }

        throw event; // => flujo normal
      }),
    );
  }

  private cerrarDialogos() {
    const modalCount = this.modalService.getModalsCount();
    for (let nivelModal = 1; nivelModal <= modalCount; nivelModal++) {
      this.modalService.hide(nivelModal);
    }
  }
}
