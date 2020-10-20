import React, { useState } from 'react';
import { Dropdown, TextInput, Button } from 'hds-react';
import './Openings.scss';

const OpeningDay = ({ text }: { text: string }) => {
  const [active, setActive] = useState(false);

  return (
    <button
      type="button"
      className={`opening-day-button ${
        active ? 'opening-day-button-active' : ''
      }`}
      onClick={() => setActive(!active)}>
      {text}
    </button>
  );
};

const Opening = (): JSX.Element | null => {
  return (
    <div className="opening-fieldset">
      <div className="opening-field">
        <label>Päivät</label>
        <OpeningDay text="Ma" />
        <OpeningDay text="Ti" />
        <OpeningDay text="Ke" />
        <OpeningDay text="To" />
        <OpeningDay text="Pe" />
        <OpeningDay text="La" />
        <OpeningDay text="Su" />
      </div>
      <div className="opening-field">
        <label>Kellonaika</label>
        <div className="opening-field-time">
          <Dropdown
            placeholder="Valitse alkuaika"
            options={[
              { label: '8:30' },
              { label: '9:00' },
              { label: '9:30' },
              { label: '10:00' },
              { label: '10:30' },
              { label: '15:30' },
              { label: '16:00' },
              { label: '16:30' },
              { label: '17:00' },
              { label: '17:30' },
            ]}
          />
        </div>
        <div className="opening-field-time">
          <Dropdown
            placeholder="Valitse loppuaika"
            options={[
              { label: '8:30' },
              { label: '9:00' },
              { label: '9:30' },
              { label: '10:00' },
              { label: '10:30' },
              { label: '15:30' },
              { label: '16:00' },
              { label: '16:30' },
              { label: '17:00' },
              { label: '17:30' },
            ]}
          />
        </div>
      </div>
      <div className="opening-field data-input-status">
        <label>Status</label>
        <div className="data-input-subfield">
          <Dropdown
            placeholder="Valitse status"
            options={[
              { label: 'Auki' },
              { label: 'Itsepalvelu' },
              { label: 'Kiinni' },
            ]}
          />
        </div>
      </div>
      <div className="opening-field opening-field-desc">
        <label>Kuvaus</label>
        <div>
          <div className="opening-input-text">
            <TextInput id="a" placeholder="Valinnainen lyhyt kuvaus suomeksi" />
          </div>
          <div className="opening-input-text">
            <TextInput
              id="d"
              placeholder="Valfri kort beskrivning pä svenska"
            />
          </div>
          <div className="opening-input-text">
            <TextInput
              id="d"
              placeholder="Optional short description in English"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Openings(): JSX.Element {
  const [openings, setOpenings] = useState([{}]);

  return (
    <div>
      {openings.map(() => (
        <Opening />
      ))}
      <div className="opening-field">
        <Button
          size="small"
          className="add-new-opening-period-button"
          variant="secondary"
          onClick={() => setOpenings([...openings, {}])}>
          Lisää uusi +
        </Button>
      </div>
    </div>
  );
}
