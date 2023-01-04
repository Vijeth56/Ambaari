// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any[] | Error>
) {
  try {
    let eventId = JSON.parse(req.body).id;
    if (eventId > 0) {
      let data = await db("events_view").where("event_booking_id", eventId);
      if (data && data.length > 0) {
        let roomsData = await db("room_bookings_view").where(
          "event_id",
          eventId
        );

        let roomsInfo =
          roomsData && roomsData.length > 0
            ? roomsData.map((d) => ({
                key: d.room_id,
                value: d.room_no,
                floor: d.floor,
              }))
            : [];

        let eventInfo = {
          ...data[0],
          rooms: roomsInfo,
        };
        res.status(200).json(eventInfo);
      } else {
        res.status(400).send(new Error("Invalid Event Id!"));
      }
    } else {
      res.status(400).send(new Error("No Valid Events Found!"));
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(new Error("Unknown Error!"));
  }
}
