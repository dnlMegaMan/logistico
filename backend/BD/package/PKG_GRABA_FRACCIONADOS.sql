CREATE OR REPLACE PACKAGE "FARMACIACLINICA"."PKG_GRABA_FRACCIONADOS" as

PROCEDURE P_DISTRIBUCION_FRACCIONADO( PiCodBodega  IN NUMBER
                                     ,PiMeInIdOrig  IN NUMBER
                                     ,PiMeInIdDest IN NUMBER
                                     ,PiCantidOrig IN NUMBER
                                     ,PiCantidDest IN NUMBER
                                     ,PiUsuario    IN VARCHAR2
                                     ,PiHDGCodigo  IN NUMBER
                                     ,PiESACodigo  IN NUMBER
                                     ,PiCMECodigo  IN NUMBER 
                                     ,PiFactorConv IN NUMBER
                                     ,PiLote       IN VARCHAR2
                                     ,PiFechavto   IN VARCHAR2
                                     ,in_ID_Agrupador IN number);



PROCEDURE P_GRABAR_CONVER(PIN_MEIN_ORIGEN       IN VARCHAR2
                          ,PIN_MEIN_DESTINO   IN VARCHAR2
                          ,PIN_FACTOR_CONV    IN VARCHAR2
                          ,PIN_CANT           IN VARCHAR2
                          ,PIN_CANTIDAD       IN VARCHAR2
                          ,PIN_BOD_COD        IN NUMBER);


PROCEDURE P_GRABA_FRACCIONADOS(pinCOD 	  	   IN NUMBER,
		  					   pinCANTIDAD     IN NUMBER,
				               pinRESPONSABLE  IN VARCHAR2,
							   pinCOD_DET  	   IN NUMBER,
			               	   pinFACTOR 	   IN NUMBER,
							   pinCANTIDAD_DET IN NUMBER,
                               PinLote       IN VARCHAR2,
                               PinFechavto   IN VARCHAR2);
end PKG_GRABA_FRACCIONADOS;
/
CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."PKG_GRABA_FRACCIONADOS" as

PROCEDURE P_DISTRIBUCION_FRACCIONADO( PiCodBodega  IN NUMBER
                                     ,PiMeInIdOrig  IN NUMBER
                                     ,PiMeInIdDest IN NUMBER
                                     ,PiCantidOrig IN NUMBER
                                     ,PiCantidDest IN NUMBER
                                     ,PiUsuario    IN VARCHAR2
                                     ,PiHDGCodigo  IN NUMBER
                                     ,PiESACodigo  IN NUMBER
                                     ,PiCMECodigo  IN NUMBER
                                     ,PiFactorConv IN NUMBER
                                     ,PiLote       IN VARCHAR2
                                     ,PiFechavto   IN VARCHAR2
                                     ,in_ID_Agrupador IN NUMBER)
                                     
                                     
IS
    
   v_stock_act_orig    CLIN_FAR_BODEGAS_INV.FBOI_STOCK_ACTUAL%type;
   v_MOVF_ID_salida    clin_far_movim.MOVF_ID%type; 
   v_MEIN_CODMEI_Orig  clin_far_mamein.MEIN_CODMEI%type;
   v_MOVF_ID_ingreso   clin_far_movim.MOVF_ID%type; 
   v_MEIN_CODMEI_Dest  clin_far_mamein.MEIN_CODMEI%type;
   v_cantReg           number(3);
   v_FRMO_ID            CLIN_FAR_FRACCIONADOS_MOV.FRMO_ID%type;
   v_Id_entrada     number(12);
   v_Id_salida     number(12);
