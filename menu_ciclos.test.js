// Importamos lodash para usar _.find
const _ = require('lodash');

// Simulamos la función getMenu
const getMenu = (db) => {
    return db.menu.findOne({});
};

// Definimos la función orderMenu
const orderMenu = async (req, res) => {
    const db = req.app.db;
    try {
        const menu = await getMenu(db); // Simulamos la llamada a la base de datos

        const menuOrder = req.body['order[]'];

        // Actualizamos el orden de los elementos en el menú
        menuOrder.forEach((title, i) => {
            const item = _.find(menu.items, { title });
            if (item) {
                item.order = i;
            }
        });

        // Simulamos la actualización del menú en la base de datos
        await db.menu.updateOne({}, { $set: { items: menu.items } }, { upsert: true });

        return true;
    } catch (error) {
        return false;
    }
};

// Simulación de los mocks para pruebas
const db = {
    menu: {
        updateOne: jest.fn(),
        findOne: jest.fn(),
    },
};

// Pruebas unitarias
describe('orderMenu', () => {
    let req, res;

    beforeEach(() => {
        req = { app: { db }, body: {} };
        res = {};
        db.menu.updateOne.mockClear(); 
        db.menu.findOne.mockClear();   
    });

    test('debería manejar correctamente cuando menuOrder está vacío', async () => {
        req.body['order[]'] = [];
    
        // Simula el valor retornado de `findOne`
        db.menu.findOne.mockResolvedValue({ items: [] });
    
        const result = await orderMenu(req, res);
    
        // Cambiar la expectativa para que falle si result es `true`
        expect(result).toBe(false);  // Esto debería fallar si `result` es realmente `true`
        expect(db.menu.updateOne).toHaveBeenCalledWith({}, { $set: { items: [] } }, { upsert: true });
    });
    

    test('debería actualizar el orden con una sola iteración', async () => {
        req.body['order[]'] = ['Item1'];

        // Simula el valor retornado de `findOne`
        db.menu.findOne.mockResolvedValue({ items: [{ title: 'Item1' }] });

        const result = await orderMenu(req, res);

        expect(result).toBe(true);
        expect(db.menu.updateOne).toHaveBeenCalledWith({}, { $set: { items: [{ title: 'Item1', order: 0 }] } }, { upsert: true });
    });

    test('debería actualizar el orden con múltiples iteraciones', async () => {
        req.body['order[]'] = ['Item1', 'Item2'];

        // Simula el valor retornado de `findOne`
        db.menu.findOne.mockResolvedValue({ items: [{ title: 'Item1' }, { title: 'Item2' }] });

        const result = await orderMenu(req, res);

        expect(result).toBe(true);
        expect(db.menu.updateOne).toHaveBeenCalledWith({}, { $set: { items: [{ title: 'Item1', order: 0 }, { title: 'Item2', order: 1 }] } }, { upsert: true });
    });
});
