import { Button, message } from "antd";
import { Select } from "antd";
import Head from "next/head";
import styles from "../styles/Dashboard.module.css";
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
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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

const fetchEventTransactions = async (startDate: String, endDate: String) => {
  try {
    const res = await fetch(`/api/getEventsTransactions`, {
      method: "post",
      body: JSON.stringify({ startDate, endDate }),
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

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
};
const barChart1Options = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    y: {
      min: 0,
      max: 10,
      title: {
        display: true,
        text: "Events",
      },
    },
    x: {
      title: {
        display: true,
        text: "Days",
      },
    },
  },
};

const barChart2Options = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    y: {
      min: 0,
      max: 1000000,
      stepSize: 100000,
      title: {
        display: true,
        text: "Amount",
      },
    },
    x: {
      title: {
        display: true,
        text: "Payments",
      },
    },
  },
};

const barChart1 = {
  labels: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
  datasets: [
    {
      label: "Total Events",
      data: [],
      borderColor: "rgb(157, 99, 132)",
      backgroundColor: "rgba(157, 99, 132, 0.5)",
    },
  ],
};

const barChart2 = {
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

const pieChart = {
  labels: ["Hall", "Garden", "Hall+Garden"],
  datasets: [
    {
      label: "No of events",
      data: [],
      backgroundColor: [
        "rgba(255, 99, 132, 0.2)",
        "rgba(54, 162, 235, 0.2)",
        "rgba(255, 206, 86, 0.2)",
      ],
      borderColor: [
        "rgba(255, 99, 132, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 206, 86, 1)",
      ],
      borderWidth: 1,
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

  const [barChart1Data, setBarchart1Data] = useState(barChart1);
  const [barChart2Data, setBarchart2Data] = useState(barChart2);
  const [pieChartData, setPieChartData] = useState(pieChart);

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

  const setBarchart1 = (eventsByDate: any) => {
    let labels = Object.keys(eventsByDate);
    let values = labels.map((date) => {
      return eventsByDate[date];
    });
    barChart1Data["labels"] = labels;
    barChart1Data["datasets"][0]["data"] = values;
    setBarchart1Data(barChart1Data);
  };

  const setBarchart2 = (amountByPaymentMode: any) => {
    let labels = Object.keys(amountByPaymentMode);
    let values = labels.map((paymentType) => {
      return amountByPaymentMode[paymentType];
    });
    barChart2Data["labels"] = labels;
    barChart2Data["datasets"][0]["data"] = values;
    setBarchart2Data(barChart2Data);
  };

  const setPieChart = (eventsByVenueType: any) => {
    let labels = Object.keys(eventsByVenueType);
    let values = labels.map((venueType) => {
      return eventsByVenueType[venueType];
    });
    pieChartData["labels"] = labels;
    pieChartData["datasets"][0]["data"] = values;
    setPieChartData(pieChartData);
  };

  const buildAmountByPaymentModes = (
    amountByPaymentMode: any,
    eventTransaction: any
  ) => {
    if (
      eventTransaction.paymentType &&
      !(eventTransaction.paymentType in amountByPaymentMode)
    ) {
      amountByPaymentMode[eventTransaction.paymentType] = 0;
      amountByPaymentMode[eventTransaction.paymentType] +=
        eventTransaction.totalAmount;
    } else {
      amountByPaymentMode[eventTransaction.paymentType] +=
        eventTransaction.totalAmount;
    }

    return amountByPaymentMode;
  };

  const buildEventsByDays = (eventsByDay: any, eventTransaction: any) => {
    let eventDay = moment(eventTransaction["eventStart"]).format("dddd");
    if (!(eventDay in eventsByDay)) {
      eventsByDay[eventDay] = 0;
      eventsByDay[eventDay] += 1;
    } else {
      eventsByDay[eventDay] += 1;
    }
    return eventsByDay;
  };

  const buildEventsByVenueType = (
    eventsByVenueType: any,
    eventTransaction: any
  ) => {
    let venueType = eventTransaction.venueType;
    if (venueType && !(venueType in eventsByVenueType)) {
      eventsByVenueType[venueType] = 0;
      eventsByVenueType[venueType] += 1;
    } else {
      eventsByVenueType[venueType] += 1;
    }
    return eventsByVenueType;
  };

  const { data: eventsTransactions, isLoading } = useQuery<any>(
    ["events_transactions", startDate, endDate],
    () => fetchEventTransactions(startDate, endDate),
    {
      onSuccess(eventsTransactions) {
        let eventList: Array<String> = [];
        let totalAmountPaid = 0;
        let totalFee = 0;
        let eventsByDay: any = {};
        let amountByPaymentMode: any = {};
        let eventsByVenueType: any = {};
        eventsTransactions.map((eventTransaction: any) => {
          if (!eventList.includes(eventTransaction.eventBookingId)) {
            eventList.push(eventTransaction.eventBookingId);
            totalFee += eventTransaction.totalFee;
            eventsByDay = buildEventsByDays(eventsByDay, eventTransaction);
            eventsByVenueType = buildEventsByVenueType(
              eventsByVenueType,
              eventTransaction
            );
          }

          if (eventTransaction.paymentType)
            amountByPaymentMode = buildAmountByPaymentModes(
              amountByPaymentMode,
              eventTransaction
            );
          totalAmountPaid += eventTransaction.totalAmount;
        });

        let totalPending = totalFee - totalAmountPaid;

        setBarchart1(eventsByDay);
        setBarchart2(amountByPaymentMode);
        setPieChart(eventsByVenueType);
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
            {/* <Col md={8} lg={8}>
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
            </Col> */}
          </Row>
        </div>
        <div>
          <Row>
            <Col span={8}>
              <Card size="small" title="# Events" bordered={false}>
                <b>{eventsMetrics.totalEvents}</b>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="₹ Paid" bordered={false}>
                <b>{eventsMetrics.totalAmountPaid}</b>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="₹ Pending" bordered={false}>
                <b>{eventsMetrics.totalAmountPending}</b>
              </Card>
            </Col>
          </Row>
          <Row style={{ justifyContent: "center" }}>
            <Col sm={24} md={12} lg={12} style={{ marginTop: "48px" }}>
              {pieChartData.datasets[0].data.length > 0 ? (
                <Pie
                  options={pieChartOptions}
                  data={pieChartData}
                  height={150}
                  redraw={true}
                />
              ) : (
                ""
              )}
            </Col>
            <Col
              sm={24}
              md={12}
              lg={12}
              style={{
                marginTop: "48px",
              }}
            >
              <Bar
                options={barChart1Options}
                data={barChart1Data}
                height={300}
                redraw={true}
              />
            </Col>
            <Col sm={24} md={24} lg={12} style={{ marginTop: "48px" }}>
              <Bar
                options={barChart2Options}
                data={barChart2Data}
                height={150}
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
