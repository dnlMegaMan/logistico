CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."PKG_RPT_MOVIMIENTOS" As

Procedure PRO_RPT_MOVIMIENTOS  
    ( In_IdReport   In Number
     ,In_UsuarioRpt In Varchar2
     ,In_HdgCodigo  In Number        
     ,In_EsaCodigo  In Number        
     ,In_CmeCodigo  In Number 
     ,In_MovfId     In Number
     ) As

Begin

DECLARE
   v_tipomov            RPT_MOVIMIENTOS.tipomov%type;
   v_fechacreacion      RPT_MOVIMIENTOS.fechacreacion%type;
   v_usuariomov         RPT_MOVIMIENTOS.usuariomov%type;
   v_bodorigendesc      RPT_MOVIMIENTOS.bodorigendesc%type;
   v_boddestinodesc     RPT_MOVIMIENTOS.boddestinodesc%type;
   v_tipoidentifdesc    RPT_MOVIMIENTOS.tipoidentifdesc%type;
   v_numidentif         RPT_MOVIMIENTOS.numidentif%type;
   v_nombrepaciente     RPT_MOVIMIENTOS.nombrepaciente%type;
   v_codmei             RPT_MOVIMIENTOS.codmei%type;
   v_meindescri         RPT_MOVIMIENTOS.meindescri%type;
   v_lote               RPT_MOVIMIENTOS.lote%type;
   v_fechavto           RPT_MOVIMIENTOS.fechavto%type;
   v_cantdevuelta       RPT_MOVIMIENTOS.cantdevuelta%type;
   v_cantadevolver      RPT_MOVIMIENTOS.cantadevolver%type;
   v_cantarecepcionar   RPT_MOVIMIENTOS.cantarecepcionar%type;
   v_motivomov          RPT_MOVIMIENTOS.motivomov%type;
   v_movid              RPT_MOVIMIENTOS.movid%type;
   v_tipomovdesc        RPT_MOVIMIENTOS.tipomovdesc%type;


BEGIN
    Begin
        SELECT mov.movf_id
            ,mov.movf_tipo
            ,decode (mov.movf_tipo , 0, ' ',nvl((select INITCAP(FPAR_DESCRIPCION) from clin_far_param where FPAR_TIPO = 8 and FPAR_CODIGO = mov.movf_tipo), ' ')) FPAR_DESCRIPCION
           , to_char(mov.movf_fecha,'YYYY-MM-DD')
            ,mov.movf_usuario
            ,nvl(bo1.fbod_descripcion, ' ')  bodorigendesc
            ,nvl(bo2.fbod_descripcion, ' ')  boddestinodesc
            , nvl((SELECT initcap(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 39 AND fpar_codigo = cli.codtipidentificacion), ' ')TIPIDENTIFdesc
            ,nvl(cli.CLINUMIDENTIFICACION, ' ')
            ,( trim(cli.cliapepaterno) || ' ' || trim(cli.cliapematerno) || ' ' || trim(cli.clinombres) ) nombrepaciente
        INTO
        v_movid 
        ,v_tipomov
        ,v_tipomovdesc 
           ,v_fechacreacion
           ,v_usuariomov
           ,v_bodorigendesc
           ,v_boddestinodesc
           ,v_tipoidentifdesc
           ,v_numidentif
           ,v_nombrepaciente
         FROM clin_far_movim mov
         , desa1.cliente cli
         , clin_far_bodegas bo1
         , clin_far_bodegas bo2
		 WHERE mov.movf_id = In_MovfId
		 AND mov.movf_cliid = cli.cliid(+) 
		 AND mov.movf_bod_origen = bo1.fbod_codigo(+) 
         AND mov.hdgcodigo = bo1.hdgcodigo(+) 
         AND mov.esacodigo = bo1.esacodigo(+) 
         AND mov.cmecodigo = bo1.cmecodigo(+)  
         AND mov.movf_bod_destino = bo2.fbod_codigo(+) 
         AND mov.hdgcodigo = bo2.hdgcodigo(+) 
         AND mov.esacodigo = bo2.esacodigo(+) 
         AND mov.cmecodigo = bo2.cmecodigo(+)  ;
    End;


    FOR c IN  (
        select mfde_id
            , MFDE_MEIN_CODMEI    as codmei
	    	, trim(mein_descri)  as meindescri
            , mfde_lote          as lote      
            , to_char(mfde_lote_fechavto,'YYYY-MM-DD') as fechavto
		    , nvl(mfde_cantidad_devuelta,0)        as cantdevuelta
            , mfde_cantidad                        as cantidad 
            , decode (MFDE_IDTIPOMOTIVO , 0, ' ',nvl((select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO = 18 and FPAR_CODIGO = MFDE_IDTIPOMOTIVO), ' ')) as motivomov
        from clin_far_movimdet
           , clin_far_mamein
        where mfde_movf_id = In_MovfId
        And mfde_mein_id = mein_id         
       )
    LOOP

	--	DESPACHO POR DEVOLUCION ARTICULO  (180)
	--	RECEPCIÓN POR DEVOLUCION ARTÍCULO (90)
	--	RECEPCIÓN POR DEVOLUCION PACIENTE (70)

       v_cantadevolver:= 0;
       v_cantarecepcionar:= 0;

       if v_tipomov = 180 then
            v_cantadevolver:= c.cantidad;
       end if;
       if v_tipomov = 90 or v_tipomov = 70 then
            v_cantarecepcionar:= c.cantidad;
       end if;


       -- select  mdev_movf_tipo
       --   , to_char(mdev_fecha,'YYYY-MM-DD')
       --   , mdev_cantidad
 	   --	 , mdev_responsable 
       --		 from clin_far_movim_devol
	   --	 where mdev_mfde_id = c.mfde_id



      Begin
         Insert Into RPT_MOVIMIENTOS
             (  IDREPORT
                ,MOVID
                ,TIPOMOV
                ,TIPOMOVDESC
                ,FECHACREACION
                ,USUARIOMOV
                ,BODORIGENDESC
                ,BODDESTINODESC
                ,TIPOIDENTIFDESC
                ,NUMIDENTIF
                ,NOMBREPACIENTE
                ,CODMEI
                ,MEINDESCRI
                ,LOTE
                ,FECHAVTO
                ,CANTDEVUELTA
                ,CANTADEVOLVER
                ,CANTARECEPCIONAR
                ,MOTIVOMOV
                ,HDGCODIGO
                ,ESACODIGO
                ,CMECODIGO
                ,FECHARPT
                ,USUARIORPT
             )
         Values
             (in_idreport
             ,v_movid 
             ,v_tipomov
             ,v_tipomovdesc 
             ,v_fechacreacion
             ,v_usuariomov
             ,v_bodorigendesc
             ,v_boddestinodesc
             ,v_tipoidentifdesc
             ,v_numidentif
             ,v_nombrepaciente
             ,c.codmei
             ,c.meindescri
             ,c.lote
             ,c.fechavto
             ,c.cantdevuelta
             ,v_cantadevolver
             ,v_cantarecepcionar
             ,c.motivomov   
             ,in_hdgcodigo
             ,in_esacodigo
             ,in_cmecodigo
             ,sysdate
             ,In_UsuarioRpt);
      End;

   END LOOP;

END;

End PRO_RPT_MOVIMIENTOS;

End PKG_RPT_MOVIMIENTOS;
/