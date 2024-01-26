CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."SVCREGCARGOCUENTAFUSAT_PKG" As

Procedure SvcRegCargoCuentaFusat  /*  Registro Cargo Cuenta WS FuSaT  */
    ( SRV_Message                    In Out     Varchar2                        /*  Parámetro de uso interno  */
    , in_hdgcodigo                   In         Number
    , In_MOVF_ID                     In         Number
    , In_MFDE_ID                     In         Number   
    , In_MOVDEV_ID                   In         Number
    ) As
PRAGMA AUTONOMOUS_TRANSACTION;
    SRV_FetchStatus Number(1);


Begin
    SRV_FetchStatus := 0;
    SRV_Message := '1000000';


Declare
	v_hdgCodigo         number(8);
	v_esaCodigo         number(8);

      SRV_MESSAGE VARCHAR2(200);
      IN_CTANUMCUENTA NUMBER;
      IN_CMECODIGO NUMBER;
      IN_CODCCOSTOORIGEN VARCHAR2(200);
      IN_ESACODIGOCARGO NUMBER;
      IN_CMECODIGOCARGO NUMBER;
      IN_CODCCOSTOCARGO VARCHAR2(200);
      IN_FECHAAPLICACION VARCHAR2(200);
      IN_TIPOMOVIMIENTO VARCHAR2(200);
      IN_TIPOCARGO VARCHAR2(200);
      IN_CODCARGO VARCHAR2(200);
      IN_CGOGLOSACARGO VARCHAR2(200);
      IN_CGOCANTIDAD NUMBER;
      IN_TIPOCOBRO VARCHAR2(200);
      IN_FOLPABELLON NUMBER;
      IN_NROEQUIPO VARCHAR2(200);
      IN_FECHAFINREALIZACION VARCHAR2(200);
      IN_CODTIPIDENTIFICACIONPROF NUMBER;
      IN_CLINUMIDENTIFICACIONPROF VARCHAR2(200);
      IN_CODLABORPABELLON NUMBER;
      IN_CODINCISION NUMBER;
      IN_CODTECNICA NUMBER;
      IN_CODVIA NUMBER;
      IN_CGOMTOUNITARIO NUMBER;
      IN_CGOMTOEXENTO NUMBER;
      IN_CGOMTOAFECTO NUMBER;
      IN_CGOMTOIVA NUMBER;
      IN_USUINSERCION VARCHAR2(200);
      IN_FECINSERCION VARCHAR2(200);
      OUT_FLGRESPUESTA NUMBER;
      OUT_RESPUESTAWS VARCHAR2(200);


Begin
  /*SRV_MESSAGE := '100000';
  IN_CTANUMCUENTA := 11321;
  IN_CMECODIGO := 1;
  IN_CODCCOSTOORIGEN := '1105';
  IN_ESACODIGOCARGO := 2;
  IN_CMECODIGOCARGO := 1;
  IN_CODCCOSTOCARGO := '1105';
  IN_FECHAAPLICACION := '20201012100000';
  IN_TIPOMOVIMIENTO := 'I';
  IN_TIPOCARGO := 'I';
  IN_CODCARGO := '998877661';
  IN_CGOGLOSACARGO := 'S Italica p/traccion Esqueletica 88tr7390-003-03';
  IN_CGOCANTIDAD := 4;
  IN_TIPOCOBRO := 'S';
  IN_FOLPABELLON := 0;
  IN_NROEQUIPO := 0;
  IN_FECHAFINREALIZACION := ' ';
  IN_CODTIPIDENTIFICACIONPROF := 0;
  IN_CLINUMIDENTIFICACIONPROF := ' ';
  IN_CODLABORPABELLON := 0;
  IN_CODINCISION := 0;
  IN_CODTECNICA := 0;
  IN_CODVIA := 0;
  IN_CGOMTOUNITARIO := 0;
  IN_CGOMTOEXENTO :=0;
  IN_CGOMTOAFECTO := 0;
  IN_CGOMTOIVA := 0;
  IN_USUINSERCION := 'FARMACIA';
  IN_FECINSERCION :=  '20201012100000';
*/

insert into tab_error values ('ENTRE',In_MFDE_ID);
commit;

