import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Card, CardActions, CardContent, Typography, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import TokenSymbol from '../../components/TokenSymbol';

const useStyles = makeStyles((theme) => ({
  button: {
    [theme.breakpoints.down('415')]: {
      marginTop: '10px',
    },
  },
  transparentGradientBox: {
    background: 'linear-gradient(to bottom left, #00000000 40%, #19bea260)',
  },
  transparentGradientBoxes: {
    background: 'linear-gradient(to bottom left, #00000060 30%, #19bea280)',
    borderRadius: 15,
  },
  alertBox: {
    width: '50%',
    display: 'flex',
    justifyContent: 'center'
  },
  alertText: {
    color: 'black'
  },
  'alertBox b': {
    color: 'red'
  }
}));


const CemeteryCard = ({ bank }) => {
  const classes = useStyles();

  return (
    <Grid item xs={12} md={4} lg={4} >
      <Card variant="outlined" className={classes.transparentGradientBox} >
        <CardContent>
          <Box style={{ position: 'relative' }}>
            <Box
              style={{
                position: 'absolute',
                right: '0px',
                top: '-5px',
                height: '48px',
                width: '48px',
                borderRadius: '40px',
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <TokenSymbol size={32} symbol={bank.depositTokenName} />
            </Box>
            <Typography variant="h5" component="h2">
              {bank.depositTokenName}
            </Typography>
            <Typography color="textSecondary">
              {bank.name}
              {/* Deposit {bank.depositTokenName.toUpperCase()} Earn {` ${bank.earnTokenName}`} */}
            </Typography>
          </Box>
        </CardContent>
        <CardActions style={{ justifyContent: 'flex-end' }}>
          <Button color="primary" size="small" variant="contained" component={Link} to={`/thebasecamp/${bank.contract}`}>
            View
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );
};

export default CemeteryCard;
