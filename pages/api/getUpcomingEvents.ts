// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { UpcomingEventData } from "../../lib/models/UpcomingEventData";
import { db } from "../../lib/db";
import moment from "moment";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UpcomingEventData[] | Error>
) {
  try {
    let data = await db("events_view").whereRaw(`"event_end" >= ? - ?::INTERVAL`, [
      db.fn.now(),
      "30 day",
    ]);
    let events = data.map<UpcomingEventData>((d) => {
      let singleDayEvent = moment(d.event_start).isSame(moment(d.event_end), "day");
      return {
        bookingId: d.event_booking_id,
        eventType: d.event_type,
        name: d.name,
        startDateTime: d.event_start,
        endDateTime: d.event_end,
        singleDayEvent,
        venueType: d.venue_type,
      };
    });

    res.status(200).json(events);
  } catch (error) {
    console.log(error);
    res.status(400).send(new Error("Unknown Error!"));
  }
}
