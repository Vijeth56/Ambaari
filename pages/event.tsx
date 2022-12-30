import { useRouter } from "next/router";
import { useState } from "react";
import Head from "next/head";
import axios from "axios";

import {
  Button,
  message,
  Spin,
  Tabs,
  Descriptions,
  Row,
  Col,
  Space,
  Alert,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { useQuery } from "react-query";

import { DeleteEventResponse } from "../lib/models/DeleteEventResponse";
import styles from "../styles/Event.module.css";

const fetchEventDetail = async (eventId: string) => {
  try {
    if (eventId) {
      let id = Number.parseInt(eventId);
      const res = await fetch(`/api/getEventDetail`, {
        method: "post",
        body: JSON.stringify({ id }),
      });
      let jsonResult = await res.json();
      if (jsonResult && jsonResult.length > 0) {
        return jsonResult[0];
      } else {
        return {};
      }
    }
    console.log("Event Id does not exist!");
    return {};
  } catch (error) {
    console.log(error);
    return {};
  }
};

const Event = ({ signOut, user }: { signOut: any; user: any }) => {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const eventId: string = router.query.id as string;
  const { data, isLoading } = useQuery<any>(["event_detail", eventId], () =>
    fetchEventDetail(eventId)
  );

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
                    style={{ display: "flex", justifyContent: "space-around" }}
                  >
                    <Row>
                      <Col style={{ marginTop: "12px", marginBottom: "12px" }}>
                        <Descriptions
                          title="Guest Info"
                          bordered
                          style={{ marginRight: "32px" }}
                          column={1}
                          extra={<Button type="primary">Edit</Button>}
                        >
                          <Descriptions.Item label="Name">
                            {data.name}
                          </Descriptions.Item>
                          <Descriptions.Item label="Mobile">
                            {data.mobile_no}
                          </Descriptions.Item>
                          <Descriptions.Item label="Alt-Mobile">
                            {data.alt_mobile_no}
                          </Descriptions.Item>
                          <Descriptions.Item label="Email">
                            {data.email}
                          </Descriptions.Item>
                          <Descriptions.Item label="Address">
                            {data.postal_address}
                          </Descriptions.Item>
                        </Descriptions>
                      </Col>
                      <Col style={{ marginTop: "12px", marginBottom: "12px" }}>
                        <Descriptions
                          title="Event Info"
                          bordered
                          column={1}
                          extra={<Button type="primary">Edit</Button>}
                        >
                          <Descriptions.Item label="Name">
                            {data.name}
                          </Descriptions.Item>
                          <Descriptions.Item label="Mobile">
                            {data.mobile_no}
                          </Descriptions.Item>
                          <Descriptions.Item label="Alt-Mobile">
                            {data.alt_mobile_no}
                          </Descriptions.Item>
                          <Descriptions.Item label="Email">
                            {data.email}
                          </Descriptions.Item>
                          <Descriptions.Item label="Address" span={2}>
                            {data.postal_address}
                          </Descriptions.Item>
                        </Descriptions>
                      </Col>
                    </Row>
                  </div>
                ),
              },
              {
                label: `Room`,
                key: "2",
                children: `Content of Tab Pane 2`,
              },
              {
                label: `Transactions`,
                key: "3",
                children: `Content of Tab Pane 3`,
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
