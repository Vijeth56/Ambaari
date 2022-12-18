/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('room_details', function (table) {
            table.increments('room_details_id').primary();
            table.string('room_no').notNullable();
            table.integer('floor').notNullable();
            table.string('description');
            table.boolean('is_vacant').defaultTo(true);
            table.boolean('is_active').defaultTo(true);
            table.boolean('is_clean').defaultTo(true);
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
        .dropTable("room_details");
};