BEGIN

    --insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('P_DISTRIBUCION_FRACCIONADO - PiMeInIdOrig: '  || PiMeInIdOrig , sysdate ); commit;
    
    --obtengo el stock actual del producto origen
    Begin   
       Select FBOI_STOCK_ACTUAL 
       into v_stock_act_orig 
       from CLIN_FAR_BODEGAS_INV
	   Where FBOI_MEIN_ID = PiMeInIdOrig
       and   FBOI_FBOD_CODIGO = PiCodBodega;
    EXCEPTION WHEN NO_DATA_FOUND THEN
       v_stock_act_orig:= 0;
    End;
    
    if v_stock_act_orig > 0 then

        if PiCantidOrig > 0 and PiCantidDest > 0  then
        
            -- registro distrib compras
            BEGIN
                SELECT COUNT(*) INTO v_cantReg
                FROM  CLIN_FAR_DISTRIB_COMPRAS
                WHERE DCOM_MEIN_ID_ORIGEN  = PiMeInIdOrig
                AND   DCOM_MEIN_ID_DESTINO = PiMeInIdDest;
            EXCEPTION WHEN NO_DATA_FOUND THEN
               v_cantReg:=0;
            END;
            
            IF v_cantReg = 0 THEN
                  Begin 
                      INSERT INTO CLIN_FAR_DISTRIB_COMPRAS
                             (DCOM_MEIN_ID_ORIGEN,
                              DCOM_MEIN_ID_DESTINO,
                              DCOM_FACTOR_CONVERSION,
                              DCOM_VIGENTE)
                      VALUES (PiMeInIdOrig,
                              PiMeInIdDest,
                              PiFactorConv ,
                              'S');
                  End;            
            ELSE
                  Begin
                      UPDATE CLIN_FAR_DISTRIB_COMPRAS
                      SET	 DCOM_FACTOR_CONVERSION = PiFactorConv,
                             DCOM_VIGENTE='S'
                      WHERE  DCOM_MEIN_ID_ORIGEN = PiMeInIdOrig
                      AND    DCOM_MEIN_ID_DESTINO= PiMeInIdDest;
                  End;    
            END IF;
                
            --1.- registro la salida de prod origen
            begin
                UPDATE CLIN_FAR_BODEGAS_INV
                SET FBOI_STOCK_ACTUAL = NVL(FBOI_STOCK_ACTUAL,0) - PiCantidOrig
                WHERE FBOI_FBOD_CODIGO = PiCodBodega
                AND FBOI_MEIN_ID = PiMeInIdOrig;
            end;
            
            -- registro el movimiento cabecera
            begin           
                INSERT INTO clin_far_movim 
                (MOVF_TIPO, HDGCODIGO, ESACODIGO, CMECODIGO, MOVF_FECHA, MOVF_USUARIO ,MOVF_BOD_ORIGEN, MOVF_BOD_DESTINO, MOVF_CANTIDAD, MOVF_FECHA_GRABACION)
                values 
                ( 116, PiHDGCodigo, PiESACodigo, PiCMECodigo, sysdate, PiUsuario, PiCodBodega, PiCodBodega, PiCantidOrig, sysdate);
            end;

            -- recupero el id del movimiento
            begin            
                select nvl(max(MOVF_ID),0) 
                into v_MOVF_ID_salida  
                from clin_far_movim 
                where MOVF_TIPO = 116 
                AND HDGCODIGO = PiHDGCodigo
                AND ESACODIGO = PiESACodigo
                AND CMECODIGO = PiCMECodigo
                and MOVF_BOD_ORIGEN = PiCodBodega
                and MOVF_BOD_DESTINO = PiCodBodega ;
            end;

            -- obtengo el codigo del producto
            begin
                select MEIN_CODMEI 
                INTO v_MEIN_CODMEI_Orig 
                from clin_far_mamein 
                where mein_id = PiMeInIdOrig;
            end;
            
            -- registro el movimiento detalle
            begin
                insert into clin_far_movimdet 
                (mfde_id, mfde_movf_id, mfde_fecha, mfde_tipo_mov, mfde_mein_codmei, mfde_mein_id, mfde_cantidad,MFDE_LOTE,MFDE_LOTE_FECHAVTO,mfde_agrupador_id,int_erp_estado) 
                values 
                (CLIN_MOVD_SEQ.NEXTVAL , v_MOVF_ID_salida, sysdate  , 116, v_MEIN_CODMEI_Orig , PiMeInIdOrig, PiCantidOrig,PiLote,( To_Date(PiFechavto, 'YYYY/MM/DD') ) ,in_ID_Agrupador,'PENDIENTE');
            end;

            --2.- registro el ingreso de prod destino
            begin
                UPDATE CLIN_FAR_BODEGAS_INV
                SET FBOI_STOCK_ACTUAL = NVL(FBOI_STOCK_ACTUAL,0) + PiCantidDest
                WHERE FBOI_FBOD_CODIGO = PiCodBodega
                AND FBOI_MEIN_ID = PiMeInIdDest;
            end;    
            
            -- registro el movimiento cabecera
            begin           
                INSERT INTO clin_far_movim 
                (MOVF_TIPO, HDGCODIGO, ESACODIGO, CMECODIGO, MOVF_FECHA, MOVF_USUARIO ,MOVF_BOD_ORIGEN, MOVF_BOD_DESTINO, MOVF_CANTIDAD, MOVF_FECHA_GRABACION)
                values 
                ( 16, PiHDGCodigo, PiESACodigo, PiCMECodigo, sysdate, PiUsuario, PiCodBodega, PiCodBodega, PiCantidDest, sysdate);
            end;
            
            -- recupero el id del movimiento
            begin            
                select nvl(max(MOVF_ID),0) 
                into v_MOVF_ID_ingreso  
                from clin_far_movim 
                where MOVF_TIPO = 16 
                AND HDGCODIGO = PiHDGCodigo
                AND ESACODIGO = PiESACodigo
                AND CMECODIGO = PiCMECodigo
                and MOVF_BOD_ORIGEN = PiCodBodega
                and MOVF_BOD_DESTINO = PiCodBodega ;
  
            end;
            
            -- obtengo el codigo del producto
            begin
                select MEIN_CODMEI 
                INTO v_MEIN_CODMEI_Dest 
                from clin_far_mamein 
                where mein_id = PiMeInIdDest;
            end;
           
            -- registro el movimiento detalle
            begin
                 insert into clin_far_movimdet 
                (mfde_id, mfde_movf_id, mfde_fecha, mfde_tipo_mov, mfde_mein_codmei, mfde_mein_id, mfde_cantidad,MFDE_LOTE,MFDE_LOTE_FECHAVTO,mfde_agrupador_id,int_erp_estado) 
                values 
                (CLIN_MOVD_SEQ.NEXTVAL , v_MOVF_ID_ingreso, sysdate  , 16, v_MEIN_CODMEI_Dest , PiMeInIdDest, PiCantidDest, PiLote, ( To_Date(PiFechavto, 'YYYY/MM/DD') ), in_ID_Agrupador, 'PENDIENTE');
             end;
                                  
                            
            -- registra el movimiento de fraccionados
            Begin
                 SELECT CLIN_FRMO_SEQ.NEXTVAL INTO v_FRMO_ID  FROM DUAL;
            End;
                       
            BEGIN
                INSERT INTO CLIN_FAR_FRACCIONADOS_MOV
                (FRMO_ID,
                FRMO_MEIN_ID, 
                FRMO_CANTIDAD, 
                FRMO_FECHA, 
                FRMO_RESPONSABLE
                ,HDGCODIGO
                ,ESACODIGO
                ,CMECODIGO
                ,FBOD_CODIGO)
                VALUES 
                (v_FRMO_ID,
                PiMeInIdOrig, 
                PiCantidOrig, 
                SYSDATE, 
                PiUsuario
                ,PiHDGCodigo
                , PiESACodigo
                , PiCMECodigo
                , PiCodBodega);
            END;
                
            Begin
                INSERT INTO CLIN_FAR_FRACCIONADOS_MOV_DET
                (FRMD_ID,
                FRMD_FRMO_ID,
                FRMD_MEIN_ID,
                FRMD_FECHA,
                FRMD_FACTOR_CONVERSION,
                FRMD_CANTIDAD,
                FRMD_FRMO_MEIN_ID,
                FRMD_FRMO_CANTIDAD,
                FRMD_LOTE,
                FRMD_LOTE_FECHAVTO
                ,MOVF_ID_SALIDA
                ,MOVF_ID_INGRESO
                )
                VALUES 
                (CLIN_FRMD_SEQ.nextval,
                v_FRMO_ID,
                PiMeInIdDest,
                SYSDATE,
                PiFactorConv,
                PiCantidDest,
                PiMeInIdOrig,
                PiCantidOrig,
                PiLote,
                To_Date(PiFechavto, 'YYYY/MM/DD')
                ,v_MOVF_ID_salida
                ,v_MOVF_ID_ingreso
                );			
            end;
            
        end if;
    end if;


