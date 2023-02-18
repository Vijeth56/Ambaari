/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('tenant', function (table) {
            table.uuid('tenant_id').primary().defaultTo(knex.raw('uuid_generate_V4()'));
            table.string('brand_name').notNullable();
            table.string('official_name').notNullable();
            table.string('gst_number').nullable();
            table.string('address_line_1').nullable();
            table.string('address_line_2').nullable();
            table.string('email').nullable();
            table.string('phone_no').nullable();
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
        .dropTable("tenant");
};
