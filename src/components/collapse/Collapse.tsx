import React, { ReactNode, useState } from 'react';
import { IconAngleDown, IconAngleUp } from 'hds-react';
import './Collapse.scss';

interface BaseCollapseProps {
  collapseContentId: string;
  isOpen: boolean;
}

type ToggleFn = () => void;

interface CollapseProps extends BaseCollapseProps {
  title: ReactNode | string;
  children: ReactNode;
}

interface CollapseButtonProps extends BaseCollapseProps {
  id: string;
  toggleOpen: ToggleFn;
  children: ReactNode;
}

const CollapseButton = ({
  id,
  collapseContentId,
  isOpen,
  toggleOpen,
  children,
}: CollapseButtonProps): JSX.Element => {
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (event.keyCode === 13) {
      toggleOpen();
    }
  };

  return (
    <button
      id={id}
      type="button"
      aria-expanded={isOpen}
      aria-controls={collapseContentId}
      className="collapse-button"
      onKeyDown={onKeyDown}
      onClick={(): void => toggleOpen()}>
      {children}
      {isOpen ? (
        <IconAngleUp className="collapse-button-icon" aria-hidden="true" />
      ) : (
        <IconAngleDown className="collapse-button-icon" aria-hidden="true" />
      )}
    </button>
  );
};

export default function ({
  collapseContentId,
  title,
  children,
  isOpen,
}: CollapseProps): JSX.Element {
  const buttonId = `${collapseContentId}-button`;
  const [isOpenState, setOpen] = useState<boolean>(isOpen);

  const toggleOpen = (): void => {
    setOpen(!isOpenState);
  };

  return (
    <div className="collapse">
      <h2 className="collapse-header">
        <CollapseButton
          id={buttonId}
          collapseContentId={collapseContentId}
          isOpen={isOpenState}
          toggleOpen={toggleOpen}>
          {title}
        </CollapseButton>
      </h2>
      <div
        id={collapseContentId}
        role="region"
        aria-labelledby={buttonId}
        className={`collapse-content ${!isOpenState && 'hiddenFromScreen'}`}
        hidden={!isOpenState}>
        {children}
      </div>
    </div>
  );
}
