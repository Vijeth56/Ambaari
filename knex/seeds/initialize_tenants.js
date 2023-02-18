/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  await knex('tenant').del()
  await knex('tenant').insert([
    {
      brand_name: 'Ambaari',
      official_name: 'LEVITATE VENUES',
      gst_number: "29AAJFL2369Q1ZF",
      address_line_1: "No. 006, Ambaari, Mayurgreenwoods",
      address_line_2: "Srinivasalu Layout, Arekere, Bengaluru-560076",
      email: "info@ambaarivenues.com",
      phone_no: "90089 20900 / 98443 62832"
    },
    {
      brand_name: 'RG',
      official_name: 'ROCK GARDENS',
      gst_number: "29AAJFL2369Q1ZF",
      address_line_1: "",
      address_line_2: "",
      email: "hotelrockgarden@gmail.com",
      phone_no: ""
    },
  ]);
};