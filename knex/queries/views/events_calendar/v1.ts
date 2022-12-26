module.exports.up = `
  DROP VIEW IF EXISTS "events_calendar_view";
  CREATE OR REPLACE VIEW "events_calendar_view" AS (
    SELECT date(evdate.evdate) AS evdate,
    e.event_booking_id,
    e.venue_type,
    e.event_type,
    e.event_start,
    e.event_end
   FROM generate_series(( SELECT min(event_booking.event_start) AS min
           FROM event_booking), ( SELECT max(event_booking.event_end) + '1 day'::interval AS max
           FROM event_booking), '1 day'::interval day) evdate(evdate)
    JOIN event_booking e ON date(evdate.evdate) >= date(e.event_start) AND date(evdate.evdate) <= date(e.event_end) WHERE e.deleted_at IS NULL
  );
`;

module.exports.down = 'DROP VIEW "events_calendar_view";';
