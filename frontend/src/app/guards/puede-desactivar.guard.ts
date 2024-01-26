import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { ComponenteDesactivable } from '../models/componente-desactivable';

@Injectable({
  providedIn: 'root',
})
export class PuedeDesactivarGuard implements CanDeactivate<ComponenteDesactivable> {
  canDeactivate(
    component: ComponenteDesactivable,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot,
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    if (component.puedeDesactivar && component.puedeDesactivar()) {
      return true;
    }

    alert(component.mensajeDesactivacionFallida());

    return false;
  }
}
