import CartParser from './CartParser';
import { isTaggedTemplateExpression } from '@babel/types';

let parser;

beforeEach(() => {
	parser = new CartParser();
});

describe('CartParser - unit tests', () => {
	// Add your unit tests here.
	it('should create error when header is unexpected', () => {
		const contents = `Productname,Price,Quantity
							Mollis consequat,9.00,2
							Tvoluptatem,10.32,1
							Scelerisque lacinia,18.90,1
							Consectetur adipiscing,28.72,10
							Condimentum aliquet,13.90,1`;
		parser.createError = jest.fn();

		parser.validate(contents);

		expect(parser.createError).toHaveBeenCalledTimes(1);
		expect(parser.createError).toHaveBeenCalledWith(
			'header',
			0,
			0,
			`Expected header to be named "Product name" but received Productname.`
		)
	})

	it('should create error when row has unexpected count of cells', () => {
		const contents = `Product name,Price,Quantity
							Mollis consequat,9.00,2
							Tvoluptatem,10.32,1
							Scelerisque lacinia,18.90
							Consectetur adipiscing,28.72,10
							Condimentum aliquet,13.90,1`;
		parser.createError = jest.fn();

		parser.validate(contents);

		expect(parser.createError).toHaveBeenCalledTimes(1);
		expect(parser.createError).toHaveBeenCalledWith(
			'row',
			3,
			-1,
			`Expected row to have 3 cells but received 2.`
		)
	})

	it('should create error when cell is empty string', () => {
		const contents = `Product name,Price,Quantity
							Mollis consequat,9.00,2
							Tvoluptatem,10.32,1
							,18.90,1
							Consectetur adipiscing,28.72,10
							Condimentum aliquet,13.90,1`;
		parser.createError = jest.fn();

		parser.validate(contents);

		expect(parser.createError).toHaveBeenCalledTimes(1);
		expect(parser.createError).toHaveBeenCalledWith(
			'cell',
			3,
			0,
			`Expected cell to be a nonempty string but received "".`
		)
	})

	it('should create error when cell is not positive number', () => {
		const contents = `Product name,Price,Quantity
							Mollis consequat,9.00,2
							Tvoluptatem,10.32,1
							Scelerisque lacinia,18.90,1
							Consectetur adipiscing,28.72,10
							Condimentum aliquet,13.90,-1`;
		parser.createError = jest.fn();

		parser.validate(contents);

		expect(parser.createError).toHaveBeenCalledTimes(1);
		expect(parser.createError).toHaveBeenCalledWith(
			'cell',
			5,
			2,
			`Expected cell to be a positive number but received "-1".`
		)
	})

	it('should add 4 errors to array', () => {
		const contents = `Produt name,Price,Quantity
							Mollis consequat,9.00,2
							Tvoluptatem,10.32,-1
							Scelerisque lacinia,fd,1
							Consectetur adipiscing,28.72,10
							Condimentum aliquet,13.90,-1`;
		const result = parser.validate(contents);

		expect(result.length).toBe(4);
	})


	it('should return empty array when contents are valid', () => {
		const contents = `Product name,Price,Quantity
							Mollis consequat,9.00,2
							Tvoluptatem,10.32,1
							Scelerisque lacinia,18.90,1
							Consectetur adipiscing,28.72,10
							Condimentum aliquet,13.90,1`;
		const result = parser.validate(contents);

		expect(result).toEqual([]);
	})

	it('should throw error when contents are no valid', () => {
		parser.readFile = jest.fn(() => `Product name,Price,Quantity
											Mollis consequat,9.00,2
											Tvoluptatem,10.32,-1
											Scelerisque lacinia,3,1
											Consectetur adipiscing,28.72,10
											Condimentum aliquet,13.90,1`);
		const parse = parser.parse.bind(parser);

		expect(parse).toThrow('Validation failed!');								
	})

	it('should return sum as number', () => {
		const items = [{
            "id": "3e6def17-5e87-4f27-b6b8-ae78948523a9",
            "name": "Mollis consequat",
            "price": 9,
            "quantity": 2
        },
        {
            "id": "90cd22aa-8bcf-4510-a18d-ec14656d1f6a",
            "name": "Tvoluptatem",
            "price": 10.32,
            "quantity": 10
        },
        {
            "id": "33c14844-8cae-4acd-91ed-6209a6c0bc31",
            "name": "Scelerisque lacinia",
            "price": 18.9,
            "quantity": 1
        },
        {
            "id": "f089a251-a563-46ef-b27b-5c9f6dd0afd3",
            "name": "Consectetur adipiscing",
            "price": 1,
            "quantity": 10
        },
        {
            "id": "0d1cbe5e-3de6-4f6a-9c53-bab32c168fbf",
            "name": "Condimentum aliquet",
            "price": 13.9,
            "quantity": 1
        }]
		const result = parser.calcTotal(items);

		expect(result).toBeCloseTo(164);
	})

	it('should return item with properties: id, name, price, quantity', () => {
		const result = parser.parseLine('Scelerisque lacinia,18.90,1');

		expect(result.id).toBeDefined();
		expect(result.name).toBeDefined();
		expect(result.price).toBeDefined();
		expect(result.quantity).toBeDefined();
	})
});

describe('CartParser - integration test', () => {
	// Add your integration test here.

	it('should return object when contents are valid', () => {
		const result = parser.parse('./samples/cart.csv');

		expect(result.items).toBeDefined();
		expect(result.items.length).toBe(5);
		expect(result.total).toBeCloseTo(348.32);
	})
});