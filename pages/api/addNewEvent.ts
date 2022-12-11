// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Success } from "../../lib/models/Success";
import { db } from "../../lib/db";

const vContraintMap = new Map<string, string>();
vContraintMap.set("Hall", "((0, 0), 0.5)");
vContraintMap.set("Garden", "((1, 1), 0.5)");
vContraintMap.set("H & G", "((0, 0), 1)");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Success | Error>
) {
  if (req.method === "POST") {
    let data = req.body;
    let trx;
    try {
      trx = await db.transaction();
      let gResult = await trx("guest_info")
        .insert({
          name: data.name,
          email: data.emailAddress,
          mobile_no: data.mobileNo,
          alt_mobile_no: data.altMobileNo,
          postal_address: data.postalAddress,
        })
        .returning("guest_info_id");

      const { guest_info_id } = gResult[0];
      let eResult = await trx("event_booking")
        .insert({
          guest_info_id: guest_info_id,
          event_type: data.eventType,
          venue_type: data.venueType,
          _venue: vContraintMap.get(data.venueType) || "",
          from: data.dateTimeRange[0],
          to: data.dateTimeRange[1],
          total_fee: data.totalAmount,
        })
        .returning("event_booking_id");

      const { event_booking_id } = eResult[0];
      await trx.commit();
      console.log(eResult);
      return res.status(200).send({
        msg: "New Event created!",
        guestId: guest_info_id,
        bookingId: event_booking_id,
      });
    } catch (err) {
      await trx?.rollback();
      console.log(err);
      return res.status(400).send(new Error("Unknown Error!"));
    }
  } else {
    return res.status(400).send(new Error("Invalid API"));
  }
}
