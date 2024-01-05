
const axios = require('axios');
const CryptoJS = require('crypto-js')

const {
    getSalesOrder,
    getProduct,
    getContact,
    getShipment
} = require('./unleashedHelpers')


const formatNumber = (value) => {
    return (value === null) ? 0 : Number((value*100).toFixed(2))
}

const defaultData = {
    orderNumber: null,
    shipmentNumber: null,
    
    companyName: null,
    contactFullName: null,
    contactEmailAddress: null,
    contactPhoneNumber: null,
    contactMobilePhone: null,
    // contactOfficePhone: null,
    contactPrimaryPhone: null,
    customerRef: null,
    comments: null,
    
    deliveryMethod: null,
    deliveryInstruction: null,
    deliveryStreetAddress: null,
    deliveryStreetAddress2: null,
    deliverySuburb: null,
    deliveryState: null,
    // deliveryRegion: null,
    deliveryPostCode: null,
    deliveryCountry: null,

    canShip: true,
    canStarShipIt: true,
    signatureRequired: false,
    tailgateRequired: false,

    productLines: [],
    shipmentWeight: null,
    shipmentVolume: null,

    subTotal: null,
    freightCharge: null,
    
    salesPersonFullName: null,
    salesPersonEmail: null,
    
    addressSuburbId: null, // for freightmate
    suburbOptions: [], // for freightmate
    addressId: null, // for freightmate
    
    // there is no default calculated value for the below
    offers: [], // for freightmate
    offerSelected: null, // index of offer selected
    connoteCarrierName: null, // updated when offered clicked
    connoteServiceTypeName: null, // updated when offered clicked

    requireResidential: false,
    requireTailGate: false,
    requireSignature: true,
}


const getProductLines = async (lines) => {
    console.log('getProductLines')
    console.log({lines})
    
    let productLines = [];

    for (let i = 0; i < lines.length; i++) {
        let lineItem = lines[i]

        const productGuid = lineItem['Product']['Guid']

        try {

            const product = await getProduct(productGuid)

            const productCode = product['ProductCode'] // : 'IN-V-MP-II-12/3000/120-32',
            const productDescription = product['ProductDescription'] // : 'Victron MultiPlus-II 12/3000/120-32 230V - PMP122305010',
            const productGroup = product['ProductGroup']['GroupName']
    
            const barcode = product['Barcode'] // : 'PMP122305010',
            const width = formatNumber(product['Width']) // : 0.25,
            const height = formatNumber(product['Height']) // : 0.65,
            const depth = formatNumber(product['Depth']) // : 0.35,
            let weight = product['Weight'] // : 22,
            weight = (weight === null) ? 0 : weight
            
            const shipmentQty = lineItem['ShipmentQty']
            const orderQuantity = lineItem['OrderQuantity']
            const quoteQuantity = "QUOTE QUANTITY" // quote ??
            const quantity = shipmentQty ? shipmentQty : orderQuantity ? orderQuantity : quoteQuantity
            
            const isDG = (productGroup === "Batteries - Lithium")
    
            productLines.push({ productCode, productDescription, productGroup, barcode, width, height, depth, weight, quantity, isDG })

        } catch (error) {
            console.log('getProductLines', i, lines.length)
            console.log({error: error.message })
        }
        
    }

    return productLines
}


const getQuoteData = async (quoteNumber) => {
    // console.log('getQuoteData')

}



