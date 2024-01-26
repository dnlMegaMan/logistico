import {DevolucionFraccionamiento} from "../entity/DevolucionFraccionamiento"

export class DevolucionFraccionado{
    constructor (

      public servidor   ?: string,
      public usuario    ?: string,
      public hdgcodigo  ?: number,
      public esacodigo  ?: number,
      public cmecodigo  ?: number,
      public codbodega  ?: number, 
      public devolucionfraccionamiento ?: DevolucionFraccionamiento[],
     
    ) {}
}