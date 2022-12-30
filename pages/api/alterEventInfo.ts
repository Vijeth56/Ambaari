// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { AlterEventGuestResponse } from "../../lib/models/AlterEventGuestResponse";
import { db } from "../../lib/db";
import dayjs, { Dayjs } from "dayjs";

const vContraintMap = new Map<string, string>();
vContraintMap.set("Hall", "((0, 0), 0.5)");
vContraintMap.set("Garden", "((1, 1), 0.5)");
vContraintMap.set("H & G", "((0, 0), 1)");

const getUpdatedFields = (
  curInfo: any,
  {
    eventType,
    venueType,
    dateTimeRange,
    totalAmount,
  }: {
    eventType: string;
    venueType: string;
    dateTimeRange: any[];
    totalAmount: number;
  }
) => {
  let newInfo: any = {};
  if (
    eventType &&
    eventType.trim().length > 0 &&
    curInfo.event_type !== eventType.trim()
  ) {
    newInfo.event_type = eventType.trim();
  }

  if (
    venueType &&
    venueType.trim().length > 0 &&
    curInfo.venue_type !== venueType.trim()
  ) {
    newInfo.venue_type = venueType.trim();
    newInfo._venue = vContraintMap.get(venueType.trim());
  }

  if (dateTimeRange && dateTimeRange[0] && dateTimeRange[1]) {
    let newStart = dayjs(dateTimeRange[0]);
    let newEnd = dayjs(dateTimeRange[1]);

    let curStart = dayjs(curInfo.event_start);
    let curEnd = dayjs(curInfo.event_end);

    if (newStart.format("DD/MM/YY h a") !== curStart.format("DD/MM/YY h a")) {
      newInfo.event_start = dayjs(dateTimeRange[0]);
    }

    if (newEnd.format("DD/MM/YY h a") !== curEnd.format("DD/MM/YY h a")) {
      newInfo.event_end = dayjs(dateTimeRange[1]);
    }
  }

  if (totalAmount !== curInfo.total_fee) {
    newInfo.total_fee = totalAmount;
  }

  return newInfo;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AlterEventGuestResponse>
) {
  if (req.method === "POST") {
    let data = req.body;
    try {
      let parsedData = JSON.parse(data);
      let { eventId } = parsedData;

      if (eventId > 0) {
        let eventInfo = await db("event_booking").where({
          event_booking_id: eventId,
        });

        if (eventInfo && eventInfo.length > 0) {
          let curInfo = eventInfo[0];
          let newInfo = getUpdatedFields(curInfo, parsedData);

          if (newInfo && Object.keys(newInfo).length > 0) {
            await db("event_booking")
              .update({
                ...newInfo,
                updated_at: db.fn.now(),
              })
              .where("event_booking_id", eventId);

            return res.status(200).send({
              error: false,
              msg: "Successfully Updated!",
            });
          } else {
            return res.status(400).send({
              error: false,
              msg: "Nothing to update!",
            });
          }
        } else {
          return res.status(400).send({
            error: true,
            msg: "Error while trying to modify guest info.",
          });
        }
      } else {
        return res.status(400).send({
          error: true,
          msg: "Error while trying to modify guest info.",
        });
      }
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .send({ error: true, msg: "Some unknown error occurred! [Code: 102]" });
    }
  } else {
    return res.status(400).send({
      error: true,
      msg: "Some unknown error occurred! [Code: 101]",
    });
  }
}
