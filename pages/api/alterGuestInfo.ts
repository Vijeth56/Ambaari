// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { AlterEventGuestResponse } from "../../lib/models/AlterEventGuestResponse";
import { db } from "../../lib/db";

const getUpdatedFields = (
  curInfo: any,
  {
    name,
    email,
    newMobileNo,
    altMobileNo,
    postalAddress,
  }: {
    name: string;
    email: string;
    newMobileNo: string;
    altMobileNo: string;
    postalAddress: string;
  }
) => {
  let newInfo: any = {};
  if (name && name.trim().length > 0 && curInfo.name !== name.trim()) {
    newInfo.name = name.trim();
  }

  if (email && email.trim().length > 4 && curInfo.email !== email.trim()) {
    newInfo.email = email.trim();
  }

  if (
    newMobileNo &&
    newMobileNo.trim().length >= 10 &&
    curInfo.mobile_no !== newMobileNo.trim()
  ) {
    newInfo.mobile_no = newMobileNo.trim();
  }

  if (
    altMobileNo &&
    altMobileNo.trim().length >= 10 &&
    curInfo.alt_mobile_no !== altMobileNo.trim()
  ) {
    newInfo.alt_mobile_no = altMobileNo.trim();
  }

  if (
    postalAddress &&
    postalAddress.trim().length > 5 &&
    curInfo.postal_address !== postalAddress.trim()
  ) {
    newInfo.postal_address = postalAddress.trim();
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
      let { existingGuestId, newGuestId } = parsedData;

      if (newGuestId > 0 && existingGuestId === newGuestId) {
        let guestInfo = await db("guest_info").where({
          guest_info_id: existingGuestId,
        });

        if (guestInfo && guestInfo.length > 0) {
          let curInfo = guestInfo[0];
          let newInfo = getUpdatedFields(curInfo, parsedData);

          if (newInfo && Object.keys(newInfo).length > 0) {
            await db("guest_info")
              .update({
                ...newInfo,
                updated_at: db.fn.now(),
              })
              .where("guest_info_id", existingGuestId);

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
      } else if (newGuestId > 0 && newGuestId !== existingGuestId) {
        let { eventBookingId } = parsedData;
        let guestInfo = await db("guest_info").where({
          guest_info_id: newGuestId,
        });

        if (guestInfo && guestInfo.length > 0) {
          let curInfo = guestInfo[0];
          let newInfo = getUpdatedFields(curInfo, parsedData);

          if (newInfo && Object.keys(newInfo).length > 0) {
            await db("guest_info").update({
              ...newInfo,
              updated_at: db.fn.now(),
            });
            await db("event_booking")
              .update({ guest_info_id: newGuestId, updated_at: db.fn.now() })
              .where("event_booking_id", eventBookingId);
            return res.status(200).send({
              error: false,
              msg: "Successfully Updated!",
            });
          } else {
            await db("event_booking")
              .update({ guest_info_id: newGuestId, updated_at: db.fn.now() })
              .where("event_booking_id", eventBookingId);
            return res.status(200).send({
              error: false,
              msg: "Successfully Updated!",
            });
          }
        } else {
          return res.status(400).send({
            error: true,
            msg: "Error while trying to modify guest info.",
          });
        }
      } else {
        let {
          name,
          newMobileNo,
          altMobileNo,
          emailAddress,
          postalAddress,
          eventBookingId,
        } = parsedData;

        if (
          name &&
          name.trim().length > 3 &&
          newMobileNo &&
          newMobileNo.trim().length >= 10 &&
          altMobileNo &&
          altMobileNo.trim().length >= 10 &&
          emailAddress &&
          emailAddress.trim().length > 3 &&
          postalAddress &&
          postalAddress.trim().length > 3
        ) {
          let guestInsertRes = await db("guest_info")
            .insert({
              name,
              mobile_no: newMobileNo,
              alt_mobile_no: altMobileNo,
              email: emailAddress,
              postal_address: postalAddress,
            })
            .returning("guest_info_id");
          if (
            guestInsertRes &&
            guestInsertRes.length > 0 &&
            guestInsertRes[0].guest_info_id > 0
          ) {
            let insertedGuestId = guestInsertRes[0].guest_info_id;
            await db("event_booking")
              .update({
                guest_info_id: insertedGuestId,
                updated_at: db.fn.now(),
              })
              .where("event_booking_id", eventBookingId);

            return res.status(200).send({
              error: false,
              msg: "Inserted and updated guest info!",
            });
          } else {
            return res.status(400).send({
              error: true,
              msg: "Failed to insert new guest info!",
            });
          }
        } else {
          console.log("Printing Else");
          return res.status(400).send({
            error: true,
            msg: "Invalid value for one or more fields!",
          });
        }
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
