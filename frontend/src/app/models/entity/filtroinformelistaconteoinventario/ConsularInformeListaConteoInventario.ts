import { ClinfarParamBodResponse } from "./ClinfarParamBodResponse";
import { ClinfarParamProResponse } from "./ClinfarParamProResponse";

export class ConsularInformeListaConteoInventario {
  constructor(
    public listaTipoProductos: ClinfarParamProResponse[],
    public listaGrupoArticulos: ClinfarParamProResponse[],
    public listaBodegas: ClinfarParamBodResponse[],
    public cantidadRegistrada: number,
  ) { }
}
