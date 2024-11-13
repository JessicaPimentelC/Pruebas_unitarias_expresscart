const calculateShipping = (amount, config, req) => {
    // If a subscription, remove shipping
    if(req.session.cartSubscription){
        req.session.shippingMessage = 'FREE shipping';
        req.session.totalCartShipping = 0;
        req.session.totalCartAmount = req.session.totalCartAmount + 0;
        return;
    }

    // Calculate free threshold
    if(amount >= freeThreshold){
        req.session.shippingMessage = 'FREE shipping';
        req.session.totalCartShipping = 0;
        req.session.totalCartAmount = req.session.totalCartAmount + 0;
        return;
    }

    // If there is no country set, we estimate shipping
    if(!req.session.customerCountry){
        req.session.shippingMessage = 'Estimated shipping';
        req.session.totalCartShipping = domesticShippingAmount;
        req.session.totalCartAmount = amount + domesticShippingAmount;
        return;
    }

    // Check for international
    if(req.session.customerCountry.toLowerCase() !== shippingFromCountry.toLowerCase()){
        req.session.shippingMessage = 'International shipping';
        req.session.totalCartShipping = internationalShippingAmount;
        req.session.totalCartAmount = amount + internationalShippingAmount;
        return;
    }

    // Domestic shipping
    req.session.shippingMessage = 'Domestic shipping';
    req.session.totalCartShipping = domesticShippingAmount;
    req.session.totalCartAmount = amount + domesticShippingAmount;
};
const freeThreshold = 100;
const domesticShippingAmount = 10;
const internationalShippingAmount = 25;
const shippingFromCountry = 'Australia';


describe('calculateShipping', () => {

    test('debería aplicar envío gratis para suscripciones en el carrito', () => { 
        const req = {
            session: {
                cartSubscription: true,
                totalCartAmount: 100
            }
        };
    
        // Valores de ejemplo para la función
        const freeThreshold = 50;
        const domesticShippingAmount = 10;
        const internationalShippingAmount = 20;
        const shippingFromCountry = 'US';
    
        calculateShipping(50, { freeThreshold, domesticShippingAmount, internationalShippingAmount, shippingFromCountry }, req);
    
        expect(req.session.totalCartShipping).toBe(null);  
        expect(req.session.shippingMessage).toBe('FREE shipping');
    });
    

    test('debería aplicar envío gratis si el monto alcanza el umbral', () => {
        const req = {
            session: {
                cartSubscription: false,
                totalCartAmount: 100
            }
        };

        calculateShipping(150, { freeThreshold, domesticShippingAmount, internationalShippingAmount, shippingFromCountry }, req);

        expect(req.session.totalCartShipping).toBe(0);
        expect(req.session.shippingMessage).toBe('FREE shipping');
    });

    test('debería estimar el envío si el país del cliente no está establecido', () => {
        const req = {
            session: {
                cartSubscription: false,
                totalCartAmount: 50,
                customerCountry: null
            }
        };

        calculateShipping(50, { freeThreshold, domesticShippingAmount, internationalShippingAmount, shippingFromCountry }, req);

        expect(req.session.totalCartShipping).toBe(domesticShippingAmount);
        expect(req.session.shippingMessage).toBe('Estimated shipping');
    });

    test('debería aplicar envío internacional si el país del cliente es diferente al país de origen', () => {
        const req = {
            session: {
                cartSubscription: false,
                totalCartAmount: 50,
                customerCountry: 'CA'
            }
        };

        calculateShipping(50, { freeThreshold, domesticShippingAmount, internationalShippingAmount, shippingFromCountry }, req);

        expect(req.session.totalCartShipping).toBe(internationalShippingAmount);
        expect(req.session.shippingMessage).toBe('International shipping');
    });

    test('debería aplicar envío doméstico si el país del cliente coincide con el país de origen', () => {
        const req = {
            session: {
                cartSubscription: false,
                totalCartAmount: 50,
                customerCountry: 'Australia'
            }
        };

        calculateShipping(50, { freeThreshold, domesticShippingAmount, internationalShippingAmount, shippingFromCountry }, req);

        expect(req.session.totalCartShipping).toBe(domesticShippingAmount);
        expect(req.session.shippingMessage).toBe('Domestic shipping');
    });
});
