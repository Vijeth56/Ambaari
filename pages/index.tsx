import Head from "next/head";
import React, { useState } from "react";
import styles from "../styles/Home.module.css";
import { PlusOutlined } from "@ant-design/icons";
import type { BadgeProps } from "antd";
import { RangeValue } from "rc-picker/lib/interface";
import { AddEventResponse } from "../lib/models/AddEventResponse";

import {
  DatePicker,
  Calendar,
  Button,
  Modal,
  Input,
  Spin,
  Badge,
  Alert,
  Radio,
  RadioChangeEvent,
  message,
} from "antd";

import dayjs, { Dayjs } from "dayjs";

import { withAuthenticator } from "@aws-amplify/ui-react";

import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { UpcomingEventData } from "../lib/models/UpcomingEventData";

const fetchUpcomingEvents = async () => {
  const res = await fetch("/api/getUpcomingEvents");
  return res.json();
};

const venueOptions = [
  { label: "Hall", value: "Hall" },
  { label: "Garden", value: "Garden" },
  { label: "Hall & Garden", value: "H & G" },
];

const Home = ({ signOut, user }: { signOut: any; user: any }) => {
  const queryClient = useQueryClient();
  const [eventModelOpen, setEventModalOpen] = useState(false);
  const [mobileNo, setMobileNo] = useState<string>();
  const [altMobileNo, setAltMobileNo] = useState<string>();
  const [name, setName] = useState<string>();
  const [emailAddress, setEmailAddress] = useState<string>();
  const [postalAddress, setPostalAddress] = useState<string>();
  const [eventType, setEventType] = useState<string>();
  const [venueType, setVenueType] = useState("H & G");
  const [dateTimeRange, setDateTimeRange] = useState<RangeValue<Dayjs>>();
  const [totalAmount, setTotalAmount] = useState<number>();
  const [selectedValue, setSelectedValue] = useState<Dayjs>(() => dayjs());

  const [messageApi, contextHolder] = message.useMessage();

  const mutation = useMutation("events", {
    mutationFn: async (newEvent: any) => {
      const res = await axios.post<AddEventResponse>(
        "/api/addNewEvent",
        newEvent
      );
      if (res.data.error) {
        messageApi.open({
          type: "error",
          content: res.data.msg,
          className: "custom-class",
          duration: 8,
        });
      } else {
        queryClient.invalidateQueries(["events"]);
      }
    },
  });

  const { data, status } = useQuery<UpcomingEventData[]>(
    "events",
    fetchUpcomingEvents
  );

  const showModal = () => {
    setEventModalOpen(true);
  };

  const onVenueTypeChange = ({ target: { value } }: RadioChangeEvent) => {
    setVenueType(value);
  };

  const handleAddEvent = () => {
    mutation.mutate({
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
    setEventModalOpen(false);
  };

  const handleEventModalCancel = () => {
    setEventModalOpen(false);
  };

  const { Search } = Input;
  const onSearch = (value: string) => console.log(value);

  const dateCellRender = (value: Dayjs) => {
    let listData: any[] = [];
    if (data && data.length > 0) {
      data.forEach((d) => {
        let eStart = dayjs(d.startDateTime);
        let eEnd = dayjs(d.endDateTime);

        if (eStart.isSame(value, "date")) {
          listData.push({
            type: "warning",
            content: `${d.venueType} (Start: ${eStart.format("hh:mm a")})`,
            bookingId: d.bookingId,
          });
        } else if (!d.singleDayEvent && eEnd.isSame(value, "date")) {
          listData.push({
            type: "warning",
            content: `${d.venueType} (End: ${eEnd.format("hh:mm a")})`,
            bookingId: d.bookingId,
          });
        } else if (
          !d.singleDayEvent &&
          eEnd.isAfter(value) &&
          eStart.isBefore(value)
        ) {
          listData.push({
            type: "warning",
            content: `${d.venueType} (All day!)`,
          });
        }
      });
    }

    if (listData.length > 0) {
      return (
        <ul
          className={styles.events}
          style={{ height: "100%" }}
          onClick={() => {
            console.log(listData);
          }}
        >
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
  };

  const onDateSelect = (value: Dayjs) => {
    setSelectedValue(value);
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
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={showModal}
          style={{
            maxWidth: "240px",
            marginTop: "2em",
            marginBottom: "2em",
          }}
        >
          Add Event
        </Button>
        <Modal
          title="Event Info"
          open={eventModelOpen}
          onOk={handleAddEvent}
          onCancel={handleEventModalCancel}
        >
          <Search
            placeholder="Mobile No"
            allowClear
            enterButton="Find"
            size="large"
            onSearch={onSearch}
            onChange={(e) => setMobileNo(e.target.value)}
            style={{ marginTop: "2em" }}
          />
          <Input
            placeholder="Alternate Mobile No:"
            size="large"
            onChange={(e) => setAltMobileNo(e.target.value)}
            style={{ marginTop: "2em" }}
          />
          <Input
            placeholder="Name"
            size="large"
            style={{ marginTop: "2em" }}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Email Address"
            size="large"
            style={{ marginTop: "2em" }}
            onChange={(e) => setEmailAddress(e.target.value)}
          />
          <Input
            placeholder="Postal Address"
            size="large"
            style={{ marginTop: "2em" }}
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
            value={`${venueType}`}
            optionType="button"
            buttonStyle="solid"
          />
          <DatePicker.RangePicker
            size="large"
            showTime
            use12Hours
            format={"DD/MM/YY h:mm a"}
            showNow
            minuteStep={30}
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
        {status === "loading" ? (
          <Spin>
            <Calendar />
          </Spin>
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
              message={`Event Details for ${selectedValue?.format(
                "YYYY-MM-DD"
              )}`}
              description="Click to view more details about events booked for this day!"
              action={
                <Button size="large" type="primary">
                  VIEW
                </Button>
              }
            />
            <Calendar
              dateCellRender={dateCellRender}
              onSelect={onDateSelect}
              validRange={[
                dayjs().subtract(30, "days"),
                dayjs().add(2, "years"),
              ]}
              mode="month"
            />
          </div>
        )}
      </main>
      <footer className={styles.footer}>
        {/* <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a> */}
      </footer>
    </div>
  );
};

export default withAuthenticator(Home);
