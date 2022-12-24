/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.raw("ALTER TABLE event_booking ADD CONSTRAINT \
    no_overlapping_times_for_venue EXCLUDE USING \
    gist(_venue WITH &&, tstzrange(\"event_start\", \"event_end\", '[)') WITH &&) WHERE (deleted_at IS NULL);"
    )
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.raw("ALTER TABLE event_booking DROP CONSTRAINT IF EXISTS no_overlapping_times_for_venue")
};
