/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('room_details').del()
  await knex('room_details').insert([
    { room_no: "03", floor: 1, is_vacant: true, is_active: true, is_clean: true },
    { room_no: "04", floor: 1, is_vacant: true, is_active: true, is_clean: true },
    { room_no: "05", floor: 1, is_vacant: true, is_active: true, is_clean: true },
    { room_no: "06", floor: 1, is_vacant: true, is_active: true, is_clean: true },
    { room_no: "07", floor: 1, is_vacant: true, is_active: true, is_clean: true },
    { room_no: "08", floor: 2, is_vacant: true, is_active: true, is_clean: true },
    { room_no: "09", floor: 2, is_vacant: true, is_active: true, is_clean: true },
    { room_no: "10", floor: 2, is_vacant: true, is_active: true, is_clean: true },
    { room_no: "11", floor: 2, is_vacant: true, is_active: true, is_clean: true },
    { room_no: "12", floor: 2, is_vacant: true, is_active: true, is_clean: true },
    { room_no: "13", floor: 3, is_vacant: true, is_active: true, is_clean: true },
    { room_no: "Bride", floor: 3, is_vacant: true, is_active: true, is_clean: true },
    { room_no: "Groom", floor: 3, is_vacant: true, is_active: true, is_clean: true }
  ]);
};
