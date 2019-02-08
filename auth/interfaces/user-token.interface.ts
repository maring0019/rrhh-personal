import { Token } from './token.interface';

export interface UserToken extends Token {
    usuario: {
        id: string,
        nombre: string,
        apellido: string,
        documento: string
    };
}
