import { Button, message } from "antd";
import { Select } from "antd";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { Card, Col, Row } from "antd";
import { useQuery } from "react-query";
import moment from "moment";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: false,
  maintainAspectRatio: false,
};

const labels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const fetchEventTransactions = async (
  startDate: String,
  endDate: String,
  venueType: String
) => {
  try {
    const res = await fetch(`/api/getEventsTransactions`, {
      method: "post",
      body: JSON.stringify({ startDate, endDate, venueType }),
    });
    let jsonResult = await res.json();
    if (jsonResult && Array.isArray(jsonResult)) {
      return jsonResult;
    } else return [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

const barChart = {
  labels: [],
  datasets: [
    {
      label: "Total Events",
      data: [],
      borderColor: "rgb(157, 99, 132)",
      backgroundColor: "rgba(157, 99, 132, 0.5)",
    },
  ],
};

const lineChart = {
  labels: [],
  datasets: [
    {
      label: "Amount Paid",
      data: [],
      borderColor: "rgb(99, 99, 132)",
      backgroundColor: "rgba(99, 99, 132, 0.5)",
    },
  ],
};
const Dashboard = ({ signOut, user }: { signOut: any; user: any }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const [startDate, setStartDate] = useState(
    moment([moment().year(), 0]).format("YYYY-MM-DD HH:mm:ss")
  );

  const [endDate, setEndDate] = useState(
    moment(startDate).endOf("month").format("YYYY-MM-DD HH:mm:ss")
  );

  const [venueType, setVenueType] = useState("Hall");
  const [eventsMetrics, setEventsMetrics] = useState({
    totalEvents: 0,
    totalFee: 0,
    totalAmountPaid: 0,
    totalAmountPending: 0,
  });

  const [barChart1Data, setBarchart1Data] = useState(barChart);
  const [barChart2Data, setBarchart2Data] = useState(lineChart);

  const onSelectMonth = (month: string) => {
    const startDate = moment([moment().year(), labels.indexOf(month)]).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    const endDate = moment(startDate)
      .endOf("month")
      .format("YYYY-MM-DD HH:mm:ss");
    setStartDate(startDate);
    setEndDate(endDate);
  };

  const onVenueSelect = (event: string) => {
    setVenueType(event);
  };

  const setBarchart1 = (eventsByDate) => {
    let labels = Object.keys(eventsByDate);
    let values = labels.map((date) => {
      return eventsByDate[date];
    });
    barChart1Data["labels"] = labels;
    barChart1Data["datasets"][0]["data"] = values;
    setBarchart1Data(barChart1Data);
  };

  const setBarchart2 = (amountByDate) => {
    let labels = Object.keys(amountByDate);
    let values = labels.map((date) => {
      return amountByDate[date];
    });
    barChart2Data["labels"] = labels;
    barChart2Data["datasets"][0]["data"] = values;
    setBarchart2Data(barChart2Data);
  };

  const { data: eventsTransactions, isLoading } = useQuery<any>(
    ["events_transactions", startDate, endDate, venueType],
    () => fetchEventTransactions(startDate, endDate, venueType),
    {
      onSuccess(eventsTransactions) {
        let eventList = [];
        let totalAmountPaid = 0;
        let totalFee = 0;
        console.log(eventsTransactions);
        let eventsByDate = {};
        let amountByDate = {};

        eventsTransactions.map((eventTransaction) => {
          if (!eventList.includes(eventTransaction.eventBookingId)) {
            eventList.push(eventTransaction.eventBookingId);
            totalFee += eventTransaction.totalFee;
            console.log(eventList);
          }
          let eventDate = moment(eventTransaction["eventStart"]).format(
            "YYYY-MM-DD"
          );

          if (!(eventDate in eventsByDate)) {
            eventsByDate[eventDate] = 0;
            eventsByDate[eventDate] += 1;
          } else {
            eventsByDate[eventDate] += 1;
          }

          if (!(eventDate in amountByDate)) {
            amountByDate[eventDate] = 0;
            amountByDate[eventDate] += eventTransaction.totalAmount;
          } else {
            amountByDate[eventDate] += eventTransaction.totalAmount;
          }

          totalAmountPaid += eventTransaction.totalAmount;
        });
        let totalPending = totalFee - totalAmountPaid;
        setBarchart1(eventsByDate);
        setBarchart2(amountByDate);
        setEventsMetrics({
          totalEvents: eventList.length,
          totalFee: totalFee,
          totalAmountPaid: totalAmountPaid,
          totalAmountPending: totalPending,
        });
      },
    }
  );
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
      <main className={styles.dashboard}>
        <Button
          type="primary"
          danger
          onClick={signOut}
          style={{ alignSelf: "flex-end", marginBottom: "2em" }}
        >
          Sign Out
        </Button>
        <h4 className={styles.title}>Ambaari Web Portal</h4>
        <div
          style={{
            margin: "2em",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Row gutter={96} wrap={false}>
            <Col md={8} lg={8}>
              <Select
                defaultValue="January"
                style={{ width: 120 }}
                options={labels.map((_label) => {
                  return { value: _label, label: _label };
                })}
                onSelect={onSelectMonth}
              />
            </Col>
            <Col md={8} lg={8}>
              <Select
                defaultValue="hall"
                style={{ width: 150 }}
                options={[
                  { value: "Hall", label: "Hall" },
                  { value: "Garden", label: "Garden" },
                  { value: "H & G", label: "Hall+Garden" },
                ]}
                onSelect={onVenueSelect}
              />
            </Col>
          </Row>
        </div>
        <div className="site-card-wrapper">
          <Row wrap={false}>
            <Col md={8} lg={8}>
              <Card title="Total Events" bordered={false}>
                <b>{eventsMetrics.totalEvents}</b>
              </Card>
            </Col>
            <Col md={8} lg={8}>
              <Card title="Total Amount Paid" bordered={false}>
                <b>{eventsMetrics.totalAmountPaid}</b>
              </Card>
            </Col>
            <Col md={8} lg={8}>
              <Card title="Total Amount Pending" bordered={false}>
                <b>{eventsMetrics.totalAmountPending}</b>
              </Card>
            </Col>
          </Row>
        </div>
        <div>
          <Row>
            <Col md={24} lg={12}>
              <Bar
                options={options}
                data={barChart1Data}
                height={400}
                width={700}
                redraw={true}
                style={{ marginRight: "40px" }}
              />
            </Col>
            <Col md={24} lg={12}>
              <Bar
                options={options}
                data={barChart2Data}
                height={400}
                width={700}
                redraw={true}
              />
            </Col>
          </Row>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
