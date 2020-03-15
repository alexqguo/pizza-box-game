import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('I definitely test all my code', () => {
  const { getByTestId } = render(<App />);
  const wrapper = getByTestId('asdf');
  expect(wrapper).toBeInTheDocument();
  // const emoji = getByText(/create new game/i);
  // expect(emoji).toBeInTheDocument();
});
