import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { Proveedores } from '../../app/models/entity/Proveedores';
import { Proveedores1 } from '../../app/models/entity/Proveedores1';
import { Proveedores2 } from '../../app/models/entity/Proveedores2';
import { HttpClient } from '@angular/common/http';
import { BuscaProveedor } from '../models/entity/BuscaProveedor';
import { Comuna } from '../models/entity/Comuna';
import { ParamEliminaProductodeprov } from '../models/entity/ParamEliminaProductodeprov';
import { ParamGrabaProductoaProv } from '../models/entity/ParamGrabaProductoaProv';
import { Empresas } from '../models/entity/Empresas';
import { Sucursal } from '../models/entity/Sucursal';
import { environment } from '../../environments/environment';


@Injectable()
export class ProveedoresService {
    public urlbuscaproveedorrut     : string = sessionStorage.getItem('enlace').toString().concat('/buscaproveedorporrut');//"http://172.25.108.236:8183/buscaproveedorporrut"; //buscaproveedores
    public urlbuscaproveedorfiltro     : string = sessionStorage.getItem('enlaceoc').toString().concat('/buscaproveedorfiltro');//"http://172.25.108.236:8183/buscaproveedorporrut"; //buscaproveedores
    public urlbuscaproveedornombre  : string = sessionStorage.getItem('enlace').toString().concat('/buscaproveedorpornombre');//"http://172.25.108.236:8183/buscaproveedorpornombre"; //buscaproveedores
    public urlbuscacomuna           : string = sessionStorage.getItem('enlace').toString().concat('/traecomunas');//"http://172.25.108.236:8189/traecomunas";
    public urlBuscarporcodigo       : string = sessionStorage.getItem('enlace').toString().concat('/buscaprodporcodigo');//'http://172.25.108.236:8182/buscaprodporcodigo'; //Busca productos x codigo
    public urlasignaprodabodega     : string = sessionStorage.getItem('enlace').toString().concat('/asignaproductosabodega');//"http://172.25.108.236:8190/asignaproductosabodega";
    public urlprodsporpprovee       : string = sessionStorage.getItem('enlace').toString().concat('/productosxproveedor');//"http://172.25.108.236:8183/productosxproveedor";
    public urleliminaproddeprov     : string = sessionStorage.getItem('enlace').toString().concat('/eliminarprovemein');//"http://172.25.108.236:8183/eliminarprovemein";
    public urlagregaprodaprov       : string = sessionStorage.getItem('enlace').toString().concat('/grabarprovemein');//"http://172.25.108.236:8183/grabarprovemein";
    public urlagrabanuevoprov       : string = sessionStorage.getItem('enlace').toString().concat('/grabarproveedor');//"http://172.25.108.236:8183/grabarproveedor"
    public urlamodificaprov       : string = sessionStorage.getItem('enlace').toString().concat('/modificarproveedor');//"http://172.25.108.236:8183/grabarproveedor"
    public urlbuscaempresa          : string = sessionStorage.getItem('enlace').toString().concat('/buscaempresa');//"http://172.25.108.236:8181/buscaempresa";
    public urlbuscasucursal         : string = sessionStorage.getItem('enlace').toString().concat('/buscasucursal');//"http://172.25.108.236:8181/buscasucursal"

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


    buscaProveedorFiltro(hdgcodigo:number, esacodigo:number, cmecodigo:number, rutprov: number, nombreprov: string, usuario:string,servidor:string): Observable<Proveedores[]> {
        return this._http.post<Proveedores[]>(this.urlbuscaproveedorfiltro, {
            'hdgcodigo'    : hdgcodigo,
            'esacodigo'   : esacodigo,
            'cmecodigo'   : cmecodigo,
            'rutprov': rutprov,
            'nombreprov': nombreprov,
            'usuario'      : usuario,
            'servidor'     : servidor
        });
    }

