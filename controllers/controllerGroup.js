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

// Ruta para añadir un usuario a un grupo (solo permitido al creador del grupo)
exports.addMember = async (req, res) => {
    try {
        const { id_usuario, id_grupo } = req.params;

        // Verificar si el usuario ya está en el grupo
        conn.query(
            "SELECT * FROM usuariosgrupos WHERE usuario_id = ? AND grupo_id = ?",
            [id_usuario, id_grupo],
            async (error, results) => {
                if (error) {
                    return res.status(500).json({ error: "Error al verificar la relación usuario-grupo en la base de datos" });
                }
                // Si hay resultados, significa que el usuario ya está en el grupo
                if (results.length > 0) {
                    return res.status(400).json({ error: "El usuario ya está en este grupo" });
                }

                // se consulta para encontrar si la persona que hace la solicitud fue el creador del grupo
                conn.query("SELECT id_creador FROM grupos WHERE id_grupo = ?",
                    [id_grupo],
                    async (error, results) => {
                        if (error) {
                            return res.status(500).json({ error: "Error al verificar el creador del grupo en la base de datos" });
                        }

                        // Si hay resultados, posiblemente sea el creador
                        if (results.length > 0) {
                            const idUsuarioCreador = results[0].id_creador;

                            //se compara si lo es
                            if (idUsuarioCreador !== Number(id_creador)) {
                                return res.status(403).json({ error: 'No tienes permisos para añadir usuarios a este grupo.' });
                            }
                        }
                    }
                );

                //añadir usuario al grupo en la base de datos
                conn.query(
                    "INSERT INTO usuariosgrupos (usuario_id, grupo_id) VALUES (?, ?)",
                    [id_usuario, id_grupo],
                    async (error, result) => {
                        if (error) {
                            return res.status(500).json({ error: "Error al agregar el miembro al grupo" });
                        } else {
                            res.json({ message: 'Usuario añadido al grupo correctamente.' });
                        }
                    }
                );
            }
        );
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
