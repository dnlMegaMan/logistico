export interface InformacionGeneral {
  versionAngular: string;
  versionGo: string;
  redirigirCaidaGO: 'SI' | 'NO';
  sistemaEnMantencion: 'SI' | 'NO';
}

/**
 * 
 * @param info Información general obtenida desde el servidor
 * @param versionGo Versión del GO que se quiere probar, del `environment.ts`
 * @param versionAngular Versión del Angular que se quiere probar, del `environment.ts`
 * @returns `true` si ambas versiones coinciden, `false` de lo contrario.
 */
export function versionesCoinciden(
  info: InformacionGeneral,
  versionGo: string,
  versionAngular: string,
) {
  return info.versionGo.endsWith(versionGo) && info.versionAngular.endsWith(versionAngular);
}

export function sistemaEnMantencion(info: InformacionGeneral) {
  return info && info.sistemaEnMantencion && info.sistemaEnMantencion === 'SI'
}

export function redirigirEnCaidaDelServidor(info: InformacionGeneral | null | undefined) {
  return info && info.redirigirCaidaGO && info.redirigirCaidaGO === 'SI';
}
