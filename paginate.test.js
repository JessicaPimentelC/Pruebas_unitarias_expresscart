let getConfig = () => {
    let config = {
        productOrder: 'descending',
        productOrderBy: 'productAddedDate',
        modules: {
            enabled: {}
        }
    };
    return config;
};

const getSort = () => {
    const config = getConfig();
    let sortOrder = -1;
    if(config.productOrder === 'ascending'){
        sortOrder = 1;
    }
    let sortField = 'productAddedDate';
    if(config.productOrderBy === 'title'){
        sortField = 'productTitle';
    }

    return {
        [sortField]: sortOrder
    };
};

describe('Pruebas de getSort con cobertura de decisión', () => {

    test('Caso 1: config.productOrder no es "ascending" y config.productOrderBy no es "title"', () => {
        getConfig = jest.fn(() => ({
            productOrder: 'descending',
            productOrderBy: 'productAddedDate'
        }));

        const result = getSort();
        expect(result).toEqual({ productAddedDate: -1 });
    });

    test('Caso 2: config.productOrder es "ascending" y config.productOrderBy no es "title"', () => {
        getConfig = jest.fn(() => ({
            productOrder: 'ascending',
            productOrderBy: 'productAddedDate'
        }));

        const result = getSort();
        expect(result).toEqual({ productAddedDate: -1 });
    });

    test('Caso 3: config.productOrder no es "ascending" pero config.productOrderBy es "title"', () => {
        getConfig = jest.fn(() => ({
            productOrder: 'descending',
            productOrderBy: 'title'
        }));

        const result = getSort();
        expect(result).toEqual({ productTitle: -1 });
    });

    test('Caso 4: config.productOrder es "ascending" y config.productOrderBy es "title"', () => {
        getConfig = jest.fn(() => ({
            productOrder: 'ascending',
            productOrderBy: 'title'
        }));

        const result = getSort();
        expect(result).toEqual({ productTitle: 1 });
    });
});
