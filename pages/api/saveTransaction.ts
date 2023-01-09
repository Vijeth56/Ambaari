// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { SaveTransactionResponse } from "../../lib/models/SaveTransactionResponse";
import { db } from "../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SaveTransactionResponse>
) {
  if (req.method === "POST") {
    let data = req.body;

    let { eventId, transaction } = data;
    console.log(data);
    let trx;
    try {
      trx = await db.transaction();
      let eResult = await trx("transactions")
        .insert({
          event_booking_id: data.eventId,
          message: data.message,
          amount: data.amount,
          payment_type: data.paymentType,
        })
        .returning("transaction_id");

      const { transaction_id } = eResult[0];
      await trx.commit();
      return res.status(200).send({
        error: false,
        msg: "New Note created!",
        transactionId: transaction_id,
        eventId: eventId,
        transaction: transaction,
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
