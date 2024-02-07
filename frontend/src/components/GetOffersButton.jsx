import React from 'react';
import { Button, Typography } from '@mui/material';

import CircularProgress from '@mui/material/CircularProgress';

/**
 * 
    {
        offersLoading
            ? <CircularProgress size={20} mx={10} color='success' thickness={6} />
            : null
    }
 */

const GetOffersButton = ({ getOffers, offersLoading, setOffersLoading }) => {
  const handleClick = () => {
    setOffersLoading(true);
    getOffers();
  };

  return (
    <Button
      size="large"
      variant="contained"
      color="success"
      disabled={offersLoading}
      onClick={handleClick}
    >
      {offersLoading ? 'Loading...' : 'Get Offers'}
    </Button>
  );
};

export default GetOffersButton;
