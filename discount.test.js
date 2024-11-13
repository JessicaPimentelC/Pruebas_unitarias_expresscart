// Método que vamos a probar
const calculateDiscount = (discount, req) => {
    let discountAmount = 0;
    if (req.session.discountCode) {
        if (discount.type === 'amount') {
            discountAmount = discount.value;
        }
        if (discount.type === 'percent') {
            // Aplica el descuento sobre el monto neto del carrito (por ejemplo: sin envío)
            discountAmount = (discount.value / 100) * req.session.totalCartNetAmount;
        }
    }

    req.session.totalCartDiscount = discountAmount;
};

describe('calculateDiscount', () => {
    test('debería establecer totalCartDiscount en 0 si no existe discountCode', () => {
        const req = {
            session: {
                discountCode: null,
                totalCartNetAmount: 100
            }
        };
        const discount = {
            type: 'amount',
            value: 20
        };

        calculateDiscount(discount, req);

        expect(req.session.totalCartDiscount).toBe(0);
    });

    test('debería aplicar descuento de tipo "amount" si discountCode existe', () => {
        const req = {
            session: {
                discountCode: 'SAVE20',
                totalCartNetAmount: 100
            }
        };
        const discount = {
            type: 'amount',
            value: 20
        };

        calculateDiscount(discount, req);

        expect(req.session.totalCartDiscount).toBe(20);
    });

    test('debería no aplicar descuento de tipo "amount" si discountCode existe pero el tipo no coincide', () => {
        const req = {
            session: {
                discountCode: 'SAVE20',
                totalCartNetAmount: 100
            }
        };
        const discount = {
            type: 'percent',
            value: 20
        };

        calculateDiscount(discount, req);

        expect(req.session.totalCartDiscount).not.toBe(20); // No debe aplicar "amount"
    });

    test('debería aplicar descuento de tipo "percent" si discountCode existe', () => {
        const req = {
            session: {
                discountCode: 'SAVE20',
                totalCartNetAmount: 200
            }
        };
        const discount = {
            type: 'percent',
            value: 10
        };

        calculateDiscount(discount, req);

        expect(req.session.totalCartDiscount).toBe(20); // 10% de 200
    });

    test('debería no aplicar descuento de tipo "percent" si discountCode existe pero el tipo no coincide', () => {
        const req = {
            session: {
                discountCode: 'SAVE20',
                totalCartNetAmount: 200
            }
        };
        const discount = {
            type: 'amount',
            value: 10
        };

        calculateDiscount(discount, req);

        expect(req.session.totalCartDiscount).not.toBe(20); // No debe aplicar "percent"
    });

    test('debería establecer totalCartDiscount en 0 si el tipo de descuento es desconocido', () => {
        const req = {
            session: {
                discountCode: 'SAVE20',
                totalCartNetAmount: 200
            }
        };
        const discount = {
            type: 'unknownType',
            value: 50
        };

        calculateDiscount(discount, req);

        expect(req.session.totalCartDiscount).toBe(0);
    });
});