if (In_MOVDEV_ID= 0 )  then
                        if (In_MFDE_ID = 0) then  -- Es para el movimiento completo con varios detalles
                                            for S in (  select 
                                                  HDGCODIGO
                                                , ESACODIGO
                                                , CMECODIGO
                                                , nvl(MOVF_BOD_ORIGEN,0) MOVF_BOD_ORIGEN
                                                , nvl(MOVF_BOD_DESTINO,0) MOVF_BOD_DESTINO
                                                ,MFDE_ID
                                                ,MFDE_MOVF_ID
                                                ,MFDE_FECHA
                                                ,MFDE_TIPO_MOV
                                                ,MFDE_MEIN_CODMEI
                                                ,MFDE_MEIN_ID
                                                ,MFDE_CANTIDAD
                                                ,MFDE_VALOR_COSTO_UNITARIO
                                                ,MFDE_VALOR_VENTA_UNITARIO
                                                ,MFDE_UNIDAD_COMPRA
                                                ,MFDE_CONTENIDO_UC
                                                ,MFDE_UNIDAD_DESPACHO
                                                ,MFDE_CANTIDAD_DEVUELTA
                                                ,MFDE_CTAS_ID
                                                ,MFDE_AGRUPADOR_ID
                                                ,MFDE_REFERENCIA_CONTABLE
                                                ,INT_CARGO_ESTADO
                                                ,INT_CARGO_FECHA
                                                ,INT_CARGO_ERROR
                                                ,INT_ERP_ESTADO
                                                ,INT_ERP_FECHA
                                                ,INT_ERP_ERROR
                                                ,movf_estid
                                                ,movf_cliid
                                                ,movf_cta_id
                                                ,MOVF_USUARIO
                                                from clin_far_movimdet, clin_far_movim
                                                where clin_far_movimdet.MFDE_MOVF_ID = clin_far_movim.MOVF_ID
                                               -- and INT_CARGO_ESTADO = 'PENDIENTE'
                                                and clin_far_movim.hdgcodigo = in_hdgcodigo
                                                and clin_far_movim.MOVF_ID = In_MOVF_ID
                                                )
                                                loop
                                          
                                                            begin
                                                               select ctanumcuenta into  IN_CTANUMCUENTA from desa1.cuenta where ctaid = s.movf_cta_id;
                                                                exception when others then
                                                                IN_CTANUMCUENTA := 0;
                                                             end;
                                            
                                                            begin
                                                               select  MEIN_DESCRI into  IN_CGOGLOSACARGO 
                                                               from clin_far_mamein 
                                                               where hdgcodigo = s.hdgcodigo
                                                               and  MEIN_CODMEI = s.MFDE_MEIN_CODMEI;
                                                                exception when others then
                                                                IN_CGOGLOSACARGO := ' ';
                                                             end; 
                                            
                                                              IN_CMECODIGO := s.cmecodigo;
                                                              IN_CODCCOSTOORIGEN := '7503';
                                                              IN_ESACODIGOCARGO := s.esacodigo;
                                                              IN_CMECODIGOCARGO := s.cmecodigo;
                                                              IN_CODCCOSTOCARGO := '7503';
                                                              IN_FECHAAPLICACION := to_char(sysdate,'yyyymmddhhmiss'); -- to_char(s.MFDE_FECHA,'yyyymmddhh24miss');  -- formato'20201012100000';
                                                              if (s.MFDE_TIPO_MOV =140 or s.MFDE_TIPO_MOV =150 or s.MFDE_TIPO_MOV = 160 ) then
                                                                           IN_TIPOMOVIMIENTO := 'I';
                                                              else
                                                                           IN_TIPOMOVIMIENTO := 'D';
                                                              end if;
                                            
                                                              IN_CODCARGO := s.MFDE_MEIN_CODMEI;
                                            
                                            
                                                              IN_CGOCANTIDAD := s.MFDE_CANTIDAD;
                                                              IN_TIPOCOBRO := 'S';
                                                              IN_FOLPABELLON := 0;
                                                              IN_NROEQUIPO := 0;
                                                              IN_FECHAFINREALIZACION := ' ';
                                                              IN_CODTIPIDENTIFICACIONPROF := 0;
                                                              IN_CLINUMIDENTIFICACIONPROF := ' ';
                                                              IN_CODLABORPABELLON := 0;
                                                              IN_CODINCISION := 0;
                                                              IN_CODTECNICA := 0;
                                                              IN_CODVIA := 0;
                                                              IN_CGOMTOUNITARIO := 0;
                                                              IN_CGOMTOEXENTO :=0;
                                                              IN_CGOMTOAFECTO := 0;
                                                              IN_CGOMTOIVA := 0;
                                                              IN_USUINSERCION := s.MOVF_USUARIO;
                                                              IN_FECINSERCION := to_char(sysdate,'yyyymmddhhmiss'); --to_char(s.MFDE_FECHA,'yyyymmddhh24miss');  -- formato'20201012100000'
                                                              IN_TIPOCARGO := 'I';
                                            
                                                              desa1.SVCREGCARGOCUENTAFUSATWSI_PKG.SVCREGCARGOCUENTAFUSATWSI(
                                                                 SRV_MESSAGE,
                                                                 IN_CTANUMCUENTA,
                                                                IN_CMECODIGO,
                                                                IN_CODCCOSTOORIGEN,
                                                                IN_ESACODIGOCARGO,
                                                                IN_CMECODIGOCARGO,
                                                                IN_CODCCOSTOCARGO,
                                                                IN_FECHAAPLICACION,
                                                                IN_TIPOMOVIMIENTO,
                                                                IN_TIPOCARGO,
                                                                IN_CODCARGO,
                                                                IN_CGOGLOSACARGO,
                                                                IN_CGOCANTIDAD,
                                                                IN_TIPOCOBRO,
                                                                IN_FOLPABELLON,
                                                                IN_NROEQUIPO,
                                                                IN_FECHAFINREALIZACION,
                                                                IN_CODTIPIDENTIFICACIONPROF,
                                                                IN_CLINUMIDENTIFICACIONPROF,
                                                                IN_CODLABORPABELLON,
                                                                IN_CODINCISION,
                                                                IN_CODTECNICA,
                                                                IN_CODVIA,
                                                                IN_CGOMTOUNITARIO,
                                                                IN_CGOMTOEXENTO,
                                                                IN_CGOMTOAFECTO,
                                                                IN_CGOMTOIVA,
                                                                IN_USUINSERCION,
                                                                IN_FECINSERCION,
                                                                OUT_FLGRESPUESTA,
                                                                OUT_RESPUESTAWS
                                                              );
                                         
                                                             if OUT_FLGRESPUESTA = 1 then
                                                                    -- Exito
                                                                    update clin_far_movimdet set
                                                                             INT_CARGO_ESTADO = 'TRASPASADO'
                                                                            ,INT_CARGO_FECHA  = SYSDATE
                                                                            ,INT_CARGO_ERROR  = OUT_RESPUESTAWS
                                                                    WHERE MFDE_ID = S.MFDE_ID;
                                            
                                                                    COMMIT;
                                                              else
                                                                          -- ERROR
                                                                            ROLLBACK;
                                                                    update clin_far_movimdet set
                                                                             INT_CARGO_ESTADO = 'OBSERVADO'
                                                                            ,INT_CARGO_FECHA  = SYSDATE
                                                                            ,INT_CARGO_ERROR  = OUT_RESPUESTAWS
                                                                    WHERE MFDE_ID = S.MFDE_ID;
                                                                    COMMIT;
                                                              end if;
                                            
                                                    end loop;
                                    else  --- Es para un detalle específico, lo seguro un re-intento 
                                      for S in (  select 
                                                  HDGCODIGO
                                                , ESACODIGO
                                                , CMECODIGO
                                                , nvl(MOVF_BOD_ORIGEN,0) MOVF_BOD_ORIGEN
                                                , nvl(MOVF_BOD_DESTINO,0) MOVF_BOD_DESTINO
                                                ,MFDE_ID
                                                ,MFDE_MOVF_ID
                                                ,MFDE_FECHA
                                                ,MFDE_TIPO_MOV
                                                ,MFDE_MEIN_CODMEI
                                                ,MFDE_MEIN_ID
                                                ,MFDE_CANTIDAD
                                                ,MFDE_VALOR_COSTO_UNITARIO
                                                ,MFDE_VALOR_VENTA_UNITARIO
                                                ,MFDE_UNIDAD_COMPRA
                                                ,MFDE_CONTENIDO_UC
                                                ,MFDE_UNIDAD_DESPACHO
                                                ,MFDE_CANTIDAD_DEVUELTA
                                                ,MFDE_CTAS_ID
                                                ,MFDE_AGRUPADOR_ID
                                                ,MFDE_REFERENCIA_CONTABLE
                                                ,INT_CARGO_ESTADO
                                                ,INT_CARGO_FECHA
                                                ,INT_CARGO_ERROR
                                                ,INT_ERP_ESTADO
                                                ,INT_ERP_FECHA
                                                ,INT_ERP_ERROR
                                                ,movf_estid
                                                ,movf_cliid
                                                ,movf_cta_id
                                                ,MOVF_USUARIO
                                                from clin_far_movimdet, clin_far_movim
                                                where clin_far_movimdet.MFDE_MOVF_ID = clin_far_movim.MOVF_ID
                                               -- and INT_CARGO_ESTADO = 'PENDIENTE'
                                                and clin_far_movim.hdgcodigo = in_hdgcodigo
                                                and clin_far_movimdet.MFDE_ID = In_MFDE_ID
                                                )
                                                loop
  insert into tab_error values ('ENTRE',In_MFDE_ID);
