import React from 'react'
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Skeleton from '@mui/material/Skeleton';
import { formatPrice } from '../functions/general';

const carrierTierLookup = {
    'AUSPOST': '1',
    'EXPRESS POST': '1',
    'TNT': '1',
    'STARTRACK': '1',
    'NORTHLINE': '1',
    'IPEC': '1',
    'ALLIED EXPRESS': '2',
    'TFMXPRESS': '2',
    'TAS FREIGHT': '2',
    'CAPITAL': 'Local'
}



const OfferRow = ({ offer, offersLoading }) => {

    const deliveryDays = (typeof offer.etaDays == 'undefined') ? 'Unknown' : `${offer.etaDays} days`

    let [hour, minute] = offer.cutOffTime.trim().split(':')
    hour = Number(hour)
    const isMorning = (hour < 12)
    hour = (hour === 12) ? hour : (hour % 12)

    const carrierName = offer.carrierName.toString().replaceAll('_', ' ').toUpperCase()
    const serviceType = offer.serviceTypeName.toString().replaceAll('_', ' ').toUpperCase()
    const tier= carrierTierLookup[carrierName]
    const timeCutOff = `${hour}:${minute}${isMorning ? 'AM' : 'PM'}`
    const offerCost = offer.totalCost.toFixed(2)
    const formattedCost = formatPrice(offer.totalCost).toFixed(0)
    
    
    if (offersLoading) {
        const height = 22
        return (
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell padding='normal' align="center">
                    <Skeleton variant="rectangular" width='100%' height={height} />
                </TableCell>
                <TableCell padding='normal' align="center">
                    <Skeleton variant="rectangular" width='100%' height={height} />
                </TableCell>
                <TableCell padding='normal' align="center">
                    <Skeleton variant="rectangular" width='100%' height={height} />
                </TableCell>
                <TableCell padding='normal' align="center">
                    <Skeleton variant="rectangular" width='100%' height={height} />
                </TableCell>
                <TableCell padding='normal' align="center">
                    <Skeleton variant="rectangular" width='100%' height={height} />
                </TableCell>
            </TableRow>
        )
    }

    return (
        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell padding='normal' align="center">{tier}</TableCell>
            <TableCell padding='normal' align="center">{carrierName}</TableCell>
            <TableCell padding='normal' align="center">{serviceType}</TableCell>
            <TableCell padding='normal' align="center">{timeCutOff}</TableCell>
            <TableCell padding='normal' align="center">${formattedCost}</TableCell>
        </TableRow>

    )
}

export default OfferRow