END P_DISTRIBUCION_FRACCIONADO;

-------------------------------------------------------------------------------------------------------

PROCEDURE P_GRABAR_CONVER(PIN_MEIN_ORIGEN  IN VARCHAR2,
                          PIN_MEIN_DESTINO IN VARCHAR2,
						  PIN_FACTOR_CONV  IN VARCHAR2,
						  PIN_CANT 		   IN VARCHAR2,
						  PIN_CANTIDAD 	   IN VARCHAR2,
                          PIN_BOD_COD      IN NUMBER)
IS
VALOR  NUMBER;
CANT   NUMBER;
v_stock_act Number;
v_valcos_act Number;
v_valcos_ori Number;
v_costo_nuevo Number;
v_costo_paso Number;
v_mein_codmei_origen varchar2(10);
v_mein_codmei_destino varchar2(10);
BEGIN


--insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('P_GRABAR_CONVER - PIN_MEIN_ORIGEN: '  || PIN_MEIN_ORIGEN , sysdate ); commit;
--insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('P_GRABAR_CONVER - PIN_MEIN_DESTINO: '  || PIN_MEIN_DESTINO , sysdate ); commit;
--insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('P_GRABAR_CONVER - PIN_FACTOR_CONV: '  || PIN_FACTOR_CONV , sysdate ); commit;
--insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('P_GRABAR_CONVER - PIN_CANT: '  || PIN_CANT , sysdate ); commit;
--insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('P_GRABAR_CONVER - PIN_BOD_COD: '  || PIN_BOD_COD , sysdate ); commit;

	 BEGIN
	 	  SELECT COUNT(*) INTO VALOR
	 	  FROM  CLIN_FAR_DISTRIB_COMPRAS
	 	  WHERE DCOM_MEIN_ID_ORIGEN = PIN_MEIN_ORIGEN
	 	  AND   DCOM_MEIN_ID_DESTINO= PIN_MEIN_DESTINO;
	 EXCEPTION	 WHEN NO_DATA_FOUND THEN
	 	  VALOR:=0;
	 END;

	 IF VALOR = 0 THEN
		  INSERT INTO CLIN_FAR_DISTRIB_COMPRAS
		  		 (DCOM_MEIN_ID_ORIGEN,
				  DCOM_MEIN_ID_DESTINO,
				  DCOM_FACTOR_CONVERSION,
				  DCOM_VIGENTE)
		  VALUES (PIN_MEIN_ORIGEN,
				  PIN_MEIN_DESTINO,
				  PIN_FACTOR_CONV,
				  'S');
	 ELSE
		  UPDATE CLIN_FAR_DISTRIB_COMPRAS
		  SET	 DCOM_FACTOR_CONVERSION = PIN_FACTOR_CONV,
				 DCOM_VIGENTE='S'
		  WHERE  DCOM_MEIN_ID_ORIGEN = PIN_MEIN_ORIGEN
		  AND    DCOM_MEIN_ID_DESTINO= PIN_MEIN_DESTINO;
	 END IF;

	 if PIN_CANTIDAD <> 0 then
        Begin   
            Select FBOI_STOCK_ACTUAL into v_stock_act from CLIN_FAR_BODEGAS_INV
	   		Where FBOI_MEIN_ID = to_number(PIN_MEIN_DESTINO)
			and   FBOI_FBOD_CODIGO = PIN_BOD_COD;
        EXCEPTION	 WHEN NO_DATA_FOUND THEN
            v_stock_act:=0;
        End;

	   Select MEIN_VALCOS, MEIN_CODMEI into v_valcos_act, v_mein_codmei_destino from clin_far_mamein
	   Where Mein_id = to_number(PIN_MEIN_DESTINO);

       if v_valcos_act is null then
	      v_valcos_act:=0;
	   end if;	  

	   Select MEIN_VALCOS, MEIN_CODMEI into v_valcos_ori, v_mein_codmei_origen from clin_far_mamein
	   Where Mein_id = to_number(PIN_MEIN_ORIGEN);

	   v_costo_paso:= v_valcos_ori * (1/PIN_FACTOR_CONV);

       if (v_stock_act + pin_cantidad) > 0 then
   	      v_costo_nuevo:=((v_stock_act * v_valcos_act) + (v_costo_paso * pin_cantidad)) / (v_stock_act + pin_cantidad);
	   end if;	  

       if v_stock_act > 0 then
	       Update Clin_Far_Mamein
	   	   Set mein_Valcos = v_costo_nuevo
		   Where Mein_id = to_number(PIN_MEIN_DESTINO);
	   end if;		  

	   UPDATE CLIN_FAR_BODEGAS_INV
	   SET FBOI_STOCK_ACTUAL = NVL(FBOI_STOCK_ACTUAL,0) + to_number(PIN_CANTIDAD)
	   WHERE FBOI_FBOD_CODIGO=PIN_BOD_COD
	   AND FBOI_MEIN_ID = to_number(PIN_MEIN_DESTINO);
  /*   
     insert into CLIN_FAR_KARDEX (KARD_ID,
                                  KARD_MEIN_ID,
                                  KARD_MEIN_CODMEI,
                                  KARD_FECHA,
                                  KARD_CANTIDAD,
                                  KARD_OPERACION,
                                  KARD_BOD_ORIGEN,
                                  KARD_BOD_DESTINO,
                                  KARD_MFDE_ID,
                                  KARD_DESCRIPCION
                                 )
                          values (CLIN_KARD_SEQ.NEXTVAL,
                                  PIN_MEIN_DESTINO,
                                  v_mein_codmei_destino,
                                  sysdate,
                                  PIN_CANTIDAD,
                                  'S',
                                  PIN_BOD_COD,
                                  PIN_BOD_COD,
                                  0,
                                  'Ingreso por fraccionamiento'
                                 );
 */
	   UPDATE CLIN_FAR_BODEGAS_INV
