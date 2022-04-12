import React from 'react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
  Divider,
  rgbToHex,
} from '@material-ui/core';
import PeakLogo from '../../assets/img/peak_navlogo.png';

import ListItemLink from '../ListItemLink';
import Image from 'material-ui-image';

import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AccountButton from './AccountButton';
import { black } from '../../theme/colors';
import { Opacity } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  '@global': {
    ul: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
  },
  appBar: {
    color: '#11edc2',
    fontWeight: 'bold',
    'background-color': 'rgba(0, 0, 0, 0.8)',
    // borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: '1rem',
    background: 'linear-gradient(#040e2495, #00000000)'
  },
  navBarColour: {
    'background-color': 'rgba(0, 0, 0, 0.8)',
  },
  drawer: {
    width: 240,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 240,
  },
  hide: {
    display: 'none',
  },
  toolbar: {
    flexWrap: 'wrap',
  },
  toolbarTitle: {
    // fontFamily: '"Amarante", cursive',
    fontSize: '30px',
    flexGrow: 1,
  },
  link: {
    textTransform: 'uppercase',
    color: '#11edc2',
    fontWeight: 'bold',
    fontSize: '14px',
    margin: theme.spacing(1, 2),
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  brandLink: {
    textDecoration: 'none',
    color: '#11edc2',
    fontWeight: 'bold',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  peakLogo: {
    background: 'transparent', 
    height: 80,
    width: 220,    
  }
}));

const Nav = () => {
  const matches = useMediaQuery('(min-width:900px)');
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <AppBar position="sticky" elevation={0} className={classes.appBar} >
      <Toolbar className={classes.toolbar}>
        {matches ? (
          <>
          {/* 
            <Typography variant="h6" color="inherit" noWrap className={classes.toolbarTitle}>
              <Link to="/" color="inherit" className={classes.brandLink}>
                Peak Finance
              </Link>
            </Typography> */}
            <Box style={{ flex: 1 }}>
              <Link color="textPrimary" to="/" >
                <img
                  src={PeakLogo}
                  className={classes.peakLogo}
                />
              </Link>
            </Box>

            <Box mr={5}>
              <Link color="textPrimary" to="/" className={classes.link}>
                HOME
              </Link>
              <Link color="textPrimary" to="/thebasecamp" className={classes.link}>
                The Base Camp (Farm)
              </Link>

              <Link color="textPrimary" to="/thesummit" className={classes.link}>
                The Summit (Stake)
              </Link>
              <Link color="textPrimary" to="/pond" className={classes.link}>
                The Pond
              </Link>
              <Link color="textPrimary" to="/swap" className={classes.link}>
                Swap
              </Link>
              <a href="https://peakfinance-dao.gitbook.io/" target='_rel' className={classes.link}>
                DOCS
              </a>
              {/*<Link color="textPrimary" to="/liquidity" className={classes.link}>
                LIQUIDITY
              </Link>
              <Link color="textPrimary" to="/regulations" className={classes.link}>
                REGULATIONS
          </Link>*/}
            </Box>
            <AccountButton text="Connect" />
          </>
        ) : (
          <>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              className={clsx(open && classes.hide)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Peak Finance
            </Typography>

            <Drawer
              className={classes.drawer}
              // onEscapeKeyDown={handleDrawerClose}
              onClose={handleDrawerClose}
              variant="temporary"
              anchor="left"
              open={open}
              classes={{
                paper: classes.drawerPaper,
              }}
            >
              <div>
                <IconButton onClick={handleDrawerClose}>
                  {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
              </div>
              <Divider />
              <List>
                <ListItemLink primary="Home" to="/" />
                <ListItemLink primary="The Base Camp" to="/thebasecamp" />
                <ListItemLink primary="The Summit" to="/thesummit" />
                <ListItemLink primary="The Pond" to="/pond" />
                <ListItemLink primary="Swap" to="/swap" />
                <ListItemLink primary="Liquidity" to="/liquidity" />
                <ListItemLink primary="Regulations" to="/regulations" />
                <ListItem button component="a" href="https://peakfinance-dao.gitbook.io/documentation/">
                  <ListItemText>Docs</ListItemText>
                </ListItem>
                <ListItem style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AccountButton text="Connect" />
                </ListItem>
              </List>
            </Drawer>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Nav;
