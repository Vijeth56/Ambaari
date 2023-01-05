/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("event_note", function (table) {
    table.increments("note_id").primary();
    table
      .integer("event_booking_id")
      .notNullable()
      .references("event_booking_id")
      .inTable("event_booking");
    table.string("note").notNullable();
    table.timestamp("deleted_at").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("event_note");
};
