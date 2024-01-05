import axios from 'axios';

import React, { useState, useEffect, useRef } from 'react'
import { Button, Box, Typography, TextField, Paper, Stack } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { getAllOffers } from '../functions/offers';
import { packageOptions } from '../functions/constants';

import { calculatePackages } from '../functions/packingAlgoithm';
import { priceFormatOffers, stateFromPostcode } from '../functions/general';

import ConsignmentItemRow from './ConsignmentItemRow';
import OffersTable from './OffersTable';
import GetOffersButton from './GetOffersButton';

const DEBOUNCE_TIMEOUT_DURATION = 1000;
const defaultConsignmentItem = packageOptions['Carton'];



const FreightEstimatePage = () => {

    const searchValue = useRef('SO-00006001')
    const [searchInput, setSearchInput] = useState('')
    const [searchType, setSearchType] = useState('order')
    const [isValid, setIsValid] = useState(false)
    const [details, setDetails] = useState({})
    const [consignmentItems, setConsignmentItems] = useState([defaultConsignmentItem])
    
    const [loaded, setLoaded] = useState(false)
    
    const [offers, setOffers] = useState(null)
    const [offersLoading, setOffersLoading] = useState(false)
    const [canGetOffers, setCanGetOffers ] = useState(false)

    const handleSetSuburb = (id, suburb, state, postcode) => {
        console.log('handleSetSuburb: ', id, suburb, state, postcode)

        let temp = { ...details };
        temp['addressSuburbId'] = id;
        temp['deliverySuburb'] = suburb;
        temp['deliveryState'] = state;
        temp['deliveryPostCode'] = postcode;

        setDetails(temp)

    }

    // try to load suburb
    useEffect(() => {

        if (loaded) {

            let suburb = details['deliverySuburb'].toString().trim().toUpperCase()
            let postcode = Number(details['deliveryPostCode'].toString().trim()) // need to check what Freightmate returns as a postcode value ... 0802 ??

            console.log({ suburb })
            console.log({ postcode })

            let url = `http://localhost:3000/freightmate/suburb/${suburb}`

            axios.get(url).then(resp => {

                console.log({ resp })

                if (resp.data === "") {
                    // raise error on suburb field
                    console.log('NO RESPONSE DATA')

                    // setResults([])
                } else {

                    console.log('RESPONSE SUCCESS')

                    let respResults = resp.data
                    console.log({ respResults })
                    console.log({ suburb })
                    console.log({ postcode })

                    let temp = resp.data.filter(result => ((result.name === suburb) && (result.postcode === postcode)))

                    console.log({ temp })

                    if (temp.length === 1) {
                        // matched ... success
                        let matched = temp[0]

                        let _id = matched.id
                        let suburb = matched.name
                        let state = stateFromPostcode(matched.postcode);

                        handleSetSuburb(_id, suburb, state, postcode)

                    } else {
                        // TODO: raise error

                        console.log('MULTIPLE RESULTS')
                    }

                }
            })

        }

    }, [loaded])


    useEffect(() => {
        
        if ((loaded) && (details.addressId!==null)) {
            setOffersLoading(true);

            const delayDebounceFn = setTimeout(() => {
                getOffers()
            }, DEBOUNCE_TIMEOUT_DURATION)
    
            return () => clearTimeout(delayDebounceFn)
        }
    }, [consignmentItems])


    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            // validate input
            let validStringLength = (searchInput.toString().length === 4)


            if (validStringLength) {
                // search
                setIsValid(true)
            }
        }, DEBOUNCE_TIMEOUT_DURATION)

        return () => clearTimeout(delayDebounceFn)
    }, [searchInput])

    useEffect(() => {

        if (loaded) {
            if (!details.addressId) {
                createFreightmateAddress()
            }
        }

    }, [details])

    const updateSearchValue = (input, type) => {
        let pre = (type === 'order') ? "SO" : "QU"
        let number = input.toString().padStart(8, '0')
        let temp = [pre, number].join('-')
        searchValue.current = temp;
        console.log(`searchValue:${searchValue.current}`)
    }

    const handleModifySearch = (e) => {
        let value = e.target.value.trim()
        setSearchInput(value)
        updateSearchValue(value, searchType)
    }

    const handleChange = (e) => {
        let value = e.target.value
        setSearchType(value);
        updateSearchValue(searchInput, value)
    };

    const handleLoad = () => {
        console.log("handleLoad")

        // clear the offers if the there if "load" is clicked again
        setOffers(null)
        setOffersLoading(false)
        setCanGetOffers(false)

        if (isValid) {
            const endpoint = `http://localhost:3000/unleashed/orders/${searchValue.current}/data`

            axios.get(endpoint).then(response => {
                const data = response.data

                setDetails(data)

                const packages = calculatePackages(data)

                setConsignmentItems(packages)

                setLoaded(true)
            })
        }
    }

    const handleAddConsignmentItem = () => {
        setConsignmentItems([...consignmentItems, { ...defaultConsignmentItem }])
    }

    const handleRemoveConsignmentItem = (e, index) => {
        setConsignmentItems(consignmentItems.filter((_, idx) => (idx !== index)))
    }

    const hangleModifyConsignmentItem = (e, index, key) => {
        let temp = [...consignmentItems]
        console.log({ temp })

        temp[index][key] = e.target.value
        console.log({ temp })

        setConsignmentItems(temp)

        // check for valid consignmentItem
        let validConsignmentItemFound = false

        for (let i = 0; i < temp.length; i++) {

            let item = temp[i];

            let testQty = item.qty > 0
            let testX = item.x > 0
            let testY = item.y > 0
            let testZ = item.z > 0
            let testW = item.w > 0
            let testDgW = item.dg ? (item.dgWeight > 0) : true

            let isValid = (testQty && testX && testY && testZ && testW && testDgW)

            if (isValid) {
                validConsignmentItemFound = isValid;
                // ... get offers ...
                break;
            }

        }
    }

    const handleChangeConsignmentItem = (e, index) => {
        let temp = [...consignmentItems]
        let key = e.target.value
        temp[index] = { ...packageOptions[key] }
        setConsignmentItems(temp)
    }

    const modfiyDetail = (key, value) => {
        let temp = { ...details }
        temp[key] = value
        setDetails(temp)
    }

    const createFreightmateAddress = () => {

        console.log('createFreightmateAddress')

        const url = 'http://localhost:3000/freightmate/address/'
        // const url = '/freightmate/address/'

        // ...
        let addressLine2 = details.deliveryStreetAddress2
        addressLine2 = (addressLine2 === null) ? '' : addressLine2;

        // ...
        let companyName = details.companyName
        if (companyName.length >= 45) {
            console.log('"companyName" is too long...')
            // companyName = companyName.substring(0,45) // TODO: this should raise an error
        }

        let contactFullName = details.contactFullName;
        companyName = (companyName === null) ? contactFullName : companyName;

        const body = {
            'id': 0,
            'clientId': 0,
            'referenceId': '',
            'company': companyName,
            'addressLine1': details.deliveryStreetAddress,
            'addressLine2': addressLine2,
            'contactName': contactFullName,
            'phoneNumber': details.contactPrimaryPhone,
            'email': details.contactEmail,
            'specialInstructions': '', // TODO: create a field, property and apply here
            'addressClass': details.requireResidential ? 'RESIDENTIAL' : 'BUSINESS',
            'status': 'VALID', // ... is there anything else ?
            'suburb': {
                'id': details.addressSuburbId,
                'name': details.deliverySuburb,
                'postcode': details.deliveryPostCode
            }
        }

        console.log({ body })

        axios.post(url, body).then(response => {

            console.log({ FreightmateAddress: response })

            let temp = { ...details }

            temp['addressClass'] = response.data.addressClass // : "BUSINESS"
            temp['addressStatus'] = response.data.status // : "VALID"
            temp['addressClientId'] = response.data.clientId // : "VALID"

            temp['deliveryStreetAddress'] = response.data.addressLine1 // : "121B MCMAHONS ROAD"
            temp['clientId'] = response.data.clientId // : 143
            temp['companyName'] = response.data.company // : "SIMMARK - NORTH NOWRA INVESTMENTS PTY LTD"
            temp['contactFullName'] = response.data.contactName // : "KAYLA BURNS"
            temp['addressId'] = response.data.id // : 491017
            temp['contactPrimaryPhone'] = response.data.phoneNumber // : "02 4422 1244"
            temp['addressSuburbId'] = response.data.suburb.id // : 3892
            temp['deliverySuburb'] = response.data.suburb.name // : "NORTH NOWRA"
            temp['deliveryPostCode'] = response.data.suburb.postcode // : 2541

            temp['deliveryAddress'] = response.data;
            
            // enable offers now that we have a valid delivery address
            setCanGetOffers(true)

            setDetails(temp)

        }).catch(errors => {
            console.log('ERROR', 'createFreightmateAddress()', {errors})
        });
    }

    const getOffers = () => {

        const endpoint = `http://localhost:3000/freightmate/offers/`

        getAllOffers(details, consignmentItems).then(offers => {
            console.log({ offers })
            setOffers(offers)
            // const formattedOffers = priceFormatOffers(offers)
            // setOffers(formattedOffers)

            
            setOffersLoading(false)

        })
    }


    return (

        <Box mt={2} mb={8}>

            <Box mb={4} mt={2}>
                <Typography variant='h2'>
                    Freight Estimate
                </Typography>
            </Box>




            <Box component={Paper} p={2} sx={{ flexGrow: 1, width: '600px', bgcolor: 'rgb(240,240,240)', marginLeft: '200px' }} my={8}>
                <Grid container rowSpacing={2} columnSpacing={2}>

                    <Grid xs={5}>
                        <TextField size='large' fullWidth label={'Quote / Order number'} variant='outlined' value={searchInput} onChange={handleModifySearch} />
                    </Grid>

                    <Grid xs={5} sx={{ marginTop: '0.5rem' }}>
                        <FormControl mx={2}>
                            <RadioGroup row
                                aria-labelledby="demo-controlled-radio-buttons-group"
                                name="controlled-radio-buttons-group"
                                value={searchType}
                                onChange={handleChange}>
                                <FormControlLabel value="quote" control={<Radio />} label="Quote" disabled />
                                <FormControlLabel value="order" control={<Radio />} label="Sales Order" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>

                    <Grid xs={2} sx={{ marginTop: '0.615rem' }}>
                        <Button
                            variant='contained'
                            color={isValid ? 'success' : 'warning'}
                            onClick={handleLoad}>
                            Load
                        </Button>
                    </Grid>

                </Grid>
            </Box>



            <Box component={Paper} p={2} sx={{ flexGrow: 1, width: '1000px', bgcolor: 'rgb(240,240,240)' }} my={4}>

                <Grid container spacing={3} >

                    <Grid container xs={12}>

                        <Grid xs={8}>
                            <TableContainer component={Paper} my={5}>
                                <Table sx={{ minWidth: 400 }} size="small" aria-label="a dense table">
                                    <TableBody sx={{ 'th': { fontWeight: 'bold' } }}>

                                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell padding='normal' component="th" scope="row">Company Name</TableCell>
                                            <TableCell padding='normal' align="right">{details.companyName}</TableCell>
                                        </TableRow>
                                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell padding='normal' component="th" scope="row">Customer Reference</TableCell>
                                            <TableCell padding='normal' align="right">{details.customerRef}</TableCell>
                                        </TableRow>

                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>

                        <Grid xs={4}>
                            <TableContainer component={Paper} my={5}>
                                <Table sx={{ minWidth: 200 }} size="small" aria-label="a dense table">
                                    <TableBody sx={{ 'th': { fontWeight: 'bold' } }}>

                                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell padding='normal' component="th" scope="row">Sales Person</TableCell>
                                            <TableCell padding='normal' align="right">{details.salesPersonName}</TableCell>
                                        </TableRow>
                                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell padding='normal' component="th" scope="row">Email</TableCell>
                                            <TableCell padding='normal' align="right">
                                                {details.salesPersonEmail}
                                            </TableCell>
                                        </TableRow>

                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>

                    </Grid>

                    <Grid container xs={12}>

                        <Grid xs={5}>
                            <TableContainer component={Paper} my={5}>
                                <Table sx={{ minWidth: 300 }} size="small" aria-label="a dense table">
                                    <TableBody sx={{ 'th': { fontWeight: 'bold' } }}>
                                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell padding='normal' component="th" scope="row">Street Address</TableCell>
                                            <TableCell padding='normal' align="right">
                                                <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
                                                    <div>{details.deliveryStreetAddress}</div>
                                                    {
                                                        details.addressId
                                                            ? <CheckCircleIcon fontSize='small' color='success' sx={{ transform: 'scale(0.75)' }} />
                                                            : <CancelIcon fontSize='small' color='error' sx={{ transform: 'scale(0.75)' }} />
                                                    }
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell padding='normal' component="th" scope="row">Suburb</TableCell>
                                            <TableCell padding='normal' align="right">
                                                <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
                                                    <div>{details.deliverySuburb}</div>
                                                    {
                                                        details.addressSuburbId
                                                            ? <CheckCircleIcon fontSize='small' color='success' sx={{ transform: 'scale(0.75)' }} />
                                                            : <CancelIcon fontSize='small' color='error' sx={{ transform: 'scale(0.75)' }} />
                                                    }
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell padding='normal' component="th" scope="row">State</TableCell>
                                            <TableCell padding='normal' align="right">
                                                <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
                                                    <div>{details.deliveryState}</div>
                                                    {
                                                        details.addressSuburbId
                                                            ? <CheckCircleIcon fontSize='small' color='success' sx={{ transform: 'scale(0.75)' }} />
                                                            : <CancelIcon fontSize='small' color='error' sx={{ transform: 'scale(0.75)' }} />
                                                    }
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell padding='normal' component="th" scope="row">Postcode</TableCell>
                                            <TableCell padding='normal' align="right">
                                                <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
                                                    <div>{details.deliveryPostCode}</div>
                                                    {
                                                        details.addressSuburbId
                                                            ? <CheckCircleIcon fontSize='small' color='success' sx={{ transform: 'scale(0.75)' }} />
                                                            : <CancelIcon fontSize='small' color='error' sx={{ transform: 'scale(0.75)' }} />
                                                    }
                                                </Stack>
                                            </TableCell>
                                        </TableRow>

                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>




                        <Grid xs={3}>
                            <TableContainer component={Paper} my={5}>
                                <Table sx={{ minWidth: 200 }} size="small" aria-label="a dense table">
                                    <TableBody sx={{ 'th': { fontWeight: 'bold' } }}>

                                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell padding='normal' component="th" scope="row">Residential</TableCell>
                                            <TableCell padding='normal' align="right">
                                                <Button sx={{ transform: 'scale(0.8)' }} size='small' variant='contained' color={details.requireResidential ? 'success' : 'inherit'} onClick={() => modfiyDetail('requireResidential', !details.requireResidential)}>
                                                    {details.requireResidential ? 'Yes' : 'No'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell padding='normal' component="th" scope="row">Tail Gate</TableCell>
                                            <TableCell padding='normal' align="right">
                                                <Button sx={{ transform: 'scale(0.8)' }} size='small' variant='contained' color={details.requireTailGate ? 'success' : 'inherit'} onClick={() => modfiyDetail('requireTailGate', !details.requireTailGate)}>
                                                    {details.requireTailGate ? 'Yes' : 'No'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell padding='normal' component="th" scope="row">Signature</TableCell>
                                            <TableCell padding='normal' align="right">
                                                <Button sx={{ transform: 'scale(0.8)' }} size='small' variant='contained' color={details.requireSignature ? 'success' : 'inherit'} onClick={() => modfiyDetail('requireSignature', !details.requireSignature)}>
                                                    {details.requireSignature ? 'Yes' : 'No'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>

                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>

                        <Grid xs={4}>
                            <TableContainer component={Paper} my={5}>
                                <Table sx={{ minWidth: 300 }} size="small" aria-label="a dense table">
                                    <TableBody sx={{ 'th': { fontWeight: 'bold' } }}>
                                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell padding='normal' component="th" scope="row">Contact</TableCell>
                                            <TableCell padding='normal' align="right">{details.contactFullName}</TableCell>
                                        </TableRow>
                                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell padding='normal' component="th" scope="row">Email</TableCell>
                                            <TableCell padding='normal' align="right">{details.contactEmailAddress}</TableCell>
                                        </TableRow>
                                        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell padding='normal' component="th" scope="row">Phone</TableCell>
                                            <TableCell padding='normal' align="right" sx={{ overflowX: 'scroll' }}>
                                                {details.contactPrimaryPhone}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>


                    </Grid>

                    {/* 
                    <Grid container xs={12}>

                        <Grid xs={6}>
                            <TableContainer component={Paper} my={5}>
                                <Table sx={{ minWidth: 200, height: '130px' }} size="small" aria-label="a dense table">
                                    <TableBody>
                                        <TableCell padding='normal' component="th" scope="row">
                                            <Typography variant='body2'>
                                                {details.notes}
                                            </Typography>
                                        </TableCell>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>

                        <Grid xs={6}>
                            <TableContainer component={Paper} my={5}>
                                <Table sx={{ minWidth: 200, height: '130px' }} size="small" aria-label="a dense table">
                                    <TableBody>
                                        <TableCell padding='normal' component="th" scope="row">
                                            <Typography variant='body2'>
                                                {details.deliveryInstruction}
                                            </Typography>
                                        </TableCell>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>

                    </Grid> */}


                    <Grid xs={12}>
                        <TableContainer component={Paper} my={5}>
                            <Table sx={{ minWidth: 400 }} size="small" aria-label="a dense table">
                                <TableHead>
                                    <TableRow sx={{ 'th': { fontWeight: 'bold' } }}>
                                        <TableCell padding='normal' component="th" scope="row">Product</TableCell>
                                        <TableCell padding='normal' align="right">Quantity</TableCell>
                                        <TableCell padding='normal' align="right">Width</TableCell>
                                        <TableCell padding='normal' align="right">Depth</TableCell>
                                        <TableCell padding='normal' align="right">Height</TableCell>
                                        <TableCell padding='normal' align="right">Weight</TableCell>
                                        <TableCell padding='normal' align="right">DG</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        details.productLines
                                            ? details.productLines.map((line, index) => (
                                                <TableRow
                                                    key={`productRow-${index}`}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell padding='normal' component="th" scope="row">{line.productDescription}</TableCell>
                                                    <TableCell padding='normal' align="right">{line.quantity}</TableCell>
                                                    <TableCell padding='normal' align="right">{line.width}</TableCell>
                                                    <TableCell padding='normal' align="right">{line.depth}</TableCell>
                                                    <TableCell padding='normal' align="right">{line.height}</TableCell>
                                                    <TableCell padding='normal' align="right">{line.weight}</TableCell>
                                                    <TableCell padding='normal' align="right">
                                                        {
                                                            line.isDG
                                                                ? <BatteryAlertIcon sx={{ transform: 'scale(0.9)', marginTop: '0.25rem' }} />
                                                                : null
                                                        }
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                            : null
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>


                    <Grid xs={12}>
                        <TableContainer component={Paper} my={5}>
                            <Table sx={{ minWidth: 400 }} size="small" aria-label="a dense table">
                                <TableHead sx={{ 'th': { fontWeight: 'bold' } }}>
                                    <TableRow>
                                        <TableCell padding='normal' component="th" scope="row">Package</TableCell>
                                        <TableCell padding='normal' align="right">Quantity</TableCell>
                                        <TableCell padding='normal' align="right">Width</TableCell>
                                        <TableCell padding='normal' align="right">Depth</TableCell>
                                        <TableCell padding='normal' align="right">Height</TableCell>
                                        <TableCell padding='normal' align="right">Weight</TableCell>
                                        <TableCell padding='normal' align="right">DG Weight</TableCell>
                                        <TableCell padding='normal' align="right">Remove</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        consignmentItems
                                            ? consignmentItems.map((item, index) => (
                                                <ConsignmentItemRow
                                                    key={`consignmentItem-${index}`}
                                                    item={item}
                                                    index={index}
                                                    hangleModifyConsignmentItem={hangleModifyConsignmentItem}
                                                    handleRemoveConsignmentItem={handleRemoveConsignmentItem}
                                                    handleChangeConsignmentItem={handleChangeConsignmentItem} />
                                            ))
                                            : null
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Grid container xs={12} direction="row" justifyContent="flex-start" alignItems="flex-start" spacing={3} px={3} my={0.5}>
                            <Grid>
                                <Button variant='contained' color='success' onClick={handleAddConsignmentItem}>
                                    <Typography>Add</Typography>
                                </Button>
                            </Grid>
                        </Grid>

                    </Grid>


                    
                    
                    <Grid xs={12}>
                        {
                            offers
                                ? <OffersTable offers={offers} offersLoading={offersLoading}/>
                                : canGetOffers
                                    ? <GetOffersButton getOffers={getOffers} offersLoading={offersLoading} setOffersLoading={setOffersLoading} />
                                    : null
                        }
                    </Grid>


                </Grid>
            </Box>



        </Box>
    )
}

export default FreightEstimatePage;