CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."PKG_TMP_CONSULTALIBCONTROLADOS" As

Procedure PRO_TMP_CONSULTALIBCONTROLADOS  
    ( In_IdReport   In Number
     ,In_HdgCodigo  In Number        
     ,In_EsaCodigo  In Number        
     ,In_CmeCodigo  In Number 
     ,In_Usuario    In Varchar2
     ,In_LibCId     In Number
     ,In_CodBodegaControlados In Number
     ,In_MeInId     In Number
     ) As

Begin

DECLARE
    v_ordenador       number(10);
    
    v_CantCierre  NUMBER;
    v_MaxLIBC_ID            CLIN_FAR_LIBRO_CONTROLADO_PERI.LIBC_ID%type; 
    v_LIBC_ID_CierreAnterior CLIN_FAR_LIBRO_CONTROLADO_PERI.LIBC_ID%type; 

    v_LIBC_PERIODO          CLIN_FAR_LIBRO_CONTROLADO_PERI.LIBC_PERIODO%type; 
    v_LIBC_FECHA_APERTURA   CLIN_FAR_LIBRO_CONTROLADO_PERI.LIBC_FECHA_APERTURA%type; 
    v_LIBC_FECHA_CIERRE     CLIN_FAR_LIBRO_CONTROLADO_PERI.LIBC_FECHA_CIERRE%type; 

    v_LIDE_CLIID                CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_CLIID%type;
    v_LIDE_MOVF_SOLI_ID         CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_MOVF_SOLI_ID%type;
    v_LIDE_MOVF_BOD_SUMINISTRO  CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_MOVF_BOD_SUMINISTRO%type;
    v_MOVF_ESTID                clin_far_movim.MOVF_ESTID%type;
    v_LIDE_MOVF_ORCO_NUMDOC     CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_MOVF_ORCO_NUMDOC%type;
    v_LIDE_MOVF_FACTURA_NUMDOC  CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_MOVF_FACTURA_NUMDOC%type;
    v_LIDE_MOVF_RECETA          CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_MOVF_RECETA%type;
    v_LIDE_MFDE_FECHA           CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_MFDE_FECHA%type;
    v_LIDE_MFDE_CANTIDAD        CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_MFDE_CANTIDAD%type;
    v_LIDE_CODTIPIDENTIFICACION CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_CODTIPIDENTIFICACION%type; 
    v_LIDE_CLINUMIDENTIFICACION CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_CLINUMIDENTIFICACION%type;
    v_LIDE_CLINOMBRES           CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_CLINOMBRES%type;
    v_LIDE_CLIAPEPATERNO        CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_CLIAPEPATERNO%type;
    v_LIDE_CLIAPEMATERNO        CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_CLIAPEMATERNO%type;             
    v_LIDE_PCLIIDMEDSOLICITANTE CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_PCLIIDMEDSOLICITANTE%type;
    v_LIDE_PCLIIDMEDTRATANTE            CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_PCLIIDMEDTRATANTE%type;
    v_LIDE_CODTIPIDENTIFICACION_PR    CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_CODTIPIDENTIFICACION_PROF%type;
    v_LIDE_CLINUMIDENTIFICACION_PR    CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_CLINUMIDENTIFICACION_PROF%type;
    v_LIDE_CLINOMBRES_PROF              CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_CLINOMBRES_PROF%type;
    v_LIDE_CLIAPEPATERNO_PROF           CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_CLIAPEPATERNO_PROF%type;
    v_LIDE_CLIAPEMATERNO_PROF           CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_CLIAPEMATERNO_PROF%type;
    v_LIDE_CLIFONOMOVIL_PROF            CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_CLIFONOMOVIL_PROF%type;
    v_LIDE_CODTIPPROFESIONAL            CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_CODTIPPROFESIONAL%type;
    v_LIDE_CODESPECIALIDAD              CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_CODESPECIALIDAD%type;
    v_TIPO_MOV                          number(10);
    v_MDEV_MFDEORIGEN_ID                clin_far_movim_devol.MDEV_MFDEORIGEN_ID%type;
    v_MOVF_BOD_ORIGEN                   clin_far_movim.MOVF_BOD_ORIGEN%type;
    v_MOVF_BOD_DESTINO                  clin_far_movim.MOVF_BOD_DESTINO%type;
    v_LIDE_MFDE_IDTIPOMOTIVO            clin_far_movimdet.MFDE_IDTIPOMOTIVO%type;
    v_MFDE_SOLI_ID                      clin_far_movimdet.MFDE_SOLI_ID%type;    
    v_MFDE_MDEV_ID                      clin_far_movimdet.MFDE_MDEV_ID%type;    
    v_LIDE_STOCK_ANTERIOR               CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_STOCK_ACTUAL%type;
    v_LIDE_STOCK_SALDO                  CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_STOCK_ACTUAL%type;
    v_LIDE_OPERACION                    CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_OPERACION%type;  
    v_MFDE_CANTIDAD_DEVUELTA            clin_far_movimdet.MFDE_CANTIDAD_DEVUELTA%type;
    v_KARD_AJUS_ID                      CLIN_FAR_KARDEX.KARD_AJUS_ID%type;
    v_AJUS_MOTIVO                       CLIN_FAR_AJUSTES.AJUS_MOTIVO%type;
    v_LIDE_MOVF_BOD_EXTERNA             CLIN_FAR_LIBRO_CONTROLADO_DET.LIDE_MOVF_BOD_EXTERNA%type;    
    v_FBOI_MEIN_ID_aux                  CLIN_FAR_BODEGAS_INV.FBOI_MEIN_ID%type;

