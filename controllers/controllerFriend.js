const conn = require("../config/db.js");

exports.addFriend = (req, res) => {
    try {
        const { usuario_usuario, usuario_amigo } = req.query;
        console.log(req.query)
        // Validar datos
        if (!usuario_usuario || !usuario_amigo) {
            return res.status(400).json({ error: "Faltan datos de usuario" });
        }

        conn.query(
            "INSERT INTO amigos (usuario_usuario, usuario_amigo) VALUES (?, ?)",
            [usuario_usuario, usuario_amigo],
            async (error, result) => {
                if (error) {
                    if (error.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ error: "Ya son amigos o la relación ya existe" });
                    } else {
                        return res.status(500).json({ error: "Error al agregar amigo a la base de datos" });
                    }
                } else {
                    res.status(200).json({ message: "Usuario agregado como amigo" });
                }
            }
        );

    } catch (e) {
        return res.status(500).json({ error: "Error interno del servidor" });
    }
}

exports.getFriends = (req, res) => {
    const { id } = req.query;

    conn.query(
        "SELECT U.* FROM usuarios U INNER JOIN amigos A ON U.id = A.usuario_amigo WHERE A.usuario_usuario = ?",
        [id],
        (error, results) => {
            if (error) {
                return res.status(500).json({ error });
            } else {
                res.status(200).json({ friends: results });
            }
        }
    );
}
exports.getAllUsersWithCarrera = (req, res) => {
    conn.query(
      "SELECT U.nombre, U.apellidos, C.carrera AS nombre_carrera FROM usuarios U INNER JOIN carreras C ON U.id = C.id",
      (error, results) => {
        if (error) {
          return res.status(500).json({ error });
        } else {
          res.status(200).json({ users: results });
        }
      }
    );
  };

exports.deleteFriend = (req, res) => {
    try {
        const { usuario_usuario, usuario_amigo } = req.query;

        // Validar datos
        if (!usuario_usuario || !usuario_amigo) {
            return res.status(400).json({ error: "Faltan datos de usuario" });
        }

        conn.query(
            "DELETE FROM amigos WHERE usuario_usuario = ? AND usuario_amigo = ?",
            [usuario_usuario, usuario_amigo],
            async (error, result) => {
                if (error) {
                    return res.status(500).json({ error: "Error al eliminar amigo de la base de datos" });
                } else {
                    if (result.affectedRows === 0) {
                        return res.status(404).json({ error: "La relación de amistad no existe" });
                    } else {
                        res.status(200).json({ message: "Amigo eliminado exitosamente" });
                    }
                }
            }
        );

    } catch (e) {
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};
