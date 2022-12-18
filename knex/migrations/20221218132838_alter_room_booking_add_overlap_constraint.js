/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.raw("ALTER TABLE room_booking ADD CONSTRAINT \
    prevent_double_room_booking EXCLUDE USING \
    gist(room_id WITH =, tstzrange(check_in, check_out, '[)') WITH &&) WHERE (deleted_at IS NULL);"
    )
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.raw("ALTER TABLE room_booking DROP CONSTRAINT IF EXISTS prevent_double_room_booking")
};
