import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/map';
import { DistribucionComprasEspeciales } from '../models/entity/DistribucionComprasEspeciales';
import { DistribucionCompra1 } from '../models/entity/DistribucionCompra1';
import { DistribucionCompra2 } from '../models/entity/DistribucionCompra2';
import { DispensaSolicitud } from '../models/entity/DispensaSolicitud';
import { Observable } from 'rxjs';
import { GrabaDistribucion } from '../models/entity/GrabaDistribucion';
import { Empresas } from '../models/entity/Empresas';
import { Sucursal } from '../models/entity/Sucursal';
import { environment } from '../../environments/environment';


@Injectable()
export class DistribucioncomprasespecialesService {
    public urlBuscarproducto            :string  = sessionStorage.getItem('enlace').toString().concat('/prodadistribuir');//"http://172.25.108.236:8192/prodadistribuir";
    public urlBuscarproductounitario    :string  = sessionStorage.getItem('enlace').toString().concat('/productounitario');//"http://172.25.108.236:8192/productounitario";
    public urlBuscanuevoproductounitario: string = sessionStorage.getItem('enlace').toString().concat('/nuevosproductounitario');//"http://172.25.108.236:8192/nuevosproductounitario";
    public urlgrabadist                 : string = sessionStorage.getItem('enlace').toString().concat('/grabafraccionados');//"http://172.25.108.236:8192/grabafraccionados";
    public urleliminaprod               : string = sessionStorage.getItem('enlace').toString().concat('/eliminafraccionados');//"http://172.25.108.236:8192/eliminafraccionados";
    public urlbuscaempresa              : string = sessionStorage.getItem('enlace').toString().concat('/buscaempresa');//"http://172.25.108.236:8181/buscaempresa";
    public urlbuscasucursal             : string = sessionStorage.getItem('enlace').toString().concat('/buscasucursal');//"http://172.25.108.236:8181/buscasucursal"
    
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

    BuscarProductospordescripcion(meincod: string,meindes: string,hdgcodigo: number,
        esacodigo: number,cmecodigo: number,usuario:string,servidor:string): Observable<DistribucionComprasEspeciales[]> {
  
        return this._http.post<DistribucionComprasEspeciales[]>(this.urlBuscarproducto, {
           'meincod'  : meincod,
           'meindes'  : meindes,
           'hdgcodigo': hdgcodigo,
           'esacodigo': esacodigo,
           'cmecodigo': cmecodigo,
           'usuario'  : usuario,
           'servidor' : servidor
        });
    }
     
    BuscarProducto(hdgcodigo:number,esacodigo:number,cmecodigo:number, meinid:number,usuario:string,servidor:string): Observable<DistribucionCompra1[]> {
 
        return this._http.post<DistribucionCompra1[]>(this.urlBuscarproductounitario, {
           'hdgcodigo': hdgcodigo,
           'esacodigo': esacodigo,
           'cmecodigo': cmecodigo,
           'meinid' : meinid,
           'usuario'  : usuario,
           'servidor' : servidor
        });
    }

    BuscarNuevoProducto(hdgcodigo:number, esacodigo:number,cmecodigo:number, usuario:string,servidor:string): Observable<DistribucionCompra2[]> {
  
        return this._http.post<DistribucionCompra2[]>(this.urlBuscanuevoproductounitario, {
            'hdgcodigo': hdgcodigo,
            'esacodigo': esacodigo,
            'cmecodigo': cmecodigo,
            'usuario'  : usuario,
            'servidor' : servidor
        });
    }

    GrabaDistribucion(datosparagrabar): Observable<GrabaDistribucion[]> {

        return this._http.post<GrabaDistribucion[]>(this.urlgrabadist, {
           'datosparagrabar' : datosparagrabar
        });
    }

    EliminaProductodeGrilla(datosparaeliminar): Observable<GrabaDistribucion[]> {
  
        return this._http.post<GrabaDistribucion[]>(this.urleliminaprod, {
           'datosparaeliminar' : datosparaeliminar
        }); //datosparaeliminar
    }
}