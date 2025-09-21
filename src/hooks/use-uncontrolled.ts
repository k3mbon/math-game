import { useState, useCallback, useRef, useEffect } from 'react';

interface UseUncontrolledOptions<T> {
  value?: T;
  defaultValue?: T;
  finalValue: T;
  onChange?: (value: T) => void;
}

export function useUncontrolled<T>({
  value,
  defaultValue,
  finalValue,
  onChange,
}: UseUncontrolledOptions<T>): [T, (value: T) => void, boolean] {
  const controlled = value !== undefined;
  const initialValue = controlled ? value : defaultValue !== undefined ? defaultValue : finalValue;

  const [uncontrolledValue, setUncontrolledValue] = useState(initialValue);
  const valueRef = useRef(initialValue);

  useEffect(() => {
    if (controlled) {
      valueRef.current = value;
    } else {
      valueRef.current = uncontrolledValue;
    }
  }, [controlled, value, uncontrolledValue]);

  const handleChange = useCallback(
    (nextValue: T) => {
      if (!controlled) {
        setUncontrolledValue(nextValue);
      }
      onChange?.(nextValue);
    },
    [controlled, onChange]
  );

  return [valueRef.current, handleChange, controlled];
}