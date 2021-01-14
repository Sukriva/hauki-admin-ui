import React, { ReactNodeArray } from 'react';
import { Notification, NotificationType } from 'hds-react';
import './Toast.scss';

type ToastProps = {
  type: NotificationType;
  label: string;
  text: string;
  onClose?: () => void;
  dataTestId?: string;
};

export const ToastContainer = ({
  children,
}: {
  children: ReactNodeArray;
}): JSX.Element => <div className="toast-container">{children}</div>;

export default React.memo(
  ({
    type,
    label,
    text,
    onClose,
    dataTestId,
  }: ToastProps & { type: NotificationType }): JSX.Element => (
    <Notification
      position="top-right"
      autoClose
      size="small"
      label={label}
      type={type}
      onClose={(): void => {
        if (onClose) {
          onClose();
        }
      }}
      {...(dataTestId ? { dataTestId } : {})}>
      {text}
    </Notification>
  )
);
