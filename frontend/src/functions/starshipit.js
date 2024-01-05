import axios from 'axios';

const SHIPIT_API_KEY = '163ed42c1f794f5689c750fbafcdae3e'
const SHIPIT_SUBSCRIPTION_KEY = 'a1be3ec62cae4eba885fcc6a3d53fa2c'

const packageModel = {
    weight: 20.00,	// double	Physical weight of the parcel in kilograms (kg)
    height: 0.50,	// double (nullable)	Height of the parcel in meters (m)
    width: 0.50,	// double (nullable)	Width of the parcel in meters (m)
    length: 0.50 // double (nullable)	Length of the parcel in meters (m)
}

export const DPA_SENDER = {
    'name': 'Daniel',
    'email': 'warehouse@dpasolar.com.au',
    'phone': '03 9696 1119',
    'building': '',
    'company': 'DPA Solar',
    'street': '4/273 Williamstown Rd',
    'suburb': 'Port Melbourne',
    'city': '',
    'state': 'VIC',
    'post_code': '3207',
    'country': 'Australia'
}

export const SOLARBOX_SENDER = {
    'name': 'Jason',
    'email': 'jason@solarboxaustralia.au',
    'phone': '03 8595 1960',
    'building': '',
    'company': 'SolarBox',
    'street': '4/273 Williamstown Rd',
    'suburb': 'Port Melbourne',
    'city': '',
    'state': 'VIC',
    'post_code': '3207',
    'country': 'Australia'
}


export const SHIPIT_HEADERS = {
    'Content-Type': 'application/json',
    'StarShipIT-Api-Key': SHIPIT_API_KEY,
    'Ocp-Apim-Subscription-Key': SHIPIT_SUBSCRIPTION_KEY,
    // 'Access-Control-Allow-Origin': 'no-cors'
}


export async function getRates(destination, packages) {
    const body = { destination, packages }
    
    const response = await axios({
        method: 'post',
        headers: SHIPIT_HEADERS,
        url: 'https://api.starshipit.com/api/rates',
        data: body
    })

    return response.data
}


export function createAddress({name, email, phone, building, company, street, suburb, city, state, post_code, country}) {
    let address = {};

    if (name!==null) { 
        address['name'] = name 
    }
    if (email!==null) { 
        address['email'] = email 
    }
    if (phone!==null) { 
        address['phone'] = phone 
    }
    if (building!==null) { 
        address['building'] = building 
    }
    if (company!==null) { 
        address['company'] = company 
    }
    if (street!==null) { 
        address['street'] = street 
    }
    if (suburb!==null) { 
        address['suburb'] = suburb 
    }
    if (city!==null) { 
        address['city'] = city 
    }
    if (state!==null) { 
        address['state'] = state 
    }
    if (post_code!==null) { 
        address['post_code'] = post_code 
    }
    if (country!==null) { 
        address['country'] = country 
    }
    
    return address;
}


export async function createShipitOrder(details, consignmentItems) {

    // ### CREATE ORDER ###
    console.log('createShipitOrder')

    let isSolarBox = details.orderNumber.includes('#')
    let sender = isSolarBox ? SOLARBOX_SENDER : DPA_SENDER

    let destination = {
        'name': details.contactFullName,
        'email': details.contactEmail,
        'phone': details.contactPrimaryPhone,
        'building': '',
        'company': (details.companyName === null) ? '' : details.companyName,
        'street': details.DeliveryStreetAddress,
        'suburb': details.DeliverySuburb,
        'city': '',
        'state': details.delivryState,
        'post_code': details.DeliveryPostCode,
        'country': 'Australia',
        'delivery_instructions': '',
        'tax_number': ''
    }

    let signatureRequired = Boolean(details.signatureRequired)

    const items = consignmentItems.map(item => {
        return {
            "length": (item.depth / 100), // required to be calucaled in meters not cm ...
            "width": (item.width / 100), // required to be calucaled in meters not cm ...
            "height": (item.height / 100), // required to be calucaled in meters not cm ...
            "weight": item.weight,
        }
    })

    let order = {
        'order_number': `${details.shipmentNumber}`,
        'reference': details.shipmentNumber.toString(),
        'shipping_method': '',
        'shipping_description': '',
        'signature_required': signatureRequired,
        'return_order': false,
        'currency': 'AUD',
        'sender_details': sender,
        'destination': destination,
        'items': items,
        'packages': []
    }

    const response = await axios({
        method: 'post',
        headers: SHIPIT_HEADERS,
        url: 'https://api.starshipit.com/api/orders',
        data: { order }
    })

    return response.data

}


