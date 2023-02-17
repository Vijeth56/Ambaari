module.exports.up = `
  DROP VIEW IF EXISTS "events_transaction_view";
  CREATE OR REPLACE VIEW "events_transaction_view" AS (
    SELECT
    e.event_booking_id,
    e.event_start,
    e.event_end,
    e.venue_type,
    e.total_fee,
    t.payment_type,
    t.total_amount
  FROM event_booking e
  LEFT JOIN (SELECT event_booking_id, payment_type, SUM(amount) as total_amount
  FROM transactions  Group By event_booking_id,payment_type) t ON e.event_booking_id = t.event_booking_id
  );
`;

module.exports.down = 'DROP VIEW "events_transaction_view";';
