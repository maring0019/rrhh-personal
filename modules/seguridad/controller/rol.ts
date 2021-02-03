import BaseController from "../../../core/app/basecontroller";
import { Usuario } from "../../../auth/schemas/Usuarios";

class RolController extends BaseController {

    async update(req, res, next) {
		try {
			let object: any = await this.getObject(req.params.id);
			if (!object)
				return res
					.status(404)
					.send({ message: this.getMessageNotFound() });
            
            
            const rolChanges = req.body;
            const usuariosChanges = await this.updateUsuariosPerms(object, rolChanges);
            
            // 1. Aplicamos los cambios sobre el rol
            object = this.prepareObjectAudit(object, rolChanges);
            await object.updateOne(object);
            // 2. Aplicamos los cambios sobre los usuarios
            for (const user of usuariosChanges) {
                await user.updateOne(user);
            }
            return res.json(await this.getObject(req.params.id));
		} catch (err) {
			return next(err);
		}
    }
    
    /**
     * Helper method.
     * Actualiza los permisos de los usuarios que tienen asignado el rol
     * identificado por 'new_rol'. Basicamente quita los viejos permisos
     * del rol y agrega los nuevos.
     * Retornamos una lista de usuarios con sus permisos actualizados. No
     * se persiste ningun cambio aca.
     * @param oldRol antiguo rol con permisos originales
     * @param newRol nuevo rol editado con los permisos actualizados
     */
    async updateUsuariosPerms(oldRol, newRol ){
        let usuariosToUpdate:any = await Usuario.find({ roles: newRol.codename });
        for (const user of usuariosToUpdate) {
            let permisos = [...user.permisos]; 
            // Remove all perms attached to user identified by oldRol definition
            permisos = permisos.filter( x => !oldRol.permisos.filter( y => y === x).length)
            // Add new perms
            user.permisos = permisos.concat(newRol.permisos);
            }
        return usuariosToUpdate;
    }
}

export default RolController;
