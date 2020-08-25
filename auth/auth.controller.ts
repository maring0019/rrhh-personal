import { Usuario } from "./schemas/Usuarios";


export async function findUser(username) {
    return await Usuario.findOne({ usuario: username });
}

export async function updateUser(documento, nombre, apellido, password) {
    const user = await Usuario.findOne({ usuario: ''+documento });
    if (user) await user.updateOne({
        $set: {
            password: password,
            nombre: nombre,
            apellido: apellido,
            lastLogin: timestamp()  
        }
    })
}

/**
 * Temporal fix. Update usernames from number to string
 */
export async function updateUsernames(){
    const users = await Usuario.find({});
    for (const user of users) {
        await user.updateOne({ $set: { usuario: ''+user.usuario } });
    }
}

function timestamp(){
    const f = new Date();
    return new Date(Date.UTC(f.getFullYear(),f.getMonth(),f.getDate(),f.getHours(),f.getMinutes()));
  }
  