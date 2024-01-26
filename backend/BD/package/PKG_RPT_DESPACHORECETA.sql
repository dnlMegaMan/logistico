create or replace PACKAGE "PKG_RPT_DESPACHORECETA" As

Procedure PRO_RPT_DESPACHORECETA
    ( In_IdReport   In Number
     ,In_HdgCodigo  In Number        
     ,In_EsaCodigo  In Number        
     ,In_CmeCodigo  In Number 
     ,In_Usuario    In Varchar2
     ,In_Tipo       In Number
     ,In_SoliId     In Number 
     ,In_ReceId     In Number 
    );

End PKG_RPT_DESPACHORECETA;

/

create or replace PACKAGE BODY  "PKG_RPT_DESPACHORECETA" As

Procedure PRO_RPT_DESPACHORECETA  
    ( In_IdReport   In Number
     ,In_HdgCodigo  In Number        
     ,In_EsaCodigo  In Number        
     ,In_CmeCodigo  In Number 
     ,In_Usuario    In Varchar2
     ,In_Tipo       In Number
     ,In_SoliId     In Number 
     ,In_ReceId     In Number 
     ) As

Begin


DECLARE
   v_ordenador       number(10);

   v_MFDE_LOTE                RPT_DESPACHORECETA.MFDE_LOTE%type;        
   v_MFDE_LOTE_FECHAVTO_CHAR  RPT_DESPACHORECETA.MFDE_LOTE_FECHAVTO_CHAR%type;
    v_Tipo Number DEFAULT(1);

