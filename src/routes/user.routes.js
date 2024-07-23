import { Router } from "express";
import { userModel } from "../models/user.model.js";
import { body, validationResult } from "express-validator";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los usuarios", details: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el usuario", details: error.message });
  }
});

router.post(
  "/",
  [
    body('first_name').not().isEmpty().withMessage('El nombre es obligatorio'),
    body('last_name').not().isEmpty().withMessage('El apellido es obligatorio'),
    body('email').isEmail().withMessage('Email no válido'),
    body('age').isInt({ min: 0 }).withMessage('La edad debe ser un número positivo'),
    body('password').isLength({ min: 5 }).withMessage('La contraseña debe tener al menos 5 caracteres')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { first_name, last_name, email, age, password } = req.body;
      const hashPassword = await createHash(password);

      const user = await userModel.create({
        first_name,
        last_name,
        email,
        age,
        password: hashPassword,
      });

      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Error al crear el usuario", details: error.message });
    }
  }
);

router.put(
  "/:id",
  [
    body('first_name').not().isEmpty().withMessage('El nombre es obligatorio'),
    body('last_name').not().isEmpty().withMessage('El apellido es obligatorio'),
    body('email').isEmail().withMessage('Email no válido'),
    body('age').isInt({ min: 0 }).withMessage('La edad debe ser un número positivo'),
    body('password').isLength({ min: 5 }).withMessage('La contraseña debe tener al menos 5 caracteres')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { first_name, last_name, email, age, password } = req.body;

      const hashPassword = await createHash(password);

      const user = await userModel.findByIdAndUpdate(id, {
        first_name,
        last_name,
        email,
        age,
        password: hashPassword,
      }, { new: true });

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar el usuario", details: error.message });
    }
  }
);

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json({ message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el usuario", details: error.message });
  }
});

export default router;
