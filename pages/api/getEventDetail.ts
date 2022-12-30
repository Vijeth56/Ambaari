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
      res.status(200).json(data);
    } else {
      res.status(400).send(new Error("No Valid Events Found!"));
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(new Error("Unknown Error!"));
  }
}
