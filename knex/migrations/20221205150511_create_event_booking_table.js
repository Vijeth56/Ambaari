/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('event_booking', function (table) {
            table.increments('event_booking_id').primary();
            table.integer('guest_info_id').notNullable().references('guest_info_id').inTable('guest_info').onDelete('CASCADE');
            table.string('event_type').notNullable();
            table.integer('total_fee').notNullable();
            table.timestamp('event_start').notNullable();
            table.timestamp('event_end').notNullable();
            table.text('venue_type').notNullable().defaultTo('H + G');
            table.specificType('_venue', 'circle').defaultTo('((0,0), 1)');
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
        .dropTable("event_booking");
};
