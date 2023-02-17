import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import { PlusOutlined } from "@ant-design/icons";
import type { BadgeProps } from "antd";
import { RangeValue } from "rc-picker/lib/interface";
import { AddEventResponse } from "../lib/models/AddEventResponse";
import { DeleteEventResponse } from "../lib/models/DeleteEventResponse";
import { toINR } from "../lib/utils/NumberFormats";

import {
  DatePicker,
  Calendar,
  Button,
  Modal,
  Input,
  Badge,
  Alert,
  Radio,
  RadioChangeEvent,
  message,
  List,
  Skeleton,
  Space,
} from "antd";

import { AutoComplete, Spin } from "antd";
import type { SelectProps } from "antd/es/select";

import dayjs, { Dayjs } from "dayjs";

import { withAuthenticator } from "@aws-amplify/ui-react";

import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { FetchUserResponse } from "../lib/models/FetchUserResponse";
import { RangePickerProps } from "antd/es/date-picker";

const fetchCalendarEvents = async () => {
  const res = await fetch("/api/getCalendarEvents");
  let jsonResult = await res.json();
  return jsonResult;
};

const fetchEvents = async (eventIds: number[]) => {
  if (eventIds && eventIds.length > 0) {
    const res = await fetch(`/api/getEventsInfo`, {
      method: "post",
      body: JSON.stringify({ ids: eventIds }),
    });
    let jsonResult = await res.json();
    return jsonResult;
  }
  return [];
};

const venueOptions = [
  { label: "Hall", value: "Hall" },
  { label: "Garden", value: "Garden" },
  { label: "Hall + G", value: "H & G" },
];

type WindowDimentions = {
  width: number | undefined;
  height: number | undefined;
};

