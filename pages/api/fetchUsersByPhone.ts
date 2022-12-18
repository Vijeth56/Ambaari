import type { NextApiRequest, NextApiResponse } from "next";
import { FetchUserResponse } from "../../lib/models/FetchUserResponse";
import { db } from "../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FetchUserResponse>
) {
  if (req.method === "POST") {
    let data = req.body;
    try {
      let gResult = await db("guest_info").where({ mobile_no: data.mobileNo });
      return res.status(200).send({
        error: false,
        msg: "",
        data: gResult || [],
      });
    } catch (err: any) {
      console.log(err);
      return res.status(400).send({
        error: true,
        msg: "Some unknown error occurred! [Code: 100]",
      });
    }
  } else {
    return res.status(400).send({
      error: true,
      msg: "Some unknown error occurred! [Code: 101]",
    });
  }
}
