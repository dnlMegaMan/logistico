CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."PKG_RPT_CONSULTACIERREKARDEX" As

Procedure PRO_RPT_CONSULTACIERREKARDEX  
    ( In_IdReport   In Number
     ,In_HdgCodigo  In Number        
     ,In_EsaCodigo  In Number        
     ,In_CmeCodigo  In Number 
     ,In_Usuario    In Varchar2
     ,In_CKarId     In Number
     ,In_CodBodega In Number
     ,In_MeInId     In Number
     ) As

Begin

DECLARE
   v_ordenador       number(10);
   v_ordenador2       number(10);
---
    v_CantCierre  NUMBER;
    v_MaxCKAR_ID            CLIN_FAR_CIERRE_KARDEX_PERIODO.CKAR_ID%type; 
    v_CKAR_ID_CierreAnterior CLIN_FAR_CIERRE_KARDEX_PERIODO.CKAR_ID%type; 

    v_CKAR_PERIODO          CLIN_FAR_CIERRE_KARDEX_PERIODO.CKAR_PERIODO%type; 
    v_CKAR_FECHA_APERTURA   CLIN_FAR_CIERRE_KARDEX_PERIODO.CKAR_FECHA_APERTURA%type; 
    v_CKAR_FECHA_CIERRE     CLIN_FAR_CIERRE_KARDEX_PERIODO.CKAR_FECHA_CIERRE%type; 

    v_KADE_CLIID                CLIN_FAR_CIERRE_KARDEX_DET.KADE_CLIID%type;
    v_KADE_MOVF_SOLI_ID         CLIN_FAR_CIERRE_KARDEX_DET.KADE_MOVF_SOLI_ID%type;
    v_KADE_MOVF_BOD_SUMINISTRO  CLIN_FAR_CIERRE_KARDEX_DET.KADE_MOVF_BOD_SUMINISTRO%type;
    v_MOVF_ESTID                clin_far_movim.MOVF_ESTID%type;
    v_KADE_MOVF_ORCO_NUMDOC     CLIN_FAR_CIERRE_KARDEX_DET.KADE_MOVF_ORCO_NUMDOC%type;
    v_KADE_MOVF_FACTURA_NUMDOC  CLIN_FAR_CIERRE_KARDEX_DET.KADE_MOVF_FACTURA_NUMDOC%type;
    v_KADE_MOVF_RECETA          CLIN_FAR_CIERRE_KARDEX_DET.KADE_MOVF_RECETA%type;
    v_KADE_MFDE_FECHA           CLIN_FAR_CIERRE_KARDEX_DET.KADE_MFDE_FECHA%type;
    v_KADE_MFDE_CANTIDAD        CLIN_FAR_CIERRE_KARDEX_DET.KADE_MFDE_CANTIDAD%type;
    v_KADE_CODTIPIDENTIFICACION CLIN_FAR_CIERRE_KARDEX_DET.KADE_CODTIPIDENTIFICACION%type; 
    v_KADE_CLINUMIDENTIFICACION CLIN_FAR_CIERRE_KARDEX_DET.KADE_CLINUMIDENTIFICACION%type;
    v_KADE_CLINOMBRES           CLIN_FAR_CIERRE_KARDEX_DET.KADE_CLINOMBRES%type;
    v_KADE_CLIAPEPATERNO        CLIN_FAR_CIERRE_KARDEX_DET.KADE_CLIAPEPATERNO%type;
    v_KADE_CLIAPEMATERNO        CLIN_FAR_CIERRE_KARDEX_DET.KADE_CLIAPEMATERNO%type;             
    v_KADE_PCLIIDMEDSOLICITANTE CLIN_FAR_CIERRE_KARDEX_DET.KADE_PCLIIDMEDSOLICITANTE%type;
    v_KADE_PCLIIDMEDTRATANTE            CLIN_FAR_CIERRE_KARDEX_DET.KADE_PCLIIDMEDTRATANTE%type;
    v_KADE_CODTIPIDENTIFICACION_PR    CLIN_FAR_CIERRE_KARDEX_DET.KADE_CODTIPIDENTIFICACION_PROF%type;
    v_KADE_CLINUMIDENTIFICACION_PR    CLIN_FAR_CIERRE_KARDEX_DET.KADE_CLINUMIDENTIFICACION_PROF%type;
    v_KADE_CLINOMBRES_PROF              CLIN_FAR_CIERRE_KARDEX_DET.KADE_CLINOMBRES_PROF%type;
    v_KADE_CLIAPEPATERNO_PROF           CLIN_FAR_CIERRE_KARDEX_DET.KADE_CLIAPEPATERNO_PROF%type;
    v_KADE_CLIAPEMATERNO_PROF           CLIN_FAR_CIERRE_KARDEX_DET.KADE_CLIAPEMATERNO_PROF%type;
    v_KADE_CLIFONOMOVIL_PROF            CLIN_FAR_CIERRE_KARDEX_DET.KADE_CLIFONOMOVIL_PROF%type;
    v_KADE_CODTIPPROFESIONAL            CLIN_FAR_CIERRE_KARDEX_DET.KADE_CODTIPPROFESIONAL%type;
    v_KADE_CODESPECIALIDAD              CLIN_FAR_CIERRE_KARDEX_DET.KADE_CODESPECIALIDAD%type;
    v_TIPO_MOV                          number(10);
    v_MDEV_MFDEORIGEN_ID                clin_far_movim_devol.MDEV_MFDEORIGEN_ID%type;
    v_MOVF_BOD_ORIGEN                   clin_far_movim.MOVF_BOD_ORIGEN%type;
    v_MOVF_BOD_DESTINO                  clin_far_movim.MOVF_BOD_DESTINO%type;
    v_KADE_MFDE_IDTIPOMOTIVO            clin_far_movimdet.MFDE_IDTIPOMOTIVO%type;
    v_MFDE_SOLI_ID                      clin_far_movimdet.MFDE_SOLI_ID%type;    
    v_MFDE_MDEV_ID                      clin_far_movimdet.MFDE_MDEV_ID%type;    
    v_KADE_STOCK_ANTERIOR               CLIN_FAR_CIERRE_KARDEX_DET.KADE_STOCK_ACTUAL%type;
    v_KADE_STOCK_SALDO                  CLIN_FAR_CIERRE_KARDEX_DET.KADE_STOCK_ACTUAL%type;
    v_KADE_OPERACION                    CLIN_FAR_CIERRE_KARDEX_DET.KADE_OPERACION%type;  
    v_MFDE_CANTIDAD_DEVUELTA            clin_far_movimdet.MFDE_CANTIDAD_DEVUELTA%type;
    v_KARD_AJUS_ID                      CLIN_FAR_KARDEX.KARD_AJUS_ID%type;
    v_AJUS_MOTIVO                       CLIN_FAR_AJUSTES.AJUS_MOTIVO%type;
    v_KADE_MOVF_BOD_EXTERNA             CLIN_FAR_CIERRE_KARDEX_DET.KADE_MOVF_BOD_EXTERNA%type;    
    v_FBOI_MEIN_ID_aux                  CLIN_FAR_BODEGAS_INV.FBOI_MEIN_ID%type;

