import { useState, useCallback } from 'react';

export function useStateWithValidation<T>(
  initialValue: T,
  validator: (value: T) => boolean
) {
  const [value, setValue] = useState(initialValue);
  const [isValid, setIsValid] = useState(() => validator(initialValue));

  const handleChange = useCallback(
    (newValue: T) => {
      setValue(newValue);
      setIsValid(validator(newValue));
    },
    [validator]
  );

  return [value, handleChange, isValid] as const;
}