    buscaProveedorporrut(hdgcodigo:number, esacodigo:number, cmecodigo:number, numerorutprov: number,usuario:string,servidor:string): Observable<any[]> {
        return this._http.post<any[]>(this.urlbuscaproveedorrut, {
            'hdgcodigo'    : hdgcodigo,
            'esacodigo'   : esacodigo,
            'cmecodigo'   : cmecodigo,
            'numerorutprov': numerorutprov,
            'usuario'      : usuario,
            'servidor'     : servidor
        });
    }

    buscaProveedorpornombre(hdgcodigo:number,descripcionprov: string,usuario:string,servidor:string): Observable<BuscaProveedor[]> {
        return this._http.post<BuscaProveedor[]>(this.urlbuscaproveedornombre, {
            'hdgcodigo'      : hdgcodigo,
            'descripcionprov': descripcionprov,
            'usuario'        : usuario,
            'servidor'       : servidor
        });
    }

    BuscaComunas(ciudadcodigo: number,usuario:string, servidor): Observable<Comuna[]> {
  
        return this._http.post<Comuna[]>(this.urlbuscacomuna, {
            'ciudadcodigo': ciudadcodigo,
            'usuario'     : usuario,
            'servidor'    : servidor
        });
    }
    
    buscarProductosporcodigo(codigo: string, tipodeproducto: string,usuario:string,servidor:string): Observable<Proveedores1[]> {
        return this._http.post<Proveedores1[]>(this.urlBuscarporcodigo, {
            'codigo'        : codigo,
            'tipodeproducto': tipodeproducto,
            'usuario'     : usuario,
            'servidor'    : servidor
        });
    }     
    
    AsignaproductosaGrilla(hdgcodigo:number,esacodigo:number,cmecodigo:number, codbodega: number,meincodprod: string,meindesprod: string,
        meintipoprod: string, usuario:string,servidor:string):Observable<Proveedores1[]> {
      
        return this._http.post<Proveedores1[]>(this.urlasignaprodabodega, {
            'hdgcodigo'   : hdgcodigo,
            'esacodigo'   : esacodigo,
            'cmecodigo'   : cmecodigo,
            'codbodega'   : codbodega,
            'meincodprod' : meincodprod,
            'meindesprod' : meindesprod,
            'meintipoprod': meintipoprod,
            'usuario'     : usuario,
            'servidor'    : servidor
        });        
    }

    BuscaProductosporProveedor(idproveedor: number,usuario:string,servidor:string): Observable<Proveedores2[]> {
  
        return this._http.post<Proveedores2[]>(this.urlprodsporpprovee, {
            'idproveedor': idproveedor,
            'usuario'    : usuario,
            'servidor'   : servidor
        });
    }

    EliminaProductodeProveedor(proveedorid: number,productoid: number,usuario:string,servidor:string):Observable<ParamEliminaProductodeprov[]> {
    
        return this._http.post<ParamEliminaProductodeprov[]>(this.urleliminaproddeprov, {
            'proveedorid': proveedorid,
            'productoid' : productoid,
            'usuario'    : usuario,
            'servidor'   : servidor
        });        
    }

    GrabaProductoAProveedor(proveedorid,productoid,productotipo,montoultcom, plazoentrega,
        productovigencia,usuario:string,servidor:string):Observable<ParamGrabaProductoaProv[]> {

        return this._http.post<ParamGrabaProductoaProv[]>(this.urlagregaprodaprov, {
            'proveedorid'       : proveedorid,
            'productoid'        : productoid,
            'productotipo'      : productotipo,
            'montoultcom'       : montoultcom,
            'plazoentrega'      : plazoentrega,
            'productovigencia'  : productovigencia,
            'usuario'           : usuario,
            'servidor'          : servidor
        });        
    }


    GrabaNuevoProveedor(proveedor: Proveedores): Observable<any> {
        return this._http.post(this.urlagrabanuevoprov, proveedor);
      }

      ModificarProveedor(proveedor: Proveedores): Observable<any> {
        return this._http.post(this.urlamodificaprov, proveedor);
      }
}