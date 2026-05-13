import React from 'react';
import { Button, Row, Col, Container } from 'react-bootstrap';
import { FaCheck, FaTimes, FaChair } from 'react-icons/fa';

function SeatMap({ totalSeats, bookedSeats, selectedSeat, onSelect }) {
  const seats = Array.from({ length: totalSeats }, (_, i) => i + 1);

  // Разделяем места на ряды по 4 места (типичная схема автобуса)
  const rows = [];
  for (let i = 0; i < seats.length; i += 4) {
    rows.push(seats.slice(i, i + 4));
  }

  return (
    <Container className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '16px' }}>
      {/* Легенда */}
      <div className="d-flex justify-content-center gap-4 mb-3 flex-wrap">
        <div className="d-flex align-items-center gap-2">
          <div style={{ width: '32px', height: '32px', backgroundColor: '#5D111A', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <FaCheck size={16} />
          </div>
          <span style={{ fontSize: '1rem' }}>Выбрано</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div style={{ width: '32px', height: '32px', backgroundColor: '#6c757d', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <FaTimes size={16} />
          </div>
          <span style={{ fontSize: '1rem' }}>Занято</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div style={{ width: '32px', height: '32px', backgroundColor: '#fff', border: '3px solid #5D111A', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5D111A' }}>
            <FaChair size={16} />
          </div>
          <span style={{ fontSize: '1rem' }}>Свободно</span>
        </div>
      </div>

      {/* Схема салона */}
      <div className="mb-3 p-2" style={{ backgroundColor: '#e9ecef', borderRadius: '8px', textAlign: 'center' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <FaChair /> Перед автобуса
        </span>
      </div>

      {rows.map((row, rowIndex) => (
        <Row key={rowIndex} className="g-2 mb-2 justify-content-center">
          {row.map((seat, seatIndex) => (
            <React.Fragment key={seat}>
              <Col xs={3} sm={2}>
                <Button
                  variant={bookedSeats.includes(seat) ? 'secondary' : (selectedSeat === seat ? 'primary' : 'outline-primary')}
                  disabled={bookedSeats.includes(seat)}
                  onClick={() => onSelect(seat)}
                  style={{
                    width: '100%',
                    height: '56px',
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    borderWidth: '3px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem'
                  }}
                  className={selectedSeat === seat ? 'shadow' : ''}
                >
                  {bookedSeats.includes(seat) ? <FaTimes size={14} /> : <FaChair size={14} />}
                  {seat}
                </Button>
              </Col>
              {/* Проход между 2 и 3 местом в ряду */}
              {seatIndex === 1 && (
                <Col xs={2} className="d-flex align-items-center justify-content-center">
                  <div style={{ width: '20px' }}></div>
                </Col>
              )}
            </React.Fragment>
          ))}
        </Row>
      ))}

      {selectedSeat && (
        <div className="mt-3 p-3 text-center" style={{ backgroundColor: '#d4edda', borderRadius: '12px' }}>
          <span style={{ fontSize: '1.3rem', fontWeight: '600', color: '#155724', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <FaCheck /> Выбрано место: {selectedSeat}
          </span>
        </div>
      )}
    </Container>
  );
}

export default SeatMap;