BEGIN
    --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTACIERREKARDEX - hola' , sysdate ); commit;
    IF (In_CKarId > 0 ) THEN
        --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTACIERREKARDEX - antes' , sysdate ); commit;
        v_ordenador:= 0; 
       
                           FOR c IN  (
                                select per.CKAR_PERIODO
                               , to_char(per.CKAR_FECHA_APERTURA, 'dd-mm-yyyy hh24:mi:ss') CKAR_FECHA_APERTURA_CHAR
                               , to_char(per.CKAR_FECHA_CIERRE, 'dd-mm-yyyy hh24:mi:ss') CKAR_FECHA_CIERRE_CHAR
                               , per.CKAR_USUARIO
                                , (SELECT TRIM(MEIN_CODMEI) FROM clin_far_mamein WHERE KADE_MEIN_ID = mein_id(+) AND hdgcodigo = per.HDGCODIGO) MEIN_CODMEI
                                , (SELECT TRIM(INITCAP(mein_descri)) FROM clin_far_mamein WHERE KADE_MEIN_ID = mein_id(+) AND hdgcodigo = per.HDGCODIGO) mein_descri
                                , nvl((SELECT TRIM(INITCAP(pact_descri)) FROM clin_far_principio_act, clin_far_mamein WHERE mein_id = KADE_MEIN_ID AND pact_id = mein_pact_id), ' ' ) principioactivo
                                , nvl((SELECT TRIM(INITCAP(pres_descri)) FROM clin_far_presentacion_med, clin_far_mamein WHERE mein_id = KADE_MEIN_ID  AND pres_id = mein_pres_id), ' ' )  presentacion
                                , nvl((SELECT TRIM(INITCAP(ffar_descri)) FROM clin_far_forma_farma ,clin_far_mamein WHERE mein_id = KADE_MEIN_ID  AND ffar_id = mein_ffar_id), ' ' ) formafarma     
                                , to_char(KADE_MFDE_FECHA, 'dd-mm-yyyy hh24:mi') KADE_MFDE_FECHA_CHAR
                                , decode (KADE_MOVF_TIPO , 0, 'Sin Descripción',nvl((select INITCAP(FPAR_DESCRIPCION) from clin_far_param where FPAR_TIPO = 8 and FPAR_CODIGO = KADE_MOVF_TIPO), ' ')) FPAR_DESCRIPCION
                                , CASE KADE_MOVF_TIPO 
                                     WHEN 115 THEN decode (KADE_MFDE_IDTIPOMOTIVO , 0, 'Sin Descripción',nvl((select INITCAP(FPAR_DESCRIPCION) from clin_far_param where FPAR_TIPO = 16 and FPAR_CODIGO = KADE_MFDE_IDTIPOMOTIVO), ' ')) 
                                     WHEN 15  THEN decode (KADE_MFDE_IDTIPOMOTIVO , 0, 'Sin Descripción',nvl((select INITCAP(FPAR_DESCRIPCION) from clin_far_param where FPAR_TIPO = 16 and FPAR_CODIGO = KADE_MFDE_IDTIPOMOTIVO), ' ')) 
                                     ELSE  decode (KADE_MFDE_IDTIPOMOTIVO , 0, 'Sin Descripción',nvl((select INITCAP(FPAR_DESCRIPCION) from clin_far_param where FPAR_TIPO = 18 and FPAR_CODIGO = KADE_MFDE_IDTIPOMOTIVO), ' ')) 
                                  END  tipomotivodes
                                , nvl((select FBOD_DESCRIPCION from clin_far_bodegas where FBOD_CODIGO = KADE_MOVF_BOD_SUMINISTRO and  HDGCODIGO = per.HDGCODIGO 
                                                                                     and ESACODIGO = In_EsaCodigo 
                                                                                     and CMECODIGO = per.CMECODIGO), 'Sin Descripción' ) FBOD_DESCRIPCION
                                , nvl(KADE_MOVF_RECETA, 0 ) KADE_MOVF_RECETA
                                , nvl(KADE_CLINUMIDENTIFICACION_PROF, ' ') KADE_CLINUMIDENTIFICACION_PROF
                                , INITCAP((KADE_CLINOMBRES_PROF || ' ' || KADE_CLIAPEPATERNO_PROF || ' ' || KADE_CLIAPEMATERNO_PROF)) NombreProf
                                , nvl(KADE_CLINUMIDENTIFICACION, ' ') KADE_CLINUMIDENTIFICACION 
                                , INITCAP((KADE_CLINOMBRES || ' ' || KADE_CLIAPEPATERNO || ' ' || KADE_CLIAPEMATERNO) ) NombrePac
                                , decode(KADE_OPERACION, 'S',   KADE_MFDE_CANTIDAD, 0) cantidad_entrada
                                , decode(KADE_OPERACION, 'R',   KADE_MFDE_CANTIDAD, 0) cantidad_salida
                                , nvl(KADE_STOCK_SALDO, 0) KADE_STOCK_SALDO
                                , nvl((select FBOD_DESCRIPCION from clin_far_bodegas where FBOD_CODIGO = KADE_MOVF_BOD_EXTERNA and  HDGCODIGO = per.HDGCODIGO 
                                                                                     and ESACODIGO = In_EsaCodigo
                                                                                     and CMECODIGO = per.CMECODIGO), ' ' ) FBodExternaDesc
                                 from CLIN_FAR_CIERRE_KARDEX_PERIODO  per
                                    , CLIN_FAR_CIERRE_KARDEX_DET      det
                                 where per.CKAR_ID  = In_CKarId 
                                 and per.HDGCODIGO = In_HdgCodigo 
                                 and per.CMECODIGO = In_CmeCodigo
                                 and per.CKAR_ID  = det.KADE_CKAR_ID
                                 and KADE_MOVF_BOD_SUMINISTRO = In_CodBodega
                                 and(CASE WHEN (In_MeInId != 0) and det.KADE_MEIN_ID = In_MeInId
                                           THEN 1
                                           WHEN (In_MeInId = 0) 
                                           THEN 1
                                           ELSE 0
                                      END) = 1
                                 order by det.KADE_ID        
                                )
                           LOOP         
                              v_ordenador:= v_ordenador + 1;  
                              Begin
                        
                                 Insert Into RPT_CONSULTACIERREKARDEX
                                    (idreport
                                    ,CKAR_PERIODO
                                    ,CKAR_FECHA_APERTURA_CHAR
                                    ,CKAR_FECHA_CIERRE_CHAR
                                    ,CKAR_USUARIO
                                    ,MEIN_CODMEI
                                    ,MEIN_DESCRI
                                    ,principioactivo
                                    ,presentacion
                                    ,formafarma
                                    ,KADE_MFDE_FECHA_CHAR
                                    ,FPAR_DESCRIPCION
                                    ,TIPOMOTIVODES
                                    ,FBOD_DESCRIPCION
                                    ,KADE_MOVF_RECETA
                                    ,KADE_CLINUMIDENTIFICACION_PROF
                                    ,NOMBREPROF
                                    ,KADE_CLINUMIDENTIFICACION
                                    ,NOMBREPAC
                                    ,CANTIDAD_ENTRADA
                                    ,CANTIDAD_SALIDA
                                    ,KADE_STOCK_SALDO
                                    ,hdgcodigo
                                    ,esacodigo
                                    ,cmecodigo
                                    ,fecharpt
                                    ,usuario
                                    ,ordenador
                                    ,FBODEXTERNADESC
                                    )
                                 Values
                                     (in_idreport
                                     ,c.CKAR_PERIODO
                                    ,c.CKAR_FECHA_APERTURA_CHAR
                                    ,c.CKAR_FECHA_CIERRE_CHAR
                                    ,c.CKAR_USUARIO
                                    ,c.MEIN_CODMEI
                                    ,c.MEIN_DESCRI
                                    ,c.principioactivo
                                    ,c.presentacion
                                    ,c.formafarma
                                    ,c.KADE_MFDE_FECHA_CHAR
                                    ,c.FPAR_DESCRIPCION
                                    ,c.TIPOMOTIVODES
                                    ,c.FBOD_DESCRIPCION
                                    ,c.KADE_MOVF_RECETA
                                    ,c.KADE_CLINUMIDENTIFICACION_PROF
                                    ,c.NOMBREPROF
                                    ,c.KADE_CLINUMIDENTIFICACION
                                    ,c.NOMBREPAC
                                    ,c.CANTIDAD_ENTRADA
                                    ,c.CANTIDAD_SALIDA
                                    ,c.KADE_STOCK_SALDO
                                     ,in_hdgcodigo
                                     ,in_esacodigo
                                     ,in_cmecodigo
                                     ,sysdate
                                     ,in_usuario
                                     ,v_ordenador
                                     ,c.FBODEXTERNADESC);
                              End;
                        
                           END LOOP;
    ELSE
        --1.- Realizo el mismo proceso de cierre pero hasta el momento (Periodo Actual)     
       --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTACIERREKARDEX - ahora' , sysdate ); commit;
       
        -- buscar ID periodo anterior cerrado
        begin
            select max(CKAR_ID)
            into v_CKAR_ID_CierreAnterior
            from CLIN_FAR_CIERRE_KARDEX_PERIODO
            where HDGCODIGO = In_HdgCodigo
            and CMECODIGO   = In_CMECODIGO
            and FBOD_CODIGO = In_CodBodega;
        Exception When Others Then
             Goto PKG_Exit;        
        end;
        --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTACIERREKARDEX - paso 1, v_CKAR_ID_CierreAnterior:' || v_CKAR_ID_CierreAnterior , sysdate ); commit;
        begin
            select  CKAR_FECHA_CIERRE + 1/86400 
            into v_CKAR_FECHA_APERTURA
            from CLIN_FAR_CIERRE_KARDEX_PERIODO
            where CKAR_ID = v_CKAR_ID_CierreAnterior;
        Exception When Others Then
            Goto PKG_Exit;        
        end;
                
        v_CKAR_FECHA_CIERRE:= sysdate;
        v_CKAR_PERIODO:= to_number(to_char(sysdate, 'yyyymm'));
        
        -- recorro la clin_far_bodegas_inv par la bodega y / el producto dentro la bodega en caso de llevar mameid distinto de 0
        -- por cada producto del clin_far_bodegas_inv 
        -- se busca el saldo incial del cierre {ultimo periodo cerrado)
        -- se busca todos los movimientos, similar al cierre (Entradas/Salidas/ajustes)
                                
        --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTACIERREKARDEX - paso 2' , sysdate ); commit;
   
        v_ordenador:= 0;                          
        v_FBOI_MEIN_ID_aux :=  '00';
        for cur in (SELECT FBOI_MEIN_ID, FBOI_STOCK_ACTUAL
                    FROM CLIN_FAR_BODEGAS_INV         
                    WHERE FBOI_FBOD_CODIGO = In_CodBodega
                    and(CASE WHEN (In_MeInId != 0) and FBOI_MEIN_ID = In_MeInId
                                THEN 1
                             WHEN (In_MeInId = 0) 
                                THEN 1
                             ELSE 0
                         END) = 1
                    )
        loop
            
            --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTACIERREKARDEX - paso 3' , sysdate ); commit; 
            begin
                select KADE_STOCK_ACTUAL
                into v_KADE_STOCK_ANTERIOR
                from CLIN_FAR_CIERRE_KARDEX_DET
                where  KADE_CKAR_ID  = v_CKAR_ID_CierreAnterior
                and KADE_MEIN_ID = cur.FBOI_MEIN_ID
                and rownum = 1;
            Exception 
                When NO_DATA_FOUND Then
                    v_KADE_STOCK_ANTERIOR:= 0;
                When Others Then
                    v_KADE_STOCK_ANTERIOR:= 0;
            end;
            
            --if v_KADE_STOCK_ANTERIOR = 0 then
             --   v_KADE_STOCK_SALDO:= cur.FBOI_STOCK_ACTUAL;
            --else
                v_KADE_STOCK_SALDO:= v_KADE_STOCK_ANTERIOR ;
            --end if;
            
            for curdet in (select MFDE_ID, MDEV_ID, MFDE_FECHA
                           from (select mde.MFDE_ID , 0 MDEV_ID
                                 , mde.MFDE_MEIN_ID , mde.MFDE_FECHA  MFDE_FECHA
                                 from clin_far_movimdet mde
                                 where (mde.MFDE_FECHA) between v_CKAR_FECHA_APERTURA  and   v_CKAR_FECHA_CIERRE 
                                 union all
                                 select dev.MDEV_MFDE_ID MFDE_ID, dev.MDEV_ID
                                 , (select MFDE_MEIN_ID from clin_far_movimdet where MFDE_ID = dev.MDEV_MFDE_ID)  MFDE_MEIN_ID
                                 , dev.MDEV_FECHA MFDE_FECHA
                                 from clin_far_movim_devol dev
                                 where (dev.MDEV_FECHA) between v_CKAR_FECHA_APERTURA  and   v_CKAR_FECHA_CIERRE 
                                 )
                           where MFDE_MEIN_ID = cur.FBOI_MEIN_ID
                           order by MFDE_FECHA
                           )
            loop
                --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTACIERREKARDEX - paso 4' , sysdate ); commit;
                if  v_FBOI_MEIN_ID_aux <> cur.FBOI_MEIN_ID then
                    v_FBOI_MEIN_ID_aux :=  cur.FBOI_MEIN_ID;
                          
                    --SALDO INICIAL
                    begin
                            INSERT INTO TMP_CIERRE_KARDEX_DET
                            ( IDREPORT
                            ,KADE_CKAR_ID
                            ,KADE_MEIN_ID
                            ,KADE_MFDE_FECHA
                            ,KADE_MOVF_BOD_SUMINISTRO
                            ,KADE_MOVF_TIPO
                            ,KADE_STOCK_SALDO
                            ,KADE_STOCK_ACTUAL
                            ,ORDENADOR
                            ) 
                            values 
                            ( In_IdReport 
                            ,In_CKarId
                            ,cur.FBOI_MEIN_ID
                            ,v_CKAR_FECHA_APERTURA
                            ,In_CodBodega
                            ,1
                            ,v_KADE_STOCK_SALDO
                            ,cur.FBOI_STOCK_ACTUAL
                            ,v_ordenador
                            );
                    end;
                end if;
                
                v_KADE_CODTIPIDENTIFICACION:= null;
                v_KADE_CLINUMIDENTIFICACION:= null;
                v_KADE_CLINOMBRES:= null;
                v_KADE_CLIAPEPATERNO:= null;
                v_KADE_CLIAPEMATERNO:= null;
                v_KADE_PCLIIDMEDSOLICITANTE:= null;
                v_KADE_PCLIIDMEDTRATANTE:= null;
                v_KADE_CODTIPIDENTIFICACION_PR:= null;
                v_KADE_CLINUMIDENTIFICACION_PR:= null;
                v_KADE_CLINOMBRES_PROF:= null;
                v_KADE_CLIAPEPATERNO_PROF:= null;
                v_KADE_CLIAPEMATERNO_PROF:= null;
                v_KADE_CLIFONOMOVIL_PROF:= null;
                v_KADE_CODTIPPROFESIONAL:= null;
                v_KADE_CODESPECIALIDAD:= null;
                v_KADE_MOVF_BOD_SUMINISTRO:= null;
                v_KADE_MOVF_SOLI_ID:= null;
                v_KADE_OPERACION:= null;
                v_KADE_MOVF_BOD_EXTERNA:= null;
                            
                if curdet.MDEV_ID > 0 then
                    -- obtiene datos a partir de la devolucion
                    begin
                        select   MDEV_FECHA, MDEV_CANTIDAD, MDEV_MOVF_TIPO, MDEV_MFDEORIGEN_ID
                        into    v_KADE_MFDE_FECHA, v_KADE_MFDE_CANTIDAD, v_TIPO_MOV, v_MDEV_MFDEORIGEN_ID
                        from clin_far_movim_devol 
                        where MDEV_ID = curdet.MDEV_ID;
                    end;
                    
                    if v_TIPO_MOV = 70 or v_TIPO_MOV = 180 then -- (RECEPCIÓN POR DEVOLUCION PACIENTE - DESPACHO POR DEVOLUCION ARTICULO)
                        begin
                            select nvl(mov.MOVF_CLIID, 0), mov.MOVF_SOLI_ID,  mov.MOVF_BOD_ORIGEN, mov.MOVF_BOD_DESTINO, mov.MOVF_ESTID 
                                ,MOVF_ORCO_NUMDOC, MOVF_GUIA_NUMERO_DOC, MOVF_RECETA
                                ,mde.MFDE_IDTIPOMOTIVO
                            into   v_KADE_CLIID, v_KADE_MOVF_SOLI_ID, v_MOVF_BOD_ORIGEN, v_MOVF_BOD_DESTINO, v_MOVF_ESTID
                                ,v_KADE_MOVF_ORCO_NUMDOC,  v_KADE_MOVF_FACTURA_NUMDOC, v_KADE_MOVF_RECETA 
                                ,v_KADE_MFDE_IDTIPOMOTIVO
                            FROM clin_far_movim    mov
                                ,clin_far_movimdet mde    
                            WHERE mov.MOVF_ID = mde.MFDE_MOVF_ID 
                            and mde.MFDE_ID = v_MDEV_MFDEORIGEN_ID;
                        end;
                    else
                        begin
                            select nvl(mov.MOVF_CLIID, 0), mov.MOVF_SOLI_ID,  mov.MOVF_BOD_ORIGEN, mov.MOVF_BOD_DESTINO, mov.MOVF_ESTID 
                                ,MOVF_ORCO_NUMDOC, MOVF_GUIA_NUMERO_DOC, MOVF_RECETA
                                ,mde.MFDE_IDTIPOMOTIVO
                            into   v_KADE_CLIID, v_KADE_MOVF_SOLI_ID, v_MOVF_BOD_ORIGEN, v_MOVF_BOD_DESTINO, v_MOVF_ESTID
                                ,v_KADE_MOVF_ORCO_NUMDOC,  v_KADE_MOVF_FACTURA_NUMDOC, v_KADE_MOVF_RECETA 
                                ,v_KADE_MFDE_IDTIPOMOTIVO
                            FROM clin_far_movim    mov
                                ,clin_far_movimdet mde    
                            WHERE mov.MOVF_ID = mde.MFDE_MOVF_ID 
                            and mde.MFDE_ID = curdet.MFDE_ID;
                        end;
                    end if;
                else
                    --obtiene datos a partir del mov det
                    begin
                        select nvl(mov.MOVF_CLIID, 0), mov.MOVF_SOLI_ID,  mov.MOVF_BOD_ORIGEN, mov.MOVF_BOD_DESTINO, mov.MOVF_ESTID 
                              ,mov.MOVF_ORCO_NUMDOC, mov.MOVF_GUIA_NUMERO_DOC, mov.MOVF_RECETA
                              ,mde.MFDE_FECHA, mde.MFDE_CANTIDAD ,mde.MFDE_TIPO_MOV
                              ,mde.MFDE_IDTIPOMOTIVO, mde.MFDE_SOLI_ID, mde.MFDE_MDEV_ID
                              ,mde.MFDE_CANTIDAD_DEVUELTA
                        into   v_KADE_CLIID, v_KADE_MOVF_SOLI_ID, v_MOVF_BOD_ORIGEN, v_MOVF_BOD_DESTINO, v_MOVF_ESTID
                              ,v_KADE_MOVF_ORCO_NUMDOC,  v_KADE_MOVF_FACTURA_NUMDOC, v_KADE_MOVF_RECETA 
                              ,v_KADE_MFDE_FECHA, v_KADE_MFDE_CANTIDAD, v_TIPO_MOV
                              ,v_KADE_MFDE_IDTIPOMOTIVO, v_MFDE_SOLI_ID, v_MFDE_MDEV_ID
                              ,v_MFDE_CANTIDAD_DEVUELTA
                        FROM clin_far_movim    mov
                             ,clin_far_movimdet mde    
                        WHERE mov.MOVF_ID = mde.MFDE_MOVF_ID 
                        and mde.MFDE_ID = curdet.MFDE_ID;
                    end;
                    if v_TIPO_MOV = 180 then -- (DESPACHO POR DEVOLUCION ARTICULO)    
                        v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                        v_MOVF_BOD_ORIGEN:= null;
                        v_MOVF_BOD_DESTINO:= null;
                    end if;    
                    if v_TIPO_MOV = 115 or v_TIPO_MOV = 15 then -- (AJUSTE STOCK)
                        if v_TIPO_MOV = 115  then 
                            v_KADE_MFDE_CANTIDAD:= v_MFDE_CANTIDAD_DEVUELTA;
                        end if;
                        begin
                            select KARD_AJUS_ID
                            into v_KARD_AJUS_ID
                            from CLIN_FAR_KARDEX
                            where KARD_MFDE_ID = curdet.MFDE_ID;
                        end;
                        begin
                            select AJUS_MOTIVO
                            into v_AJUS_MOTIVO
                            from CLIN_FAR_AJUSTES
                            where AJUS_ID = v_KARD_AJUS_ID;
                        end;     
                        v_KADE_MFDE_IDTIPOMOTIVO:= v_AJUS_MOTIVO;
                    end if; 
                end if;
                --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTACIERREKARDEX - paso 5' , sysdate ); commit;
                --mov solic bodegas
                if v_TIPO_MOV = 100 then
                    v_KADE_OPERACION:= 'R';  
                    v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO;
                    if v_KADE_MOVF_BOD_SUMINISTRO = In_CodBodega then
                       --salida
                       v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO - v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
                            
                if v_TIPO_MOV = 170 then
                    v_KADE_OPERACION:= 'R';  
                    v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                    if v_KADE_MOVF_BOD_SUMINISTRO = In_CodBodega then
                        --salida
                        v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO - v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
                if v_TIPO_MOV = 50 then
                    v_KADE_OPERACION:= 'S';
                    v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO ;
                    if v_KADE_MOVF_BOD_SUMINISTRO = In_CodBodega then
                        --entrada
                        v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO + v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
                
                --mov solic pacientes
                --140  HOS
                --150  AMB
                --160  URG
                if v_TIPO_MOV = 140 or v_TIPO_MOV = 150 or v_TIPO_MOV = 160 then
                    v_KADE_OPERACION:= 'R';  
                    v_KADE_MOVF_BOD_EXTERNA:= NULL;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO ;
                    if v_KADE_MOVF_BOD_SUMINISTRO = In_CodBodega then
                        --salida
                        v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO - v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
                                
                            
                if v_TIPO_MOV = 30 then
                    v_KADE_OPERACION:= 'S';
                    v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                    if v_KADE_MOVF_BOD_SUMINISTRO = In_CodBodega then
                        --entrada
                        v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO + v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
                            
                if v_TIPO_MOV = 60 then
                    v_KADE_OPERACION:= 'S';
                    v_KADE_MOVF_BOD_EXTERNA:= NULL;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO ;
                    if v_KADE_MOVF_BOD_SUMINISTRO = In_CodBodega then
                        --entrada
                        v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO + v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
                            
                --mov de farmacia
                if v_TIPO_MOV = 70 then
                    v_KADE_OPERACION:= 'S';
                    v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO ;
                    if v_KADE_MOVF_BOD_SUMINISTRO = In_CodBodega then
                        --entrada
                        v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO + v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
                if v_TIPO_MOV = 180 then
                   v_KADE_OPERACION:= 'R';  
                   v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                   v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                   if v_KADE_MOVF_BOD_SUMINISTRO = In_CodBodega then
                      --salida
                      v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO - v_KADE_MFDE_CANTIDAD;
                   end if;
                end if;
                if v_TIPO_MOV = 90 then
                    v_KADE_OPERACION:= 'S';
                    v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO ;
                    v_KADE_MOVF_SOLI_ID:= v_MFDE_SOLI_ID;
                    if v_KADE_MOVF_BOD_SUMINISTRO = In_CodBodega then
                        --entrada
                        v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO + v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
                            
                --mov ajuste stock
                if v_TIPO_MOV = 115 then
                    v_KADE_OPERACION:= 'R';  
                    v_KADE_MOVF_BOD_EXTERNA:= NULL;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN;
                    if v_KADE_MOVF_BOD_SUMINISTRO = In_CodBodega then
                        --salida
                        v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO - v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
                if v_TIPO_MOV = 15 then
                    v_KADE_OPERACION:= 'S';
                    v_KADE_MOVF_BOD_EXTERNA:= NULL;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                    if v_KADE_MOVF_BOD_SUMINISTRO = In_CodBodega then
                        --entrada
                        v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO + v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
                
                --mov fraccionados
                if v_TIPO_MOV = 116 then
                     --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTACIERREKARDEX - v_TIPO_MOV: ' || v_TIPO_MOV , sysdate ); commit;
                    v_KADE_OPERACION:= 'R';  
                    v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN;
                    if v_KADE_MOVF_BOD_SUMINISTRO = In_CodBodega then
                        --salida
                        v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO - v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
                if v_TIPO_MOV = 16 then
                   --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTACIERREKARDEX - v_TIPO_MOV: ' || v_TIPO_MOV , sysdate ); commit;
                    v_KADE_OPERACION:= 'S';
                    v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                    if v_KADE_MOVF_BOD_SUMINISTRO = In_CodBodega then
                        --entrada
                        v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO + v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
              
              --80	INGRESOS POR INTERFAZ FIN700
                if v_TIPO_MOV = 80 then
                    v_KADE_OPERACION:= 'S';
                    v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                    if v_KADE_MOVF_BOD_SUMINISTRO = In_CodBodega then
                        --entrada
                        v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO + v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
                --108	DEVOLUCION  POR INTERFAZ FIN700
                if v_TIPO_MOV = 108 then
                    v_KADE_OPERACION:= 'R';  
                    v_KADE_MOVF_BOD_EXTERNA:= null;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO;
                    if v_KADE_MOVF_BOD_SUMINISTRO = In_CodBodega then
                       --salida
                       v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO - v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
                
                --105	SALIDA POR DESPACHO AUTOPEDIDO
                if v_TIPO_MOV = 105 then
                    v_KADE_OPERACION:= 'R';  
                    v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN;
                    if v_KADE_MOVF_BOD_SUMINISTRO = In_CodBodega then
                       --salida
                       v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO - v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
                --5	INGRESOS POR DEVOLUCION AUTOPEDIDO
                if v_TIPO_MOV = 5 then
                    v_KADE_OPERACION:= 'S';
                    v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO ;
                    if v_KADE_MOVF_BOD_SUMINISTRO = In_CodBodega then
                        --entrada
                        v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO + v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
              
              
              
                
                --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTACIERREKARDEX - paso 6' , sysdate ); commit;
                if v_KADE_CLIID > 0 then    
                    begin
                        select CODTIPIDENTIFICACION, CLINUMIDENTIFICACION, CLINOMBRES, CLIAPEPATERNO, CLIAPEMATERNO
                        into v_KADE_CODTIPIDENTIFICACION, v_KADE_CLINUMIDENTIFICACION, v_KADE_CLINOMBRES, v_KADE_CLIAPEPATERNO, v_KADE_CLIAPEMATERNO
                        from desa1.cliente
                        where CLIID = v_KADE_CLIID;
                    Exception 
                        When NO_DATA_FOUND Then
                            v_KADE_CODTIPIDENTIFICACION := 0;
                            v_KADE_CLINUMIDENTIFICACION:='';
                            v_KADE_CLINOMBRES:='';
                            v_KADE_CLIAPEPATERNO:=''; 
                            v_KADE_CLIAPEMATERNO:='';
                        When Others Then
                            v_KADE_CODTIPIDENTIFICACION := 0;
                            v_KADE_CLINUMIDENTIFICACION:='';
                            v_KADE_CLINOMBRES:='';
                            v_KADE_CLIAPEPATERNO:=''; 
                            v_KADE_CLIAPEMATERNO:='';
                    end;  
                    -- insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_CIERRE_MEDCONTROLADOS - v_MOVF_ESTID: '  || v_MOVF_ESTID , sysdate ); commit;
                    begin
                        select PCLIIDMEDSOLICITANTE, PCLIIDMEDTRATANTE
                        into v_KADE_PCLIIDMEDSOLICITANTE, v_KADE_PCLIIDMEDTRATANTE
                        from desa1.estadia
                        where ESTID = v_MOVF_ESTID;
                    Exception 
                        When NO_DATA_FOUND Then
                            v_KADE_PCLIIDMEDSOLICITANTE := 0;
                            v_KADE_PCLIIDMEDTRATANTE:=0;
                        When Others Then
                            v_KADE_PCLIIDMEDSOLICITANTE := 0;
                            v_KADE_PCLIIDMEDTRATANTE:=0;
                    end;
                    --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_CIERRE_MEDCONTROLADOS - v_KADE_PCLIIDMEDSOLICITANTE: '  || v_KADE_PCLIIDMEDSOLICITANTE , sysdate ); commit;
                    begin
                        select CODTIPIDENTIFICACION, CLINUMIDENTIFICACION, CLINOMBRES, CLIAPEPATERNO, CLIAPEMATERNO
                            ,CLIFONOMOVIL
                        into v_KADE_CODTIPIDENTIFICACION_PR, v_KADE_CLINUMIDENTIFICACION_PR, v_KADE_CLINOMBRES_PROF, v_KADE_CLIAPEPATERNO_PROF, v_KADE_CLIAPEMATERNO_PROF
                            ,v_KADE_CLIFONOMOVIL_PROF
                        from desa1.cliente
                        where CLIID = v_KADE_PCLIIDMEDSOLICITANTE;
                    Exception 
                        When NO_DATA_FOUND Then
                            v_KADE_CODTIPIDENTIFICACION_PR := 0; 
                            v_KADE_CLINUMIDENTIFICACION_PR := '';
                            v_KADE_CLINOMBRES_PROF := ''; 
                            v_KADE_CLIAPEPATERNO_PROF := ''; 
                            v_KADE_CLIAPEMATERNO_PROF  := '';
                        When Others Then
                            v_KADE_CODTIPIDENTIFICACION_PR := 0; 
                            v_KADE_CLINUMIDENTIFICACION_PR := '';
                            v_KADE_CLINOMBRES_PROF := ''; 
                            v_KADE_CLIAPEPATERNO_PROF := ''; 
                            v_KADE_CLIAPEMATERNO_PROF  := '';
                    end;
                    
                    begin
                        select CODTIPPROFESIONAL
                        into v_KADE_CODTIPPROFESIONAL
                        from desa1.profesional
                        where CLIID = v_KADE_PCLIIDMEDSOLICITANTE;
                    Exception 
                        When NO_DATA_FOUND Then
                            v_KADE_CODTIPPROFESIONAL:= 0;
                        When Others Then
                            v_KADE_CODTIPPROFESIONAL:= 0;
                    end;
                    begin
                        select CODESPECIALIDAD 
                        into v_KADE_CODESPECIALIDAD
                        from desa1.especialidadprof
                        where HDGCODIGO = In_HdgCodigo
                        and PCLIID = v_KADE_PCLIIDMEDSOLICITANTE
                        and FLGVIGENCIA = 1
                        and rownum = 1;
                    Exception 
                        When NO_DATA_FOUND Then
                            v_KADE_CODESPECIALIDAD:= 0;
                        When Others Then
                            v_KADE_CODESPECIALIDAD:= 0;
                    end;
                end if;
                
                --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTACIERREKARDEX - paso 7' , sysdate ); commit;
                v_ordenador:= v_ordenador + 1; 
                begin     
                    INSERT INTO  TMP_CIERRE_KARDEX_DET
                    (IDREPORT
                    ,KADE_CKAR_ID
                    ,KADE_MEIN_ID
                    ,KADE_CLIID
                    ,KADE_CODTIPIDENTIFICACION
                    ,KADE_CLINUMIDENTIFICACION
                    ,KADE_CLINOMBRES
                    ,KADE_CLIAPEPATERNO
                    ,KADE_CLIAPEMATERNO
                    ,KADE_PCLIIDMEDSOLICITANTE
                    ,KADE_PCLIIDMEDTRATANTE
                    ,KADE_CODTIPIDENTIFICACION_PROF
                    ,KADE_CLINUMIDENTIFICACION_PROF
                    ,KADE_CLINOMBRES_PROF
                    ,KADE_CLIAPEPATERNO_PROF
                    ,KADE_CLIAPEMATERNO_PROF
                    ,KADE_CODTIPPROFESIONAL
                    ,KADE_CODESPECIALIDAD
                    ,KADE_CLIFONOMOVIL_PROF
                    ,KADE_MFDE_FECHA
                    ,KADE_MFDE_CANTIDAD
                    ,KADE_OPERACION
                    ,KADE_STOCK_SALDO
                    ,KADE_MOVF_RECETA
                    ,KADE_MOVF_BOD_SUMINISTRO
                    ,KADE_MOVF_SOLI_ID
                    ,KADE_MOVF_ORCO_NUMDOC
                    ,KADE_MOVF_FACTURA_NUMDOC
                    ,KADE_MFDE_ID
                    ,KADE_MDEV_ID
                    ,KADE_MOVF_TIPO
                    ,KADE_MFDE_IDTIPOMOTIVO
                    ,KADE_STOCK_ACTUAL
                    ,KADE_MOVF_BOD_EXTERNA
                    ,ORDENADOR) 
                    values 
                    (In_IdReport 
                    ,In_CKarId
                    ,cur.FBOI_MEIN_ID
                    ,v_KADE_CLIID
                    ,v_KADE_CODTIPIDENTIFICACION
                    ,v_KADE_CLINUMIDENTIFICACION
                    ,v_KADE_CLINOMBRES
                    ,v_KADE_CLIAPEPATERNO
                    ,v_KADE_CLIAPEMATERNO
                    ,v_KADE_PCLIIDMEDSOLICITANTE
                    ,v_KADE_PCLIIDMEDTRATANTE
                    ,v_KADE_CODTIPIDENTIFICACION_PR
                    ,v_KADE_CLINUMIDENTIFICACION_PR
                    ,v_KADE_CLINOMBRES_PROF
                    ,v_KADE_CLIAPEPATERNO_PROF
                    ,v_KADE_CLIAPEMATERNO_PROF
                    ,v_KADE_CODTIPPROFESIONAL
                    ,v_KADE_CODESPECIALIDAD
                    ,v_KADE_CLIFONOMOVIL_PROF
                    ,v_KADE_MFDE_FECHA
                    ,v_KADE_MFDE_CANTIDAD
                    ,v_KADE_OPERACION
                    ,v_KADE_STOCK_SALDO
                    ,v_KADE_MOVF_RECETA
                    ,v_KADE_MOVF_BOD_SUMINISTRO
                    ,v_KADE_MOVF_SOLI_ID
                    ,v_KADE_MOVF_ORCO_NUMDOC
                    ,v_KADE_MOVF_FACTURA_NUMDOC
                    ,curdet.MFDE_ID
                    ,curdet.MDEV_ID
                    ,v_TIPO_MOV
                    ,v_KADE_MFDE_IDTIPOMOTIVO
                    ,cur.FBOI_STOCK_ACTUAL
                    ,v_KADE_MOVF_BOD_EXTERNA
                    ,v_ordenador);
               /* Exception 
                    When NO_DATA_FOUND Then
                        insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTACIERREKARDEX - caida paso 8' , sysdate ); commit;
            
                        null;
                    When Others Then
                        null;
                       insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTACIERREKARDEX - caida paso 9' , sysdate ); commit;
            */
                end;
                
            end loop;
        end loop;        
      
        -- 2.- Cargo la consulta correspondiente en la tabla del Reporte                         
        v_ordenador2:= 0;  
        FOR c IN (select v_CKAR_PERIODO
                   , to_char(v_CKAR_FECHA_APERTURA, 'dd-mm-yyyy hh24:mi:ss') CKAR_FECHA_APERTURA_CHAR
                   , to_char(v_CKAR_FECHA_CIERRE, 'dd-mm-yyyy hh24:mi:ss') CKAR_FECHA_CIERRE_CHAR
                   , In_Usuario
                   , (SELECT TRIM(MEIN_CODMEI) FROM clin_far_mamein WHERE KADE_MEIN_ID = mein_id(+) AND hdgcodigo = In_HdgCodigo) MEIN_CODMEI
                   , (SELECT TRIM(INITCAP(mein_descri)) FROM clin_far_mamein WHERE KADE_MEIN_ID = mein_id(+) AND hdgcodigo = In_HdgCodigo) mein_descri
                   , nvl((SELECT TRIM(INITCAP(pact_descri)) FROM clin_far_principio_act, clin_far_mamein WHERE mein_id = KADE_MEIN_ID AND pact_id = mein_pact_id), ' ' ) principioactivo
                   , nvl((SELECT TRIM(INITCAP(pres_descri)) FROM clin_far_presentacion_med, clin_far_mamein WHERE mein_id = KADE_MEIN_ID  AND pres_id = mein_pres_id), ' ' )  presentacion
                   , nvl((SELECT TRIM(INITCAP(ffar_descri)) FROM clin_far_forma_farma ,clin_far_mamein WHERE mein_id = KADE_MEIN_ID  AND ffar_id = mein_ffar_id), ' ' ) formafarma     
                   , to_char(KADE_MFDE_FECHA, 'dd-mm-yyyy hh24:mi') KADE_MFDE_FECHA_CHAR
                   , decode (KADE_MOVF_TIPO , 0, 'Sin Descripción',nvl((select INITCAP(FPAR_DESCRIPCION) from clin_far_param where FPAR_TIPO = 8 and FPAR_CODIGO = KADE_MOVF_TIPO), ' ')) FPAR_DESCRIPCION
                   , CASE KADE_MOVF_TIPO 
                        WHEN 115 THEN decode (KADE_MFDE_IDTIPOMOTIVO , 0, 'Sin Descripción',nvl((select INITCAP(FPAR_DESCRIPCION) from clin_far_param where FPAR_TIPO = 16 and FPAR_CODIGO = KADE_MFDE_IDTIPOMOTIVO), ' ')) 
                        WHEN 15  THEN decode (KADE_MFDE_IDTIPOMOTIVO , 0, 'Sin Descripción',nvl((select INITCAP(FPAR_DESCRIPCION) from clin_far_param where FPAR_TIPO = 16 and FPAR_CODIGO = KADE_MFDE_IDTIPOMOTIVO), ' ')) 
                        ELSE  decode (KADE_MFDE_IDTIPOMOTIVO , 0, 'Sin Descripción',nvl((select INITCAP(FPAR_DESCRIPCION) from clin_far_param where FPAR_TIPO = 18 and FPAR_CODIGO = KADE_MFDE_IDTIPOMOTIVO), ' ')) 
                     END  tipomotivodes
                   , nvl((select FBOD_DESCRIPCION from clin_far_bodegas where FBOD_CODIGO = KADE_MOVF_BOD_SUMINISTRO and  HDGCODIGO = In_HDGCODIGO 
                                                                                     and ESACODIGO = In_EsaCodigo 
                                                                                     and CMECODIGO = In_CMECODIGO), 'Sin Descripción' ) FBOD_DESCRIPCION
                   , nvl(KADE_MOVF_RECETA, 0 ) KADE_MOVF_RECETA
                   , nvl(KADE_CLINUMIDENTIFICACION_PROF, ' ') KADE_CLINUMIDENTIFICACION_PROF
                   , INITCAP((KADE_CLINOMBRES_PROF || ' ' || KADE_CLIAPEPATERNO_PROF || ' ' || KADE_CLIAPEMATERNO_PROF)) NombreProf
                   , nvl(KADE_CLINUMIDENTIFICACION, ' ') KADE_CLINUMIDENTIFICACION 
                   , INITCAP((KADE_CLINOMBRES || ' ' || KADE_CLIAPEPATERNO || ' ' || KADE_CLIAPEMATERNO) ) NombrePac
                   , decode(KADE_OPERACION, 'S',   KADE_MFDE_CANTIDAD, 0) cantidad_entrada
                   , decode(KADE_OPERACION, 'R',   KADE_MFDE_CANTIDAD, 0) cantidad_salida
                   , nvl(KADE_STOCK_SALDO, 0) KADE_STOCK_SALDO
                   , nvl((select FBOD_DESCRIPCION from clin_far_bodegas where FBOD_CODIGO = KADE_MOVF_BOD_EXTERNA and  HDGCODIGO = In_HdgCodigo 
                                                                                     and ESACODIGO = In_EsaCodigo
                                                                                     and CMECODIGO = In_CMECODIGO), ' ' ) FBodExternaDesc
                   from TMP_CIERRE_KARDEX_DET      det
                   where IDREPORT = In_IDREPORT
                   and KADE_MOVF_BOD_SUMINISTRO = In_CodBodega
                   and(CASE WHEN (In_MeInId != 0) and det.KADE_MEIN_ID = In_MeInId
                             THEN 1
                            WHEN (In_MeInId = 0) 
                                THEN 1
                            ELSE 0
                       END) = 1
                   order by ORDENADOR
                )
        LOOP         
            v_ordenador2:= v_ordenador2 + 1;  
            Begin
                Insert Into RPT_CONSULTACIERREKARDEX
                 (idreport
                 ,CKAR_PERIODO
                 ,CKAR_FECHA_APERTURA_CHAR
                 ,CKAR_FECHA_CIERRE_CHAR
                 ,CKAR_USUARIO
                 ,MEIN_CODMEI
                 ,MEIN_DESCRI
                 ,principioactivo
                 ,presentacion
                 ,formafarma
                 ,KADE_MFDE_FECHA_CHAR
                 ,FPAR_DESCRIPCION
                 ,TIPOMOTIVODES
                 ,FBOD_DESCRIPCION
                 ,KADE_MOVF_RECETA
                 ,KADE_CLINUMIDENTIFICACION_PROF
                 ,NOMBREPROF
                 ,KADE_CLINUMIDENTIFICACION
                 ,NOMBREPAC
                 ,CANTIDAD_ENTRADA
                 ,CANTIDAD_SALIDA
                 ,KADE_STOCK_SALDO
                 ,hdgcodigo
                 ,esacodigo
                 ,cmecodigo
                 ,fecharpt
                 ,usuario
                 ,ordenador
                 ,FBODEXTERNADESC
                 )
                 Values
                 (in_idreport
                 ,v_CKAR_PERIODO
                 ,c.CKAR_FECHA_APERTURA_CHAR
                 ,c.CKAR_FECHA_CIERRE_CHAR
                 ,In_USUARIO
                 ,c.MEIN_CODMEI
                 ,c.MEIN_DESCRI
                 ,c.principioactivo
                 ,c.presentacion
                 ,c.formafarma
                 ,c.KADE_MFDE_FECHA_CHAR
                 ,c.FPAR_DESCRIPCION
                 ,c.TIPOMOTIVODES
                 ,c.FBOD_DESCRIPCION
                 ,c.KADE_MOVF_RECETA
                 ,c.KADE_CLINUMIDENTIFICACION_PROF
                 ,c.NOMBREPROF
                 ,c.KADE_CLINUMIDENTIFICACION
                 ,c.NOMBREPAC
                 ,c.CANTIDAD_ENTRADA
                 ,c.CANTIDAD_SALIDA
                 ,c.KADE_STOCK_SALDO
                 ,in_hdgcodigo
                 ,in_esacodigo
                 ,in_cmecodigo
                 ,sysdate
                 ,in_usuario
                 ,v_ordenador2
                 ,c.FBODEXTERNADESC);
            End;
        END LOOP;                
    
    END IF;

END;

<<PKG_Exit>>

    NULL;

End PRO_RPT_CONSULTACIERREKARDEX;

End PKG_RPT_CONSULTACIERREKARDEX;
/