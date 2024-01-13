/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('guest_info', (table) => {
        table.uuid('tenant_id').notNullable().references("tenant_id").inTable('tenant').onDelete('CASCADE');
        table.string('tenant_name').notNullable();
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('guest_info', (table) => {
        table.dropColumn('tenant_id');
        table.dropColumn('tenant_name');
    })
};
