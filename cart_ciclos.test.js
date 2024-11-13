const updateSubscriptionCheck = (req, res) => {
    // If cart is empty
    if(!req.session.cart || req.session.cart.length === 0){
        req.session.cartSubscription = null;
        return;
    }

    Object.keys(req.session.cart).forEach((item) => {
        if(req.session.cart[item].productSubscription){
            req.session.cartSubscription = req.session.cart[item].productSubscription;
        }else{
            req.session.cartSubscription = null;
        }
    });
};
describe('updateSubscriptionCheck', () => {
    let req, res;

    beforeEach(() => {
        req = { session: {} };
        res = {};
    });

    test('debería establecer cartSubscription en null cuando el carrito está vacío', () => {
        req.session.cart = 0;
        updateSubscriptionCheck(req, res);
        expect(req.session.cartSubscription).toBeNull();

        req.session.cart = [];
        updateSubscriptionCheck(req, res);
        expect(req.session.cartSubscription).toBeNull();

        
    });

    test('debería establecer cartSubscription en true cuando hay un elemento con suscripción', () => {
        req.session.cart = [{ productSubscription: true }];
        updateSubscriptionCheck(req, res);
        expect(req.session.cartSubscription).toBe(false);
    });

    test('debería establecer cartSubscription en null cuando hay un elemento sin suscripción', () => {
        req.session.cart = [{ productSubscription: false }];
        updateSubscriptionCheck(req, res);
        expect(req.session.cartSubscription).toBeNull();
    });

    test('debería establecer cartSubscription en true cuando hay múltiples elementos y uno tiene suscripción', () => {
        req.session.cart = [{ productSubscription: true }, { productSubscription: false }];
        updateSubscriptionCheck(req, res);
        expect(req.session.cartSubscription).toBe(true);
    });

    test('debería establecer cartSubscription en null cuando hay múltiples elementos sin suscripción', () => {
        req.session.cart = [{ productSubscription: false }, { productSubscription: false }];
        updateSubscriptionCheck(req, res);
        expect(req.session.cartSubscription).toBeNull();
    });
});
