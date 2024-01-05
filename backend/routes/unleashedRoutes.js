require('dotenv').config()

const axios = require('axios')
const CryptoJS = require('crypto-js')

const express = require('express');
const router = express.Router();

const { 
    getShipments,
    getSalesOrder
} = require('../helpers/unleashedHelpers');

const { 
    getShipmentData, 
    getOrderData 
} = require('../helpers/unleashedCompliledRequests');


// ==== SHIPMENTS ====

router.get('/shipments/all', async (req, res) => {
    try {
        const shipments = await getShipments()
        res.status(200).json(shipments)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.get('/shipments/all/data', async (req, res) => {
    
    try {
        const shipments = await getShipments()
        console.log({shipments})
        
        let dataArray = [];
        
        for (let i=0;i<shipments.length; i++) {
            let shipment = shipments[i]
            let data = await getShipmentData(shipment)
            dataArray.push(data)
        }
        
        res.status(200).json(dataArray)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})


// ==== SALES ORDERS ====

router.get('/orders/:orderNumber', async (req, res) => {
    const { orderNumber } = req.params
    
    try {
        const salesOrder = await getSalesOrder(orderNumber)
        res.status(200).json(salesOrder)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})

router.get('/orders/:orderNumber/data', async (req, res) => {
    const { orderNumber } = req.params
    
    try {
        const orderData = await getOrderData(orderNumber)
        res.status(200).json(orderData)
    } catch (error) {
        console.log({error})
        res.status(400).json({ error: error.message })
    }
})


module.exports = router;