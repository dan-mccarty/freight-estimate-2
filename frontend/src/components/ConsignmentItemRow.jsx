import React from 'react'

import { TextField, InputAdornment, Button } from '@mui/material'

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

import { packageOptions } from '../functions/constants';
const packageKeys = Object.keys(packageOptions)




const ConsignmentItemRow = ({
    item,
    index,
    hangleModifyConsignmentItem,
    handleRemoveConsignmentItem,
    handleChangeConsignmentItem }) => {

    console.log('SectionConsignmentItem')
    console.log({ item })

    return (

        <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <TableCell padding='normal' component="th" scope="row" sx={{ minWidth: '200px' }}>
                <FormControl fullWidth >
                    <Select
                        size='small'
                        margin="dense"
                        fullWidth
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        variant='outlined'
                        value={item.name}
                        
                        onChange={(e) => handleChangeConsignmentItem(e, index)}
                    >
                        {
                            packageKeys.map((key) => (
                                <MenuItem key={key} value={key}>{key}</MenuItem>
                            ))
                        }
                    </Select>
                </FormControl>
            </TableCell>

            <TableCell padding='normal' align="right">
                <TextField size='small' margin="dense" fullWidth onChange={(e) => hangleModifyConsignmentItem(e, index, 'quantity')} value={item.quantity} variant='outlined' sx={{input: {textAlign: "right"}, maxWidth: '60px'}}/>
            </TableCell>

            <TableCell padding='normal' align="right">
                <TextField size='small' margin="dense" fullWidth onChange={(e) => hangleModifyConsignmentItem(e, index, 'width')} value={Math.round(item['width'])} variant='outlined' sx={{input: {textAlign: "right"}, maxWidth: '60px'}}/>
            </TableCell>

            <TableCell padding='normal' align="right">
                <TextField size='small' margin="dense" fullWidth onChange={(e) => hangleModifyConsignmentItem(e, index, 'depth')} value={Math.round(item['depth'])} variant='outlined' sx={{input: {textAlign: "right"}, maxWidth: '60px'}}/>
            </TableCell>

            <TableCell padding='normal' align="right">
                <TextField size='small' margin="dense" fullWidth onChange={(e) => hangleModifyConsignmentItem(e, index, 'height')} value={Math.round(item['height'])} variant='outlined' sx={{input: {textAlign: "right"}, maxWidth: '60px'}}/>
            </TableCell>

            <TableCell padding='normal' align="right">
                <TextField
                    size='small'
                    margin="dense"
                    fullWidth
                    onChange={(e) => hangleModifyConsignmentItem(e, index, 'weight')}
                    value={item.weight}
                    variant='outlined'
                    sx={{input: {textAlign: "right"}, maxWidth: '80px'}}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">kg</InputAdornment>
                    }} />
            </TableCell>

            <TableCell padding='normal' align="right">
                <TextField
                    size='small'
                    margin="dense"
                    fullWidth
                    value={item.dgWeight}
                    onChange={(e) => hangleModifyConsignmentItem(e, index, 'dgWeight')}
                    variant='outlined'
                    sx={{input: {textAlign: "right"}, maxWidth: '80px'}}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">kg</InputAdornment>
                    }} />
            </TableCell>


            <TableCell padding='normal' align="right">
                <Button
                    variant="contained"
                    size='medium'
                    color='error'
                    onClick={(e) => handleRemoveConsignmentItem(e, index)}
                    sx={{input: {textAlign: "center"},  marginTop: '1 rem', maxWidth: '40px' }}>
                    <DeleteForeverIcon />
                </Button>
            </TableCell>

        </TableRow>

    )
}

export default ConsignmentItemRow


