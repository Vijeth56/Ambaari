import type { NextApiRequest, NextApiResponse } from "next";
import { AddEventResponse } from "../../lib/models/AddEventResponse";
import { db } from "../../lib/db";
import { noSSR } from "next/dynamic";
import { notDeepEqual } from "assert";
import { View } from "@aws-amplify/ui-react";
// import { user } from '../index.js';
const user = 1;



type availableRooms = {
  [room_details_id: number]: string;
};
type AllRoomsMap = {
  [room_details_id: number]: string;
};
type RoomDetails = {
  room_details_id: number;
  room_type: string;
};

// get data from View
const getAllocatedRoomsForRange = async (
  roomType: string,
  startDateTime: string,
  endDateTime: string
): Promise<number[]> => {
  try {
    const result = await db("advance_booking_view")
      .select("room_details_id")
      .where("room_type", "=", roomType)
      .andWhere(function () {
        this.where(function () {
          this.where("booking_start", "<=", endDateTime)
            .andWhere("booking_end", ">=", startDateTime);
        }).orWhere(function () {
          this.where("booking_start", ">=", startDateTime)
            .andWhere("booking_start", "<", endDateTime);
        }).orWhere(function () {
          this.where("booking_end", ">", startDateTime)
            .andWhere("booking_end", "<=", endDateTime);
        });
      });
    return result.map((booking) => booking.room_details_id);
  } catch (error) {
    console.error("Error fetching allocated rooms:", error);
    throw error;
  }
};


// get room no from room_details table, get room_details_id instead of room_no

const getRoomsByTenantId = async (tenantId: number): Promise<RoomDetails[]> => {
  try {
    const result = await db("room_details")
      .select("room_details_id", "room_type")
      .where("tenant_info_id", tenantId);

    return result;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
};

const getRoomDetailsIdFromRoomNo = async (roomNo: number): Promise<number> => {
  try {
    const result = await db("room_details")
      .select("room_details_id")
      .where("room_no", "=", roomNo)
      .first(); // Assuming that there's only one record for a room number

    return result ? result.room_details_id : -1;
  } catch (error) {
    console.error("Error fetching room details ID:", error);
    throw error;
  }
};




export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AddEventResponse>
) {
  if (req.method === "POST") {
    const data = req.body;
    try {

      const allocatedRooms = await getAllocatedRoomsForRange(data.roomType, data.dateTimeRange[0], data.dateTimeRange[1]);

      // Fetch rooms based on the given tenant_id
      const rooms = await getRoomsByTenantId(user);

      // Store the retrieved rooms in the allRooms map
      const allRooms: AllRoomsMap = {};

      rooms.forEach((room) => {
        allRooms[room.room_details_id] = room.room_type;
      });

      // availableRooms = allRooms - allocatedRooms

      const roomTypeToFilter = data.roomType;

      const availableRooms: number[] = [];
      Object.keys(allRooms).forEach((roomNo) => {
        const roomNumber = Number(roomNo);
        if (!allocatedRooms.includes(roomNumber) && allRooms[roomNumber] === roomTypeToFilter) {
          availableRooms.push(roomNumber);
        }
      });

      console.log("All Rooms:", allRooms);
      console.log("Allocated Rooms:", allocatedRooms);
      console.log("Available Rooms:", availableRooms);

      const bookings = [];

      if (data.roomNo === undefined || data.noOfRooms > 1) {
        for (let i = 0; i < data.noOfRooms; i++) {

          const eResult = await db("advance_booking")
            .insert({
              name: data.name,
              mobile_no: data.mobileNo,
              email_address: data.emailAddress,
              room_details_id: availableRooms[Math.floor(Math.random() * availableRooms.length)],
              booking_start: data.dateTimeRange[0],
              booking_end: data.dateTimeRange[1],
              tenant_id: user,
            }).returning("adv_booking_id");
          const adv_booking_id = eResult[0].adv_booking_id;
          bookings.push(adv_booking_id);
        }
      }
      else {
        const roomDetailsId = await getRoomDetailsIdFromRoomNo(data.roomNo);
        if (availableRooms.includes(roomDetailsId)) {
          // Room is available, proceed with booking
          const eResult = await db("advance_booking")
            .insert({
              name: data.name,
              mobile_no: data.mobileNo,
              email_address: data.emailAddress,
              room_details_id: roomDetailsId,
              booking_start: data.dateTimeRange[0],
              booking_end: data.dateTimeRange[1],
              tenant_id: 1,
            })
            .returning("adv_booking_id");
          const adv_booking_id = eResult[0].adv_booking_id;
          bookings.push(adv_booking_id);
        } else {
          console.log("Selected room is not available.");
        }
      }



      // Send a response with a message that can be used on the client side
      res.status(200).send({
        error: false,
        msg: "New Booking(s) created!",
        // bookingId: bookings,
      });


      if (bookings.length > 0) {
        console.log("New Booking(s) created! Booking IDs: " + bookings.join(", "));
      } else {
        console.log("Unexpected response from the server.");
      }
    } catch (err: any) {
      console.error(err);
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




