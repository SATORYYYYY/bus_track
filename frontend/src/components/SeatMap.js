import React from 'react';
import { Button, Row, Col } from 'react-bootstrap';

function SeatMap({ totalSeats, bookedSeats, selectedSeat, onSelect }) {
  const seats = Array.from({ length: totalSeats }, (_, i) => i + 1);

  return (
    <Row>
      {seats.map(seat => (
        <Col key={seat} xs={2} className="mb-2">
          <Button
            variant={bookedSeats.includes(seat) ? 'secondary' : (selectedSeat === seat ? 'primary' : 'outline-primary')}
            disabled={bookedSeats.includes(seat)}
            onClick={() => onSelect(seat)}
            style={{ width: '100%' }}
          >
            {seat}
          </Button>
        </Col>
      ))}
    </Row>
  );
}

export default SeatMap;