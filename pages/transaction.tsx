import { useRouter } from "next/router";

import { useState } from "react";
import { AddEventNoteResponse } from "../lib/models/AddEventNoteResponse";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "react-query";

import { Button, Form, Input, Select, Table, InputNumber, message } from "antd";
import { SaveTransactionResponse } from "../lib/models/SaveTransactionResponse";
const { TextArea } = Input;

const { Option } = Select;

const fetchEventTransactions = async (eventId: string) => {
  try {
    if (eventId) {
      let id = Number.parseInt(eventId);
      const res = await fetch(`/api/getEventTransactionsById`, {
        method: "post",
        body: JSON.stringify({ id }),
      });
      console.log(res);
      let jsonResult = await res.json();
      if (Array.isArray(jsonResult)) {
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

const Transaction = ({ eventAmount = 0 }: any) => {
  const router = useRouter();
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const eventId: string = router.query.id as string;
  const [totalOutstandingAmount, setTotalOutstandingAmount] = useState([
    {
      key: 1,
      eventAmount: eventAmount,
      totalPaidAmount: 0,
      totalPendingAmount: 0,
    },
  ]);

  const columns = [
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
    },
    {
      title: "Type",
      dataIndex: "paymentType",
      key: "paymentType",
    },
    {
      title: "Amount Paid",
      dataIndex: "amount",
      key: "amount",
    },
  ];

  const amountColumns = [
    {
      title: "Event Amount",
      dataIndex: "eventAmount",
      key: "eventAmount",
    },
    {
      title: "Amount Paid",
      dataIndex: "totalPaidAmount",
      key: "totalPaidAmount",
    },
    {
      title: "Pending Amount",
      dataIndex: "totalPendingAmount",
      key: "totalPendingAmount",
    },
  ];

  const { data: transactions, isLoading } = useQuery<any>(
    ["transactions", eventId],
    () => fetchEventTransactions(eventId),
    {
      onSuccess(transactions) {
        let totalPaidAmount = 0;
        let totalPendingAmount = 0;
        if (transactions && transactions.length > 0) {
          transactions = transactions.map((transaction: any, index: any) => {
            transaction.key = index;
            totalPaidAmount += transaction.amount;
            return transaction;
          });
        }

        totalPendingAmount = eventAmount - totalPaidAmount;
        setTotalOutstandingAmount([
          {
            key: 1,
            eventAmount: eventAmount,
            totalPaidAmount: totalPaidAmount,
            totalPendingAmount: totalPendingAmount,
          },
        ]);
      },
    }
  );

  const saveTransactionMutation = useMutation("events", {
    mutationFn: async (transaction: any) => {
      const res = await axios.post<SaveTransactionResponse>(
        "/api/saveTransaction",
        transaction
      );
      if (res.data.error) {
        messageApi.open({
          type: "error",
          content: res.data.msg,
          duration: 8,
        });
      } else {
        queryClient.invalidateQueries("transactions");
      }
    },
  });

  const onFinish = (values: any) => {
    saveTransactionMutation.mutate({
      eventId: eventId,
      message: values.message,
      amount: values.amount,
      paymentType: values.paymentType,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Table
        columns={amountColumns}
        dataSource={totalOutstandingAmount}
        pagination={{ hideOnSinglePage: true }}
        style={{ marginBottom: "25px" }}
      ></Table>
      <Form
        name="basic"
        layout="vertical"
        onFinish={onFinish}
        style={{ marginBottom: "25px" }}
      >
        <Form.Item label="Message" name="message">
          <TextArea rows={3} />
        </Form.Item>
        <Form.Item label="Payment Type" name="paymentType">
          <Select>
            <Option value="cash">Cash</Option>
            <Option value="online">Online</Option>
            <Option value="upi">UPI</Option>
            <Option value="creditcard">Credit Card</Option>
            <Option value="others">others</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Amount" name="amount">
          <InputNumber />
        </Form.Item>
        <Form.Item label="" colon={false}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
      <Table columns={columns} dataSource={transactions} />
    </div>
  );
};

export default Transaction;
