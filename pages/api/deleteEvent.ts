// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { DeleteEventResponse } from "../../lib/models/DeleteEventResponse";
import { db } from "../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeleteEventResponse>
) {
  if (req.method === "POST") {
    let data = req.body;
    let { id } = data;
    try {
      if (id > 0) {
        let result = await db("event_booking")
          .update({
            deleted_at: db.fn.now(),
          })
          .where("event_booking_id", id);

        if (result > 0) {
          return res.status(200).send({
            error: false,
            msg: "Event Deleted!",
          });
        } else {
          return res.status(200).send({
            error: true,
            msg: "No Event Found!",
          });
        }
      } else {
        return res.status(400).send({
          error: true,
          msg: "Failed to delete the event. [Invalid Event]!",
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
