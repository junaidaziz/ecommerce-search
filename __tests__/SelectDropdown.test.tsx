import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SelectDropdown, {
  SelectOption,
} from '../components/form-fields/SelectDropdown';

const options: SelectOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
];

test('single select calls onChange with option', () => {
  const handleChange = jest.fn();
  render(
    <SelectDropdown name="fruit" options={options} onChange={handleChange} />
  );
  const combo = screen.getByRole('combobox');
  fireEvent.keyDown(combo, { key: 'ArrowDown' });
  fireEvent.click(screen.getByText('Banana'));
  expect(handleChange).toHaveBeenCalledWith(options[1]);
});

test('multi select returns array of options', () => {
  const handleChange = jest.fn();
  render(
    <SelectDropdown
      name="fruit"
      options={options}
      isMulti
      onChange={handleChange}
    />
  );
  const combo = screen.getByRole('combobox');
  fireEvent.keyDown(combo, { key: 'ArrowDown' });
  fireEvent.click(screen.getByText('Apple'));
  expect(handleChange).toHaveBeenCalledWith([options[0]]);
});
