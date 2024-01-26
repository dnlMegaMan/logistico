import {ServicioUnidadBodegas} from "../entity/servicio-unidad-bodegas"
import {ProductosBodegas} from "../entity/productos-bodegas"
import {UsuariosBodegas} from "../entity/usuarios-bodegas"
import { EstructuraRelacionBodega } from './estructura-relacion-bodega'


 
export class EstructuraBodega {
    accion       : string;
	hdgcodigo    : number;
	esacodigo    : number;
	cmecodigo    : number;
	codbodega    : number;
	desbodega    : string;
	despachareceta : string;
	estado       : string;
	modificable  : string;
	tipoproducto : string;
	tipobodega   : string;
	glosatipobodega : string;
	glosatiproducto : string;
	servidor        : string;
	fbocodigobodega	: string;
	serviciosunidadbodega : ServicioUnidadBodegas[];
	productosbodega  : ProductosBodegas[];
	usuariosbodega   : UsuariosBodegas[];
	relacionbodegas  : EstructuraRelacionBodega[];
	fbodfraccionable : string;
	bloqueo : string;
}
