// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { AddEventNoteResponse } from "../../lib/models/AddEventNoteResponse";
import { db } from "../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AddEventNoteResponse>
) {
  if (req.method === "POST") {
    let data = req.body;
    let { eventId, note } = data;
    let trx;
    try {
      trx = await db.transaction();
      let eResult = await trx("event_note")
        .insert({
          note: data.note,
          event_booking_id: data.eventId,
        })
        .returning("note_id");

      const { note_id } = eResult[0];
      await trx.commit();
      return res.status(200).send({
        error: false,
        msg: "New Note created!",
        noteId: note_id,
        eventId: eventId,
        note: note,
      });
    } catch (err: any) {
      await trx?.rollback();
      console.log(err);
      return res.status(400).send({
        error: true,
        msg: "Some unknown error occurred! [Code: 100]",
      });
    }
  }
}
