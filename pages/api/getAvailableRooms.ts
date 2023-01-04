// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any[] | Error>
) {
  try {
    let { startTime, endTime } = JSON.parse(req.body);

    let result = await db.raw(
      `SELECT * FROM room_details WHERE is_active=TRUE AND room_details_id NOT IN ( SELECT room_id FROM room_bookings_view WHERE '${startTime}' < check_out AND '${endTime}' > check_in)`
    );

    if (result && result.rows && result.rows.length > 0) {
      let rooms = result.rows.map((d: any) => ({
        key: d.room_details_id,
        value: d.room_no,
        floor: d.floor,
      }));

      res.status(200).send(rooms);
    } else {
      res.status(200).send([]);
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(new Error("Unknown Error!"));
  }
}
