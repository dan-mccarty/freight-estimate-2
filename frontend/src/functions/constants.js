

// Do we need to add max weight and default weight of packaging??
export const packageOptions = {
    'Carton': {
        name: 'Carton',
        quantity: 1,
        type: 'Carton',
        width: 50, // cm
        depth: 50, // cm
        height: 50, // cm
        weight: 10, // kg 
        isDg: false,
        dgWeight: 0,
        get volume() { return this.width + this.depth + this.height }
    },
    'Satchel 1kg': {
        name: 'Satchel 1kg',
        quantity: 1,
        type: '1kg Satchel',
        width: 25, // cm
        depth: 30, // cm
        height: 10, // cm
        weight: 1, // kg 
        isDg: false,
        dgWeight: 0,
        get volume() { return this.width + this.depth + this.height }
    },
    'Satchel 3kg': {
        name: 'Satchel 3kg',
        quantity: 1,
        type: '3kg Satchel',
        width: 22, // cm
        depth: 41, // cm
        height: 10, // cm
        weight: 3, // kg 
        isDg: false,
        dgWeight: 0,
        get volume() { return this.width + this.depth + this.height }
    },
    'Satchel 5kg': {
        name: 'Satchel 5kg',
        quantity: 1,
        type: '5kg Satchel',
        width: 32, // cm
        depth: 52, // cm
        height: 10, // cm
        weight: 5, // kg 
        isDg: false,
        dgWeight: 0,
        get volume() { return this.width + this.depth + this.height }
    },
    'Pallet': {
        name: 'Pallet',
        quantity: 1,
        type: 'Pallet',
        width: 120, // cm
        depth: 100, // cm
        height: 10, // cm
        weight: 20, // kg 
        isDg: false,
        dgWeight: 0,
        get volume() { return this.width + this.depth + this.height }
    },
    'Box Small': {
        name: 'Box Small',
        quantity: 1,
        type: 'Carton',
        width: 38, // cm
        depth: 41, // cm
        depth: 10, // cm
        weight: 3, // kg 
        isDg: false,
        dgWeight: 0,
        get volume() { return this.width + this.depth + this.height }
    },
    'Box Medium': {
        name: 'Box Medium',
        quantity: 1,
        type: 'Carton',
        width: 37, // cm
        depth: 37, // cm
        height: 37, // cm
        weight: 7, // kg 
        isDg: false,
        dgWeight: 0,
        get volume() { return this.width + this.depth + this.height }
    },
    'Box Large 3kg': {
        name: 'Box Large 3kg',
        quantity: 1,
        type: 'Carton',
        width: 38, // cm
        depth: 41, // cm
        height: 10, // cm
        weight: 3, // kg 
        isDg: false,
        dgWeight: 0,
        get volume() { return this.width + this.depth + this.height }
    },
    'PEF6': {
        name: 'PEF6',
        quantity: 1,
        type: 'Pallet',
        width: 80, // cm
        depth: 120, // cm
        height: 230, // cm
        weight: 160, // kg 
        isDg: false,
        dgWeight: 0,
        get volume() { return this.width + this.depth + this.height }
    },
    'PIR8': {
        name: 'PIR8',
        quantity: 1,
        type: 'Pallet',
        width: 80, // cm
        depth: 120, // cm
        height: 100, // cm
        weight: 100, // kg 
        isDg: false,
        dgWeight: 0,
        get volume() { return this.width + this.depth + this.height }
    },
    'PIR10': {
        name: 'PIR10',
        quantity: 1,
        type: 'Pallet',
        width: 38, // cm
        depth: 41, // cm
        height: 110, // cm
        weight: 120, // kg 
        isDg: false,
        dgWeight: 0,
        get volume() { return this.width + this.depth + this.height }
    }
}


export const ADDRESS_SUBURB_PORT_MELB = {
    id: 7192,
    name: "PORT MELBOURNE",
    postcode: 3207,
    state: "VIC",
}

export const ADDRESS_DPA = {
    "id": 478764,
    "clientId": 143,
    "company": "DPA SOLAR",
    "addressLine1": "4/273 Williamstown Road",
    "contactName": "GLYN",
    "phoneNumber": "0396961119",
    "email": "warehouse@dpasolar.com.au",
    "addressClass": "BUSINESS",
    "status": "VALID",
    "suburb": {
        "id": 7192,
        "name": "PORT MELBOURNE",
        "postcode": 3207
    }
}

export const ADDRESS_SOLARBOX = {
    id: 485809,
    clientId: 143,
    company: "SOLARBOX",
    addressLine1: "4/273 WILLIAMSTOWN RD",
    contactName: "JASON",
    phoneNumber: "0396961119",
    email: "SALES@SOLARBOXAUSTRALIA.AU",
    addressClass: "BUSINESS",
    status: "VALID",
    suburb: {
        id: 7192,
        name: "PORT MELBOURNE",
        postcode: 3207,
    }
}

export const ADDRESS_ID_DPA = 485807;
export const ADDRESS_ID_SOLARBOX = 485809;


export const PRODUCTION = true;
export const BASE_URL = PRODUCTION ? 'http://dpa.tools' : 'http://localhost:3000'