// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { UpcomingEventData } from "../models/UpcomingEventData";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<[UpcomingEventData]>
) {
  res.status(200).json([
    {
      name: "Arjun",
      mobileNo: "8888888888",
      altMobileNo: "9999999999",
      emailAddress: "arjun@xyz.com",
      postalAddress: "Door No 22, Bla Cross, Bla Road, Bla City",
      eventType: "Wedding",
      startDateTime: "",
      endDateTime: "",
    },
  ]);
}
