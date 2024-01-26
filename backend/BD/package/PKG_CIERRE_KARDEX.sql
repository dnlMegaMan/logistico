CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."PKG_CIERRE_KARDEX" As

Procedure PRO_CIERRE_KARDEX  
    ( PiHDGCodigo IN NUMBER
     ,PiESACodigo IN NUMBER
     ,PiCMECodigo IN NUMBER
     ,PiCodBodega IN NUMBER
     ,PiUsuario   IN VARCHAR2) As

Begin

DECLARE
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

    begin
      select count(*) 
      into v_CantCierre
      from CLIN_FAR_CIERRE_KARDEX_PERIODO
      where HDGCODIGO = PiHDGCodigo
      and CMECODIGO   = PiCMECodigo
      and FBOD_CODIGO = PiCodBodega;
    Exception 
        When NO_DATA_FOUND Then
            v_CantCierre:= 0;
        When Others Then
            Goto PKG_Exit;        
    end;

    v_CKAR_PERIODO := to_number(to_char(sysdate, 'yyyymm'));

     --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_CIERRE_KARDEX - paso 0   v_CKAR_PERIODO: ' || v_CKAR_PERIODO , sysdate ); commit;

    if v_CantCierre > 0 then
      --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_CIERRE_KARDEX - paso 1' , sysdate ); commit;

        begin
            select max(CKAR_ID)
            into v_CKAR_ID_CierreAnterior
            from CLIN_FAR_CIERRE_KARDEX_PERIODO
            where HDGCODIGO = PiHDGCodigo
            and CMECODIGO   = PiCMECodigo
            and FBOD_CODIGO = PiCodBodega;
        Exception When Others Then
            Goto PKG_Exit;        
        end;

        --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_CIERRE_KARDEX - paso 2' , sysdate ); commit;

        begin
            select  CKAR_FECHA_CIERRE + 1/86400 
            into v_CKAR_FECHA_APERTURA
            from CLIN_FAR_CIERRE_KARDEX_PERIODO
            where CKAR_ID = v_CKAR_ID_CierreAnterior;
        Exception When Others Then
            Goto PKG_Exit;        
        end;

        --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_CIERRE_KARDEX - paso 3' , sysdate ); commit;

        v_CKAR_FECHA_CIERRE:= SYSDATE;
        begin
            INSERT INTO CLIN_FAR_CIERRE_KARDEX_PERIODO
                (HDGCODIGO
                ,CMECODIGO
                ,FBOD_CODIGO
                ,CKAR_PERIODO
                ,CKAR_FECHA_APERTURA
                ,CKAR_FECHA_CIERRE
                ,CKAR_USUARIO) 
            values 
                ( PiHDGCodigo
                ,PiCMECodigo
                ,PiCodBodega
                ,v_CKAR_PERIODO
                ,v_CKAR_FECHA_APERTURA
                ,v_CKAR_FECHA_CIERRE
                ,PiUsuario);
        end;
        --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_CIERRE_KARDEX - paso 4' , sysdate ); commit;

        begin
            select max(CKAR_ID)
            into v_MaxCKAR_ID
            from CLIN_FAR_CIERRE_KARDEX_PERIODO
            where HDGCODIGO = PiHDGCodigo
            and CMECODIGO   = PiCMECodigo
            and FBOD_CODIGO = PiCodBodega;
        Exception When Others Then
            Goto PKG_Exit;        
        end;

        -- insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_CIERRE_KARDEX - paso 5' , sysdate ); commit;
        v_FBOI_MEIN_ID_aux :=  '00';
        for cur in (SELECT FBOI_MEIN_ID, FBOI_STOCK_ACTUAL
                    FROM CLIN_FAR_BODEGAS_INV         
                    WHERE FBOI_FBOD_CODIGO = PiCodBodega
                    )
        loop
        
            --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_CIERRE_KARDEX - paso 6, cur.FBOI_MEIN_ID: ' || cur.FBOI_MEIN_ID , sysdate ); commit;
            
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

          --  if v_KADE_STOCK_ANTERIOR = 0 then
          --      v_KADE_STOCK_SALDO:= cur.FBOI_STOCK_ACTUAL;
          --  else
           v_KADE_STOCK_SALDO:= v_KADE_STOCK_ANTERIOR ;
           -- end if;
            
            for curdet in (
                        select MFDE_ID, MDEV_ID, MFDE_FECHA
                        from  
                        (  
                           select mde.MFDE_ID , 0 MDEV_ID
                           , mde.MFDE_MEIN_ID , mde.MFDE_FECHA  MFDE_FECHA
                           from clin_far_movimdet mde
                           where (mde.MFDE_FECHA) between (v_CKAR_FECHA_APERTURA)  and   (v_CKAR_FECHA_CIERRE) 
                           union all
                           select dev.MDEV_MFDE_ID MFDE_ID, dev.MDEV_ID
                           , (select MFDE_MEIN_ID from clin_far_movimdet where MFDE_ID = dev.MDEV_MFDE_ID)  MFDE_MEIN_ID
                           , dev.MDEV_FECHA MFDE_FECHA
                           from clin_far_movim_devol dev
                           where (dev.MDEV_FECHA) between (v_CKAR_FECHA_APERTURA)  and   (v_CKAR_FECHA_CIERRE) 
                        )
                        where MFDE_MEIN_ID = cur.FBOI_MEIN_ID
                        order by MFDE_FECHA
                   )
            loop
                if  v_FBOI_MEIN_ID_aux <> cur.FBOI_MEIN_ID then
                    v_FBOI_MEIN_ID_aux :=  cur.FBOI_MEIN_ID;
                
                    --SALDO INICIAL
                    begin
                        INSERT INTO CLIN_FAR_CIERRE_KARDEX_DET  
                       ( KADE_CKAR_ID
                        ,KADE_MEIN_ID
                        ,KADE_MFDE_FECHA
                        ,KADE_MOVF_BOD_SUMINISTRO
                        ,KADE_MOVF_TIPO
                        ,KADE_STOCK_SALDO
                        ,KADE_STOCK_ACTUAL
                        ) 
                       values 
                       ( v_MaxCKAR_ID
                        ,cur.FBOI_MEIN_ID
                        ,v_CKAR_FECHA_APERTURA
                        ,PiCodBodega
                        ,1
                        ,v_KADE_STOCK_SALDO
                        ,cur.FBOI_STOCK_ACTUAL
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
                        select   MDEV_FECHA, MDEV_CANTIDAD, MDEV_MOVF_TIPO
                                ,MDEV_MFDEORIGEN_ID
                        into    v_KADE_MFDE_FECHA, v_KADE_MFDE_CANTIDAD,  v_TIPO_MOV
                               ,v_MDEV_MFDEORIGEN_ID
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


                --mov solic bodegas
                if v_TIPO_MOV = 100 then
                      v_KADE_OPERACION:= 'R';  
                      v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                      v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO;
                      if v_KADE_MOVF_BOD_SUMINISTRO = PiCodBodega then
                          --salida
                          v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO - v_KADE_MFDE_CANTIDAD;
                      end if;
                end if;

                  if v_TIPO_MOV = 170 then
                    v_KADE_OPERACION:= 'R';  
                     v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                     v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                     if v_KADE_MOVF_BOD_SUMINISTRO = PiCodBodega then
                          --salida
                          v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO - v_KADE_MFDE_CANTIDAD;
                      end if;
                end if;
                if v_TIPO_MOV = 50 then
                     v_KADE_OPERACION:= 'S';
                     v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                     v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO ;
                     if v_KADE_MOVF_BOD_SUMINISTRO = PiCodBodega then
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
                    if v_KADE_MOVF_BOD_SUMINISTRO = PiCodBodega then
                        --salida
                        v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO - v_KADE_MFDE_CANTIDAD;
                     end if;
                end if;

                if v_TIPO_MOV = 30 then
                    v_KADE_OPERACION:= 'S';
                     v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                     v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                     if v_KADE_MOVF_BOD_SUMINISTRO = PiCodBodega then
                          --entrada
                          v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO + v_KADE_MFDE_CANTIDAD;
                     end if;
                end if;


                if v_TIPO_MOV = 60 then
                    v_KADE_OPERACION:= 'S';
                    v_KADE_MOVF_BOD_EXTERNA:= NULL;
                     v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO ;
                     if v_KADE_MOVF_BOD_SUMINISTRO = PiCodBodega then
                          --entrada
                          v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO + v_KADE_MFDE_CANTIDAD;
                     end if;
                end if;

                --mov de farmacia
                if v_TIPO_MOV = 70 then
                    v_KADE_OPERACION:= 'S';
                    v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO ;
                    if v_KADE_MOVF_BOD_SUMINISTRO = PiCodBodega then
                        --entrada
                        v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO + v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;

                if v_TIPO_MOV = 180 then
                    v_KADE_OPERACION:= 'R';  
                     v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                     v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                     if v_KADE_MOVF_BOD_SUMINISTRO = PiCodBodega then
                          --salida
                          v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO - v_KADE_MFDE_CANTIDAD;
                     end if;
                end if;
                if v_TIPO_MOV = 90 then
                    v_KADE_OPERACION:= 'S';
                    v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                     v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO ;
                     v_KADE_MOVF_SOLI_ID:= v_MFDE_SOLI_ID;
                     if v_KADE_MOVF_BOD_SUMINISTRO = PiCodBodega then
                          --entrada
                          v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO + v_KADE_MFDE_CANTIDAD;
                     end if;
                end if;

                --mov ajuste stock
                if v_TIPO_MOV = 115 then
                      v_KADE_OPERACION:= 'R';  
                      v_KADE_MOVF_BOD_EXTERNA:= NULL;
                      v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN;
                      if v_KADE_MOVF_BOD_SUMINISTRO = PiCodBodega then
                          --salida
                          v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO - v_KADE_MFDE_CANTIDAD;
                      end if;
                end if;
                if v_TIPO_MOV = 15 then
                    v_KADE_OPERACION:= 'S';
                     v_KADE_MOVF_BOD_EXTERNA:= NULL;
                     v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                     if v_KADE_MOVF_BOD_SUMINISTRO = PiCodBodega then
                          --entrada
                          v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO + v_KADE_MFDE_CANTIDAD;
                     end if;
                end if;
                                
                --mov fraccionados
                if v_TIPO_MOV = 116 then
                    v_KADE_OPERACION:= 'R';  
                    v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN;
                    if v_KADE_MOVF_BOD_SUMINISTRO = PiCodBodega then
                        --salida
                        v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO - v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
                if v_TIPO_MOV = 16 then
                    v_KADE_OPERACION:= 'S';
                    v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                    if v_KADE_MOVF_BOD_SUMINISTRO = PiCodBodega then
                        --entrada
                        v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO + v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
                
                --80	INGRESOS POR INTERFAZ FIN700
                if v_TIPO_MOV = 80 then
                    v_KADE_OPERACION:= 'S';
                    v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN ;
                    if v_KADE_MOVF_BOD_SUMINISTRO = PiCodBodega then
                        --entrada
                        v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO + v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
                --108	DEVOLUCION  POR INTERFAZ FIN700
                if v_TIPO_MOV = 108 then
                    v_KADE_OPERACION:= 'R';  
                    v_KADE_MOVF_BOD_EXTERNA:= null;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO;
                    if v_KADE_MOVF_BOD_SUMINISTRO = PiCodBodega then
                       --salida
                       v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO - v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
                
                --105	SALIDA POR DESPACHO AUTOPEDIDO
                if v_TIPO_MOV = 105 then
                    v_KADE_OPERACION:= 'R';  
                    v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_ORIGEN;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_ORIGEN;
                    if v_KADE_MOVF_BOD_SUMINISTRO = PiCodBodega then
                       --salida
                       v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO - v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
                --5	INGRESOS POR DEVOLUCION AUTOPEDIDO
                if v_TIPO_MOV = 5 then
                    v_KADE_OPERACION:= 'S';
                    v_KADE_MOVF_BOD_EXTERNA:= v_MOVF_BOD_DESTINO;
                    v_KADE_MOVF_BOD_SUMINISTRO:= v_MOVF_BOD_DESTINO ;
                    if v_KADE_MOVF_BOD_SUMINISTRO = PiCodBodega then
                        --entrada
                        v_KADE_STOCK_SALDO:= v_KADE_STOCK_SALDO + v_KADE_MFDE_CANTIDAD;
                    end if;
                end if;
                

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
                            --Goto PKG_Exit;            
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
                            --Goto PKG_Exit;             
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
                            --Goto PKG_Exit;             
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
                            --Goto PKG_Exit;            
                    end;
                    begin
                        select CODESPECIALIDAD 
                        into v_KADE_CODESPECIALIDAD
                        from desa1.especialidadprof
                        where HDGCODIGO = PiHDGCodigo
                        and PCLIID = v_KADE_PCLIIDMEDSOLICITANTE
                        and FLGVIGENCIA = 1
                        and rownum = 1;
                    Exception 
                        When NO_DATA_FOUND Then
                            v_KADE_CODESPECIALIDAD:= 0;
                        When Others Then
                            v_KADE_CODESPECIALIDAD:= 0;
                            -- Goto PKG_Exit;            
                    end;

                end if;

                --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_CIERRE_KARDEX - paso 9, cur.FBOI_MEIN_ID: ' || cur.FBOI_MEIN_ID , sysdate ); commit;
               
                begin     
                        INSERT INTO CLIN_FAR_CIERRE_KARDEX_DET  
                       ( KADE_CKAR_ID
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
                        ,KADE_MOVF_BOD_EXTERNA) 
                       values 
                       ( v_MaxCKAR_ID
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
                        ,v_KADE_MOVF_BOD_EXTERNA);
                      Exception 
                        When NO_DATA_FOUND Then
                            insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_CIERRE_KARDEX - (5) Caida en Insert CLIN_FAR_CIERRE_KARDEX_DET' , sysdate ); commit;
                            null;
                        When Others Then
                            v_KADE_CODESPECIALIDAD:= 0;
                            insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_CIERRE_KARDEX - (6)Caida en Insert  CLIN_FAR_CIERRE_KARDEX_DET' , sysdate ); commit;    
                end;

 --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('PKG_CIERRE_MEDCONTROLADOS - paso 5' , sysdate ); commit;


            end loop;
        end loop;          
   else
        --Primer cierre 0

        --insert into PASO_ERRORES_EO (DESCRIPCION, FECHA ) values ('PKG_CIERRE_MEDCONTROLADOS - paso PRIMER CIERRE' , sysdate ); commit;

        begin
            INSERT INTO CLIN_FAR_CIERRE_KARDEX_PERIODO
                (HDGCODIGO
                ,CMECODIGO
                ,FBOD_CODIGO
                ,CKAR_PERIODO
                ,CKAR_FECHA_APERTURA
                ,CKAR_FECHA_CIERRE
                ,CKAR_USUARIO) 
            values 
                ( PiHDGCodigo
                ,PiCMECodigo
                ,PiCodBodega
                ,v_CKAR_PERIODO
                ,sysdate
                ,sysdate
                ,PiUsuario);
        end;

        --insert into PASO_ERRORES_EO (DESCRIPCION, FECHA ) values ('PKG_CIERRE_MEDCONTROLADOS - paso 1 PRIMER CIERRE' , sysdate ); commit;

        begin
            select max(CKAR_ID)
            into v_MaxCKAR_ID
            from CLIN_FAR_CIERRE_KARDEX_PERIODO
            where HDGCODIGO = PiHDGCodigo
            and CMECODIGO   = PiCMECodigo
            and FBOD_CODIGO = PiCodBodega;
        Exception When Others Then
            Goto PKG_Exit;        
        end;

--insert into PASO_ERRORES_EO (DESCRIPCION, FECHA ) values ('PKG_CIERRE_MEDCONTROLADOS - paso 2 PRIMER CIERRE  v_MaxCKAR_ID:' || v_MaxCKAR_ID , sysdate ); commit;

        for cur in (SELECT FBOI_MEIN_ID, FBOI_STOCK_ACTUAL
                    FROM CLIN_FAR_BODEGAS_INV         
                    WHERE FBOI_FBOD_CODIGO = PiCodBodega
                    )
        loop

            --insert into PASO_ERRORES_EO (DESCRIPCION, FECHA ) values ('PKG_CIERRE_MEDCONTROLADOS - paso 3 PRIMER CIERRE' , sysdate ); commit;

             begin
                        INSERT INTO CLIN_FAR_CIERRE_KARDEX_DET  
                       ( KADE_CKAR_ID
                        ,KADE_MEIN_ID
                        ,KADE_MFDE_FECHA
                        ,KADE_MOVF_BOD_SUMINISTRO
                        ,KADE_MOVF_TIPO
                        ,KADE_STOCK_ACTUAL
                        ,KADE_STOCK_SALDO
                        ) 
                       values 
                       ( v_MaxCKAR_ID
                        ,cur.FBOI_MEIN_ID
                        ,sysdate
                        ,PiCodBodega
                        ,1
                        ,cur.FBOI_STOCK_ACTUAL
                        ,cur.FBOI_STOCK_ACTUAL
                        );
                end;

        --insert into PASO_ERRORES_EO (DESCRIPCION, FECHA ) values ('PKG_CIERRE_MEDCONTROLADOS - paso 4 PRIMER CIERRE' , sysdate ); commit;


        end loop;

   end if;  


END;

<<PKG_Exit>>

NULL;

End PRO_CIERRE_KARDEX;

End PKG_CIERRE_KARDEX;
/