--	   SET FBOI_STOCK_ACTUAL = NVL(FBOI_STOCK_ACTUAL,0) - (to_number(PIN_CANT) * (PIN_FACTOR_CONV/100))
	   SET FBOI_STOCK_ACTUAL = NVL(FBOI_STOCK_ACTUAL,0) - to_number(PIN_CANT)
	   WHERE FBOI_FBOD_CODIGO=PIN_BOD_COD
	   AND FBOI_MEIN_ID = to_number(PIN_MEIN_ORIGEN);
/*
     insert into CLIN_FAR_KARDEX (KARD_ID,
                                  KARD_MEIN_ID,
                                  KARD_MEIN_CODMEI,
                                  KARD_FECHA,
                                  KARD_CANTIDAD,
                                  KARD_OPERACION,
                                  KARD_BOD_ORIGEN,
                                  KARD_BOD_DESTINO,
                                  KARD_MFDE_ID,
                                  KARD_DESCRIPCION
                                 )
                          values (CLIN_KARD_SEQ.NEXTVAL,
                                  PIN_MEIN_ORIGEN,
                                  v_mein_codmei_origen,
                                  sysdate,
                                  PIN_CANT,
                                  'R',
                                  PIN_BOD_COD,
                                  PIN_BOD_COD,
                                  0,
                                  'Salida por fraccionamiento'
                                 );
	*/   
     end if;  

