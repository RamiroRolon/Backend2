import { Router } from "express";
import { userModel } from "../models/user.model.js";
import { createHash } from "../utils/hash.js";
import passport from "passport";
import { generateToken } from "../utils/jwt.js";
import { body, validationResult } from "express-validator";

const router = Router();

router.post(
  "/login",
  [
    body('email').isEmail().withMessage('Email no válido'),
    body('password').isLength({ min: 5 }).withMessage('La contraseña debe tener al menos 5 caracteres')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  passport.authenticate("login", {
    session: false,
    failureRedirect: "/api/auth/login",
  }),
  async (req, res) => {
    const payload = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      role: req.user.role,
    };

    const token = generateToken(payload);

    res.cookie("token", token, {
      maxAge: 100000,
      httpOnly: true,
    });

    res.status(200).json({
      message: "Login success",
      token,
    });
  }
);

router.get("/login", (req, res) => {
  res.status(401).json({
    error: "Unauthorized",
  });
});

router.post(
  "/register",
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

    const { first_name, last_name, email, age, role, password } = req.body;

    try {
      const hashPassword = await createHash(password);

      const user = await userModel.create({
        first_name,
        last_name,
        email,
        age,
        password: hashPassword,
        role,
      });

      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Error al crear el usuario", details: error.message });
    }
  }
);

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.status(200).json({
      message: "Bienvenido",
      user: req.user,
    });
  }
);

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "Sesión cerrada",
  });
});

export default router;
