import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
//import { DistribucionComprasEspeciales } from '../models/entity/DistribucionComprasEspeciales';
import { Observable } from 'rxjs';
import { UrlReporte } from '../models/entity/Urlreporte';
import { GeneraInventarioSistema } from '../models/entity/GeneraInventarioSistema';
import { IngresoConteoManual } from '../models/entity/IngresoConteoManual';
import { InventarioDetalle } from '../models/entity/InventarioDetalle';
import { Empresas } from '../models/entity/Empresas';
import { Sucursal } from '../models/entity/Sucursal';
import { AsignaBodega } from '../models/entity/AsignaBodega';
import { environment } from '../../environments/environment';



@Injectable()
export class GeneraajusteinventarioService {
    public urlgenerainv      : string = sessionStorage.getItem('enlace').toString().concat('/generainventario');//"http://172.25.108.236:8195/generainventario";
    public urlperiodoinv     : string = sessionStorage.getItem('enlace').toString().concat('/periodosinventarios');//"http://172.25.108.236:8187/periodosinventarios";
    public urlbuscainventario: string = sessionStorage.getItem('enlace').toString().concat('/ConsultaInventario');//"http://172.25.108.236:8195/ConsultaInventario";
    public urlgrabaajuste    : string = sessionStorage.getItem('enlace').toString().concat('/grabaajustes');//"http://172.25.108.236:8195/grabaajustes";
    public urlbuscaempresa   : string = sessionStorage.getItem('enlace').toString().concat('/buscaempresa');//"http://172.25.108.236:8181/buscaempresa";
    public urlbuscasucursal  : string = sessionStorage.getItem('enlace').toString().concat('/buscasucursal');//"http://172.25.108.236:8181/buscasucursal"
    public urlasignabodega   : string = sessionStorage.getItem('enlace').toString().concat('/bodegasparaasignar');//'http://172.25.108.236:8189/bodegasparaasignar';
    
    
    constructor(public _http: HttpClient) {

    }

    BuscaEmpresa(hdgcodigo: number,usuario:string,servidor: string):Observable<Empresas[]> {

        return this._http.post<Empresas[]>(this.urlbuscaempresa, {
            'hdgcodigo': hdgcodigo,
            'usuario'  : usuario,
            'servidor' : servidor
        });
      }
    
      BuscaSucursal(hdgcodigo: number, esacodigo: number,usuario:string,servidor: string):Observable<Sucursal[]> {

          return this._http.post<Sucursal[]>(this.urlbuscasucursal, {
              'hdgcodigo': hdgcodigo,
              'esacodigo': esacodigo,
              'usuario'  : usuario,
              'servidor' : servidor
          });
      }
    
      AsignaBodega(hdgcodigo: number,esacodigo: number,cmecodigo:number,usuario:string,servidor:string): Observable<AsignaBodega[]> {
          return this._http.post<AsignaBodega[]>(this.urlasignabodega, {
              'hdgcodigo' : hdgcodigo,
              'esacodigo' : esacodigo,
              'cmecodigo' : cmecodigo,
              'usuario'   : usuario,
              'servidor'  : servidor
          });
      }
    BuscaPeriodo(bodegainv:number,usuario:string, servidor:string):Observable<IngresoConteoManual[]> {
     
        return this._http.post<IngresoConteoManual[]>(this.urlperiodoinv, {
            'bodegainv' : bodegainv,
            'usuario'   : usuario,
            'servidor'  : servidor
        });
    }

    BuscaDetalleInventario(fechagenerainv:string,bodegainv:number,tipoproductoinv:string,usuario:string, servidor:string, hdgcodigo:number, esacodigo:number, cmecodigo:number):Observable<InventarioDetalle[]> {

        return this._http.post<InventarioDetalle[]>(this.urlbuscainventario, {
            'fechagenerainv'  : fechagenerainv,
            'bodegainv'       : bodegainv,
            'tipoproductoinv' : tipoproductoinv,
            'usuario'         : usuario,
            'servidor'        : servidor,
            'hdgcodigo'      : hdgcodigo,
            'esacodigo'      : esacodigo,
            'cmecodigo'      : cmecodigo                
        });
    }
    GeneraInventario(fechagenerainv:string,bodegainv:number,tipoproductoinv:string,usuario:string, servidor:string):Observable<GeneraInventarioSistema[]> {
      
        return this._http.post<GeneraInventarioSistema[]>(this.urlgenerainv, {
            'fechagenerainv'    : fechagenerainv,
            'bodegainv'         : bodegainv,
            'tipoproductoinv'   : tipoproductoinv,
            'usuario'           : usuario,
            'servidor'          : servidor
        });
    }
    
    GrabaAjuste(paraminvajuste):Observable<InventarioDetalle[]> {
      
        return this._http.post<InventarioDetalle[]>(this.urlgrabaajuste, {
            'paraminvajuste'  : paraminvajuste                
        });
    }

    
    
}