// migrations/xxxx_create_advance_booking_with_room_details_view.js

exports.up = function (knex) {
    return knex.raw(`
      CREATE VIEW advance_booking_view AS  
      SELECT
          ab.adv_booking_id,
          ab.name,
          ab.mobile_no,
          ab.email_address,
          ab.booking_start,
          ab.booking_end,
          rd.room_details_id,
          rd.room_no,
          rd.room_type,
          ab.tenant_id
      FROM
          advance_booking ab
      JOIN
          room_details rd ON ab.room_details_id = rd.room_details_id;
    `);
  };
  
  exports.down = function (knex) {
    return knex.raw('DROP VIEW IF EXISTS advance_booking_with_room_details;');
  };
  