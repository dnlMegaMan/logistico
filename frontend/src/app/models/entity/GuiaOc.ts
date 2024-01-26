import { DetalleMovimientoOc } from "./detalleMovimientoOc";
import { LoteOc } from "./LoteOc";


export class GuiaOc {
    id ?: number;
	provid ?: number;
	numerodoc ?: number;
	fechaemision ?: string;
	fecharecepcion  ?: string;
	fechaactualizacion ?: string;
	cantidaditems ?: number;
	cantidadunidades ?: number;
	monto ?: number;
	tipo ?: number;
	servidor ?: string;
	detallemov ?: DetalleMovimientoOc[];
	responsable ?: string;
	bodcodigo ?: number;
	numdoc ?: number;
	rutprov ?: number;
	tipodoc ?: number;
	montototal ?: string;
}