import { Usuario } from "./schemas/Usuarios";


export async function findUser(username) {
    return await Usuario.findOne({ usuario: username });
}

export async function updateUser(documento, nombre, apellido, password) {
    const user = await Usuario.findOne({ usuario: documento });
    if (user) await user.updateOne({
        $set: {
            password: password,
            nombre: nombre,
            apellido: apellido,
            lastLogin: timestamp()  
        }
    })
}

function timestamp(){
    const f = new Date();
    return new Date(Date.UTC(f.getFullYear(),f.getMonth(),f.getDate(),f.getHours(),f.getMinutes()));
  }
  