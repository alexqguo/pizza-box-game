import React from 'react';
import { Popover } from '@material-ui/core';
import useStyles from '../styles';
import rules from '../static/ruleSuggestions.json';

interface Props {
  open: boolean,
  popoverAnchor: HTMLElement | null,
  closePopover: () => void
}

export default (props: Props) => {
  const classes = useStyles();
;
  return (
    <Popover 
      anchorEl={props.popoverAnchor}
      open={props.open}
      onClose={props.closePopover}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <div className={classes.ruleSuggestionPopoverContent}>
        <ul>{rules.map((rule: string) => <li>{rule}</li>)}</ul>
      </div>
    </Popover>
  );
};