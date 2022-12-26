module.exports.up = `
  DROP VIEW IF EXISTS "events_view";
  CREATE OR REPLACE VIEW "events_view" AS (
    SELECT
      e.event_booking_id,
      e.event_type,
      e.event_start,
      e.event_end,
      e.venue_type,
      e.total_fee,
      g.name,
      g.email,
      g.mobile_no,
      g.alt_mobile_no,
      g.postal_address
    FROM event_booking e
    INNER JOIN guest_info g ON (e.guest_info_id = g.guest_info_id)
    WHERE (e.deleted_at IS NULL)
  );
`;

module.exports.down = 'DROP VIEW "events_view";';
