import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Empresas } from '../models/entity/Empresas';
import { ReposicionArticulos } from '../models/entity/ReposicionArticulos';
import { Solicitud } from '../models/entity/Solicitud';
import { Sucursal } from '../models/entity/Sucursal';

@Injectable()
export class ReposicionArticulosService {
    public urlBuscarpordescripcion  : string = sessionStorage.getItem('enlace').toString().concat('/buscaprodpordescripcion');
    public urlBuscarporcodigo       : string = sessionStorage.getItem('enlace').toString().concat('/buscaprodporcodigo');
    public urlbuscaholding          : string = sessionStorage.getItem('enlace').toString().concat('/buscaholding');
    public urlbuscaempresa          : string = sessionStorage.getItem('enlace').toString().concat('/buscaempresa');
    public urlbuscasucursal         : string = sessionStorage.getItem('enlace').toString().concat('/buscasucursal');
    public urlbuscaregistros        : string = sessionStorage.getItem('enlace').toString().concat('/registrosparareposicion');
    public urlGenerarSolicitud      : string = sessionStorage.getItem('enlace').toString().concat('/grabarsolicitudes'); 


    constructor(public _http: HttpClient) {

    }
       
    BuscaEmpresa(hdgcodigo: number,usuario:string, servidor:string):Observable<Empresas[]> {
        return this._http.post<Empresas[]>(this.urlbuscaempresa, {
            'hdgcodigo': hdgcodigo,
            'usuario'  : usuario,
            'servidor' : servidor
        });
    }

    BuscaSucursal(hdgcodigo: number, esacodigo: number,usuario:string, servidor:string):Observable<Sucursal[]> {
      
        return this._http.post<Sucursal[]>(this.urlbuscasucursal, {
            'hdgcodigo': hdgcodigo,
            'esacodigo': esacodigo,
            'usuario'  : usuario,
            'servidor' : servidor
        });
    }

    BuscaRegistros(
        hdgcodigo: number, esacodigo: number, cmecodigo: number, bodegasolicitante: number, 
        tiporegmein:string, fechabusqueda: string, fechafin: string, usuario: string, 
        servidor: string, tiporeposicion: number, codmei: string, bodegaSuministro: number, 
        tipoBodSuministro: string,
    ): Observable<ReposicionArticulos[]> {
        return this._http.post<ReposicionArticulos[]>(this.urlbuscaregistros, {
            'hdgcodigo'       : hdgcodigo,
            'esacodigo'       : esacodigo,
            'cmecodigo'       : cmecodigo,
            'bodegaorigen'    : bodegasolicitante,
            'tiporegmein'     : tiporegmein,
            'fechainicio'     : fechabusqueda,
            'fechatermino'    : fechafin,
            'usuario'         : usuario,
            'servidor'        : servidor,
            'tiporeposicion'  : tiporeposicion,
            'codmei'          : codmei,
            'bodegasuministro': {
                codigo: bodegaSuministro,
                tipo: tipoBodSuministro,
            },
        });
    }

    
    crearSolicitud(varSolicitud: Solicitud): Observable<any> {
        return this._http.post<any>(this.urlGenerarSolicitud, varSolicitud);
    }
    
}
