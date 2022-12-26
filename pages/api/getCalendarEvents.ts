// SELECT evdate, json_agg(json_build_object('id', event_booking_id, 'venue', venue_type)) FROM public.events_calendar_view GROUP BY (evdate)

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/db";
import moment from "moment";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any[] | Error>
) {
  try {
    let data = await db
      .select("*")
      .fromRaw(
        "(SELECT to_char(evdate, 'DD-MM-YYYY') as evdate, json_agg(json_build_object('id', event_booking_id, 'venue', venue_type, 'start', event_start, 'end', event_end)) as events FROM events_calendar_view GROUP BY (evdate)) AS j"
      );

    let events = data.reduce((obj, d) => {
      obj[d.evdate] = [...d.events];
      return obj;
    }, {});

    res.status(200).json(events);
  } catch (error) {
    console.log(error);
    res.status(400).send(new Error("Unknown Error!"));
  }
}
