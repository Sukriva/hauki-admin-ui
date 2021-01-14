import React, { ReactNode, ReactNodeArray, useCallback, useState } from 'react';
import { NotificationType } from 'hds-react';
import createGenericContext from '../../common/utils/context/GenericContext';
import Toast, { ToastContainer } from './Toast';

export type ToastData = {
  key: string;
  type: NotificationType;
  label: string;
  text: string;
  dataTestId?: string;
  onClose?: () => void;
  isShown?: boolean;
};

export type ToastContextProps = {
  showToast: (toast: ToastData) => void;
};

const [useToastFn, ToastContextProvider] = createGenericContext<
  ToastContextProps
>();

export const ToastProvider = ({
  children,
}: {
  children: ReactNode | ReactNodeArray;
}): JSX.Element => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback(
    (toast: ToastData): void =>
      setToasts((currentToasts) => [...currentToasts, toast]),
    []
  );

  const removeToast = useCallback(
    (removeKey: string): void =>
      setToasts((currentToasts) =>
        currentToasts.filter(({ key }) => key !== removeKey)
      ),
    []
  );

  return (
    <>
      <ToastContextProvider value={{ showToast }}>
        {children}
      </ToastContextProvider>
      <ToastContainer>
        {toasts.map(({ key, label, text, type, dataTestId, onClose }) => (
          <Toast
            label={label}
            text={text}
            type={type}
            dataTestId={dataTestId}
            onClose={(): void => {
              if (onClose) {
                onClose();
              }
              removeToast(key);
            }}
          />
        ))}
      </ToastContainer>
    </>
  );
};

export const useToast = useToastFn;