const getOrderData = async (orderNumber) =>  {
    console.log('getOrderData')

    let order = await getSalesOrder(orderNumber)

    console.log({order})
    
    let charges = []
    let orderLines = [] 
    
    order['SalesOrderLines'].forEach(line => {
        if (line.LineType === 'Charge') {
            charges.push({
                description: line['ProductDescription'],
                price: line['UnitPrice'],
                quantity: line['OrderQuantity'],
                xeroAccount: line['XeroSalesAccount']
            })
        } else {
            orderLines.push(line)
        }
    })

    let freightCharge = 0
    order['SalesOrderLines'].forEach(lineItem => {
        if (lineItem['LineType'] === 'Charge') {
            if (lineItem['XeroSalesAccount'] === '45000') {
                freightCharge+=(lineItem['UnitPrice'] * ( 1 + lineItem['TaxRate'] ))
            }
        }
    })
    freightCharge = Number(freightCharge.toFixed(2))
    
    const productLines = await getProductLines(orderLines)

    const deliveryMethod = order['DeliveryMethod'] //: 'Road Freight',
    const deliveryInstruction = order['DeliveryInstruction'] // : 'DO NOT SHIP - NOT A REAL ORDER',

    const dontShipMethods = [
        null,
        'Local Pick Up',
        'Hand Delivery',
        'Customer Freight',
    ]
    
    const canShip = (!(dontShipMethods.includes(deliveryMethod)))
    // let canStarShipIt = (shipmentWeight < 23) // has to be 22kg for Auspost


    //
    const companyName = order['Customer']['CustomerName']
    const customerRef = order['CustomerRef']
    const comments = order['Comments']

    //     
    let contactFirstName;
    let contactLastName;
    let contactMobilePhone;
    let contactPhoneNumber;
    let contactEmailAddress;

    const customerGuid = order['Customer']['Guid']
    const deliveryContact = order['DeliveryContact']
    
    if (deliveryContact !== null) {
        let contactGuid = order['DeliveryContact']['Guid']
        let contact = await getContact(customerGuid, contactGuid)

        contactFirstName = contact.firstName
        contactLastName = contact.lastName
        contactMobilePhone = contact.mobilePhone
        contactPhoneNumber = contact.phoneNumber
        contactEmailAddress = contact.emailAddress
    }

    const contactFullName = `${contactFirstName} ${contactLastName}`.replace('null', '').trim()
    const contactPrimaryPhone = (contactMobilePhone !== null)
        ? contactMobilePhone
        : (contactPhoneNumber !== null)
            ? contactPhoneNumber
            : '';

    // 
    const deliveryStreetAddress = order['DeliveryStreetAddress'] // : '4 / 273 Williamstown Rd',
    const deliveryStreetAddress2 = order['DeliveryStreetAddress2'] // : null,

    const suburb = order['DeliverySuburb'] // : 'Port Melbourne',
    const city = order['DeliveryCity'] // : 'Port Melbourne',
    const deliverySuburb = (suburb !== null) ? suburb : city
    const deliveryState = order['DeliveryRegion'] // : 'Victoria',
    const deliveryPostCode = order['DeliveryPostCode'] // : '3207',
    const deliveryCountry = order['DeliveryCountry'] // : 'Australia',

    let subTotal = order['SubTotal'] //: 338.37,

    // 
    let salesPerson = order['SalesPerson']
    let salesPersonName;
    let salesPersonEmail;
    if (salesPerson!==null) {
        salesPersonName = salesPerson['FullName'] // : 'Andrew Wilson',
        salesPersonEmail = salesPerson['Email'] // 'andrew@dpasolar.com.au',
    }

    let data = { ...defaultData }

    data['orderNumber']             = orderNumber;
    
    data['companyName']             = companyName;
    data['customerRef']             = customerRef;
    data['comments']                = comments;
    
    data['contactFullName']         = contactFullName;
    data['contactEmailAddress']     = contactEmailAddress;
    data['contactPrimaryPhone']     = contactPrimaryPhone;
    // data['contactPhoneNumber']      = contactPhoneNumber;
    // data['contactMobilePhone']      = contactMobilePhone;
    
    data['salesPersonName']         = salesPersonName
    data['salesPersonEmail']        = salesPersonEmail

    data['deliveryMethod']          = deliveryMethod;
    data['deliveryInstruction']     = deliveryInstruction;
    
    data['deliveryStreetAddress']   = deliveryStreetAddress;
    data['deliveryStreetAddress2']  = deliveryStreetAddress2;
    data['deliverySuburb']          = deliverySuburb;
    data['deliveryState']           = deliveryState;
    data['deliveryPostCode']        = deliveryPostCode;
    data['deliveryCountry']         = deliveryCountry;
    
    data['canShip']                 = canShip;
    data['requireResidential']      = false;
    data['requireTailGate']         = false;
    data['requireSignature']        = true;

    // data['canStarShipIt'] = canStarShipIt;
    data['productLines']            = productLines;
    data['charges']                 = charges;
    data['freightCharge']           = freightCharge;
    data['subTotal']                = subTotal;
    
    data['offers'] = null

    return data;

}


