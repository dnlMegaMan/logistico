export class CargoFarmacia {
        fechacargo: string;
        codigo: string;
        descripcion: string;
        tipocargo: string;
        solid: string;
        receid: string;
        ctaid: string;
        page: number;

    constructor(
        fechacargo?: string,
        codigo?: string,
        descripcion?: string,
        tipocargo?: string,
        solid?: string,
        receid?: string,
        ctaid?: string,
        page?: number) {
          this.fechacargo = fechacargo;
          this.codigo = codigo;
          this.descripcion = descripcion;
          this.tipocargo = tipocargo;
          this.solid = solid;
          this.receid = receid;
          this.ctaid = ctaid;
          this.page = page;
        }
}
