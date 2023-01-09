import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any[] | Error>
) {
  try {
    let eventId = JSON.parse(req.body).id;
    if (eventId > 0) {
      let data = await db("transactions").where("event_booking_id", eventId);
      data = data.map((transaction) => {
        return {
          transactionId: transaction.transaction_id,
          eventBookingId: transaction.event_booking_id,
          message: transaction.message,
          amount: transaction.amount,
          paymentType: transaction.payment_type,
          createdAt: transaction.created_at,
          updatedAt: transaction.updated_at,
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
