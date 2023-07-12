import { Router } from 'express';
import sessionsRouter, { logout } from '../api/sessions.router.js';


const router = Router();

//Acceso público y privado
const publicAccess = (req, res, next) => {
    next();
}

const privateAccess = (req, res, next) => {
    if(!req.session.user) return res.redirect('/login');
    next();
}

router.get('/register', publicAccess, (req, res) => {
    res.render('register');
});

router.get('/reset', publicAccess, (req, res) => {
    res.render('reset');
});

router.get('/login', publicAccess, (req, res) => {
    res.render('login');
});

router.get('/', publicAccess, (req, res) => {
    res.render('login');
});

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    else{
        console.error("Debes iniciar sesión para poder entrar al chat, si no te has registrado debes iniciar sesión para ir al chat");
        res.redirect('/');
    }
} 
const isNotAdmin = (req, res, next) => {
    if (req.user && req.user.role !== 'admin') {
        return next();
    }
    else{
        console.error("Solo los usuarios con el rol user pueden entrar al chat, si no te has registrado debes iniciar sesión para ir al chat");
        logout(req, res, next);
    }
}
router.get('/chat', isNotAdmin, isLoggedIn, (req, res) => {
    res.render("chat");
});

export default router;