END P_GRABAR_CONVER;

---------------------------------------------------------------------------------------------------

PROCEDURE P_GRABA_FRACCIONADOS(pinCOD 	  	   IN NUMBER,
		  					   pinCANTIDAD     IN NUMBER,
							   pinRESPONSABLE  IN VARCHAR2,
							   pinCOD_DET  	   IN NUMBER,
							   pinFACTOR 	   IN NUMBER,
							   pinCANTIDAD_DET IN NUMBER,
                               PinLote         IN VARCHAR2,
                               PinFechavto     IN VARCHAR2)
IS
vCOD  						   NUMBER(10);
vID   						   NUMBER(10);
vCANT 						   NUMBER;
Seq_Id  					   NUMBER;
Seq_Det 					   NUMBER;

COD_MEI        char(10);
COD_MEI_O      char(10);

v_FRMD_FRMO_MEIN_ID     NUMBER(10,0);

BEGIN

--insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('P_GRABA_FRACCIONADOS - pinCOD: '  || pinCOD , sysdate ); commit;
--insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('P_GRABA_FRACCIONADOS - pinCANTIDAD: '  || pinCANTIDAD , sysdate ); commit;
--insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('P_GRABA_FRACCIONADOS - pinRESPONSABLE: '  || pinRESPONSABLE , sysdate ); commit;
--insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('P_GRABA_FRACCIONADOS - pinCOD_DET: '  || pinCOD_DET , sysdate ); commit;
--insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('P_GRABA_FRACCIONADOS - pinFACTOR: '  || pinFACTOR , sysdate ); commit;
--insert into PASO_ERRORES_EO(DESCRIPCION, FECHA ) values ('P_GRABA_FRACCIONADOS - pinCANTIDAD_DET: '  || pinCANTIDAD_DET , sysdate ); commit;


