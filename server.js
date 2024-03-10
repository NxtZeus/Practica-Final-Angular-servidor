// Importación de los módulos necesarios
const express = require("express");
const fs = require("fs");
const cors = require("cors");

// Creación de la aplicación Express
const app = express();

// Puerto en el que se ejecutará el servidor
const port = 3000;

// Opciones de CORS
const corsOptions = {
  origin: "http://localhost:4200",
  optionsSuccessStatus: 204,
  methods: "GET, POST, DELETE",
};

// Uso de middleware para habilitar CORS con las opciones especificadas
app.use(cors(corsOptions));

// Uso de middleware para parsear el cuerpo de las solicitudes HTTP a JSON
app.use(express.json());

// Ruta GET para obtener países
app.get("/paises", (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const perPage = parseInt(req.query.perPage) || 10;

  // Lectura del archivo db.json
  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    // Parseo de los datos a JSON
    const jsonData = JSON.parse(data);

    // Cálculo de los índices de inicio y fin para la paginación
    const start = page * perPage;
    const end = start + perPage;

    // Extracción de los países correspondientes a la página actual
    const result = jsonData.paises.slice(start, end);

    // Envío de la respuesta
    res.status(200).json({
      paises: result,
      total: jsonData.paises.length,
      page,
      perPage,
      totalPages: Math.ceil(jsonData.paises.length / perPage),
    });
  });
});

// Ruta POST para agregar un país
app.post("/paises", (req, res) => {
  const { nombre, capital, poblacion, idioma_principal } = req.body;

  // Lectura del archivo db.json
  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const jsonData = JSON.parse(data);

    // Creación del nuevo país
    const nuevoPais = {
      nombre,
      capital,
      poblacion,
      idioma_principal,
    };

    // Adición del nuevo país a la lista de países
    jsonData.paises.push(nuevoPais);

    // Escritura de los nuevos datos en el archivo db.json
    fs.writeFile("db.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
        return;
      }
      // Envío de la respuesta con el nuevo país
      res.status(201).json(nuevoPais);
    });
  });
});

// Ruta DELETE para eliminar un país
app.delete("/paises/:nombre", (req, res) => {
  const nombre = req.params.nombre;

  // Lectura del archivo db.json
  fs.readFile("db.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }

    let jsonData = JSON.parse(data);
    const paisIndex = jsonData.paises.findIndex(pais => pais.nombre === nombre);

    // Verificación de que el país existe
    if (paisIndex === -1) {
      res.status(404).json({ message: "País no encontrado" });
      return;
    }

    // Eliminación del país de la lista de países
    jsonData.paises.splice(paisIndex, 1);

    // Escritura de los nuevos datos en el archivo db.json
    fs.writeFile("db.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
        return;
      }
      // Envío de la respuesta indicando que el país fue eliminado con éxito
      res.status(200).json({ message: "País eliminado con éxito" });
    });
  });
});

// Inicio del servidor en el puerto especificado
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