commit;                                        
                                                            begin
                                                               select ctanumcuenta into  IN_CTANUMCUENTA from desa1.cuenta where ctaid = s.movf_cta_id;
                                                                exception when others then
                                                                IN_CTANUMCUENTA := 0;
                                                             end;
                                            
                                                            begin
                                                               select  MEIN_DESCRI into  IN_CGOGLOSACARGO 
                                                               from clin_far_mamein 
                                                               where hdgcodigo = s.hdgcodigo
                                                               and  MEIN_CODMEI = s.MFDE_MEIN_CODMEI;
                                                                exception when others then
                                                                IN_CGOGLOSACARGO := ' ';
                                                             end; 
                                            
                                                              IN_CMECODIGO := s.cmecodigo;
                                                              IN_CODCCOSTOORIGEN := '7503';
                                                              IN_ESACODIGOCARGO := s.esacodigo;
                                                              IN_CMECODIGOCARGO := s.cmecodigo;
                                                              IN_CODCCOSTOCARGO := '7503';
                                                              IN_FECHAAPLICACION := to_char(sysdate,'yyyymmddhhmiss'); -- to_char(s.MFDE_FECHA,'yyyymmddhh24miss');  -- formato'20201012100000';
                                                              IN_TIPOMOVIMIENTO := 'I';
                                                              
                                                              IN_CODCARGO := s.MFDE_MEIN_CODMEI;
                                            
                                            
                                                              IN_CGOCANTIDAD := s.MFDE_CANTIDAD;
                                                              IN_TIPOCOBRO := 'S';
                                                              IN_FOLPABELLON := 0;
                                                              IN_NROEQUIPO := 0;
                                                              IN_FECHAFINREALIZACION := ' ';
                                                              IN_CODTIPIDENTIFICACIONPROF := 0;
                                                              IN_CLINUMIDENTIFICACIONPROF := ' ';
                                                              IN_CODLABORPABELLON := 0;
                                                              IN_CODINCISION := 0;
                                                              IN_CODTECNICA := 0;
                                                              IN_CODVIA := 0;
                                                              IN_CGOMTOUNITARIO := 0;
                                                              IN_CGOMTOEXENTO :=0;
                                                              IN_CGOMTOAFECTO := 0;
                                                              IN_CGOMTOIVA := 0;
                                                              IN_USUINSERCION := s.MOVF_USUARIO;
                                                              IN_FECINSERCION := to_char(sysdate,'yyyymmddhhmiss'); --to_char(s.MFDE_FECHA,'yyyymmddhh24miss');  -- formato'20201012100000'
                                                              IN_TIPOCARGO := 'I';
                                            
                                                              desa1.SVCREGCARGOCUENTAFUSATWSI_PKG.SVCREGCARGOCUENTAFUSATWSI(
                                                                 SRV_MESSAGE,
                                                                 IN_CTANUMCUENTA,
                                                                IN_CMECODIGO,
                                                                IN_CODCCOSTOORIGEN,
                                                                IN_ESACODIGOCARGO,
                                                                IN_CMECODIGOCARGO,
                                                                IN_CODCCOSTOCARGO,
                                                                IN_FECHAAPLICACION,
                                                                IN_TIPOMOVIMIENTO,
                                                                IN_TIPOCARGO,
                                                                IN_CODCARGO,
                                                                IN_CGOGLOSACARGO,
                                                                IN_CGOCANTIDAD,
                                                                IN_TIPOCOBRO,
                                                                IN_FOLPABELLON,
                                                                IN_NROEQUIPO,
                                                                IN_FECHAFINREALIZACION,
                                                                IN_CODTIPIDENTIFICACIONPROF,
                                                                IN_CLINUMIDENTIFICACIONPROF,
                                                                IN_CODLABORPABELLON,
                                                                IN_CODINCISION,
                                                                IN_CODTECNICA,
                                                                IN_CODVIA,
                                                                IN_CGOMTOUNITARIO,
                                                                IN_CGOMTOEXENTO,
                                                                IN_CGOMTOAFECTO,
                                                                IN_CGOMTOIVA,
                                                                IN_USUINSERCION,
                                                                IN_FECINSERCION,
                                                                OUT_FLGRESPUESTA,
                                                                OUT_RESPUESTAWS
                                                              );
                                         
                                                             if OUT_FLGRESPUESTA = 1 then
                                                                    -- Exito
                                                                    update clin_far_movimdet set
                                                                             INT_CARGO_ESTADO = 'TRASPASADO'
                                                                            ,INT_CARGO_FECHA  = SYSDATE
                                                                            ,INT_CARGO_ERROR  = OUT_RESPUESTAWS
                                                                    WHERE MFDE_ID = S.MFDE_ID;
                                            
                                                                    COMMIT;
                                                              else
                                                                          -- ERROR
                                                                            ROLLBACK;
                                                                    update clin_far_movimdet set
                                                                             INT_CARGO_ESTADO = 'OBSERVADO'
                                                                            ,INT_CARGO_FECHA  = SYSDATE
                                                                            ,INT_CARGO_ERROR  = OUT_RESPUESTAWS || ' >> Reintento:'|| to_char(sysdate,'dd-mm-yyyy hh24:mi:ss')
                                                                    WHERE MFDE_ID = S.MFDE_ID;
                                                                    COMMIT;
                                                              end if;
                                            
                                                    end loop;
                                    end if;
