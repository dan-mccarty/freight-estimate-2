import { ADDRESS_ID_DPA, ADDRESS_ID_SOLARBOX } from "../constants";
import axios from "axios";
import { getRates } from "./starshipit";

export async function getStarshipitOffers(details, consignmentItems) {
  if (details.canStarShipIt) {
    const shipItSender = {
      street: "4/273 Williamstown Rd",
      suburb: "Port Melbourne",
      city: "",
      state: "VIC",
      post_code: "3207",
      country_code: "AU",
    };

    const shipItDestination = {
      street: details.deliveryStreetAddress,
      suburb: details.deliverySuburb,
      city: "",
      state: details.deliveryState,
      post_code: details.deliveryPostCode,
      country_code: "AU",
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

    if (packages.length === 1) {
      // can ship
      let data = await getRates(shipItDestination, packages);
      let offerDetails = data.rates.map((rate) => {
        let [carrier, etaDays] = rate.service_name.split(" - ");

        etaDays = etaDays.trim().split(" ")[0];

        if (carrier === "Parcel Post") {
          carrier = "Auspost";
        }

        return {
          type: "shipit",
          carrierName: carrier, //: "startrack"
          cutOffTime: "16:00", //: "11:00"
          etaDays: etaDays, //: 4
          serviceTypeName: rate.service_code, // : "exp"
          totalCost: Math.round(rate.total_price * 100) / 100,
        };
      });
      return offerDetails;
    } else {
      // too many packages ... or not enough.
      return [];
    }
  } else {
    // cant shipit
    return [];
  }
}

const createPackage = (item) => {
  const { depth, width, height, weight, quantity } = item;
  if (quantity !== null && quantity > 0) {
    return {
      length: depth / 100, // required to be calucaled in meters not cm ...
      width: width / 100, // required to be calucaled in meters not cm ...
      height: height / 100, // required to be calucaled in meters not cm ...
      weight: weight,
    };
  }
};

const createDestination = (details) => {
  return {
    street: details.deliveryStreetAddress,
    suburb: details.deliverySuburb,
    city: "",
    state: details.deliveryState,
    post_code: details.deliveryPostCode,
    country_code: "AU",
  };
};

const shipItSender = {
  street: "4/273 Williamstown Rd",
  suburb: "Port Melbourne",
  city: "",
  state: "VIC",
  post_code: "3207",
  country_code: "AU",
};

export async function getStarshipitOffers2(details, consignmentItems) {
  if (details.canStarShipIt) {
    const shipItDestination = createDestination(details);
    const packages = consignmentItems.map((item) => createPackage(item));

    if (packages.length === 1) {
      // can ship
      const data = await getRates(shipItDestination, packages);

      let offerDetails = data.rates.map((rate) => {
        let [carrier, etaDays] = rate.service_name.split(" - ");

        etaDays = etaDays.trim().split(" ")[0];

        if (carrier === "Parcel Post") {
          carrier = "Auspost";
        }

        return {
          type: "shipit",
          carrierName: carrier, //: "startrack"
          cutOffTime: "14:00", //: "11:00"
          etaDays: etaDays, //: 4
          serviceTypeName: rate.service_code, // : "exp"
          totalCost: Math.round(rate.total_price * 100) / 100,
        };
      });
      return offerDetails;
    }
  }

  return []; // cant ship or too many items
}

export async function getFreightmateOffers(details, consignmentItems) {
  // GET FREIGHTMATE OFFERS
  console.log("getOffers");
  console.log({ details });

  let isSolarBox = details.orderNumber.includes("#");

  console.log({ isSolarBox });

  let senderAddressId = isSolarBox ? ADDRESS_ID_SOLARBOX : ADDRESS_ID_DPA;
  let deliveryAddressId = details["addressId"];

  const url = "http://localhost:3000/api/freightmate/offers/";

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
              commonName: "BATTERIES",
              subRisk: "N/A",
              type: "PACKAGED",
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

  return;
}

export async function getAllOffers(details, consignmentItems) {
  let shipitOffers = await getStarshipitOffers(details, consignmentItems);
  let freightmateOffers = await getFreightmateOffers(details, consignmentItems);
  let offers = [...shipitOffers, ...freightmateOffers];
  return offers;
}
