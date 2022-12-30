// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any[] | Error>
) {
  try {
    let eventIds = JSON.parse(req.body).ids;
    if (eventIds && eventIds.length > 0) {
      let data = await db("events_view").whereIn("event_booking_id", eventIds);
      res.status(200).json(data);
    } else {
      res.status(400).send(new Error("No Valid Events Found!"));
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(new Error("Unknown Error!"));
  }
}
