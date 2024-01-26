BEGIN
    FOR BOD IN (
        SELECT
             HDGCODIGO
            ,ESACODIGO
            ,CMECODIGO
            ,FBOD_CODIGO
        FROM
            CLIN_FAR_BODEGAS
        WHERE 
                ESACODIGO = 2
            AND FBOD_CODIGO = 66
    ) LOOP
        BEGIN
            BEGIN
                DELETE TMP_CIERRE_KARDEX_MATCH;COMMIT;
            END;
            BEGIN
                FOR C IN (
                    SELECT 
                        12112541134 AS IN_IDREPORT
                        , BOD.HDGCODIGO AS IN_HDGCODIGO
                        , BOD.ESACODIGO AS IN_ESACODIGO
                        , BOD.CMECODIGO AS IN_CMECODIGO
                        , 'LOGISTICO' AS IN_USUARIO
                        , 0 AS IN_CKARID
                        , BOD.FBOD_CODIGO AS IN_CODBODEGA
                        , INV.FBOI_MEIN_ID AS IN_MEINID
                    FROM
                        CLIN_FAR_BODEGAS_INV INV
                    WHERE
                        INV.FBOI_FBOD_CODIGO = BOD.FBOD_CODIGO
                )LOOP
                    BEGIN
                        PKG_TMP_CONSULTACIERREKARDEX.PRO_TMP_CONSULTACIERREKARDEX  
                        ( C.IN_IDREPORT
                        ,C.IN_HDGCODIGO
                        ,C.IN_ESACODIGO
                        ,C.IN_CMECODIGO
                        ,C.IN_USUARIO
                        ,C.IN_CKARID
                        ,C.IN_CODBODEGA
                        ,C.IN_MEINID);
                    END;
                END LOOP;
            END;
            BEGIN 
                UPDATE CLIN_FAR_BODEGAS_INV SET FBOI_STOCK_ACTUAL = (SELECT NVL(MAX(KADE2_STOCK_KARDEX), 0) FROM TMP_CIERRE_KARDEX_MATCH WHERE KADE2_MEIN_ID = FBOI_MEIN_ID AND KADE2_FBOD_CODIGO = FBOI_FBOD_CODIGO)
                WHERE 
                FBOI_FBOD_CODIGO = BOD.FBOD_CODIGO;COMMIT;
            END;
        END;                
    END LOOP;    
END;