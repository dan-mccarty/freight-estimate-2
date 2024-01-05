const axios = require('axios')
const express = require('express')

const router = express.Router();

const HEADERS = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Authorization': `Basic ${process.env.FREIGHTMATE_TOKEN}`
}


// get frieghtmate suburb
router.get('/suburb/:suburb', async (req, res) => {
    const { suburb } = req.params

    try {
        const apiResponse = await axios({
            method: 'get',
            headers: HEADERS,
            url: 'https://api.freightmate.com/b2b/v1/address/suburb',
            params: {
                'filter': suburb,
                'page': '0',
                'size': '10',
                'sort': 'name,ASC',
            }
        })
        res.status(200).json(apiResponse.data.results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

})


// create frieghtmate address
router.post('/address/', async (req, res) => {
    const body = req.body
    try {
        const apiResponse = await axios({
            method: 'post',
            headers: HEADERS,
            url: 'https://api.freightmate.com/b2b/v1/address',
            data: body
        })
        // const _id = apiResponse.data.id
        // res.status(200).json({id: _id});
        res.status(200).json(apiResponse.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// create frieghtmate offers
router.post('/offers/', async (req, res) => {
    const body = req.body
    console.log({ body })

    try {
        const apiResponse = await axios({
            method: 'post',
            headers: HEADERS,
            url: 'https://api.freightmate.com/b2b/v1/consignment/offers',
            data: body
        })
        res.status(200).json(apiResponse.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
        
})


// create frieghtmate consignment
// router.post('/consignment/', (req, res) => {
// 
//     console.log(`API:POST /freightmate/consignment/`)
// 
//     var body = req.body
//     console.log({ body })
// 
//     axios({
//         method: 'post',
//         headers: HEADERS,
//         url: 'https://api.freightmate.com/b2b/v1/consignment',
//         data: body
// 
//     }).then(apiResponse => {
// 
//         console.log({ apiResponse })
//         res.status(200).json(apiResponse.data);
// 
//     }).catch(error => {
//         console.log({ error })
//         console.log('\n')
// 
//         let response = error.response;
// 
//         console.log({ status: response.status })
//         console.log({ statusText: response.statusText })
//         console.log({ headers: response.headers })
//         console.log({ config: response.config })
//         console.log({ request: response.request })
//         console.log({ data: response.data })
// 
//         res.status(400).json({ error: error.response });
// 
//         console.log('\n')
//     })
// })



module.exports = router;