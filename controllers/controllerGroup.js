const conn = require("../config/db.js");

// Ruta para crear un grupo
exports.createGroup = async (req, res) => {
    try {
        const { grupo, descripcion, nombre} = req.body;

        const {idUsuario} = req.query;
        // Verificar si el nombre del grupo ya existe en la base de datos
        const checkGroupQuery = "SELECT * FROM grupos WHERE grupo = ?";
        const existingGroup = await queryAsync(checkGroupQuery, [grupo]);

        if (existingGroup.length > 0) {
            return res.status(400).json({ error: "El nombre del grupo ya está en uso" });
        }

        // Iniciar transacción para asegurar la creación atómica del grupo y su chat asociado
        conn.beginTransaction(async (err) => {
            if (err) {
                return res.status(500).json({ error: "Error al iniciar la transacción" });
            }

            try {
                // Insertar el grupo en la base de datos
                const insertGroupQuery = "INSERT INTO grupos (id_usuario, grupo, usuario ,descripcion) VALUES (?, ?, ?)";
                const groupResult = await queryAsync(insertGroupQuery, [idUsuario, grupo, descripcion]);
                const idGrupo = groupResult.insertId;

                // Crear el chat asociado al grupo en la tabla Chat
                const insertChatQuery = "INSERT INTO chat (id_grupo, id_usuario,nombre_usuario) VALUES (?,?, ?)";
                await queryAsync(insertChatQuery, [idGrupo,idUsuario,nombre]);

                // Añadir al creador al grupo si no está en él
                const checkIfCreatorInGroupQuery = "SELECT * FROM usuariosgrupos WHERE usuario_id = ? AND grupo_id = ?";
                const creatorInGroupResults = await queryAsync(checkIfCreatorInGroupQuery, [idUsuario, idGrupo]);

                if (creatorInGroupResults.length === 0) {
                    const insertCreatorQuery = "INSERT INTO usuariosgrupos (usuario_id, grupo_id) VALUES (?, ?)";
                    await queryAsync(insertCreatorQuery, [idUsuario, idGrupo]);
                }

                // Confirmar la transacción
                conn.commit((error) => {
                    if (error) {
                        conn.rollback(() => {
                            return res.status(500).json({ error: "Error al confirmar la transacción" });
                        });
                    }

                    res.status(200).json({ message: "Grupo creado y chat asociado correctamente" });
                });
            } catch (error) {
                conn.rollback(() => {
                    res.status(500).json({ error: error.message });
                });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.addMember = async (req, res) => {
    try {
        const { id_creador, id_usuario, id_grupo } = req.query;
        console.log(req.query)
        // Verificar si el usuario ya está en el grupo
        const checkUserGroupQuery = "SELECT * FROM usuariosgrupos WHERE usuario_id = ? AND grupo_id = ?";
        const userGroupResults = await queryAsync(checkUserGroupQuery, [id_usuario, id_grupo]);

        if (userGroupResults.length > 0) {
            return res.status(400).json({ error: "El usuario ya está en este grupo" });
        }

        // Consultar si el usuario que hace la solicitud es el creador del grupo
        const checkCreatorQuery = "SELECT id_creador FROM grupos WHERE id = ?";
        const creatorResults = await queryAsync(checkCreatorQuery, [id_grupo]);

        if (creatorResults.length > 0) {
            const idUsuarioCreador = creatorResults[0].id_creador;

            if (idUsuarioCreador != Number(id_creador)) {
                return res.status(403).json({ error: 'No tienes permisos para añadir usuarios a este grupo.' });
            }
        }

        // Añadir usuario al grupo en la base de datos
        const insertUserQuery = "INSERT INTO usuariosgrupos (usuario_id, grupo_id) VALUES (?, ?)";
        await queryAsync(insertUserQuery, [id_usuario, id_grupo]);

        res.json({ message: 'Usuario añadido al grupo correctamente.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Función para realizar consultas a la base de datos de manera asíncrona
function queryAsync(query, values) {
    return new Promise((resolve, reject) => {
        conn.query(query, values, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

exports.getUserGroups = async (req, res) => {
    try {
        const { id_usuario } = req.query;

        // Consulta para obtener los grupos a los que pertenece el usuario y contar los miembros
        const userGroupsQuery = `
        SELECT COUNT(DISTINCT grupo_id) AS total_grupos
        FROM usuariosgrupos
        WHERE usuario_id = ?
        `;

        conn.query(userGroupsQuery, [id_usuario], (error, results) => {
            if (error) {
                return res.status(500).json({ error: "Error al obtener los grupos del usuario" });
            }

            res.json({ total_groups: results[0].total_grupos });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUsersByCareer = async (req, res) => {
    try {
        const { id_carrera } = req.query;

        const getUsersByCareerQuery = `
            SELECT nombre, apellidos
            FROM usuarios
            WHERE carrera = ?;
        `;

        const usersByCareer = await queryAsync(getUsersByCareerQuery, [id_carrera]);

        res.status(200).json({ users: usersByCareer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.deleteUserGroup= async (req, res) => {
    try {
        const { id_usuario, id_grupo } = req.query;

        // Verificar si el usuario está en el grupo
        const existsQuery = `
            SELECT *
            FROM usuariosgrupos
            WHERE usuario_id = ? AND grupo_id = ?
        `;

        conn.query(existsQuery, [id_usuario, id_grupo], (error, results) => {
            if (error) {
                return res.status(500).json({ error: "Error al verificar la existencia del usuario en el grupo" });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: "El usuario no está en este grupo" });
            }

            // Si el usuario está en el grupo, proceder con la eliminación
            const deleteQuery = `
                DELETE FROM usuariosgrupos
                WHERE usuario_id = ? AND grupo_id = ?
            `;

            conn.query(deleteQuery, [id_usuario, id_grupo], (deleteError, deleteResults) => {
                if (deleteError) {
                    return res.status(500).json({ error: "Error al eliminar usuario del grupo" });
                }

                res.json({ message: "Usuario eliminado del grupo correctamente" });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const { id_grupo } = req.query;

        // Verificar si el grupo existe
        const existsQuery = `
            SELECT *
            FROM grupos
            WHERE id = ?
        `;

        conn.query(existsQuery, [id_grupo], (error, results) => {
            if (error) {
                return res.status(500).json({ error: "Error al verificar la existencia del grupo" });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: "El grupo no existe" });
            }

            // Si el grupo existe, proceder con la eliminación
            const deleteQuery = `
                DELETE FROM grupos
                WHERE id = ?
            `;

            conn.query(deleteQuery, [id_grupo], (deleteError, deleteResults) => {
                if (deleteError) {
                    return res.status(500).json({ error: "Error al eliminar el grupo" });
                }

                res.json({ message: "Grupo eliminado correctamente" });
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




