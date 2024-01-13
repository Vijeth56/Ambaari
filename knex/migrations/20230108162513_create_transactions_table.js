/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("transactions", function (table) {
    table.increments("transaction_id").primary();
    table
      .integer("event_booking_id")
      .notNullable()
      .references("event_booking_id")
      .inTable("event_booking").onDelete('CASCADE');
    table.string("message").notNullable();
    table.integer("amount").notNullable();
    table.string("payment_type").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("transactions");
};
