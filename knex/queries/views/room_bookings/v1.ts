module.exports.up = `
  DROP VIEW IF EXISTS "room_bookings_view";
  CREATE OR REPLACE VIEW "room_bookings_view" AS (
    SELECT rb.room_id,
    rb.event_id,
    rb.check_in,
    rb.check_out,
    rd.room_no,
    rd.floor,
    rd.description
   FROM room_booking rb
   LEFT JOIN event_booking e ON rb.event_id = e.event_booking_id
   LEFT JOIN room_details rd ON rb.room_id = rd.room_details_id
   WHERE (rb.deleted_at IS NULL) AND (e.deleted_at IS NULL)
  );
`;

module.exports.down = 'DROP VIEW "room_bookings_view";';
