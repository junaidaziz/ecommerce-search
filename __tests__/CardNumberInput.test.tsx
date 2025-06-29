import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CardNumberInput from '@components/form-fields/CardNumberInput';

const setup = (ui: React.ReactElement) => {
  render(ui);
  return screen.getByLabelText(/card number/i) as HTMLInputElement;
};

test('formats card number on user input', () => {
  const handleChange = jest.fn();
  const input = setup(<CardNumberInput name="card" onChange={handleChange} />);
  fireEvent.input(input, { target: { value: '4111111111111111' } });
  expect(input).toHaveValue('4111 1111 1111 1111');
  expect(handleChange).toHaveBeenCalled();
  expect(handleChange.mock.calls[0][0].target.value).toBe('4111 1111 1111 1111');
});

test('updates when value prop changes', () => {
  const { rerender } = render(
    <CardNumberInput name="card" value="4111111111111111" />
  );
  const input = screen.getByLabelText(/card number/i) as HTMLInputElement;
  rerender(<CardNumberInput name="card" value="5500000000000004" />);
  expect(input).toHaveValue('5500 0000 0000 0004');
});

test('invokes onCardTypeChange with detected brand', () => {
  const handleBrand = jest.fn();
  const input = setup(
    <CardNumberInput name="card" onCardTypeChange={handleBrand} />
  );
  fireEvent.input(input, { target: { value: '4111111111111111' } });
  expect(handleBrand).toHaveBeenCalledWith('visa');
});

// Edge case: pasting digits should format correctly

test('pastes digits and formats correctly', () => {
  const input = setup(<CardNumberInput name="card" />);
  fireEvent.paste(input, { clipboardData: { getData: () => '4111111111111111' } } as any);
  // fireEvent.paste does not trigger change by default, so trigger input event
  fireEvent.input(input, { target: { value: '4111111111111111' } });
  expect(input).toHaveValue('4111 1111 1111 1111');
});