const getShipmentData = async (shipment)  => {
    // console.log('getData')

    let shipmentNumber = shipment['ShipmentNumber'] //: 'SS-SB#2138SolarBox',
    let orderNumber = shipment['OrderNumber'] //: 'SB#2138SolarBox',
    
    console.log({shipment})


    // add products
    let shipmentLines = shipment['SalesShipmentLines']
    // add default values ... so can have a "loading effect"
    // shipmentLines.forEach(_ => data.productLines.push({}))
    let productLines = await getProductLines(shipmentLines)


    // calculate  weight & volume
    let shipmentWeight = 0
    let shipmentVolume = 0

    productLines.forEach(product => {
        let x = product.width
        let y = product.depth
        let z = product.height
        let qty = product.quantity
        
        let volume = x * y * z * qty
        shipmentVolume+=volume
        
        let lineWeight = product.weight * qty
        shipmentWeight += lineWeight
    })

    shipmentWeight = Number(shipmentWeight.toFixed(2))
    shipmentVolume = Number(shipmentVolume.toFixed(7))



    // add order
    let order = await getSalesOrder(orderNumber)

    // 
    let deliveryMethod = order['DeliveryMethod'] //: 'Road Freight',
    let deliveryInstruction = order['DeliveryInstruction'] // : 'DO NOT SHIP - NOT A REAL ORDER',

    let dontShipMethods = [
        null,
        'Local Pick Up',
        'Hand Delivery',
        'Customer Freight',
    ]
    
    let canShip = (!(dontShipMethods.includes(deliveryMethod)))
    let canStarShipIt = (shipmentWeight < 23) // has to be 22kg for Auspost

    let freightCharge = 0
    order['SalesOrderLines'].forEach(lineItem => {
        if (lineItem['LineType'] === 'Charge') {
            if (lineItem['XeroSalesAccount'] === '45000') {
                // console.log("****** CHARGE:", lineItem)
                freightCharge+=(lineItem['UnitPrice'] * ( 1 + lineItem['TaxRate'] ))
            }
        }
    })
    freightCharge = Number(freightCharge.toFixed(2))
    // console.log('FREIGHT TOTAL:', freightCharge)

    //
    let companyName = order['Customer']['CustomerName']
    let customerRef = order['CustomerRef']
    let comments = order['Comments']

    //     
    let contactFirstName;
    let contactLastName;
    let contactMobilePhone;
    let contactPhoneNumber;
    let contactEmailAddress;

    let customerGuid = order['Customer']['Guid']
    let deliveryContact = order['DeliveryContact']
    
    if (deliveryContact !== null) {
        let contactGuid = order['DeliveryContact']['Guid']
        let contact = await getContact(customerGuid, contactGuid)

        contactFirstName = contact.firstName
        contactLastName = contact.lastName
        contactMobilePhone = contact.mobilePhone
        contactPhoneNumber = contact.phoneNumber
        contactEmailAddress = contact.emailAddress

    }

    let contactFullName = `${contactFirstName} ${contactLastName}`.replace('null', '').trim()
    let contactPrimaryPhone = (contactMobilePhone !== null)
        ? contactMobilePhone
        : (contactPhoneNumber !== null)
            ? contactPhoneNumber
            // : (contactOfficePhone !== null)
            //     ? contactOfficePhone
            : '';

    // 

    let deliveryStreetAddress = order['DeliveryStreetAddress'] // : '4 / 273 Williamstown Rd',
    let deliveryStreetAddress2 = order['DeliveryStreetAddress2'] // : null,

    let suburb = order['DeliverySuburb'] // : 'Port Melbourne',
    let city = order['DeliveryCity'] // : 'Port Melbourne',
    let deliverySuburb = (suburb !== null) ? suburb : city

    let deliveryState = order['DeliveryRegion'] // : 'Victoria',
    let deliveryPostCode = order['DeliveryPostCode'] // : '3207',
    let deliveryCountry = order['DeliveryCountry'] // : 'Australia',

    let subTotal = order['SubTotal'] //: 338.37,


    // 
    let data = { ...defaultData }

    let salesPerson = order['SalesPerson']
    if (salesPerson!==null) {
        data['salesPersonFullName'] = salesPerson['FullName'] // : 'Andrew Wilson',
        data['salesPersonEmail'] = salesPerson['Email'] // 'andrew@dpasolar.com.au',
    }

    data['requireResidential'] = false;
    data['requireTailGate'] = false;
    data['requireSignature'] = true;

    data['shipmentNumber'] = shipmentNumber;
    data['orderNumber'] = orderNumber;
    data['productLines'] = productLines;
    data['shipmentWeight'] = shipmentWeight;
    data['shipmentVolume'] = shipmentVolume;
    data['companyName'] = companyName;
    data['customerRef'] = customerRef;
    data['comments'] = comments;
    data['contactFullName'] = contactFullName;
    data['contactEmailAddress'] = contactEmailAddress;
    data['contactPhoneNumber'] = contactPhoneNumber;
    data['contactMobilePhone'] = contactMobilePhone;
    // data['contactOfficePhone'] = contactOfficePhone;
    data['contactPrimaryPhone'] = contactPrimaryPhone;
    data['deliveryMethod'] = deliveryMethod;
    data['deliveryInstruction'] = deliveryInstruction;
    data['deliveryStreetAddress'] = deliveryStreetAddress;
    data['deliveryStreetAddress2'] = deliveryStreetAddress2;
    data['deliverySuburb'] = deliverySuburb;
    data['deliveryState'] = deliveryState;
    data['deliveryPostCode'] = deliveryPostCode;
    data['deliveryCountry'] = deliveryCountry;
    data['canShip'] = canShip;
    data['canStarShipIt'] = canStarShipIt;
    data['subTotal'] = subTotal;
    data['freightCharge'] = freightCharge;

    data['signatureRequired'] = true;
    data['offers'] = []

    // console.log({ finalData: data })
    // console.log({ productLines: data.productLines })
    // console.log('\n\n')

    return data
}





// const getShipments = async () => {
//     const endpoint = 'SalesShipments'
//     const body = { 'ShipmentStatus': 'Placed' }
//     let shipments = await getResponse(endpoint, body)
//     
//     let shipmentItems = shipments['Items']
//     let dataArray = [];
//     
//     for (let i=0;i<shipmentItems.length; i++) {
//         let shipment= shipmentItems[i]
//         let data = await getShipmentData(shipment)
//         dataArray.push(data)
//     }
//     return dataArray;
// }


module.exports = {
    getProductLines,
    getOrderData,
    getShipmentData
}