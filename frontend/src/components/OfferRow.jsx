import React from 'react'
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Skeleton from '@mui/material/Skeleton';
import { formatPrice } from '../functions/general';

const OfferRow = ({ offer, offersLoading }) => {

    const deliveryDays = (typeof offer.etaDays == 'undefined') ? 'Unknown' : `${offer.etaDays} days`

    let [hour, minute] = offer.cutOffTime.trim().split(':')
    hour = Number(hour)
    const isMorning = (hour < 12)
    hour = (hour % 12)

    const carrierName = offer.carrierName.toString().replaceAll('_', ' ').toUpperCase()
    const serviceType = offer.serviceTypeName.toString().replaceAll('_', ' ').toUpperCase()
    const timePeriod = `${hour}:${minute}${isMorning ? 'AM' : 'PM'}`
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
            <TableCell padding='normal' align="center">{carrierName}</TableCell>
            <TableCell padding='normal' align="center">{serviceType}</TableCell>
            <TableCell padding='normal' align="center">{timePeriod}</TableCell>
            <TableCell padding='normal' align="center">{deliveryDays}</TableCell>
            <TableCell padding='normal' align="center">${formattedCost} ({offerCost})</TableCell>
        </TableRow>

    )
}

export default OfferRow
