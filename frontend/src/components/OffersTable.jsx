import React from 'react'
import { Paper } from '@mui/material'

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import OfferRow from './OfferRow';



const OffersTable = ({ offers, offersLoading }) => {


    return (

        <TableContainer component={Paper} my={5}>
            <Table sx={{ minWidth: 400 }} size="small" aria-label="a dense table">
                <TableHead sx={{ 'th': { fontWeight: 'bold' } }}>
                    <TableRow>
                        <TableCell padding='normal' align="center" component="th" scope="row">Carrier</TableCell>
                        <TableCell padding='normal' align="center">Service</TableCell>
                        <TableCell padding='normal' align="center">Cut-off</TableCell>
                        <TableCell padding='normal' align="center">ETA</TableCell>
                        <TableCell padding='normal' align="center">Quote ex. (Act. inc.)</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        offers.map((offer, index) => (
                            <OfferRow key={`offer-${index}`} offer={offer} offersLoading={offersLoading} />
                        ))
                    }
                </TableBody>
            </Table>
        </TableContainer>

    )
}

export default OffersTable
