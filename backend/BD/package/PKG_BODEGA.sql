create or replace PACKAGE PKG_BODEGA as
    PROCEDURE P_GUARDAR_POR_INVENTARIO(
         SRV_Message In Out Varchar2  /*  Parametro de uso interno  */ 
        ,In_Json     IN Varchar2
    );
    PROCEDURE P_LISTA_POR_INVENTARIO(
         SRV_Message       In  Out     Varchar2                        /*  Parametro de uso interno  */ 
        ,In_Json     IN Varchar2
        ,Out_Json IN OUT CLOB
    );
    PROCEDURE P_LISTA_ESTRUCTURA_BODEGA(
         SRV_Message       In  Out     Varchar2                        /*  Parametro de uso interno  */ 
        ,In_Json     IN Varchar2
        ,Out_Json IN OUT CLOB
    );
END PKG_BODEGA;
/
create or replace PACKAGE BODY PKG_BODEGA AS
	PROCEDURE P_GUARDAR_POR_INVENTARIO(
         SRV_Message In  Out Varchar2 /*  Parametro de uso interno  */ 
        ,In_Json     IN Varchar2
    ) AS 
    BEGIN
    SRV_Message := '1000000';
		DECLARE 
			V_PSUG_ID CLIN_FAR_PEDIDO_SUGERIDO.PSUG_ID%TYPE DEFAULT(0);
		BEGIN
            NTRACELOG_PKG.GRABA_LOG( --FEDERADORERRORLOG
                'PKG_BODEGA', -- VARCHAR(1000) NOMBREPCK
                ' LINEA 17 ', -- MSGERROR
                '  SRV_MESSAGE : ' || SRV_Message ||               
                '| In_Json     : ' || In_Json, -- VARCHAR(500) -- DESCRIPCION
               NULL -- CLOB XMLENVIADO
            );
            FOR VJSON IN(with json as ( select In_Json doc from   dual )  
                SELECT 
                     PSUG_ID
                    ,PSUG_HDGCODIGO
                    ,PSUG_ESACODIGO
                    ,PSUG_CMECODIGO
                    ,PSUG_PERIOCIDAD
                    ,PSUG_CONS_HISTORICO
                    ,PSUG_FECHA_INICIO
                    ,PSUG_USUARIO
                    ,PSUG_FBOD_CODIGO
                    ,PSUG_NUEVO
                FROM  json_table( (select doc from json) , '$[*]' 
                    COLUMNS (
                             PSUG_ID              PATH '$.psugid'
                            ,PSUG_HDGCODIGO       PATH '$.psughdgcodigo'
                            ,PSUG_ESACODIGO       PATH '$.psugesacodigo'
                            ,PSUG_CMECODIGO       PATH '$.psugcmecodigo'
                            ,PSUG_PERIOCIDAD      PATH '$.psugperiocidad'
                            ,PSUG_CONS_HISTORICO  PATH '$.psugconshistorico'
                            ,PSUG_FECHA_INICIO    PATH '$.psugfechainicio'
                            ,PSUG_USUARIO         PATH '$.psugusuario'
                            ,PSUG_FBOD_CODIGO     PATH '$.psugfbodcodigo'
                            ,PSUG_NUEVO           PATH '$.psugnuevo'
                            )  
               )
           )LOOP
                BEGIN
                    SELECT MAX(PSUG_ID) INTO V_PSUG_ID FROM CLIN_FAR_PEDIDO_SUGERIDO
                    WHERE PSUG_FBOD_CODIGO = VJSON.PSUG_FBOD_CODIGO
                      AND PSUG_HDGCODIGO = VJSON.PSUG_HDGCODIGO
                      AND PSUG_ESACODIGO = VJSON.PSUG_ESACODIGO
                      AND PSUG_CMECODIGO = VJSON.PSUG_CMECODIGO;
                    IF V_PSUG_ID IS NULL THEN
                        V_PSUG_ID := 0;
                    END IF;
                    BEGIN
                        IF V_PSUG_ID > 0 THEN
                            UPDATE CLIN_FAR_PEDIDO_SUGERIDO 
                            SET PSUG_FECHA_CIERRE = SYSDATE
                            WHERE PSUG_ID = V_PSUG_ID;
                        END IF;
                        INSERT INTO CLIN_FAR_PEDIDO_SUGERIDO (
                              PSUG_ID
                            , PSUG_HDGCODIGO
                            , PSUG_ESACODIGO
                            , PSUG_CMECODIGO
                            , PSUG_FBOD_CODIGO
                            , PSUG_USUARIO
                            , PSUG_PERIOCIDAD
                            , PSUG_CONS_HISTORICO
                            , PSUG_FECHA_INICIO
                            , PSUG_FECHA_CIERRE
                        ) VALUES (
                              CLIN_FAR_PEDIDO_SUGERIDO_SEQ.NEXTVAL
                            , VJSON.PSUG_HDGCODIGO
                            , VJSON.PSUG_ESACODIGO
                            , VJSON.PSUG_CMECODIGO
                            , VJSON.PSUG_FBOD_CODIGO
                            , VJSON.PSUG_USUARIO
                            , VJSON.PSUG_PERIOCIDAD
                            , VJSON.PSUG_CONS_HISTORICO
                            , TO_DATE(VJSON.PSUG_FECHA_INICIO, 'DD-MM-YYYY')
                            , NULL
                        );
                    EXCEPTION WHEN OTHERS THEN
                        SRV_MESSAGE := '078000'
                                       || ' NO SE PUDO INGRESAR PARAMETRO DE PEDIDO SUGERIDO.'
                                       || SQLERRM;
                        BEGIN
                            NTRACELOG_PKG.GRABA_LOG( --FEDERADORERRORLOG
                                'PKG_BODEGA', -- VARCHAR(1000) NOMBREPCK
                                ' LINEA 73 ', -- MSGERROR
                                '  SRV_MESSAGE : ' || SRV_Message ||               
                                '| In_Json     : ' || In_Json, -- VARCHAR(500) -- DESCRIPCION
                               NULL -- CLOB XMLENVIADO
                            );
                        END;
                        GOTO PSUB_GUARDAR_EXIT;
                    END;
                END;
            END LOOP;
        END;
    <<PSUB_GUARDAR_EXIT>> NULL;
    END P_GUARDAR_POR_INVENTARIO;
    PROCEDURE P_LISTA_POR_INVENTARIO(
         SRV_Message       In  Out     Varchar2                        /*  Parametro de uso interno  */ 
        ,In_Json     IN Varchar2
        ,Out_Json IN OUT CLOB
    ) AS 
    SRV_QUERY VARCHAR2(10000);
    BEGIN
    NTRACELOG_PKG.GRABA_LOG( --FEDERADORERRORLOG
        'PKG_BODEGA', -- VARCHAR(1000) NOMBREPCK
        ' LINEA 110 ', -- MSGERROR
        '  SRV_MESSAGE : ' || SRV_Message ||               
        '| In_Json     : ' || In_Json, -- VARCHAR(500) -- DESCRIPCION
       NULL -- CLOB XMLENVIADO
    );
    SRV_Message := '1000000';    
		DECLARE 
			V_PSUG_ID               CLIN_FAR_PEDIDO_SUGERIDO.PSUG_ID%TYPE;
            IN_PSUG_FBOD_CODIGO     CLIN_FAR_PEDIDO_SUGERIDO.PSUG_FBOD_CODIGO%TYPE;
            IN_PSUG_HDGCODIGO     CLIN_FAR_PEDIDO_SUGERIDO.PSUG_HDGCODIGO%TYPE;
            IN_PSUG_ESACODIGO     CLIN_FAR_PEDIDO_SUGERIDO.PSUG_ESACODIGO%TYPE;
            IN_PSUG_CMECODIGO     CLIN_FAR_PEDIDO_SUGERIDO.PSUG_CMECODIGO%TYPE;
		BEGIN
            SELECT JSON_VALUE(In_Json, '$.psugfbodcodigo') AS IN_PSUG_FBOD_CODIGO INTO IN_PSUG_FBOD_CODIGO FROM DUAL;
            SELECT JSON_VALUE(In_Json, '$.psughdgcodigo') AS IN_PSUG_HDGCODIGO INTO IN_PSUG_HDGCODIGO FROM DUAL;
            SELECT JSON_VALUE(In_Json, '$.psugesacodigo') AS IN_PSUG_ESACODIGO INTO IN_PSUG_ESACODIGO FROM DUAL;
            SELECT JSON_VALUE(In_Json, '$.psugcmecodigo') AS IN_PSUG_CMECODIGO INTO IN_PSUG_CMECODIGO FROM DUAL;

            SELECT MAX(PSUG_ID) INTO V_PSUG_ID FROM CLIN_FAR_PEDIDO_SUGERIDO 
            WHERE PSUG_FBOD_CODIGO = IN_PSUG_FBOD_CODIGO
              AND PSUG_HDGCODIGO = IN_PSUG_HDGCODIGO
              AND PSUG_ESACODIGO = IN_PSUG_ESACODIGO
              AND PSUG_CMECODIGO = IN_PSUG_CMECODIGO;
            IF V_PSUG_ID IS NULL THEN
                NTRACELOG_PKG.GRABA_LOG( --FEDERADORERRORLOG
                    'PKG_BODEGA', -- VARCHAR(1000) NOMBREPCK
                    ' LINEA 136 ', -- MSGERROR
                    '  SRV_MESSAGE : ' || SRV_Message ||               
                    '| In_Json     : ' || In_Json ||
                    '| V_PSUG_ID     : ' || V_PSUG_ID ||
                    '| IN_PSUG_FBOD_CODIGO     : ' || IN_PSUG_FBOD_CODIGO ||
                    '| IN_PSUG_HDGCODIGO     : ' || IN_PSUG_HDGCODIGO ||
                    '| IN_PSUG_ESACODIGO     : ' || IN_PSUG_ESACODIGO ||
                    '| IN_PSUG_CMECODIGO     : ' || IN_PSUG_CMECODIGO, -- VARCHAR(500) -- DESCRIPCION
                   NULL -- CLOB XMLENVIADO
                );
                GOTO PSUB_LISTA_EXIT;
            END IF;
            BEGIN
                SELECT json_arrayagg(
                    JSON_OBJECT(  
						  'psugid'            IS PSUG_ID
                        , 'psughdgcodigo'	  IS PSUG_HDGCODIGO
                        , 'psugesacodigo'	  IS PSUG_ESACODIGO
                        , 'psugcmecodigo'	  IS PSUG_CMECODIGO
                        , 'psugfbodcodigo'	  IS PSUG_FBOD_CODIGO
                        , 'psugusuario'	      IS PSUG_USUARIO
                        , 'psugperiocidad'	  IS PSUG_PERIOCIDAD
                        , 'psugconshistorico' IS PSUG_CONS_HISTORICO
                        , 'psugfechainicio'	  IS PSUG_FECHA_INICIO
                        , 'psugfechacierre'	  IS PSUG_FECHA_CIERRE
                        ) RETURNING CLOB
                    ) AS RESP_JSON into Out_Json
                FROM(
                    SELECT 
                          PSUG_ID
                        , PSUG_HDGCODIGO
                        , PSUG_ESACODIGO
                        , PSUG_CMECODIGO
                        , PSUG_FBOD_CODIGO
                        , PSUG_USUARIO
                        , PSUG_PERIOCIDAD
                        , PSUG_CONS_HISTORICO
                        , TO_CHAR(PSUG_FECHA_INICIO, 'DD-MM-YYYY HH24:MI:SS') PSUG_FECHA_INICIO
                        , TO_CHAR(PSUG_FECHA_CIERRE, 'DD-MM-YYYY HH24:MI:SS') PSUG_FECHA_CIERRE
                    FROM CLIN_FAR_PEDIDO_SUGERIDO 
                    WHERE PSUG_FBOD_CODIGO = IN_PSUG_FBOD_CODIGO
                      AND PSUG_HDGCODIGO = IN_PSUG_HDGCODIGO
                      AND PSUG_ESACODIGO = IN_PSUG_ESACODIGO
                      AND PSUG_CMECODIGO = IN_PSUG_CMECODIGO
                );
            END;
            NTRACELOG_PKG.GRABA_LOG( --FEDERADORERRORLOG
                'PKG_BODEGA', -- VARCHAR(1000) NOMBREPCK
                ' LINEA 170 ', -- MSGERROR
                '  SRV_MESSAGE : ' || SRV_Message ||               
                '| In_Json     : ' || In_Json ||
                '| Out_Json     : ' || Out_Json, -- VARCHAR(500) -- DESCRIPCION
               NULL -- CLOB XMLENVIADO
            );
        END;
    <<PSUB_LISTA_EXIT>> NULL;
    END P_LISTA_POR_INVENTARIO;
	PROCEDURE P_LISTA_ESTRUCTURA_BODEGA(
         SRV_Message In  Out Varchar2                        /*  Parametro de uso interno  */ 
        ,In_Json     IN VARCHAR2
        ,Out_Json IN OUT CLOB
    ) AS 
    SRV_QUERY VARCHAR2(10000);
    BEGIN
    NTRACELOG_PKG.GRABA_LOG( --FEDERADORERRORLOG
        'PKG_BODEGA', -- VARCHAR(1000) NOMBREPCK
        ' LINEA 202 ', -- MSGERROR
        '  SRV_MESSAGE : ' || SRV_Message ||               
        '| In_Json     : ' || In_Json, -- VARCHAR(500) -- DESCRIPCION
       NULL -- CLOB XMLENVIADO
    );
    SRV_Message := '1000000';    
		DECLARE 
            IN_HDGCODIGO      	CLIN_FAR_BODEGAS.HDGCODIGO%TYPE;
			IN_ESACODIGO        CLIN_FAR_BODEGAS.ESACODIGO%TYPE;
			IN_CMECODIGO        CLIN_FAR_BODEGAS.CMECODIGO%TYPE;
			IN_CODBODEGA        CLIN_FAR_BODEGAS.FBOD_CODIGO%TYPE;
			IN_FBOCODIGOBODEGA  CLIN_FAR_BODEGAS.FBO_CODIGOBODEGA%TYPE;
			IN_DESBODEGA        CLIN_FAR_BODEGAS.FBOD_DESCRIPCION%TYPE;
			IN_ESTADO           CLIN_FAR_BODEGAS.FBOD_ESTADO%TYPE;
			IN_TIPOPRODUCTO     CLIN_FAR_BODEGAS.FBOD_TIPOPRODUCTO%TYPE;
			IN_TIPOBODEGA       CLIN_FAR_BODEGAS.FBOD_TIPO_BODEGA%TYPE;
			IN_SERVIDOR         VARCHAR(10);
			IN_USUARIO          TBL_USER.FLD_USERCODE%TYPE;
			IN_CODMEI           CLIN_FAR_MAMEIN.MEIN_CODMEI%TYPE;
            V_PROMEDIODEM       NUMBER(5);
            V_PERIOCIDAD        NUMBER(5);
            V_CONS_HISTORICO    NUMBER(5);
            TYPE cur_typ IS REF CURSOR;
            c_cursor CUR_TYP;
            fila CLOB := EMPTY_CLOB(); -- Initialize the CLOB variable
            sql_str CLOB := EMPTY_CLOB(); -- Initialize the CLOB variable
		BEGIN
            Out_Json := EMPTY_CLOB(); -- Initialize the CLOB variable
           SELECT 
                JSON_VALUE(In_Json, '$.hdgcodigo')       AS IN_HDGCODIGO,
                JSON_VALUE(In_Json, '$.esacodigo')       AS IN_ESACODIGO,
                JSON_VALUE(In_Json, '$.cmecodigo')       AS IN_CMECODIGO,
                JSON_VALUE(In_Json, '$.codbodega')       AS IN_CODBODEGA,
                JSON_VALUE(In_Json, '$.fbocodigobodega') AS IN_FBOCODIGOBODEGA,
                JSON_VALUE(In_Json, '$.desbodega')       AS IN_DESBODEGA,
                JSON_VALUE(In_Json, '$.estado')          AS IN_ESTADO,
                JSON_VALUE(In_Json, '$.tipoproducto')    AS IN_TIPOPRODUCTO,
                JSON_VALUE(In_Json, '$.tipobodega')      AS IN_TIPOBODEGA,
                JSON_VALUE(In_Json, '$.servidor')        AS IN_SERVIDOR,
                JSON_VALUE(In_Json, '$.usuario')         AS IN_USUARIO,
                JSON_VALUE(In_Json, '$.codmei')          AS IN_CODMEI
            INTO
                IN_HDGCODIGO,IN_ESACODIGO,IN_CMECODIGO,IN_CODBODEGA,IN_FBOCODIGOBODEGA,IN_DESBODEGA
               ,IN_ESTADO,IN_TIPOPRODUCTO,IN_TIPOBODEGA,IN_SERVIDOR,IN_USUARIO,IN_CODMEI
            FROM DUAL;
            
            SELECT PARG_VALOR1 INTO V_PROMEDIODEM FROM CLIN_FAR_PARAM_GENERAL 
            WHERE PARG_CODIGO = 'probNormDemanda' 
              AND HDGCODIGO = IN_HDGCODIGO 
              AND ESACODIGO = IN_ESACODIGO 
              AND CMECODIGO = IN_CMECODIGO;
              
            SELECT 
                  PSUG_PERIOCIDAD
                , PSUG_CONS_HISTORICO
            INTO V_PERIOCIDAD, V_CONS_HISTORICO
            FROM CLIN_FAR_PEDIDO_SUGERIDO 
            WHERE PSUG_FBOD_CODIGO = IN_FBOCODIGOBODEGA
              AND PSUG_HDGCODIGO = IN_HDGCODIGO
              AND PSUG_ESACODIGO = IN_ESACODIGO
              AND PSUG_CMECODIGO = IN_CMECODIGO;

            NTRACELOG_PKG.GRABA_LOG(
                'PKG_BODEGA', -- VARCHAR(1000)
                ' LINEA 247 ',
                ' SRV_MESSAGE              : ' || SRV_MESSAGE ||               
                '| IN_HDGCODIGO             : ' || IN_HDGCODIGO ||               
                '| IN_ESACODIGO             : ' || IN_ESACODIGO ||               
                '| IN_CMECODIGO             : ' || IN_CMECODIGO ||               
                '| IN_MOVF_TIPO             : ' || IN_CODBODEGA ||               
                '| IN_ID_TRANSACCION_FIN700 : ' || IN_FBOCODIGOBODEGA ||   
                '| IN_MOVF_USUARIO          : ' || IN_DESBODEGA ||            
                '| IN_MOVF_BOD_ORIGEN       : ' || IN_ESTADO ||         
                '| IN_MOVF_BOD_DESTINO      : ' || IN_TIPOPRODUCTO ||        
                '| IN_MOVF_ORCO_NUMDOC      : ' || IN_TIPOBODEGA ||        
                '| IN_MOVF_GUIA_NUMERO_DOC  : ' || IN_SERVIDOR ||        
                '| IN_MOVF_GUIA_NUMERO_DOC  : ' || IN_USUARIO ||        
                '| IN_MOVF_GUIA_NUMERO_DOC  : ' || IN_CODMEI, -- VARCHAR(500)
               NULL -- CLOB
            );
            sql_str := sql_str || 'SELECT
                coalesce(
                    json_arrayagg(
                        json_object(
                         KEY ''hdgcodigo''               VALUE BOD.HDGCODIGO           
                        ,KEY ''esacodigo''               VALUE BOD.ESACODIGO        
                        ,KEY ''cmecodigo''               VALUE BOD.CMECODIGO        
                        ,KEY ''codbodega''               VALUE BOD.FBOD_CODIGO        
                        ,KEY ''desbodega''               VALUE BOD.FBOD_DESCRIPCION        
                        ,KEY ''estado''                  VALUE BOD.FBOD_ESTADO       
                        ,KEY ''despachareceta''          VALUE BOD.FBO_DESPACHA_RECETA   
                        ,KEY ''modificable''             VALUE BOD.FBOD_MODIFICABLE  
                        ,KEY ''tipoproducto''            VALUE BOD.FBOD_TIPOPRODUCTO 
                        ,KEY ''tipobodega''              VALUE BOD.FBOD_TIPO_BODEGA   
                        ,KEY ''fbodfraccionable''        VALUE BOD.FBO_FRACCIONABLE 
                        ,KEY ''glosatipobodega''         VALUE NVL(PARTB.FPAR_DESCRIPCION, ''SIN TIPO BODEGA'')  
                        ,KEY ''glosatiproducto''         VALUE NVL(PARTP.FPAR_DESCRIPCION, ''SIN TIPO PRODUCTO'')
                        ,KEY ''fbocodigobodega''         VALUE BOD.FBO_CODIGOBODEGA  
                        ,KEY ''servidor''                VALUE ''DESARROLLO''         
                        ,KEY ''usuario''                 VALUE TUSE.FLD_USERCODE
                        ,''serviciosunidadbodega'' value to_clob(''''||
                            (
                                SELECT json_arrayagg(
                                    JSON_OBJECT(  
                                         KEY ''hdgcodigo''    VALUE BSER.HDGCODIGO   
                                        ,KEY ''cmecodigo''    VALUE BSER.CMECODIGO    
                                        ,KEY ''idservicio''   VALUE BSER.BS_SERV_ID  
                                        ,KEY ''descservicio'' VALUE SLOG.SERV_DESCRIPCION
                                        ,KEY ''codunidad''    VALUE BSER.CODUNIDAD   
                                        ,KEY ''descunidad''   VALUE SLOG.SERV_DESCRIPCION  
                                        ,KEY ''codbodega''    VALUE BSER.BS_FBOD_CODIGO   
                                        ,KEY ''codservicio''  VALUE SLOG.SERV_CODIGO 
                                        ,KEY ''servidor''     VALUE ''DESARROLLO''    
                                        ,KEY ''usuario''      VALUE TUSE.FLD_USERCODE     
                                        ) RETURNING CLOB
                                    ) 
                                FROM CLIN_FAR_BODEGA_SERVICIO BSER
                                   , CLIN_SERVICIOS_LOGISTICO  SLOG
                                WHERE BSER.BS_SERV_ID = SLOG.SERV_ID 
                                  AND SLOG.SERV_ID = BSER.BS_SERV_ID
                                  AND BSER.BS_FBOD_CODIGO = BOD.FBOD_CODIGO
                            )
                        ||'''')
                        format json
                        ,''productosbodega'' value to_clob(''''||
                            (
                                SELECT json_arrayagg(
                                    JSON_OBJECT(  
                                         KEY ''bodid''             VALUE NVL(INV.FBOI_ID, 0)
                                        ,KEY ''hdgcodigo''         VALUE BOD.HDGCODIGO
                                        ,KEY ''meinid''            VALUE NVL(INV.FBOI_MEIN_ID, 0)
                                        ,KEY ''mameincodmei''      VALUE NVL(MEIN.MEIN_CODMEI, ''Sin codigo'')
                                        ,KEY ''ptoasignacion''     VALUE NVL(INV.FBOI_STOCK_MAXIMO, 0)
                                        ,KEY ''ptoreposicion''     VALUE NVL(INV.FBOI_PUNREO, 0)
                                        ,KEY ''stockcritico''      VALUE NVL(INV.FBOI_STOCRI, 0)
                                        ,KEY ''stockactual''       VALUE NVL(INV.FBOI_STOCK_ACTUAL, 0)
                                        ,KEY ''nivelreposicion''   VALUE NVL(INV.FBOI_NIVEL_REPOSICION, 0)
                                        ,KEY ''glosaproducto''     VALUE NVL(MEIN.MEIN_DESCRI, ''Sin nombre'')
                                        ,KEY ''principioactivo''   VALUE NVL((SELECT PACT_DESCRI FROM CLIN_FAR_PRINCIPIO_ACT WHERE PACT_ID = MEIN.MEIN_PACT_ID),'' '')
                                        ,KEY ''presentacion''      VALUE NVL((SELECT PRES_DESCRI FROM CLIN_FAR_PRESENTACION_MED WHERE PRES_ID = MEIN.MEIN_PRES_ID), '' '')
                                        ,KEY ''formafarma''        VALUE NVL((SELECT PRES_DESCRI FROM CLIN_FAR_PRESENTACION_MED WHERE PRES_ID = MEIN_PRES_ID), '' '')
                                        ,KEY ''glosaunidad''       VALUE (SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 4 AND FPAR_CODIGO = MEIN.MEIN_U_DESP)
                                        ,KEY ''glosatipoproducto'' VALUE (SELECT NVL(FPAR_DESCRIPCION, '' '') FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 27 AND FPAR_VALOR = MEIN_TIPOREG)
                                        ,KEY ''controlminimo''     VALUE NVL(INV.FBOI_BOD_CONTROLMINIMO, ''N'')
                                        ) RETURNING CLOB
                                    ) 
                                FROM CLIN_FAR_BODEGAS_INV INV
                                    ,CLIN_FAR_MAMEIN      MEIN
                                    ,CLIN_FAR_PARAM PGLSUNI
                                    ,CLIN_FAR_PARAM PGLSTIPROD
                                WHERE MEIN.HDGCODIGO = BOD.HDGCODIGO
                                    AND MEIN.MEIN_ID = INV.FBOI_MEIN_ID
                                    AND INV.FBOI_FBOD_CODIGO = BOD.FBOD_CODIGO
                                    AND PGLSUNI.FPAR_TIPO = 4 AND PGLSUNI.FPAR_CODIGO = MEIN.MEIN_U_DESP
                                    AND PGLSTIPROD.FPAR_TIPO = 27 AND PGLSTIPROD.FPAR_VALOR = MEIN_TIPOREG
                                    AND MEIN.MEIN_CODMEI LIKE ''%' || IN_CODMEI || '%''
                            )
                        ||'''')
                        format json
                        ,''usuariosbodega'' value to_clob(''''||
                            (
                                SELECT json_arrayagg(
                                    JSON_OBJECT(  
                                         KEY ''bouid''		VALUE FBOU_FBOD_CODIGO        
                                        ,KEY ''bodegacodigo'' VALUE FBOU_FLD_USERID
                                        ,KEY ''userid''       VALUE FBOU_ID    
                                        ,KEY ''glosausuario'' VALUE (SELECT FLD_USERNAME FROM TBL_USER WHERE FLD_USERID =FBOU_FLD_USERID)    
                                        ,KEY ''servidor''     VALUE ''DESARROLLO''      
                                        ,KEY ''usuario''      VALUE TUSE.FLD_USERCODE 
                                        ) RETURNING CLOB
                                    )
                                FROM CLIN_FAR_BODEGAS_USUARIO
                                    WHERE FBOU_FBOD_CODIGO = BOD.FBOD_CODIGO
                            )
                        ||'''')
                        format json
                        ,''relacionbodegas'' value to_clob(''''||
                            (
                                SELECT json_arrayagg(
                                    JSON_OBJECT( 
                                         KEY ''hdgcodigo'' VALUE RBOD.HDGCODIGO
                                        ,KEY ''esacodigo'' VALUE RBOD.ESACODIGO
                                        ,KEY ''cmecodigo'' VALUE RBOD.CMECODIGO
                                        ,KEY ''codbodegaorigen'' VALUE RBOD.FBOD_CODIGO_SOLICITA
                                        ,KEY ''codbodegarelacion'' VALUE RBOD.FBOD_CODIGO_ENTREGA
                                        ,KEY ''tiporelacion'' VALUE RBOD.MEIN_TIPOREG
                                        ,KEY ''nombodega'' VALUE (SELECT NVL(FBOD_DESCRIPCION, '' '') FROM CLIN_FAR_BODEGAS WHERE
                                                    FBOD_ESTADO = ''S''
                                                AND FBOD_CODIGO = RBOD.FBOD_CODIGO_SOLICITA
                                                AND CLIN_FAR_BODEGAS.HDGCODIGO = RBOD.HDGCODIGO
                                                AND CLIN_FAR_BODEGAS.CMECODIGO = RBOD.CMECODIGO
                                            ) 
                                        ,KEY ''glosatiporelacion'' VALUE NVL(PRMRELACION.FPAR_DESCRIPCION, '' '')
                                        ,KEY ''servidor'' VALUE ''DESARROLLO''
                                        ,KEY ''usuario'' VALUE TUSE.FLD_USERCODE
                                        ) RETURNING CLOB
                                    ) 
                                FROM
                                    CLIN_FAR_RELACIONBODEGAS RBOD
                                    , CLIN_FAR_PARAM PRMRELACION
                                WHERE
                                        RBOD.FBOD_CODIGO_ENTREGA = BOD.FBOD_CODIGO
                                    AND RBOD.MEIN_TIPOREG = 1
                                    AND PRMRELACION.FPAR_TIPO = 63 AND PRMRELACION.FPAR_CODIGO = RBOD.MEIN_TIPOREG
                            )
                        ||'''')
                        format json
                        ,''productosdemanda'' value to_clob(''''||
                            (
                                SELECT json_arrayagg(
                                    JSON_OBJECT(  
                                         KEY ''codmei'' VALUE  MEIN.MEIN_CODMEI
                                        ,KEY ''meindescri'' VALUE  MEIN.MEIN_DESCRI
                                        ,KEY ''cum'' VALUE MEIN.MEIN_CODIGO_CUM    
                                        ,KEY ''stock'' VALUE INV.FBOI_STOCK_ACTUAL
                                        ,KEY ''stockmax'' VALUE INV.FBOI_STOCK_MAXIMO
                                        ,KEY ''stockmin'' VALUE INV.FBOI_STOCK_MINIMO
                                        ,KEY ''stockcritico'' VALUE FBOI_STOCRI
                                        ,KEY ''nivelreposicion'' VALUE INV.FBOI_NIVEL_REPOSICION
                                    ) RETURNING CLOB
                                    )
                                    FROM CLIN_FAR_BODEGAS_INV INV ,CLIN_FAR_MAMEIN MEIN
                                    WHERE MEIN.MEIN_ID = INV.FBOI_MEIN_ID 
                                      AND INV.FBOI_FBOD_CODIGO = BOD.FBOD_CODIGO
                                      AND MEIN.HDGCODIGO = BOD.HDGCODIGO
                            )
                        ||'''')
                        format json
                        returning clob
                        )
                        returning clob
                        ),
                    to_clob(''[]'')
                ) AS json_out 
            FROM CLIN_FAR_BODEGAS BOD
               , TBL_USER TUSE
               , CLIN_FAR_BODEGAS_USUARIO BUSA
               , CLIN_FAR_PARAM PARTB
               , CLIN_FAR_PARAM PARTP
               , CLIN_FAR_ROLES_USUARIOS RUSA
            WHERE BOD.HDGCODIGO = ' || IN_HDGCODIGO ||
            ' AND BOD.ESACODIGO = ' || IN_ESACODIGO ||
            ' AND BOD.CMECODIGO = ' || IN_CMECODIGO ||
            ' AND BUSA.HDGCODIGO = BOD.HDGCODIGO ' ||
            ' AND BUSA.ESACODIGO = BOD.ESACODIGO ' ||
            ' AND BUSA.CMECODIGO = BOD.CMECODIGO ' ||
            ' AND PARTB.FPAR_HDGCODIGO = BOD.HDGCODIGO ' ||
            ' AND PARTB.FPAR_ESACODIGO = BOD.ESACODIGO ' ||
            ' AND PARTB.FPAR_CMECODIGO = BOD.CMECODIGO ' ||
            ' AND PARTP.FPAR_HDGCODIGO = BOD.HDGCODIGO ' ||
            ' AND PARTP.FPAR_ESACODIGO = BOD.ESACODIGO ' ||
            ' AND PARTP.FPAR_CMECODIGO = BOD.CMECODIGO ' ||
            ' AND RUSA.HDGCODIGO = BOD.HDGCODIGO ' ||
            ' AND RUSA.ESACODIGO = BOD.ESACODIGO ' ||
            ' AND RUSA.CMECODIGO = BOD.CMECODIGO ';
            IF IN_CODBODEGA <> 0 THEN
                sql_str := sql_str || ' AND BOD.FBOD_CODIGO = ' || IN_CODBODEGA;
            END IF;
            IF IN_FBOCODIGOBODEGA IS NOT NULL THEN
                sql_str := sql_str || ' AND BOD.FBO_CODIGOBODEGA = ''' || IN_FBOCODIGOBODEGA || '''';
            END IF;
            IF IN_DESBODEGA IS NOT NULL THEN
                sql_str :=  sql_str || ' AND BOD.FBOD_DESCRIPCION like ''%' || IN_DESBODEGA || '%''';
            END IF;
            IF IN_ESTADO IS NOT NULL THEN
                sql_str :=  sql_str || ' AND BOD.FBOD_ESTADO = ' || IN_ESTADO;
            END IF;
            IF IN_TIPOPRODUCTO IS NOT NULL THEN
                sql_str :=  sql_str || ' AND BOD.FBOD_TIPOPRODUCTO = ' || IN_TIPOPRODUCTO;
            END IF;
            IF IN_TIPOBODEGA IS NOT NULL THEN
                sql_str :=  sql_str || ' AND FBOD_TIPO_BODEGA = ' || IN_TIPOBODEGA;
            END IF;
            IF IN_USUARIO IS NOT NULL THEN
                sql_str := sql_str || ' AND UPPER(TUSE.FLD_USERCODE) = UPPER(''' || IN_USUARIO || ''')';
            END IF;
            sql_str := sql_str ||
            ' AND BOD.FBOD_TIPO_BODEGA <> ''O'' ' ||
            ' AND BUSA.FBOU_FLD_USERID = TUSE.FLD_USERID ' ||
            ' AND BUSA.FBOU_FBOD_CODIGO = BOD.FBOD_CODIGO ' ||
            ' AND RUSA.ID_USUARIO = TUSE.FLD_USERID ' ||
            ' AND PARTB.FPAR_TIPO = 51 AND PARTB.FPAR_VALOR = BOD.FBOD_TIPO_BODEGA ' ||
            ' AND PARTP.FPAR_TIPO = 27 AND PARTP.FPAR_VALOR = BOD.FBOD_TIPOPRODUCTO ' ||
            ' AND RUSA.ID_ROL = 0';
            NTRACELOG_PKG.GRABA_LOG( --FEDERADORERRORLOG
                'PKG_BODEGA', -- VARCHAR(1000) NOMBREPCK
                ' LINEA 470 ', -- MSGERROR
                sql_str, -- VARCHAR(500) -- DESCRIPCION
                NULL -- CLOB XMLENVIADO
            );
            OPEN c_cursor FOR sql_str;
            FETCH c_cursor INTO Out_Json;
            CLOSE c_cursor;
            NTRACELOG_PKG.GRABA_LOG( --FEDERADORERRORLOG
                'PKG_BODEGA', -- VARCHAR(1000) NOMBREPCK
                ' LINEA 480 ', -- MSGERROR
                sql_str, -- VARCHAR(500) -- DESCRIPCION
                Out_Json -- CLOB XMLENVIADO
            );
        EXCEPTION
            WHEN VALUE_ERROR THEN
                SRV_MESSAGE := 'Error de valor: ' || SQLERRM;
                    NTRACELOG_PKG.GRABA_LOG( --FEDERADORERRORLOG
                    'PKG_BODEGA', -- VARCHAR(1000) NOMBREPCK
                    ' LINEA 486 ', -- MSGERROR
                    SRV_MESSAGE, -- VARCHAR(500) -- DESCRIPCION
                    Out_Json -- CLOB XMLENVIADO
                );
                GOTO PSUB_LISTA_ESTRUCTURA_EXIT;
            WHEN OTHERS THEN
                SRV_MESSAGE := 'Error inesperado: ' || SQLERRM;
                SRV_MESSAGE := 'Error de valor: ' || SQLERRM;
                    NTRACELOG_PKG.GRABA_LOG( --FEDERADORERRORLOG
                    'PKG_BODEGA', -- VARCHAR(1000) NOMBREPCK
                    ' LINEA 500 ', -- MSGERROR
                    SRV_MESSAGE, -- VARCHAR(500) -- DESCRIPCION
                    Out_Json -- CLOB XMLENVIADO
                );
                GOTO PSUB_LISTA_ESTRUCTURA_EXIT;
        END;
    <<PSUB_LISTA_ESTRUCTURA_EXIT>> NULL;
    END P_LISTA_ESTRUCTURA_BODEGA;
END PKG_BODEGA;