BEGIN
   v_Tipo :=  In_Tipo;
   v_ordenador:= 0;

   if v_Tipo = 1 then -- Solicitud
    FOR c IN  (
            SELECT soli.soli_id
            , to_char (soli.soli_fecha_creacion, 'dd-mm-yyyy hh24:mi:ss') soli_fecha_creacion
            , nvl((SELECT fbod_descripcion FROM clin_far_bodegas WHERE fbod_codigo = soli.soli_bod_destino AND  hdgcodigo = soli.soli_hdgcodigo
                                                                        AND esacodigo = soli.soli_esacodigo 
                                                                        AND cmecodigo = soli.soli_cmecodigo), 'Sin Descripcion' ) fbod_descripcion
            , nvl(soli_numero_receta, 0) soli_numero_receta
            , ( SELECT  decode (codtipidentificacion , 0, 'Sin Descripcion',nvl((SELECT fpar_descripcion FROM clin_far_param WHERE fpar_tipo = 39 AND fpar_codigo = codtipidentificacion), ' ')) fpar_descripcion
                FROM cliente WHERE cliid = soli.soli_cliid) tipdocdesc_pac
            , ( SELECT clinumidentificacion FROM cliente WHERE cliid = soli.soli_cliid) numdoc_pac
            , ( SELECT (clinombres || ' ' || cliapepaterno || ' ' || cliapematerno)   FROM cliente WHERE cliid = soli.soli_cliid) nombre_pac
            , ( SELECT calcularedad(to_char(clifecnacimiento,'yyyy/mm/dd'), TO_CHAR(sysdate,'yyyy/mm/dd'))  FROM cliente WHERE cliid = soli.soli_cliid) edad_pac
            , ( SELECT (select glssexo from prmsexo where prmsexo.codsexo = cliente.codsexo )  FROM cliente WHERE cliid = soli.soli_cliid) glssexo
            , ( SELECT  decode (soli.soli_tipdoc_prof , 0, 'Sin Descripcion',nvl((SELECT fpar_descripcion FROM clin_far_param WHERE fpar_tipo = 39 AND fpar_codigo = soli.soli_tipdoc_prof), ' ')) fpar_descripcion
                FROM cliente WHERE cliid = soli.soli_cliid) tipdocdesc_prof
            , nvl(soli.soli_numdoc_prof, ' ') soli_numdoc_prof
            , nvl(( SELECT (clinombres || ' ' || cliapepaterno || ' ' || cliapematerno)   FROM cliente 
                                                                                                WHERE codtipidentificacion = soli.soli_tipdoc_prof 
                                                                                                AND clinumidentificacion  = RPAD(UPPER(soli.soli_numdoc_prof),20)), ' ' ) nombre_prof
            , (SELECT TRIM(MEIN_CODMEI) FROM clin_far_mamein WHERE sode.SODE_MEIN_ID = mein_id(+) AND hdgcodigo = soli.SOLI_HDGCODIGO) MEIN_CODMEI
            , (SELECT TRIM(mein_descri) FROM clin_far_mamein WHERE sode.SODE_MEIN_ID = mein_id(+) AND hdgcodigo = soli.SOLI_HDGCODIGO) mein_descri
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
               and r.CMECODIGO =  In_CmeCodigo
               and r.RECE_ID = rd.RECE_ID
               and rd.REDE_MEIN_CODMEI = sode.SODE_MEIN_CODMEI
               ), ' ' ) as  REDE_GLOSAPOSOLOGIA
              ,sode.SODE_MEIN_ID 
              ,soli.SOLI_CODSERVICIOACTUAL as COD_SERVICIO
              ,nvl((select SERV_DESCRIPCION from clin_servicios_logistico where HDGCODIGO = SOLI.SOLI_HDGCODIGO AND ESACODIGO = SOLI.SOLI_ESACODIGO AND CMECODIGO = SOLI.SOLI_CMECODIGO AND SERV_CODIGO = soli.SOLI_CODSERVICIOACTUAL), '') as glosaServicioActual
              , nvl((select to_char(RECE_ID || ' / '|| RECE_NUMERO || '-' || RECE_SUBRECETA) from clin_far_recetas where rece_id = soli_numero_receta), '') numero_receta
            from clin_far_solicitudes soli
            ,clin_far_solicitudes_det sode
            where soli.SOLI_HDGCODIGO = In_HdgCodigo
            and soli.SOLI_ESACODIGO = In_EsaCodigo
            and soli.SOLI_CMECODIGO = In_CmeCodigo
            and soli.SOLI_ID = sode.SODE_SOLI_ID
            and soli.SOLI_ID =  In_SoliId   
        )
       LOOP         
          v_ordenador:= v_ordenador + 1;  

          Begin
                select distinct MFDE_LOTE, to_char(MFDE_LOTE_FECHAVTO,'YYYY-MM-DD')   
                into   v_MFDE_LOTE , v_MFDE_LOTE_FECHAVTO_CHAR
                from  clin_far_movimdet
                     ,clin_far_movim 
                where  MOVF_SOLI_ID = In_SoliId 
                and MFDE_MOVF_ID = MOVF_ID  
                and MFDE_MEIN_ID = c.SODE_MEIN_ID
                and ( not (MFDE_LOTE_FECHAVTO is null) or  not (MFDE_LOTE is null));   
          Exception When Others Then
            v_MFDE_LOTE := ' ';         
            v_MFDE_LOTE_FECHAVTO_CHAR := ' '; 
          End;

          Begin
             Insert Into RPT_DESPACHORECETA
                (IDREPORT
                ,SOLI_ID
                ,SOLI_FECHA_CREACION
                ,FBOD_DESCRIPCION
                ,SOLI_NUMERO_RECETA
                ,TIPDOCDESC_PAC
                ,NUMDOC_PAC
                ,NOMBRE_PAC
                ,SOLI_EDADPACIENTE
                ,GLSSEXO
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
                ,MFDE_LOTE                       
                ,MFDE_LOTE_FECHAVTO_CHAR  
                ,COD_SERVICIO
                ,GLOSASERVICIOACTUAL
                ,NUMERO_RECETA
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
                 ,c.edad_pac
                 ,c.glssexo
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
                 ,c.REDE_GLOSAPOSOLOGIA
                 ,v_MFDE_LOTE                       
                 ,v_MFDE_LOTE_FECHAVTO_CHAR
                 ,c.COD_SERVICIO
                 ,c.GLOSASERVICIOACTUAL
                 ,c.numero_receta);
          End;

       END LOOP;
   end if;

   if v_Tipo = 2 then -- Receta
    FOR c IN  (
            SELECT 
				   0 as soli_id
				,  nvl((to_char (rece.RECE_FECHA, 'dd-mm-yyyy hh24:mi:ss')), ' ') as soli_fecha_creacion
				,  nvl((SELECT fbod_descripcion FROM clin_far_bodegas WHERE fbod_codigo = rece.rece_codbodega 
                                                                        AND  hdgcodigo = rece.hdgcodigo
                                                                        AND esacodigo = rece.esacodigo 
                                                                        AND cmecodigo = rece.cmecodigo), 'Sin Descripcion' ) as fbod_descripcion
				,  nvl(rece.RECE_ID, 0) as soli_numero_receta
				,  nvl((select prm.GLSTIPIDENTIFICACION from prmtipoidentificacion prm where prm.CODTIPIDENTIFICACION = rece.RECE_TIPDOCPAC
																						and  prm.HDGCODIGO = rece.HDGCODIGO
																						and  prm.ESACODIGO = rece.ESACODIGO
																						and  prm.CMECODIGO = rece.CMECODIGO), '') as tipdocdesc_pac
				,  nvl(rece.RECE_DOCUMPAC, '') as numdoc_pac
				,  nvl(rece.RECE_NOMBRE_PACIENTE, '') as nombre_pac
				,  nvl((SELECT calcularedad(to_char(clifecnacimiento,'yyyy/mm/dd'), TO_CHAR(sysdate,'yyyy/mm/dd'))  FROM cliente WHERE cliid = rece.RECE_CLIID), '') as edad_pac
				,  nvl((select GLSSEXO from prmsexo where CODSEXO = (SELECT CODSEXO  FROM cliente WHERE cliid = rece.RECE_CLIID)), '') as glssexo
				,  nvl((select prm.GLSTIPIDENTIFICACION from prmtipoidentificacion prm where prm.CODTIPIDENTIFICACION = rece.RECE_TIPDOCPROF
																						and  prm.HDGCODIGO = rece.HDGCODIGO
																						and  prm.ESACODIGO = rece.ESACODIGO
																						and  prm.CMECODIGO = rece.CMECODIGO), '') as tipdocdesc_prof
				,  nvl(rece.RECE_DOCUMPROF, '') as soli_numdoc_prof
				,  nvl(rece.RECE_NOMBRE_MEDICO, '') as nombre_prof
				,  nvl(rede.REDE_MEIN_CODMEI, '') as MEIN_CODMEI
				,  nvl(rede.REDE_MEIN_DESCRI, '') as mein_descri
				,  nvl(rede.REDE_DOSIS, 0) as SODE_DOSIS
				,  nvl(rede.REDE_VECES, 0) as SODE_FORMULACION
				,  nvl(rede.REDE_TIEMPO, 0) as SODE_DIAS
				,  nvl(rede.REDE_CANTIDAD_SOLI, 0) as SODE_CANT_SOLI
				,  nvl(rede.REDE_CANTIDAD_ADESP, 0) as SODE_CANT_DESP 
				,  0 as CANT_PEND   
				,  nvl(rede.REDE_GLOSAPOSOLOGIA, '') as REDE_GLOSAPOSOLOGIA
				,  nvl((select mein_id from clin_Far_mamein where mein_codmei = rede.REDE_MEIN_CODMEI), 0) as SODE_MEIN_ID
                ,rece.RECE_COD_SERVICIO as COD_SERVICIO
                ,nvl((select SERGLOSA from servicio where HDGCODIGO = rece.HDGCODIGO AND trim(CODSERVICIO) = trim(rece.RECE_COD_SERVICIO)), '') as GLOSASERVICIOACTUAL
                ,to_char( rece.RECE_ID || ' / '|| RECE_NUMERO || '-' || RECE_SUBRECETA) as numero_receta
				from clin_far_recetas rece
				,clin_far_recetasdet rede
				where rece.HDGCODIGO = In_HdgCodigo
				  and rece.ESACODIGO = In_EsaCodigo
				  and rece.CMECODIGO = In_CmeCodigo
				  and rece.rece_ID = rede.rece_ID
				  and rece.rece_ID =  In_ReceId
                  and rede.REDE_ESTADO_PRODUCTO <> 'ELIMINADO'
                  and rede.REDE_ESTADO_PRODUCTO <> 'AN'
        )
       LOOP         
          v_ordenador:= v_ordenador + 1;  

          Begin
                select distinct MFDE_LOTE, to_char(MFDE_LOTE_FECHAVTO,'YYYY-MM-DD')   
                into   v_MFDE_LOTE , v_MFDE_LOTE_FECHAVTO_CHAR
                from  clin_far_movimdet
                     ,clin_far_movim 
                where  MOVF_SOLI_ID = In_SoliId 
                and MFDE_MOVF_ID = MOVF_ID  
                and MFDE_MEIN_ID = c.SODE_MEIN_ID
                and ( not (MFDE_LOTE_FECHAVTO is null) or  not (MFDE_LOTE is null));   
          Exception When Others Then
            v_MFDE_LOTE := ' ';         
            v_MFDE_LOTE_FECHAVTO_CHAR := ' '; 
          End;

          Begin
             Insert Into RPT_DESPACHORECETA
                (IDREPORT
                ,SOLI_ID
                ,SOLI_FECHA_CREACION
                ,FBOD_DESCRIPCION
                ,SOLI_NUMERO_RECETA
                ,TIPDOCDESC_PAC
                ,NUMDOC_PAC
                ,NOMBRE_PAC
                ,SOLI_EDADPACIENTE
                ,GLSSEXO
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
                ,MFDE_LOTE                       
                ,MFDE_LOTE_FECHAVTO_CHAR
                ,COD_SERVICIO
                ,GLOSASERVICIOACTUAL
                ,NUMERO_RECETA
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
                 ,c.edad_pac
                 ,c.glssexo
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
                 ,c.REDE_GLOSAPOSOLOGIA
                 ,v_MFDE_LOTE                       
                 ,v_MFDE_LOTE_FECHAVTO_CHAR
                 ,c.COD_SERVICIO
                 ,c.GLOSASERVICIOACTUAL
                 ,c.numero_receta);
          End;

       END LOOP;
   end if;
END;

End PRO_RPT_DESPACHORECETA;

End PKG_RPT_DESPACHORECETA;

/ 