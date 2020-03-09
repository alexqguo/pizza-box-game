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
