/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('advance_booking', function (table) {
            table.increments('adv_booking_id').primary();
            // guest_info_id removed
            table.string('name').notNullable();
            table.string('mobile_no').notNullable();
            // alternate_no. removed
            table.string('email_address').notNullable();
            // room_type removed
            // room_no removed
            table.integer('room_details_id');
            table.timestamp('booking_start').notNullable();
            table.timestamp('booking_end').notNullable();
            // total_amount removed

            table.integer('tenant_id').notNullable();

            table.timestamp('deleted_at').nullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTable("advance_booking");
};
