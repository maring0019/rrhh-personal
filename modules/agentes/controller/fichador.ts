const sql = require('mssql');
import { SQLServerAnvizCon, SQLServerHospitalCon } from '../../../connections';


async function findUsuario(userID) {
    const sqlConn = await SQLServerAnvizCon.connection;
    const result = await sqlConn
        .request()
        .input('user_id', userID)
        .query(`SELECT * FROM Userinfo WHERE Userid = @user_id`);

    if (result.recordset && result.recordset.length) { return result.recordset[0]; }
}

async function addUsuario(agente) {
    const sqlConn = await SQLServerAnvizCon.connection;
    await sqlConn
        .request()
        .input('user_id', agente.idLegacy)
        .input('user_code', agente.idLegacy)
        .input('user_name', `${agente.apellido}, ${agente.nombre}`)
        .input('dept_id', sql.Int, 7)
        .query(
            `INSERT INTO Userinfo (Userid, UserCode, Name, Deptid)
            VALUES (@user_id, @user_code, @user_name, @dept_id)`
        );
}

async function inhabilitaUsuario(userID) {
    return await fichadorUpdateUsuarioStatus(userID, 6);
}

async function habilitaUsuario(agente) {

    const sqlConn = await SQLServerHospitalCon.connection;
    await sqlConn
        .request()
        .input('id', agente.idLegacy)
        .input('codigoFichado', agente.codigoFichado)
        .query(
            `UPDATE Personal_Agentes set codigoFichado = @codigoFichado where id = @id`
        );
    // return await fichadorUpdateUsuarioStatus(agente.idLegacy, 7);
}

async function bajaUsuario(agente) {

    const sqlConn = await SQLServerHospitalCon.connection;
    await sqlConn
        .request()
        .input('id', agente.idLegacy)
        .query(
            `UPDATE Personal_Agentes set activo = 0 where id = @id`
        );
}

async function fichadorUpdateUsuarioStatus(userID, newStatus) {
    const sqlConn = await SQLServerAnvizCon.connection;
    // prettier-ignore
    await sqlConn.request()
        .input('user_id', sql.Int, userID)
        .input('new_status', sql.Int, newStatus)
        .query(`UPDATE Userinfo
                SET Deptid = @new_status
                WHERE Userid = @user_id`);
}


/**
 * Inserta un agente en el SQL Server del sistema Legacy
 * @param agente
 */
async function insertAgente(agente) {
    const sqlConn = await SQLServerHospitalCon.connection;
    const resultado = await sqlConn
        .request()
        .input('numero', agente.numero)
        .input('documento', agente.documento)
        .input('apellido', agente.apellido)
        .input('nombre', agente.nombre)
        .query(
            `INSERT INTO Personal_Agentes (Numero, Documento, Apellido, Nombre)
            VALUES (@numero, @documento, @apellido, @nombre); SELECT SCOPE_IDENTITY() AS id;`
        );

    if (resultado.recordset && resultado.recordset[0]) {
        return resultado.recordset[0].id;
    }
    return null;
}

export const fichador = {
    habilitaUsuario,
    inhabilitaUsuario,
    addUsuario,
    findUsuario,
    insertAgente,
    bajaUsuario,
    fichadorUpdateUsuarioStatus
};
