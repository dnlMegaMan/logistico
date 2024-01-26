import { Reglas} from '../entity/reglas'

export class EstructuraReglas {
    hdgcodigo ?:number;
	cmecodigo ?:number;
	reglatipo ?:string;
	reglatipobodega ?:string;
	bodegacodigo ?:number;
	idproducto?:number;
	servidor ?:number;
	reglas ?:Reglas[];
}
