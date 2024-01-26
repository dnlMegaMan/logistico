create or replace PACKAGE PKG_PEDIDO_SUGERIDO as
    PROCEDURE P_GUARDAR_PEDIDO_SUGERIDO(
         SRV_Message In Out Varchar2  /*  Parametro de uso interno  */ 
        ,In_Json     IN Varchar2
    );
    PROCEDURE P_LISTA_PEDIDO_SUGERIDO(
         SRV_Message       In  Out     Varchar2                        /*  Parametro de uso interno  */ 
        ,In_Json     IN Varchar2
        ,Out_Json IN OUT CLOB
    );
    PROCEDURE P_GUARDAR_PROGRAMACION_GUIA_PEDIDO(
         SRV_Message In Out Varchar2  /*  Parametro de uso interno  */ 
        ,In_Json     IN Varchar2
    );
    PROCEDURE P_LISTAR_PROGRAMACION_GUIA_PEDIDO(
         SRV_Message       In  Out     Varchar2                        /*  Parametro de uso interno  */ 
        ,In_Json     IN Varchar2
        ,Out_Json IN OUT CLOB
    );
END PKG_PEDIDO_SUGERIDO;
/
create or replace PACKAGE BODY PKG_PEDIDO_SUGERIDO AS
	PROCEDURE P_GUARDAR_PEDIDO_SUGERIDO(
         SRV_Message In  Out Varchar2 /*  Parametro de uso interno  */ 
        ,In_Json     IN Varchar2
    ) AS 
    BEGIN
    SRV_Message := '1000000';
		DECLARE 
			V_PSUG_ID CLIN_FAR_PEDIDO_SUGERIDO.PSUG_ID%TYPE DEFAULT(0);
		BEGIN
            NTRACELOG_PKG.GRABA_LOG( --FEDERADORERRORLOG
                'PKG_PEDIDO_SUGERIDO', -- VARCHAR(1000) NOMBREPCK
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
                                'PKG_PEDIDO_SUGERIDO', -- VARCHAR(1000) NOMBREPCK
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
    END P_GUARDAR_PEDIDO_SUGERIDO;
    PROCEDURE P_LISTA_PEDIDO_SUGERIDO(
         SRV_Message       In  Out     Varchar2                        /*  Parametro de uso interno  */ 
        ,In_Json     IN Varchar2
        ,Out_Json IN OUT CLOB
    ) AS 
    SRV_QUERY VARCHAR2(10000);
    BEGIN
    NTRACELOG_PKG.GRABA_LOG( --FEDERADORERRORLOG
        'PKG_PEDIDO_SUGERIDO', -- VARCHAR(1000) NOMBREPCK
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
                    'PKG_PEDIDO_SUGERIDO', -- VARCHAR(1000) NOMBREPCK
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
                'PKG_PEDIDO_SUGERIDO', -- VARCHAR(1000) NOMBREPCK
                ' LINEA 170 ', -- MSGERROR
                '  SRV_MESSAGE : ' || SRV_Message ||               
                '| In_Json     : ' || In_Json ||
                '| Out_Json     : ' || Out_Json, -- VARCHAR(500) -- DESCRIPCION
               NULL -- CLOB XMLENVIADO
            );
        END;
    <<PSUB_LISTA_EXIT>> NULL;
    END P_LISTA_PEDIDO_SUGERIDO;
	PROCEDURE P_GUARDAR_PROGRAMACION_GUIA_PEDIDO(
         SRV_Message In  Out Varchar2 /*  Parametro de uso interno  */ 
        ,In_Json     IN Varchar2
    ) AS 
    BEGIN
    SRV_Message := '1000000';
		DECLARE 
            VALIDA NUMBER DEFAULT(0);
			V_PROG_ID CLIN_FAR_PROGRAMACION_GUIA_PEDIDO.PROG_ID%TYPE DEFAULT(0);
		BEGIN
            NTRACELOG_PKG.GRABA_LOG( --FEDERADORERRORLOG
                'PKG_PEDIDO_SUGERIDO', -- VARCHAR(1000) NOMBREPCK
                ' LINEA 17 ', -- MSGERROR
                '  SRV_MESSAGE : ' || SRV_Message ||               
                '| In_Json     : ' || In_Json, -- VARCHAR(500) -- DESCRIPCION
               NULL -- CLOB XMLENVIADO
            );
            FOR VJSON IN(with json as ( select In_Json doc from   dual )  
                SELECT 
                    PROG_HDGCODIGO 
                    ,PROG_ESACODIGO 
                    ,PROG_CMECODIGO 
                    ,PROG_DIA
                FROM  json_table( (select doc from json) , '$[*]' 
                COLUMNS (
                     PROG_HDGCODIGO  PATH '$.proghdgcodigo'
                    ,PROG_ESACODIGO  PATH '$.progesacodigo'
                    ,PROG_CMECODIGO  PATH '$.progcmecodigo'
                    ,PROG_DIA        PATH '$.progdia'
                ))
           )LOOP
                BEGIN
                    SELECT MAX(PROG_ID) INTO V_PROG_ID FROM CLIN_FAR_PROGRAMACION_GUIA_PEDIDO
                    WHERE PROG_HDGCODIGO = VJSON.PROG_HDGCODIGO
                      AND PROG_ESACODIGO = VJSON.PROG_ESACODIGO
                      AND PROG_CMECODIGO = VJSON.PROG_CMECODIGO
                      AND PROG_DIA = VJSON.PROG_DIA;
                    IF V_PROG_ID IS NULL THEN
                        V_PROG_ID := 0;
                    END IF;
                    IF V_PROG_ID > 0 THEN
                      DELETE CLIN_FAR_PROGRAMACION_GUIA_PEDIDO WHERE PROG_HDGCODIGO = VJSON.PROG_HDGCODIGO
                      AND PROG_ESACODIGO = VJSON.PROG_ESACODIGO
                      AND PROG_CMECODIGO = VJSON.PROG_CMECODIGO
                      AND PROG_DIA = VJSON.PROG_DIA;
                    END IF;
                END;
           END LOOP;
            FOR VJSON IN(with json as ( select In_Json doc from   dual )  
                	SELECT 
                     PROG_HDGCODIGO 
					,PROG_ESACODIGO 
					,PROG_CMECODIGO 
					,PROG_ID        
					,PROG_DIA       
					,PROG_DIAGLOSA  
					,PROG_PRODVALOR 
					,PROG_PRODCODIGO
					,PROG_PRODDESC  
                FROM  json_table( (select doc from json) , '$[*]' 
                    COLUMNS (
                             PROG_HDGCODIGO  PATH '$.proghdgcodigo'
							,PROG_ESACODIGO  PATH '$.progesacodigo'
							,PROG_CMECODIGO  PATH '$.progcmecodigo'
							,PROG_ID         PATH '$.progid'
							,PROG_DIA        PATH '$.progdia'
							,PROG_DIAGLOSA   PATH '$.progdiaglosa'
							,PROG_PRODVALOR  PATH '$.progprodvalor'
							,PROG_PRODCODIGO PATH '$.progprodcodigo'
							,PROG_PRODDESC   PATH '$.progproddesc'
                            )  
               )
           )LOOP
                BEGIN
                    INSERT INTO CLIN_FAR_PROGRAMACION_GUIA_PEDIDO (
                         PROG_ID
                        ,PROG_HDGCODIGO
                        ,PROG_ESACODIGO
                        ,PROG_CMECODIGO
                        ,PROG_DIA
                        ,PROG_DIAGLOSA
                        ,PROG_PRODVALOR
                        ,PROG_PRODCODIGO
                        ,PROG_PRODDESC
                    ) VALUES (
                          PROGRAMACION_GUIA_PEDIDO_SEQ.NEXTVAL
                        , VJSON.PROG_HDGCODIGO
                        , VJSON.PROG_ESACODIGO
                        , VJSON.PROG_CMECODIGO
                        , VJSON.PROG_DIA
                        , VJSON.PROG_DIAGLOSA
                        , VJSON.PROG_PRODVALOR
                        , VJSON.PROG_PRODCODIGO
                        , VJSON.PROG_PRODDESC
                    );  
                EXCEPTION WHEN OTHERS THEN
                    SRV_MESSAGE := '078000'
                                   || ' NO SE PUDO INGRESAR PARAMETRO DE PEDIDO SUGERIDO.'
                                   || SQLERRM;
                    BEGIN
                        NTRACELOG_PKG.GRABA_LOG( --FEDERADORERRORLOG
                            'PKG_PEDIDO_SUGERIDO', -- VARCHAR(1000) NOMBREPCK
                            ' LINEA 73 ', -- MSGERROR
                            '  SRV_MESSAGE : ' || SRV_Message ||               
                            '| In_Json     : ' || In_Json, -- VARCHAR(500) -- DESCRIPCION
                           NULL -- CLOB XMLENVIADO
                        );
                    END;
                    GOTO PSUB_GUARDAR_PROG_EXIT;
                END;
            END LOOP;
        END;
    <<PSUB_GUARDAR_PROG_EXIT>> NULL;
    END P_GUARDAR_PROGRAMACION_GUIA_PEDIDO;
    PROCEDURE P_LISTAR_PROGRAMACION_GUIA_PEDIDO(
         SRV_Message       In  Out     Varchar2                        /*  Parametro de uso interno  */ 
        ,In_Json     IN Varchar2
        ,Out_Json IN OUT CLOB
    ) AS 
    SRV_QUERY VARCHAR2(10000);
    BEGIN
    NTRACELOG_PKG.GRABA_LOG( --FEDERADORERRORLOG
        'PKG_PEDIDO_SUGERIDO', -- VARCHAR(1000) NOMBREPCK
        ' LINEA 110 ', -- MSGERROR
        '  SRV_MESSAGE : ' || SRV_Message ||               
        '| In_Json     : ' || In_Json, -- VARCHAR(500) -- DESCRIPCION
       NULL -- CLOB XMLENVIADO
    );
    SRV_Message := '1000000';    
		DECLARE 
			V_PSUG_ID             CLIN_FAR_PEDIDO_SUGERIDO.PSUG_ID%TYPE;
            IN_PSUG_HDGCODIGO     CLIN_FAR_PEDIDO_SUGERIDO.PSUG_HDGCODIGO%TYPE;
            IN_PSUG_ESACODIGO     CLIN_FAR_PEDIDO_SUGERIDO.PSUG_ESACODIGO%TYPE;
            IN_PSUG_CMECODIGO     CLIN_FAR_PEDIDO_SUGERIDO.PSUG_CMECODIGO%TYPE;
		BEGIN
            SELECT JSON_VALUE(In_Json, '$.psughdgcodigo') AS IN_PSUG_HDGCODIGO INTO IN_PSUG_HDGCODIGO FROM DUAL;
            SELECT JSON_VALUE(In_Json, '$.psugesacodigo') AS IN_PSUG_ESACODIGO INTO IN_PSUG_ESACODIGO FROM DUAL;
            SELECT JSON_VALUE(In_Json, '$.psugcmecodigo') AS IN_PSUG_CMECODIGO INTO IN_PSUG_CMECODIGO FROM DUAL;

            SELECT MAX(PROG_ID) INTO V_PSUG_ID FROM CLIN_FAR_PROGRAMACION_GUIA_PEDIDO 
            WHERE PROG_HDGCODIGO = IN_PSUG_HDGCODIGO
              AND PROG_ESACODIGO = IN_PSUG_ESACODIGO
              AND PROG_CMECODIGO = IN_PSUG_CMECODIGO;
            IF V_PSUG_ID IS NULL THEN
                NTRACELOG_PKG.GRABA_LOG( --FEDERADORERRORLOG
                    'PKG_PEDIDO_SUGERIDO', -- VARCHAR(1000) NOMBREPCK
                    ' LINEA 136 ', -- MSGERROR
                    '  SRV_MESSAGE : ' || SRV_Message ||               
                    '| In_Json     : ' || In_Json ||
                    '| V_PSUG_ID     : ' || V_PSUG_ID ||
                    '| IN_PSUG_HDGCODIGO     : ' || IN_PSUG_HDGCODIGO ||
                    '| IN_PSUG_ESACODIGO     : ' || IN_PSUG_ESACODIGO ||
                    '| IN_PSUG_CMECODIGO     : ' || IN_PSUG_CMECODIGO, -- VARCHAR(500) -- DESCRIPCION
                   NULL -- CLOB XMLENVIADO
                );
                GOTO PSUB_LISTA_PROG_EXIT;
            END IF;
            BEGIN
                SELECT json_arrayagg(
                    JSON_OBJECT(  
                          'psughdgcodigo'	IS PROG_HDGCODIGO
                        , 'psugesacodigo'	IS PROG_ESACODIGO
                        , 'psugcmecodigo'	IS PROG_CMECODIGO
                        , 'psugfbodcodigo'	IS PROG_DIA
                        , 'progdiaglosa' 	IS PROG_DIAGLOSA
                        , 'tipoproductos' 	IS TIPO_PRODUCTOS
                        ) RETURNING CLOB
                    ) AS RESP_JSON into Out_Json
                FROM(
                    SELECT 
                         PROG_HDGCODIGO
                        ,PROG_ESACODIGO
                        ,PROG_CMECODIGO
                        ,PROG_DIA
                        ,PROG_DIAGLOSA
                        ,LISTAGG (to_char('0' || PROG_PRODCODIGO), '-') WITHIN GROUP (ORDER BY PROG_DIAGLOSA) TIPO_PRODUCTOS
                    FROM CLIN_FAR_PROGRAMACION_GUIA_PEDIDO 
                    WHERE PROG_HDGCODIGO = IN_PSUG_HDGCODIGO
                      AND PROG_ESACODIGO = IN_PSUG_ESACODIGO
                      AND PROG_CMECODIGO = IN_PSUG_CMECODIGO
                    GROUP BY PROG_HDGCODIGO
                    ,PROG_ESACODIGO
                    ,PROG_CMECODIGO
                    ,PROG_DIA
                    ,PROG_DIAGLOSA
                );
            END;
            NTRACELOG_PKG.GRABA_LOG( --FEDERADORERRORLOG
                'PKG_PEDIDO_SUGERIDO', -- VARCHAR(1000) NOMBREPCK
                ' LINEA 170 ', -- MSGERROR
                '  SRV_MESSAGE : ' || SRV_Message ||               
                '| In_Json     : ' || In_Json ||
                '| Out_Json     : ' || Out_Json, -- VARCHAR(500) -- DESCRIPCION
               NULL -- CLOB XMLENVIADO
            );
        END;
    <<PSUB_LISTA_PROG_EXIT>> NULL;
    END P_LISTAR_PROGRAMACION_GUIA_PEDIDO;
END PKG_PEDIDO_SUGERIDO;
/