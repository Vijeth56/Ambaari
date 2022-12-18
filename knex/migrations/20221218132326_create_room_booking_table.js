/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('room_booking', function (table) {
            table.increments('room_booking_id').primary();
            table.integer('room_id').notNullable().references("room_details_id").inTable("room_details");
            table.integer('event_id').nullable().references('event_booking_id').inTable('event_booking');
            table.timestamp('check_in').notNullable();
            table.timestamp('check_out').notNullable();
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
        .dropTable("room_booking");
};
