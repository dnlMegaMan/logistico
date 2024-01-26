import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { AjusteStock } from '../models/entity/AjusteStock';
import { HttpClient } from '@angular/common/http';
import { StockProducto } from '../models/entity/StockProducto';
import { TraeAjustes } from '../models/entity/TraeAjustes';
import { Empresas } from '../models/entity/Empresas';
import { Sucursal } from '../models/entity/Sucursal';
import { AsignaBodega } from '../models/entity/AsignaBodega';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AjustestockService {

  //private target_url            = sessionStorage.getItem('enlace').toString().concat('/formadepago');//'http://172.25.108.236:8181/formadepago';
  public urlBuscaprodstock      : string = sessionStorage.getItem('enlace').toString().concat('/buscastockenbodegas');//'http://172.25.108.236:8195/buscastockenbodegas';
  public urlBuscarporcodigo     : string = sessionStorage.getItem('enlace').toString().concat('/buscaprodporcodigo');//'http://172.25.108.236:8182/buscaprodporcodigo'; //Busca productos x codigo
  public urlBuscarpordescripcion: string = sessionStorage.getItem('enlace').toString().concat('/buscaprodpordescripcion');//'http://172.25.108.236:8182/buscaprodpordescripcion'; //Busca productos x descripcion
  public urlBuscastock          : string = sessionStorage.getItem('enlace').toString().concat('/buscastock');//"http://172.25.108.236:8193/buscastock";
  public urlgrabaajustestock    : string = sessionStorage.getItem('enlace').toString().concat('/grabaajustesstock');//"http://172.25.108.236:8195/grabaajustesstock";
  public urlbuscaajustes        : string = sessionStorage.getItem('enlace').toString().concat('/buscaajustestockegas');//"http://172.25.108.236:8195/buscaajustestockegas";
  public urlbuscaempresa        : string = sessionStorage.getItem('enlace').toString().concat('/buscaempresa');//"http://172.25.108.236:8181/buscaempresa";
  public urlbuscasucursal       : string = sessionStorage.getItem('enlace').toString().concat('/buscasucursal');//"http://172.25.108.236:8181/buscasucursal";
  public urlasignabodega        : string = sessionStorage.getItem('enlace').toString().concat('/bodegasparaasignar');//'http://172.25.108.236:8189/bodegasparaasignar';

  constructor(private httpClient: HttpClient,
    public _http: HttpClient) {

  }

  /*public list(usuario:string,servidor:string): Observable<AjusteStock[]> {
    return this.httpClient.post<AjusteStock[]>(this.target_url,{
      'usuario' : usuario,
      'servidor': servidor
    });
  }*/

  BuscaEmpresa(hdgcodigo: number,usuario:string,servidor:string):Observable<Empresas[]> {
    return this._http.post<Empresas[]>(this.urlbuscaempresa, {
      'hdgcodigo': hdgcodigo,
      'usuario'  : usuario,
      'servidor' : servidor
    });
  }

  BuscaSucursal(hdgcodigo: number, esacodigo: number,usuario:string,servidor:string):Observable<Sucursal[]> {
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

  BuscarProductoBodega(hdgcodigo: number, esacodigo: number,cmecodigo:number, bodegacodigo: number,productodesc:string, productocodi: string,usuario:string,servidor:string): Observable<AjusteStock[]> {
    return this._http.post<AjusteStock[]>(this.urlBuscaprodstock, {
      'hdgcodigo'     : hdgcodigo,
      'esacodigo'     : esacodigo,
      'cmecodigo'     : cmecodigo,
      'bodegacodigo'  : bodegacodigo,
      'productodesc'  : productodesc,
      'productocodi'  : productocodi,
      'usuario'       : usuario,
      'servidor'      : servidor
    });
  }
  BuscarProductoporCodigo(codigo: string,usuario:string,servidor:string): Observable<AjusteStock[]> {
    return this._http.post<AjusteStock[]>(this.urlBuscarporcodigo, {
      'codigo'  : codigo,
      'usuario' : usuario,
      'servidor': servidor
    });
  }

  buscarProductospordescripcion(descripcion: string,usuario:string,servidor:string): Observable<AjusteStock[]> {
    return this._http.post<AjusteStock[]>(this.urlBuscarpordescripcion, {
      'descripcion': descripcion,
      'usuario'    : usuario,
      'servidor'   : servidor
    });
  }

  BuscaStockProd(hdgcodigo: number, esacodigo: number,cmecodigo:number, meinid: number, bodegaorigen: number,usuario:string,servidor:string): Observable<StockProducto[]> {
    return this._http.post<StockProducto[]>(this.urlBuscastock, {
       'hdgcodigo': hdgcodigo,
       'esacodigo': esacodigo,
       'cmecodigo': cmecodigo,
       'meinid'       : meinid,
       'bodegaorigen' : bodegaorigen,
       'usuario'      : usuario,
       'servidor'     : servidor
    });
  }

  GrabaNuevoStock(paramajustestock): Observable<StockProducto[]> {
    return this._http.post<StockProducto[]>(this.urlgrabaajustestock, {
       'paramajustestock': paramajustestock
    });
  }
  BuscadorAjustes(fechaajusteini: string,fechaajustefin:string,bodegacodigo:number,
    responsable: string,productotipo:string,tipomotivoajus: string,usuario:string,servidor:string): Observable<TraeAjustes[]> {
    return this._http.post<TraeAjustes[]>(this.urlbuscaajustes, {
      'fechaajusteini'  : fechaajusteini,
      'fechaajustefin'  : fechaajustefin,
      'bodegacodigo'    : bodegacodigo,
      'responsable'     : responsable,
      'productotipo'    : productotipo,
      'tipomotivoajus'  : tipomotivoajus,
      'usuario'         : usuario,
      'servidor'        : servidor
    });   
  }
}