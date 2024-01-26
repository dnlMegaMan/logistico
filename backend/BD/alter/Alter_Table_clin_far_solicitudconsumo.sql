Alter Table clin_far_solicitudconsumo
add PFBOD_CODIGO Number(8) Default( 0 ) Null Check( PFBOD_CODIGO >= 0 );