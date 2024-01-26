CREATE OR REPLACE PACKAGE BODY PKG_RPT_RECETASPROGRAMADAS As

Procedure PRO_RPT_RECETASPROGRAMADAS  
    ( In_IdReport   In Number
     ,In_HdgCodigo  In Number        
     ,In_EsaCodigo  In Number        
     ,In_CmeCodigo  In Number 
     ,In_Usuario    In Varchar2
     ,In_CliId      In Number 
     ) As

Begin


DECLARE
   v_ordenador       number(10);

BEGIN

   v_ordenador:= 0;

   FOR c IN  (
            SELECT soli.soli_id
            , to_char (soli.soli_fecha_creacion, 'dd-mm-yyyy hh24:mi:ss') soli_fecha_creacion
            , nvl((SELECT fbod_descripcion FROM clin_far_bodegas WHERE fbod_codigo = soli.soli_bod_destino AND  hdgcodigo = soli.soli_hdgcodigo
                                                                        AND esacodigo = soli.soli_esacodigo 
                                                                        AND cmecodigo = soli.soli_cmecodigo), 'Sin Descripción' ) fbod_descripcion
            , nvl(soli_numero_receta, 0) soli_numero_receta
            , ( SELECT  decode (codtipidentificacion , 0, 'Sin Descripción',nvl((SELECT initcap(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 39 AND fpar_codigo = codtipidentificacion), ' ')) fpar_descripcion
               FROM desa1.cliente WHERE cliid = soli.soli_cliid) tipdocdesc_pac
            , ( SELECT clinumidentificacion FROM desa1.cliente WHERE cliid = soli.soli_cliid) numdoc_pac
            , ( SELECT initcap((clinombres || ' ' || cliapepaterno || ' ' || cliapematerno) )  FROM desa1.cliente WHERE cliid = soli.soli_cliid) nombre_pac
            , soli.soli_edadpaciente
            , ( SELECT  decode (soli.soli_tipdoc_prof , 0, 'Sin Descripción',nvl((SELECT initcap(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 39 AND fpar_codigo = soli.soli_tipdoc_prof), ' ')) fpar_descripcion
               FROM desa1.cliente WHERE cliid = soli.soli_cliid) tipdocdesc_prof
            , nvl(soli.soli_numdoc_prof, ' ') soli_numdoc_prof
            , nvl(( SELECT initcap((clinombres || ' ' || cliapepaterno || ' ' || cliapematerno) )  FROM desa1.cliente 
                                                                                                WHERE codtipidentificacion = soli.soli_tipdoc_prof 
                                                                                                AND clinumidentificacion  = RPAD(UPPER( soli.soli_numdoc_prof),20)), ' ' ) nombre_prof
            , (SELECT TRIM(MEIN_CODMEI) FROM clin_far_mamein WHERE sode.SODE_MEIN_ID = mein_id(+) AND hdgcodigo = soli.SOLI_HDGCODIGO) MEIN_CODMEI
            , (SELECT TRIM(INITCAP(mein_descri)) FROM clin_far_mamein WHERE sode.SODE_MEIN_ID = mein_id(+) AND hdgcodigo = soli.SOLI_HDGCODIGO) mein_descri
            ,sode.SODE_DOSIS
            ,sode.SODE_FORMULACION
            ,sode.SODE_DIAS
            ,sode.SODE_CANT_SOLI
            ,sode.SODE_CANT_DESP 
            ,(sode.SODE_CANT_SOLI - sode.SODE_CANT_DESP) CANT_PEND   
            ,NVL( (select rd.REDE_GLOSAPOSOLOGIA 
               from clin_far_recetas r
                 ,clin_far_recetasdet  rd
               where r.RECE_NUMERO = soli.SOLI_NUMERO_RECETA
               and r.HDGCODIGO  = In_HdgCodigo
               and r.ESACODIGO  = In_EsaCodigo
               and r.CMECODIGO = In_CmeCodigo
               and r.RECE_ID = rd.RECE_ID
               and rd.REDE_MEIN_CODMEI = sode.SODE_MEIN_CODMEI
               ), ' ' ) as  REDE_GLOSAPOSOLOGIA
            from clin_far_solicitudes soli
            ,clin_far_solicitudes_det sode
            where soli.SOLI_HDGCODIGO = In_HdgCodigo
            and soli.SOLI_ESACODIGO = In_EsaCodigo
            and soli.SOLI_CMECODIGO = In_CmeCodigo
            and soli.SOLI_ID = sode.SODE_SOLI_ID
            and sode.SODE_RECETA_ENTREGAPROG = 'S'
            and (sode.SODE_CANT_SOLI - sode.SODE_CANT_DESP)   >  0
            and (CASE WHEN (In_CliId != 0) and soli.SOLI_CLIID = In_CliId
                    THEN 1
                   WHEN (In_CliId = 0) 
                    THEN 1
                   ELSE 0
                 END) = 1
            order by soli.SOLI_ID        
        )
   LOOP         
      v_ordenador:= v_ordenador + 1;  
      Begin
         Insert Into RPT_RECETASPROGRAMADAS
            (IDREPORT
            ,SOLI_ID
            ,SOLI_FECHA_CREACION
            ,FBOD_DESCRIPCION
            ,SOLI_NUMERO_RECETA
            ,TIPDOCDESC_PAC
            ,NUMDOC_PAC
            ,NOMBRE_PAC
            ,SOLI_EDADPACIENTE
            ,TIPDOCDESC_PROF
            ,SOLI_NUMDOC_PROF
            ,NOMBRE_PROF
            ,MEIN_CODMEI
            ,MEIN_DESCRI
            ,SODE_DOSIS
            ,SODE_FORMULACION
            ,SODE_DIAS
            ,SODE_CANT_SOLI
            ,SODE_CANT_DESP
            ,CANT_PEND
            ,hdgcodigo
            ,esacodigo
            ,cmecodigo
            ,fecharpt
            ,usuario
            ,ordenador
            ,REDE_GLOSAPOSOLOGIA
            )
         Values
             (in_idreport
             ,c.SOLI_ID
             ,c.SOLI_FECHA_CREACION
             ,c.FBOD_DESCRIPCION
             ,c.SOLI_NUMERO_RECETA
             ,c.TIPDOCDESC_PAC
             ,c.NUMDOC_PAC
             ,c.NOMBRE_PAC
             ,c.SOLI_EDADPACIENTE
             ,c.TIPDOCDESC_PROF
             ,c.SOLI_NUMDOC_PROF
             ,c.NOMBRE_PROF
             ,c.MEIN_CODMEI
             ,c.MEIN_DESCRI
             ,c.SODE_DOSIS
             ,c.SODE_FORMULACION
             ,c.SODE_DIAS
             ,c.SODE_CANT_SOLI
             ,c.SODE_CANT_DESP
             ,c.CANT_PEND
             ,in_hdgcodigo
             ,in_esacodigo
             ,in_cmecodigo
             ,sysdate
             ,in_usuario
             ,v_ordenador
             ,c.REDE_GLOSAPOSOLOGIA);
      End;

   END LOOP;

END;

End PRO_RPT_RECETASPROGRAMADAS;

End PKG_RPT_RECETASPROGRAMADAS;
/