module.exports.up = `
  DROP VIEW IF EXISTS "events_transaction_view";
  CREATE OR REPLACE VIEW "events_transaction_view" AS (
    SELECT
      e.event_booking_id,
      e.event_start,
      e.event_end,
      e.venue_type,
      e.total_fee,
      SUM(t.amount) as total_amount
    FROM event_booking e
    LEFT JOIN transactions t ON (e.event_booking_id = t.event_booking_id)
    WHERE (e.deleted_at IS NULL)
    Group By e.event_booking_id,e.event_start,e.total_fee,e.venue_type
  );
`;

module.exports.down = 'DROP VIEW "events_transaction_view";';
