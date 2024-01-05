
export async function getData(url = '', headers = {}) {
    // headers['Access-Control-Allow-Credentials'] = true
    // headers['Access-Control-Allow-Origin'] =  '*'
    const response = await fetch(url, {
        method: 'GET',
        headers: headers,
    });

    return response.json(); // parses JSON response into native JavaScript objects
}

export async function postData(url = "", headers = {}, data = {}) {
    const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
}



export const isBlank = (string) => {
    return ((string === null) || (string.trim() === ''))
}

// export const ceilN = (value, interval) =>  {
//     /**
//      * returns a 'ceiled' value given by the interval
//      */
//     if ( (interval===null) || (interval==='undefined') ) {
//         interval = 1
//     }
// 
//     let remainder = value % interval
//     let n = (value - remainder) / interval
//     let newValue = (n + Number(remainder>0)) * interval
//     return  newValue
// }

export const ceilN = (value, interval) => {
    // const value = 676.06
    // const interval = 10
    const remainder = value % interval
    const whole = value - remainder
    const newValue = whole + interval
    return newValue
}


export const sum = (values) => values.reduce((a, b) => a + b, 0);


export const formatPrice = (cost) => {
    const minValue = 25
    const interval = 5 
    return (cost < minValue) ? minValue : ceilN(cost / 1.1, interval)
}

export const priceFormatOffers = (offers) => {
    offers.forEach(offer => {
        offer.totalCost = formatPrice(offer.totalCost)
    })
    return offers
}


export function stateFromPostcode(postcode) {

    const lookup = [
        [1000, 1999, 'NSW'],
        [2000, 2599, 'NSW'],
        [2619, 2899, 'NSW'],
        [2921, 2999, 'NSW'],
        [200, 299, 'ACT'],
        [2600, 2618, 'ACT'],
        [2900, 2920, 'ACT'],
        [3000, 3999, 'VIC'],
        [8000, 8999, 'VIC'],
        [4000, 4999, 'QLD'],
        [9000, 9999, 'QLD'],
        [5000, 5799, 'SA'],
        [5800, 5999, 'SA'],
        [6000, 6797, 'WA'],
        [6800, 6999, 'WA'],
        [7000, 7799, 'TAS'],
        [7800, 7999, 'TAS'],
        [800, 899, 'NT'],
        [900, 999, 'NT']
    ]

    var state;

    lookup.forEach(row => {
        let [lower, upper, accronym] = row;

        if ((postcode >= lower) && (postcode <= upper)) {
            state = accronym
        }
    })

    return state;

}



