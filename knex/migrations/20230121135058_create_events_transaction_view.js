const v1 = require("../queries/views/events_transaction/v1.ts");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(v1.up);
};

/**
 * @param { import("knextartDate, endDate, venueType").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(v1.down);
};
