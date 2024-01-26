import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { ConsularInformeListaConteoInventario } from "../models/entity/filtroinformelistaconteoinventario/ConsularInformeListaConteoInventario";
import { Observable } from "rxjs";

@Injectable()
export class InflistaconteoinventarioService {
  public urlfiltroinformelistaconteoinventario: string = sessionStorage.getItem('enlace').toString().concat('/filtroinformelistaconteoinventario');
  public urlfiltrogenerarajusteinventario: string = sessionStorage.getItem('enlace').toString().concat('/filtrogenerarajusteinventario');
  public urlfiltrogenerarinventariosistemas: string = sessionStorage.getItem('enlace').toString().concat('/filtrogenerarinventariosistemas');
  public urlfiltroinventariovalorizado: string = sessionStorage.getItem('enlace').toString().concat('/filtroinventariovalorizado');

  constructor(public _http: HttpClient) { }

  private getHES() {
    return {
      hdgcodigo: Number(sessionStorage.getItem('hdgcodigo').toString()),
      esacodigo: Number(sessionStorage.getItem('esacodigo').toString()),
      cmecodigo: Number(sessionStorage.getItem('cmecodigo').toString()),
      servidor: environment.URLServiciosRest.ambiente,
      usuario: sessionStorage.getItem('Usuario').toString()
    }
  }

  filtro(): Observable<ConsularInformeListaConteoInventario> {
    return this._http.post<ConsularInformeListaConteoInventario>(this.urlfiltroinformelistaconteoinventario, {
      ...this.getHES()
    });
  }

  filtroGenerarAjuste(): Observable<ConsularInformeListaConteoInventario> {
    return this._http.post<ConsularInformeListaConteoInventario>(this.urlfiltrogenerarajusteinventario, {
      ...this.getHES()
    });
  }

  filtroGenerarinventarioSistemas(): Observable<ConsularInformeListaConteoInventario> {
    return this._http.post<ConsularInformeListaConteoInventario>(this.urlfiltrogenerarinventariosistemas, {
      ...this.getHES()
    });
  }

  filtroInventariovValorizado(): Observable<ConsularInformeListaConteoInventario> {
    return this._http.post<ConsularInformeListaConteoInventario>(this.urlfiltroinventariovalorizado, {
      ...this.getHES()
    });
  }
}
