// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { UpcomingEventData } from "../models/UpcomingEventData";
import { db } from "../../lib/db";
import moment from "moment";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpcomingEventData[] | Error>
) {
  try {
    let data = await db("events_view").whereRaw(`"to" >= ? - ?::INTERVAL`, [
      db.fn.now(),
      "30 day",
    ]);
    let events = data.map<UpcomingEventData>((d) => {
      let singleDayEvent = moment(d.from).isSame(moment(d.to), "day");
      return {
        bookingId: d.event_booking_id,
        eventType: d.event_type,
        name: d.name,
        startDateTime: d.from,
        endDateTime: d.to,
        singleDayEvent,
        venueType: d.venue_type,
        emailAddress: d.email,
        mobileNo: d.mobile_no,
        altMobileNo: d.alt_mobile_no,
        postalAddress: d.postal_address,
      };
    });

    res.status(200).json(events);
  } catch (error) {
    console.log(error);
    res.status(400).send(new Error("Unknown Error!"));
  }
}