/*	 
 	 BEGIN 
		 SELECT COUNT(*)
		 INTO   vCOD
		 FROM   Clin_Far_Fraccionados_Mov FM
		 WHERE  FM.FRMO_ID = SEQ_ID;
	 EXCEPTION
	 WHEN NO_DATA_FOUND THEN
	  	  vCOD := 0;
	 END;
	*/ 

  Begin
    SELECT CLIN_FRMO_SEQ.NEXTVAL
      INTO Seq_Id
      FROM DUAL;
  End;

  BEGIN
--	 IF vCOD = 0 THEN
  		INSERT INTO CLIN_FAR_FRACCIONADOS_MOV
			   (FRMO_ID,
			    FRMO_MEIN_ID, 
			    FRMO_CANTIDAD, 
				FRMO_FECHA, 
				FRMO_RESPONSABLE)
		VALUES (Seq_Id,
			    pinCOD, 
			    pinCANTIDAD, 
				SYSDATE, 
				pinRESPONSABLE);
  END;
  ----------------------------------------------------------------------------------------------------
  -- trigger CLIN_TRG_FRACC_MOV 
  --trigger "FARMACIACLINICA"."CLIN_TRG_FRACC_MOV" 
--AFTER INSERT
--ON FARMACIACLINICA.CLIN_FAR_FRACCIONADOS_MOV 
--REFERENCING NEW AS NEW OLD AS OLD
--FOR EACH ROW
--DECLARE
--COD_MEI        char(10);
--BEGIN

    select MAM.MEIN_CODMEI 
    INTO COD_MEI 
    from clin_far_mamein mam 
    where mam.mein_id = pinCOD;

    INSERT INTO Clin_Far_Kardex(
    KARD_ID, 
    KARD_MEIN_ID, 
    KARD_MEIN_CODMEI, 
    KARD_FECHA, 
    KARD_OPERACION, 
    KARD_CANTIDAD, 
    KARD_BOD_ORIGEN, 
    KARD_BOD_DESTINO, 
    KARD_BOD_EXTERNA,  
    KARD_BOD_PACIENTE, 
    KARD_MFDE_ID, 
    KARD_MDEV_ID, 
    KARD_AJUS_ID, 
    KARD_FPDE_ID, 
    KARD_FPMO_ID, 
    KARD_FPMOV_ID, 
    KARD_ORDEN, 
    KARD_DESCRIPCION, 
    KARD_FRMO_ID, 
    KARD_FRMD_ID    )
    VALUES (
    CLIN_KARD_SEQ.NEXTVAL,
    pinCOD,
    COD_MEI,
    Sysdate,
    'R',
    pinCANTIDAD,
    1,
    Null,
    Null,
    Null,
    Null,
    Null,
    Null,
    Null,
    Null,
    Null,
    Null,
    'Salida por Distribucion de Fraccionados',
    Seq_Id,
    Null
  );
--END;
  ----------------------------------------------------------------------------------------------------

--	 END IF;

--************************** GRABA DETALLE ********************************************

-- 	  SELECT FRMO_ID
-- 	  INTO	 vID
-- 	  FROM	 CLIN_FAR_FRACCIONADOS_MOV
-- 	  WHERE	 FRMO_MEIN_ID = pinCOD;

	  IF pinCANTIDAD_DET > 0 THEN 	  

        select CLIN_FRMD_SEQ.nextval into Seq_Det from dual;

       INSERT INTO CLIN_FAR_FRACCIONADOS_MOV_DET
		 		(FRMD_ID,
				 FRMD_FRMO_ID,
				 FRMD_MEIN_ID,
				 FRMD_FECHA,
				 FRMD_FACTOR_CONVERSION,
				 FRMD_CANTIDAD,
                 FRMD_FRMO_MEIN_ID,
                 FRMD_FRMO_CANTIDAD,
                 FRMD_LOTE,
                 FRMD_LOTE_FECHAVTO)
	    VALUES 	(Seq_Det,
	             Seq_Id,
		 		 pinCOD_DET,
				 SYSDATE,
				 pinFACTOR,
				 pinCANTIDAD_DET,
                 pinCOD,
                 pinCANTIDAD,
                 PinLote,
                 To_Date(PinFechavto, 'YYYY/MM/DD')
                 );	             
                 
      END IF;

      ----------------------------------------------------------------------------------------
      -- trigger  CLIN_TRG_FRACC_MOV_DET

      --trigger "FARMACIACLINICA"."CLIN_TRG_FRACC_MOV_DET" 
