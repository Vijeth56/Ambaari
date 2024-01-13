

exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('advance_booking').del()
    .then(async function () {
      // Inserts seed entries
      const seedData = [];

    
        seedData.push({
          guest_info_id: 1, 
          name: "test1",
          mobile_no: "9999999999",
          alt_mobile_no: "5656565656",
          email_address: "test1@gmail.com",
          room_type: 'Sample Room Type',
          room_no: 101,
          event_start: "2020-06-22 19:10:25-07",
          event_end: "2020-06-23 19:10:25-07",
          total_amount: 300,
          tenant_id: 1,
        });
      

      await knex('advance_booking').insert(seedData);
    });
};
