// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/db";
import { BookRoomsResponse } from "../../lib/models/BookRoomsResponse";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BookRoomsResponse>
) {
  if (req.method === "POST") {
    let data = req.body;
    let { roomIds, eventId } = data;
    try {
      if (eventId > 0) {
        let eventRes = await db("event_booking")
          .where("event_booking_id", eventId)
          .whereNull("deleted_at");

        if (eventRes && eventRes.length > 0) {
          let eventStart = eventRes[0].event_start;
          let eventEnd = eventRes[0].event_end;

          let roomBookings = roomIds.map((id: number) => ({
            room_id: id,
            event_id: eventId,
            check_in: eventStart,
            check_out: eventEnd,
          }));

          await db.transaction(async (trx) => {
            let roomRes: any = await trx("room_booking").insert(roomBookings);

            if (roomRes.rowCount === roomIds.length) {
              res.status(200).send({
                error: false,
                msg: "Room Booked!",
              });
            } else {
              res.status(400).send({
                error: false,
                msg: "Failed to book selected rooms!",
              });
              throw new Error("Failed to book selected rooms!");
            }
          });
        } else {
          return res.status(400).send({
            error: true,
            msg: "Cannot book rooms! [Invalid Event]!",
          });
        }
      } else {
        return res.status(400).send({
          error: true,
          msg: "Cannot book rooms! [Invalid Event]!",
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
