import React, { useEffect, useState } from 'react';

import { Link, Route, Routes } from "react-router-dom";

import FreightEstimatePage from './components/FreightEstimatePage';

import { useLocation } from "react-router-dom";

import './App.css'

const paths = {
    '/': 'Main Menu',
    '/shipments': 'Create Consignments',
    '/estimate': 'Freight Estimate',
}



function App() {

    const location = useLocation()
    const title = paths[location.pathname]

    console.log({ location })

    return (
        <div className="container">
            <FreightEstimatePage />
        </div>

    )
}


/**
import MenuPage from './components/MenuPage';
import ShipmentCardPage from './components/ShipmentCardPage'

<Routes>
    <Route path="/" element={<MenuPage />} />
    <Route path="/shipments" element={<ShipmentCardPage />} />
    <Route path="/estimate" element={<FreightEstimatePage />} />
</Routes>
 */

export default App



