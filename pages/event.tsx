import { useRouter } from "next/router";
import { useState } from "react";
import Head from "next/head";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { Transfer } from "antd";
import type { TransferDirection } from "antd/es/transfer";

import Note from "./note";
import {
  Button,
  message,
  Spin,
  Tabs,
  Descriptions,
  Row,
  Col,
  Space,
  Modal,
  Alert,
  AutoComplete,
  Input,
  DatePicker,
  Radio,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import type { SelectProps } from "antd/es/select";
import { RangeValue } from "rc-picker/lib/interface";
import { RangePickerProps } from "antd/es/date-picker";

import { FetchUserResponse } from "../lib/models/FetchUserResponse";
import { DeleteEventResponse } from "../lib/models/DeleteEventResponse";
import { BookRoomsResponse } from "../lib/models/BookRoomsResponse";
import { ReleaseRoomsResponse } from "../lib/models/ReleaseRoomsResponse";
import styles from "../styles/Event.module.css";
import { toINR } from "../lib/utils/NumberFormats";

const fetchEventDetail = async (eventId: string) => {
  try {
    if (eventId) {
      let id = Number.parseInt(eventId);
      const res = await fetch(`/api/getEventDetail`, {
        method: "post",
        body: JSON.stringify({ id }),
      });
      let jsonResult = await res.json();
      if (jsonResult) {
        return jsonResult;
      } else {
        return {};
      }
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const fetchAvailableRooms = async (
  timeRange: RangeValue<Dayjs> | undefined
) => {
  try {
    if (timeRange) {
      const res = await fetch("/api/getAvailableRooms", {
        method: "post",
        body: JSON.stringify({
          startTime: timeRange[0]?.minute(0).second(0),
          endTime: timeRange[1]?.minute(0).second(0),
        }),
      });

      let jsonResult = await res.json();

      if (jsonResult && jsonResult.length > 0) {
        return jsonResult;
      } else {
        return [];
      }
    }

    return [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

const venueOptions = [
  { label: "Hall", value: "Hall" },
  { label: "Garden", value: "Garden" },
  { label: "Hall + G", value: "H & G" },
];

const Event = ({ signOut, user }: { signOut: any; user: any }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [messageApi, contextHolder] = message.useMessage();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [showEditGuestModal, setShowEditGuestModal] = useState(false);

  const [newMobileNo, setNewMobileNo] = useState<string>();
  const [name, setName] = useState<string>();
  const [mobileNo, setMobileNo] = useState<string>();
  const [altMobileNo, setAltMobileNo] = useState<string>();
  const [emailAddress, setEmailAddress] = useState<string>();
  const [postalAddress, setPostalAddress] = useState<string>();

  const [eventType, setEventType] = useState<string>();
  const [venueType, setVenueType] = useState<string>();
  const [dateTimeRange, setDateTimeRange] = useState<RangeValue<Dayjs>>();
  const [totalAmount, setTotalAmount] = useState<number>();

  const [roomTimeRange, setRoomTimeRange] = useState<RangeValue<Dayjs>>();
  const [roomsDataSource, setRoomsDataSource] = useState<any[]>();
  const [bookedRooms, setBookedRooms] = useState<any[]>();
  const [targetRoomKeys, setTargetRoomKeys] = useState<string[]>();
  const [selectedRoomKeys, setSelectedRoomKeys] = useState<string[]>([]);

  const [newGuestId, setNewGuestId] = useState<number>();
  const [guestOptions, setGuestOptions] = useState<
    SelectProps<object>["options"]
  >([]);

  let [notes, setNotes] = useState<Array<object>>([]);

  // eslint-disable-next-line arrow-body-style
  const disabledDate: RangePickerProps["disabledDate"] = (current) => {
    // Can not select days before today and today
    return (
      (current && current < dayjs().endOf("day")) ||
      current > dayjs().add(2, "years")
    );
  };

  const { Search } = Input;
  const onSearch = () => {
    if (newMobileNo && newMobileNo.length >= 10) {
      axios
        .post<FetchUserResponse>("/api/fetchUsersByPhone", {
          mobileNo: newMobileNo,
        })
        .then((res) => res.data)
        .then((res) => {
          let options = searchResult(res.data || []);
          setGuestOptions(options);
        })
        .catch((err) => console.log(err));
    } else if (newMobileNo === mobileNo) {
      messageApi.error({
        content: "Mobile is same as present. Update other fields if necessary.",
      });
      setGuestOptions([]);
    } else if (!(newMobileNo == undefined || newMobileNo.length === 0)) {
      messageApi.error({
        content: "Invalid mobile number",
      });
      setGuestOptions([]);
    }
  };

  const searchResult = (data: any[]) =>
    data.map((_, idx) => {
      const category = data[idx].mobile_no;
      return {
        value: category,
        data: data[idx],
        label: (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              minHeight: 60,
              justifyContent: "space-between",
              border: "1px solid black",
              borderRadius: 12,
            }}
          >
            <span style={{ marginTop: 8, marginLeft: 8 }}>
              {data[idx].name}
            </span>
            <span style={{ marginTop: 4, marginLeft: 8, marginBottom: 8 }}>
              {data[idx].email}
            </span>
          </div>
        ),
      };
    });

  const eventId: string = router.query.id as string;
  const { data, isLoading } = useQuery<any>(
    ["event_detail", eventId],
    () => fetchEventDetail(eventId),
    {
      onSuccess(data) {
        if (data) {
          setEventType(data?.event_type);
          setVenueType(data?.venue_type);
          setTotalAmount(data?.total_fee);

          let timeRange: RangeValue<Dayjs> = [
            dayjs(data?.event_start),
            dayjs(data?.event_end),
          ];
          setDateTimeRange(timeRange);
          setRoomTimeRange(timeRange);

          let targetKeys = data?.rooms?.map((r: any) => r.key);
          setTargetRoomKeys(targetKeys);
          setBookedRooms(data?.rooms);
        }
      },
    }
  );

  const fetchNotes = async (eventId: string) => {
    try {
      if (eventId) {
        let id = Number.parseInt(eventId);
        const res = await fetch(`/api/getEventNotes`, {
          method: "post",
          body: JSON.stringify({ id }),
        });
        let jsonResult = await res.json();
        if (jsonResult && jsonResult.length > 0) {
          jsonResult = jsonResult.filter((note: any) => !note.deletedAt);
          setNotes(jsonResult);
        } else {
          setNotes([]);
        }
      }
    } catch (error) {
      setNotes([]);
      console.log(error);
    }
  };

  useQuery<any>(["event_notes", eventId], () => fetchNotes(eventId));

  const updateNotesArray = (note: any) => {
    note["key"] = notes.length;
    notes.push(note);
    setNotes(notes);
  };

  const deleteNote = async (note: any) => {
    try {
      const res = await axios.post<DeleteEventResponse>(
        "/api/deleteEventNote",
        {
          id: note.noteId,
        }
      );

      if (res.data.error) {
        messageApi.error({
          content: res.data.msg,
          duration: 8,
        });
      } else {
        notes = notes.filter((_note: any) => note.noteId != _note.noteId);
        setNotes(notes);
      }
    } catch (err) {
      console.log(err);
      messageApi.error({
        content: "Failed to delete the event",
        duration: 8,
      });
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const res = await axios.post<DeleteEventResponse>("/api/deleteEvent", {
        id: eventId,
      });

      if (res.data.error) {
        messageApi.error({
          content: res.data.msg,
          duration: 8,
        });
      } else {
        router.back();
      }
    } catch (err) {
      console.log(err);
      messageApi.error({
        content: "Failed to delete the event",
        duration: 8,
      });
    }
  };

  const performEditGuest = async () => {
    try {
      await fetch("/api/alterGuestInfo", {
        method: "POST",
        body: JSON.stringify({
          newGuestId: newGuestId,
          existingGuestId: data.guest_info_id,
          eventBookingId: data.event_booking_id,
          newMobileNo,
          mobileNo,
          name,
          altMobileNo,
          emailAddress,
          postalAddress,
        }),
      });
    } catch (err) {
      console.log(err);
      messageApi.error({
        content: "Failed to edit event details",
        duration: 8,
      });
    }
  };

  const editGuestMutation = useMutation("edit_guest", performEditGuest, {
    onSuccess: () => {
      setShowEditGuestModal(false);
      queryClient.invalidateQueries(["event_detail", eventId]);
    },
  });

  const editGuestModalView = () => (
    <Modal
      title="Guest Info"
      open={showEditGuestModal}
      okText="Update"
      onOk={() => editGuestMutation.mutate()}
      onCancel={() => setShowEditGuestModal(false)}
    >
      <AutoComplete
        dropdownMatchSelectWidth={true}
        style={{ width: "100%" }}
        options={guestOptions}
        onSelect={(_: any, optionType: any) => {
          let {
            guest_info_id,
            name,
            mobile_no,
            alt_mobile_no,
            email,
            postal_address,
          } = optionType.data;
          setNewGuestId(guest_info_id);
          setMobileNo(mobile_no);
          setAltMobileNo(alt_mobile_no);
          setName(name);
          setEmailAddress(email);
          setPostalAddress(postal_address);
        }}
      >
        <Search
          placeholder="Mobile No"
          onSearch={onSearch}
          value={newMobileNo}
          onReset={() => {
            console.log("OnReset");
          }}
          onEmptied={() => {
            console.log("OnEmptied");
          }}
          size="large"
          onChange={(e) => {
            setNewMobileNo(e.target.value);

            if (guestOptions) {
              setGuestOptions([]);
            }

            if (e.target.value.length === 0) {
              setNewMobileNo(undefined);
              setNewGuestId(undefined);
              setMobileNo(undefined);
              setAltMobileNo(undefined);
              setName(undefined);
              setEmailAddress(undefined);
              setPostalAddress(undefined);
            }
          }}
          style={{ marginTop: "2em" }}
        />
      </AutoComplete>
      <Input
        placeholder="Alternate Mobile No:"
        size="large"
        value={altMobileNo}
        onChange={(e) => setAltMobileNo(e.target.value)}
        style={{ marginTop: "2em" }}
      />
      <Input
        placeholder="Name"
        size="large"
        style={{ marginTop: "2em" }}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        placeholder="Email Address"
        size="large"
        style={{ marginTop: "2em" }}
        value={emailAddress}
        onChange={(e) => setEmailAddress(e.target.value)}
      />
      <Input
        placeholder="Postal Address"
        size="large"
        style={{ marginTop: "2em" }}
        value={postalAddress}
        onChange={(e) => setPostalAddress(e.target.value)}
      />
    </Modal>
  );

  const performEditEvent = async () => {
    try {
      await fetch("/api/alterEventInfo", {
        method: "POST",
        body: JSON.stringify({
          eventId,
          eventType,
          venueType,
          dateTimeRange,
          totalAmount,
        }),
      });
    } catch (err) {
      console.log(err);
      messageApi.error({
        content: "Failed to edit event details",
        duration: 8,
      });
    }
  };

  const editEventMutation = useMutation("edit_event", performEditEvent, {
    onSuccess: () => {
      setShowEditEventModal(false);
      queryClient.invalidateQueries(["event_detail", eventId]);
    },
  });

  const editEventModalView = () => (
    <Modal
      title="Update Event Info"
      open={showEditEventModal}
      onOk={() => editEventMutation.mutate()}
      okText="Update"
      onCancel={() => setShowEditEventModal(false)}
    >
      <Input
        placeholder="Revised Event"
        size="large"
        value={eventType}
        onChange={(e) => setEventType(e.target.value)}
        style={{ marginTop: "2em" }}
      />

      <Radio.Group
        className={styles.radio}
        options={venueOptions}
        onChange={(e) => setVenueType(e.target.value)}
        value={venueType}
        optionType="button"
        buttonStyle="solid"
      />

      <DatePicker.RangePicker
        style={{ marginTop: "2em" }}
        size="large"
        disabledDate={disabledDate}
        value={dateTimeRange}
        showTime
        use12Hours
        format={"DD/MM/YY h a"}
        showNow
        onChange={(e) => setDateTimeRange(e)}
      />

      <Input
        placeholder="Revised Quote"
        size="large"
        style={{ marginTop: "2em" }}
        value={totalAmount}
        onChange={(e) => {
          try {
            setTotalAmount(Number.parseInt(e.target.value));
          } catch (err) {
            console.log("Invalid Amount");
          }
        }}
      />
    </Modal>
  );

  // ----------------------------------- ROOM APIS -------------------------------------------
  useQuery<any>(
    ["available_rooms", { roomTimeRange }],
    () => fetchAvailableRooms(roomTimeRange),
    {
      onSuccess(data) {
        if (bookedRooms) {
          setRoomsDataSource([...data, ...bookedRooms]);
        } else {
          setRoomsDataSource(data);
        }
      },
    }
  );

  const bookSelectedRoomsForEvent = async ({
    roomIds,
    eventId,
  }: {
    roomIds: string[];
    eventId: string;
  }) => {
    try {
      const res = await axios.post<BookRoomsResponse>("/api/bookRooms", {
        eventId,
        roomIds,
      });

      if (res.data.error) {
        messageApi.error({
          content: res.data.msg,
          duration: 8,
        });
      } else {
        messageApi.info({
          content: res.data.msg,
          duration: 8,
        });
      }
    } catch (err: any) {
      console.log(err);
      messageApi.error({
        content: err?.message,
        duration: 8,
      });
    }
  };

  const releaseSelectedRoomsForEvent = async ({
    roomIds,
    eventId,
  }: {
    roomIds: string[];
    eventId: string;
  }) => {
    try {
      const res = await axios.post<ReleaseRoomsResponse>("/api/releaseRooms", {
        eventId,
        roomIds,
      });

      if (res.data.error) {
        messageApi.error({
          content: res.data.msg,
          duration: 8,
        });
      } else {
        messageApi.info({
          content: res.data.msg,
          duration: 8,
        });
      }
    } catch (err: any) {
      console.log(err);
      messageApi.error({
        content: err?.message,
        duration: 8,
      });
    }
  };

  const bookRoomsMutation = useMutation(
    "book_rooms",
    bookSelectedRoomsForEvent
  );

  const releaseRoomsMutation = useMutation(
    "release_rooms",
    releaseSelectedRoomsForEvent
  );

  const onChangeRooms = (
    nextTargetKeys: string[],
    direction: TransferDirection,
    moveKeys: string[]
  ) => {
    if (direction == "right") {
      bookRoomsMutation.mutate(
        { roomIds: moveKeys, eventId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(["event_detail", eventId]);
            queryClient.invalidateQueries(["available_rooms", dateTimeRange]);
          },
        }
      );
    } else {
      releaseRoomsMutation.mutate(
        { roomIds: moveKeys, eventId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(["event_detail", eventId]);
            queryClient.invalidateQueries(["available_rooms", dateTimeRange]);
          },
        }
      );
    }
  };

  const onRoomSelectChange = (
    sourceSelectedKeys: any[],
    targetSelectedKeys: any[]
  ) => {
    setSelectedRoomKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Ambaari</title>
        <meta
          name="description"
          content="A web portal for event planning and booking."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        {contextHolder}
        <Button
          type="primary"
          danger
          onClick={signOut}
          style={{ alignSelf: "flex-end", marginBottom: "2em" }}
        >
          Sign Out
        </Button>
        <h4 className={styles.title}>Ambaari Web Portal</h4>
        {showDeleteAlert ? (
          <Alert
            message="Confirm"
            description="Are you sure you want to delete the event?"
            type="error"
            action={
              <Space>
                <Button
                  size="small"
                  type="dashed"
                  danger
                  onClick={() => deleteEvent(eventId)}
                >
                  YES
                </Button>
                <Button
                  size="small"
                  type="dashed"
                  onClick={() => setShowDeleteAlert(false)}
                >
                  NO
                </Button>
              </Space>
            }
          />
        ) : (
          []
        )}
        <Button
          danger
          type="primary"
          icon={<DeleteOutlined />}
          size="large"
          onClick={() => setShowDeleteAlert(true)}
          style={{
            maxWidth: "240px",
            marginTop: "2em",
            marginBottom: "2em",
            alignSelf: "center",
          }}
        >
          Delete Event
        </Button>
        {editGuestModalView()}
        {editEventModalView()}
        {isLoading ? (
          <Spin></Spin>
        ) : (
          <Tabs
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "1em",
              flex: 1,
            }}
            defaultActiveKey="1"
            items={[
              {
                label: `Info`,
                key: "1",
                children: (
                  <div
                    className=""
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      flexDirection: "column",
                    }}
                  >
                    <Row style={{ marginBottom: "48px" }}>
                      <Col
                        lg={12}
                        style={{ marginTop: "12px", marginBottom: "12px" }}
                      >
                        <Descriptions
                          title="Guest Info"
                          bordered
                          style={{ marginRight: "32px" }}
                          column={1}
                          extra={
                            <Button
                              type="dashed"
                              onClick={() => setShowEditGuestModal(true)}
                            >
                              Edit
                            </Button>
                          }
                        >
                          <Descriptions.Item label="Name">
                            {data?.name}
                          </Descriptions.Item>
                          <Descriptions.Item label="Mobile">
                            {data?.mobile_no}
                          </Descriptions.Item>
                          <Descriptions.Item label="Alt-Mobile">
                            {data?.alt_mobile_no}
                          </Descriptions.Item>
                          <Descriptions.Item label="Email">
                            {data?.email}
                          </Descriptions.Item>
                          <Descriptions.Item label="Address">
                            {data?.postal_address}
                          </Descriptions.Item>
                        </Descriptions>
                      </Col>
                      <Col
                        lg={12}
                        style={{ marginTop: "12px", marginBottom: "12px" }}
                      >
                        <Descriptions
                          title="Event Info"
                          bordered
                          column={1}
                          extra={
                            <Button
                              type="dashed"
                              onClick={() => setShowEditEventModal(true)}
                            >
                              Edit
                            </Button>
                          }
                        >
                          <Descriptions.Item label="Event">
                            {data?.event_type}
                          </Descriptions.Item>
                          <Descriptions.Item label="Venue">
                            {data?.venue_type}
                          </Descriptions.Item>
                          <Descriptions.Item label="Event Start">
                            {dayjs(data?.event_start).format("DD/MM/YY h a")}
                          </Descriptions.Item>
                          <Descriptions.Item label="Event End">
                            {dayjs(data?.event_end).format("DD/MM/YY h a")}
                          </Descriptions.Item>
                          <Descriptions.Item label="Total Quote">
                            {toINR(data?.total_fee)}
                          </Descriptions.Item>
                        </Descriptions>
                      </Col>
                    </Row>
                    <Row style={{ marginTop: "12px", marginBottom: "12px" }}>
                      <Col lg={12}>
                        <Note
                          eventId={data?.event_booking_id}
                          notes={notes}
                          updateNotesArray={updateNotesArray}
                          deleteNote={deleteNote}
                        />
                      </Col>
                    </Row>
                  </div>
                ),
              },
              {
                label: `Room`,
                key: "2",
                children: (
                  <div
                    className=""
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <DatePicker.RangePicker
                      placeholder={["Checkin Date", "Checkout Date"]}
                      disabled
                      value={roomTimeRange}
                      size="large"
                      showTime
                      use12Hours
                      format={"DD/MM/YY h a"}
                      showNow
                      style={{ marginTop: "1em" }}
                      onChange={(e) => setRoomTimeRange(e)}
                    />

                    <Transfer
                      style={{ marginTop: "1.5em" }}
                      dataSource={roomsDataSource}
                      titles={["Available", "Booked"]}
                      operations={["Book", "Release"]}
                      targetKeys={targetRoomKeys}
                      selectedKeys={selectedRoomKeys}
                      onChange={onChangeRooms}
                      onSelectChange={onRoomSelectChange}
                      render={(item) =>
                        item && item.value ? `Room ${item.value}` : ""
                      }
                    />
                  </div>
                ),
              },
              {
                label: `Transactions`,
                key: "3",
                children: (
                  <div
                    className=""
                    style={{ display: "flex", justifyContent: "space-around" }}
                  ></div>
                ),
              },
            ]}
          />
        )}
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
};

export default withAuthenticator(Event);
