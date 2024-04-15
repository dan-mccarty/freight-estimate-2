import axios from 'axios';
import { getRates } from './starshipit';
import { ADDRESS_ID_DPA, ADDRESS_ID_SOLARBOX, BASE_URL } from './constants';

export async function getStarshipitOffers(details, consignmentItems) {
  if (!details.canStarShipIt) {
    // cant shipit
    return [];
  }

  const shipItSender = {
    street: '4/273 Williamstown Rd',
    suburb: 'Port Melbourne',
    city: '',
    state: 'VIC',
    post_code: '3207',
    country_code: 'AU',
  };

  const shipItDestination = {
    street: details.deliveryStreetAddress,
    suburb: details.deliverySuburb,
    city: '',
    state: details.deliveryState,
    post_code: details.deliveryPostCode,
    country_code: 'AU',
  };

  let packages = consignmentItems.map((item) => {
    if (item.quantity !== null && item.quantity > 0) {
      return {
        length: item.depth / 100, // required to be calucaled in meters not cm ...
        width: item.width / 100, // required to be calucaled in meters not cm ...
        height: item.height / 100, // required to be calucaled in meters not cm ...
        weight: item.weight,
      };
    }
  });

  console.log({ packages });

  if (packages.length !== 1) {
    // too many packages ... or not enough.
    return [];
  }

  // can ship
  const data = await getRates(shipItDestination, packages);

  if (!data.rates) {
    return [];
  }

  const offerDetails = data.rates.map((rate) => {
    let [carrier, etaDays] = rate.service_name.split(' - ');

    etaDays = etaDays.trim().split(' ')[0];

    if (carrier === 'Parcel Post') {
      carrier = 'Auspost';
    }

    return {
      type: 'shipit',
      carrierName: carrier, //: "startrack"
      cutOffTime: '14:00', //: "11:00"
      etaDays: etaDays, //: 4
      serviceTypeName: rate.service_code, // : "exp"
      totalCost: Math.round(rate.total_price * 100) / 100,
    };
  });

  return offerDetails;
}

export async function getFreightmateOffers(details, consignmentItems) {
  // GET FREIGHTMATE OFFERS
  console.log('getOffers');
  console.log({ details });

  let isSolarBox = details.orderNumber.includes('#');

  console.log({ isSolarBox });

  let senderAddressId = isSolarBox ? ADDRESS_ID_SOLARBOX : ADDRESS_ID_DPA;
  let deliveryAddressId = details['addressId'];

  const url = `${BASE_URL}/api/freightmate/offers/`;

  const items = consignmentItems.map((item) => {
    return {
      itemTypeName: item.type,
      quantity: item.quantity,
      length: item.depth / 100, // required to be calucaled in meters not cm ...
      width: item.width / 100, // required to be calucaled in meters not cm ...
      height: item.height / 100, // required to be calucaled in meters not cm ...
      weight: item.weight,
      dangerousGoods: item.isDG
        ? [
            {
              id: 0,
              unNumber: { id: 3480 },
              weight: item.dgWeight,
              commonName: 'BATTERIES',
              subRisk: 'N/A',
              type: 'PACKAGED',
            },
          ]
        : [],
    };
  });

  console.log({ items });

  let body = {
    senderAddressId: senderAddressId,
    deliveryAddressId: deliveryAddressId,

    authorityToLeave: !details.requireSignature,
    tailgateRequired: details.requireTailGate,

    items: items,

    validSenderSuburbAndIsSenderSuburbResidential: true,
    validSenderAddressId: true,
    validHasSenderInfo: true,

    validDeliverySuburbAndIsDeliverySuburbResidential: true,
    validDeliveryAddressId: true,
    validHasDeliveryInfo: true,
  };

  console.log({ body });

  try {
    const offersResponse = await axios.post(url, body);
    console.log({ offersResponse });

    let offers = offersResponse.data.offers;
    console.log({ offers });

    let offerDetails = offers.map((offer) => {
      return {
        type: 'freightmate',
        carrierName: offer.carrierDetails.carrierName, //: "startrack"
        cutOffTime: offer.carrierDetails.cutOffTime, //: "11:00"
        etaDays: offer.carrierDetails.etaDays, //: 4
        serviceTypeName: offer.carrierDetails.serviceTypeName, // : "exp"
        totalCost: Math.round(offer.costs.totalCost * 100) / 100,
      };
    });

    return offerDetails;
  } catch (error) {
    console.log('ERROR: getFreightmateOffers():: ', error);

    return [];
  }
}

export async function getAllOffers(details, consignmentItems) {
  let shipitOffers = await getStarshipitOffers(details, consignmentItems);
  let freightmateOffers = await getFreightmateOffers(details, consignmentItems);
  let offers = [...shipitOffers, ...freightmateOffers];
  return offers;
}
