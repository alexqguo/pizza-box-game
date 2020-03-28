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
    drawerIconButtonBox: {
      display: 'inlineBlock',
      margin: '0 auto',
      padding: 5
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
      marginBottom: 30
    },
    gameFormTextField: {
      marginBottom: 5
    },
    gameModalTabs: {
      marginBottom: 16,
    },
    currentPlayer: {
      fontWeight: 'bold',
    },
    idlePlayer: {
      '&::after': {
        content: '"👈"', // Who the fuck knows why it needs quotes but it does
        display: 'block',
        marginLeft: 5
      }
    },
    busyPlayer: {
      '&::after': {
        content: '"💭"',
        display: 'block',
        marginLeft: 5
      }
    },
    playerColor: {
      display: 'inline-block',
      width: 16,
      height: 16,
      border: '1px solid gray',
      marginRight: 4,
      borderRadius: 50
    },
    createRuleContainer: {
      marginBottom: 20,
    },
    createRuleInput: {
      width: 400,
    },
    createRuleButton: {
      verticalAlign: 'bottom',
      marginLeft: 10,
    },
    alertText: {
      fontSize: '1.5rem'
    }
  })
));
