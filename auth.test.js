const _ = require('lodash');

// Middleware to check for admin access for certain route
const checkAccess = (req, res, next) => {
    const routeCheck = _.find(restrictedRoutes, { route: req.route.path });

    // If the user is not an admin and route is restricted, show message and redirect to /admin
    if(req.session.isAdmin === false && routeCheck){
        if(routeCheck.response === 'redirect'){
            req.session.message = 'Unauthorised. Please refer to administrator.';
            req.session.messageType = 'danger';
            res.redirect('/admin');
            return;
        }
        if(routeCheck.response === 'json'){
            res.status(400).json({ message: 'Unauthorised. Please refer to administrator.' });
        }
    }else{
        next();
    }
};

const restrictedRoutes = [
    { route: '/restricted-path', response: 'redirect' },
    { route: '/restricted-json-path', response: 'json' }
];
describe('checkAccess', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            session: { isAdmin: null, message: null, messageType: null },
            route: { path: '' }
        };
        res = {
            redirect: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    // Caso 1: req.session.isAdmin = false, routeCheck = true, routeCheck.response = 'redirect'
    test('debe redirigir a /admin con mensaje cuando el usuario no es admin y la ruta está restringida con redirección', () => {
        req.session.isAdmin = false;
        req.route.path = '/restricted-path';

        checkAccess(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith('/admin');
        expect(req.session.message).toBe('Unauthorised. Please refer to administrator.');
        expect(req.session.messageType).toBe('danger');
    });

    // Caso 2: req.session.isAdmin = false, routeCheck = true, routeCheck.response = 'json'
    test('debe devolver error JSON cuando el usuario no es admin y la ruta está restringida con respuesta JSON', () => {
        req.session.isAdmin = false;
        req.route.path = '/restricted-json-path';

        checkAccess(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorised. Please refer to administrator.' });
    });

    // Caso 3: req.session.isAdmin = false, routeCheck = null
    test('debe llamar a siguiente cuando el usuario no es admin pero la ruta no está restringida', () => {
        req.session.isAdmin = false;
        req.route.path = '/open-path';

        checkAccess(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    // Caso 4: req.session.isAdmin = true, routeCheck = true, routeCheck.response = 'redirect'
    test('debe llamar al siguiente cuando el usuario es admin y la ruta está restringida con redirección', () => {
        req.session.isAdmin = true;
        req.route.path = '/restricted-path';

        checkAccess(req, res, next);
        expect(next).toHaveBeenCalled();
    });

    // Caso 5: req.session.isAdmin = true, routeCheck = true, routeCheck.response = 'json'
    test('debe llamar a continuación cuando el usuario es admin y la ruta está restringida con respuesta JSON', () => {
        req.session.isAdmin = true;
        req.route.path = '/restricted-json-path';

        checkAccess(req, res, next);
        expect(res.json).not.toHaveBeenCalled();  // Esto debería fallar si `json` no fue llamado
    });

    // Caso 6: req.session.isAdmin = true, routeCheck = null
    test('debe llamar al siguiente cuando el usuario es admin y la ruta no está restringida', () => {
        req.session.isAdmin = true;
        req.route.path = '/open-path';

        checkAccess(req, res, next);

        expect(next).toHaveBeenCalled();
    });
});
