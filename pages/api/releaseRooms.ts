// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/db";
import { ReleaseRoomsResponse } from "../../lib/models/ReleaseRoomsResponse";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReleaseRoomsResponse>
) {
  if (req.method === "POST") {
    let data = req.body;
    let { roomIds, eventId } = data;
    try {
      let eventRes: any = await db("room_booking")
        .update("deleted_at", db.fn.now())
        .whereIn("room_id", roomIds)
        .andWhere("event_id", eventId);

      if (eventRes > 0 && eventRes === roomIds.length) {
        return res.status(200).send({
          error: false,
          msg: "Rooms released!",
        });
      } else if (eventRes > 0) {
        return res.status(400).send({
          error: true,
          msg: "Partially released rooms!",
        });
      } else {
        return res.status(400).send({
          error: true,
          msg: "Cannot release the rooms!",
        });
      }
    } catch (err: any) {
      console.log(err);
      return res.status(400).send({
        error: true,
        msg: "Some unknown error occurred! [Code: 200]",
      });
    }
  } else {
    return res.status(400).send({
      error: true,
      msg: "Some unknown error occurred! [Code: 201]",
    });
  }
}
