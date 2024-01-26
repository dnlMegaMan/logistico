import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { Permisosusuario } from '../permisos/permisosusuario';
import { GlobalAlertService } from '../servicios/global-alert.service';

/**
 * Restringe el acceso a una pantalla dependiendo de los permisos que tenga el usuario.
 * 
 * Para usar esta guarda hay que agregarla despues de la guarda `AuthGuard` y ademas se deben indicar
 * los permisos a verificar en la propiedad `data` de la ruta usando una propiedad llamada `permisos`
 * la cual debe ser un arreglo de strings indicando los permisos. Un ejemplo seria el siguiente
 * 
 * ```
 *  {
 *    path: 'mantencionarticulos',
 *    component: MantencionarticulosComponent,
 *    canActivate: [AuthGuard, TienePermisosGuard],
 *    data: { permisos: ['btnmantarticulo'] },
 *  },
 * ``` 
 * 
 * Los permisos se encuentran en la clase `Permisosusuario` en el archivo `permisosusuario.ts`. 
 */
@Injectable({
  providedIn: 'root',
})
export class TienePermisosGuard implements CanActivate {
  constructor(private router: Router, private alertService: GlobalAlertService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const permisosPantalla = next.data.permisos as string[];

    const permisosUsuario = new Permisosusuario();

    if (permisosPantalla.some((p) => permisosUsuario[p] === true)) {
      return true;
    }

    this.mostrarAlertaDePermisos(next);

    /* `currentPath === '/'` pasa cuando se carga la ruta directamente desde la barra de busqueda.
     * Si pasa eso y se devuelve `false` se queda la página en blanco. Con esta condición si se
     * ingresa la página desde la barra de búsqueda y no se cuenta con permisos se va al home, pero 
     * si se intenta acceder desde la aplicación se queda en la misma página.
     */
    const currentPath = this.router.url;
    return currentPath === '/' ? this.router.createUrlTree(['home']) : false;
  }

  private async mostrarAlertaDePermisos(route: ActivatedRouteSnapshot) {
    const ruta = route.url.map((url) => url.path).join('/');

    this.alertService.enviarMensaje({
      titulo: 'Acceso Denegado',
      mensaje: `No tiene permisos para acceder /${ruta}`,
      nivel: 'error',
    });
  }
}
