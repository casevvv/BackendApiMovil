const conn = require("../config/db.js");

// Ruta para crear un grupo
exports.creatGroup = async (req, res) => {
    try {
        const { grupo } = req.body;
        const { id_creador } = req.query;

        // Verificar si el nombre del grupo ya existe en la base de datos
        conn.query("SELECT * FROM grupos WHERE grupo = ?",
            [grupo],
            async (error, results) => {
                if (error) {
                    return res.status(500).json({ error: "Error al verificar el nombre del grupo en la base de datos" });
                }

                // Si hay resultados, significa que el nombre del grupo ya existe
                if (results.length > 0) {
                    return res.status(400).json({ error: "El nombre del grupo ya está en uso" });
                }

                // Si no hay resultados, el nombre del grupo no está en uso y se puede insertar
                conn.query("INSERT INTO grupos (id_creador,grupo) VALUES (?,?)",
                    [id_creador, grupo],
                    (error, result) => {
                        if (error) {
                            return res.status(500).json({ error: "Error al agregar el grupo a la base de datos" });
                        }
                        res.status(200).json({ message: "Grupo creado" });
                    }
                );
            }
        );
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

            if (idUsuarioCreador != id_creador) {
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




