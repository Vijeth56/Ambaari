import { useMutation, useQueryClient } from "react-query";

import { useState } from "react";
import { AddEventNoteResponse } from "../lib/models/AddEventNoteResponse";
import axios from "axios";

import { Button, Input, Table } from "antd";

const Note = ({ eventId, notes, updateNotesArray, deleteNote }: any) => {
  const columns = [
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
    },
    {
      title: "Action",
      dataIndex: "",
      key: "x",
      render: (_: any, note: any) => (
        <a
          onClick={() => {
            deleteNote(note);
          }}
        >
          Delete
        </a>
      ),
    },
  ];

  if (notes && notes.length > 0) {
    notes = notes.map((note: any, index: any) => {
      note.key = index;

      return note;
    });
  } else notes = [];

  const queryClient = useQueryClient();

  const [note, setNote] = useState("");

  const submitNote = (e: any) => {
    addNoteMutation.mutate({
      eventId: eventId,
      note: note,
    });
  };

  const setNoteValue = (e: any) => {
    setNote(e.target.value);
  };

  const addNoteMutation = useMutation("notes", {
    mutationFn: async (newNote: any) => {
      const res = await axios.post<AddEventNoteResponse>(
        "/api/addEventNote",
        newNote
      );
      if (res.data.error) {
        console.log(res.data.error);
      } else {
        queryClient.invalidateQueries("notes");
      }
      return res;
    },
    onSuccess: (data) => {
      let savedNote = data.data;
      updateNotesArray({
        noteId: savedNote.noteId,
        note: savedNote.note,
        eventId: savedNote.eventId,
      });
    },
  });

  return (
    <div>
      <label style={{ fontSize: "20px" }}>Notes</label>
      <Input.Group compact>
        <Input
          style={{ marginBottom: "12px" }}
          onChange={setNoteValue}
          defaultValue={note}
        />
        <Button onClick={submitNote} style={{ float: "right" }} type="primary">
          Add Note
        </Button>
      </Input.Group>
      <Table columns={columns} dataSource={notes} />
    </div>
  );
};

export default Note;
