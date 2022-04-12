//Your theme for the new stuff using material UI has been copied here so it doesn't conflict
import { createTheme } from '@material-ui/core/styles';

const newTheme = createTheme({
  palette: {
    type: 'dark',
    text: {
      primary: '#FFF',
    },
    background: {
      default: '#121212',
      paper: 'rgba(0, 0, 0, 0.7)',
    },
    primary: {
      light: '#31DBBE',
      main: '#19bea2',
      dark: '#16A28A',
      contrastText: '#000',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
    action: {
      disabledBackground: '#CDCDCD',
      active: '#000',
      hover: '#000',
    },
  },
  typography: {
    color: '#FFF',
    fontFamily: ['"Inter"', 'sans-serif'].join(','),
  },
});

export default newTheme;
