// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { AddEventResponse } from "../../lib/models/AddEventResponse";
import { db } from "../../lib/db";

const vContraintMap = new Map<string, string>();
vContraintMap.set("Hall", "((0, 0), 0.5)");
vContraintMap.set("Garden", "((1, 1), 0.5)");
vContraintMap.set("H & G", "((0, 0), 1)");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AddEventResponse>
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
        error: false,
        msg: "New Event created!",
        guestId: guest_info_id,
        bookingId: event_booking_id,
      });
    } catch (err: any) {
      await trx?.rollback();
      if (
        err?.constraint &&
        err.constraint === "no_overlapping_times_for_venue"
      ) {
        return res.status(200).send({
          error: true,
          msg: "Venue is already booked for this time slot!",
        });
      } else if (
        err?.constraint &&
        err.constraint === "guest_info_mobile_no_unique"
      ) {
        return res.status(200).send({
          error: true,
          msg: "Mobile number is already taken!",
        });
      }

      console.log(err);
      return res.status(400).send({
        error: true,
        msg: "Some unknown error occurred! [Code: 100]",
      });
    }
  } else {
    return res.status(400).send({
      error: true,
      msg: "Some unknown error occurred! [Code: 101]",
    });
  }
}