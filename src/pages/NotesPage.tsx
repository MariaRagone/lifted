// src/pages/NotesPage.tsx

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../library/firebase';
import { format, parseISO } from 'date-fns';
import { onAuthStateChanged } from 'firebase/auth';
import './Notes.css';

interface Note {
  id: string;
  date: string;
  text: string;
}

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!currentUser) return;
      const notesRef = collection(db, 'userNotes', currentUser.uid, 'days');
      const querySnapshot = await getDocs(notesRef);
      const notesArray: Note[] = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          date: docSnap.id,
          text: data.text,
        };
      });
      setNotes(notesArray);
    };

    fetchNotes();
  }, [currentUser]);

  return (
    <div className="notes-container">
      <h2>My Notes</h2>
      <div className="notes-grid">
        {notes.map((note) => (
          <div className="sticky-note" key={note.id}>
            <div className="note-date">{format(parseISO(note.date), 'MMMM d')}</div>
            <div className="note-text">{note.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesPage;
