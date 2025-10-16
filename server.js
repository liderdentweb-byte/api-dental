const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
// ✅ MODIFICADO: Ahora solo permite peticiones de tu sitio web en Netlify
app.use(cors({ origin: 'https://dancing-figolla-581185.netlify.app' }));
app.use(express.json({ limit: '50mb' })); // Para manejar JSON grandes (radiografías)

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.error('Error de conexión a MongoDB:', err));

// --- Definición de Schemas (Modelos de Datos) ---
const tratamientoSchema = new mongoose.Schema({
    diente: String,
    tratamiento: String,
    precio: Number
});

const evolucionSchema = new mongoose.Schema({
    tipo: String, // 'tratamiento' o 'abono'
    fecha: String,
    tratamiento: String,
    diente: String,
    costo: Number,
    abono: Number,
    monto: Number, // Para abonos
    nota: String   // Para abonos
});

const radiografiaSchema = new mongoose.Schema({
    nombre: String,
    data: String, // Base64
    fecha: String,
    tipo: String
});

const historiaClinicaSchema = new mongoose.Schema({
    antecedentes: String,
    motivo: String,
    diagnostico: String,
    evolucion: [evolucionSchema],
    radiografias: [radiografiaSchema]
});

const pacienteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: String,
    celular: String,
    edad: String,
    doctor: String, // "Credenciales"
    fecha: String,
    tratamientos: [tratamientoSchema],
    historiaClinica: historiaClinicaSchema
});

const Paciente = mongoose.model('Paciente', pacienteSchema);

// --- Endpoints de la API ---

// GET: Obtener todos los pacientes
app.get('/api/pacientes', async (req, res) => {
    try {
        const pacientes = await Paciente.find();
        res.json(pacientes);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener pacientes', error: err });
    }
});

// GET: Obtener un paciente por su ID
app.get('/api/pacientes/:id', async (req, res) => {
    try {
        const paciente = await Paciente.findById(req.params.id);
        if (!paciente) return res.status(404).json({ message: 'Paciente no encontrado' });
        res.json(paciente);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener el paciente', error: err });
    }
});

// POST: Crear un nuevo paciente
app.post('/api/pacientes', async (req, res) => {
    try {
        const nuevoPaciente = new Paciente(req.body);
        const pacienteGuardado = await nuevoPaciente.save();
        res.status(201).json(pacienteGuardado);
    } catch (err) {
        res.status(400).json({ message: 'Error al crear el paciente', error: err });
    }
});

// PUT: Actualizar un paciente existente
app.put('/api/pacientes/:id', async (req, res) => {
    try {
        const pacienteActualizado = await Paciente.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!pacienteActualizado) return res.status(404).json({ message: 'Paciente no encontrado' });
        res.json(pacienteActualizado);
    } catch (err) {
        res.status(400).json({ message: 'Error al actualizar el paciente', error: err });
    }
});

// DELETE: Eliminar un paciente
app.delete('/api/pacientes/:id', async (req, res) => {
    try {
        const pacienteEliminado = await Paciente.findByIdAndDelete(req.params.id);
        if (!pacienteEliminado) return res.status(404).json({ message: 'Paciente no encontrado' });
        res.json({ message: 'Paciente eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar el paciente', error: err });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});