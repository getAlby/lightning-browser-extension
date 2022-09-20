import React from 'react';
import { render, screen } from '@testing-library/react';
import BoostButton from './BoostButton';

test('renders learn react link', () => {
  render(<BoostButton lnurl="test" />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