BEGIN

       --1.- Realizo el mismo proceso de cierre pero hasta el momento (Periodo Actual)     
       --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTALIBCONTROLADOS - ahora' , sysdate ); commit;

        -- buscar ID periodo anterior cerrado
        begin
            select max(LIBC_ID)
            into v_LIBC_ID_CierreAnterior
            from CLIN_FAR_LIBRO_CONTROLADO_PERI
            where HDGCODIGO = In_HdgCodigo
            and CMECODIGO   = In_CMECODIGO
            and FBOD_CODIGO = In_CodBodegaControlados;
        Exception When Others Then
             Goto PKG_Exit;        
        end;
        --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTALIBCONTROLADOS - paso 1, v_LIBC_ID_CierreAnterior:' || v_LIBC_ID_CierreAnterior , sysdate ); commit;
        begin
            select  LIBC_FECHA_CIERRE + 1/86400 
            into v_LIBC_FECHA_APERTURA
            from CLIN_FAR_LIBRO_CONTROLADO_PERI
            where LIBC_ID = v_LIBC_ID_CierreAnterior;
        Exception When Others Then
            Goto PKG_Exit;        
        end;

        v_LIBC_FECHA_CIERRE:= sysdate;
        v_LIBC_PERIODO:= to_number(to_char(sysdate, 'yyyymm'));

        -- recorro la clin_far_bodegas_inv par la bodega y / el producto dentro la bodega en caso de llevar mameid distinto de 0
        -- por cada producto del clin_far_bodegas_inv 
        -- se busca el saldo incial del cierre {ultimo periodo cerrado)
        -- se busca todos los movimientos, similar al cierre (Entradas/Salidas/ajustes)

        --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTALIBCONTROLADOS - paso 2' , sysdate ); commit;

        v_ordenador:= 0;                          
        v_FBOI_MEIN_ID_aux :=  '00';
        for cur in (SELECT FBOI_MEIN_ID, FBOI_STOCK_ACTUAL
                    FROM CLIN_FAR_BODEGAS_INV         
                    WHERE FBOI_FBOD_CODIGO = In_CodBodegaControlados
                    and(CASE WHEN (In_MeInId != 0) and FBOI_MEIN_ID = In_MeInId
                                THEN 1
                             WHEN (In_MeInId = 0) 
                                THEN 1
                             ELSE 0
                         END) = 1
                    )
        loop
            --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTALIBCONTROLADOS - paso 3' , sysdate ); commit; 
            begin
                select LIDE_STOCK_ACTUAL
                into v_LIDE_STOCK_ANTERIOR
                from CLIN_FAR_LIBRO_CONTROLADO_DET
                where  LIDE_LIBC_ID  = v_LIBC_ID_CierreAnterior
                and LIDE_MEIN_ID = cur.FBOI_MEIN_ID
                and rownum = 1;
            Exception 
                When NO_DATA_FOUND Then
                    v_LIDE_STOCK_ANTERIOR:= 0;
                When Others Then
                    v_LIDE_STOCK_ANTERIOR:= 0;
            end;

            --if v_LIDE_STOCK_ANTERIOR = 0 then
                v_LIDE_STOCK_SALDO:= cur.FBOI_STOCK_ACTUAL;
            --else
                v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_ANTERIOR ;
            --end if;

            for curdet in (select MFDE_ID, MDEV_ID, MFDE_FECHA
                           from (select mde.MFDE_ID , 0 MDEV_ID
                                 , mde.MFDE_MEIN_ID , mde.MFDE_FECHA  MFDE_FECHA
                                 from clin_far_movimdet mde
                                 where (mde.MFDE_FECHA) between (v_LIBC_FECHA_APERTURA)  and   v_LIBC_FECHA_CIERRE 
                                 union all
                                 select dev.MDEV_MFDE_ID MFDE_ID, dev.MDEV_ID
                                 , (select MFDE_MEIN_ID from clin_far_movimdet where MFDE_ID = dev.MDEV_MFDE_ID)  MFDE_MEIN_ID
                                 , dev.MDEV_FECHA MFDE_FECHA
                                 from clin_far_movim_devol dev
                                 where (dev.MDEV_FECHA) between (v_LIBC_FECHA_APERTURA)  and   v_LIBC_FECHA_CIERRE 
                                 )
                           where MFDE_MEIN_ID = cur.FBOI_MEIN_ID
                           order by MFDE_FECHA
                           )
            loop
                --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTALIBCONTROLADOS - paso 4' , sysdate ); commit;
               if  v_FBOI_MEIN_ID_aux <> cur.FBOI_MEIN_ID then
                    v_FBOI_MEIN_ID_aux :=  cur.FBOI_MEIN_ID;

                    --SALDO INICIAL
                    begin
                        INSERT INTO TMP_LIBRO_CONTROLADO_DET
                        ( IDREPORT
                        ,LIDE_CKAR_ID
                        ,LIDE_MEIN_ID
                        ,LIDE_MFDE_FECHA
                        ,LIDE_MOVF_BOD_SUMINISTRO
                        ,LIDE_MOVF_TIPO
                        ,LIDE_STOCK_SALDO
                        ,LIDE_STOCK_ACTUAL
                        ,ORDENADOR
                        ) 
                        values 
                        ( In_IdReport 
                        ,In_LibCId
                        ,cur.FBOI_MEIN_ID
                        ,v_LIBC_FECHA_APERTURA
                        ,In_CodBodegaControlados
                        ,1
                        ,v_LIDE_STOCK_SALDO
                        ,cur.FBOI_STOCK_ACTUAL
                        ,v_ordenador
                        );
                    end;    
                end if;

                v_LIDE_CODTIPIDENTIFICACION:= null;
                v_LIDE_CLINUMIDENTIFICACION:= null;
                v_LIDE_CLINOMBRES:= null;
                v_LIDE_CLIAPEPATERNO:= null;
                v_LIDE_CLIAPEMATERNO:= null;
                v_LIDE_PCLIIDMEDSOLICITANTE:= null;
                v_LIDE_PCLIIDMEDTRATANTE:= null;
                v_LIDE_CODTIPIDENTIFICACION_PR:= null;
                v_LIDE_CLINUMIDENTIFICACION_PR:= null;
                v_LIDE_CLINOMBRES_PROF:= null;
                v_LIDE_CLIAPEPATERNO_PROF:= null;
                v_LIDE_CLIAPEMATERNO_PROF:= null;
                v_LIDE_CLIFONOMOVIL_PROF:= null;
                v_LIDE_CODTIPPROFESIONAL:= null;
                v_LIDE_CODESPECIALIDAD:= null;
                v_LIDE_MOVF_BOD_SUMINISTRO:= null;
                v_LIDE_MOVF_SOLI_ID:= null;
                v_LIDE_OPERACION:= null;
                v_LIDE_MOVF_BOD_EXTERNA:= null;

                if curdet.MDEV_ID > 0 then
                    -- obtiene datos a partir de la devolucion
                    begin
                        select   MDEV_FECHA, MDEV_CANTIDAD, MDEV_MOVF_TIPO, MDEV_MFDEORIGEN_ID
                        into    v_LIDE_MFDE_FECHA, v_LIDE_MFDE_CANTIDAD, v_TIPO_MOV, v_MDEV_MFDEORIGEN_ID
                        from clin_far_movim_devol 
                        where MDEV_ID = curdet.MDEV_ID;
                    end;

                    if v_TIPO_MOV = 70 or v_TIPO_MOV = 180 then -- (RECEPCIÓN POR DEVOLUCION PACIENTE - DESPACHO POR DEVOLUCION ARTICULO)
                        begin
                            select nvl(mov.MOVF_CLIID, 0), mov.MOVF_SOLI_ID,  mov.MOVF_BOD_ORIGEN, mov.MOVF_BOD_DESTINO, mov.MOVF_ESTID 
                                ,MOVF_ORCO_NUMDOC, MOVF_GUIA_NUMERO_DOC, MOVF_RECETA
                                ,mde.MFDE_IDTIPOMOTIVO
                            into   v_LIDE_CLIID, v_LIDE_MOVF_SOLI_ID, v_MOVF_BOD_ORIGEN, v_MOVF_BOD_DESTINO, v_MOVF_ESTID
                                ,v_LIDE_MOVF_ORCO_NUMDOC,  v_LIDE_MOVF_FACTURA_NUMDOC, v_LIDE_MOVF_RECETA 
                                ,v_LIDE_MFDE_IDTIPOMOTIVO
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
                            into   v_LIDE_CLIID, v_LIDE_MOVF_SOLI_ID, v_MOVF_BOD_ORIGEN, v_MOVF_BOD_DESTINO, v_MOVF_ESTID
                                ,v_LIDE_MOVF_ORCO_NUMDOC,  v_LIDE_MOVF_FACTURA_NUMDOC, v_LIDE_MOVF_RECETA 
                                ,v_LIDE_MFDE_IDTIPOMOTIVO
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
                        into   v_LIDE_CLIID, v_LIDE_MOVF_SOLI_ID, v_MOVF_BOD_ORIGEN, v_MOVF_BOD_DESTINO, v_MOVF_ESTID
                              ,v_LIDE_MOVF_ORCO_NUMDOC,  v_LIDE_MOVF_FACTURA_NUMDOC, v_LIDE_MOVF_RECETA 
                              ,v_LIDE_MFDE_FECHA, v_LIDE_MFDE_CANTIDAD, v_TIPO_MOV
                              ,v_LIDE_MFDE_IDTIPOMOTIVO, v_MFDE_SOLI_ID, v_MFDE_MDEV_ID
                              ,v_MFDE_CANTIDAD_DEVUELTA
                        FROM clin_far_movim    mov
                             ,clin_far_movimdet mde    
                        WHERE mov.MOVF_ID = mde.MFDE_MOVF_ID 
                        and mde.MFDE_ID = curdet.MFDE_ID;
                    end;
                    if v_TIPO_MOV = 180 then -- (DESPACHO POR DEVOLUCION ARTICULO)    
                        v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                        v_MOVF_BOD_ORIGEN:= null;
                        v_MOVF_BOD_DESTINO:= null;
                    end if;    
                    if v_TIPO_MOV = 115 or v_TIPO_MOV = 15 then -- (AJUSTE STOCK)
                        if v_TIPO_MOV = 115  then 
                            v_LIDE_MFDE_CANTIDAD:= v_MFDE_CANTIDAD_DEVUELTA;
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
                        v_LIDE_MFDE_IDTIPOMOTIVO:= v_AJUS_MOTIVO;
                    end if; 
                end if;
                --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTALIBCONTROLADOS - paso 5' , sysdate ); commit;
                --mov solic bodegas
                if v_TIPO_MOV = 100 then
                    v_LIDE_OPERACION:= 'R';  
                    v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                       --salida
                       v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO - v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;

                if v_TIPO_MOV = 170 then
                    v_LIDE_OPERACION:= 'R';  
                    v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --salida
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO - v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                if v_TIPO_MOV = 50 then
                    v_LIDE_OPERACION:= 'S';
                    v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO ;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --entrada
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO + v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;

                --mov solic pacientes
                --140  HOS
                --150  AMB
                --160  URG
                if v_TIPO_MOV = 140 or v_TIPO_MOV = 150 or v_TIPO_MOV = 160 then
                    v_LIDE_OPERACION:= 'R';  
                    v_LIDE_MOVF_BOD_EXTERNA:= NULL;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO ;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --salida
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO - v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;

                if v_TIPO_MOV = 30 then
                    v_LIDE_OPERACION:= 'S';
                    v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --entrada
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO + v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;

                if v_TIPO_MOV = 60 then
                    v_LIDE_OPERACION:= 'S';
                    v_LIDE_MOVF_BOD_EXTERNA:= NULL;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO ;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --entrada
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO + v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;

                --mov de farmacia
                if v_TIPO_MOV = 70 then
                    v_LIDE_OPERACION:= 'S';
                    v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO ;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --entrada
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO + v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                if v_TIPO_MOV = 180 then
                   v_LIDE_OPERACION:= 'R';  
                   v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                   v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                   if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                      --salida
                      v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO - v_LIDE_MFDE_CANTIDAD;
                   end if;
                end if;
                if v_TIPO_MOV = 90 then
                    v_LIDE_OPERACION:= 'S';
                    v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO ;
                    v_LIDE_MOVF_SOLI_ID:= v_MFDE_SOLI_ID;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --entrada
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO + v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;

                --mov ajuste stock
                if v_TIPO_MOV = 115 then
                    v_LIDE_OPERACION:= 'R';  
                    v_LIDE_MOVF_BOD_EXTERNA:= NULL;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --salida
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO - v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                if v_TIPO_MOV = 15 then
                    v_LIDE_OPERACION:= 'S';
                    v_LIDE_MOVF_BOD_EXTERNA:= NULL;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --entrada
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO + v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                
                --mov fraccionados
                if v_TIPO_MOV = 116 then
                     --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTACIERREKARDEX - v_TIPO_MOV: ' || v_TIPO_MOV , sysdate ); commit;
                    v_LIDE_OPERACION:= 'R';  
                    v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --salida
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO - v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                if v_TIPO_MOV = 16 then
                   --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTACIERREKARDEX - v_TIPO_MOV: ' || v_TIPO_MOV , sysdate ); commit;
                    v_LIDE_OPERACION:= 'S';
                    v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --entrada
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO + v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                
                --mov fraccionados
                if v_TIPO_MOV = 117 then
                     --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTACIERREKARDEX - v_TIPO_MOV: ' || v_TIPO_MOV , sysdate ); commit;
                    v_LIDE_OPERACION:= 'R';  
                    v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --salida
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO - v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                if v_TIPO_MOV = 17 then
                   --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTACIERREKARDEX - v_TIPO_MOV: ' || v_TIPO_MOV , sysdate ); commit;
                    v_LIDE_OPERACION:= 'S';
                    v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --entrada
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO + v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                
                
                --80	INGRESOS POR INTERFAZ FIN700
                if v_TIPO_MOV = 80 then
                    v_LIDE_OPERACION:= 'S';
                    v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --entrada
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO + v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                --108	DEVOLUCION  POR INTERFAZ FIN700
                if v_TIPO_MOV = 108 then
                    v_LIDE_OPERACION:= 'R';  
                    v_LIDE_MOVF_BOD_EXTERNA:= null;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                       --salida
                       v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO - v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                
                --105	SALIDA POR DESPACHO AUTOPEDIDO
                if v_TIPO_MOV = 105 then
                    v_LIDE_OPERACION:= 'R';  
                    v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                       --salida
                       v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO - v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                --5	INGRESOS POR DEVOLUCION AUTOPEDIDO
                if v_TIPO_MOV = 5 then
                    v_LIDE_OPERACION:= 'S';
                    v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO ;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --entrada
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO + v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                
                
                 -- MOVIMIENTOS INTERFAZ FIN700
                 -- 80	INGRESOS POR INTERFAZ FIN700
                if v_TIPO_MOV = 80 then
                    v_LIDE_OPERACION:= 'S';
                    v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --entrada
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO + v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                -- 108	DEVOLUCION  POR INTERFAZ FIN700
                if v_TIPO_MOV = 108 then
                    v_LIDE_OPERACION:= 'R';  
                    v_LIDE_MOVF_BOD_EXTERNA:= null;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                       --salida
                       v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO - v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                -- 32 MOVIMIENTO ENTRE BODEGAS
                if v_TIPO_MOV = 32 then
                    v_LIDE_OPERACION:= 'S';
                    v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --entrada
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO + v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                -- 11 AJUSTES DE ENTRADA
                if v_TIPO_MOV = 11 then
                    v_LIDE_OPERACION:= 'S';
                    v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --entrada
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO + v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                -- 83 AJUSTES DE SALIDA
                if v_TIPO_MOV = 83 THEN -- AJUSTES DE SALIDA
                    v_LIDE_OPERACION:= 'R';  
                    v_LIDE_MOVF_BOD_EXTERNA:= null;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                       --salida
                       v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO - v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                -- 12 RECEPCION DE COMPRA
                if v_TIPO_MOV = 12 then
                    v_LIDE_OPERACION:= 'S';
                    v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --entrada
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO + v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                -- 84 DEVOLUCION DE COMPRA
                if v_TIPO_MOV = 84 THEN 
                    v_LIDE_OPERACION:= 'R';  
                    v_LIDE_MOVF_BOD_EXTERNA:= null;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                       --salida
                       v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO - v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                -- 190 DESPACHOS DE PRESTAMOS
                if v_TIPO_MOV = 190 THEN 
                    v_LIDE_OPERACION:= 'R';  
                    v_LIDE_MOVF_BOD_EXTERNA:= null;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                       --salida
                       v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO - v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                -- 191 DEVOLUCIÓN DE PRESTAMOS
                if v_TIPO_MOV = 191 then
                    v_LIDE_OPERACION:= 'S';
                    v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --entrada
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO + v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                -- 33 ANULACIÓN DE DESPACHOS CON PEDIDO
                if v_TIPO_MOV = 33 then
                    v_LIDE_OPERACION:= 'S';
                    v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --entrada
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO + v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                -- 34 ANULACIÓN DE PEDIDOS
                if v_TIPO_MOV = 34 then
                    v_LIDE_OPERACION:= 'S';
                    v_LIDE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                    v_LIDE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                    if v_LIDE_MOVF_BOD_SUMINISTRO = In_CodBodegaControlados then
                        --entrada
                        v_LIDE_STOCK_SALDO:= v_LIDE_STOCK_SALDO + v_LIDE_MFDE_CANTIDAD;
                    end if;
                end if;
                
                
                
                --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTALIBCONTROLADOS - paso 6' , sysdate ); commit;
                if v_LIDE_CLIID > 0 then    
                    begin
                        select CODTIPIDENTIFICACION, CLINUMIDENTIFICACION, CLINOMBRES, CLIAPEPATERNO, CLIAPEMATERNO
                        into v_LIDE_CODTIPIDENTIFICACION, v_LIDE_CLINUMIDENTIFICACION, v_LIDE_CLINOMBRES, v_LIDE_CLIAPEPATERNO, v_LIDE_CLIAPEMATERNO
                        from cliente
                        where CLIID = v_LIDE_CLIID;
                    Exception 
                        When NO_DATA_FOUND Then
                            v_LIDE_CODTIPIDENTIFICACION := 0;
                            v_LIDE_CLINUMIDENTIFICACION:='';
                            v_LIDE_CLINOMBRES:='';
                            v_LIDE_CLIAPEPATERNO:=''; 
                            v_LIDE_CLIAPEMATERNO:='';
                        When Others Then
                            v_LIDE_CODTIPIDENTIFICACION := 0;
                            v_LIDE_CLINUMIDENTIFICACION:='';
                            v_LIDE_CLINOMBRES:='';
                            v_LIDE_CLIAPEPATERNO:=''; 
                            v_LIDE_CLIAPEMATERNO:='';
                    end;  
                    -- insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_CIERRE_MEDCONTROLADOS - v_MOVF_ESTID: '  || v_MOVF_ESTID , sysdate ); commit;
                    begin
                        select PCLIIDMEDSOLICITANTE, PCLIIDMEDTRATANTE
                        into v_LIDE_PCLIIDMEDSOLICITANTE, v_LIDE_PCLIIDMEDTRATANTE
                        from estadia
                        where ESTID = v_MOVF_ESTID;
                    Exception 
                        When NO_DATA_FOUND Then
                            v_LIDE_PCLIIDMEDSOLICITANTE := 0;
                            v_LIDE_PCLIIDMEDTRATANTE:=0;
                        When Others Then
                            v_LIDE_PCLIIDMEDSOLICITANTE := 0;
                            v_LIDE_PCLIIDMEDTRATANTE:=0;
                    end;
                    --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_CIERRE_MEDCONTROLADOS - v_LIDE_PCLIIDMEDSOLICITANTE: '  || v_LIDE_PCLIIDMEDSOLICITANTE , sysdate ); commit;
                    begin
                        select CODTIPIDENTIFICACION, CLINUMIDENTIFICACION, CLINOMBRES, CLIAPEPATERNO, CLIAPEMATERNO
                            ,CLIFONOMOVIL
                        into v_LIDE_CODTIPIDENTIFICACION_PR, v_LIDE_CLINUMIDENTIFICACION_PR, v_LIDE_CLINOMBRES_PROF, v_LIDE_CLIAPEPATERNO_PROF, v_LIDE_CLIAPEMATERNO_PROF
                            ,v_LIDE_CLIFONOMOVIL_PROF
                        from cliente
                        where CLIID = v_LIDE_PCLIIDMEDSOLICITANTE;
                    Exception 
                        When NO_DATA_FOUND Then
                            v_LIDE_CODTIPIDENTIFICACION_PR := 0; 
                            v_LIDE_CLINUMIDENTIFICACION_PR := '';
                            v_LIDE_CLINOMBRES_PROF := ''; 
                            v_LIDE_CLIAPEPATERNO_PROF := ''; 
                            v_LIDE_CLIAPEMATERNO_PROF  := '';
                        When Others Then
                            v_LIDE_CODTIPIDENTIFICACION_PR := 0; 
                            v_LIDE_CLINUMIDENTIFICACION_PR := '';
                            v_LIDE_CLINOMBRES_PROF := ''; 
                            v_LIDE_CLIAPEPATERNO_PROF := ''; 
                            v_LIDE_CLIAPEMATERNO_PROF  := '';
                    end;

                    begin
                        select CODTIPPROFESIONAL
                        into v_LIDE_CODTIPPROFESIONAL
                        from profesional
                        where CLIID = v_LIDE_PCLIIDMEDSOLICITANTE;
                    Exception 
                        When NO_DATA_FOUND Then
                            v_LIDE_CODTIPPROFESIONAL:= 0;
                        When Others Then
                            v_LIDE_CODTIPPROFESIONAL:= 0;
                    end;
                    begin
                        select CODESPECIALIDAD 
                        into v_LIDE_CODESPECIALIDAD
                        from especialidadprof
                        where HDGCODIGO = In_HdgCodigo
                        and PCLIID = v_LIDE_PCLIIDMEDSOLICITANTE
                        and FLGVIGENCIA = 1
                        and rownum = 1;
                    Exception 
                        When NO_DATA_FOUND Then
                            v_LIDE_CODESPECIALIDAD:= 0;
                        When Others Then
                            v_LIDE_CODESPECIALIDAD:= 0;
                    end;
                end if;

              -- insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTALIBCONTROLADOS - paso 7' , sysdate ); commit;
                v_ordenador:= v_ordenador + 1;              
                begin     
                    INSERT INTO  TMP_LIBRO_CONTROLADO_DET
                    (IDREPORT
                    ,LIDE_CKAR_ID
                    ,LIDE_MEIN_ID
                    ,LIDE_CLIID
                    ,LIDE_CODTIPIDENTIFICACION
                    ,LIDE_CLINUMIDENTIFICACION
                    ,LIDE_CLINOMBRES
                    ,LIDE_CLIAPEPATERNO
                    ,LIDE_CLIAPEMATERNO
                    ,LIDE_PCLIIDMEDSOLICITANTE
                    ,LIDE_PCLIIDMEDTRATANTE
                    ,LIDE_CODTIPIDENTIFICACION_PROF
                    ,LIDE_CLINUMIDENTIFICACION_PROF
                    ,LIDE_CLINOMBRES_PROF
                    ,LIDE_CLIAPEPATERNO_PROF
                    ,LIDE_CLIAPEMATERNO_PROF
                    ,LIDE_CODTIPPROFESIONAL
                    ,LIDE_CODESPECIALIDAD
                    ,LIDE_CLIFONOMOVIL_PROF
                    ,LIDE_MFDE_FECHA
                    ,LIDE_MFDE_CANTIDAD
                    ,LIDE_OPERACION
                    ,LIDE_STOCK_SALDO
                    ,LIDE_MOVF_RECETA
                    ,LIDE_MOVF_BOD_SUMINISTRO
                    ,LIDE_MOVF_SOLI_ID
                    ,LIDE_MOVF_ORCO_NUMDOC
                    ,LIDE_MOVF_FACTURA_NUMDOC
                    ,LIDE_MFDE_ID
                    ,LIDE_MDEV_ID
                    ,LIDE_MOVF_TIPO
                    ,LIDE_MFDE_IDTIPOMOTIVO
                    ,LIDE_STOCK_ACTUAL
                    ,LIDE_MOVF_BOD_EXTERNA
                    ,ORDENADOR) 
                    values 
                    (In_IdReport 
                    ,In_LibCId
                    ,cur.FBOI_MEIN_ID
                    ,v_LIDE_CLIID
                    ,v_LIDE_CODTIPIDENTIFICACION
                    ,v_LIDE_CLINUMIDENTIFICACION
                    ,v_LIDE_CLINOMBRES
                    ,v_LIDE_CLIAPEPATERNO
                    ,v_LIDE_CLIAPEMATERNO
                    ,v_LIDE_PCLIIDMEDSOLICITANTE
                    ,v_LIDE_PCLIIDMEDTRATANTE
                    ,v_LIDE_CODTIPIDENTIFICACION_PR
                    ,v_LIDE_CLINUMIDENTIFICACION_PR
                    ,v_LIDE_CLINOMBRES_PROF
                    ,v_LIDE_CLIAPEPATERNO_PROF
                    ,v_LIDE_CLIAPEMATERNO_PROF
                    ,v_LIDE_CODTIPPROFESIONAL
                    ,v_LIDE_CODESPECIALIDAD
                    ,v_LIDE_CLIFONOMOVIL_PROF
                    ,v_LIDE_MFDE_FECHA
                    ,v_LIDE_MFDE_CANTIDAD
                    ,v_LIDE_OPERACION
                    ,v_LIDE_STOCK_SALDO
                    ,v_LIDE_MOVF_RECETA
                    ,v_LIDE_MOVF_BOD_SUMINISTRO
                    ,v_LIDE_MOVF_SOLI_ID
                    ,v_LIDE_MOVF_ORCO_NUMDOC
                    ,v_LIDE_MOVF_FACTURA_NUMDOC
                    ,curdet.MFDE_ID
                    ,curdet.MDEV_ID
                    ,v_TIPO_MOV
                    ,v_LIDE_MFDE_IDTIPOMOTIVO
                    ,cur.FBOI_STOCK_ACTUAL
                    ,v_LIDE_MOVF_BOD_EXTERNA
                    ,v_ordenador);
               /* Exception 
                    When NO_DATA_FOUND Then
                        insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTALIBCONTROLADOS - caida paso 8' , sysdate ); commit;

                        null;
                    When Others Then
                        null;
                       insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_RPT_CONSULTALIBCONTROLADOS - caida paso 9' , sysdate ); commit;
            */
                end;

            end loop;
        end loop;        

END;

<<PKG_Exit>>

    NULL;

End PRO_TMP_CONSULTALIBCONTROLADOS;

End PKG_TMP_CONSULTALIBCONTROLADOS;
/