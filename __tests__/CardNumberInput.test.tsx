import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CardNumberInput from '@components/form-fields/CardNumberInput';

// Mock cleave.js to avoid relying on the real implementation in tests
jest.mock('cleave.js/react', () => {
  const React = require('react');
  return function MockCleave({ onInit, htmlRef, onChange, value, ...rest }: any) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useEffect(() => {
      if (onInit) {
        const instance = {
          setRawValue: (val: string) => {
            if (inputRef.current) {
              inputRef.current.value = val.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
            }
          },
          getFormattedValue: () => inputRef.current?.value || '',
        };
        onInit(instance);
      }
    }, [onInit]);
    React.useEffect(() => {
      if (inputRef.current && value !== undefined) {
        inputRef.current.value = value.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      }
    }, [value]);
    return (
      <input
        ref={(el) => {
          inputRef.current = el;
          htmlRef?.(el);
        }}
        onChange={(e) => {
          if (onChange) onChange(e);
        }}
        value={value}
        {...rest}
      />
    );
  };
});

const setup = async (ui: React.ReactElement) => {
  render(ui);
  const input = await screen.findByLabelText(/card number/i);
  // wait for cleave to initialize
  await waitFor(() => expect(input).toBeInTheDocument());
  return input as HTMLInputElement;
};

test('formats card number on user input', async () => {
  const handleChange = jest.fn();
  const input = await setup(<CardNumberInput name="card" onChange={handleChange} />);
  fireEvent.change(input, { target: { value: '4111111111111111' } });
  expect(input).toHaveValue('4111 1111 1111 1111');
  expect(handleChange).toHaveBeenCalled();
  expect(handleChange.mock.calls[0][0].target.value).toBe('4111 1111 1111 1111');
});

test('updates when value prop changes', async () => {
  const { rerender } = render(<CardNumberInput name="card" value="4111111111111111" />);
  const input = await screen.findByLabelText(/card number/i);
  rerender(<CardNumberInput name="card" value="5500000000000004" />);
  await waitFor(() => expect(input).toHaveValue('5500 0000 0000 0004'));
});

test('invokes onCardTypeChange with detected brand', async () => {
  const handleBrand = jest.fn();
  const input = await setup(
    <CardNumberInput name="card" onCardTypeChange={handleBrand} />
  );
  fireEvent.change(input, { target: { value: '4111111111111111' } });
  expect(handleBrand).toHaveBeenCalledWith('visa');
});
