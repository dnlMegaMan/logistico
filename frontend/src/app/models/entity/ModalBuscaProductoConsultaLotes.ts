export class ModalBuscaProductoConsultaLotes {
    constructor(

        public titulo    ?: string,
        public hdgcodigo ?: number,
        public esacodigo ?: number,
        public cmecodigo ?: number,
        public lote      ?: string,
        public servidor  ?: string,
        public fechadesde?: string,
        public fechahasta?: string,
        public tipo      ?: number,
        public meinid1   ?: number,
        public usuario   ?: string,
    ) { }
  }