ELSE -- Devoluciones
 begin 
  insert into tab_error values ('Devolucion',In_MOVDEV_ID);
  commit;
 end;
   

            for S in (  select 
                         MDEV_ID
                        ,MDEV_MFDE_ID
                        ,MDEV_MOVF_TIPO
                        ,MDEV_FECHA
                        ,MDEV_CANTIDAD
                        ,MDEV_RESPONSABLE
                        ,MDEV_CTAS_ID
                        ,MDEV_SOLI_ID
                        ,MDEV_MFDEORIGEN_ID
                        ,MDEV_AGRUPADOR_ID
                        ,MDEV_REFERENCIA_CONTABLE
                        ,ctanumcuenta
                        ,hdgcodigo
                        ,esacodigo
                        ,cmecodigo
                        ,mfde_mein_codmei
                        from clin_far_movim_devol, clin_far_movimdet, DESA1.cuenta
                    where clin_far_movimdet.MFDE_ID = clin_far_movim_devol.MDEV_MFDE_ID
                   -- and INT_CARGO_ESTADO = 'PENDIENTE'
                    and clin_far_movim_devol.MDEV_ID = In_MOVDEV_ID
                    and cuenta.ctaid = clin_far_movim_devol.MDEV_CTAS_ID
                    and cuenta.hdgcodigo = in_hdgcodigo
                    )
                    loop
                        IN_CTANUMCUENTA:= S.ctanumcuenta;
 begin 
  insert into tab_error values ('Devolucion 1',In_MOVDEV_ID);
   insert into tab_error values ('cuenta 1',IN_CTANUMCUENTA);
  commit;
 end;
     
                            begin
                               select  MEIN_DESCRI into  IN_CGOGLOSACARGO 
                               from clin_far_mamein 
                               where hdgcodigo = s.hdgcodigo
                               and  MEIN_CODMEI = s.MFDE_MEIN_CODMEI;
                                exception when others then
                                IN_CGOGLOSACARGO := ' ';
                             end; 
            
                              IN_CMECODIGO := s.cmecodigo;
                              IN_CODCCOSTOORIGEN := '7503';
                              IN_ESACODIGOCARGO := s.esacodigo;
                              IN_CMECODIGOCARGO := s.cmecodigo;
                              IN_CODCCOSTOCARGO := '7503';
                              IN_FECHAAPLICACION := to_char(sysdate,'yyyymmddhhmiss'); -- to_char(s.MFDE_FECHA,'yyyymmddhh24miss');  -- formato'20201012100000';
                              IN_TIPOMOVIMIENTO := 'D';  -- solo devoluciones
                              
            
                              IN_CODCARGO := s.mfde_mein_codmei;
            
            
                              IN_CGOCANTIDAD := s.MDEV_CANTIDAD;
                              IN_TIPOCOBRO := 'S';
                              IN_FOLPABELLON := 0;
                              IN_NROEQUIPO := 0;
                              IN_FECHAFINREALIZACION := ' ';
                              IN_CODTIPIDENTIFICACIONPROF := 0;
                              IN_CLINUMIDENTIFICACIONPROF := ' ';
                              IN_CODLABORPABELLON := 0;
                              IN_CODINCISION := 0;
                              IN_CODTECNICA := 0;
                              IN_CODVIA := 0;
                              IN_CGOMTOUNITARIO := 0;
                              IN_CGOMTOEXENTO :=0;
                              IN_CGOMTOAFECTO := 0;
                              IN_CGOMTOIVA := 0;
                              IN_USUINSERCION := s.MDEV_RESPONSABLE;
                              IN_FECINSERCION := to_char(sysdate,'yyyymmddhhmiss'); --to_char(s.MFDE_FECHA,'yyyymmddhh24miss');  -- formato'20201012100000'
                              IN_TIPOCARGO := 'I';
            
                              desa1.SVCREGCARGOCUENTAFUSATWSI_PKG.SVCREGCARGOCUENTAFUSATWSI(
                                 SRV_MESSAGE,
                                IN_CTANUMCUENTA,
                                IN_CMECODIGO,
                                IN_CODCCOSTOORIGEN,
                                IN_ESACODIGOCARGO,
                                IN_CMECODIGOCARGO,
                                IN_CODCCOSTOCARGO,
                                IN_FECHAAPLICACION,
                                IN_TIPOMOVIMIENTO,
                                IN_TIPOCARGO,
                                IN_CODCARGO,
                                IN_CGOGLOSACARGO,
                                IN_CGOCANTIDAD,
                                IN_TIPOCOBRO,
                                IN_FOLPABELLON,
                                IN_NROEQUIPO,
                                IN_FECHAFINREALIZACION,
                                IN_CODTIPIDENTIFICACIONPROF,
                                IN_CLINUMIDENTIFICACIONPROF,
                                IN_CODLABORPABELLON,
                                IN_CODINCISION,
                                IN_CODTECNICA,
                                IN_CODVIA,
                                IN_CGOMTOUNITARIO,
                                IN_CGOMTOEXENTO,
                                IN_CGOMTOAFECTO,
                                IN_CGOMTOIVA,
                                IN_USUINSERCION,
                                IN_FECINSERCION,
                                OUT_FLGRESPUESTA,
                                OUT_RESPUESTAWS
                              );
 begin 
  insert into tab_error values ('Devolucion respuesta ',OUT_FLGRESPUESTA);
  commit;
 end;
 
 begin 
  insert into tab_error values ('Devolucion OUT_RESPUESTAWS ',OUT_RESPUESTAWS);
  commit;
 end;           
                             if OUT_FLGRESPUESTA = 1 then
                                    -- Exito
                                    update clin_far_movim_devol set
                                             INT_CARGO_ESTADO = 'TRASPASADO'
                                            ,INT_CARGO_FECHA  = SYSDATE
                                            ,INT_CARGO_ERROR  = OUT_RESPUESTAWS
                                    WHERE MDEV_ID = In_MOVDEV_ID;
            
                                    COMMIT;
                              else
                                          -- ERROR
                                            ROLLBACK;
                                    update clin_far_movim_devol set
                                             INT_CARGO_ESTADO = 'OBSERVADO'
                                            ,INT_CARGO_FECHA  = SYSDATE
                                            ,INT_CARGO_ERROR  = OUT_RESPUESTAWS
                                    WHERE MDEV_ID = In_MOVDEV_ID;
                                    COMMIT;
                              end if;
            
                    end loop;
end if;








End;

/*-----------------------------------------------------------------*/
/*------------------------- End User Code -------------------------*/
/*-----------------------------------------------------------------*/

<<svc10962_Exit>>

NULL;

End SvcRegCargoCuentaFusat;
End SvcRegCargoCuentaFusat_Pkg;
/