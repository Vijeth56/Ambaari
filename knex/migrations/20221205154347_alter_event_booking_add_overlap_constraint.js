/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.raw("ALTER TABLE event_booking ADD CONSTRAINT \
    no_overlapping_times_for_event_type EXCLUDE USING \
    gist(venue_type WITH =, tstzrange(\"from\", \"to\", '[)') WITH &&) WHERE (NOT deleted);"
    )
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {

};
