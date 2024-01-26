export interface MensajeAlerta {
  titulo: string;
  mensaje: string;
  nivel?: 'warning' | 'error' | 'success' | 'info' | 'question';
}
