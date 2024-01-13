/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('guest_info', function (table) {
            table.increments('guest_info_id').primary();
            table.string('name').notNullable();
            table.string('email').notNullable();
            table.string('mobile_no').notNullable().unique();
            table.string('alt_mobile_no').notNullable();
            table.string('postal_address').notNullable();
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
        .dropTable("guest_info");
};
