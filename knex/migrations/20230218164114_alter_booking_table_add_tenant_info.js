/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('event_booking', (table) => {
        table.uuid('tenant_id').notNullable().references("tenant_id").inTable('tenant').onDelete('CASCADE');
        table.string('tenant_name').notNullable();
        table.string('deleted_by').notNullable();
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('event_booking', (table) => {
        table.dropColumn('tenant_id');
        table.dropColumn('tenant_name');
        table.dropColumn('deleted_by');
    })
};