export async function updateShipitOrdersTakeTwo(testing = true) {

    // GET SHIPMENTS
    let shipments = await getResponse('SalesShipments', { 'ShipmentStatus': 'Placed' })
    shipments = shipments['Items']
    console.log({ shipments })

    for (let i = 0; i < shipments.length; i++) {

        let shipment = shipments[i];

        // ### GET SALES ORDER
        let orderNumber = shipment['OrderNumber'];
        let salesOrder = await getSalesOrder(orderNumber)
        console.log('salesOrder: ', salesOrder)

        // ADD ORDER WEIGHT EXCEPTION
        let orderWeight = Number(salesOrder['TotalWeight'])
        console.log('orderWeight: ', orderWeight)

        // max weight for AusPost is 22kg carton
        if (orderWeight < 22) {

            let delieveryMethod = salesOrder['DeliveryMethod']
            console.log('delieveryMethod: ', delieveryMethod)

            if ((delieveryMethod === 'Local Pick Up') || (delieveryMethod === null) || (delieveryMethod === 'Hand Delivery')) {

                console.log(`### ${orderNumber} not added to StarShipIt as is "${delieveryMethod}" ###`)

            } else {

                let items = [];

                let lineItems = salesOrder['SalesOrderLines']

                for (let j = 0; j < lineItems.length; j++) {

                    let lineItem = lineItems[j]

                    // filter out freight charges
                    if (!(lineItem['LineType'] === 'Charge')) {

                        let productCode = lineItem['Product']['ProductCode']
                        let productDescription = lineItem['Product']['ProductDescription']
                        let productPrice = lineItem['UnitPrice']
                        let productTotalWeight = lineItem['Weight']
                        let productQuantity = lineItem['OrderQuantity']
                        let productIndividualWeight = productTotalWeight / productQuantity

                        items.push({
                            'description': productDescription,
                            'sku': productCode,
                            'quantity': productQuantity,
                            'weight': productIndividualWeight,
                            'value': productPrice
                        })

                    }

                }

                let companyName = salesOrder['Customer']['CustomerName']
                let customerGuid = salesOrder['Customer']['Guid']
                let contactGuid = salesOrder['DeliveryContact']['Guid']

                // TODO: add error handling when "DeliveryContact" has not been set
                let contact = await getContact(customerGuid, contactGuid)

                let destination = {
                    'name': contact['name'],
                    'email': contact['email'],
                    'phone': contact['phone'],
                    'building': '',
                    'company': companyName,
                    'street': shipment['DeliveryStreetAddress'],
                    'suburb': shipment['DeliverySuburb'],
                    'city': shipment['DeliveryCity'],
                    'state': shipment['DeliveryRegion'],
                    'post_code': shipment['DeliveryPostCode'],
                    'country': 'Australia',
                    'delivery_instructions': '',
                    'tax_number': ''
                }

                console.log('destination: ', destination)
                console.log('items: ', items)

                console.log('START POST FROM UNLEASHED ')

                setTimeout(() => {

                    console.log(`PAUSE[${i}]`)

                    if (!(testing)) {

                        let sender = orderNumber.includes('#') ? SOLARBOX_SENDER : DPA_SENDER

                        createShipitOrder(orderNumber, sender, destination, items)

                        let element = document.querySelector('#new-orders')
                        element.innerHTML = (Number(element.innerHTML) + 1).toString()

                    }

                }, 1000 * i)

                console.log('END POST FROM UNLEASHED')

            }

        }


    }

}
