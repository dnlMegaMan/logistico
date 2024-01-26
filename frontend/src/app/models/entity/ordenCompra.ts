import { DetalleOC } from "./DetalleOC";

export class OrdenCompra {
    constructor(
        public orcoid               ?: number,
        public orcoprov             ?: number,
        public orcoprovdesc         ?: string,
        public orcouser             ?: string,
        public orcoestado           ?: number,
        public orcoestadodesc       ?: string,
        public orcofechacierre      ?: string,
        public orcofechaanulacion   ?: string,
        public orcouseranulacion   ?: string,
        public orcobodid            ?: number,
        public orcofechaemision     ?: string,
        public orcocondiciondepago  ?: number,
        public servidor              ?: string,
        public orcobandera      ?:number,
        public orconumdoc    ?:number,
        public orcofechadoc ?:string,
        public orcodetalle       ?: DetalleOC[],
        public listadocumentos ?: string,
        public listamein ?: string,
        public modificacioncabecera ?: number,
        public modificaciondetalle ?: number,
    ) { }
}
