import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import TagInput from '../components/form-fields/TagInput';

interface FormValues {
  tags: string[];
}

global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({ tags: [] }) })
) as jest.Mock;

const TestForm = ({ onSubmit }: { onSubmit: (data: FormValues) => void }) => {
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { tags: [] },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TagInput<FormValues> name="tags" control={control} />
      <button type="submit">Submit</button>
    </form>
  );
};

test('allows creating a new tag', async () => {
  const handleSubmit = jest.fn();
  render(<TestForm onSubmit={handleSubmit} />);

  const input = screen.getByRole('combobox');
  fireEvent.change(input, { target: { value: 'NewTag' } });
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  await waitFor(() => screen.getByText('Create "NewTag"'));
  fireEvent.click(screen.getByText('Create "NewTag"'));

  fireEvent.click(screen.getByText('Submit'));

  await waitFor(() =>
    expect(handleSubmit).toHaveBeenCalledWith(
      { tags: ['NewTag'] },
      expect.anything()
    )
  );
});