--AFTER INSERT
--ON FARMACIACLINICA.CLIN_FAR_FRACCIONADOS_MOV_DET 
--REFERENCING NEW AS NEW OLD AS OLD
--FOR EACH ROW
--DECLARE
--COD_MEI        char(10);
--COD_MEI_O      char(10);

--BEGIN

    select MAM.MEIN_CODMEI 
    INTO COD_MEI 
    from clin_far_mamein mam 
    where mam.mein_id = pinCOD_DET;


    INSERT INTO Clin_Far_Kardex
    (
    KARD_ID, 
    KARD_MEIN_ID, 
    KARD_MEIN_CODMEI, 
    KARD_FECHA, 
    KARD_OPERACION, 
    KARD_CANTIDAD, 
    KARD_BOD_ORIGEN, 
    KARD_BOD_DESTINO, 
    KARD_BOD_EXTERNA,  
    KARD_BOD_PACIENTE, 
    KARD_MFDE_ID, 
    KARD_MDEV_ID, 
    KARD_AJUS_ID, 
    KARD_FPDE_ID, 
    KARD_FPMO_ID, 
    KARD_FPMOV_ID, 
    KARD_ORDEN, 
    KARD_DESCRIPCION, 
    KARD_FRMO_ID, 
    KARD_FRMD_ID    
    )
    VALUES 
    (
    CLIN_KARD_SEQ.NEXTVAL,
       pinCOD_DET,
       COD_MEI,
       Sysdate,
       'S',
       pinCANTIDAD_DET,
       1,
       Null,
       Null,
       Null,
       Null,
       Null,
       Null,
       Null,
       Null,
       Null,
       Null,
       'Ingreso por Distribucion de Fraccionados',
      Null,
      Seq_Det   
   );


    select FRMD_FRMO_MEIN_ID  
    into v_FRMD_FRMO_MEIN_ID 
    from CLIN_FAR_FRACCIONADOS_MOV_DET
    where FRMD_ID = Seq_Det;  

    BEGIN
        select MAM.MEIN_CODMEI 
        INTO COD_MEI_O 
        from clin_far_mamein mam 
        where mam.mein_id = v_FRMD_FRMO_MEIN_ID;
    EXCEPTION WHEN NO_DATA_FOUND THEN
	  	  COD_MEI_O := ' ';
	END;



    INSERT INTO Clin_Far_Kardex
    (
    KARD_ID, 
    KARD_MEIN_ID, 
    KARD_MEIN_CODMEI, 
    KARD_FECHA, 
    KARD_OPERACION, 
    KARD_CANTIDAD, 
    KARD_BOD_ORIGEN, 
    KARD_BOD_DESTINO, 
    KARD_BOD_EXTERNA,  
    KARD_BOD_PACIENTE, 
    KARD_MFDE_ID, 
    KARD_MDEV_ID, 
    KARD_AJUS_ID, 
    KARD_FPDE_ID, 
    KARD_FPMO_ID, 
    KARD_FPMOV_ID, 
    KARD_ORDEN, 
    KARD_DESCRIPCION, 
    KARD_FRMO_ID, 
    KARD_FRMD_ID    
    )
    VALUES (
          CLIN_KARD_SEQ.NEXTVAL,
          v_FRMD_FRMO_MEIN_ID,
          COD_MEI_O,
          Sysdate,
       'R',
       pinCANTIDAD_DET,
       1,
       Null,
       Null,
       Null,
       Null,
       Null,
       Null,
       Null,
       Null,
       Null,
       Null,
       'Salida por Distribucion de Fraccionados',
       Seq_Id,
    Null
  );

--END;
      ----------------------------------------------------------------------------------------

--**************************************************************************************

END P_GRABA_FRACCIONADOS;


end PKG_GRABA_FRACCIONADOS;
/