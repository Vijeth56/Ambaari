import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any[] | Error>
) {
  try {
    let eventId = JSON.parse(req.body).id;
    if (eventId > 0) {
      let data = await db("event_note").where("event_booking_id", eventId);
      data = data.map((_note) => {
        return {
          noteId: _note.note_id,
          eventBookingId: _note.event_booking_id,
          note: _note.note,
          deletedAt: _note.deleted_at,
          createdAt: _note.created_at,
          updatedAt: _note.updated_at,
        };
      });
      res.status(200).json(data);
    } else {
      res.status(400).send(new Error("No Valid Events Found!"));
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(new Error("Unknown Error!"));
  }
}
