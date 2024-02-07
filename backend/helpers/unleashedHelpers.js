require("dotenv").config();

// https://www.npmjs.com/package/crypto-js
const CryptoJS = require("crypto-js");
const axios = require("axios");

// ==== BASE FUNCTIONS FOR CONSTRUCTING REQUESTS ====

const UNLEASHED_API_ID = process.env.UNLEASHED_API_ID;
const UNLEASHED_API_KEY = process.env.UNLEASHED_API_KEY;

const getParamString = (params) => {
  let paramStringArray = [];
  for (let [key, value] of Object.entries(params)) {
    paramStringArray.push(`${key}=${value}`);
  }
  return paramStringArray.join("&");
};

const getParamString2 = (params) => {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
};

const getResponse = async (endpoint, params = {}) => {
  const urlParam = getParamString(params);
  var url = encodeURI(
    "https://api.unleashedsoftware.com/" + endpoint + "?" + urlParam
  );
  url = url.includes("#") ? url.replace("#", "%23") : url;
  const hash = CryptoJS.HmacSHA256(urlParam, UNLEASHED_API_KEY);
  const hash64 = CryptoJS.enc.Base64.stringify(hash);
  const response = await axios.get(url, {
    headers: {
      Accept: "application/json",
      "api-auth-id": UNLEASHED_API_ID,
      "api-auth-signature": hash64,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

const getResponse2 = async (endpoint, params = {}) => {
  const urlParam = getParamString(params);
  const url = encodeURI(
    `https://api.unleashedsoftware.com/${endpoint}?${urlParam}`
  ).replace("#", "%23");
  const hash = CryptoJS.HmacSHA256(urlParam, UNLEASHED_API_KEY);
  const hash64 = CryptoJS.enc.Base64.stringify(hash);
  const response = await axios.get(url, {
    headers: {
      Accept: "application/json",
      "api-auth-id": UNLEASHED_API_ID,
      "api-auth-signature": hash64,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

// ==== COMMON REQUESTS ====

const getSalesQuote = async (quoteNumber) => {
  const endpoint = "SalesQuotes";
  const params = { quoteNumber: quoteNumber };
  let order = await getResponse(endpoint, params).then(
    (data) => data["Items"][0]
  );
  return order;
};

const getSalesQuote2 = async (quoteNumber) => {
  const endpoint = "SalesQuotes";
  const params = { quoteNumber: quoteNumber };
  return await getResponse(endpoint, params).then((data) => data["Items"][0]);
};

const getSalesOrder = async (orderNumber) => {
  const endpoint = "SalesOrders";
  const params = { OrderNumber: orderNumber };
  let order = await getResponse(endpoint, params).then(
    (data) => data["Items"][0]
  );
  return order;
};

const getSalesOrder2 = async (orderNumber) => {
  const endpoint = "SalesOrders";
  const params = { OrderNumber: orderNumber };
  return await getResponse(endpoint, params).then((data) => data["Items"][0]);
};

const getShipments = async () => {
  const endpoint = "SalesShipments";
  const params = { ShipmentStatus: "Placed" };
  let shipments = await getResponse(endpoint, params);
  return shipments["Items"];
};

const getShipments2 = async () => {
  const endpoint = "SalesShipments";
  const params = { ShipmentStatus: "Placed" };
  const shipments = await getResponse(endpoint, params);
  return shipments["Items"];
};

const getProduct = async (productGuid) => {
  const endpoint = `Products/${productGuid}`;
  let product = await getResponse(endpoint);
  return product;
};

const getProduct2 = async (productGuid) => {
  const endpoint = `Products/${productGuid}`;
  return await getResponse(endpoint);
};

const getContact = async (customerGuid, contactGuid) => {
  const endpoint = `/Customers/${customerGuid}/Contacts`;
  const contact = await getResponse(endpoint).then((data) => {
    let contacts = data["Items"];
    console.log({ contacts });
    const results = contacts.filter(
      (contact) => contact["Guid"] === contactGuid
    );
    const result = results[0]; // there should only be 1 contact returned
    return {
      firstName: result["FirstName"],
      lastName: result["LastName"],
      mobilePhone: result["MobilePhone"],
      phoneNumber: result["PhoneNumber"],
      emailAddress: result["EmailAddress"],
    };
  });
  return contact;
};

const getContact2 = async (customerGuid, contactGuid) => {
  const endpoint = `/Customers/${customerGuid}/Contacts`;
  const contact = await getResponse(endpoint).then((data) => {
    const contacts = data["Items"];
    const results = contacts.filter(({ Guid }) => Guid === contactGuid);
    const result = results[0]; // there should only be 1 contact returned
    return {
      firstName: result.FirstName,
      lastName: result.LastName,
      mobilePhone: result.MobilePhone,
      phoneNumber: result.PhoneNumber,
      emailAddress: result.EmailAddress,
    };
  });
  return contact;
};

module.exports = {
  getResponse,
  getSalesQuote,
  getSalesOrder,
  getProduct,
  getContact,
  getShipments,
};
