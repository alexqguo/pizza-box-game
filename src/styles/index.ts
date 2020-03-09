import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const drawerWidth = 200;

export default makeStyles((theme: Theme) => (
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      backgroundColor: 'darkviolet' // may want to make this a theme primary color instead
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    toolbarOffset: theme.mixins.toolbar,
    main: {
      flexGrow: 1,
      padding: theme.spacing(3)
    },
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modalPaper: {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
      width: '70%'
    },
    formInputs: {
      width: 300,
      marginBottom: 30
    },
    gameFormTextField: {
      marginBottom: 5
    },
    gameModalTabs: {
      marginBottom: 16,
    },
    canvas: {
      display: 'block',
      margin: 'auto',
      border: '1px solid black'
    },
    activePlayer: {
      fontWeight: 'bold',
      '&::after': {
        content: '"👈"', // Who the fuck knows why it needs quotes but it does
        display: 'block',
        marginLeft: '5px'
      }
    }
  })
));
