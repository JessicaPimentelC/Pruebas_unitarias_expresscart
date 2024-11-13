const emptyCart = async (req, res, type, customMessage) => {
    const db = req.app.db;

    // Remove from session
    delete req.session.cart;
    delete req.session.shippingAmount;
    delete req.session.orderId;
    delete req.session.cartSubscription;
    delete req.session.discountCode;

    // Remove cart from DB
    await db.cart.deleteOne({ sessionId: req.session.id });

    // update total cart
    await updateTotalCart(req, res);

    // Update checking cart for subscription
    updateSubscriptionCheck(req, res);

    // Set returned message
    let message = 'Cart successfully emptied';
    if(customMessage){
        message = customMessage;
    }

    if(type === 'function'){
        return;
    }

    // If POST, return JSON else redirect nome
    if(type === 'json'){
        res.status(200).json({ message: message, totalCartItems: 0 });
        return;
    }

    req.session.message = message;
    req.session.messageType = 'success';
    res.redirect('/');
};
const updateTotalCart = jest.fn();
const updateSubscriptionCheck = jest.fn();

describe('emptyCart', () => {
    let req, res;

    beforeEach(() => {
        req = {
            app: { db: { cart: { deleteOne: jest.fn().mockResolvedValue({}) } } },
            session: {
                id: 'test-session-id',
                cart: {},
                shippingAmount: 5,
                orderId: 'order123',
                cartSubscription: true,
                discountCode: 'DISCOUNT10',
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            redirect: jest.fn(),
        };
    });

    test('debería eliminar todos los datos de la sesión relacionados con el carrito', async () => {
        await emptyCart(req, res, null, null);
        
        expect(req.session.cart).toBeUndefined();
        expect(req.session.shippingAmount).toBeUndefined();
        expect(req.session.orderId).toBeUndefined();
        expect(req.session.cartSubscription).toBeUndefined();
        expect(req.session.discountCode).toBeUndefined();
    });

    test('debería devolver un mensaje personalizado cuando customMessage está definido', async () => {
        const customMessage = "Custom empty message";
        await emptyCart(req, res, 'json', customMessage);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: customMessage, totalCartItems: null });
    });

    test('debería retornar sin respuesta si el tipo es "function"', async () => {
        await emptyCart(req, res, 'function', null);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
    });

    test('debería devolver un mensaje JSON estándar si el tipo es "json"', async () => {
        await emptyCart(req, res, 'json', null);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Cart successfully emptied', totalCartItems: 0 });
    });

    test('debería redirigir a "/" y establecer un mensaje de éxito en la sesión si el tipo no es "json" ni "function"', async () => {
        await emptyCart(req, res, null, null);

        expect(req.session.message).toBe('Cart successfully emptied');
        expect(req.session.messageType).toBe('success');
        expect(res.redirect).toHaveBeenCalledWith('/');
    });
});
