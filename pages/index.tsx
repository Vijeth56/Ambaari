import Head from "next/head";
import React, { useState } from "react";
import styles from "../styles/Home.module.css";
import "antd/dist/antd.css";
import { PlusOutlined } from "@ant-design/icons";
import type { BadgeProps } from "antd";
import { RangeValue } from "rc-picker/lib/interface";
import type { Moment } from "moment";
import { DatePicker, Calendar, Button, Modal, Input, Spin, Badge } from "antd";
import { withAuthenticator } from "@aws-amplify/ui-react";

import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { UpcomingEventData } from "../lib/models/UpcomingEventData";
import moment from "moment";

const fetchUpcomingEvents = async () => {
  const res = await fetch("/api/getUpcomingEvents");
  return res.json();
};

const Home = ({ signOut, user }: { signOut: any; user: any }) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileNo, setMobileNo] = useState<string>();
  const [altMobileNo, setAltMobileNo] = useState<string>();
  const [name, setName] = useState<string>();
  const [emailAddress, setEmailAddress] = useState<string>();
  const [postalAddress, setPostalAddress] = useState<string>();
  const [eventType, setEventType] = useState<string>();
  const [dateTimeRange, setDateTimeRange] = useState<RangeValue<Moment>>();
  const [totalAmount, setTotalAmount] = useState<number>();

  const mutation = useMutation("events", {
    mutationFn: (newEvent: any) => {
      return axios.post("/api/addNewEvent", newEvent);
    },
    onSuccess: (_) => {
      queryClient.invalidateQueries(["events"]);
    },
  });

  const { data, status } = useQuery<UpcomingEventData[]>(
    "events",
    fetchUpcomingEvents
  );

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    mutation.mutateAsync({
      name,
      mobileNo,
      altMobileNo,
      emailAddress,
      postalAddress,
      eventType,
      dateTimeRange,
      totalAmount
    });
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const { Search } = Input;
  const onSearch = (value: string) => console.log(value);

  const dateCellRender = (value: Moment) => {
    let listData: any[] = [];
    if (data && data.length > 0) {
      data.forEach((d) => {
        let eStart = moment(d.startDateTime);
        let eEnd = moment(d.endDateTime);

        if (eStart.isSame(value, "date")) {
          listData = [
            {
              type: "warning",
              content: `Booking for ${d.name} (Starts: ${eStart.format(
                "hh:mm a"
              )})`,
            },
          ];
        } else if (!d.singleDayEvent && eEnd.isSame(value, "date")) {
          listData = [
            {
              type: "warning",
              content: `Booking for ${d.name} (Ends: ${eEnd.format(
                "hh:mm a"
              )})`,
            },
          ];
        } else if (
          !d.singleDayEvent &&
          eEnd.isAfter(value) &&
          eStart.isBefore(value)
        ) {
          listData = [
            {
              type: "warning",
              content: `Booking for ${d.name}(All day!)`,
            },
          ];
        }
      });
    }

    return (
      <ul className={styles.events}>
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
            alignSelf: "flex-center",
            marginTop: "2em",
            marginBottom: "2em",
          }}
        >
          Add Event
        </Button>
        <Modal
          title="Event Info"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
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
          <Calendar dateCellRender={dateCellRender} />
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
