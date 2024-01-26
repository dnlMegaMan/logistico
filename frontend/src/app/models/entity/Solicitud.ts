import { DetalleSolicitud } from './DetalleSolicitud';

export class Solicitud {
    constructor(
        public soliid               ?: number,
        public hdgcodigo            ?: number,
        public esacodigo            ?: number,
        public cmecodigo            ?: number,
        public cliid                ?: number,
        public tipodocpac           ?: number,
        public numdocpac            ?: string,
        public descidentificacion   ?: string,
        public apepaternopac        ?: string,
        public apematernopac        ?: string,
        public nombrespac           ?: string,
        public codambito            ?: number,
        public estid                ?: number,
        public ctaid                ?: number,
        public edadpac              ?: number,
        public tipoedad             ?: string,
        public codsexo              ?: number,
        public codservicioori       ?: number,
        public codserviciodes       ?: number,
        public bodorigen            ?: number,
        public boddestino           ?: number,
        public tipobodorigen        ?: string,
        public tipoboddestino       ?: string,
        public tipoproducto         ?: number,
        public tiporeceta           ?: string,
        public numeroreceta         ?: number,
        public tipomovim            ?: string,
        public tiposolicitud        ?: number,
        public estadosolicitud      ?: number,
        public prioridadsoli        ?: number,
        public tipodocprof          ?: number,
        public numdocprof           ?: string,
        public alergias             ?: string,
        public cama                 ?: string,
        public fechacreacion        ?: string,
        public usuariocreacion      ?: string,
        public fechamodifica        ?: string,
        public usuariomodifica      ?: string,
        public fechaelimina         ?: string,
        public usuarioelimina       ?: string,
        public fechacierre          ?: string,
        public usuariocierre        ?: string,
        public observaciones        ?: string,
        public ppnpaciente          ?: number,
        public convenio             ?: string,
        public diagnostico          ?: string,
        public nombremedico         ?: string,
        public cuentanumcuenta      ?: string,
        public bodorigendesc        ?: string,
        public boddestinodesc       ?: string,
        public usuario              ?: string,
        public servidor             ?: string,
        public accion               ?: string,
        public origensolicitud      ?: number,
        public estadosolicitudde    ?: string,
        public desprioridadsoli     ?: string,
        public desorigensolicitud   ?: string,
        public codpieza             ?: string,
        public camid                ?: number,
        public piezaid              ?: number,
        public glsexo               ?: string,
        public glstipidentificacion ?: string,
        public glsambito            ?: string,
        public undglosa             ?: string,
        public camglosa             ?: string,
        public pzagloza             ?: string,
        public edad                 ?: string,
        public comprobantecaja      ?: string,
        public estadocomprobantecaja ?: number,
        public boleta                ?: number,
        public descunidaddespacho    ?: string,
        public nombrecompletopaciente ?:string,
        public codservicioactual    ?: string,
        public glsservicioactual    ?: string,
        public recetaentregaprog    ?: string,
        public diasentregacodigo    ?: number,
        public solitiporeg          ?: string,
        public controlado           ?: string,
        public consignacion         ?: string,
        public solicitudesdet       ?: DetalleSolicitud[],
        public idplantilla          ?: number,
        public solirecetipo         ?: string,
        public receid               ?: number,
        public FiltroDeNegocio      ?: string,
        public nropedidofin700erp   ?: number,
        public receglosaservicio    ?: string,
        public marcacabecera        ?: boolean,
        public glosa                ?: string,
        public errorerp             ?: string,
        public bandera              ?: number,
        public tipobodsolicitante   ?: string,
        public tipobodsuministro    ?: string,
        public referencia           ?: number,
        public numpedido            ?: number,
        public rececodbodega        ?: number,
        public previsionpaciente    ?: string,
        public pagina               ?: number,
        public plancotizante        ?: string,
        public bonificacion         ?: string,
    ) { }
}