const useWindowDimensions = (): WindowDimentions => {
  const [windowDimensions, setWindowDimensions] = useState<WindowDimentions>({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    function handleResize(): void {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return (): void => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowDimensions;
};

const Home = ({ signOut, user }: { signOut: any; user: any }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { width, height } = useWindowDimensions();

  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [mobileNo, setMobileNo] = useState<string>();
  const [altMobileNo, setAltMobileNo] = useState<string>();
  const [name, setName] = useState<string>();
  const [emailAddress, setEmailAddress] = useState<string>();
  const [postalAddress, setPostalAddress] = useState<string>();
  const [eventType, setEventType] = useState<string>();
  const [venueType, setVenueType] = useState("H & G");
  const [dateTimeRange, setDateTimeRange] = useState<RangeValue<Dayjs>>();
  const [totalAmount, setTotalAmount] = useState<number>();
  const [selectedValue, setSelectedValue] = useState<string>(() =>
    dayjs().format("DD-MM-YYYY")
  );
  const [deleteEventForId, setDeleteEventForId] = useState<number>();

  interface EventSummaryType {
    event_booking_id: number;
    mobile_no: string;
    alt_mobile_no: string;
    name: string;
    email: string;
    event_type: string;
    venue_type: string;
    event_start: Date;
    event_end: Date;
    postal_address: string;
    total_fee: number;
  }

  const [rGuestInfo, setRGuestInfo] = useState<any>();
  const [dateStyle, setDateStyle] = useState<any>({});

  const [guestOptions, setGuestOptions] = useState<
    SelectProps<object>["options"]
  >([]);

  const [messageApi, contextHolder] = message.useMessage();

  const addEventMutation = useMutation("events", {
    mutationFn: async (newEvent: any) => {
      const res = await axios.post<AddEventResponse>(
        "/api/addNewEvent",
        newEvent
      );
      if (res.data.error) {
        messageApi.open({
          type: "error",
          content: res.data.msg,
          duration: 8,
        });
      } else {
        queryClient.invalidateQueries("events");
      }
    },
  });

  const calendarEventsQuery = useQuery<any>("events", fetchCalendarEvents);

  const deleteEventMutation = useMutation("deleteEvent", {
    mutationFn: async (id: number) => {
      const res = await axios.post<DeleteEventResponse>("/api/deleteEvent", {
        id: id,
      });
      setDeleteEventForId(undefined);
      if (res.data.error) {
        messageApi.open({
          type: "error",
          content: res.data.msg,
          duration: 8,
        });
      } else {
        queryClient.invalidateQueries("events");
      }
    },
  });

  const eventDetailsQuery = useQuery<EventSummaryType[]>(
    [
      "events",
      {
        date: selectedValue,
        ids:
          calendarEventsQuery.data && calendarEventsQuery.data[selectedValue]
            ? calendarEventsQuery.data[selectedValue].map((e: any) => e.id)
            : [],
      },
    ],
    () => {
      let eventIds = [];
      let { data } = calendarEventsQuery;
      if (data && data[selectedValue]) {
        eventIds = data[selectedValue].map((e: any) => e.id);
      }
      return fetchEvents(eventIds);
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  const onVenueTypeChange = ({ target: { value } }: RadioChangeEvent) => {
    setVenueType(value);
  };

  const handleAddEvent = () => {
    if (rGuestInfo) {
      addEventMutation.mutate({
        existingGuest: true,
        guestInfoId: rGuestInfo.guest_info_id,
        eventType,
        venueType,
        dateTimeRange,
        totalAmount,
      });
    } else {
      addEventMutation.mutate({
        existingGuest: false,
        name,
        mobileNo,
        altMobileNo,
        emailAddress,
        postalAddress,
        eventType,
        venueType,
        dateTimeRange,
        totalAmount,
      });
    }
    setShowAddEventModal(false);
  };

  const { Search } = Input;
  const onSearch = () => {
    if (mobileNo && mobileNo.length >= 10) {
      axios
        .post<FetchUserResponse>("/api/fetchUsersByPhone", {
          mobileNo,
        })
        .then((res) => res.data)
        .then((res) => {
          let options = searchResult(res.data || []);
          setGuestOptions(options);
        })
        .catch((err) => console.log(err));
    } else if (!(mobileNo == undefined || mobileNo.length === 0)) {
      messageApi.error({
        content: "Invalid mobile number",
      });
      setGuestOptions([]);
    }
  };

  const searchResult = (data: any[]) =>
    data.map((_, idx) => {
      const category = data[idx].mobileNo;
      return {
        value: category,
        label: (
          <div
            onClick={() => {
              setRGuestInfo(data[idx]);
            }}
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

  const dateCellRender = (value: Dayjs) => {
    let listData: any[] = [];
    let { data } = calendarEventsQuery;
    let style: any = { padding: "6px" };

    if (data && Object.keys(data).length > 0) {
      let valueStr = value.format("DD-MM-YYYY");
      if (valueStr === selectedValue) {
        style = {
          ...style,
          backgroundColor: "#ADD8E6",
          borderRadius: "4px",
        };
      }
      let events = data[valueStr];

      if (events) {
        events.forEach((e: any) => {
          let eStart = dayjs(e.start);
          let eEnd = dayjs(e.end);

          let sameAsStart = eStart.isSame(value, "date");
          let sameAsEnd = eEnd.isSame(value, "date");

          let description = "";
          if (sameAsStart && sameAsEnd) {
            description = `(${eStart.format("h a")} to ${eEnd.format("h a")})`;
          } else if (sameAsStart) {
            description = `${e.venue} (Start: ${eStart.format("h a")})`;
          } else if (sameAsEnd) {
            description = `${e.venue} (End: ${eEnd.format("h a")})`;
          } else {
            description = `${e.venue} (All day!)`;
          }

          listData.push({
            type: "warning",
            content: `${description}`,
            bookingId: e.id,
          });
        });
      }
    }

    if (width && width < 750) {
      if (listData.length > 0) {
        return <p style={{ color: "red", ...style }}>{value.format("DD")}</p>;
      } else {
        return (
          <p key={value.format("DD-MM-YYYY")} style={style}>
            {value.format("DD")}
          </p>
        );
      }
    } else {
      if (listData.length > 0) {
        return (
          <ul className={styles.events} style={{ height: "100%" }}>
            {listData.map((item) => (
              <li key={item.content}>
                <Badge
                  status={item.type as BadgeProps["status"]}
                  text={item.content}
                />
              </li>
            ))}
          </ul>
        );
      } else {
        return [];
      }
    }
  };

  const onDateSelect = (value: Dayjs) => {
    setSelectedValue(value.format("DD-MM-YYYY"));
  };

  // eslint-disable-next-line arrow-body-style
  const disabledDate: RangePickerProps["disabledDate"] = (current) => {
    // Can not select days before today and today
    return (
      (current && current < dayjs().endOf("day")) ||
      current > dayjs().add(2, "years")
    );
  };

  const getLoadingView = () => {
    if (width && width >= 750) {
      return (
        <Spin>
          <Calendar />
        </Spin>
      );
    } else if (width && width < 750) {
      return (
        <Spin>
          <Calendar fullscreen={false} />
        </Spin>
      );
    } else {
      <Spin />;
    }
  };

  const getCalendarEventsView = () => {
    if (width && width < 750) {
      return (
        <Calendar
          dateFullCellRender={dateCellRender}
          onSelect={onDateSelect}
          fullscreen={false}
          validRange={[dayjs().subtract(30, "days"), dayjs().add(2, "years")]}
          mode="month"
        />
      );
    } else {
      return (
        <Calendar
          dateCellRender={dateCellRender}
          onSelect={onDateSelect}
          validRange={[dayjs().subtract(30, "days"), dayjs().add(2, "years")]}
          mode="month"
        />
      );
    }
  };

  const openDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className={styles.container}>
      {contextHolder}
      <Head>
        <title>Ambaari</title>
        <meta
          name="description"
          content="A web portal for event planning and booking."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Button
          type="primary"
          danger
          onClick={signOut}
          style={{ alignSelf: "flex-end", marginBottom: "2em" }}
        >
          Sign Out
        </Button>
        <h4 className={styles.title}>Ambaari Web Portal</h4>
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setShowAddEventModal(true)}
            style={{
              maxWidth: "240px",
              marginTop: "2em",
              marginBottom: "2em",
              marginRight: "2em",
            }}
          >
            Add Event
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={openDashboard}
            style={{
              maxWidth: "240px",
              marginTop: "2em",
              marginBottom: "2em",
            }}
          >
            Dashboard
          </Button>
        </div>

        <Modal
          title="Event Info"
          open={showAddEventModal}
          onOk={handleAddEvent}
          onCancel={() => setShowAddEventModal(false)}
        >
          <AutoComplete
            dropdownMatchSelectWidth={true}
            style={{ width: "100%" }}
            options={guestOptions}
          >
            <Search
              placeholder="Mobile No"
              allowClear
              enterButton="Find"
              onSearch={onSearch}
              size="large"
              onChange={(e) => {
                setMobileNo(e.target.value);
                if (guestOptions) {
                  setGuestOptions([]);
                }

                if (rGuestInfo) {
                  setRGuestInfo(undefined);
                }
              }}
              style={{ marginTop: "2em" }}
            />
          </AutoComplete>
          <Input
            placeholder="Alternate Mobile No:"
            size="large"
            disabled={rGuestInfo}
            value={rGuestInfo ? rGuestInfo.alt_mobile_no : altMobileNo}
            onChange={(e) => setAltMobileNo(e.target.value)}
            style={{ marginTop: "2em" }}
          />
          <Input
            placeholder="Name"
            size="large"
            style={{ marginTop: "2em" }}
            disabled={rGuestInfo}
            value={rGuestInfo ? rGuestInfo.name : name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Email Address"
            size="large"
            style={{ marginTop: "2em" }}
            disabled={rGuestInfo}
            value={rGuestInfo ? rGuestInfo.email : emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
          />
          <Input
            placeholder="Postal Address"
            size="large"
            style={{ marginTop: "2em" }}
            disabled={rGuestInfo}
            value={rGuestInfo ? rGuestInfo.postal_address : postalAddress}
            onChange={(e) => setPostalAddress(e.target.value)}
          />
          <Input
            placeholder="Event Type"
            size="large"
            style={{ marginTop: "2em" }}
            onChange={(e) => setEventType(e.target.value)}
          />
          <Radio.Group
            className={styles.radio}
            options={venueOptions}
            onChange={onVenueTypeChange}
            value={venueType}
            optionType="button"
            buttonStyle="solid"
          />
          <DatePicker.RangePicker
            size="large"
            disabledDate={disabledDate}
            showTime
            use12Hours
            format={"DD/MM/YY h a"}
            showNow
            style={{ width: "100%", marginTop: "2em" }}
            onChange={(e) => setDateTimeRange(e)}
          />
          <Input
            placeholder="Total Amount"
            size="large"
            inputMode="numeric"
            style={{ marginTop: "2em" }}
            value={totalAmount}
            onChange={(e) => {
              let tAmount = Number.parseInt(e.target.value, 10);
              if (isNaN(tAmount)) {
                setTotalAmount(undefined);
              } else {
                setTotalAmount(tAmount);
              }
            }}
          />
        </Modal>
        <Modal
          title="Event Details"
          footer={null}
          open={showEventDetailModal}
          onCancel={() => setShowEventDetailModal(false)}
        >
          {deleteEventForId && deleteEventForId > 0 ? (
            <Alert
              message="Confirm"
              description="Are you sure you want to delete the event?"
              type="error"
              action={
                <Space direction="vertical">
                  <Button
                    size="small"
                    type="primary"
                    danger
                    onClick={() => {
                      deleteEventMutation.mutate(deleteEventForId);
                    }}
                  >
                    YES
                  </Button>
                  <Button
                    size="small"
                    type="dashed"
                    onClick={() => {
                      setDeleteEventForId(undefined);
                    }}
                  >
                    NO
                  </Button>
                </Space>
              }
            />
          ) : (
            []
          )}

          <List
            className="eventdetailslist"
            itemLayout="horizontal"
            dataSource={eventDetailsQuery.data}
            loading={eventDetailsQuery.isLoading}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <>
                    <Button
                      size="small"
                      type="dashed"
                      onClick={() =>
                        router.push(`/event?id=${item.event_booking_id}`)
                      }
                    >
                      More
                    </Button>
                  </>,
                  <>
                    <Button
                      size="small"
                      type="primary"
                      danger
                      onClick={() => setDeleteEventForId(item.event_booking_id)}
                    >
                      Delete
                    </Button>
                  </>,
                ]}
              >
                <Skeleton avatar title={false} loading={false} active>
                  <List.Item.Meta
                    title={`${item.name} (${item.event_type})`}
                    description={
                      <div
                        className=""
                        style={{ display: "flex", flexDirection: "column" }}
                      >
                        <span>Venue: {item.venue_type}</span>
                        <span>
                          Duration: &nbsp;
                          {dayjs(item.event_start).format("DD/MM h a")}
                          &nbsp;to&nbsp;
                          {dayjs(item.event_end).format("DD/MM h a")}
                        </span>
                        <span>
                          Mob: {item.mobile_no} / {item.alt_mobile_no}
                        </span>
                        <span>Email: {item.email}</span>
                        <span>Total Fee: {toINR(item.total_fee)}</span>
                      </div>
                    }
                  />
                </Skeleton>
              </List.Item>
            )}
          />
        </Modal>
        {calendarEventsQuery.isLoading ? (
          getLoadingView()
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <Alert
              showIcon
              type="info"
              message={`${selectedValue}`}
              description="Click to view for more details about events booked on this day!"
              action={
                <Button
                  size="large"
                  type="primary"
                  onClick={() => {
                    if (
                      eventDetailsQuery.data &&
                      eventDetailsQuery.data.length > 0
                    ) {
                      setShowEventDetailModal(true);
                    } else {
                      messageApi.error("No Events Found!");
                    }
                  }}
                >
                  VIEW
                </Button>
              }
            />
            {getCalendarEventsView()}
          </div>
        )}
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
};

export default withAuthenticator(Home);
