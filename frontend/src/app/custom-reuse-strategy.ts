import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

interface ConfiguracionRutaReusable {
  /** La ruta que se quiere reusar, tal como aparece en el `app-routing.module.ts`. */
  ruta: string;

  /**
   * Ruta tal que si se viene desde una de estas a la página que se quiere reusar se permite el
   * reuso, de lo contrario se va a crear nuevamente. Tiene que ir tal como aparece en el
   * `app-routing.module.ts`
   */
  rutasReusoPermitido: string[];
}

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private rutasReusables: ConfiguracionRutaReusable[] = [
    {
      ruta: 'monitorejecutivo',
      rutasReusoPermitido: [
        'despachorecetasambulatoria/:soliid/:id_reseta/:retorno_pagina',
        'dispensarsolicitudespacientes/:id_solicitud',
        'despachosolicitudes/:id_solicitud/:retorno_pagina',
        'recepcionsolicitudes/:id_solicitud',
      ],
    },
  ];

  private rutasAlmacenadas = new Map<string, DetachedRouteHandle>();

  private ultimaNavegacion: {
    desde?: ActivatedRouteSnapshot;
    hacia?: ActivatedRouteSnapshot;
  } = {};

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    const ruta = route.routeConfig ? route.routeConfig.path : undefined;

    if (!ruta) {
      return false;
    }

    return this.rutasReusables.some((config) => config.ruta === ruta);
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const ruta = route.routeConfig ? route.routeConfig.path : undefined;

    if (!ruta) {
      return;
    }

    this.rutasAlmacenadas.set(ruta, handle);
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const rutaActivada = route.routeConfig ? route.routeConfig.path : undefined;

    if (!rutaActivada) {
      return false;
    }

    const { desde } = this.ultimaNavegacion;
    const rutaOrigen = desde && desde.routeConfig && desde.routeConfig.path ? desde.routeConfig.path : '';

    const puedeReusar = this.rutasReusables.some((config) => {
      const esPaginaReusable = config.ruta === rutaActivada;
      const vieneDeOrigenPermitido = config.rutasReusoPermitido.some((r) => rutaOrigen === r);

      return esPaginaReusable && vieneDeOrigenPermitido;
    });

    return puedeReusar && !!this.rutasAlmacenadas.get(rutaActivada);
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const ruta = route.routeConfig ? route.routeConfig.path : undefined;

    if (!ruta) {
      return null;
    }

    return this.rutasAlmacenadas.get(ruta);
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    this.ultimaNavegacion = { desde: future, hacia: curr };

    return future.routeConfig === curr.routeConfig;
  }
}
