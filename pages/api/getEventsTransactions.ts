import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any[] | Error>
) {
  try {
    let { startDate, endDate } = JSON.parse(req.body);
    if (startDate && endDate) {
      let data = await db("events_transaction_view")
        .where("event_start", ">=", startDate)
        .where("event_start", "<=", endDate);
      data = data.map((transaction) => {
        return {
          eventType: transaction.eventType,
          eventBookingId: transaction.event_booking_id,
          eventStart: transaction.event_start,
          eventEnd: transaction.event_end,
          venueType: transaction.venue_type,
          totalFee: transaction.total_fee,
          totalAmount: Number(transaction.total_amount),
          paymentType: transaction.payment_type,
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
